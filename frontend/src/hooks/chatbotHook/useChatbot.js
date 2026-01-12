// src/hooks/useChatbot.js
import { useState } from 'react';
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
// Corrected import path: Go up one directory (from hooks) then into services
import { sendChatQueryService } from '../../services/chatbotService.js';


const formatHistoryForApi = (messages) => {
    return messages.slice(1).map(msg => ({ // Slice(1) to exclude initial bot greeting from history
        role: msg.sender === 'bot' ? 'model' : 'user',
        text: msg.text,
    }));
};

export const useChatbot = () => {
    const [messages, setMessages] = useState([
        { text: 'Namaste! I\'m VaultBot, your friendly guide at VaultLease. How can I help you find a room or assist with a department listing today?', sender: 'bot' },
    ]);

    const mutation = useMutation({
        mutationKey: ['chatbot_query'],
        mutationFn: sendChatQueryService,

        onSuccess: (response) => {
            const botReply = response?.data?.reply;
            if (botReply) {
                const botMessage = { text: botReply, sender: 'bot' };
                setMessages(prev => [...prev, botMessage]);
            } else {
                toast.error("Received an empty response from the bot.");
                setMessages(prev => [...prev, { text: "VaultBot received an empty response. Please try again.", sender: 'bot' }]);
            }
        },

        onError: (err) => {
            const errorMessage = err.message || "Oops! I seem to have lost connection. Please try again.";
            toast.error(errorMessage);
            const errorBotMessage = { text: errorMessage, sender: 'bot' };
            setMessages(prev => [...prev, errorBotMessage]);
        }
    });

    const sendMessage = (userInput) => {
        if (!userInput.trim() || mutation.isPending) return;

        const userMessage = { text: userInput, sender: 'user' };
        const currentMessages = [...messages, userMessage];
        setMessages(currentMessages);

        const history = formatHistoryForApi(currentMessages);
        const payload = { query: userInput, history };

        mutation.mutate(payload);
    };

    return {
        messages,
        sendMessage,
        isLoading: mutation.isPending,
        error: mutation.error,
    };
};