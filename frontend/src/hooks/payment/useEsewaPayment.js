// src/hooks/payment/useEsewaPayment.js
import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { initiateEsewaPaymentApi } from '../../api/paymentApi'; // Import the unified API

export const useEsewaPayment = () => {
    const [isProcessingEsewaPayment, setIsProcessingEsewaPayment] = useState(false);
    const [esewaPaymentError, setEsewaPaymentError] = useState(null);

    const initiateEsewaPayment = useCallback(async (paymentContext, paymentDetails) => {
        setIsProcessingEsewaPayment(true);
        setEsewaPaymentError(null);

        const { propertyId, amount } = paymentDetails;
        if (!propertyId || !amount || amount <= 0) {
            const errorMsg = 'Missing essential payment details (property ID or amount).';
            toast.error(errorMsg);
            setEsewaPaymentError(errorMsg);
            setIsProcessingEsewaPayment(false);
            return;
        }

        let additionalDetails = { context: paymentContext }; // Always send context

        if (paymentContext === 'booking') {
            const { bookingStartDate, bookingEndDate } = paymentDetails;
            if (!bookingStartDate || !bookingEndDate) {
                const errorMsg = 'Missing booking dates.';
                toast.error(errorMsg);
                setEsewaPaymentError(errorMsg);
                setIsProcessingEsewaPayment(false);
                return;
            }
            additionalDetails = {
                ...additionalDetails,
                bookingStartDate,
                bookingEndDate,
            };
        } else if (paymentContext === 'listing_fee') {
            const { productName } = paymentDetails;
            if (!productName) {
                const errorMsg = 'Missing product name for listing fee.';
                toast.error(errorMsg);
                setEsewaPaymentError(errorMsg);
                setIsProcessingEsewaPayment(false);
                return;
            }
            additionalDetails = {
                ...additionalDetails,
                productName,
            };
        } else {
            const errorMsg = 'Invalid payment context provided.';
            toast.error(errorMsg);
            setEsewaPaymentError(errorMsg);
            setIsProcessingEsewaPayment(false);
            return;
        }

        try {
            // Step 1: Call your backend API to get the signed eSewa parameters
            // Pass the propertyId, amount, and the dynamically constructed additionalDetails
            const response = await initiateEsewaPaymentApi(propertyId, amount, additionalDetails);

            if (response.success && response.data) {
                const { esewaGatewayUrl, ...esewaParams } = response.data;

                // Step 2: Dynamically create and submit a form to eSewa's gateway
                const form = document.createElement('form');
                form.setAttribute('method', 'POST');
                form.setAttribute('action', esewaGatewayUrl);

                for (const key in esewaParams) {
                    if (Object.prototype.hasOwnProperty.call(esewaParams, key)) {
                        const hiddenField = document.createElement('input');
                        hiddenField.setAttribute('type', 'hidden');
                        hiddenField.setAttribute('name', key);
                        hiddenField.setAttribute('value', esewaParams[key]);
                        form.appendChild(hiddenField);
                    }
                }

                document.body.appendChild(form);
                form.submit();

                toast.info('Redirecting to eSewa for secure payment...');
            } else {
                const errorMessage = response.message || `Failed to initiate eSewa payment for ${paymentContext} via server.`;
                toast.error(errorMessage);
                setEsewaPaymentError(errorMessage);
                setIsProcessingEsewaPayment(false);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || `Network error or server issue during eSewa ${paymentContext} initiation.`;
            console.error(`eSewa ${paymentContext} Initiation Error:`, error);
            toast.error(errorMessage);
            setEsewaPaymentError(errorMessage);
            setIsProcessingEsewaPayment(false);
        }
    }, []);

    return {
        initiateEsewaPayment,
        isProcessingEsewaPayment,
        esewaPaymentError,
    };
};
