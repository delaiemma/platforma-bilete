const pool = require('../config/database');

/**
 * Favourite model for managing user favorite events
 * @class Favourite
 */
class Favourite {
    /**
     * Retrieves all favorite event IDs for a specific user
     * @param {number} userId - The unique identifier of the user
     * @returns {Promise<Array<string>>} Array of event IDs as strings
     */
    static async getByUserId(userId) {
        const result = await pool.query('SELECT event_id FROM favorites WHERE user_id = $1', [parseInt(userId)]);
        return result.rows.map(row => String(row.event_id));
    }

    /**
     * Adds an event to a user's favorites
     * @param {number} userId - The unique identifier of the user
     * @param {number} eventId - The unique identifier of the event
     * @returns {Promise<void>}
     */
    static async add(userId, eventId) {
        const existing = await pool.query(
            'SELECT * FROM favorites WHERE user_id = $1 AND event_id = $2',
            [parseInt(userId), parseInt(eventId)]
        );

        if (existing.rows.length === 0) {
            await pool.query(
                'INSERT INTO favorites (user_id, event_id) VALUES ($1, $2)',
                [parseInt(userId), parseInt(eventId)]
            );
        }
    }

    /**
     * Removes an event from a user's favorites
     * @param {number} userId - The unique identifier of the user
     * @param {number} eventId - The unique identifier of the event
     * @returns {Promise<void>}
     */
    static async remove(userId, eventId) {
        await pool.query(
            'DELETE FROM favorites WHERE user_id = $1 AND event_id = $2',
            [parseInt(userId), parseInt(eventId)]
        );
    }

    /**
     * Creates the favorites table if it does not exist
     * @returns {Promise<void>}
     */
    static async createTableIfNotExists() {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS favorites (
                user_id INTEGER NOT NULL,
                event_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY(user_id, event_id)
            );
        `);
    }
}

module.exports = Favourite;
