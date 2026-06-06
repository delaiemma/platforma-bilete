/**
 * @fileoverview Payment routes for processing ticket purchases
 * Handles payment intent creation, confirmation, status checks, and payment history
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { purchaseLimiter } = require('../middleware/rateLimiter');
const { authenticate } = require('../middleware/auth');

/**
 * Create payment intent for purchase
 * @route POST /api/payments/create-intent
 * @access Private
 * @returns {Object} 200 - Payment intent created
 * @returns {Object} 400 - Invalid payment data
 */
router.post('/create-intent', authenticate, purchaseLimiter, paymentController.createPaymentIntent);

/**
 * Confirm payment
 * @route POST /api/payments/confirm
 * @access Private
 * @returns {Object} 200 - Payment confirmed
 * @returns {Object} 400 - Payment confirmation failed
 */
router.post('/confirm', authenticate, paymentController.confirmPayment);

/**
 * Get payment status
 * @route GET /api/payments/status/:paymentIntentId
 * @access Private
 * @param {string} paymentIntentId - Payment intent ID
 * @returns {Object} 200 - Payment status details
 * @returns {Object} 404 - Payment not found
 */
router.get('/status/:paymentIntentId', authenticate, paymentController.getPaymentStatus);

/**
 * Get user's payment history
 * @route GET /api/payments/user/:userId
 * @access Private
 * @param {string} userId - User ID
 * @returns {Object} 200 - Array of user's payments
 * @returns {Object} 404 - User not found
 */
router.get('/user/:userId', authenticate, paymentController.getUserPayments);

module.exports = router;
