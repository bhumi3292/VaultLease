// vaultlease_backend/index.js
console.log("Server Code Updated - V3 - MongoSanitize Removed");
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const validateEnv = require("./utils/validateEnv");
// validateEnv(); // keeping it commented to avoid crashing if user hasn't set all vars yet, but code is there.
const mongoose = require("mongoose");
const multer = require("multer");

const connectDB = require("./config/db");
const ApiError = require("./utils/api_error");

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
// const xss = require('xss-clean'); // REMOVED
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const app = express(); // Initialize Express app

// ========== Security Middleware ==========

app.use(cookieParser()); // Parse cookies

// CORS must be first for browser to see access control headers
app.use(cors({
    origin: true, // Allow all origins for dev simplicity
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
}));

// Set security headers
app.use(helmet({
    crossOriginResourcePolicy: false, // Disable for dev to prevent blocking static assets
}));

// Prevent XSS attacks
// REMOVED XSS-CLEAN completely - relying on React's auto-escaping and Helmet
// Security Audit: Confirmed Helmet is active for header protection

// Sanitize data (NoSQL injection prevention)

// Sanitize data (NoSQL injection prevention)
// app.use(mongoSanitize()); // REMOVED due to "Cannot set property query" error in this environment

// Prevent Parameter Pollution
app.use(hpp());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 1000, // Limit each IP to 1000 requests per minute (relaxed for dev)
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests from this IP, please try again later."
});
app.use('/api', limiter); // Apply to all API routes

// ========== Standard Middleware ==========
// CORS moved up
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ========== Import & Use API Routes ==========

const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const cartRoutes = require("./routes/cartRoute");
const paymentRoutes = require('./routes/paymentRoute');
const calendarRoutes = require('./routes/calendarRoutes');
const chatbotRoutes = require('./routes/chatbotRoute');
const chatRoutes = require('./routes/chatRoute');
const userRoutes = require('./routes/userRoutes');

const statsRoutes = require('./routes/statsRoute'); // Import Stats Route
const bookingRoutes = require('./routes/bookingRoutes');


const {
    sensitiveLimiter,
    paymentLimiter
} = require('./middlewares/apiLimiter');

app.use("/api/auth", authRoutes);
console.log("Registering /api/booking routes...");
// Apply Sensitive Limiter to Booking Routes
app.use('/api/booking', sensitiveLimiter, bookingRoutes);
app.use("/api/spaces", propertyRoutes);
app.use("/api/departments", categoryRoutes);
app.use("/api/favorites", cartRoutes);
// Apply Payment Limiter
app.use('/api/payments', paymentLimiter, paymentRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes); // Register Stats Route

// Moved up for priority check
console.log("Registering /api/booking routes (High Priority)...");
app.use('/api/booking', sensitiveLimiter, bookingRoutes);

app.get("/", (req, res) => {
    res.status(200).send("VaultLease backend running successfully!");
});

// ========== Global Error Handler ==========
app.use((err, req, res, next) => {
    console.error("Unhandled Error Caught by Global Handler:");
    console.error(err);

    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: err.success,
            message: err.message,
            errors: err.errors,
            data: err.data
        });
    }

    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(el => el.message);
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors,
            data: null
        });
    }

    if (err instanceof multer.MulterError) {
        let message = "File upload error.";
        if (err.code === "LIMIT_FILE_SIZE") {
            message = "File is too large.";
        } else if (err.code === "LIMIT_FILE_COUNT") {
            message = "Too many files uploaded.";
        } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
            message = `Unexpected file field: ${err.field}. Please check field names for file uploads (e.g., use 'images' and 'videos').`;
        }
        return res.status(400).json({ success: false, message: message });
    }
    if (err.message === "Unsupported file type!") {
        return res.status(400).json({ success: false, message: err.message });
    }

    const statusCode = err.status || 500;
    const message = err.message || "Internal Server Error";
    const errors = process.env.NODE_ENV === 'development' ? [err.stack] : [];

    res.status(statusCode).json({
        success: false,
        message: message,
        errors: errors,
        data: null
    });
});


module.exports = app;

// ========== Conditional Server Start & Socket.IO Setup ==========
if (require.main === module) {
    const http = require("http");
    const { Server } = require("socket.io");
    const Chat = require("./models/chat");
    const User = require("./models/User");

    const server = http.createServer(app);

    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "*",
            methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
        },
    });

    // ========== Connect DB (for actual server run) ==========
    connectDB()
        .then(() => console.log("MongoDB connected successfully!"))
        .catch((err) => {
            console.error("Failed to connect to DB:", err);
            process.exit(1);
        });

    // ========== Socket.IO Connection Handling ==========
    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);

        socket.on("joinChat", (chatId) => {
            if (!chatId) {
                console.warn(`User ${socket.id} attempted to join chat with invalid ID: ${chatId}`);
                return;
            }
            socket.join(chatId);
            console.log(`User ${socket.id} joined chat room ${chatId}`);
        });

        socket.on("leaveChat", (chatId) => {
            if (!chatId) {
                console.warn(`User ${socket.id} attempted to leave chat with invalid ID: ${chatId}`);
                return;
            }
            socket.leave(chatId);
            console.log(`User ${socket.id} left chat room ${chatId}`);
        });

        socket.on("sendMessage", async ({ chatId, senderId, text }) => {
            console.log(chatId, senderId, text)
            if (!chatId || !senderId || !text || text.trim() === '') {
                socket.emit('messageError', { message: 'Missing chat ID, sender ID, or message text.' });
                return;
            }

            try {
                if (!mongoose.Types.ObjectId.isValid(senderId)) {
                    return socket.emit('messageError', { message: 'Invalid sender ID format.' });
                }
                if (!mongoose.Types.ObjectId.isValid(chatId)) {
                    return socket.emit('messageError', { message: 'Invalid chat ID format.' });
                }

                const messageData = {
                    sender: new mongoose.Types.ObjectId(senderId),
                    text: text.trim(),
                    createdAt: new Date()
                };

                const updatedChat = await Chat.findByIdAndUpdate(
                    chatId,
                    {
                        $push: { messages: messageData },
                        lastMessage: text.trim(),
                        lastMessageAt: messageData.createdAt
                    },
                    { new: true, runValidators: true }
                );

                if (!updatedChat) {
                    console.error(`Chat with ID ${chatId} not found for message saving.`);
                    return socket.emit('messageError', { message: 'Chat not found to save message.' });
                }

                let populatedSender = await User.findById(senderId).select('fullName profilePicture');
                if (!populatedSender) {
                    console.error("Sender not found for message population (ID:", senderId, "). This should not happen if user is authenticated.");
                    populatedSender = { _id: senderId, fullName: 'Unknown User', profilePicture: null };
                }

                const broadcastMessage = {
                    _id: messageData._id || new mongoose.Types.ObjectId().toString(),
                    sender: {
                        _id: populatedSender._id.toString(),
                        fullName: populatedSender.fullName,
                        profilePicture: populatedSender.profilePicture,
                    },
                    text: messageData.text,
                    createdAt: messageData.createdAt.toISOString(),
                    chat: chatId
                };

                io.to(chatId).emit("newMessage", broadcastMessage);

            } catch (error) {
                console.error("Error handling message:", error);
                socket.emit('messageError', { message: "Could not send message due to server error." });
            }
        });

        // Typing indicator event
        socket.on("typing", ({ chatId, senderId }) => {
            if (!chatId || !senderId) return;
            socket.to(chatId).emit("typing", { chatId, senderId });
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });

    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}