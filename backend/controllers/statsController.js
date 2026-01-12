const User = require('../models/User');
const Space = require('../models/Space'); // Using Space model for Assets
const Payment = require('../models/payment'); // Assuming Payment model exists
const AuditLog = require('../models/AuditLog');

exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalAssets = await Space.countDocuments();
        const totalPayments = await Payment.countDocuments();
        // Calculate total revenue from completed payments
        const revenueAgg = await Payment.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

        // Get recent log activity (e.g., login counts for last 7 days for a chart)
        // For simplicity, just return raw counts for now.

        return res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalAssets,
                totalPayments,
                totalRevenue
            }
        });
    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ... existing exports
