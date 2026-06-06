/**
 * @fileoverview Newsletter routes for managing email subscriptions
 * Handles newsletter subscription, unsubscription, and subscriber management
 */

const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');

/**
 * Subscribe to newsletter
 * @route POST /api/newsletter/subscribe
 * @access Public
 * @returns {Object} 200 - Subscription successful
 * @returns {Object} 400 - Invalid email or already subscribed
 */
router.post('/subscribe', newsletterController.subscribe);

/**
 * Unsubscribe from newsletter
 * @route POST /api/newsletter/unsubscribe
 * @access Public
 * @returns {Object} 200 - Unsubscription successful
 * @returns {Object} 400 - Invalid email or not subscribed
 */
router.post('/unsubscribe', newsletterController.unsubscribe);

/**
 * Get all newsletter subscribers
 * @route GET /api/newsletter
 * @access Admin
 * @returns {Object} 200 - Array of all subscribers
 */
router.get('/', newsletterController.getAllSubscribers);

module.exports = router;
