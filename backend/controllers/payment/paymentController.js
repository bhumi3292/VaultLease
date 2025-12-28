require('dotenv').config();
const Payment = require('../../models/payment');
const AccessRequest = require('../../models/AccessRequest');
const Asset = require('../../models/Asset');
const logAction = require('../../utils/auditLogger');
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
    const message = `total_amount=${data.amount},transaction_uuid=${data.source_payment_id},product_code=${ESEWA_MERCHANT_CODE}`;
    const hmac = crypto.createHmac('sha256', ESEWA_SECRET_KEY);
    hmac.update(message);
    return hmac.digest('base64');
};

const initiatePayment = async (req, res) => {
    const { user, asset, accessRequest, source, amount } = req.body;

    if (!user || !asset || !accessRequest || !source || !amount) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const payment = new Payment({
            user,
            asset,
            accessRequest,
            source,
            amount,
            status: 'pending',
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

        if (khaltiResponse.data.state.name === 'Completed') { // Corrected check based on std Khalti response
            payment.status = 'completed';
            payment.verification_data = khaltiData;
            payment.source_payment_id = idx;
            await payment.save();

            // Update AccessRequest
            await AccessRequest.findByIdAndUpdate(payment.accessRequest, {
                paymentStatus: 'Paid',
                $inc: { totalAmountPaid: payment.amount / 100 } // Khalti is in paisa usually
            });

            // Log
            await logAction({
                userId: payment.user,
                action: 'PAYMENT',
                entity: 'AccessRequest',
                entityId: payment.accessRequest,
                details: { amount: payment.amount, source: 'Khalti', transactionId: idx }
            });

            res.status(200).json({ message: 'Khalti payment verified', payment });
        } else {
            // ... handling failure
            payment.status = 'failed';
            payment.verification_data = khaltiData;
            await payment.save();
            res.status(400).json({ message: 'Khalti payment verification failed', payment });
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


        if (esewaData.status === 'COMPLETE' && esewaData.transaction_uuid === oid) {
            payment.status = 'completed';
            payment.verification_data = esewaData;
            payment.source_payment_id = oid;
            await payment.save();

            // Update AccessRequest
            await AccessRequest.findByIdAndUpdate(payment.accessRequest, {
                paymentStatus: 'Paid',
                $inc: { totalAmountPaid: payment.amount } // eSewa usually matches amount
            });

            // Log
            await logAction({
                userId: payment.user,
                action: 'PAYMENT',
                entity: 'AccessRequest',
                entityId: payment.accessRequest,
                details: { amount: payment.amount, source: 'eSewa', transactionId: oid }
            });

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

module.exports = {
    initiatePayment,
    verifyKhaltiPayment,
    verifyEsewaPayment,
};