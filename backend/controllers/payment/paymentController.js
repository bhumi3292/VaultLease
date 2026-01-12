require('dotenv').config();
const Payment = require('../../models/payment'); // Adjust path as needed
const axios = require('axios');
const crypto = require('crypto');

// Get secret keys from environment variables
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY;
const ESEWA_MERCHANT_CODE = process.env.ESEWA_MERCHANT_CODE;
const KHALTI_VERIFY_URL = process.env.KHALTI_VERIFY_URL;
const ESEWA_VERIFY_URL = process.env.ESEWA_VERIFY_URL;

// Helper to generate eSewa signature
const generateEsewaSignature = (data) => {
    const message = `total_amount=${data.amount},transaction_uuid=${data.source_payment_id},product_code=${ESEWA_MERCHANT_CODE}`; // Adjust fields as per eSewa documentation if needed
    const hmac = crypto.createHmac('sha256', ESEWA_SECRET_KEY);
    hmac.update(message);
    return hmac.digest('base64');
};

const initiatePayment = async (req, res) => {
    const { user, property, source, amount } = req.body;

    if (!user || !property || !source || !amount) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const payment = new Payment({
            user,
            property,
            source,
            amount,
            status: 'pending', // Initial status
            // source_payment_id will be added after actual payment initiation and before verification
        });

        const createdPayment = await payment.save();
        res.status(201).json(createdPayment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during payment initiation' });
    }
};

const verifyKhaltiPayment = async (req, res) => {
    const { token, amount, idx, pidx, status, transaction_id, purchase_order_id } = req.body;

    // Check if essential verification data is present
    if (!token || !amount || !idx) {
        return res.status(400).json({ message: 'Missing Khalti verification data (token, amount, or idx)' });
    }

    try {

        const payment = await Payment.findOne({ source_payment_id: idx, source: 'khalti' }); // Or use purchase_order_id if you mapped it
        if (!payment) {
            console.warn(`Khalti callback: Payment record not found for idx: ${idx}`);
            return res.status(404).json({ message: 'Payment record not found.' });
        }

        // Khalti server-to-server verification
        const khaltiResponse = await axios.post(
            KHALTI_VERIFY_URL,
            {
                token: token,
                amount: amount, // Khalti expects amount in paisa, ensure consistency
            },
            {
                headers: {
                    'Authorization': `Key ${KHALTI_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const khaltiData = khaltiResponse.data;
        console.log('Khalti Verification Response:', khaltiData);

        if (khaltiData.status === 'Completed' && khaltiData.transaction_id) {
            payment.status = 'completed';
            payment.verification_data = khaltiData;
            payment.source_payment_id = idx; // Ensure source_payment_id is set
            await payment.save();
            res.status(200).json({ message: 'Khalti payment verified and completed', payment });
        } else if (khaltiData.status === 'Failed' || khaltiData.status === 'Error') {
            payment.status = 'failed';
            payment.verification_data = khaltiData;
            await payment.save();
            res.status(400).json({ message: 'Khalti payment verification failed', payment });
        } else {
            // Handle other Khalti statuses like 'Pending', 'Initiated', 'Refunded'
            payment.status = 'pending'; // Or other appropriate status
            payment.verification_data = khaltiData;
            await payment.save();
            res.status(202).json({ message: `Khalti payment status: ${khaltiData.status}`, payment });
        }

    } catch (error) {
        console.error('Error verifying Khalti payment:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Server error during Khalti payment verification', error: error.response ? error.response.data : error.message });
    }
};

const verifyEsewaPayment = async (req, res) => {

    const { oid, amt, refId } = req.body; // Or req.query, depending on eSewa's callback method

    if (!oid || !amt || !refId) {
        return res.status(400).json({ message: 'Missing eSewa verification data' });
    }

    try {
        const payment = await Payment.findOne({ source_payment_id: oid, source: 'esewa' });
        if (!payment) {
            console.warn(`eSewa callback: Payment record not found for oid: ${oid}`);
            return res.status(404).json({ message: 'Payment record not found.' });
        }

        // Ensure the amount matches
        if (payment.amount !== parseFloat(amt)) { // Convert amt to number if it comes as string
            payment.status = 'failed';
            payment.verification_data = {
                message: 'Amount mismatch',
                received_amount: parseFloat(amt),
                expected_amount: payment.amount,
                esewa_ref_id: refId
            };
            await payment.save();
            return res.status(400).json({ message: 'Amount mismatch during eSewa verification', payment });
        }

        // eSewa server-to-server verification (using the status check API)
        const esewaResponse = await axios.post(
            ESEWA_VERIFY_URL,
            {
                amt: amt,
                rid: refId, // eSewa reference ID
                pid: oid, // Your product/order ID
                scd: ESEWA_MERCHANT_CODE, // Your merchant code
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        const esewaData = esewaResponse.data;
        console.log('eSewa Verification Response:', esewaData);


        if (esewaData.status === 'COMPLETE' && esewaData.transaction_uuid === oid) { // Adjust conditions based on actual eSewa response
            payment.status = 'completed';
            payment.verification_data = esewaData;
            payment.source_payment_id = oid; // Ensure source_payment_id is set
            await payment.save();
            res.status(200).json({ message: 'eSewa payment verified and completed', payment });
        } else {
            payment.status = 'failed';
            payment.verification_data = esewaData;
            await payment.save();
            res.status(400).json({ message: 'eSewa payment verification failed or is not complete', payment });
        }

    } catch (error) {
        console.error('Error verifying eSewa payment:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Server error during eSewa payment verification', error: error.response ? error.response.data : error.message });
    }
};

// --- ADMIN FUNCTIONS ---

// Get All Payments
const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('user', 'fullName email')
            .populate('property', 'title price')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, payments });
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ message: 'Server error fetching payments' });
    }
};

// Update Payment Status (Refund / Manual Correction)
const updatePaymentStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // e.g., 'refunded', 'completed'

    try {
        const payment = await Payment.findById(id);
        if (!payment) {
            return res.status(404).json({ message: 'Payment record not found' });
        }

        payment.status = status;
        await payment.save();

        res.status(200).json({ success: true, message: `Payment status updated to ${status}`, payment });
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({ message: 'Server error updating payment status' });
    }
};

module.exports = {
    initiatePayment,
    verifyKhaltiPayment,
    verifyEsewaPayment,
    getAllPayments,
    updatePaymentStatus
};