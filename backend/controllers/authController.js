const User = require("../models/User");
const bcrypt = require("bcrypt"); // Make sure bcrypt is imported
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/sendEmail"); // Assuming this utility exists

// Register User (existing)
/**
 * Register a new user.
 * @route POST /api/auth/register
 * @access Public
 * @param {string} fullName - User's full name.
 * @param {string} email - User's email address.
 * @param {string} password - User's password (min 10 chars).
 */
exports.registerUser = async (req, res) => {
    const { fullName, email, phoneNumber, role, password, confirmPassword, universityId, department } = req.body;

    // Basic Validation
    if (!fullName || !email || !phoneNumber || !role || !password || !confirmPassword || !universityId) {
        return res.status(400).json({ success: false, message: "Please fill all the required fields (Full Name, Email, Phone, Role, Password, Confirm Password, University ID)" });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    // Role Validation
    if (!["ADMINISTRATOR", "REQUESTER"].includes(role)) {
        return res.status(400).json({ success: false, message: "Role must be 'ADMINISTRATOR' or 'REQUESTER'" });
    }

    // Department Validation (Required for Administrator)
    if (role === 'ADMINISTRATOR' && !department) {
        return res.status(400).json({ success: false, message: "Department is required for Administrators" });
    }

    // Relaxed Email Domain Validation
    // Allowing standard commercial domains per user request (.com, .org, .edu, etc.)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already in use" });
        }

        const existingId = await User.findOne({ universityId });
        if (existingId) {
            return res.status(400).json({ success: false, message: "University ID already registered" });
        }

        const newUser = new User({
            fullName,
            email,
            phoneNumber,
            role,
            universityId,
            department: role === 'ADMINISTRATOR' ? department : undefined,
            password
        });

        await newUser.save();

        return res.status(201).json({ success: true, message: "User registered successfully" });
    } catch (err) {
        console.error("Registration Error:", err);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        return res.status(500).json({ success: false, message: "Server error during registration." });
    }
};

// Login User (existing)
/**
 * Authenticate user and get token.
 * Checks for password expiry (90 days).
 * @route POST /api/auth/login
 * @access Public
 */
const logAction = require("../utils/auditLogger");

// ... (existing imports)

// Login User
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    try {
        const user = await User.findOne({ email }).select('+password +passwordChangedAt +failedLoginAttempts +lockUntil');
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        if (user.lockUntil && user.lockUntil > Date.now()) {
            const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
            await logAction({ userId: user._id, action: 'LOGIN_LOCKED', entity: 'User', entityId: user._id, details: { remainingTime } }, req);
            return res.status(403).json({
                success: false,
                message: `Account is temporarily locked. Try again in ${remainingTime} minutes.`
            });
        }

        const passwordMatch = await user.comparePassword(password);
        if (!passwordMatch) {
            user.failedLoginAttempts += 1;
            if (user.failedLoginAttempts >= 5) {
                user.lockUntil = Date.now() + 15 * 60 * 1000;
            }
            await user.save();
            await logAction({ userId: user._id, action: 'LOGIN_FAILED', entity: 'User', entityId: user._id, details: { attempts: user.failedLoginAttempts } }, req);
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        if (user.failedLoginAttempts > 0 || user.lockUntil) {
            user.failedLoginAttempts = 0;
            user.lockUntil = undefined;
            await user.save();
        }

        // Check Password Expiry
        const ninetyDaysInMs = 90 * 24 * 60 * 60 * 1000;
        const passwordAge = Date.now() - new Date(user.passwordChangedAt || user.createdAt).getTime();
        if (passwordAge > ninetyDaysInMs) {
            return res.status(403).json({ success: false, code: "PASSWORD_EXPIRED", message: "Password expired." });
        }

        if (user.isMFAEnabled) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const salt = await bcrypt.genSalt(10);
            const hashedOtp = await bcrypt.hash(otp, salt);

            user.otp = hashedOtp;
            user.otpExpires = Date.now() + 5 * 60 * 1000;
            await user.save();

            const subject = "VaultLease Login Verification Code";
            const text = `Your login verification code is: ${otp}`;
            // (Keeping HTML short for diff clarity, assume existing HTML content logic or simplified)
            const html = `<p>Your code: <b>${otp}</b></p>`;

            try {
                await sendEmail(user.email, subject, text, html);
                await logAction({ userId: user._id, action: 'OTP_SENT', entity: 'User', entityId: user._id }, req);
            } catch (emailError) {
                console.error("Failed to send OTP email:", emailError);
                return res.status(500).json({ success: false, message: "Login failed: Could not send verification email." });
            }

            return res.status(200).json({
                success: true,
                mfaRequired: true,
                message: "OTP sent to your email.",
                userId: user._id,
                email: user.email
            });
        } else {
            const payload = { _id: user._id, email: user.email, role: user.role };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
            const { password: _, otp: __, ...userWithoutPassword } = user.toObject();

            // STEP 4: Secure Cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            await logAction({ userId: user._id, action: 'LOGIN', entity: 'User', entityId: user._id, details: { method: 'Direct' } }, req);

            return res.status(200).json({
                success: true,
                mfaRequired: false,
                message: "Login successful",
                token,
                user: userWithoutPassword
            });
        }
    } catch (err) {
        console.error("Login Error:", err);
        return res.status(500).json({ success: false, message: "Server error during login." });
    }
};

