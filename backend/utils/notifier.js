const Notification = require('../models/Notification');
const { sendEmail } = require('./sendEmail');

/**
 * Send dual notifications (Email + In-App)
 * @param {Object} params - { userId, email, subject, text, html, type, link }
 */
const notify = async ({ userId, email, subject, text, html, type = 'INFO', link = '' }) => {
    try {
        // 1. In-App Notification
        if (userId) {
            await Notification.create({
                recipient: userId,
                title: subject,
                message: text,
                type,
                link
            });
        }

        // 2. Email Notification
        if (email) {
            await sendEmail(email, subject, text, html);
        }
    } catch (error) {
        console.error('Notification error:', error);
    }
};

module.exports = { notify };
