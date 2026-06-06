const pool = require('../config/database');

/**
 * SeatZone model for managing seating zones within venue layouts
 * @class SeatZone
 */
class SeatZone {

    /**
     * Creates a new seat zone
     * @param {Object} zoneData - Zone data object
     * @param {number} zoneData.layout_id - Layout identifier
     * @param {string} zoneData.name - Zone name
     * @param {string} [zoneData.color] - Zone color for display
     * @param {number} [zoneData.display_order] - Display order of the zone
     * @returns {Promise<Object>} Created zone object
     */
    static async create(zoneData) {
        const { layout_id, name, color, display_order } = zoneData;

        const result = await pool.query(
            `INSERT INTO seat_zones (layout_id, name, color, display_order)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [layout_id, name, color || '#4CAF50', display_order || 0]
        );

        return result.rows[0];
    }

    /**
     * Retrieves all zones for a specific layout
     * @param {number} layoutId - The unique identifier of the layout
     * @returns {Promise<Array>} Array of zone objects ordered by display order
     */
    static async getByLayoutId(layoutId) {
        const result = await pool.query(
            `SELECT * FROM seat_zones
             WHERE layout_id = $1
             ORDER BY display_order, zone_id`,
            [layoutId]
        );

        return result.rows;
    }

    /**
     * Retrieves a zone by its ID
     * @param {number} zoneId - The unique identifier of the zone
     * @returns {Promise<Object|null>} Zone object or null if not found
     */
    static async getById(zoneId) {
        const result = await pool.query(
            `SELECT * FROM seat_zones WHERE zone_id = $1`,
            [zoneId]
        );

        return result.rows[0] || null;
    }

    /**
     * Updates an existing seat zone
     * @param {number} zoneId - The unique identifier of the zone
     * @param {Object} updates - Updated zone data
     * @param {string} [updates.name] - Zone name
     * @param {string} [updates.color] - Zone color for display
     * @param {number} [updates.display_order] - Display order of the zone
     * @returns {Promise<Object>} Updated zone object
     */
    static async update(zoneId, updates) {
        const { name, color, display_order } = updates;

        const result = await pool.query(
            `UPDATE seat_zones
             SET name = COALESCE($1, name),
                 color = COALESCE($2, color),
                 display_order = COALESCE($3, display_order)
             WHERE zone_id = $4
             RETURNING *`,
            [name, color, display_order, zoneId]
        );

        return result.rows[0];
    }

    /**
     * Deletes a seat zone
     * @param {number} zoneId - The unique identifier of the zone
     * @returns {Promise<boolean>} True if deletion was successful
     * @throws {Error} If zone is currently assigned to rows
     */
    static async delete(zoneId) {

        const checkResult = await pool.query(
            `SELECT COUNT(*) as count FROM layout_rows WHERE zone_id = $1`,
            [zoneId]
        );

        if (parseInt(checkResult.rows[0].count) > 0) {
            throw new Error('Cannot delete zone: it is currently assigned to one or more rows');
        }

        const result = await pool.query(
            `DELETE FROM seat_zones WHERE zone_id = $1 RETURNING *`,
            [zoneId]
        );

        return result.rows.length > 0;
    }

    /**
     * Creates multiple seat zones in a single transaction
     * @param {number} layoutId - The unique identifier of the layout
     * @param {Array<Object>} zones - Array of zone data objects
     * @param {string} zones[].name - Zone name
     * @param {string} [zones[].color] - Zone color for display
     * @param {number} [zones[].display_order] - Display order of the zone
     * @returns {Promise<Array>} Array of created zone objects
     * @throws {Error} If bulk creation fails
     */
    static async createBulk(layoutId, zones) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const createdZones = [];

            for (const zone of zones) {
                const result = await client.query(
                    `INSERT INTO seat_zones (layout_id, name, color, display_order)
                     VALUES ($1, $2, $3, $4)
                     RETURNING *`,
                    [layoutId, zone.name, zone.color || '#4CAF50', zone.display_order || 0]
                );

                createdZones.push(result.rows[0]);
            }

            await client.query('COMMIT');

            return createdZones;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = SeatZone;
