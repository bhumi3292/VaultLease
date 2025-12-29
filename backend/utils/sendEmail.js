const nodemailer = require('nodemailer');
require('dotenv').config();

const isTest = process.env.NODE_ENV === 'test';

// Check if credentials are set
const hasCredentials = process.env.EMAIL_USER && process.env.EMAIL_PASS;

const transporter = hasCredentials ? nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS || process.env.Email_APIKEY || process.env.Email_APIKEy // Support user's custom var
    },
    tls: {
        rejectUnauthorized: false // Allow self-signed certs in dev/test
    }
}) : null;

// Function to send email
const sendEmail = async (to, subject, text, html) => {
    if (isTest || !hasCredentials) {
        if (!hasCredentials) {
            console.warn('WARNING: EMAIL_USER or EMAIL_PASS missing. Email sending skipped. Check server logs for OTP/content.');
            console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject} | Content: ${text || 'HTML Content'}`);
        } else {
            console.log(`Mock email sent to ${to} with subject "${subject}"`);
        }
        return { messageId: 'mock-id-no-creds' }; // Fake result to allow flow to continue
    }

    try {
        // Use EMAIL_FROM if provided (e.g., for API keys where user isn't an email), otherwise fallback to EMAIL_USER
        const sender = process.env.EMAIL_FROM || process.env.EMAIL_USER;
        const mailOptions = {
            from: `"VaultLease Support" <${sender}>`,
            to,
            subject,
            text,
            html
        };

        let info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email.');
    }
};

module.exports = { sendEmail };
