// backend/routes/authRoutes.js
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

// Initialize Multer upload middleware - This is the corrected and expanded definition.
// It should only appear ONCE.
const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 1024 }, // 1GB limit is very large, consider reducing if not strictly needed
    // fileFilter: (req, file, cb) => {
    // Expanded filetypes to include heic and webp
    // const filetypes = /jpeg|jpg|png|gif|heic|webp/; // Added heic and webp

    // const mimetype = filetypes.test(file.mimetype);
    // const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    // Diagnostic logs (keep these for debugging, remove in production if not needed)
    // console.log('DEBUG (Backend): Received file.mimetype:', file.mimetype);
    // console.log('DEBUG (Backend): Received file.originalname extension:', path.extname(file.originalname).toLowerCase());
    // console.log('DEBUG (Backend): mimetype test result:', mimetype);
    // console.log('DEBUG (Backend): extname test result:', extname);

    //     if (mimetype && extname) {
    //         return cb(null, true);
    //     }
    //     // Update the error message to reflect newly supported types
    //     cb(new Error('Error: File upload only supports JPEG, JPG, PNG, GIF, HEIC, and WebP images.'));
    // }
});

const { loginLimiter, otpLimiter } = require("../middlewares/rateLimiter");

// ===============================================
// --- Existing Authentication Routes ---
router.post("/login", loginLimiter, authController.loginUser);
router.post("/verify-otp", otpLimiter, authController.verifyLoginOtp);
router.post("/logout", authenticateUser, authController.logoutUser);
router.post("/register", authController.registerUser);
router.post("/find-user-id", authController.findUserIdByCredentials);

// Password Reset Routes
router.post("/request-reset/send-link", otpLimiter, authController.sendPasswordResetLink);
router.post("/reset-password/:token", otpLimiter, authController.resetPassword);

// Get Current User Route (Protected)
router.get("/me", authenticateUser, authController.getMe);

router.post('/change-password', authenticateUser, authController.changePassword);

router.put('/update-profile', authenticateUser, authController.updateProfile);

// Image Upload Route - THIS IS THE RELEVANT SECTION. IT IS ALREADY A POST.
// Frontend needs to send a POST request to this endpoint.
router.post('/uploadImage', authenticateUser, upload.single('profilePicture'), async (req, res) => {
    // console.log(req.file) // Uncomment if you want to see multer's file object

    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image file provided for upload.' });
    }

    try {
        const userId = req.user._id;
        // Construct the URL path to store in the database
        const imageUrl = `/uploads/${req.file.filename}`;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePicture: imageUrl },
            { new: true, runValidators: true }
        ).select('-password'); // Exclude password from the returned user object

        if (!updatedUser) {
            // This case should be rare if authenticateUser works, but good to have
            return res.status(404).json({ success: false, message: 'Authenticated user not found in database.' });
        }

        res.status(200).json({
            success: true,
            message: 'Profile picture uploaded successfully',
            imageUrl: imageUrl, // Confirm the path that was saved
            user: updatedUser // Return the updated user object (without password)
        });

    } catch (error) {
        console.error('Database update error after file upload:', error);
        // More granular error handling for database issues if needed
        return res.status(500).json({ success: false, message: 'Internal server error while updating profile picture.' });
    }
});

module.exports = router;