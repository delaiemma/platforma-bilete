/**
 * @file Footer.jsx
 * Footer component with links and cookie management
 */

import styles from '../../styles/Footer.module.css';

/**
 * Footer component displaying site links, copyright, and legal information
 * @component
 * @returns {JSX.Element} Footer component
 */
function Footer() {
  const handleManageCookies = (e) => {
    e.preventDefault();
    window.dispatchEvent(new Event('showCookieBanner'));
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.footerLogo}>Ticket</div>
      <div className={styles.footerText}>© 2025 Ticket Created by De Lai Emma</div>
      <div className={styles.footerLinks}>
        <a href="/terms">Terms</a>
        <span>•</span>
        <a href="/privacy">Privacy</a>
        <span>•</span>
        <a href="/accessibility">Accessibility</a>
        <span>•</span>
        <a href="/cookie-policy">Cookies</a>
        <span>•</span>
        <a href="#" id="manageCookiesLink" onClick={handleManageCookies}>
          Manage Cookies Preferences
        </a>
        <span>•</span>
        <a href="/privacy#data-rights">Do Not Sell or Share My Personal Information</a>
      </div>
    </footer>
  );
}

export default Footer;
