const pool = require('../config/database');

/**
 * SeatReservation model for managing seat-specific reservations
 * @class SeatReservation
 */
class SeatReservation {

    /**
     * Reserves specific seats for a user with 15-minute expiration
     * @param {number} userId - The unique identifier of the user
     * @param {number} eventId - The unique identifier of the event
     * @param {Array<Object>} seats - Array of seat objects to reserve
     * @param {string} seats[].row_letter - Row letter designation
     * @param {number} seats[].seat_number - Seat number
     * @param {number} seats[].zone_id - Zone identifier
     * @returns {Promise<Array>} Array of created reservation objects
     * @throws {Error} If seats are already sold or reserved by another user
     */
    static async reserveSeats(userId, eventId, seats) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE');

            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
            const createdReservations = [];

            for (const seat of seats) {
                const { row_letter, seat_number, zone_id } = seat;

                const soldCheck = await client.query(
                    `SELECT * FROM ticket_seats
                     WHERE event_id = $1 AND row_letter = $2 AND seat_number = $3`,
                    [eventId, row_letter, seat_number]
                );

                if (soldCheck.rows.length > 0) {
                    throw new Error(`Seat ${row_letter}${seat_number} has already been sold`);
                }

                const reservationCheck = await client.query(
                    `SELECT * FROM seat_reservations
                     WHERE event_id = $1 AND row_letter = $2 AND seat_number = $3
                       AND expires_at > NOW()
                       AND user_id != $4`,
                    [eventId, row_letter, seat_number, userId]
                );

                if (reservationCheck.rows.length > 0) {
                    throw new Error(`Seat ${row_letter}${seat_number} is already reserved by another user`);
                }

                const result = await client.query(
                    `INSERT INTO seat_reservations (user_id, event_id, row_letter, seat_number, zone_id, expires_at)
                     VALUES ($1, $2, $3, $4, $5, $6)
                     ON CONFLICT (event_id, row_letter, seat_number)
                     DO UPDATE SET
                        user_id = EXCLUDED.user_id,
                        zone_id = EXCLUDED.zone_id,
                        created_at = CURRENT_TIMESTAMP,
                        expires_at = EXCLUDED.expires_at
                     RETURNING *`,
                    [userId, eventId, row_letter, seat_number, zone_id, expiresAt]
                );

                createdReservations.push(result.rows[0]);
            }

            await client.query('COMMIT');

            return createdReservations;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Releases seat reservations for a user
     * @param {number} userId - The unique identifier of the user
     * @param {number} eventId - The unique identifier of the event
     * @param {Array<Object>} seats - Array of seat objects to release
     * @param {string} seats[].row_letter - Row letter designation
     * @param {number} seats[].seat_number - Seat number
     * @returns {Promise<number>} Number of seats released
     * @throws {Error} If releasing seats fails
     */
    static async releaseSeats(userId, eventId, seats) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            let deletedCount = 0;

            for (const seat of seats) {
                const result = await client.query(
                    `DELETE FROM seat_reservations
                     WHERE user_id = $1 AND event_id = $2 AND row_letter = $3 AND seat_number = $4
                     RETURNING *`,
                    [userId, eventId, seat.row_letter, seat.seat_number]
                );

                deletedCount += result.rows.length;
            }

            await client.query('COMMIT');

            return deletedCount;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Retrieves active seat reservations for a user and event
     * @param {number} userId - The unique identifier of the user
     * @param {number} eventId - The unique identifier of the event
     * @returns {Promise<Array>} Array of active seat reservations with zone information
     */
    static async getByUserAndEvent(userId, eventId) {
        const result = await pool.query(
            `SELECT sr.*, sz.name as zone_name, sz.color as zone_color
             FROM seat_reservations sr
             JOIN seat_zones sz ON sr.zone_id = sz.zone_id
             WHERE sr.user_id = $1 AND sr.event_id = $2 AND sr.expires_at > NOW()
             ORDER BY sr.row_letter, sr.seat_number`,
            [userId, eventId]
        );

        return result.rows;
    }

    /**
     * Retrieves all active seat reservations for an event
     * @param {number} eventId - The unique identifier of the event
     * @returns {Promise<Array>} Array of active seat reservations with zone information
     */
    static async getByEvent(eventId) {
        const result = await pool.query(
            `SELECT sr.*, sz.name as zone_name
             FROM seat_reservations sr
             JOIN seat_zones sz ON sr.zone_id = sz.zone_id
             WHERE sr.event_id = $1 AND sr.expires_at > NOW()
             ORDER BY sr.row_letter, sr.seat_number`,
            [eventId]
        );

        return result.rows;
    }

    /**
     * Retrieves all expired seat reservations
     * @returns {Promise<Array>} Array of expired seat reservation objects
     */
    static async getExpired() {
        const result = await pool.query(
            `SELECT * FROM seat_reservations
             WHERE expires_at <= NOW()`
        );

        return result.rows;
    }

    /**
     * Deletes all expired seat reservations
     * @returns {Promise<number>} Number of expired reservations deleted
     */
    static async deleteExpired() {
        const result = await pool.query(
            `DELETE FROM seat_reservations
             WHERE expires_at <= NOW()
             RETURNING *`
        );

        return result.rows.length;
    }

    /**
     * Extends the expiration time of all active reservations for a user and event
     * @param {number} userId - The unique identifier of the user
     * @param {number} eventId - The unique identifier of the event
     * @returns {Promise<number>} Number of reservations extended
     */
    static async extendReservation(userId, eventId) {
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        const result = await pool.query(
            `UPDATE seat_reservations
             SET expires_at = $1, created_at = CURRENT_TIMESTAMP
             WHERE user_id = $2 AND event_id = $3 AND expires_at > NOW()
             RETURNING *`,
            [expiresAt, userId, eventId]
        );

        return result.rows.length;
    }

    /**
     * Retrieves all active seat reservations for a user across all events
     * @param {number} userId - The unique identifier of the user
     * @returns {Promise<Array>} Array of active seat reservations with event and zone information
     */
    static async getByUser(userId) {
        const result = await pool.query(
            `SELECT sr.*, e.title as event_title, sz.name as zone_name
             FROM seat_reservations sr
             JOIN event e ON sr.event_id = e.event_id
             JOIN seat_zones sz ON sr.zone_id = sz.zone_id
             WHERE sr.user_id = $1 AND sr.expires_at > NOW()
             ORDER BY sr.expires_at ASC`,
            [userId]
        );

        return result.rows;
    }

    /**
     * Deletes all seat reservations for a user and event
     * @param {number} userId - The unique identifier of the user
     * @param {number} eventId - The unique identifier of the event
     * @returns {Promise<number>} Number of reservations deleted
     */
    static async deleteByUserAndEvent(userId, eventId) {
        const result = await pool.query(
            `DELETE FROM seat_reservations
             WHERE user_id = $1 AND event_id = $2
             RETURNING *`,
            [userId, eventId]
        );

        return result.rows.length;
    }
}

module.exports = SeatReservation;
