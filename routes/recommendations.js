/**
 * @fileoverview Recommendation routes for providing personalized event suggestions
 * Handles event recommendations based on user preferences and behavior
 */

const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');

/**
 * Get event recommendations
 * @route GET /api/recommendations
 * @access Public
 * @returns {Object} 200 - Array of recommended events
 */
router.get('/', recommendationController.getRecommendations);

module.exports = router;
