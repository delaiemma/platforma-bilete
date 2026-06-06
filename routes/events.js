/**
 * @fileoverview Event routes for managing events and their layouts
 * Handles event CRUD operations, searching, filtering, and venue layout assignments
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const eventController = require('../controllers/eventController');
const { validateCreateEvent, validateUpdateEvent, validateEventId } = require('../middleware/validators');
const { authenticate } = require('../middleware/auth');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

/**
 * Get upcoming events
 * @route GET /api/events/upcoming
 * @access Public
 * @returns {Object} 200 - Array of upcoming events
 */
router.get('/upcoming', eventController.getUpcomingEvents);

/**
 * Get past events
 * @route GET /api/events/past
 * @access Public
 * @returns {Object} 200 - Array of past events
 */
router.get('/past', eventController.getPastEvents);

/**
 * Search events by query parameters
 * @route GET /api/events/search
 * @access Public
 * @returns {Object} 200 - Array of matching events
 */
router.get('/search', eventController.searchEvents);

/**
 * Get distinct cities where events are held
 * @route GET /api/events/cities
 * @access Public
 * @returns {Object} 200 - Array of unique city names
 */
router.get('/cities', eventController.getDistinctCities);

/**
 * Get all events
 * @route GET /api/events
 * @access Public
 * @returns {Object} 200 - Array of all events
 */
router.get('/', eventController.getAllEvents);

/**
 * Get event by ID
 * @route GET /api/events/:id
 * @access Public
 * @param {string} id - Event ID
 * @returns {Object} 200 - Event details
 * @returns {Object} 404 - Event not found
 */
router.get('/:id', validateEventId, eventController.getEventById);

/**
 * Create a new event
 * @route POST /api/events
 * @access Admin
 * @returns {Object} 201 - Created event
 * @returns {Object} 400 - Invalid event data
 */
router.post('/', upload.single('image'), validateCreateEvent, eventController.createEvent);

/**
 * Update event
 * @route PUT /api/events/:id
 * @access Private
 * @param {string} id - Event ID
 * @returns {Object} 200 - Updated event
 * @returns {Object} 404 - Event not found
 */
router.put('/:id', validateEventId, upload.single('image'), authenticate, validateUpdateEvent, eventController.updateEvent);

/**
 * Delete event
 * @route DELETE /api/events/:id
 * @access Admin
 * @param {string} id - Event ID
 * @returns {Object} 200 - Event deleted successfully
 * @returns {Object} 404 - Event not found
 */
router.delete('/:id', validateEventId, eventController.deleteEvent);

/**
 * Get event layout
 * @route GET /api/events/:id/layout
 * @access Public
 * @param {string} id - Event ID
 * @returns {Object} 200 - Event layout details
 * @returns {Object} 404 - Event or layout not found
 */
router.get('/:id/layout', validateEventId, eventController.getEventLayout);

/**
 * Assign layout to event
 * @route POST /api/events/:id/layout
 * @access Admin
 * @param {string} id - Event ID
 * @returns {Object} 200 - Layout assigned successfully
 * @returns {Object} 400 - Invalid layout data
 */
router.post('/:id/layout', validateEventId, eventController.assignLayout);

/**
 * Update layout pricing for event
 * @route PUT /api/events/:id/layout/pricing
 * @access Admin
 * @param {string} id - Event ID
 * @returns {Object} 200 - Pricing updated successfully
 * @returns {Object} 400 - Invalid pricing data
 */
router.put('/:id/layout/pricing', validateEventId, eventController.updateLayoutPricing);

/**
 * Remove layout from event
 * @route DELETE /api/events/:id/layout
 * @access Admin
 * @param {string} id - Event ID
 * @returns {Object} 200 - Layout removed successfully
 * @returns {Object} 404 - Event not found
 */
router.delete('/:id/layout', validateEventId, eventController.removeLayout);

module.exports = router;
