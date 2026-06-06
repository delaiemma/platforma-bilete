/**
 * @file Newsletter Controller
 * @description Manages newsletter subscriptions including subscribing, unsubscribing,
 * and generating welcome discount codes for new subscribers.
 */

const pool = require('../config/database');
const { sendWelcomeEmail } = require('../config/emailService');

/**
 * Generates a unique discount code for newsletter subscribers.
 *
 * @returns {string} Generated discount code in format WELCOME10-XXXXX
 */
const generateDiscountCode = () => {
  const randomString = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `WELCOME10-${randomString}`;
};

/**
 * Subscribes a user to the newsletter and creates a welcome discount code.
 *
 * @param {express.Request} req - Express request object containing email in body
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {400} If email is missing, invalid format, or already subscribed
 * @throws {500} If subscription fails
 *
 * Side effects:
 * - Validates email format
 * - Creates newsletter subscriber record in database
 * - Generates and creates a 10% discount code valid for 2 days
 * - Sends welcome email with discount code
 * - Uses database transaction for consistency
 */
const subscribe = async (req, res) => {
  const { email } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const existingSubscriber = await client.query(
      'SELECT * FROM newsletter_subscribers WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (existingSubscriber.rows.length > 0) {
      await client.query('ROLLBACK');

      if (!existingSubscriber.rows[0].is_active) {
        await client.query(
          'UPDATE newsletter_subscribers SET is_active = true, subscribed_at = CURRENT_TIMESTAMP WHERE email = $1',
          [email.toLowerCase().trim()]
        );
        return res.status(200).json({ message: 'Successfully resubscribed to newsletter' });
      }
      return res.status(400).json({ message: 'Email already subscribed' });
    }

    const discountCode = generateDiscountCode();

    const validFrom = new Date();
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 2);

    await client.query(
      `INSERT INTO discount_codes (code, description, discount_type, discount_value, valid_from, valid_until, first_purchase_only, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        discountCode,
        'Welcome newsletter discount - 10% off',
        'percentage',
        10,
        validFrom,
        validUntil,
        true,
        true
      ]
    );

    await client.query(
      'INSERT INTO newsletter_subscribers (email) VALUES ($1)',
      [email.toLowerCase().trim()]
    );

    await client.query('COMMIT');

    sendWelcomeEmail(email, discountCode).catch(err => {
      console.error('Failed to send welcome email:', err);
    });

    res.status(201).json({
      message: 'Successfully subscribed to newsletter! Check your email for your discount code.',
      discountCode: discountCode
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ message: 'Failed to subscribe to newsletter' });
  } finally {
    client.release();
  }
};

/**
 * Unsubscribes a user from the newsletter.
 *
 * @param {express.Request} req - Express request object containing email in body
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {400} If email is missing
 * @throws {404} If email is not found in subscribers
 * @throws {500} If unsubscribe fails
 *
 * Side effects:
 * - Sets is_active to false in database
 * - Does not delete the subscriber record
 */
const unsubscribe = async (req, res) => {
  const { email } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const result = await pool.query(
      'UPDATE newsletter_subscribers SET is_active = false WHERE email = $1 RETURNING *',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Email not found' });
    }

    res.status(200).json({ message: 'Successfully unsubscribed from newsletter' });
  } catch (error) {
    console.error('Newsletter unsubscription error:', error);
    res.status(500).json({ message: 'Failed to unsubscribe from newsletter' });
  }
};

/**
 * Retrieves all newsletter subscribers with their status.
 *
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {500} If retrieval fails
 *
 * Side effects:
 * - Queries all subscribers from database
 * - Returns count of total and active subscribers
 */
const getAllSubscribers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT subscriber_id, email, subscribed_at, is_active FROM newsletter_subscribers ORDER BY subscribed_at DESC'
    );

    res.status(200).json({
      subscribers: result.rows,
      total: result.rows.length,
      active: result.rows.filter(s => s.is_active).length
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({ message: 'Failed to fetch subscribers' });
  }
};

module.exports = {
  subscribe,
  unsubscribe,
  getAllSubscribers
};