// Verify OTP and Issue Token
/**
 * Verify the OTP sent to email and complete the login process.
 * @route POST /api/auth/verify-otp
 * @access Public
 */
exports.verifyLoginOtp = async (req, res) => {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
        return res.status(400).json({ success: false, message: "User ID and OTP are required." });
    }

    try {
        const user = await User.findById(userId).select('+otp +otpExpires +role');

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        if (!user.otp || !user.otpExpires || user.otpExpires < Date.now()) {
            await logAction({ userId: user._id, action: 'OTP_EXPIRED', entity: 'User', entityId: user._id }, req);
            return res.status(400).json({ success: false, message: "OTP has expired or is invalid. Please login again." });
        }

        const isMatch = await bcrypt.compare(otp, user.otp);
        if (!isMatch) {
            user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
            if (user.failedLoginAttempts >= 5) {
                user.lockUntil = Date.now() + 15 * 60 * 1000;
            }
            await user.save();
            await logAction({ userId: user._id, action: 'OTP_FAILED', entity: 'User', entityId: user._id, details: { attempts: user.failedLoginAttempts } }, req);

            const attemptsLeft = 5 - user.failedLoginAttempts;
            const msg = attemptsLeft > 0
                ? `Invalid OTP code. ${attemptsLeft} attempts remaining.`
                : "Account locked due to too many failed attempts.";
            return res.status(400).json({ success: false, message: msg });
        }

        user.otp = undefined;
        user.otpExpires = undefined;
        user.failedLoginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();

        const payload = { _id: user._id, email: user.email, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
        const { password: _, otp: __, ...userWithoutPassword } = user.toObject();

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        await logAction({ userId: user._id, action: 'LOGIN', entity: 'User', entityId: user._id, details: { method: 'MFA' } }, req);

        return res.status(200).json({
            success: true,
            message: "Login verified successfully",
            token,
            user: userWithoutPassword
        });

    } catch (error) {
        console.error("OTP Verification Error:", error);
        return res.status(500).json({ success: false, message: "Server error during verification." });
    }
};

// Find User ID by Credentials (existing)
exports.findUserIdByCredentials = async (req, res) => {
    const { email, password, stakeholder } = req.body;

    if (!email || !password || !stakeholder) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        const user = await User.findOne({ email, role: stakeholder });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found with provided credentials" });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Incorrect password" });
        }

        return res.status(200).json({ success: true, userId: user._id });
    } catch (err) {
        console.error("User ID Fetch Error:", err);
        return res.status(500).json({ success: false, message: "Server error." });
    }
};

// Get Current Authenticated User (existing)
exports.getMe = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: "User data not available after authentication." });
    }
    return res.status(200).json({
        success: true,
        user: req.user,
    });
};

// Send Password Reset Link (existing)
exports.sendPasswordResetLink = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`Password reset requested for non-existent email: ${email}`);
            // Send a generic success message to prevent email enumeration
            return res.status(200).json({ success: true, message: 'If an account with that email exists, a password reset link has been sent.' });
        }

        const resetToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Ensure FRONTEND_URL is set in your .env
        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        const subject = 'VaultLease Password Reset Request';
        const text = `You requested a password reset. Use this link to reset your password: ${resetUrl}`;
        const html = `
            <p>Hello ${user.fullName},</p>
            <p>You recently requested to reset your password for your VaultLease account.</p>
            <p>Click the link below to reset your password:</p>
            <p><a href="${resetUrl}" style="background-color: #002B5B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Your Password</a></p>
            <p>This link is valid for <b>1 hour</b>.</p>
            <p>If you did not request this, please ignore this email.</p>
            <p>Thank you,<br/>The VaultLease Team</p>
        `;

        await sendEmail(user.email, subject, text, html);

        return res.status(200).json({ success: true, message: 'If an account with that email exists, a password reset link has been sent.' });
    } catch (error) {
        console.error('Error in sendPasswordResetLink:', error);
        return res.status(500).json({ success: false, message: 'Failed to send password reset link. Please try again later.' });
    }
};

