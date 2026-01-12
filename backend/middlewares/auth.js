// vaultlease_backend/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticateUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Authentication failed: No token provided." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id || decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({ success: false, message: "Authentication failed: User not found in database." });
        }

        req.user = user;
        next();

    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ success: false, message: "Token expired. Please login again." });
        }
        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ success: false, message: "Invalid token. Please login again." });
        }
        console.error("Authentication Error:", err); // Log the specific error for debugging
        return res.status(401).json({ success: false, message: "Authentication failed: Internal server error." });
    }
};

const requireRole = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized. Please authenticate first." });
        }

        const userRole = req.user.role ? req.user.role.toLowerCase() : '';
        const required = requiredRole.toLowerCase();

        // Allow 'Admin' to access 'Administrator' routes and vice-versa if needed, 
        // essentially treating them as the same permission level.
        if (userRole === required ||
            (required === 'administrator' && userRole === 'admin') ||
            (required === 'admin' && userRole === 'administrator')) {
            next();
        } else {
            return res.status(403).json({ success: false, message: `Access denied: ${requiredRole} role required.` });
        }
    };
};

module.exports = {
    authenticateUser,
    requireRole,
};