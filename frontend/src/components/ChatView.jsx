// src/components/ChatView.jsx
import React, { useState, useRef, useEffect, useContext } from 'react';
import { useChat } from '../hooks/useChat.js';
import { AuthContext } from '../auth/AuthProvider';
import { toast } from 'react-toastify';
import chatSocketService from '../services/chatSocketService';
import { getFullMediaUrl } from '../utils/mediaUrlHelper';

function ChatView({ selectedChatId, currentUserId }) {
    // currentUserId is already being passed from ProfilePage.test.jsx, but also get user from context
    const { user } = useContext(AuthContext);

    const senderIdForMessages = currentUserId || user?._id;

    // The useChat hook is now correctly imported and used
    const {
        messages,
        chatData,
        isLoading,
        isError,
        fetchError,
        sendMessage,
        isSending,
    } = useChat(selectedChatId, senderIdForMessages);

    const [messageInput, setMessageInput] = useState('');
    const [isOtherTyping, setIsOtherTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Typing indicator: emit typing event
    useEffect(() => {
        if (!selectedChatId || !senderIdForMessages) return;
        if (!messageInput) return;
        chatSocketService.emitTyping(selectedChatId, senderIdForMessages);
    }, [messageInput, selectedChatId, senderIdForMessages]);

    // Listen for typing events from the other user
    useEffect(() => {
        if (!selectedChatId || !senderIdForMessages) return;
        const handleTyping = ({ chatId, senderId }) => {
            if (chatId === selectedChatId && senderId !== senderIdForMessages) {
                setIsOtherTyping(true);
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => setIsOtherTyping(false), 2000);
            }
        };
        const cleanup = chatSocketService.onTyping(handleTyping);
        return () => {
            cleanup();
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, [selectedChatId, senderIdForMessages]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (messageInput.trim() && selectedChatId && senderIdForMessages) {
            sendMessage(messageInput);
            setMessageInput('');
        } else {
            console.warn("Cannot send message: Missing input, chat ID, or sender ID.");
            toast.error("Please ensure you're in a chat and logged in.");
        }
    };

    if (isLoading) return <div className="text-gray-600 text-center py-8">Loading chat messages...</div>;
    if (isError) return <div className="text-red-500 text-center py-8">Error loading chat: {fetchError?.message}</div>;
    if (!selectedChatId) return <div className="text-gray-500 text-center py-8">Select a chat to view messages.</div>;
    // If selectedChatId is present but chatData isn't, it might mean the chat doesn't exist or permissions issue
    if (selectedChatId && !chatData) return <div className="text-gray-500 text-center py-8">No chat data found for the selected chat.</div>;

    // Find the other participant (landlord or chat partner)
    const otherParticipant = chatData?.participants?.find(p => p._id !== senderIdForMessages);

    return (
        <div className="flex flex-col h-full">
            {/* Chat header with landlord/avatar info */}
            <div className="flex items-center mb-3 border-b pb-2">
                {otherParticipant?.profilePicture ? (
                    <img
                        src={getFullMediaUrl(otherParticipant.profilePicture)}
                        alt={otherParticipant.fullName}
                        className="w-10 h-10 rounded-full mr-3 border object-cover"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 mr-3 flex items-center justify-center text-lg text-gray-600">
                        {otherParticipant?.fullName ? otherParticipant.fullName[0] : '?'}
                    </div>
                )}
                <div>
                    <div className="font-semibold text-lg text-gray-800">
                        {otherParticipant?.fullName || 'Unknown User'}
                    </div>
                    {otherParticipant?.email && (
                        <div className="text-sm text-gray-500">{otherParticipant.email}</div>
                    )}
                    {otherParticipant?.phoneNumber && (
                        <div className="text-sm text-gray-500">{otherParticipant.phoneNumber}</div>
                    )}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 bg-gray-50 rounded-lg mb-3 border border-gray-200">
                {messages.length === 0 ? (
                    <p className="text-gray-600 text-center py-4">No messages yet. Start the conversation!</p>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message._id || message.isOptimistic ? message._id : `temp-${Math.random()}`}
                            className={`flex items-end my-2 ${message.sender._id === senderIdForMessages ? 'flex-row-reverse' : 'flex-row'} ${message.isOptimistic ? 'opacity-70' : 'opacity-100'}`}
                        >
                            {/* Avatar */}
                            {message.sender.profilePicture ? (
                                <img
                                    src={getFullMediaUrl(message.sender.profilePicture)}
                                    alt={message.sender.fullName}
                                    className="w-8 h-8 rounded-full mx-2 border object-cover"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-300 mx-2 flex items-center justify-center text-xs text-gray-600">
                                    {message.sender.fullName ? message.sender.fullName[0] : '?'}
                                </div>
                            )}
                            <span className={`inline-block p-2 rounded-lg max-w-[70%] ${message.sender._id === senderIdForMessages ? 'bg-[#003366] text-white' : 'bg-gray-200 text-gray-800'
                                }`}>
                                <strong>{message.sender.fullName || 'Unknown User'}</strong>
                                <br />
                                {message.text}
                                <span className={`block font-normal mt-1 text-xs ${message.sender._id === senderIdForMessages ? 'text-gray-300' : 'text-gray-500'}`}>
                                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </span>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Typing indicator just above the input, with animated dots */}
            {isOtherTyping && (
                <div className="flex items-center mb-2 ml-2 text-gray-500 text-sm italic">
                    <span>The other user is typing</span>
                    <span className="ml-1 flex gap-0.5">
                        <span className="animate-pulse delay-75">.</span>
                        <span className="animate-pulse delay-150">.</span>
                        <span className="animate-pulse delay-300">.</span>
                    </span>
                </div>
            )}

            <form onSubmit={handleSendMessage} className="flex">
                <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isSending || !senderIdForMessages || !selectedChatId}
                    className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#003366]"
                />
                <button
                    type="submit"
                    disabled={isSending || !messageInput.trim() || !senderIdForMessages || !selectedChatId}
                    className="bg-[#003366] text-white px-4 py-2 rounded-r-lg hover:bg-[#002244] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSending ? 'Sending...' : 'Send'}
                </button>
            </form>
        </div>
    );
}

export default ChatView;