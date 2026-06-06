/**
 * Rate limiting middleware configurations
 * @module middleware/rateLimiter
 */

const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 * @constant {Object} apiLimiter
 * @description Limits general API requests to 10000 per 15 minutes per IP
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10000,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Authentication rate limiter
 * @constant {Object} authLimiter
 * @description Limits authentication attempts to 5 per 15 minutes per IP
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Purchase rate limiter
 * @constant {Object} purchaseLimiter
 * @description Limits purchase attempts to 20 per minute per IP
 */
const purchaseLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    message: {
        success: false,
        message: 'Too many purchase attempts, please slow down'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    apiLimiter,
    authLimiter,
    purchaseLimiter
};
