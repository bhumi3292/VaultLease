// src/api/chatApi.js
import api from "./api";
export const createOrGetChat = async (otherUserId, propertyId = null) => {
    try {
        const response = await api.post(`/api/chats/create-or-get`, {
            otherUserId,
            propertyId,
        });
        return response.data.data;
    } catch (error) {
        console.error("API error creating or getting chat:", error);
        throw new Error(error.response?.data?.message || "Failed to create or get chat.");
    }
};

export const getMyChats = async () => {
    try {
        const response = await api.get(`/api/chats`);
        return response.data.data;
    } catch (error) {
        console.error("API error fetching user chats:", error);
        throw new Error(error.response?.data?.message || "Failed to fetch user chats.");
    }
};

export const getChatById = async (chatId) => {
    try {
        const response = await api.get(`/api/chats/${chatId}`);
        return response.data.data;
    } catch (error) {
        console.error(`API error fetching chat ${chatId}:`, error);
        throw new Error(error.response?.data?.message || `Failed to fetch chat ${chatId}.`);
    }
};

export const getMessagesForChat = async (chatId) => {
    try {
        const response = await api.get(`/api/chats/${chatId}/messages`);
        return response.data.data;
    } catch (error) {
        console.error(`API error fetching messages for chat ${chatId}:`, error);
        throw new Error(error.response?.data?.message || `Failed to fetch messages for chat ${chatId}.`);
    }
};