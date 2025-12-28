// src/hooks/useKhaltiPayment.js
import { useState, useCallback } from 'react';
import KhaltiCheckout from 'Khalti-Checkout-web';
import { toast } from 'react-toastify';
import axios from 'axios'; // Import axios for the verification call
import { VITE_KHALTI_PUBLIC_KEY, VITE_KHALTI_SECRET_KEY } from '../../utils/env';
export const useKhaltiPayment = (productId, productName, amount) => {
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentError, setPaymentError] = useState(null);

    const KHALTI_PUBLIC_KEY = VITE_KHALTI_PUBLIC_KEY;
    const KHALTI_SECRET_KEY = VITE_KHALTI_SECRET_KEY;

    const initiateKhaltiPayment = useCallback(() => {
        if (!amount || amount <= 0) {
            toast.error('Invalid payment amount.');
            return;
        }

        setIsProcessingPayment(true);
        setPaymentSuccess(false);
        setPaymentError(null);

        const checkout = new KhaltiCheckout({
            publicKey: KHALTI_PUBLIC_KEY,
            productIdentity: productId,
            productName: productName,
            productUrl: window.location.origin, // Use current origin for product URL
            eventHandler: {
                onSuccess(payload) {
                    console.log('Khalti Success Payload:', payload);
                    const data = {
                        token: payload.token,
                        amount: payload.amount, // Payload amount is in paisa
                    };

                    const config = {
                        headers: {
                            Authorization: `Secret ${KHALTI_SECRET_KEY}`, // Using 'Secret' for test keys
                            'Content-Type': 'application/json', // Ensure content type is set
                        },
                    };

                    // THIS VERIFICATION SHOULD BE MOVED TO YOUR BACKEND SERVER!
                    // Sending secret key from frontend is a security risk.
                    axios.post("https://khalti.com/api/v2/payment/verify/", data, config)
                        .then((response) => {
                            console.log('Khalti Verification Response:', response.data);
                            if (response.data.status === 'Complete') {
                                toast.success('Payment successful!');
                                setPaymentSuccess(true);
                            } else {
                                toast.error('Payment verification failed.');
                                setPaymentError('Verification failed');
                            }
                        })
                        .catch((error) => {
                            console.error('Khalti Verification Error:', error.response?.data || error.message);
                            toast.error('Payment verification failed. Please try again.');
                            setPaymentError(error.response?.data || error.message);
                        })
                        .finally(() => {
                            setIsProcessingPayment(false);
                        });
                },
                onError(error) {
                    console.error('Khalti Error:', error);
                    toast.error('Payment failed. ' + (error?.detail || 'Please try again.'));
                    setPaymentError(error);
                    setIsProcessingPayment(false);
                },
                onClose() {
                    console.log("Khalti widget closed.");
                    setIsProcessingPayment(false);
                },
            },
            paymentPreference: ["KHALTI", "EBANKING", "MOBILE_BANKING", "CONNECT_IPS", "SCT"],
        });

        checkout.show({ amount: amount * 100 }); // Khalti amount is in paisa
    }, [productId, productName, amount, KHALTI_PUBLIC_KEY, KHALTI_SECRET_KEY]);

    return { initiateKhaltiPayment, isProcessingPayment, paymentSuccess, paymentError };
};