// vaultlease_backend/controllers/chat.controller.js
const Chat = require('../models/chat');
const User = require('../models/User');
const Property = require('../models/Property');
const { asyncHandler } = require('../utils/asyncHandler');


exports.createOrGetChat = asyncHandler(async (req, res) => {
    const currentUserId = req.user._id;
    const { otherUserId, propertyId } = req.body;

    if (!otherUserId) {
        console.log("Chat 400: Missing otherUserId");
        return res.status(400).json({ success: false, message: "Other user ID is required." });
    }
    if (currentUserId.toString() === otherUserId.toString()) {
        console.log("Chat 400: Self chat");
        return res.status(400).json({ success: false, message: "Cannot chat with yourself." });
    }

    const [currentUser, otherUser] = await Promise.all([
        User.findById(currentUserId),
        User.findById(otherUserId)
    ]);
    if (!currentUser || !otherUser) {
        console.log("Chat 404: User not found. Current:", currentUserId, "Other:", otherUserId);
        return res.status(404).json({ success: false, message: "One or both users not found." });
    }

    let query = { participants: { $all: [currentUserId, otherUserId] } };
    let chatName = `Chat between ${currentUser.fullName} and ${otherUser.fullName}`;

    if (propertyId) {
        const property = await Property.findById(propertyId);
        if (!property) {
            console.warn(`Chat Warning: Property ${propertyId} not found. Proceeding as general chat.`);
            // query.property = propertyId; // Do not filter by property if it doesn't exist
            // but we might want to still check if a general chat exists?
            // For now, let's fall back to general chat logic
            query.property = { $exists: false };
            chatName = `Chat: ${currentUser.fullName} - ${otherUser.fullName}`;
        } else {
            query.property = propertyId;
            chatName = `Chat for ${property.title}: ${currentUser.fullName} - ${otherUser.fullName}`;
        }
    } else {
        query.property = { $exists: false }; // For general direct messages not tied to a property
    }

    let chat = await Chat.findOne(query);

    if (!chat) {
        chat = await Chat.create({
            name: chatName,
            participants: [currentUserId, otherUserId],
            property: propertyId || null,
            messages: [] // Initialize messages array
        });
        return res.status(201).json({ success: true, message: "New chat created.", data: chat });
    }

    return res.status(200).json({ success: true, message: "Existing chat retrieved.", data: chat });
});


exports.getMyChats = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const chats = await Chat.find({ participants: userId })
        .populate('participants', 'fullName profilePicture')
        .populate('property', 'title imageUrls')
        .sort({ lastMessageAt: -1 });

    return res.status(200).json({ success: true, data: chats });
});

exports.getChatById = asyncHandler(async (req, res) => {
    const chatId = req.params.chatId;
    const userId = req.user._id;

    // Populate participants and property, and also populate sender for each message in the messages array
    const chat = await Chat.findById(chatId)
        .populate('participants', 'fullName profilePicture')
        .populate('property', 'title imageUrls')
        .populate('messages.sender', 'fullName profilePicture')
        .sort({ "messages.createdAt": 1 });

    if (!chat) {
        return res.status(404).json({ success: false, message: "Chat not found." });
    }

    // Authorize: Ensure the authenticated user is one of the participants
    if (!chat.participants.some(p => p._id.toString() === userId.toString())) {
        return res.status(403).json({ success: false, message: "Not authorized to access this chat." });
    }

    return res.status(200).json({ success: true, data: chat });
});


// @desc    Get messages for a specific chat (adapted from your old message.controller)
// @route   GET /api/chats/:chatId/messages -- You can use this route or just get all messages with getChatById
// @access  Protected (user must be a participant)
exports.getMessagesForChat = asyncHandler(async (req, res) => {
    const chatId = req.params.chatId;
    const userId = req.user._id;

    const chat = await Chat.findById(chatId)
        .populate('messages.sender', 'fullName profilePicture') // Populate sender of each message
        .sort({ "messages.createdAt": 1 }); // Ensure messages are sorted by time

    if (!chat) {
        return res.status(404).json({ success: false, message: "Chat not found." });
    }

    // Authorize: Ensure the authenticated user is one of the participants
    if (!chat.participants.some(p => p._id.toString() === userId.toString())) {
        return res.status(403).json({ success: false, message: "Not authorized to access messages in this chat." });
    }

    // Return just the messages array
    return res.status(200).json({ success: true, data: chat.messages });
});