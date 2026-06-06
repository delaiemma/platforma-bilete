/**
 * @fileoverview Gemini AI Chatbot Service (Google)
 * Uses gemini-1.5-flash - free tier, no credit card required
 */

const systemPrompt = `You are the virtual assistant of "Ticket" - an event ticketing platform.

PLATFORM INFORMATION:

TICKETS & PURCHASING:
- Users can buy tickets for concerts, theater, shows, sports
- Some events have numbered seats (VIP, Floor, Balcony)
- Zone prices: VIP (most expensive, closest to stage), Floor (mid-range), Balcony (affordable)
- Tickets are added to cart and reserved for 10 minutes
- Payment is made through Stripe (Visa, Mastercard, Amex)
- A seat recommendation feature suggests the best consecutive seats automatically

CANCELLATION & REFUND:
- Tickets can only be cancelled MORE THAN 24 hours before the event
- Cancellation is done from "My Tickets" page - "Cancel ticket" button
- Refund is processed automatically through Stripe in 5-10 business days
- Tickets CANNOT be cancelled 24 hours or less before the event

TICKETS & QR CODES:
- After purchase, the user receives an email instantly with tickets attached as PDF
- Each ticket has a unique QR code
- Accessibility seats require a valid disability certificate at the venue entrance
- At the event, the QR code is scanned at the entrance

SEAT UPGRADES:
- Users with Balcony tickets may receive a free upgrade offer to Floor or VIP
- Upgrade offers are sent by email 1-3 hours before the event
- The offer is valid for 30 minutes and is completely free

DISCOUNT CODES:
- Discount codes can be applied at checkout
- Discounts can be percentage-based or fixed amount
- Each code may have usage limits and expiry dates

WAITLIST:
- Users can join the waitlist for sold-out events
- They are automatically notified when a ticket becomes available

CONTACT & SUPPORT:
- Email: support@ticket.com
- Contact form available on the "Contact" page
- Hours: Monday-Friday 9-18, Saturday 10-14

RESPOND:
- Concisely (max 3-4 sentences or a short list)
- Politely and professionally
- In English
- Use emojis for clarity (🎫💳✅❌📧)
- Do NOT use markdown bold (**text**) or headers
- If unsure, recommend contacting support`;

/**
 * Gets chatbot response using Google Gemini
 * @param {string} userMessage - User's message
 * @param {Array<Object>} conversationHistory - Previous messages
 * @returns {Promise<Object>} Response object
 */
async function getOpenAIResponse(userMessage, conversationHistory = []) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured.');
    }

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const models = ['gemini-flash-latest', 'gemini-2.5-flash', 'gemini-pro-latest'];

    const mappedHistory = conversationHistory.slice(-6).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
    const firstUserIdx = mappedHistory.findIndex(m => m.role === 'user');
    const history = firstUserIdx >= 0 ? mappedHistory.slice(firstUserIdx) : [];

    let botResponse = null;
    let lastError = null;
    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName, systemInstruction: systemPrompt });
        const chat = model.startChat({ history });
        const result = await chat.sendMessage(userMessage);
        botResponse = result.response.text().trim();
        break;
      } catch (err) {
        lastError = err;
        if (!err.message.includes('503') && !err.message.includes('429')) throw err;
      }
    }
    if (!botResponse) throw lastError;

    return {
      success: true,
      response: botResponse,
      intent: 'ai-generated',
      confidence: 1.0,
      type: 'openai',
      metadata: { model: 'gemini-2.0-flash' }
    };

  } catch (error) {
    console.error('❌ Gemini chatbot error:', error.message);
    return {
      success: false,
      error: error.message,
      type: 'openai-error'
    };
  }
}

/**
 * Checks if Gemini API is properly configured
 * @returns {boolean}
 */
function isOpenAIConfigured() {
  return !!(process.env.GEMINI_API_KEY);
}

module.exports = {
  getOpenAIResponse,
  isOpenAIConfigured
};
