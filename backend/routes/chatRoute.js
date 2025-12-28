// dreamdwell_backend/routers/chat.routes.js
const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController"); // Corrected import path/name
const { authenticateUser, requireRole } = require("../middlewares/auth"); // Corrected middleware import

// Chat Management Routes
router.post("/create-or-get", authenticateUser, chatController.createOrGetChat);
router.get("/", authenticateUser, chatController.getMyChats);
router.get("/:chatId", authenticateUser, chatController.getChatById); // Route to get a specific chat AND its messages

// Optional: If you want a separate endpoint just for messages
router.get("/:chatId/messages", authenticateUser, chatController.getMessagesForChat);

module.exports = router;

