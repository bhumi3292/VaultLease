// src/api/paymentApi.js

import axios from './api';

export const initiateEsewaPaymentApi = async (propertyId, amount, additionalDetails = {}) => {
    try {

        const response = await axios.post('/api/payments/initiate', {
            propertyId,
            amount,
            ...additionalDetails,
        });
        return response.data;
    } catch (error) {
        console.error('API Error: Failed to initiate eSewa payment:', error.response?.data || error.message);
        throw error;
    }
};

export const createPaymentApi = async (paymentData) => {
    try {
        const response = await axios.post('/api/payments', paymentData);
        return response.data;
    } catch (error) {
        console.error('API Error: Failed to create/verify payment record:', error.response?.data || error.message);
        throw error;
    }
};