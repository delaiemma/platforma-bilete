const pool = require('../config/database');

/**
 * Reservation model for managing temporary cart reservations
 * @class Reservation
 */
class Reservation {
    /**
     * Creates or updates a cart reservation with 15-minute expiration
     * @param {number} userId - The unique identifier of the user
     * @param {number} eventId - The unique identifier of the event
     * @param {number} quantity - Number of tickets to reserve
     * @returns {Promise<Object>} Created or updated reservation object
     */
    static async create(userId, eventId, quantity) {
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        const result = await pool.query(
            `INSERT INTO cart_reservations (user_id, event_id, quantity, expires_at)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (user_id, event_id)
             DO UPDATE SET
                quantity = EXCLUDED.quantity,
                expires_at = EXCLUDED.expires_at,
                created_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [userId, eventId, quantity, expiresAt]
        );

        return result.rows[0];
    }

    /**
     * Retrieves an active reservation for a user and event
     * @param {number} userId - The unique identifier of the user
     * @param {number} eventId - The unique identifier of the event
     * @returns {Promise<Object>} Reservation object if active, undefined otherwise
     */
    static async getByUserAndEvent(userId, eventId) {
        const result = await pool.query(
            `SELECT * FROM cart_reservations
             WHERE user_id = $1 AND event_id = $2 AND expires_at > NOW()`,
            [userId, eventId]
        );

        return result.rows[0];
    }

    /**
     * Retrieves all active reservations for a user with event details
     * @param {number} userId - The unique identifier of the user
     * @returns {Promise<Array>} Array of active reservation objects with event information
     */
    static async getByUser(userId) {
        const result = await pool.query(
            `SELECT cr.*, e.title, e.price
             FROM cart_reservations cr
             JOIN event e ON cr.event_id = e.event_id
             WHERE cr.user_id = $1 AND cr.expires_at > NOW()
             ORDER BY cr.created_at DESC`,
            [userId]
        );

        return result.rows;
    }

    /**
     * Calculates total reserved tickets for an event
     * @param {number} eventId - The unique identifier of the event
     * @returns {Promise<number>} Total number of reserved tickets
     */
    static async getTotalReservedByEvent(eventId) {
        const result = await pool.query(
            `SELECT COALESCE(SUM(quantity), 0) as total_reserved
             FROM cart_reservations
             WHERE event_id = $1 AND expires_at > NOW()`,
            [eventId]
        );

        return parseInt(result.rows[0].total_reserved);
    }

    /**
     * Updates the quantity of a reservation and extends expiration
     * @param {number} userId - The unique identifier of the user
     * @param {number} eventId - The unique identifier of the event
     * @param {number} quantity - New quantity value
     * @returns {Promise<Object>} Updated reservation object
     */
    static async updateQuantity(userId, eventId, quantity) {
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        const result = await pool.query(
            `INSERT INTO cart_reservations (user_id, event_id, quantity, expires_at)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (user_id, event_id)
             DO UPDATE SET
                quantity = EXCLUDED.quantity,
                expires_at = EXCLUDED.expires_at,
                created_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [userId, eventId, quantity, expiresAt]
        );

        return result.rows[0];
    }

    /**
     * Deletes a reservation for a user and event
     * @param {number} userId - The unique identifier of the user
     * @param {number} eventId - The unique identifier of the event
     * @returns {Promise<void>}
     */
    static async delete(userId, eventId) {
        await pool.query(
            `DELETE FROM cart_reservations
             WHERE user_id = $1 AND event_id = $2`,
            [userId, eventId]
        );
    }

    /**
     * Deletes all expired reservations
     * @returns {Promise<Array>} Array of deleted reservation objects
     */
    static async deleteExpired() {
        const result = await pool.query(
            `DELETE FROM cart_reservations
             WHERE expires_at <= NOW()
             RETURNING *`
        );

        return result.rows;
    }

    /**
     * Retrieves all expired reservations
     * @returns {Promise<Array>} Array of expired reservation objects
     */
    static async getExpired() {
        const result = await pool.query(
            `SELECT * FROM cart_reservations
             WHERE expires_at <= NOW()`
        );

        return result.rows;
    }
}

module.exports = Reservation;
