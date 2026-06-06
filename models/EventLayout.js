const pool = require('../config/database');

/**
 * EventLayout model for managing event-specific seating layouts and pricing
 * @class EventLayout
 */
class EventLayout {

    /**
     * Assigns a venue layout to an event with zone-specific pricing
     * @param {number} eventId - The unique identifier of the event
     * @param {number} layoutId - The unique identifier of the venue layout
     * @param {Array<Object>} zonePricing - Array of zone pricing objects
     * @param {number} zonePricing[].zone_id - Zone identifier
     * @param {number} zonePricing[].price - Price for the zone
     * @returns {Promise<Object>} Created event layout object
     * @throws {Error} If event already has a layout or if there are insufficient seats
     */
    static async assignLayoutToEvent(eventId, layoutId, zonePricing) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const existingResult = await client.query(
                `SELECT * FROM event_layouts WHERE event_id = $1`,
                [eventId]
            );

            if (existingResult.rows.length > 0) {
                const ticketsResult = await client.query(
                    `SELECT COUNT(*) as count FROM ticket_seats WHERE event_id = $1`,
                    [eventId]
                );
                if (parseInt(ticketsResult.rows[0].count) > 0) {
                    throw new Error('Cannot change layout: tickets with allocated seats have already been sold');
                }
                await client.query(`DELETE FROM event_zone_pricing WHERE event_id = $1`, [eventId]);
                await client.query(`DELETE FROM event_layouts WHERE event_id = $1`, [eventId]);
            }

            const purchasesResult = await client.query(
                `SELECT purchase_id, quantity, total_price FROM purchases WHERE event_id = $1 ORDER BY purchase_id ASC`,
                [eventId]
            );
            const existingPurchases = purchasesResult.rows;

            const layoutResult = await client.query(
                `INSERT INTO event_layouts (event_id, layout_id)
                 VALUES ($1, $2)
                 RETURNING *`,
                [eventId, layoutId]
            );

            if (zonePricing && zonePricing.length > 0) {
                for (const pricing of zonePricing) {
                    await client.query(
                        `INSERT INTO event_zone_pricing (event_id, zone_id, price)
                         VALUES ($1, $2, $3)`,
                        [eventId, pricing.zone_id, pricing.price]
                    );
                }
            }

