/**
 * @fileoverview Favourites routes for managing user's favourite events
 * Handles retrieval, addition, and removal of favourite events
 */

const express = require('express');
const router = express.Router();
const favouriteController = require('../controllers/favouriteController');
const { authenticate } = require('../middleware/auth');

/**
 * Get user's favourite events
 * @route GET /api/favourites/:userId
 * @access Private
 * @param {string} userId - The user ID
 * @returns {Object} 200 - Array of user's favourite events
 * @returns {Object} 404 - User not found
 */
router.get('/:userId', favouriteController.getUserFavourites);

/**
 * Add event to favourites
 * @route POST /api/favourites
 * @access Public
 * @returns {Object} 200 - Event added to favourites
 * @returns {Object} 400 - Invalid request
 */
router.post('/', favouriteController.addToFavourites);

/**
 * Remove event from favourites
 * @route DELETE /api/favourites
 * @access Public
 * @returns {Object} 200 - Event removed from favourites
 * @returns {Object} 400 - Invalid request
 */
router.delete('/', favouriteController.removeFromFavourites);

module.exports = router;
