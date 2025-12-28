// dreamdwell_backend/routes/chatbot.routes.js

const express = require("express");
const router = express.Router();


const handleChatQuery = require("../controllers/ChatbotController");


router.post(
    "/query",
    handleChatQuery
);

module.exports = router;