            if (existingPurchases.length > 0) {

                const rowsResult = await client.query(
                    `SELECT lr.*, sz.zone_id
                     FROM layout_rows lr
                     JOIN seat_zones sz ON lr.zone_id = sz.zone_id
                     WHERE lr.layout_id = $1
                     ORDER BY lr.row_order ASC`,
                    [layoutId]
                );
                const rows = rowsResult.rows;

                const allSeats = [];
                rows.forEach(row => {
                    for (let seatNum = 1; seatNum <= row.seats_in_row; seatNum++) {
                        allSeats.push({
                            row_letter: row.row_letter,
                            seat_number: seatNum,
                            zone_id: row.zone_id
                        });
                    }
                });

                for (let i = allSeats.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [allSeats[i], allSeats[j]] = [allSeats[j], allSeats[i]];
                }

                const totalTicketsToMigrate = existingPurchases.reduce((sum, p) => sum + p.quantity, 0);

                if (totalTicketsToMigrate > allSeats.length) {
                    throw new Error('Not enough seats in layout for existing purchases');
                }

                let seatIndex = 0;
                for (const purchase of existingPurchases) {
                    const QRCode = require('qrcode');

                    for (let i = 0; i < purchase.quantity; i++) {
                        const seat = allSeats[seatIndex++];
                        const ticketId = `TKT-${purchase.purchase_id.toString().padStart(4, '0')}-${eventId.toString().padStart(4, '0')}-${seat.row_letter}${seat.seat_number}`;
                        const qrCodeData = await QRCode.toDataURL(ticketId);

                        await client.query(
                            `INSERT INTO ticket_seats (purchase_id, event_id, row_letter, seat_number, zone_id, ticket_id, qr_code)
                             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                            [purchase.purchase_id, eventId, seat.row_letter, seat.seat_number, seat.zone_id, ticketId, qrCodeData]
                        );
                    }
                }

                console.log(`✅ Migrated ${existingPurchases.length} existing purchase(s) to seat-based for event ${eventId} (${totalTicketsToMigrate} tickets assigned randomly)`);
            }

            const totalSeatsResult = await client.query(
                `SELECT SUM(seats_in_row) as total FROM layout_rows WHERE layout_id = $1`,
                [layoutId]
            );
            const totalSeats = parseInt(totalSeatsResult.rows[0].total) || 0;

            const minPrice = Math.min(...zonePricing.map(zp => parseFloat(zp.price)));

            await client.query(
                `UPDATE event
                 SET has_seating = TRUE,
                     available_tickets = $1,
                     price = $2
                 WHERE event_id = $3`,
                [totalSeats, minPrice, eventId]
            );

            console.log(`✅ Updated event ${eventId}: total seats = ${totalSeats}, min price = $${minPrice}`);

            await client.query('COMMIT');

            return layoutResult.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Retrieves the layout assigned to an event with zones and rows
     * @param {number} eventId - The unique identifier of the event
     * @returns {Promise<Object|null>} Event layout object with zones and rows, or null if not found
     */
    static async getByEventId(eventId) {
        const client = await pool.connect();

        try {

            const layoutResult = await client.query(
                `SELECT el.*, vl.name as layout_name, vl.description as layout_description
                 FROM event_layouts el
                 JOIN venue_layouts vl ON el.layout_id = vl.layout_id
                 WHERE el.event_id = $1`,
                [eventId]
            );

            if (layoutResult.rows.length === 0) {
                return null;
            }

            const eventLayout = layoutResult.rows[0];

            const zonesResult = await client.query(
                `SELECT sz.*, ezp.price
                 FROM seat_zones sz
                 JOIN event_zone_pricing ezp ON sz.zone_id = ezp.zone_id
                 WHERE ezp.event_id = $1
                 ORDER BY sz.display_order, sz.zone_id`,
                [eventId]
            );

            eventLayout.zones = zonesResult.rows;

            const rowsResult = await client.query(
                `SELECT lr.*, sz.name as zone_name, sz.color as zone_color, ezp.price as zone_price
                 FROM layout_rows lr
                 JOIN seat_zones sz ON lr.zone_id = sz.zone_id
                 JOIN event_zone_pricing ezp ON sz.zone_id = ezp.zone_id AND ezp.event_id = $1
                 WHERE lr.layout_id = $2
                 ORDER BY lr.row_order`,
                [eventId, eventLayout.layout_id]
            );

            eventLayout.rows = rowsResult.rows;

            return eventLayout;
        } finally {
            client.release();
        }
    }

    /**
     * Updates zone pricing for an event
     * @param {number} eventId - The unique identifier of the event
     * @param {Array<Object>} zonePricing - Array of zone pricing objects
     * @param {number} zonePricing[].zone_id - Zone identifier
     * @param {number} zonePricing[].price - New price for the zone
     * @returns {Promise<boolean>} True if update was successful
     * @throws {Error} If updating pricing fails
     */
    static async updatePricing(eventId, zonePricing) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            await client.query(
                `DELETE FROM event_zone_pricing WHERE event_id = $1`,
                [eventId]
            );

            for (const pricing of zonePricing) {
                await client.query(
                    `INSERT INTO event_zone_pricing (event_id, zone_id, price)
                     VALUES ($1, $2, $3)`,
                    [eventId, pricing.zone_id, pricing.price]
                );
            }

            await client.query('COMMIT');

            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Removes the layout assignment from an event
     * @param {number} eventId - The unique identifier of the event
     * @returns {Promise<boolean>} True if removal was successful
     * @throws {Error} If tickets have been sold or seats are reserved
     */
    static async removeLayout(eventId) {
        const client = await pool.connect();

        try {

            const ticketsResult = await client.query(
                `SELECT COUNT(*) as count FROM ticket_seats WHERE event_id = $1`,
                [eventId]
            );

            if (parseInt(ticketsResult.rows[0].count) > 0) {
                throw new Error('Cannot remove layout: tickets have been sold for this event');
            }

            const reservationsResult = await client.query(
                `SELECT COUNT(*) as count FROM seat_reservations WHERE event_id = $1`,
                [eventId]
            );

            if (parseInt(reservationsResult.rows[0].count) > 0) {
                throw new Error('Cannot remove layout: seats are currently reserved for this event');
            }

            await client.query('BEGIN');

            await client.query(
                `DELETE FROM event_zone_pricing WHERE event_id = $1`,
                [eventId]
            );

            const result = await client.query(
                `DELETE FROM event_layouts WHERE event_id = $1 RETURNING *`,
                [eventId]
            );

            await client.query(
                `UPDATE event SET has_seating = FALSE WHERE event_id = $1`,
                [eventId]
            );

            await client.query('COMMIT');

            return result.rows.length > 0;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Retrieves all events using a specific layout
     * @param {number} layoutId - The unique identifier of the layout
     * @returns {Promise<Array>} Array of events using the layout
     */
    static async getEventsByLayoutId(layoutId) {
        const result = await pool.query(
            `SELECT e.*, el.event_layout_id
             FROM event e
             JOIN event_layouts el ON e.event_id = el.event_id
             WHERE el.layout_id = $1
             ORDER BY e.date DESC`,
            [layoutId]
        );

        return result.rows;
    }
}

module.exports = EventLayout;
