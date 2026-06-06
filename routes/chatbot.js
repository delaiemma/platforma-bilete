/**
 * @fileoverview Chatbot routes for AI-powered customer support
 * Handles messaging, status, and suggestions endpoints
 */

const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for chatbot messages
 * Prevents abuse and controls costs if using OpenAI
 */
const chatbotLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Prea multe mesaje. Te rog așteaptă un minut.',
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Send message to chatbot
 * @route POST /api/chatbot/message
 * @access Public
 * @body {string} message - User's message
 * @body {Array} conversationHistory - Optional conversation history
 * @returns {Object} 200 - Bot response
 * @returns {Object} 400 - Invalid message
 * @returns {Object} 429 - Too many requests
 */
router.post('/message', chatbotLimiter, chatbotController.sendMessage);

/**
 * Get chatbot status and configuration
 * @route GET /api/chatbot/status
 * @access Public
 * @returns {Object} 200 - Chatbot status
 */
router.get('/status', chatbotController.getStatus);

/**
 * Get suggested questions
 * @route GET /api/chatbot/suggestions
 * @access Public
 * @returns {Object} 200 - Array of suggested questions
 */
router.get('/suggestions', chatbotController.getSuggestions);

module.exports = router;
