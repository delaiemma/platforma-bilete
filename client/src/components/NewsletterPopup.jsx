/**
 * @file NewsletterPopup.jsx
 * Newsletter subscription popup component displayed on homepage
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import styles from '../styles/NewsletterPopup.module.css';

/**
 * Newsletter subscription popup triggered by scroll on homepage
 * @component
 * @returns {JSX.Element|null} Newsletter popup component or null if hidden
 */
function NewsletterPopup() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userId = user?.user_id;
  const storageKey = userId ? `newsletterPopupDismissed_${userId}` : 'newsletterPopupDismissed_guest';

  useEffect(() => {
    setStatus('');
    setMessage('');
    setEmail('');

    if (location.pathname !== '/') {
      setIsVisible(false);
      return;
    }

    const dismissed = localStorage.getItem(storageKey);

    if (dismissed) {
      setIsVisible(false);
      return;
    }

    const checkAndShowPopup = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;

      if (scrollPercent > 50 && !dismissed) {
        setIsVisible(true);
      }
    };

    checkAndShowPopup();

    window.addEventListener('scroll', checkAndShowPopup);
    return () => window.removeEventListener('scroll', checkAndShowPopup);
  }, [location.pathname, userId, storageKey]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleDontShowAgain = () => {
    localStorage.setItem(storageKey, 'true');
    setIsVisible(false);
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setStatus('error');
      setMessage('Please enter your email');
      return;
    }

    setIsSubmitting(true);
    setStatus('');
    setMessage('');

    try {
      await axios.post('http://localhost:3000/api/newsletter/subscribe', { email });
      setStatus('success');
      setMessage('Successfully subscribed');
      setEmail('');

      setTimeout(() => {
        localStorage.setItem(storageKey, 'true');
        setIsVisible(false);
      }, 2000);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      <div className={styles.overlay} onClick={handleClose} />
      <div className={styles.popup}>
        <button className={styles.closeBtn} onClick={handleClose}>×</button>

        <h2 className={styles.title}>Subscribe to updates</h2>
        <p className={styles.description}>
          Get the latest events and exclusive offers delivered to your inbox
        </p>

        <form onSubmit={handleSubscribe} className={styles.form}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.emailInput}
            disabled={isSubmitting}
          />
          <button
            type="submit"
            className={styles.subscribeBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>

        {message && (
          <p className={status === 'success' ? styles.successMessage : styles.errorMessage}>
            {message}
          </p>
        )}

        <button className={styles.dontShowBtn} onClick={handleDontShowAgain}>
          Don't show again
        </button>
      </div>
    </>
  );
}

export default NewsletterPopup;
