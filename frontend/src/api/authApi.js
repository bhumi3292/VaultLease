// src/api/authApi.js
import api from './api';

export const registerUserApi = async (userData) => {
    return await api.post('/api/auth/register', userData);
};

export const loginUserApi = async (credentials) => {
    return await api.post('/api/auth/login', credentials);
};

export const verifyOtpApi = async (data) => {
    return await api.post('/api/auth/verify-otp', data);
};

export const resendOtpApi = async (data) => {
    return await api.post('/api/auth/resend-otp', data);
};

export const getAuthUserApi = async () => {
    return await api.get('/api/auth/me');
};

export const updateUserApi = async (userId, userData) => {
    return await api.put(`/api/auth/users/${userId}`, userData);
};


export const sendPasswordResetLinkApi = async (data) => {

    return await api.post('/api/auth/request-reset/send-link', data);
};

export const resetPasswordApi = async (data, token) => {
    return await api.post(`/api/auth/reset-password/${token}`, data);
};

export const changePasswordApi = async (data) => {
    return await api.post('/api/auth/change-password', data);
};

export const updateProfileApi = async (profileData) => {

    return await api.put('/api/auth/update-profile', profileData);
};

export const logoutUserApi = async () => {
    return await api.post('/api/auth/logout');
};