/**
 * @fileoverview Purchase routes for managing ticket purchases
 * Handles purchase processing, ticket retrieval, and purchase cancellation
 */

const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const { validatePurchase } = require('../middleware/validators');
const { authenticate } = require('../middleware/auth');
const { purchaseLimiter } = require('../middleware/rateLimiter');

/**
 * Process ticket purchase
 * @route POST /api/purchases
 * @access Private
 * @returns {Object} 200 - Purchase processed successfully
 * @returns {Object} 400 - Invalid purchase data
 */
router.post('/', authenticate, purchaseLimiter, validatePurchase, purchaseController.processPurchase);

/**
 * Get user's purchased tickets
 * @route GET /api/purchases/user/:userId
 * @access Private
 * @param {string} userId - User ID
 * @returns {Object} 200 - Array of user's tickets
 * @returns {Object} 404 - User not found
 */
router.get('/user/:userId', authenticate, purchaseController.getUserTickets);

/**
 * Cancel purchase
 * @route DELETE /api/purchases/:purchaseId
 * @access Private
 * @param {string} purchaseId - Purchase ID
 * @returns {Object} 200 - Purchase cancelled successfully
 * @returns {Object} 404 - Purchase not found
 */
router.delete('/:purchaseId', authenticate, purchaseLimiter, purchaseController.cancelPurchase);

module.exports = router;
