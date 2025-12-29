const AuditLog = require('../models/AuditLog');
const ApiResponse = require('../utils/api_response');

const getAuditLogs = async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;

        const logs = await AuditLog.find()
            .populate('user', 'fullName email role')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await AuditLog.countDocuments();

        return res.status(200).json(new ApiResponse(200, {
            logs,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        }, "Audit logs retrieved"));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, null, error.message));
    }
};

module.exports = { getAuditLogs };
