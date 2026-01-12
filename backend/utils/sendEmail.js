const nodemailer = require('nodemailer');
require('dotenv').config();

const isTest = process.env.NODE_ENV === 'test';

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false // Allow self-signed certs in dev/test
    }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
    if (isTest) {
        console.log(`Mock email sent to ${to} with subject "${subject}"`);
        return { messageId: 'mock-id' }; // Fake result for test
    }

    try {
        const mailOptions = {
            from: `"VaultLease Support" <${process.env.EMAIL_USER}>`,
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
        // In development, if email fails (likely due to missing credentials), 
        // fallback to logging the content so the developer can still proceed.
        if (process.env.NODE_ENV !== 'production') {
            console.log("=================================================");
            console.log("             FALLBACK EMAIL LOGGER               ");
            console.log("=================================================");
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`Body: ${text}`);
            console.log("=================================================");
            return { messageId: 'fallback-log' };
        }
        throw new Error('Failed to send email.');
    }
};

module.exports = { sendEmail };
