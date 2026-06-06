/**
 * @fileoverview Cart routes for managing user shopping cart operations
 * Handles cart retrieval, item addition, updates, and removal
 */

const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');

/**
 * Get user's shopping cart
 * @route GET /api/cart/:userId
 * @access Private
 * @param {string} userId - The user ID
 * @returns {Object} 200 - User's cart with items
 * @returns {Object} 404 - Cart not found
 */
router.get('/:userId', authenticate, cartController.getUserCart);

/**
 * Add item to cart
 * @route POST /api/cart
 * @access Private
 * @returns {Object} 200 - Updated cart
 * @returns {Object} 400 - Invalid request
 */
router.post('/', authenticate, cartController.addToCart);

/**
 * Update cart item quantity or details
 * @route PUT /api/cart
 * @access Private
 * @returns {Object} 200 - Updated cart
 * @returns {Object} 400 - Invalid request
 */
router.put('/', authenticate, cartController.updateCartItem);

/**
 * Remove item from cart
 * @route DELETE /api/cart
 * @access Private
 * @returns {Object} 200 - Updated cart
 * @returns {Object} 400 - Invalid request
 */
router.delete('/', authenticate, cartController.removeFromCart);

module.exports = router;
