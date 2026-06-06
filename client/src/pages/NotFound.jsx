/**
 * @file NotFound.jsx
 * 404 error page component
 */

import { Link } from 'react-router-dom';
import styles from '../styles/Login.module.css';

/**
 * 404 Not Found page component for invalid routes
 * @component
 * @returns {JSX.Element} Not found page component
 */
function NotFound() {
  const handleManageCookies = (e) => {
    e.preventDefault();
    window.dispatchEvent(new Event('showCookieBanner'));
  };

  return (
    <div className={styles.loginContainer}>
      <header className={styles.loginHeader}>
      </header>

      <div className={styles.loginMain}>
        <div className={styles.loginFormContainer}>
          <h1 className={styles.loginTitle}>404</h1>

          <div className={styles.notFoundContent}>
            <p className={styles.notFoundText}>
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className={styles.signupLink}>
            <p>Let's get you back on track</p>
            <Link to="/" className={styles.createAccountLink}>
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerLogo}>Ticket</div>
        <div className={styles.footerText}>© 2025 Ticket Created by De Lai Emma</div>
        <div className={styles.footerLinks}>
          <Link to="/terms">Terms</Link>
          <span>•</span>
          <Link to="/privacy">Privacy</Link>
          <span>•</span>
          <Link to="/accessibility">Accessibility</Link>
          <span>•</span>
          <Link to="/cookie-policy">Cookies</Link>
          <span>•</span>
          <a href="#" onClick={handleManageCookies}>Manage Cookies Preferences</a>
          <span>•</span>
          <Link to="/privacy#data-rights">Do Not Sell or Share My Personal Information</Link>
        </div>
      </footer>
    </div>
  );
}

export default NotFound;
