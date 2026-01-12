// vaultlease_backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticateUser } = require("../middlewares/auth");

const multer = require('multer');
const path = require('path');
const User = require('../models/User');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 1024 },
});

// ===============================================
// --- Existing Authentication Routes ---
router.post("/login", authController.loginUser);
router.post("/register", authController.registerUser);
router.post("/find-user-id", authController.findUserIdByCredentials);

// Password Reset Routes
router.post("/request-reset/send-link", authController.sendPasswordResetLink);
router.post("/reset-password/:token", authController.resetPassword);

// Get Current User Route (Protected)
router.get("/me", authenticateUser, authController.getMe);
router.post('/change-password', authenticateUser, authController.changePassword);
router.put('/update-profile', authenticateUser, authController.updateProfile);

// Logout Route
router.post('/logout', authenticateUser, authController.logoutUser);

// Image Upload Route
router.post('/uploadImage', authenticateUser, upload.single('profilePicture'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image file provided for upload.' });
    }

    try {
        const userId = req.user._id;
        const imageUrl = `/uploads/${req.file.filename}`;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePicture: imageUrl },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'Authenticated user not found in database.' });
        }

        res.status(200).json({
            success: true,
            message: 'Profile picture uploaded successfully',
            imageUrl: imageUrl,
            user: updatedUser
        });

    } catch (error) {
        console.error('Database update error after file upload:', error);
        return res.status(500).json({ success: false, message: 'Internal server error while updating profile picture.' });
    }
});

module.exports = router;