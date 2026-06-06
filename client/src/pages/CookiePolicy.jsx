/**
 * @file CookiePolicy.jsx
 * Cookie Policy page component
 */

import styles from '../styles/Legal.module.css';

/**
 * Cookie Policy page explaining cookie usage and types
 * @component
 * @returns {JSX.Element} Cookie Policy page component
 */
function CookiePolicy() {
  return (
    <main className={styles.legalMain}>
      <div className={styles.legalContainer}>
        <h1 className={styles.legalTitle}>Cookie Policy</h1>
        <div className={styles.legalSubtitle}>Last updated: December 6, 2025</div>

        <div className={styles.legalSection}>
          <h2>What Are Cookies</h2>
          <p>Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our site.</p>
        </div>

        <div className={styles.legalSection}>
          <h2>How We Use Cookies</h2>
          <p>We use cookies to:</p>
          <ul>
            <li>Keep you signed in to your account</li>
            <li>Remember your shopping cart items</li>
            <li>Remember your cookie preferences</li>
            <li>Understand how visitors interact with our website</li>
            <li>Improve our services and user experience</li>
          </ul>
        </div>

        <div className={styles.legalSection}>
          <h2>Types of Cookies We Use</h2>

          <div className={styles.highlightSection}>
            <h3>Essential Cookies</h3>
            <p>These cookies are necessary for the website to function properly. They enable core functionality such as:</p>
            <ul>
              <li><strong>Authentication:</strong> Keeping you logged in to your account</li>
              <li><strong>Session Management:</strong> Maintaining your shopping cart and reservations</li>
              <li><strong>Security:</strong> Protecting your data and preventing fraud</li>
            </ul>
            <p className={styles.cookieNote}>These cookies cannot be disabled as they are essential for the website to work.</p>
          </div>

          <div className={styles.highlightSection}>
            <h3>Functionality Cookies</h3>
            <p>These cookies allow us to remember your preferences and choices, such as:</p>
            <ul>
              <li>Your cookie consent preferences</li>
              <li>Your favorite events</li>
              <li>Language and region settings</li>
            </ul>
          </div>

          <div className={styles.highlightSection}>
            <h3>Performance Cookies</h3>
            <p>These cookies help us understand how visitors interact with our website by collecting anonymous information about:</p>
            <ul>
              <li>Pages visited and time spent on each page</li>
              <li>Click patterns and navigation paths</li>
              <li>Errors encountered during your visit</li>
            </ul>
            <p className={styles.cookieNote}>This information is aggregated and anonymous.</p>
          </div>
        </div>

        <div className={styles.legalSection}>
          <h2>Cookie Storage Details</h2>
          <p>We use two types of storage mechanisms:</p>
          <ul>
            <li><strong>localStorage:</strong> Stores your cookie preferences permanently until you clear your browser data</li>
            <li><strong>sessionStorage:</strong> Stores temporary session data that is cleared when you close your browser</li>
          </ul>
        </div>

        <div className={styles.legalSection}>
          <h2>Managing Your Cookie Preferences</h2>
          <p>You have control over which cookies you accept:</p>
          <ul>
            <li><strong>Accept All:</strong> Allows all cookies for the best experience</li>
            <li><strong>Accept Necessary:</strong> Only allows essential cookies required for the website to function</li>
          </ul>
          <p>You can also manage cookies through your browser settings. Please note that blocking certain cookies may impact your experience on our website.</p>
        </div>

        <div className={styles.legalSection}>
          <h2>Browser Cookie Settings</h2>
          <p>Most web browsers allow you to control cookies through their settings. To find out more about cookies, including how to see what cookies have been set and how to manage and delete them, visit:</p>
          <ul>
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Chrome</a></li>
            <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer">Firefox</a></li>
            <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
            <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
          </ul>
        </div>

        <div className={styles.legalSection}>
          <h2>Third-Party Cookies</h2>
          <p>We do not currently use third-party cookies for advertising or tracking. If this changes in the future, we will update this policy accordingly.</p>
        </div>

        <div className={styles.legalSection}>
          <h2>Changes to This Policy</h2>
          <p>We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We encourage you to review this page periodically for the latest information on our cookie practices.</p>
        </div>

        <div className={styles.legalSection}>
          <h2>Contact Us</h2>
          <p>If you have any questions about our use of cookies, please contact us at:</p>
          <p><strong>Email:</strong> privacy@ticket.com</p>
        </div>
      </div>
    </main>
  );
}

export default CookiePolicy;
