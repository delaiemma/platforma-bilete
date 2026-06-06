/**
 * @file ChatWidget.jsx
 * Live chatbot widget component - fixed position in bottom-right corner
 */

import { useState, useRef, useEffect } from 'react';
import client from '../api/client';
import styles from '../styles/ChatWidget.module.css';

/**
 * ChatWidget component - AI/Rule-based chatbot for customer support
 * @component
 * @returns {JSX.Element} Chat widget with expandable conversation
 */
function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadSuggestions();
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  /**
   * Load suggested questions
   */
  const loadSuggestions = async () => {
    try {
      const response = await client.get('/chatbot/suggestions');
      if (response.success) {
        setSuggestions(response.suggestions);
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  /**
   * Toggle chat open/close
   */
  const toggleChat = () => {
    setIsOpen(!isOpen);

  };

  /**
   * Send message to chatbot
   */
  const sendMessage = async (messageText = null) => {
    const textToSend = messageText || inputMessage.trim();

    if (!textToSend) return;

    setShowSuggestions(false);

    const userMessage = {
      type: 'user',
      text: textToSend,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const history = messages.slice(-6).map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      const response = await client.post('/chatbot/message', {
        message: textToSend,
        conversationHistory: history
      });

      const botMessage = {
        type: 'bot',
        text: response.message,
        intent: response.intent,
        confidence: response.confidence,
        chatbotType: response.type,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Chatbot error:', error);

      const errorMessage = {
        type: 'bot',
        text: '😕 Îmi pare rău, am o problemă tehnică. Te rog încearcă din nou.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  /**
   * Handle form submit
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  /**
   * Handle suggestion click
   */
  const handleSuggestionClick = (suggestionText) => {
    sendMessage(suggestionText);
  };

  /**
   * Format timestamp
   */
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.chatWidget}>
      {/* Chat Button */}
      <button
        className={`${styles.chatButton} ${isOpen ? styles.chatButtonOpen : ''}`}
        onClick={toggleChat}
        aria-label="Open chat"
      >
        {isOpen ? (
          <span className={styles.closeIcon}>✕</span>
        ) : (
          <span className={styles.chatIcon}>💬</span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={styles.chatWindow}>
          {/* Header */}
          <div className={styles.chatHeader}>
            <div className={styles.headerInfo}>
              <div className={styles.botAvatar}>🤖</div>
              <div>
                <h3>Virtual Assistant</h3>
                <span className={styles.status}>
                  <span className={styles.statusDot}></span>
                  Online
                </span>
              </div>
            </div>
            <button
              className={styles.minimizeBtn}
              onClick={toggleChat}
              aria-label="Minimize chat"
            >
              −
            </button>
          </div>

          {/* Messages */}
          <div className={styles.chatMessages}>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`${styles.message} ${
                  msg.type === 'user' ? styles.userMessage : styles.botMessage
                }`}
              >
                {msg.type === 'bot' && (
                  <div className={styles.botAvatarSmall}>🤖</div>
                )}
                <div className={styles.messageContent}>
                  <div className={styles.messageText} dangerouslySetInnerHTML={{ __html: msg.text
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br/>') }} />
                  <div className={styles.messageTime}>
                    {formatTime(msg.timestamp)}
                    {msg.chatbotType && (
                      <span className={styles.chatbotType}>
                        {msg.chatbotType === 'openai' ? ' • AI' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className={`${styles.message} ${styles.botMessage}`}>
                <div className={styles.botAvatarSmall}>🤖</div>
                <div className={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            {/* Suggestions (shown before first user message) */}
            {showSuggestions && suggestions.length > 0 && (
              <div className={styles.suggestions}>
                <p className={styles.suggestionsTitle}>Frequently asked questions:</p>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className={styles.suggestionBtn}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                  >
                    <span>{suggestion.icon}</span>
                    {suggestion.text}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form className={styles.chatInput} onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a message..."
              maxLength={500}
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              aria-label="Send message"
            >
              ➤
            </button>
          </form>

          {/* Footer */}
          <div className={styles.chatFooter}>
            <span className={styles.footerText}>
              Powered by Google Gemini
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatWidget;
