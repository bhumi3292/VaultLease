// src/api/api.js
import axios from 'axios';
import { toast } from 'react-toastify';
import { VITE_BACKEND_URL } from '../utils/env';

export const API_URL = VITE_BACKEND_URL;

const instance = axios.create({
    baseURL: API_URL,

});

// Request interceptor to attach token
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        if (config.data instanceof FormData) {
            // Do not set Content-Type for FormData, Axios handles it.
            // Delete it if it was somehow set previously by an interceptor or default.
            delete config.headers['Content-Type'];
        } else if (!config.headers['Content-Type']) {
            // Default to application/json for non-FormData requests if not already set
            config.headers['Content-Type'] = 'application/json';
        }


        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    (response) => response,
    (error) => {
        const originalRequest = error.config;

        // Check for 401 Unauthorized, often indicating token issues
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            toast.error("Session expired or unauthorized. Please log in again.");
            window.location.href = '/login'; // Redirect to login
        }
        // Handle other common errors
        else if (error.response?.status === 400) {
            toast.error(error.response.data.message || "Bad Request");
        } else if (error.response?.status === 403) {
            toast.error(error.response.data.message || "Forbidden: You don't have permission.");
        } else if (error.response?.status === 404) {
            toast.error(error.response.data.message || "Resource not found. Check API endpoint path.");
        } else if (error.response?.status >= 500) {
            toast.error(error.response.data.message || "Server Error. Please try again later.");
        } else if (error.message === "Network Error") {
            toast.error("Network Error. Please check your internet connection.");
        } else {
            toast.error(error.response?.data?.message || error.message || "An unexpected error occurred.");
        }

        return Promise.reject(error);
    }
);

export default instance;