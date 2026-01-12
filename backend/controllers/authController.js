const User = require("../models/User");
const AuditLog = require("../models/AuditLog"); // Import AuditLog model
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/sendEmail"); // Assuming this utility exists

// Helper to create audit log
const createAuditLog = async (userId, action, req, details = '') => {
    try {
        const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];
        await AuditLog.create({
            user: userId,
            action,
            ipAddress,
            userAgent,
            details
        });
    } catch (err) {
        console.error("Failed to create audit log:", err);
    }
};

// Register User (existing)
exports.registerUser = async (req, res) => {
    const { fullName, email, phoneNumber, stakeholder, department, universityId, password, confirmPassword } = req.body;

    if (!fullName || !email || !phoneNumber || !stakeholder || !password || !confirmPassword || !universityId) {
        return res.status(400).json({ success: false, message: "Please fill all the fields" });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    // Role Validation: Allow only Administrator or Student
    if (!["Administrator", "Student"].includes(stakeholder)) {
        return res.status(400).json({ success: false, message: "Role must be 'Administrator' or 'Student'." });
    }

    // Conditionally Require Department for Administrators
    if (stakeholder === "Administrator" && !department) {
        return res.status(400).json({ success: false, message: "Department is required for Administrator accounts." });
    }

    // Strict Admin Block (Double Safety)
    if (stakeholder === "Admin") {
        return res.status(403).json({ success: false, message: "Admin account cannot be created via signup." });
    }

    // Password Complexity Check
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
        });
    }

    try {
        console.log("Registering user:", email);
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already in use" });
        }

        const newUser = new User({
            fullName,
            email,
            phoneNumber,
            role: stakeholder === "Administrator" ? "ADMINISTRATOR" : stakeholder, // Normalize Administrator to Upper case as per requested format
            department: stakeholder === 'Administrator' ? department : null,
            universityId: universityId,
            password // User model pre-save hook should handle hashing
        });

        console.log("Saving new user to database...");
        await newUser.save();
        console.log("New user saved successfully.");

        // Log Registration
        console.log("Creating audit log...");
        await createAuditLog(newUser._id, 'REGISTER', req, `User registered as ${newUser.role}`);
        console.log("Audit log process completed.");

        return res.status(201).json({ success: true, message: "User registered successfully" });
    } catch (err) {
        console.error("Registration Error:", err);
        // More specific error handling for database issues if needed
        return res.status(500).json({ success: false, message: "Server error during registration." });
    }
};

