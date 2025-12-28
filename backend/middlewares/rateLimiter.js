const rateLimit = require('express-rate-limit');

/**
 * Global Login Rate Limiter
 * Limits repeated login requests from the same IP
 */
const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: "Too many login attempts from this IP, please try again after 15 minutes"
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * OTP Verification Rate Limiter
 * Stricter limits for OTP verification to prevent brute-forcing codes
 */
const otpRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // Limit each IP to 3 OTP verification attempts per windowMs
    message: {
        success: false,
        message: "Too many OTP verification attempts, please try again later"
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    loginRateLimiter,
    otpRateLimiter
};
