/**
 * @fileoverview Statistics routes for analytics and reporting
 * Provides various statistical data about sales, revenue, events, and purchases
 */

const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');

/**
 * Get statistics overview
 * @route GET /api/statistics/overview
 * @access Admin
 * @returns {Object} 200 - General statistics overview
 */
router.get('/overview', statisticsController.getOverview);

/**
 * Get sales statistics by event
 * @route GET /api/statistics/sales-by-event
 * @access Admin
 * @returns {Object} 200 - Sales data grouped by event
 */
router.get('/sales-by-event', statisticsController.getSalesByEvent);

/**
 * Get revenue over time
 * @route GET /api/statistics/revenue-over-time
 * @access Admin
 * @returns {Object} 200 - Revenue data over time period
 */
router.get('/revenue-over-time', statisticsController.getRevenueOverTime);

/**
 * Get top performing events
 * @route GET /api/statistics/top-events
 * @access Admin
 * @returns {Object} 200 - Array of top events by sales or revenue
 */
router.get('/top-events', statisticsController.getTopEvents);

/**
 * Get event type distribution
 * @route GET /api/statistics/event-types
 * @access Admin
 * @returns {Object} 200 - Statistics by event type
 */
router.get('/event-types', statisticsController.getEventTypes);

/**
 * Get recent purchases
 * @route GET /api/statistics/recent-purchases
 * @access Admin
 * @returns {Object} 200 - Array of recent purchases
 */
router.get('/recent-purchases', statisticsController.getRecentPurchases);

module.exports = router;
