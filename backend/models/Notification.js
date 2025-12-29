const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['INFO', 'SUCCESS', 'WARNING', 'URGENT'],
        default: 'INFO'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    link: {
        type: String // Optional link to a request or asset
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
