const pool = require('../config/database');

/**
 * VenueLayout model for managing reusable venue seating layouts
 * @class VenueLayout
 */
class VenueLayout {

    /**
     * Creates a new venue layout
     * @param {Object} layoutData - Layout data object
     * @param {string} layoutData.name - Layout name
     * @param {string} layoutData.description - Layout description
     * @param {number} layoutData.created_by - User ID of the creator
     * @returns {Promise<Object>} Created layout object
     */
    static async create(layoutData) {
        const { name, description, created_by } = layoutData;

        const result = await pool.query(
            `INSERT INTO venue_layouts (name, description, created_by)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [name, description, created_by]
        );

        return result.rows[0];
    }

    /**
     * Retrieves a venue layout by its ID
     * @param {number} layoutId - The unique identifier of the layout
     * @returns {Promise<Object|null>} Layout object or null if not found
     */
    static async getById(layoutId) {
        const result = await pool.query(
            `SELECT * FROM venue_layouts WHERE layout_id = $1`,
            [layoutId]
        );

        return result.rows[0] || null;
    }

    /**
     * Retrieves all venue layouts with creator information
     * @returns {Promise<Array>} Array of layout objects with creator names
     */
    static async getAll() {
        const result = await pool.query(
            `SELECT vl.*, u.name as creator_name
             FROM venue_layouts vl
             LEFT JOIN "user" u ON vl.created_by = u.user_id
             ORDER BY vl.created_at DESC`
        );

        return result.rows;
    }

    /**
     * Retrieves a complete layout with all zones and rows
     * @param {number} layoutId - The unique identifier of the layout
     * @returns {Promise<Object|null>} Layout object with zones, rows, and total seats, or null if not found
     */
    static async getFullLayout(layoutId) {
        const client = await pool.connect();

        try {

            const layoutResult = await client.query(
                `SELECT * FROM venue_layouts WHERE layout_id = $1`,
                [layoutId]
            );

            if (layoutResult.rows.length === 0) {
                return null;
            }

            const layout = layoutResult.rows[0];

            const zonesResult = await client.query(
                `SELECT * FROM seat_zones
                 WHERE layout_id = $1
                 ORDER BY display_order, zone_id`,
                [layoutId]
            );

            layout.zones = zonesResult.rows;

            const rowsResult = await client.query(
                `SELECT lr.*, sz.name as zone_name, sz.color as zone_color
                 FROM layout_rows lr
                 JOIN seat_zones sz ON lr.zone_id = sz.zone_id
                 WHERE lr.layout_id = $1
                 ORDER BY lr.row_order`,
                [layoutId]
            );

            layout.rows = rowsResult.rows;

            layout.total_seats = layout.rows.reduce((sum, row) => sum + row.seats_in_row, 0);

            return layout;
        } finally {
            client.release();
        }
    }

    /**
     * Updates an existing venue layout
     * @param {number} layoutId - The unique identifier of the layout
     * @param {Object} updates - Updated layout data
     * @param {string} [updates.name] - Layout name
     * @param {string} [updates.description] - Layout description
     * @returns {Promise<Object>} Updated layout object
     */
    static async update(layoutId, updates) {
        const { name, description } = updates;

        const result = await pool.query(
            `UPDATE venue_layouts
             SET name = COALESCE($1, name),
                 description = COALESCE($2, description)
             WHERE layout_id = $3
             RETURNING *`,
            [name, description, layoutId]
        );

        return result.rows[0];
    }

    /**
     * Deletes a venue layout
     * @param {number} layoutId - The unique identifier of the layout
     * @returns {Promise<boolean>} True if deletion was successful
     * @throws {Error} If layout is in use by events or has sold tickets
     */
    static async delete(layoutId) {

        const checkResult = await pool.query(
            `SELECT COUNT(*) as count FROM event_layouts WHERE layout_id = $1`,
            [layoutId]
        );

        if (parseInt(checkResult.rows[0].count) > 0) {
            throw new Error('Cannot delete layout: it is currently used by one or more events');
        }

        const ticketsResult = await pool.query(
            `SELECT COUNT(*) as count
             FROM ticket_seats ts
             JOIN event_layouts el ON ts.event_id = el.event_id
             WHERE el.layout_id = $1`,
            [layoutId]
        );

        if (parseInt(ticketsResult.rows[0].count) > 0) {
            throw new Error('Cannot delete layout: tickets have been sold for events using this layout');
        }

        const result = await pool.query(
            `DELETE FROM venue_layouts WHERE layout_id = $1 RETURNING *`,
            [layoutId]
        );

        return result.rows.length > 0;
    }

    /**
     * Retrieves all venue layouts created by a specific user
     * @param {number} userId - The unique identifier of the user
     * @returns {Promise<Array>} Array of layout objects created by the user
     */
    static async getByCreator(userId) {
        const result = await pool.query(
            `SELECT * FROM venue_layouts
             WHERE created_by = $1
             ORDER BY created_at DESC`,
            [userId]
        );

        return result.rows;
    }
}

module.exports = VenueLayout;
