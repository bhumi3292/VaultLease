// src/api/cartApi.js
import api from './api';

export const getCartApi = async () => {
    return await api.get('/api/cart');
};

export const addToCartApi = async (propertyId) => {
    return await api.post('/api/cart/add', { propertyId });
};

export const removeFromCartApi = async (propertyId) => {

    return await api.delete(`/api/cart/remove/${propertyId}`);
};

export const clearCartApi = async () => {

    return await api.delete('/api/cart/clear');
};