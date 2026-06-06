/**
 * @fileoverview Seat routes for managing seat reservations and ticket verification
 * Handles seat reservation, availability checks, ticket management, and verification
 */

const express = require('express');
const router = express.Router();
const seatController = require('../controllers/seatController');
const { authenticate } = require('../middleware/auth');

/**
 * Reserve seats for an event
 * @route POST /api/seats/reserve
 * @access Private
 * @returns {Object} 200 - Seats reserved successfully
 * @returns {Object} 400 - Seats unavailable or invalid request
 */
router.post('/reserve', authenticate, seatController.reserveSeats);

/**
 * Unreserve seats
 * @route POST /api/seats/unreserve
 * @access Private
 * @returns {Object} 200 - Seats unreserved successfully
 * @returns {Object} 400 - Invalid request
 */
router.post('/unreserve', authenticate, seatController.unreserveSeats);

/**
 * Extend seat reservation time
 * @route POST /api/seats/extend-reservation
 * @access Private
 * @returns {Object} 200 - Reservation extended successfully
 * @returns {Object} 400 - Invalid request or reservation expired
 */
router.post('/extend-reservation', authenticate, seatController.extendReservation);

/**
 * Get seat availability for an event
 * @route GET /api/seats/event/:eventId/availability
 * @access Public
 * @param {string} eventId - Event ID
 * @returns {Object} 200 - Seat availability map
 * @returns {Object} 404 - Event not found
 */
router.get('/event/:eventId/availability', seatController.getSeatAvailability);

/**
 * Get user's seat reservations
 * @route GET /api/seats/user/:userId/reservations
 * @access Private
 * @param {string} userId - User ID
 * @returns {Object} 200 - Array of user's active reservations
 * @returns {Object} 404 - User not found
 */
router.get('/user/:userId/reservations', authenticate, seatController.getUserReservations);

/**
 * Get user's tickets
 * @route GET /api/seats/user/:userId/tickets
 * @access Private
 * @param {string} userId - User ID
 * @returns {Object} 200 - Array of user's tickets
 * @returns {Object} 404 - User not found
 */
router.get('/user/:userId/tickets', authenticate, seatController.getUserTickets);

/**
 * Verify ticket validity
 * @route GET /api/seats/verify/:ticketId
 * @access Public
 * @param {string} ticketId - Ticket ID
 * @returns {Object} 200 - Ticket verification result
 * @returns {Object} 404 - Ticket not found
 */
router.get('/verify/:ticketId', seatController.verifyTicket);

router.post('/event/:eventId/recommend', seatController.recommendSeats);

module.exports = router;
