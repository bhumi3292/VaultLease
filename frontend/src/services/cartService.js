
import {
    getCartApi,
    addToCartApi,
    removeFromCartApi,
    clearCartApi
} from '../api/cartApi.js';

export const getCartService = async () => {
    try {
        const response = await getCartApi();
        return response.data;
    } catch (err) {
        throw err.response?.data || { message: "Failed to fetch cart items" };
    }
};

export const addToCartService = async (propertyId) => {
    try {
        const response = await addToCartApi(propertyId);
        return response.data;
    } catch (err) {
        throw err.response?.data || { message: "Failed to add to cart" };
    }
};

export const removeFromCartService = async (propertyId) => {
    try {
        const response = await removeFromCartApi(propertyId);
        return response.data;
    } catch (err) {
        throw err.response?.data || { message: "Failed to remove from cart" };
    }
};

export const clearCartService = async () => {
    try {
        const response = await clearCartApi();
        return response.data;
    } catch (err) {
        throw err.response?.data || { message: "Failed to clear cart" };
    }
};
