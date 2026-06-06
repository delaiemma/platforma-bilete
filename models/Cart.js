const pool = require('../config/database');

/**
 * Cart model for managing user shopping cart data
 * @class Cart
 */
class Cart {
    /**
     * Retrieves cart items for a specific user
     * @param {number} userId - The unique identifier of the user
     * @returns {Promise<Object>} Object mapping event IDs to quantities
     */
    static async getByUserId(userId) {
        const result = await pool.query(
            'SELECT event_id, quantity FROM cart WHERE user_id = $1',
            [parseInt(userId)]
        );
        return result.rows.reduce((acc, row) => {
            acc[row.event_id] = row.quantity;
            return acc;
        }, {});
    }

    /**
     * Adds an item to the cart or updates quantity if already exists
     * @param {number} userId - The unique identifier of the user
     * @param {number} eventId - The unique identifier of the event
     * @param {number} quantity - Number of tickets to add
     * @returns {Promise<void>}
     */
    static async add(userId, eventId, quantity) {
        await pool.query(
            `INSERT INTO cart (user_id, event_id, quantity)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id, event_id)
             DO UPDATE SET quantity = $3`,
            [parseInt(userId), parseInt(eventId), parseInt(quantity)]
        );
    }

    /**
     * Updates the quantity of an item in the cart
     * @param {number} userId - The unique identifier of the user
     * @param {number} eventId - The unique identifier of the event
     * @param {number} quantity - New quantity value
     * @returns {Promise<void>}
     */
    static async update(userId, eventId, quantity) {
        await pool.query(
            'UPDATE cart SET quantity = $3 WHERE user_id = $1 AND event_id = $2',
            [parseInt(userId), parseInt(eventId), parseInt(quantity)]
        );
    }

    /**
     * Removes an item from the cart
     * @param {number} userId - The unique identifier of the user
     * @param {number} eventId - The unique identifier of the event
     * @returns {Promise<void>}
     */
    static async remove(userId, eventId) {
        await pool.query(
            'DELETE FROM cart WHERE user_id = $1 AND event_id = $2',
            [parseInt(userId), parseInt(eventId)]
        );
    }

    /**
     * Clears all items from a user's cart
     * @param {number} userId - The unique identifier of the user
     * @returns {Promise<void>}
     */
    static async clear(userId) {
        await pool.query('DELETE FROM cart WHERE user_id = $1', [parseInt(userId)]);
    }

    /**
     * Creates the cart table if it does not exist
     * @returns {Promise<void>}
     */
    static async createTableIfNotExists() {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS cart (
                user_id INTEGER NOT NULL,
                event_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY(user_id, event_id)
            );
        `);
    }
}

module.exports = Cart;
