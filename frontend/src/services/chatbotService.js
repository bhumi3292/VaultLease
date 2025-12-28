// src/services/chatbotService.js
import { sendChatQueryApi } from "../api/chatbotApi";
import { toast } from 'react-toastify';
export const sendChatQueryService = async (payload) => {
    try {
        const response = await sendChatQueryApi(payload);
        if (response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data.message || "An unexpected error occurred from the bot.");
        }
    } catch (error) {
        console.error("Chatbot Service Error:", error);
        const errorMessage = error.response?.data?.message || error.message || "Could not connect to the chatbot. Please try again.";
        toast.error(errorMessage);
        throw new Error(errorMessage);
    }
};