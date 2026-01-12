// src/hooks/payment/useKhaltiPayment.js
import { useState, useCallback } from 'react';
import KhaltiCheckout from 'Khalti-Checkout-web';
import { toast } from 'react-toastify';
import api from '../../api/api'; // Use centralized api instance
import { VITE_KHALTI_PUBLIC_KEY } from '../../utils/env';

export const useKhaltiPayment = (productId, productName, amount) => {
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentError, setPaymentError] = useState(null);

    const KHALTI_PUBLIC_KEY = VITE_KHALTI_PUBLIC_KEY;

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
            productUrl: window.location.origin,
            eventHandler: {
                onSuccess(payload) {
                    console.log('Khalti Success Payload:', payload);

                    // Prepare data for backend verification
                    // Backend expects: token, amount, idx
                    const data = {
                        token: payload.token,
                        amount: payload.amount,
                        idx: payload.idx,
                        mobile: payload.mobile,
                        product_identity: payload.product_identity,
                        product_name: payload.product_name,
                        product_url: payload.product_url
                    };

                    setIsProcessingPayment(true); // Keep loading state on

                    // Call Backend to Verify
                    api.post("/api/payments/verify/khalti", data)
                        .then((response) => {
                            console.log('Backend Verification Response:', response.data);
                            toast.success('Payment successful and verified!');
                            setPaymentSuccess(true);
                        })
                        .catch((error) => {
                            console.error('Backend Verification Error:', error.response?.data || error.message);
                            toast.error(error.response?.data?.message || 'Payment verification failed.');
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
                    // Only turn off processing if we didn't succeed (success handles its own flow)
                    // But here we rely on the modal or success state to close/redirect
                    if (!paymentSuccess) {
                        setIsProcessingPayment(false);
                    }
                },
            },
            paymentPreference: ["KHALTI", "EBANKING", "MOBILE_BANKING", "CONNECT_IPS", "SCT"],
        });

        checkout.show({ amount: amount * 100 }); // Khalti amount is in paisa
    }, [productId, productName, amount, KHALTI_PUBLIC_KEY, paymentSuccess]);

    return { initiateKhaltiPayment, isProcessingPayment, paymentSuccess, paymentError };
};