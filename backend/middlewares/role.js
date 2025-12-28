// middlewares/role.js
const roleCheck = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized: No user found" });
        }

        // Normalize roles to avoid case-sensitivity issues
        const userRole = req.user.role;
        const allowed = allowedRoles.map(role => role);

        if (!allowed.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: `Forbidden: You do not have the necessary permissions. Required: ${allowed.join(" or ")}`
            });
        }

        next();
    };
};

module.exports = roleCheck;
