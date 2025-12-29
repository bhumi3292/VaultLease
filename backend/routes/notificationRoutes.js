const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { authenticateUser } = require('../middlewares/auth');

// Get all notifications for current user
router.get('/', authenticateUser, async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.status(200).json({ success: true, count: notifications.length, data: notifications });
    } catch (error) {
        res.status(500).json({ success: true, message: error.message });
    }
});

// Mark notification as read
router.put('/:id/read', authenticateUser, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user._id },
            { isRead: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
        res.status(200).json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Mark all as read
router.put('/read-all', authenticateUser, async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, isRead: false },
            { isRead: true }
        );
        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
