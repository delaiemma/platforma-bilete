const pool = require('../config/database');

/**
 * Purchase model for managing ticket purchases and analytics
 * @class Purchase
 */
class Purchase {
    /**
     * Creates a new purchase record
     * @param {number} userId - The ID of the user making the purchase
     * @param {number} eventId - The ID of the event being purchased
     * @param {number} quantity - Number of tickets purchased
     * @param {number} totalPrice - Total price of the purchase
     * @returns {Promise<Object>} Created purchase object
     */
    static async create(userId, eventId, quantity, totalPrice) {
        const result = await pool.query(
            'INSERT INTO purchases (user_id, event_id, quantity, total_price) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, eventId, quantity, totalPrice]
        );
        return result.rows[0];
    }

    /**
     * Retrieves recent purchases with user and event details
     * @param {number} [limit=20] - Maximum number of purchases to retrieve
     * @returns {Promise<Array>} Array of recent purchases
     */
    static async getRecent(limit = 20) {
        const result = await pool.query(`
            SELECT
                p.purchase_id,
                p.purchase_date,
                p.quantity,
                p.total_price,
                p.status,
                u.name as user_name,
                e.title as event_title
            FROM purchases p
            JOIN "user" u ON p.user_id = u.user_id
            JOIN event e ON p.event_id = e.event_id
            ORDER BY p.purchase_date DESC
            LIMIT $1
        `, [limit]);
        return result.rows;
    }

    /**
     * Calculates total revenue from all non-cancelled purchases
     * @returns {Promise<number>} Total revenue amount
     */
    static async getTotalRevenue() {
        const result = await pool.query(`SELECT COALESCE(SUM(total_price), 0) as total FROM purchases WHERE status != 'cancelled'`);
        return parseFloat(result.rows[0].total);
    }

    /**
     * Calculates total tickets sold from all non-cancelled purchases
     * @returns {Promise<number>} Total number of tickets sold
     */
    static async getTotalTicketsSold() {
        const result = await pool.query(`SELECT COALESCE(SUM(quantity), 0) as total FROM purchases WHERE status != 'cancelled'`);
        return parseInt(result.rows[0].total);
    }

    /**
     * Retrieves daily revenue data for a specified period
     * @param {number} [days=30] - Number of days to look back
     * @returns {Promise<Array>} Array of daily revenue data
     */
    static async getRevenueOverTime(days = 30) {
        const result = await pool.query(`
            SELECT
                DATE(purchase_date) as date,
                COALESCE(SUM(total_price), 0) as revenue
            FROM purchases
            WHERE purchase_date >= CURRENT_DATE - INTERVAL '${days} days'
                AND status != 'cancelled'
            GROUP BY DATE(purchase_date)
            ORDER BY date ASC
        `);
        return result.rows;
    }

    /**
     * Retrieves top events ranked by revenue
     * @param {number} [limit=5] - Maximum number of events to retrieve
     * @returns {Promise<Array>} Array of events with revenue data
     */
    static async getTopEventsByRevenue(limit = 5) {
        const result = await pool.query(`
            SELECT
                e.title,
                COALESCE(SUM(p.total_price), 0) as revenue
            FROM event e
            LEFT JOIN purchases p ON e.event_id = p.event_id AND p.status != 'cancelled'
            GROUP BY e.event_id, e.title
            ORDER BY revenue DESC
            LIMIT $1
        `, [limit]);
        return result.rows;
    }

    /**
     * Retrieves top events ranked by number of tickets sold
     * @param {number} [limit=10] - Maximum number of events to retrieve
     * @returns {Promise<Array>} Array of events with sales data
     */
    static async getSalesByEvent(limit = 10) {
        const result = await pool.query(`
            SELECT
                e.title,
                COALESCE(SUM(p.quantity), 0) as tickets_sold
            FROM event e
            LEFT JOIN purchases p ON e.event_id = p.event_id AND p.status != 'cancelled'
            GROUP BY e.event_id, e.title
            ORDER BY tickets_sold DESC
            LIMIT $1
        `, [limit]);
        return result.rows;
    }

    /**
     * Retrieves a purchase by its ID with event details
     * @param {number} purchaseId - The unique identifier of the purchase
     * @returns {Promise<Object>} Purchase object with event date
     */
    static async getById(purchaseId) {
        const result = await pool.query(
            `SELECT p.*, e.date, e.time, e.event_id as ev_id
             FROM purchases p
             JOIN event e ON p.event_id = e.event_id
             WHERE p.purchase_id = $1`,
            [purchaseId]
        );
        return result.rows[0];
    }

    /**
     * Cancels a purchase by setting its status to cancelled
     * @param {number} purchaseId - The unique identifier of the purchase
     * @returns {Promise<Object>} Updated purchase object
     */
    static async cancel(purchaseId) {
        const result = await pool.query(
            `UPDATE purchases SET status = 'cancelled' WHERE purchase_id = $1 RETURNING *`,
            [purchaseId]
        );
        return result.rows[0];
    }
}

module.exports = Purchase;
