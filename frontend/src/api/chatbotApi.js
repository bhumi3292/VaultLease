// src/api/chatbotApi.js
import instance from "./api";
export const sendChatQueryApi = (data) => {
    return instance.post("/api/chatbot/query", data);
};