/**
 * @fileoverview Rule-Based Chatbot Service
 * Implements keyword matching algorithm for chatbot responses
 * No AI required - uses predefined patterns and responses
 */

const { knowledgeBase, defaultResponse } = require('./chatbotKnowledge');

/**
 * Calculates similarity score between user message and keywords
 * @param {string} message - User's message (lowercase)
 * @param {Array<string>} keywords - Array of keywords to match
 * @returns {number} Score between 0 and 1
 */
function calculateMatchScore(message, keywords) {
  let score = 0;
  const messageWords = message.toLowerCase().split(/\s+/);

  for (const keyword of keywords) {
    const keywordLower = keyword.toLowerCase();

    if (message.includes(keywordLower)) {
      score += 1.0;
    }
    else {
      const keywordWords = keywordLower.split(/\s+/);
      const matchedWords = keywordWords.filter(kw =>
        messageWords.some(mw => mw.includes(kw) || kw.includes(mw))
      );
      score += matchedWords.length / keywordWords.length * 0.5;
    }
  }

  return score;
}

/**
 * Finds the best matching intent for user's message
 * @param {string} userMessage - User's message
 * @returns {Object|null} Best matching intent with score, or null
 */
function findBestIntent(userMessage) {
  const message = userMessage.toLowerCase().trim();

  if (!message || message.length < 2) {
    return null;
  }

  let bestIntent = null;
  let bestScore = 0;
  let bestIntentKey = null;

  for (const [intentKey, intentData] of Object.entries(knowledgeBase)) {
    const score = calculateMatchScore(message, intentData.keywords);

    const finalScore = score * (intentData.priority || 1);

    if (finalScore > bestScore) {
      bestScore = finalScore;
      bestIntent = intentData;
      bestIntentKey = intentKey;
    }
  }

  const THRESHOLD = 0.3;
  if (bestScore >= THRESHOLD) {
    return {
      intent: bestIntentKey,
      response: bestIntent.response,
      score: bestScore,
      confidence: Math.min(bestScore / 2, 1)
    };
  }

  return null;
}

/**
 * Gets chatbot response for user message (rule-based)
 * @param {string} userMessage - User's message
 * @returns {Object} Response object with text and metadata
 */
function getRuleBasedResponse(userMessage) {
  const match = findBestIntent(userMessage);

  if (match) {
    return {
      success: true,
      response: match.response,
      intent: match.intent,
      confidence: match.confidence,
      type: 'rule-based'
    };
  }

  return {
    success: false,
    response: defaultResponse,
    intent: 'unknown',
    confidence: 0,
    type: 'rule-based'
  };
}

/**
 * Gets a quick answer for common questions (used for suggestions)
 * @returns {Array<Object>} Array of suggested questions
 */
function getSuggestedQuestions() {
  return [
    { text: 'How do I buy tickets?', icon: '🎫' },
    { text: 'Can I cancel a ticket?', icon: '❌' },
    { text: 'What payment methods do you accept?', icon: '💳' },
    { text: 'How do numbered seats work?', icon: '🪑' },
    { text: 'Do you have discount codes?', icon: '🎁' }
  ];
}

/**
 * Validates user message
 * @param {string} message - User's message
 * @returns {Object} Validation result
 */
function validateMessage(message) {
  if (!message || typeof message !== 'string') {
    return { valid: false, error: 'Mesajul este invalid' };
  }

  const trimmed = message.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Mesajul este gol' };
  }

  if (trimmed.length > 500) {
    return { valid: false, error: 'Mesajul este prea lung (max 500 caractere)' };
  }

  return { valid: true, message: trimmed };
}

module.exports = {
  getRuleBasedResponse,
  getSuggestedQuestions,
  validateMessage,
  findBestIntent
};
