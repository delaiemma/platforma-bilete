/**
 * @fileoverview Main Chatbot Service - Hybrid Architecture
 * Combines rule-based and OpenAI responses with intelligent fallback
 *
 * MODES:
 * - 'rules': Rule-based only (default for March-April)
 * - 'ai': OpenAI GPT-3.5 (activate in April 2026)
 * - 'hybrid': Try rules first, fallback to AI (recommended)
 *
 * Set mode in .env: CHATBOT_MODE=rules|ai|hybrid
 */

const { getRuleBasedResponse, getSuggestedQuestions, validateMessage } = require('./ruleBasedChatbot');
const { getOpenAIResponse, isOpenAIConfigured } = require('./openaiChatbot');

/**
 * Gets chatbot mode from environment
 * @returns {string} Chatbot mode
 */
function getChatbotMode() {
  const mode = process.env.CHATBOT_MODE || 'rules';
  return ['rules', 'ai', 'hybrid'].includes(mode) ? mode : 'rules';
}

/**
 * Main chatbot response function with mode switching
 * @param {string} userMessage - User's message
 * @param {Array<Object>} conversationHistory - Previous messages
 * @returns {Promise<Object>} Response object
 */
async function getChatbotResponse(userMessage, conversationHistory = []) {
  const validation = validateMessage(userMessage);
  if (!validation.valid) {
    return {
      success: false,
      response: validation.error,
      intent: 'validation-error',
      type: 'error'
    };
  }

  const message = validation.message;
  const mode = getChatbotMode();

  try {
    if (mode === 'rules') {
      return getRuleBasedResponse(message);
    }

    if (mode === 'ai') {
      const aiResponse = await getOpenAIResponse(message, conversationHistory);

      if (aiResponse.success) {
        return aiResponse;
      }

      return {
        success: false,
        response: '😕 I\'m having a technical issue. Please try again in a moment or contact support at support@ticket.com',
        intent: 'error',
        type: 'error'
      };
    }

    if (mode === 'hybrid') {
      const ruleResponse = getRuleBasedResponse(message);

      if (ruleResponse.confidence >= 0.7) {
        return ruleResponse;
      }

      if (isOpenAIConfigured()) {
        const aiResponse = await getOpenAIResponse(message, conversationHistory);

        if (aiResponse.success) {
          return aiResponse;
        }
      }

      return ruleResponse;
    }

    return getRuleBasedResponse(message);

  } catch (error) {
    console.error('❌ Chatbot error:', error);

    return {
      success: false,
      response: '😕 Se pare că am o problemă tehnică. Te rog încearcă din nou sau contactează suportul la support@ticketing.com',
      intent: 'error',
      type: 'error'
    };
  }
}

/**
 * Gets chatbot status and configuration
 * @returns {Object} Status information
 */
function getChatbotStatus() {
  const mode = getChatbotMode();
  const openaiConfigured = isOpenAIConfigured();

  return {
    mode: mode,
    ruleBasedAvailable: true,
    openAIAvailable: openaiConfigured,
    activeMode: mode === 'ai' && !openaiConfigured ? 'rules (fallback)' : mode,
    timestamp: new Date().toISOString()
  };
}

/**
 * Saves conversation to database (optional)
 * @param {number} userId - User ID (null for anonymous)
 * @param {string} userMessage - User's message
 * @param {Object} botResponse - Bot's response
 * @returns {Promise<void>}
 */
async function saveConversation(userId, userMessage, botResponse) {
  console.log(`💬 [Chatbot] User ${userId || 'anonymous'}: "${userMessage.substring(0, 50)}..." → ${botResponse.type}`);
}

module.exports = {
  getChatbotResponse,
  getChatbotStatus,
  getSuggestedQuestions,
  saveConversation,
  getChatbotMode
};
