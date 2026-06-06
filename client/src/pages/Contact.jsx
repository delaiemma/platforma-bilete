/**
 * @file Contact.jsx
 * Contact page component with contact form
 */

import { useState } from 'react';
import styles from '../styles/Contact.module.css';

/**
 * Contact page component with contact information and submission form
 * @component
 * @returns {JSX.Element} Contact page component
 */
function Contact() {
  const [showPopup, setShowPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.message) {
      alert('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setShowPopup(true);
      } else {
        alert(data.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      alert('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: ''
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <main className={styles.contactMain}>
      <h1 className={styles.contactTitle}>Contact</h1>

      <div className={styles.contactContent}>
        <div className={styles.contactInfo}>
          <div className={styles.introText}>
            <p>Email, call, or complete the form to learn how Tickets can solve your messaging problem.</p>
            <p>@ticket.io</p>
            <p>0753916751</p>
          </div>

          <div className={styles.infoSection}>
            <div>Customer Support</div>
            <p>Our support team is available around the clock to address any concerns or queries you may have.</p>
          </div>

          <div className={styles.infoSection}>
            <div>Media Inquiries</div>
            <p>For journalist, publications, or press inquiries, please contact us at media@ticketapp.com</p>
          </div>

          <div className={styles.infoSection}>
            <div>Feedback and Suggestions</div>
            <p>We value your feedback and are continuously working to improve Ticket. Your input is crucial in shaping the future of Ticket.</p>
          </div>

          <div className={styles.infoSection}>
            <div>Partnership Opportunities</div>
            <p>Interested in partnering with Ticket? We're always looking for exciting collaborations that enhance the live event experience.</p>
          </div>
        </div>

        <div className={styles.contactFormContainer}>
          <div className={styles.formHeader}>
            <div>Get in Touch</div>
            <p>You can reach us anytime</p>
          </div>

          <form className={styles.contactForm} onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <textarea
              name="message"
              placeholder="How can I help?"
              rows="5"
              value={formData.message}
              onChange={handleChange}
              required
            />

            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Submit'}
            </button>
          </form>
        </div>
      </div>

      {showPopup && (
        <div className={styles.thankYouPopup}>
          <div className={styles.popupContent}>
            <button className={styles.closeBtn} onClick={closePopup}>×</button>
            <h2>Thank you for reaching out!</h2>
            <p>We have received your message and will respond as quickly as possible.</p>
            <p style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
              📧 A confirmation email has been sent to your address.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

export default Contact;