// Login User (existing)
// Login User (Enhanced with OTP & Lockout)
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // 1. Check if account is locked
        if (user.lockUntil && user.lockUntil > Date.now()) {
            return res.status(403).json({
                success: false,
                message: "Account is temporarily locked due to multiple failed login attempts. Please try again later."
            });
        }

        // 2. Verify Password
        const passwordMatch = await user.comparePassword(password);

        if (!passwordMatch) {
            // Increment failed attempts
            user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

            // Check if limit reached (e.g., 5 attempts)
            if (user.failedLoginAttempts >= 5) {
                user.lockUntil = Date.now() + 15 * 60 * 1000; // Lock for 15 minutes
                user.failedLoginAttempts = 0; // Reset attempts after locking
                await user.save();
                return res.status(403).json({ success: false, message: "Account locked due to 5 failed attempts. Try again in 15 minutes." });
            }

            await user.save();
            return res.status(401).json({ success: false, message: `Invalid credentials. Attempts left: ${5 - user.failedLoginAttempts}` });
        }

        // 3. Reset failed attempts on success
        user.failedLoginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();

        // 4. Password Expiration Check (90 days)
        const passwordAge = user.passwordChangedAt ? (Date.now() - new Date(user.passwordChangedAt).getTime()) : 0;
        const ninetyDays = 90 * 24 * 60 * 60 * 1000;

        if (passwordAge > ninetyDays) {
            return res.status(403).json({
                success: false,
                message: "Your password has expired (older than 90 days). Please reset it via 'Forgot Password' to proceed."
            });
        }

        // --- SESSION ANOMALY DETECTION ---
        const currentIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const currentUserAgent = req.headers['user-agent'];
        let isAnomaly = false;

        // Check for anomalies if previous login data exists
        if (user.lastLoginIp && user.lastLoginIp !== currentIp) {
            console.warn(`[SECURITY ALERT] IP Anomaly for user ${user.email}. Prev: ${user.lastLoginIp}, Curr: ${currentIp}`);
            isAnomaly = true;
            await createAuditLog(user._id, 'SECURITY_ALERT', req, `IP Address Change Detected from ${user.lastLoginIp} to ${currentIp}`);
        }

        // --- ROLE-BASED MFA & ANOMALY ENFORCEMENT ---
        // Admin/Administrator MUST use MFA. Students use MFA if enabled or if anomaly detected.
        const isAdmin = ["Admin", "Administrator", "ADMIN", "ADMINISTRATOR"].includes(user.role);
        const requiresMfa = isAdmin || user.isMFAEnabled || isAnomaly;

        if (requiresMfa) {
            // 5. Generate OTP
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            user.otp = otpCode;
            user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes expiry
            await user.save();

            // Send OTP via Email
            const subject = "VaultLease Login OTP";
            const text = `Your OTP for login is: ${otpCode}. It expires in 5 minutes.`;
            const html = `<p>Your OTP for VaultLease login is: <b>${otpCode}</b></p><p>It expires in 5 minutes.</p>`;

            try {
                await sendEmail(user.email, subject, text, html);
            } catch (emailErr) {
                console.error("Failed to send OTP email:", emailErr);
                return res.status(500).json({ success: false, message: "Failed to send OTP. Please try again." });
            }

            return res.status(200).json({
                success: true,
                message: isAnomaly ? "Unusual activity detected. OTP sent to email." : "OTP sent to your email. Please verify.",
                requiresOtp: true,
                userId: user._id,
                email: user.email
            });
        }

        // NO MFA REQUIRED: Issue Token Directly (Existing Flow Logic)
        const payload = {
            _id: user._id,
            email: user.email,
            role: user.role,
            tokenVersion: user.tokenVersion // Include token version
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
        const { password: _, ...userWithoutPassword } = user.toObject();

        // Update Session Info
        user.lastLoginIp = currentIp;
        user.lastLoginUserAgent = currentUserAgent;
        await user.save();

        const loginTime = new Date().toLocaleString();
        await createAuditLog(user._id, 'LOGIN', req, `User logged in directly at ${loginTime}`);

        const options = {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
        };

        return res.status(200).cookie('token', token, options).json({
            success: true,
            message: "Login successful",
            user: userWithoutPassword
        });

    } catch (err) {
        console.error("Login Error Details:", err);
        return res.status(500).json({ success: false, message: "Server error during login." });
    }
};

// Verify OTP and Issue Token
exports.verifyOtp = async (req, res) => {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
        return res.status(400).json({ success: false, message: "User ID and OTP are required" });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check if OTP exists and matches
        if (!user.otp || user.otp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        // Check if OTP is expired
        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ success: false, message: "OTP has expired" });
        }

        // OTP Valid: Clear OTP fields
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        // Issue Token
        const payload = {
            _id: user._id,
            email: user.email,
            role: user.role,
            tokenVersion: user.tokenVersion // Include token version
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
        const { password: _, ...userWithoutPassword } = user.toObject();

        // Update Session Info
        user.lastLoginIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        user.lastLoginUserAgent = req.headers['user-agent'];
        await user.save();

        // Log Successful Login
        const loginTime = new Date().toLocaleString();
        await createAuditLog(user._id, 'LOGIN', req, `User logged in via OTP at ${loginTime}`);

        // Set secure cookie
        const options = {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            httpOnly: true, // Prevent client-side JS access
            secure: process.env.NODE_ENV === 'production', // Only secure in prod
            sameSite: 'lax', // CSRF protection
            path: '/' // Explicitly set path to root to avoid path-scoping issues
        };

        return res.status(200).cookie('token', token, options).json({
            success: true,
            message: "Login successful",
            // token, // Removed from body for security
            user: userWithoutPassword
        });

    } catch (err) {
        console.error("OTP Verification Error:", err);
        return res.status(500).json({ success: false, message: "Server error during verification." });
    }
};

