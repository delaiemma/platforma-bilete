/**
 * @file Chatbot Controller
 * @description Handles chatbot API endpoints for messaging and status
 */

const { getChatbotResponse, getChatbotStatus, getSuggestedQuestions, saveConversation } = require('../services/chatbotService');

/**
 * Handles chatbot message requests
 *
 * @param {Object} req - Express request object with message in body
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {400} If message is missing or invalid
 * @throws {500} If chatbot processing fails
 */
exports.sendMessage = async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const userId = req.user ? req.user.id : null;

    const response = await getChatbotResponse(message, conversationHistory || []);

    if (response.success) {
      await saveConversation(userId, message, response);
    }

    res.json({
      success: true,
      message: response.response,
      intent: response.intent,
      confidence: response.confidence,
      type: response.type,
      metadata: response.metadata || null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Chatbot controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process message',
      error: error.message
    });
  }
};

/**
 * Gets chatbot status and configuration
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */
exports.getStatus = (req, res) => {
  try {
    const status = getChatbotStatus();

    res.json({
      success: true,
      ...status
    });

  } catch (error) {
    console.error('❌ Error getting chatbot status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chatbot status'
    });
  }
};

/**
 * Gets suggested questions for the chatbot
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */
exports.getSuggestions = (req, res) => {
  try {
    const suggestions = getSuggestedQuestions();

    res.json({
      success: true,
      suggestions
    });

  } catch (error) {
    console.error('❌ Error getting suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get suggestions'
    });
  }
};
