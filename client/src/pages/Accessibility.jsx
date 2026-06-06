/**
 * @file Accessibility.jsx
 * Accessibility Statement page component
 */

import styles from '../styles/Legal.module.css';

/**
 * Accessibility Statement page displaying accessibility commitment and features
 * @component
 * @returns {JSX.Element} Accessibility page component
 */
function Accessibility() {
  return (
    <main className={styles.legalMain}>
      <div className={styles.legalContainer}>
        <h1 className={styles.legalTitle}>Accessibility Statement</h1>
        <div className={styles.legalSubtitle}>Last Updated: December 17, 2025</div>

        <div className={styles.legalSection}>
          <h2>Our Commitment to Accessibility</h2>
          <p>Ticket is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.</p>
        </div>

        <div className={styles.legalSection}>
          <h2>Conformance Status</h2>
          <p>We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. These guidelines explain how to make web content more accessible for people with disabilities and user-friendly for everyone.</p>

          <div className={styles.highlightSection}>
            <p><strong>Current Status:</strong> We are actively working towards full WCAG 2.1 AA compliance. Some features may not yet fully comply with all accessibility standards.</p>
          </div>
        </div>

        <div className={styles.legalSection}>
          <h2>Accessibility Features</h2>
          <p>Our platform includes the following accessibility features:</p>
          <ul>
            <li>Keyboard navigation support for all interactive elements</li>
            <li>Alternative text for images</li>
            <li>Clear and consistent navigation structure</li>
            <li>Sufficient color contrast ratios</li>
            <li>Readable font sizes and spacing</li>
            <li>Form labels and error messages</li>
            <li>Skip navigation links</li>
            <li>Responsive design for various screen sizes</li>
          </ul>
        </div>

        <div className={styles.legalSection}>
          <h2>Assistive Technologies</h2>
          <p>We strive to support the following assistive technologies:</p>
          <ul>
            <li>Screen readers (JAWS, NVDA, VoiceOver)</li>
            <li>Screen magnification software</li>
            <li>Voice recognition software</li>
            <li>Keyboard-only navigation</li>
          </ul>
        </div>

        <div className={styles.legalSection}>
          <h2>Event Accessibility</h2>

          <h3>Wheelchair Accessibility</h3>
          <p>Event venues may offer wheelchair-accessible seating and facilities. Look for the wheelchair symbol on event listings to identify accessible venues.</p>

          <h3>Assisted Listening Devices</h3>
          <p>Some venues provide assisted listening devices. Contact the venue directly or check the event details for availability.</p>

          <h3>Service Animals</h3>
          <p>Service animals are generally welcome at events. Please contact the venue in advance to confirm their specific policies.</p>

          <h3>Accessibility Accommodations</h3>
          <p>If you require specific accessibility accommodations for an event, please contact us or the event organizer as early as possible to make arrangements.</p>
        </div>

        <div className={styles.legalSection}>
          <h2>Known Limitations</h2>
          <p>Despite our best efforts, there may be some limitations to the accessibility of certain features on our platform. We are actively working to address these issues:</p>
          <ul>
            <li>Some third-party content may not be fully accessible</li>
            <li>Certain complex interactive features may have limited screen reader support</li>
            <li>PDF documents may not all be fully accessible</li>
          </ul>
        </div>

        <div className={styles.legalSection}>
          <h2>Browser and Device Compatibility</h2>
          <p>Our platform is designed to work with the following browsers:</p>
          <ul>
            <li>Google Chrome (latest version)</li>
            <li>Mozilla Firefox (latest version)</li>
            <li>Apple Safari (latest version)</li>
            <li>Microsoft Edge (latest version)</li>
          </ul>
          <p>We recommend using the latest version of your preferred browser for the best accessibility experience.</p>
        </div>

        <div className={styles.legalSection}>
          <h2>Feedback and Contact</h2>
          <p>We welcome your feedback on the accessibility of our platform. If you encounter any accessibility barriers or have suggestions for improvement, please let us know:</p>
          <p>
            Email: accessibility@ticket.com<br />
            Phone: 1-800-TICKET-ACCESS<br />
            Address: Ticket Event Management System
          </p>
          <p>We aim to respond to accessibility feedback within 5 business days.</p>
        </div>

        <div className={styles.legalSection}>
          <h2>Ongoing Efforts</h2>
          <p>Accessibility is an ongoing effort. We regularly:</p>
          <ul>
            <li>Test our platform with assistive technologies</li>
            <li>Conduct accessibility audits</li>
            <li>Provide accessibility training for our team</li>
            <li>Work with users with disabilities to improve our platform</li>
            <li>Monitor and implement emerging accessibility standards</li>
          </ul>
        </div>

        <div className={styles.legalSection}>
          <h2>Third-Party Content</h2>
          <p>While we strive to ensure all content on our platform is accessible, some third-party content (such as event organizer descriptions or embedded videos) may not meet our accessibility standards. We encourage event organizers to make their content accessible and provide assistance when needed.</p>
        </div>
      </div>
    </main>
  );
}

export default Accessibility;
