/**
 * @file Terms.jsx
 * Terms and Conditions page component
 */

import styles from '../styles/Legal.module.css';

/**
 * Terms and Conditions page displaying legal terms of service
 * @component
 * @returns {JSX.Element} Terms page component
 */
function Terms() {
  return (
    <main className={styles.legalMain}>
      <div className={styles.legalContainer}>
        <h1 className={styles.legalTitle}>Terms and Conditions</h1>
        <div className={styles.legalSubtitle}>Last Updated: December 17, 2025</div>

        <div className={styles.legalSection}>
          <h2>1. Agreement to Terms</h2>
          <p>By accessing and using Ticket ("the Platform"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these Terms and Conditions, please do not use this Platform.</p>
        </div>

        <div className={styles.legalSection}>
          <h2>2. Use License</h2>
          <p>Permission is granted to temporarily access the materials on Ticket's platform for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
          <ul>
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose or for any public display</li>
            <li>Attempt to reverse engineer any software contained on Ticket's platform</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
            <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
          </ul>
        </div>

        <div className={styles.legalSection}>
          <h2>3. Ticket Purchases</h2>
          <h3>3.1 Purchase Process</h3>
          <p>When purchasing tickets through our Platform, you agree to provide current, complete, and accurate purchase and account information.</p>

          <h3>3.2 Pricing</h3>
          <p>All prices are displayed in the currency specified on the event listing. Ticket reserves the right to change prices at any time prior to purchase.</p>

          <h3>3.3 Payment</h3>
          <p>Payment must be received in full before tickets are issued. We accept various payment methods as displayed during checkout.</p>
        </div>

        <div className={styles.legalSection}>
          <h2>4. Refunds and Cancellations</h2>
          <p>Refund policies are set by individual event organizers. Generally:</p>
          <ul>
            <li>Tickets are non-refundable unless the event is cancelled or rescheduled</li>
            <li>If an event is cancelled, you will receive a full refund</li>
            <li>If an event is rescheduled, your ticket will be valid for the new date</li>
            <li>Service fees may be non-refundable</li>
          </ul>
        </div>

        <div className={styles.legalSection}>
          <h2>5. User Accounts</h2>
          <p>When you create an account with us, you must provide accurate and complete information. You are responsible for:</p>
          <ul>
            <li>Maintaining the confidentiality of your account and password</li>
            <li>Restricting access to your computer and account</li>
            <li>All activities that occur under your account</li>
          </ul>
        </div>

        <div className={styles.legalSection}>
          <h2>6. Prohibited Uses</h2>
          <p>You may not use the Platform:</p>
          <ul>
            <li>In any way that violates any applicable national or international law or regulation</li>
            <li>To transmit any advertising or promotional material</li>
            <li>To impersonate or attempt to impersonate the Company, another user, or any other person or entity</li>
            <li>To engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Platform</li>
          </ul>
        </div>

        <div className={styles.legalSection}>
          <h2>7. Intellectual Property</h2>
          <p>The Platform and its original content, features, and functionality are owned by Ticket and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>
        </div>

        <div className={styles.legalSection}>
          <h2>8. Limitation of Liability</h2>
          <p>Ticket shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of, or inability to access or use, the Platform.</p>
        </div>

        <div className={styles.legalSection}>
          <h2>9. Disclaimer</h2>
          <p>The Platform is provided on an "as is" and "as available" basis. Ticket makes no warranties, expressed or implied, and hereby disclaims all warranties including, without limitation, implied warranties of merchantability, fitness for a particular purpose, or non-infringement.</p>
        </div>

        <div className={styles.legalSection}>
          <h2>10. Changes to Terms</h2>
          <p>We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on this page and updating the "Last Updated" date.</p>
        </div>

        <div className={styles.legalSection}>
          <h2>11. Contact Information</h2>
          <p>If you have any questions about these Terms and Conditions, please contact us at:</p>
          <p>Email: support@ticket.com<br />
          Address: Ticket Event Management System</p>
        </div>
      </div>
    </main>
  );
}

export default Terms;
