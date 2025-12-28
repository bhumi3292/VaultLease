const jwt = require("jsonwebtoken");
const Asset = require("../models/Asset");

// Define authenticateUser function
const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Access token missing or invalid" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ success: false, message: "Token expired. Please login again." });
        }
        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ success: false, message: "Invalid token. Please login again." });
        }
        return res.status(401).json({ success: false, message: "Authentication failed." });
    }
};

// Define isAdministrator function
const isAdministrator = (req, res, next) => {
    if (req.user && (req.user.role === "ADMINISTRATOR" || req.user.role === "ADMIN")) {
        next();
    } else {
        return res.status(403).json({ success: false, message: "Access denied: Administrator only" });
    }
};

// Define isAssetAdministrator function
const isAssetAdministrator = async (req, res, next) => {
    try {
        const asset = await Asset.findById(req.params.id);
        if (!asset) {
            return res.status(404).json({ success: false, message: "Asset not found" });
        }

        // Check if the user is the administrator of the asset OR is an Admin
        if (asset.administrator.toString() !== req.user._id && req.user.role !== "ADMIN") {
            return res.status(403).json({ success: false, message: "Access denied: You do not manage this asset" });
        }

        next();
    } catch (error) {
        console.error("Error in isAssetAdministrator:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// Export the functions AFTER they have been defined
// Export the functions AFTER they have been defined
module.exports = {
    authenticateUser,
    isAdministrator,
    isAssetAdministrator,
};