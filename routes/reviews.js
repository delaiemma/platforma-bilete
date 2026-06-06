/**
 * @fileoverview Review routes for managing event reviews and ratings
 * Handles review retrieval, creation, updates, and deletion
 */

const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate, JWT_SECRET } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

const optionalAuth = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return next();
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (!err) req.user = decoded;
        next();
    });
};

/**
 * Get reviews for an event
 * @route GET /api/reviews/event/:eventId
 * @access Public
 * @param {string} eventId - Event ID
 * @returns {Object} 200 - Array of event reviews
 * @returns {Object} 404 - Event not found
 */
router.get('/event/:eventId', optionalAuth, reviewController.getEventReviews);

/**
 * Create or update review for an event
 * @route POST /api/reviews/event/:eventId
 * @access Private
 * @param {string} eventId - Event ID
 * @returns {Object} 200 - Created or updated review
 * @returns {Object} 400 - Invalid review data
 */
router.post('/event/:eventId', authenticate, reviewController.createOrUpdateReview);

/**
 * Delete review
 * @route DELETE /api/reviews/:reviewId
 * @access Private
 * @param {string} reviewId - Review ID
 * @returns {Object} 200 - Review deleted successfully
 * @returns {Object} 404 - Review not found
 */
router.delete('/:reviewId', authenticate, reviewController.deleteReview);

module.exports = router;
