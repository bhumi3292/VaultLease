// src/services/chatSocketService.js
import { io } from 'socket.io-client';
import { VITE_BACKEND_URL } from '../utils/env';

const SOCKET_URL = VITE_BACKEND_URL; // Should be http://localhost:3001

class ChatSocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.messageListeners = [];
        this.errorListeners = [];
    }

    connect() {
        if (this.socket && this.socket.connected) {
            console.log("Socket already connected.");
            return;
        }
        this.socket = io(SOCKET_URL, {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
            this.isConnected = true;
            console.log('Socket.IO connected:', this.socket.id);
        });

        this.socket.on('disconnect', () => {
            this.isConnected = false;
            console.log('Socket.IO disconnected');
        });

        this.socket.on('connect_error', (err) => {
            console.error('Socket.IO connect error:', err.message);
            this.isConnected = false;
        });

        this.socket.on('newMessage', (message) => {
            this.messageListeners.forEach(listener => listener(message));
        });

        this.socket.on('messageError', (error) => {
            console.error("Server-side message error received:", error.message);
            this.errorListeners.forEach(listener => listener(error));
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }

    joinChat(chatId) {
        if (this.isConnected) {
            this.socket.emit('joinChat', chatId);
            console.log(`Socket.IO: Emitted 'joinChat' for ${chatId}`);
        } else {
            console.warn('Socket not connected. Cannot join chat.');
        }
    }

    leaveChat(chatId) {
        if (this.isConnected) {
            this.socket.emit('leaveChat', chatId);
            console.log(`Socket.IO: Emitted 'leaveChat' for ${chatId}`);
        } else {
            console.warn('Socket not connected. Cannot leave chat.');
        }
    }

    // ⭐ CORRECTED: Expect individual parameters instead of an object ⭐
    sendMessage(chatId, senderId, text) {
        if (this.isConnected) {
            this.socket.emit('sendMessage', { chatId, senderId, text });
            console.log(`Socket.IO: Emitted 'sendMessage' to chat ${chatId} from ${senderId}`);
        } else {
            console.warn('Socket not connected. Cannot send message.');
        }
    }

    onNewMessage(callback) {
        this.messageListeners.push(callback);
        return () => this.offNewMessage(callback); // Return cleanup function for useEffect
    }

    offNewMessage(callback) {
        this.messageListeners = this.messageListeners.filter(listener => listener !== callback);
    }

    onMessageError(callback) {
        this.errorListeners.push(callback);
        return () => this.offMessageError(callback); // Return cleanup function for useEffect
    }

    offMessageError(callback) {
        this.errorListeners = this.errorListeners.filter(listener => listener !== callback);
    }

    // Typing indicator support
    emitTyping(chatId, senderId) {
        if (this.isConnected) {
            this.socket.emit('typing', { chatId, senderId });
        }
    }

    onTyping(callback) {
        this.socket.on('typing', callback);
        return () => this.socket.off('typing', callback);
    }
}

export default new ChatSocketService();