// src/api/axiosInstance.js
import axios from 'axios';
import { toast } from 'react-toastify'; // Ensure react-toastify is installed and configured
import { VITE_BACKEND_URL } from '../utils/env';

// Define the API URL from environment variables
export const API_URL = VITE_BACKEND_URL;

// Create an Axios instance with a base URL
const instance = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Send cookies with requests
    timeout: 10000, // Request timeout
});

instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (config.data instanceof FormData) {

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

// Response interceptor for global error handling and token refresh/session expiration
instance.interceptors.response.use(
    (response) => response, // Directly return response on success
    (error) => {
        const originalRequest = error.config;

        // Check for 401 Unauthorized, often indicating token issues or session expiry
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            localStorage.removeItem('token'); // Clear token
            localStorage.removeItem('user'); // Clear user data
            toast.error("Session expired or unauthorized. Please log in again.");
            window.location.href = '/login'; // Redirect to login page
        }
        // Handle other common errors with specific toast messages
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
            // Fallback for any other unexpected errors
            toast.error(error.response?.data?.message || error.message || "An unexpected error occurred.");
        }

        return Promise.reject(error);
    }
);

export default instance;
