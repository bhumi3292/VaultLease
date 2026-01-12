const rateLimit = require('express-rate-limit');

// General Limiter (already exist in index.js, but good to have here)
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});

// Sensitive Action Limiter (Booking, borrowing, etc.)
const sensitiveLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50, // Stricter limit for critical actions preventing abuse
    message: "Too many sensitive actions created from this IP, please try again after 15 minutes",
    standardHeaders: true,
    legacyHeaders: false,
});

// Payment Limiter (Very strict)
const paymentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Only 10 payment checks/initiations per hour to prevent fraud scanning
    message: "Payment rate limit exceeded. Please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
});

// Admin Route Limiter
// While admins are trusted, we limit to prevent compromised admin accounts from mass-scraping or destroying data quickly
const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    generalLimiter,
    sensitiveLimiter,
    paymentLimiter,
    adminLimiter
};
