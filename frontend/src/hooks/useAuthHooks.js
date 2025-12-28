// src/hooks/useAuthHooks.js
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axios from "../api/api"; // Your configured Axios instance

// --- API Service Imports ---
import {
    sendPasswordResetLinkApi,
    resetPasswordApi,
    changePasswordApi,
    updateProfileApi // Make sure updateProfileApi is imported
} from '../api/authApi';

// --- Internal Service Functions for Hooks ---
const uploadProfilePictureService = async (file) => {
    const formData = new FormData();
    formData.append("profilePicture", file);
    const response = await axios.post("/api/auth/uploadImage", formData);
    return response.data;
};

const updateProfileService = async (profileData) => {
    const response = await updateProfileApi(profileData);
    return response.data;
};

// --- React Query Hooks ---

export const useSendPasswordResetLink = () => {
    return useMutation({
        mutationFn: sendPasswordResetLinkApi,
        mutationKey: ['sendPasswordResetLink'],
        onSuccess: (data) => {
            toast.success(data?.message || "Password reset link sent successfully!");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || err.message || "Failed to send password reset link.");
        }
    });
};

export const useResetPassword = () => {
    return useMutation({
        mutationFn: ({ token, newPassword, confirmPassword }) => resetPasswordApi({ newPassword, confirmPassword }, token),
        mutationKey: ['resetPassword'],
        onSuccess: (data) => {
            toast.success(data?.message || "Password reset successfully!");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || err.message || "Failed to reset password.");
        }
    });
};

export const useChangePassword = () => {
    return useMutation({
        mutationFn: changePasswordApi,
        mutationKey: ['changePassword'],
        onSuccess: (data) => {
            toast.success(data?.message || "Password changed successfully!");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || err.message || "Failed to change password.");
        }
    });
};

export const useUploadProfilePicture = () => {
    return useMutation({
        mutationFn: uploadProfilePictureService,
        mutationKey: ['uploadProfilePicture'],
        onSuccess: (data) => {
            toast.success(data.message || "Profile picture uploaded successfully!");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || error.message || "Failed to upload profile picture.");
        },
    });
};

// Hook for updating user profile
export const useUpdateProfile = () => {
    return useMutation({
        mutationFn: updateProfileService, // Calls the service function which calls updateProfileApi
        mutationKey: ['updateProfile'],
        onSuccess: (data) => {
            // Success message is handled by the component using this hook
            toast.success(data.message || "Profile updated successfully!");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || err.message || "Failed to update profile.");
        }
    });
};