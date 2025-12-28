// src/components/ChatPage.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../auth/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { getMyChats } from '../api/chatApi';
import ChatView from './ChatView';
import { useLocation } from 'react-router-dom';

const ChatPage = () => {
    const { user, isAuthenticated, isLoading: authLoading } = useContext(AuthContext);
    const [selectedChatId, setSelectedChatId] = useState(null);
    const location = useLocation();

    React.useEffect(() => {
        if (location.state && location.state.preselectChatId) {
            setSelectedChatId(location.state.preselectChatId);
        }
    }, [location.state]);

    // Fetch the list of user's chats
    const {
        data: myChats,
        isLoading: chatsLoading,
        isError: chatsError,
        error: chatsFetchError,
        refetch: refetchMyChats
    } = useQuery({
        queryKey: ['myChats', user?._id],
        queryFn: () => getMyChats(),
        enabled: isAuthenticated && !!user?._id,
    });

    if (authLoading) {
        return <div className="text-center py-8">Loading user authentication...</div>;
    }

    if (!isAuthenticated || !user) {
        return <div className="text-center py-8 text-red-500">Please log in to view chats.</div>;
    }

    const handleChatSelect = (chatId) => {
        setSelectedChatId(chatId);
    };

    return (
        <div className="flex h-[calc(100vh-64px)] bg-gray-100 p-4"> {/* Adjust height as needed */}
            {/* Left Pane: My Chats List */}
            <div className="w-1/4 bg-white rounded-lg shadow p-4 mr-4 flex flex-col">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b">My Chats</h2>
                {chatsLoading && (
                    <div className="text-gray-600 text-center py-4">Loading chats...</div>
                )}
                {chatsError && (
                    <div className="text-red-500 text-center py-4">
                        Failed to load chats: {chatsFetchError?.message || "Unknown error."}
                        <button
                            onClick={() => refetchMyChats()}
                            className="ml-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Retry
                        </button>
                    </div>
                )}
                {myChats && myChats.length > 0 ? (
                    <ul className="flex-1 overflow-y-auto">
                        {myChats.map(chat => (
                            <li
                                key={chat._id}
                                className={`p-3 mb-2 rounded-md cursor-pointer transition-colors ${
                                    selectedChatId === chat._id ? 'bg-[#003366] text-white shadow' : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                                onClick={() => handleChatSelect(chat._id)}
                            >
                                <div className="font-semibold">
                                    {chat.participants
                                        ?.filter(p => p._id !== user._id)
                                        .map(p => p.fullName)
                                        .join(', ') || chat.name || 'Untitled Chat'}
                                </div>
                                <div className="text-sm">
                                    {chat.lastMessage ? (
                                        <span className={selectedChatId === chat._id ? 'text-gray-200' : 'text-gray-600'}>
                                            {chat.lastMessage}
                                        </span>
                                    ) : (
                                        <span className={selectedChatId === chat._id ? 'text-gray-300' : 'text-gray-500 italic'}>
                                            No messages yet.
                                        </span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    !chatsLoading && !chatsError && (
                        <div className="text-gray-600 text-center py-4">No chats found.</div>
                    )
                )}
            </div>

            {/* Right Pane: Chat View */}
            <div className="flex-1 bg-white rounded-lg shadow p-4 flex flex-col">
                <ChatView selectedChatId={selectedChatId} currentUserId={user?._id} />
            </div>
        </div>
    );
};

export default ChatPage;