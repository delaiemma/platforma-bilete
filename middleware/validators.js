/**
 * Request validation middleware using express-validator
 * @module middleware/validators
 */

const { body, param, validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors from express-validator
 * @function handleValidationErrors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 * @description Collects validation errors and returns 400 response if any exist
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().reduce((acc, error) => {
                acc[error.path] = error.msg;
                return acc;
            }, {})
        });
    }
    next();
};

/**
 * Validation middleware for creating new events
 * @constant {Array} validateCreateEvent
 * @description Validates title, location, city, date, time, price, tickets, type, and description
 */
const validateCreateEvent = [
    body('title')
        .trim()
        .notEmpty().withMessage('Event title is required')
        .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),

    body('location')
        .trim()
        .notEmpty().withMessage('Location is required')
        .isLength({ max: 200 }).withMessage('Location must not exceed 200 characters'),

    body('city')
        .trim()
        .notEmpty().withMessage('City is required')
        .isLength({ max: 100 }).withMessage('City must not exceed 100 characters'),

    body('date')
        .notEmpty().withMessage('Date is required')
        .isISO8601().withMessage('Invalid date format'),

    body('time')
        .notEmpty().withMessage('Time is required')
        .matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/).withMessage('Invalid time format (HH:MM)'),

    body('price')
        .notEmpty().withMessage('Price is required')
        .isFloat({ min: 0 }).withMessage('Price must be a positive number'),

    body('available_tickets')
        .notEmpty().withMessage('Available tickets is required')
        .isInt({ min: 1, max: 10000 }).withMessage('Available tickets must be between 1 and 10,000'),

    body('type')
        .notEmpty().withMessage('Event type is required')
        .isIn(['Concert', 'Theater', 'Cinema', 'Exhibition', 'Seminar', 'General', 'Festival', 'Party', 'Sports']).withMessage('Invalid event type'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 5000 }).withMessage('Description must not exceed 5000 characters'),

    handleValidationErrors
];

/**
 * Validation middleware for updating existing events
 * @constant {Array} validateUpdateEvent
 * @description Validates optional fields for event updates
 */
const validateUpdateEvent = [
    body('title')
        .optional()
        .trim()
        .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),

    body('location')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('Location must not exceed 200 characters'),

    body('city')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('City must not exceed 100 characters'),

    body('date')
        .optional()
        .isISO8601().withMessage('Invalid date format'),

    body('time')
        .optional()
        .matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/).withMessage('Invalid time format (HH:MM)'),

    body('price')
        .optional()
        .isFloat({ min: 0 }).withMessage('Price must be a positive number'),

    body('available_tickets')
        .optional()
        .isInt({ min: 1, max: 10000 }).withMessage('Available tickets must be between 1 and 10,000'),

    body('type')
        .optional()
        .isIn(['Concert', 'Theater', 'Cinema', 'Exhibition', 'Seminar', 'General', 'Festival', 'Party', 'Sports']).withMessage('Invalid event type'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 5000 }).withMessage('Description must not exceed 5000 characters'),

    handleValidationErrors
];

/**
 * Validation middleware for user registration
 * @constant {Array} validateUserRegistration
 * @description Validates name, email, and password for new user accounts
 */
const validateUserRegistration = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

    handleValidationErrors
];

/**
 * Validation middleware for user login
 * @constant {Array} validateUserLogin
 * @description Validates email and password for user authentication
 */
const validateUserLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required'),

    handleValidationErrors
];

/**
 * Validation middleware for ticket purchases
 * @constant {Array} validatePurchase
 * @description Validates userId, events array with eventId and quantity
 */
const validatePurchase = [
    body('userId')
        .notEmpty().withMessage('User ID is required')
        .isInt().withMessage('User ID must be a number'),

    body('events')
        .isArray({ min: 1 }).withMessage('Events array is required and must not be empty'),

    body('events.*.eventId')
        .notEmpty().withMessage('Event ID is required')
        .isInt().withMessage('Event ID must be a number'),

    body('events.*.quantity')
        .optional()
        .isInt({ min: 1, max: 10 }).withMessage('Quantity must be between 1 and 10'),

    handleValidationErrors
];

/**
 * Validation middleware for event ID parameters
 * @constant {Array} validateEventId
 * @description Validates event ID from URL parameters
 */
const validateEventId = [
    param('id')
        .notEmpty().withMessage('Event ID is required')
        .isInt().withMessage('Event ID must be a number'),

    handleValidationErrors
];

module.exports = {
    validateCreateEvent,
    validateUpdateEvent,
    validateUserRegistration,
    validateUserLogin,
    validatePurchase,
    validateEventId,
    handleValidationErrors
};
