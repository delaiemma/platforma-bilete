const pool = require('../config/database');

/**
 * Event model for managing event data and availability
 * @class Event
 */
class Event {
    /**
     * Retrieves all events with available tickets
     * @returns {Promise<Array>} Array of events with reservation data
     */
    static async getAll() {
        const result = await pool.query(`
            SELECT e.*,
                   el.layout_id,
                   COALESCE(SUM(cr.quantity), 0) as reserved_tickets,
                   e.available_tickets - COALESCE(SUM(cr.quantity), 0) as truly_available
            FROM event e
            LEFT JOIN cart_reservations cr ON e.event_id = cr.event_id AND cr.expires_at > NOW()
            LEFT JOIN event_layouts el ON e.event_id = el.event_id
            WHERE e.available_tickets > 0
            GROUP BY e.event_id, el.layout_id
            ORDER BY e.event_id
        `);
        return result.rows;
    }

    /**
     * Retrieves upcoming events with available tickets
     * @returns {Promise<Array>} Array of future events ordered by date
     */
    static async getUpcomingEvents() {
        const result = await pool.query(`
            SELECT e.*,
                   el.layout_id,
                   COALESCE(SUM(cr.quantity), 0) as reserved_tickets,
                   e.available_tickets - COALESCE(SUM(cr.quantity), 0) as truly_available
            FROM event e
            LEFT JOIN cart_reservations cr ON e.event_id = cr.event_id AND cr.expires_at > NOW()
            LEFT JOIN event_layouts el ON e.event_id = el.event_id
            WHERE (e.date || ' ' || e.time)::timestamp >= NOW()
              AND e.available_tickets > 0
            GROUP BY e.event_id, el.layout_id
            ORDER BY e.date ASC, e.time ASC
        `);
        return result.rows;
    }

    /**
     * Retrieves past events or events with no available tickets
     * @returns {Promise<Array>} Array of past events ordered by date descending
     */
    static async getPastEvents() {
        const result = await pool.query(`
            SELECT e.*,
                   el.layout_id,
                   COALESCE(SUM(cr.quantity), 0) as reserved_tickets,
                   e.available_tickets - COALESCE(SUM(cr.quantity), 0) as truly_available
            FROM event e
            LEFT JOIN cart_reservations cr ON e.event_id = cr.event_id AND cr.expires_at > NOW()
            LEFT JOIN event_layouts el ON e.event_id = el.event_id
            WHERE (e.date || ' ' || e.time)::timestamp < NOW()
               OR e.available_tickets = 0
            GROUP BY e.event_id, el.layout_id
            ORDER BY e.date DESC, e.time DESC
        `);
        return result.rows;
    }

    /**
     * Retrieves an event by its ID with reservation data
     * @param {number} eventId - The unique identifier of the event
     * @returns {Promise<Object>} Event object with reservation information
     */
    static async getById(eventId) {
        const result = await pool.query(`
            SELECT e.*,
                   el.layout_id,
                   (
                       COALESCE(SUM(cr.quantity), 0) +
                       COALESCE((SELECT COUNT(*) FROM seat_reservations sr
                                 WHERE sr.event_id = e.event_id AND sr.expires_at > NOW()), 0)
                   ) as reserved_tickets,
                   CASE
                       WHEN e.has_seating = true THEN
                           COALESCE((SELECT COUNT(*) FROM ticket_seats ts
                                     JOIN purchases p ON ts.purchase_id = p.purchase_id
                                     WHERE p.event_id = e.event_id AND (p.status IS NULL OR p.status != 'cancelled')), 0)
                       ELSE
                           COALESCE((SELECT SUM(p.quantity) FROM purchases p
                                     WHERE p.event_id = e.event_id AND (p.status IS NULL OR p.status != 'cancelled')), 0)
                   END as tickets_sold
            FROM event e
            LEFT JOIN cart_reservations cr ON e.event_id = cr.event_id AND cr.expires_at > NOW()
            LEFT JOIN event_layouts el ON e.event_id = el.event_id
            WHERE e.event_id = $1
            GROUP BY e.event_id, el.layout_id
        `, [eventId]);
        return result.rows[0];
    }

