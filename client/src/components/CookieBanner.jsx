/**
 * @file CookieBanner.jsx
 * Cookie consent banner component for GDPR compliance
 */

import { useState, useEffect } from 'react';
import styles from '../styles/CookieBanner.module.css';

/**
 * Cookie consent banner component displaying cookie policy notification
 * @component
 * @returns {JSX.Element|null} Cookie banner component or null if dismissed
 */
function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const CONSENT_KEY = 'cookieConsent';

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      setIsVisible(true);
    }

    const handleShowBanner = () => {
      setIsVisible(true);
    };

    window.addEventListener('showCookieBanner', handleShowBanner);

    return () => {
      window.removeEventListener('showCookieBanner', handleShowBanner);
    };
  }, []);

  const handleAcceptNecessary = () => {
    localStorage.setItem(CONSENT_KEY, 'necessary');
    setIsVisible(false);
    console.log('✅ Cookie consent: Necessary only');
  };

  const handleAcceptAll = () => {
    localStorage.setItem(CONSENT_KEY, 'all');
    setIsVisible(false);
    console.log('✅ Cookie consent: All accepted');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`${styles.cookieBanner} ${isVisible ? styles.show : ''}`} id="cookie-banner">
      <div className={styles.cookieBannerContent}>
        <div className={styles.cookieBannerText}>
          We use cookies to improve your browsing experience. <a href="/cookie-policy">Cookie Policy</a>
        </div>
        <div className={styles.cookieBannerButtons}>
          <button
            id="acceptNecessary"
            className={`${styles.cookieBtn} ${styles.cookieBtnAcceptNecessary}`}
            onClick={handleAcceptNecessary}
          >
            Accept Necessary
          </button>
          <button
            id="acceptAll"
            className={`${styles.cookieBtn} ${styles.cookieBtnAcceptAll}`}
            onClick={handleAcceptAll}
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}

export default CookieBanner;
