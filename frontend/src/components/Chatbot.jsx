// frontend/src/components/Chatbot.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useChatbot } from '../hooks/chatbotHook/useChatbot.js';
import { X, MessageSquare, Minimize2, Maximize2 } from 'lucide-react';

const Chatbot = ({ onClose }) => {
    const { messages, sendMessage, isLoading } = useChatbot();
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const [isMinimized, setIsMinimized] = useState(false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendClick = () => {
        sendMessage(input);
        setInput('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !isLoading) {
            handleSendClick();
        }
    };

    if (isMinimized) {
        return (
            <div className="fixed bottom-24 right-4 z-[1000] w-80 rounded-lg shadow-xl border border-gray-200 bg-gray-50 overflow-hidden">
                {/* Header for minimized state: Theme background, white text */}
                <div className="flex items-center justify-between bg-primary text-white p-3 rounded-t-lg shadow-md">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <MessageSquare size={20} /> FortiBot - AI Assistant
                    </h3>
                    <div className="flex gap-1">
                        <button
                            onClick={() => setIsMinimized(false)}
                            className="p-1 rounded-full hover:bg-white hover:text-primary transition-colors"
                            aria-label="Maximize chatbot"
                        >
                            <Maximize2 size={18} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-full hover:bg-white hover:text-primary transition-colors"
                            aria-label="Close chatbot"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-24 right-4 z-[1000] w-80 h-[500px] flex flex-col overflow-hidden rounded-lg shadow-xl border border-gray-200 bg-gray-50">
            {/* Chat Header: Theme background, white text */}
            <div className="flex items-center justify-between bg-primary text-white p-3 rounded-t-lg shadow-md">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <MessageSquare size={20} /> FortiBot - AI Assistant
                </h3>
                <div className="flex gap-1">
                    <button
                        onClick={() => setIsMinimized(true)}
                        className="p-1 rounded-full hover:bg-white hover:text-primary transition-colors"
                        aria-label="Minimize chatbot"
                    >
                        <Minimize2 size={18} />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-white hover:text-primary transition-colors"
                        aria-label="Close chatbot"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-gray-100">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] px-4 py-2 text-sm leading-snug break-words ${msg.sender === 'user'
                                ? 'bg-primary-light text-primary rounded-xl rounded-br-md font-medium'
                                : 'bg-white text-gray-800 rounded-xl rounded-bl-md shadow-sm'
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="max-w-[80%] px-4 py-2 text-sm leading-snug bg-white text-gray-800 rounded-xl rounded-bl-md shadow-sm animate-pulse">
                            FortiBot is typing...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Area */}
            <div className="flex flex-col p-3 border-t border-gray-200 bg-white">
                <div className="flex w-full">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isLoading ? "Sending..." : "Type your message..."}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary text-gray-700 text-sm"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSendClick}
                        className="ml-2 bg-primary text-white px-4 py-2 rounded-full hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        disabled={isLoading || !input.trim()}
                    >
                        Send
                    </button>
                </div>
                {/* Disclaimer text */}
                <p className="text-xs text-gray-500 mt-2 text-center">
                    AI can make mistakes. Cross-check important information.
                </p>
            </div>
        </div>
    );
};

export default Chatbot;