const pool = require('../config/database');

/**
 * TicketSeat model for managing purchased seat tickets with QR codes
 * @class TicketSeat
 */
class TicketSeat {

    /**
     * Creates a new ticket seat record
     * @param {number} purchaseId - The unique identifier of the purchase
     * @param {number} eventId - The unique identifier of the event
     * @param {Object} seatData - Seat data object
     * @param {string} seatData.row_letter - Row letter designation
     * @param {number} seatData.seat_number - Seat number
     * @param {number} seatData.zone_id - Zone identifier
     * @param {string} seatData.ticket_id - Unique ticket identifier
     * @param {string} seatData.qr_code - QR code data URL
     * @returns {Promise<Object>} Created ticket seat object
     */
    static async create(purchaseId, eventId, seatData) {
        const { row_letter, seat_number, zone_id, ticket_id, qr_code } = seatData;

        const result = await pool.query(
            `INSERT INTO ticket_seats (purchase_id, event_id, row_letter, seat_number, zone_id, ticket_id, qr_code)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [purchaseId, eventId, row_letter, seat_number, zone_id, ticket_id, qr_code]
        );

        return result.rows[0];
    }

    /**
     * Retrieves all ticket seats for a specific purchase
     * @param {number} purchaseId - The unique identifier of the purchase
     * @returns {Promise<Array>} Array of ticket seat objects with zone information
     */
    static async getByPurchaseId(purchaseId) {
        const result = await pool.query(
            `SELECT ts.*, sz.name as zone_name, sz.color as zone_color
             FROM ticket_seats ts
             JOIN seat_zones sz ON ts.zone_id = sz.zone_id
             WHERE ts.purchase_id = $1
             ORDER BY ts.row_letter, ts.seat_number`,
            [purchaseId]
        );

        return result.rows;
    }

    /**
     * Retrieves all ticket seats for a specific event
     * @param {number} eventId - The unique identifier of the event
     * @returns {Promise<Array>} Array of ticket seat objects with zone information
     */
    static async getByEventId(eventId) {
        const result = await pool.query(
            `SELECT ts.*, sz.name as zone_name
             FROM ticket_seats ts
             JOIN seat_zones sz ON ts.zone_id = sz.zone_id
             WHERE ts.event_id = $1
             ORDER BY ts.row_letter, ts.seat_number`,
            [eventId]
        );

        return result.rows;
    }

    /**
     * Retrieves a ticket seat by its ticket ID with full event details
     * @param {string} ticketId - The unique ticket identifier
     * @returns {Promise<Object|null>} Ticket seat object with event and zone details, or null if not found
     */
    static async getByTicketId(ticketId) {
        const result = await pool.query(
            `SELECT ts.*, e.title as event_title, e.location, e.city, e.date, e.time,
                    sz.name as zone_name, sz.color as zone_color
             FROM ticket_seats ts
             JOIN event e ON ts.event_id = e.event_id
             JOIN seat_zones sz ON ts.zone_id = sz.zone_id
             WHERE ts.ticket_id = $1`,
            [ticketId]
        );

        return result.rows[0] || null;
    }

    /**
     * Retrieves all ticket seats for a specific user across all purchases
     * @param {number} userId - The unique identifier of the user
     * @returns {Promise<Array>} Array of ticket seat objects with event and purchase details
     */
    static async getByUserId(userId) {
        const result = await pool.query(
            `SELECT ts.*, e.title as event_title, e.location, e.city, e.date, e.time,
                    sz.name as zone_name, p.purchase_date
             FROM ticket_seats ts
             JOIN purchases p ON ts.purchase_id = p.purchase_id
             JOIN event e ON ts.event_id = e.event_id
             JOIN seat_zones sz ON ts.zone_id = sz.zone_id
             WHERE p.user_id = $1
             ORDER BY p.purchase_date DESC, e.date DESC`,
            [userId]
        );

        return result.rows;
    }

    /**
     * Generates a unique ticket ID from purchase and seat information
     * @param {number} purchaseId - The unique identifier of the purchase
     * @param {number} eventId - The unique identifier of the event
     * @param {string} rowLetter - Row letter designation
     * @param {number} seatNumber - Seat number
     * @returns {string} Generated ticket ID in format TKT-PPPP-EEEE-RRR
     */
    static generateTicketId(purchaseId, eventId, rowLetter, seatNumber) {
        const paddedPurchaseId = purchaseId.toString().padStart(4, '0');
        const paddedEventId = eventId.toString().padStart(4, '0');
        return `TKT-${paddedPurchaseId}-${paddedEventId}-${rowLetter}${seatNumber}`;
    }

    /**
     * Checks if a specific seat has been sold for an event
     * @param {number} eventId - The unique identifier of the event
     * @param {string} rowLetter - Row letter designation
     * @param {number} seatNumber - Seat number
     * @returns {Promise<boolean>} True if seat has been sold
     */
    static async isSeatSold(eventId, rowLetter, seatNumber) {
        const result = await pool.query(
            `SELECT COUNT(*) as count
             FROM ticket_seats
             WHERE event_id = $1 AND row_letter = $2 AND seat_number = $3`,
            [eventId, rowLetter, seatNumber]
        );

        return parseInt(result.rows[0].count) > 0;
    }

    /**
     * Retrieves the status map of all seats for an event (sold/reserved/available)
     * @param {number} eventId - The unique identifier of the event
     * @returns {Promise<Object>} Object mapping seat keys to status objects
     */
    static async getSeatMapStatus(eventId) {
        const client = await pool.connect();

        try {

            const soldResult = await client.query(
                `SELECT row_letter, seat_number FROM ticket_seats WHERE event_id = $1`,
                [eventId]
            );

            const reservedResult = await client.query(
                `SELECT row_letter, seat_number, user_id FROM seat_reservations
                 WHERE event_id = $1 AND expires_at > NOW()`,
                [eventId]
            );

            const seatMap = {};

            soldResult.rows.forEach(seat => {
                const key = `${seat.row_letter}-${seat.seat_number}`;
                seatMap[key] = { status: 'sold' };
            });

            reservedResult.rows.forEach(seat => {
                const key = `${seat.row_letter}-${seat.seat_number}`;
                if (!seatMap[key]) {
                    seatMap[key] = { status: 'reserved', user_id: seat.user_id };
                }
            });

            return seatMap;
        } finally {
            client.release();
        }
    }

    /**
     * Creates multiple ticket seats in a single transaction
     * @param {number} purchaseId - The unique identifier of the purchase
     * @param {number} eventId - The unique identifier of the event
     * @param {Array<Object>} seats - Array of seat data objects
     * @param {string} seats[].row_letter - Row letter designation
     * @param {number} seats[].seat_number - Seat number
     * @param {number} seats[].zone_id - Zone identifier
     * @param {string} seats[].ticket_id - Unique ticket identifier
     * @param {string} seats[].qr_code - QR code data URL
     * @returns {Promise<Array>} Array of created ticket seat objects
     * @throws {Error} If bulk creation fails
     */
    static async createBulk(purchaseId, eventId, seats) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const createdSeats = [];

            for (const seat of seats) {
                const result = await client.query(
                    `INSERT INTO ticket_seats (purchase_id, event_id, row_letter, seat_number, zone_id, ticket_id, qr_code)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)
                     RETURNING *`,
                    [purchaseId, eventId, seat.row_letter, seat.seat_number, seat.zone_id, seat.ticket_id, seat.qr_code]
                );

                createdSeats.push(result.rows[0]);
            }

            await client.query('COMMIT');

            return createdSeats;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = TicketSeat;
