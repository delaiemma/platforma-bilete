/**
 * @file Privacy.jsx
 * Privacy Policy page component
 */

import styles from '../styles/Legal.module.css';

/**
 * Privacy Policy page displaying data collection and usage policies
 * @component
 * @returns {JSX.Element} Privacy page component
 */
function Privacy() {
  return (
    <main className={styles.legalMain}>
      <div className={styles.legalContainer}>
        <h1 className={styles.legalTitle}>Privacy Policy</h1>
        <div className={styles.legalSubtitle}>Last Updated: December 17, 2025</div>

        <div className={styles.legalSection}>
          <h2>1. Introduction</h2>
          <p>Ticket ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our platform.</p>
        </div>

        <div className={styles.legalSection}>
          <h2>2. Information We Collect</h2>

          <h3>2.1 Personal Information</h3>
          <p>We may collect personal information that you voluntarily provide to us when you:</p>
          <ul>
            <li>Register for an account</li>
            <li>Purchase tickets</li>
            <li>Contact us for support</li>
            <li>Subscribe to our newsletter</li>
          </ul>
          <p>This information may include:</p>
          <ul>
            <li>Name and contact information (email, phone number)</li>
            <li>Payment information (processed securely through third-party providers)</li>
            <li>Account credentials</li>
            <li>Date of birth</li>
          </ul>

          <h3>2.2 Automatically Collected Information</h3>
          <p>When you access our Platform, we automatically collect certain information, including:</p>
          <ul>
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Device information</li>
            <li>Pages visited and time spent on pages</li>
            <li>Referring website addresses</li>
          </ul>

          <h3>2.3 Cookies and Tracking Technologies</h3>
          <p>We use cookies and similar tracking technologies to track activity on our Platform. You can control cookies through your browser settings. For more information, see our <a href="/cookie-policy">Cookie Policy</a>.</p>
        </div>

        <div className={styles.legalSection}>
          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect for various purposes, including:</p>
          <ul>
            <li>Processing ticket purchases and sending confirmation emails</li>
            <li>Managing your account and providing customer support</li>
            <li>Sending you important updates about events and services</li>
            <li>Improving our Platform and user experience</li>
            <li>Preventing fraud and enhancing security</li>
            <li>Complying with legal obligations</li>
            <li>Marketing and promotional purposes (with your consent)</li>
          </ul>
        </div>

        <div className={styles.legalSection}>
          <h2>4. How We Share Your Information</h2>
          <p>We may share your information in the following circumstances:</p>

          <h3>4.1 Event Organizers</h3>
          <p>When you purchase a ticket, we share necessary information with the event organizer, including your name and contact details.</p>

          <h3>4.2 Service Providers</h3>
          <p>We may share your information with third-party service providers who perform services on our behalf, such as:</p>
          <ul>
            <li>Payment processing</li>
            <li>Email delivery</li>
            <li>Data analysis</li>
            <li>Customer service</li>
          </ul>

          <h3>4.3 Legal Requirements</h3>
          <p>We may disclose your information if required to do so by law or in response to valid requests by public authorities.</p>

          <h3>4.4 Business Transfers</h3>
          <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</p>
        </div>

        <div className={styles.legalSection} id="data-rights">
          <h2>5. Your Data Rights</h2>
          <div className={styles.highlightSection}>
            <h3>Do Not Sell or Share My Personal Information</h3>
            <p>We do not sell your personal information to third parties. You have the right to opt-out of the sharing of your personal information for targeted advertising purposes.</p>
          </div>

          <p>Depending on your location, you may have the following rights regarding your personal data:</p>
          <ul>
            <li><strong>Access:</strong> Request access to your personal data</li>
            <li><strong>Correction:</strong> Request correction of inaccurate data</li>
            <li><strong>Deletion:</strong> Request deletion of your personal data</li>
            <li><strong>Portability:</strong> Request transfer of your data to another service</li>
            <li><strong>Objection:</strong> Object to processing of your data</li>
            <li><strong>Withdrawal of Consent:</strong> Withdraw consent at any time</li>
          </ul>

          <p>To exercise these rights, please contact us at privacy@ticket.com</p>
        </div>

        <div className={styles.legalSection}>
          <h2>6. Data Security</h2>
          <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.</p>
        </div>

        <div className={styles.legalSection}>
          <h2>7. Data Retention</h2>
          <p>We retain your personal data for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.</p>
        </div>

        <div className={styles.legalSection}>
          <h2>8. Children's Privacy</h2>
          <p>Our Platform is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.</p>
        </div>

        <div className={styles.legalSection}>
          <h2>9. International Data Transfers</h2>
          <p>Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place for such transfers.</p>
        </div>

        <div className={styles.legalSection}>
          <h2>10. Changes to This Privacy Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.</p>
        </div>

        <div className={styles.legalSection}>
          <h2>11. Contact Us</h2>
          <p>If you have questions or concerns about this Privacy Policy or our data practices, please contact us at:</p>
          <p>
            Email: privacy@ticket.com<br />
            Address: Ticket Event Management System<br />
            Data Protection Officer: privacy@ticket.com
          </p>
        </div>
      </div>
    </main>
  );
}

export default Privacy;