    /**
     * Creates a new event
     * @param {Object} eventData - Event data object
     * @param {string} eventData.title - Event title
     * @param {string} eventData.description - Event description
     * @param {string} eventData.venue - Venue location
     * @param {string} eventData.date - Event date
     * @param {string} eventData.time - Event time
     * @param {number} eventData.price - Ticket price
     * @param {number} eventData.tickets - Number of available tickets
     * @param {string} eventData.type - Event type
     * @param {string} eventData.city - City name
     * @param {string} eventData.organizer - Organizer name
     * @param {string} eventData.imagePath - Path to event image
     * @param {number} eventData.userId - ID of user creating the event
     * @returns {Promise<Object>} Created event object
     */
    static async create(eventData) {
        const { title, description, venue, date, time, price, tickets, type, city, organizer, imagePath, userId } = eventData;
        const result = await pool.query(
            `INSERT INTO event (title, description, location, date, time, price, available_tickets, type, city, organizer, image_path, user_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
            [title, description, venue, date, time, price, tickets, type, city, organizer, imagePath, userId]
        );
        return result.rows[0];
    }

    /**
     * Updates an existing event
     * @param {number} eventId - The unique identifier of the event
     * @param {Object} eventData - Updated event data
     * @param {string} eventData.title - Event title
     * @param {string} eventData.description - Event description
     * @param {string} eventData.venue - Venue location
     * @param {string} eventData.date - Event date
     * @param {string} eventData.time - Event time
     * @param {number} eventData.price - Ticket price
     * @param {number} eventData.tickets - Number of available tickets
     * @param {string} eventData.type - Event type
     * @param {string} eventData.city - City name
     * @param {string} eventData.organizer - Organizer name
     * @param {string} [eventData.imagePath] - Path to event image (optional)
     * @param {boolean} [eventData.hasSeating] - Whether event has assigned seating
     * @returns {Promise<Object>} Updated event object
     */
    static async update(eventId, eventData) {
        const { title, description, venue, date, time, price, tickets, type, city, organizer, imagePath, hasSeating } = eventData;

        let query, params;
        if (imagePath === undefined) {
            query = `UPDATE event SET
                title = $1, description = $2, location = $3,
                date = $4, time = $5, price = $6, available_tickets = $7, type = $8,
                city = $9, organizer = $10, has_seating = $11
             WHERE event_id = $12 RETURNING *`;
            params = [title, description, venue, date, time, price, tickets, type, city, organizer, hasSeating !== undefined ? hasSeating : false, eventId];
        } else {
            query = `UPDATE event SET
                title = $1, description = $2, location = $3,
                date = $4, time = $5, price = $6, available_tickets = $7, type = $8,
                city = $9, organizer = $10, image_path = $11, has_seating = $12
             WHERE event_id = $13 RETURNING *`;
            params = [title, description, venue, date, time, price, tickets, type, city, organizer, imagePath, hasSeating !== undefined ? hasSeating : false, eventId];
        }

        const result = await pool.query(query, params);
        return result.rows[0];
    }

    /**
     * Deletes an event from the database
     * @param {number} eventId - The unique identifier of the event
     * @returns {Promise<void>}
     */
    static async delete(eventId) {
        await pool.query('DELETE FROM event WHERE event_id = $1', [eventId]);
    }

    /**
     * Searches events with multiple filter criteria
     * @param {Object} [filters={}] - Search filters
     * @param {string} [filters.q] - Search query for title, location, or city
     * @param {Array<string>} [filters.types] - Event types to filter by
     * @param {Array<string>} [filters.cities] - Cities to filter by
     * @param {number} [filters.minPrice] - Minimum ticket price
     * @param {number} [filters.maxPrice] - Maximum ticket price
     * @param {string} [filters.dateFrom] - Start date for filtering
     * @param {string} [filters.dateTo] - End date for filtering
     * @param {string} [filters.sort] - Sort field (date, price, title)
     * @param {string} [filters.order] - Sort order (asc or desc)
     * @returns {Promise<Array>} Array of filtered events
     */
    static async search({ q, types, cities, minPrice, maxPrice, dateFrom, dateTo, sort, order } = {}) {
        const conditions = ['e.available_tickets > 0', "(e.date || ' ' || e.time)::timestamp >= NOW()"];
        const params = [];
        let idx = 1;

        if (q) {
            conditions.push(`(LOWER(e.title) LIKE $${idx} OR LOWER(e.location) LIKE $${idx} OR LOWER(e.city) LIKE $${idx})`);
            params.push(`%${q.toLowerCase()}%`);
            idx++;
        }
        if (types && types.length > 0) {
            conditions.push(`e.type = ANY($${idx})`);
            params.push(types);
            idx++;
        }
        if (cities && cities.length > 0) {
            const cityConditions = cities.map((_, i) => `LOWER(e.city) LIKE $${idx + i}`);
            conditions.push(`(${cityConditions.join(' OR ')})`);
            cities.forEach(city => { params.push(`%${city.toLowerCase()}%`); idx++; });
        }
        if (minPrice !== undefined && minPrice !== null) {
            conditions.push(`e.price >= $${idx}`);
            params.push(minPrice);
            idx++;
        }
        if (maxPrice !== undefined && maxPrice !== null) {
            conditions.push(`e.price <= $${idx}`);
            params.push(maxPrice);
            idx++;
        }
        if (dateFrom) {
            conditions.push(`e.date::date >= $${idx}`);
            params.push(dateFrom);
            idx++;
        }
        if (dateTo) {
            conditions.push(`e.date::date <= $${idx}`);
            params.push(dateTo);
            idx++;
        }

        const validSorts = { date: 'e.date', price: 'e.price', title: 'e.title' };
        const sortCol = validSorts[sort] || 'e.date';
        const sortDir = order === 'desc' ? 'DESC' : 'ASC';

        const result = await pool.query(`
            SELECT e.*,
                   COALESCE(SUM(cr.quantity), 0) as reserved_tickets,
                   e.available_tickets - COALESCE(SUM(cr.quantity), 0) as truly_available
            FROM event e
            LEFT JOIN cart_reservations cr ON e.event_id = cr.event_id AND cr.expires_at > NOW()
            WHERE ${conditions.join(' AND ')}
            GROUP BY e.event_id
            ORDER BY ${sortCol} ${sortDir}
        `, params);
        return result.rows;
    }

    /**
     * Retrieves all distinct cities that have events
     * @returns {Promise<Array<string>>} Array of city names
     */
    static async getDistinctCities() {
        const result = await pool.query(`SELECT DISTINCT city FROM event WHERE city IS NOT NULL ORDER BY city`);
        return result.rows.map(r => r.city);
    }

    /**
     * Updates available tickets for an event
     * @param {number} eventId - The unique identifier of the event
     * @param {number} quantityChange - Change in ticket quantity (positive to add, negative to subtract)
     * @returns {Promise<Object>} Updated event object
     */
    static async updateTickets(eventId, quantityChange) {
        const result = await pool.query(
            'UPDATE event SET available_tickets = available_tickets + $1, tickets_sold = tickets_sold - $1 WHERE event_id = $2 RETURNING *',
            [quantityChange, eventId]
        );
        return result.rows[0];
    }
}

module.exports = Event;