// Resend OTP
exports.resendOtp = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otpCode;
        user.otpExpires = Date.now() + 5 * 60 * 1000;
        await user.save();

        await sendEmail(user.email, "VaultLease Login OTP (Resend)", `Your OTP is: ${otpCode}`, `<p>Your OTP is: <b>${otpCode}</b></p>`);

        return res.status(200).json({ success: true, message: "OTP resent successfully" });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Failed to resend OTP" });
    }
}; // Logic: Find user, Check Lock, Verify Pass, Gen OTP, Ret OTP_SENT

// Logout User
exports.logoutUser = async (req, res) => {
    // Clear cookie
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    // Since JWT is stateless, we primarily log the action. 
    // The frontend handles token removal.
    // user property should be available if authenticated middleware is used
    if (req.user) {
        // Invalidate tokens by incrementing version
        req.user.tokenVersion = (req.user.tokenVersion || 0) + 1;
        await req.user.save();

        const logoutTime = new Date().toLocaleString();
        await createAuditLog(req.user._id, 'LOGOUT', req, `User logged out at ${logoutTime}`);
    }
    return res.status(200).json({ success: true, message: "Logged out successfully" });
};

// Find User ID by Credentials (restored)
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
            <p><a href="${resetUrl}" style="background-color: #007979; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Your Password</a></p>
            <p>This link is valid for <b>1 hour</b>.</p>
            <p>If you did not request this, please ignore this email.</p>
            <p>Thank you,<br/>VaultLease Support</p>
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

    if (newPassword.length < 8) {
        return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found or token is invalid.' });
        }

        // Check Password History
        if (user.passwordHistory && user.passwordHistory.length > 0) {
            const bcrypt = require('bcryptjs');
            for (let oldPassHash of user.passwordHistory) {
                const isUsedBefore = await bcrypt.compare(newPassword, oldPassHash);
                if (isUsedBefore) {
                    return res.status(400).json({ success: false, message: "New password cannot be the same as your recent passwords." });
                }
            }
        }

        // Add current password to history
        if (!user.passwordHistory) user.passwordHistory = [];
        user.passwordHistory.push(user.password);

        // Keep only last 5 passwords
        if (user.passwordHistory.length > 5) {
            user.passwordHistory.shift();
        }

        user.password = newPassword;
        user.passwordChangedAt = Date.now();
        await user.save();

        await createAuditLog(user._id, 'CHANGE_PASSWORD', req, 'Password reset via email link');

        return res.status(200).json({ success: true, message: 'Password has been reset successfully.' });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ success: false, message: 'Reset link expired. Please request a new one.' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({ success: false, message: 'Invalid reset token. Please request a new one.' });
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

    if (newPassword.length < 8) {
        return res.status(400).json({ success: false, message: "New password must be at least 8 characters long." });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Verify current password against the hashed password in DB
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Incorrect current password." });
        }

        // Check Password History
        if (user.passwordHistory && user.passwordHistory.length > 0) {
            const bcrypt = require('bcryptjs'); // Ensure bcrypt is available
            for (let oldPassHash of user.passwordHistory) {
                const isUsedBefore = await bcrypt.compare(newPassword, oldPassHash);
                if (isUsedBefore) {
                    return res.status(400).json({ success: false, message: "New password cannot be the same as your recent passwords." });
                }
            }
        }

        // Add current password to history before changing
        if (!user.passwordHistory) user.passwordHistory = [];
        user.passwordHistory.push(user.password);

        // Keep only last 5 passwords
        if (user.passwordHistory.length > 5) {
            user.passwordHistory.shift(); // Remove oldest
        }

        // Update password (Mongoose pre-save hook should handle hashing the new password)
        user.password = newPassword;
        user.passwordChangedAt = Date.now();
        await user.save();

        await createAuditLog(user._id, 'CHANGE_PASSWORD', req, 'Password changed from profile');

        return res.status(200).json({ success: true, message: "Password changed successfully!" });

    } catch (error) {
        console.error("Error in changePassword:", error);
        return res.status(500).json({ success: false, message: "Server error during password change." });
    }
};

// ⭐ NEW: Update User Profile (for logged-in users) ⭐
exports.updateProfile = async (req, res) => {
    // `req.user` is populated by the `authenticateUser` middleware
    const userId = req.user._id;
    const { fullName, email, phoneNumber } = req.body;
    console.log(req.body)

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

        await createAuditLog(user._id, 'UPDATE_PROFILE', req, 'User profile updated');

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