const pool = require('../config/database');

/**
 * Payment model for managing payment transactions via Stripe
 * @class Payment
 */
class Payment {

  /**
   * Creates a new payment record
   * @param {Object} paymentData - Payment data object
   * @param {number} paymentData.purchaseId - Purchase identifier
   * @param {number} paymentData.userId - User identifier
   * @param {string} paymentData.stripePaymentIntentId - Stripe payment intent ID
   * @param {string} paymentData.stripeClientSecret - Stripe client secret
   * @param {number} paymentData.amount - Payment amount
   * @param {string} [paymentData.currency='ron'] - Currency code
   * @param {string} [paymentData.status='pending'] - Payment status
   * @returns {Promise<Object>} Created payment object
   */
  static async create(paymentData) {
    const {
      purchaseId,
      userId,
      stripePaymentIntentId,
      stripeClientSecret,
      amount,
      currency = 'ron',
      status = 'pending'
    } = paymentData;

    const result = await pool.query(
      `INSERT INTO payments (
        purchase_id, user_id, stripe_payment_intent_id, stripe_client_secret,
        amount, currency, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *`,
      [purchaseId, userId, stripePaymentIntentId, stripeClientSecret, amount, currency, status]
    );

    return result.rows[0];
  }

  /**
   * Retrieves a payment by its Stripe payment intent ID
   * @param {string} stripePaymentIntentId - Stripe payment intent ID
   * @returns {Promise<Object>} Payment object
   */
  static async getByStripeIntentId(stripePaymentIntentId) {
    const result = await pool.query(
      'SELECT * FROM payments WHERE stripe_payment_intent_id = $1',
      [stripePaymentIntentId]
    );
    return result.rows[0];
  }

  /**
   * Retrieves a payment by its ID
   * @param {number} paymentId - The unique identifier of the payment
   * @returns {Promise<Object>} Payment object
   */
  static async getById(paymentId) {
    const result = await pool.query(
      'SELECT * FROM payments WHERE payment_id = $1',
      [paymentId]
    );
    return result.rows[0];
  }

  /**
   * Retrieves all payments for a specific user with purchase details
   * @param {number} userId - The unique identifier of the user
   * @returns {Promise<Array>} Array of payment objects with purchase information
   */
  static async getByUserId(userId) {
    const result = await pool.query(
      `SELECT p.*, pur.quantity, pur.total_price, pur.created_at as purchase_date
       FROM payments p
       LEFT JOIN purchases pur ON p.purchase_id = pur.purchase_id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  /**
   * Updates the status of a payment
   * @param {string} stripePaymentIntentId - Stripe payment intent ID
   * @param {string} status - New payment status
   * @param {string} [errorMessage=null] - Error message if payment failed
   * @returns {Promise<Object>} Updated payment object
   */
  static async updateStatus(stripePaymentIntentId, status, errorMessage = null) {
    const completedAt = status === 'succeeded' ? 'NOW()' : null;

    const result = await pool.query(
      `UPDATE payments
       SET status = $1,
           updated_at = NOW(),
           completed_at = ${completedAt ? 'NOW()' : 'NULL'},
           last_payment_error = $2
       WHERE stripe_payment_intent_id = $3
       RETURNING *`,
      [status, errorMessage, stripePaymentIntentId]
    );

    return result.rows[0];
  }

  /**
   * Updates the purchase ID associated with a payment
   * @param {string} stripePaymentIntentId - Stripe payment intent ID
   * @param {number} purchaseId - The purchase identifier to associate
   * @returns {Promise<Object>} Updated payment object
   */
  static async updatePurchaseId(stripePaymentIntentId, purchaseId) {
    const result = await pool.query(
      `UPDATE payments
       SET purchase_id = $1, updated_at = NOW()
       WHERE stripe_payment_intent_id = $2
       RETURNING *`,
      [purchaseId, stripePaymentIntentId]
    );

    return result.rows[0];
  }

  /**
   * Retrieves payment statistics including total revenue and success rates
   * @returns {Promise<Object>} Object containing payment statistics
   */
  static async getStats() {
    const result = await pool.query(`
      SELECT
        COUNT(*) as total_payments,
        COUNT(CASE WHEN status = 'succeeded' THEN 1 END) as successful_payments,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments,
        SUM(CASE WHEN status = 'succeeded' THEN amount ELSE 0 END) as total_revenue
      FROM payments
    `);

    return result.rows[0];
  }

  /**
   * Deletes a payment record
   * @param {number} paymentId - The unique identifier of the payment
   * @returns {Promise<void>}
   */
  static async delete(paymentId) {
    await pool.query('DELETE FROM payments WHERE payment_id = $1', [paymentId]);
  }
}

module.exports = Payment;
