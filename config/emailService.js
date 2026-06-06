/**
 * @fileoverview Newsletter email service for sending welcome emails to new subscribers.
 * Handles email configuration, HTML template generation, and email delivery using Nodemailer with Gmail SMTP.
 * @module config/emailService
 * @requires nodemailer
 */

const nodemailer = require('nodemailer');

/**
 * Nodemailer transporter configured for Gmail SMTP service.
 * Uses environment variables for authentication credentials.
 *
 * @constant {nodemailer.Transporter}
 * @see {@link https://nodemailer.com/smtp/ Nodemailer SMTP Documentation}
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Generates a professionally styled HTML email template for welcome emails.
 * Creates a responsive email layout with a gradient header, discount code display,
 * and call-to-action button for browsing events.
 *
 * @function getWelcomeEmailHTML
 * @param {string} discountCode - The unique discount code to display in the email (e.g., "WELCOME10")
 * @returns {string} Complete HTML email template as a string with inline CSS styles
 *
 * @example
 * const htmlContent = getWelcomeEmailHTML('DISCOUNT2025');
 * // Returns fully formatted HTML email with the discount code embedded
 */
const getWelcomeEmailHTML = (discountCode) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: white;
          border: 1px solid #ddd;
        }
        .header {
          background: linear-gradient(135deg, #d4a5d4, #c19ac1);
          padding: 40px 30px;
          text-align: center;
        }
        .logo {
          font-size: 36px;
          font-style: italic;
          font-weight: 300;
          color: #333;
          margin: 0;
        }
        .content {
          padding: 40px 30px;
          text-align: center;
        }
        .title {
          font-size: 28px;
          font-style: italic;
          font-weight: 300;
          color: #333;
          margin-bottom: 20px;
        }
        .text {
          font-size: 16px;
          font-style: italic;
          color: #666;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        .discount-box {
          background: #f5f5f5;
          border: 1px solid #ddd;
          padding: 30px;
          margin: 30px 0;
        }
        .discount-label {
          font-size: 14px;
          font-style: italic;
          color: #999;
          margin-bottom: 10px;
        }
        .discount-code {
          font-size: 32px;
          font-weight: 600;
          color: #333;
          letter-spacing: 2px;
          margin: 10px 0;
        }
        .discount-value {
          font-size: 18px;
          font-style: italic;
          color: #666;
          margin-top: 10px;
        }
        .cta-button {
          display: inline-block;
          padding: 15px 40px;
          background: white;
          border: 1px solid #666;
          color: #333;
          text-decoration: none;
          font-size: 16px;
          font-style: italic;
          font-weight: 300;
          margin: 20px 0;
          transition: all 0.3s ease;
        }
        .footer {
          background: linear-gradient(135deg, #d4a5d4, #c19ac1);
          padding: 30px;
          text-align: center;
        }
        .footer-text {
          font-size: 12px;
          font-style: italic;
          color: #666;
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo">Ticket</h1>
        </div>

        <div class="content">
          <h2 class="title">Welcome to Ticket!</h2>

          <p class="text">
            Thank you for subscribing to our newsletter. We're excited to have you with us!
          </p>

          <p class="text">
            As a welcome gift, here's your exclusive 10% discount code:
          </p>

          <div class="discount-box">
            <div class="discount-label">YOUR DISCOUNT CODE</div>
            <div class="discount-code">${discountCode}</div>
            <div class="discount-value">10% OFF your next purchase</div>
          </div>

          <p class="text">
            Use this code at checkout to enjoy your discount on any event ticket.
          </p>

          <a href="http://localhost:5173" class="cta-button">Browse Events</a>

          <p class="text" style="margin-top: 40px; font-size: 14px; color: #999;">
            Stay tuned for exclusive offers, new events, and special promotions!
          </p>
        </div>

        <div class="footer">
          <p class="footer-text">© 2025 Ticket - Created by De Lai Emma</p>
          <p class="footer-text">You're receiving this because you subscribed to our newsletter</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Sends a welcome email to a new newsletter subscriber with their unique discount code.
 * Configures the email with branding, subject line, and HTML content, then sends via the transporter.
 *
 * @async
 * @function sendWelcomeEmail
 * @param {string} email - Recipient's email address
 * @param {string} discountCode - Unique discount code to include in the welcome email
 * @returns {Promise<{success: boolean, error?: Error}>} Result object indicating success or failure
 * @returns {boolean} return.success - True if email was sent successfully, false otherwise
 * @returns {Error} [return.error] - Error object if sending failed
 *
 * @example
 * const result = await sendWelcomeEmail('user@example.com', 'WELCOME2025');
 * if (result.success) {
 *   console.log('Email sent successfully');
 * } else {
 *   console.error('Failed to send email:', result.error);
 * }
 */
const sendWelcomeEmail = async (email, discountCode) => {
  const mailOptions = {
    from: `"Ticket" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to Ticket - Your 10% Discount Code Inside! 🎫',
    html: getWelcomeEmailHTML(discountCode)
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to: ${email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error };
  }
};

module.exports = {
  sendWelcomeEmail
};
