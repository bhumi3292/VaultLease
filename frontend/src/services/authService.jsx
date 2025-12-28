// src/services/authService.jsx
import {
    registerUserApi,
    loginUserApi,
    sendPasswordResetLinkApi,
    resetPasswordApi,
    changePasswordApi
} from "../api/authApi";

import api from '../api/api';

export const registerUserService = async (formData) => {
    try {
        console.log(formData);
        const response = await registerUserApi(formData);
        return response.data;
    } catch (err) {
        throw err.response?.data || { message: "Registration Failed" };
    }
};

export const loginUserService = async (formData) => {
    try {
        const response = await loginUserApi(formData);
        return response.data;
    } catch (err) {
        throw err.response?.data || { message: "Login Failed" };
    }
};

// --- UPDATED SERVICE FUNCTION FOR SENDING PASSWORD RESET LINK ---
export const sendPasswordResetLinkService = async (formData) => {
    try {
        const response = await sendPasswordResetLinkApi(formData);
        return response.data;
    } catch (err) {
        throw err.response?.data || { message: "Failed to send password reset link. Please try again later." };
    }
};

export const resetPasswordService = async (formData, token) => {
    try {
        const response = await resetPasswordApi(formData, token);
        return response.data
    } catch (err) {
        throw err.response?.data || { message: "Reset Password Failed" };
    }
}

export const changePasswordService = async (formData) => {
    try {
        const response = await changePasswordApi(formData);
        return response.data;
    } catch (err) {
        throw err.response?.data || { message: "Failed to change password." };
    }
};

export const uploadProfilePictureService = async (file) => {
    const formData = new FormData();
    // The key 'profilePicture' MUST match what Multer expects on the backend (.single('profilePicture'))
    formData.append('profilePicture', file);

    try {
        const response = await api.post(
            '/api/auth/uploadImage', // This URL matches your backend route
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data', // This header is ESSENTIAL for FormData
                },

            }
        );
        return response.data;
    } catch (error) {
        console.error("Error in uploadProfilePictureService:", error);
        throw error.response?.data || { message: "Failed to upload image. Please try again." };
    }
};