// Reset Password Handler (existing)
exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
        return res.status(400).json({ success: false, message: 'Both password fields are required.' });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    // Security: Update min length basic check
    if (newPassword.length < 10) {
        return res.status(400).json({ success: false, message: 'Password must be at least 10 characters.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found or token is invalid.' });
        }

        user.password = newPassword; // Mongoose pre-save hook should hash this
        await user.save();

        return res.status(200).json({ success: true, message: 'Password has been reset successfully.' });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ success: false, message: 'Reset link expired. Please request a new one.' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({ success: false, message: 'Invalid reset token. Please request a new one.' });
        }

        // Security: Handle errors from model middleware (Complexity, Reuse)
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        if (error.message.includes("Password cannot be")) {
            return res.status(400).json({ success: false, message: error.message });
        }

        console.error('Error in resetPassword:', error);
        return res.status(500).json({ success: false, message: 'Failed to reset password. Please try again later.' });
    }
};


exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    // `req.user` is populated by the `authenticateUser` middleware
    const userId = req.user._id;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
        return res.status(400).json({ success: false, message: "All password fields are required." });
    }

    if (newPassword !== confirmNewPassword) {
        return res.status(400).json({ success: false, message: "New password and confirm password do not match." });
    }

    // Basic length check (regex check happens in model validation)
    if (newPassword.length < 10) {
        return res.status(400).json({ success: false, message: "New password must be at least 10 characters long." });
    }

    try {
        const user = await User.findById(userId).select('+password'); // Need password to compare
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Verify current password against the hashed password in DB
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Incorrect current password." });
        }

        // Update password (Mongoose pre-save hook will: 1. Check reuse, 2. Hash, 3. Update history)
        user.password = newPassword;
        await user.save();

        return res.status(200).json({ success: true, message: "Password changed successfully!" });

    } catch (error) {
        console.error("Error in changePassword:", error);

        // Security: Handle errors from model middleware (Complexity, Reuse)
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        if (error.message.includes("Password cannot be")) {
            return res.status(400).json({ success: false, message: error.message });
        }

        return res.status(500).json({ success: false, message: "Server error during password change." });
    }
};

// ⭐ NEW: Update User Profile (for logged-in users) ⭐
/**
 * Update user profile details.
 * @route PUT /api/auth/update-profile
 * @access Private
 */
// Logout User
exports.logoutUser = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        });

        // If user is authenticated (req.user exists), log it
        if (req.user) {
            await logAction({ userId: req.user._id, action: 'LOGOUT', entity: 'User', entityId: req.user._id }, req);
        }

        return res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout Error:", error);
        return res.status(500).json({ success: false, message: "Server error during logout" });
    }
};

exports.updateProfile = async (req, res) => {
    // ... (rest of updateProfile)

    // `req.user` is populated by the `authenticateUser` middleware
    const userId = req.user._id;
    const { fullName, email, phoneNumber } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // --- Important: Handle email change to prevent duplicate emails ---
        if (email && email !== user.email) {
            const existingUserWithEmail = await User.findOne({ email });
            // If another user already has this email (and it's not the current user's ID)
            if (existingUserWithEmail && String(existingUserWithEmail._id) !== String(userId)) {
                return res.status(400).json({ success: false, message: "Email already in use by another account." });
            }
        }

        // Update fields if they are provided in the request body (and are different)
        if (fullName !== undefined && fullName !== user.fullName) user.fullName = fullName;
        if (email !== undefined && email !== user.email) user.email = email;
        if (phoneNumber !== undefined && phoneNumber !== user.phoneNumber) user.phoneNumber = phoneNumber;
        await user.save();

        // Only save if there were actual changes to avoid unnecessary writes
        //



        // Return the updated user object, excluding the password
        const { password: _, ...userWithoutPassword } = user.toObject();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully!",
            user: userWithoutPassword
        });

    } catch (error) {
        console.error("Error in updateProfile:", error);
        // Handle Mongoose validation errors or other server errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        return res.status(500).json({ success: false, message: "Server error during profile update." });
    }
};