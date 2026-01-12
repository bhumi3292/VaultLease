// src/api/cartApi.js
import api from './api';

export const getCartApi = async () => {
    // console.log("Fetching cart from /api/favorites");
    return await api.get('/api/favorites');
};

export const addToCartApi = async (propertyId) => {
    return await api.post('/api/favorites/add', { propertyId });
};

export const removeFromCartApi = async (propertyId) => {

    return await api.delete(`/api/favorites/remove/${propertyId}`);
};

export const clearCartApi = async () => {

    return await api.delete('/api/favorites/clear');
};