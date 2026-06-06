const pool = require('../config/database');

/**
 * LayoutRow model for managing seating rows within venue layouts
 * @class LayoutRow
 */
class LayoutRow {

    /**
     * Creates a new layout row
     * @param {Object} rowData - Row data object
     * @param {number} rowData.layout_id - Layout identifier
     * @param {number} rowData.zone_id - Zone identifier
     * @param {string} rowData.row_letter - Row letter designation
     * @param {number} rowData.seats_in_row - Number of seats in the row
     * @param {number} rowData.row_order - Display order of the row
     * @returns {Promise<Object>} Created row object
     */
    static async create(rowData) {
        const { layout_id, zone_id, row_letter, seats_in_row, row_order } = rowData;

        const result = await pool.query(
            `INSERT INTO layout_rows (layout_id, zone_id, row_letter, seats_in_row, row_order)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [layout_id, zone_id, row_letter, seats_in_row, row_order]
        );

        return result.rows[0];
    }

    /**
     * Retrieves all rows for a specific layout with zone information
     * @param {number} layoutId - The unique identifier of the layout
     * @returns {Promise<Array>} Array of row objects with zone details
     */
    static async getByLayoutId(layoutId) {
        const result = await pool.query(
            `SELECT lr.*, sz.name as zone_name, sz.color as zone_color
             FROM layout_rows lr
             JOIN seat_zones sz ON lr.zone_id = sz.zone_id
             WHERE lr.layout_id = $1
             ORDER BY lr.row_order`,
            [layoutId]
        );

        return result.rows;
    }

    /**
     * Retrieves a row by its ID with zone information
     * @param {number} rowId - The unique identifier of the row
     * @returns {Promise<Object|null>} Row object with zone details, or null if not found
     */
    static async getById(rowId) {
        const result = await pool.query(
            `SELECT lr.*, sz.name as zone_name, sz.color as zone_color
             FROM layout_rows lr
             JOIN seat_zones sz ON lr.zone_id = sz.zone_id
             WHERE lr.row_id = $1`,
            [rowId]
        );

        return result.rows[0] || null;
    }

    /**
     * Updates an existing layout row
     * @param {number} rowId - The unique identifier of the row
     * @param {Object} updates - Updated row data
     * @param {number} [updates.zone_id] - Zone identifier
     * @param {string} [updates.row_letter] - Row letter designation
     * @param {number} [updates.seats_in_row] - Number of seats in the row
     * @param {number} [updates.row_order] - Display order of the row
     * @returns {Promise<Object>} Updated row object
     */
    static async update(rowId, updates) {
        const { zone_id, row_letter, seats_in_row, row_order } = updates;

        const result = await pool.query(
            `UPDATE layout_rows
             SET zone_id = COALESCE($1, zone_id),
                 row_letter = COALESCE($2, row_letter),
                 seats_in_row = COALESCE($3, seats_in_row),
                 row_order = COALESCE($4, row_order)
             WHERE row_id = $5
             RETURNING *`,
            [zone_id, row_letter, seats_in_row, row_order, rowId]
        );

        return result.rows[0];
    }

    /**
     * Deletes a layout row
     * @param {number} rowId - The unique identifier of the row
     * @returns {Promise<boolean>} True if deletion was successful
     */
    static async delete(rowId) {
        const result = await pool.query(
            `DELETE FROM layout_rows WHERE row_id = $1 RETURNING *`,
            [rowId]
        );

        return result.rows.length > 0;
    }

    /**
     * Creates multiple layout rows in a single transaction
     * @param {number} layoutId - The unique identifier of the layout
     * @param {Array<Object>} rows - Array of row data objects
     * @param {number} rows[].zone_id - Zone identifier
     * @param {string} rows[].row_letter - Row letter designation
     * @param {number} rows[].seats_in_row - Number of seats in the row
     * @param {number} rows[].row_order - Display order of the row
     * @returns {Promise<Array>} Array of created row objects
     * @throws {Error} If bulk creation fails
     */
    static async createBulk(layoutId, rows) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const createdRows = [];

            for (const row of rows) {
                const result = await client.query(
                    `INSERT INTO layout_rows (layout_id, zone_id, row_letter, seats_in_row, row_order)
                     VALUES ($1, $2, $3, $4, $5)
                     RETURNING *`,
                    [layoutId, row.zone_id, row.row_letter, row.seats_in_row, row.row_order]
                );

                createdRows.push(result.rows[0]);
            }

            await client.query('COMMIT');

            return createdRows;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Retrieves a row by layout ID and row letter
     * @param {number} layoutId - The unique identifier of the layout
     * @param {string} rowLetter - The row letter designation
     * @returns {Promise<Object|null>} Row object with zone details, or null if not found
     */
    static async getByLetterAndLayout(layoutId, rowLetter) {
        const result = await pool.query(
            `SELECT lr.*, sz.name as zone_name, sz.color as zone_color
             FROM layout_rows lr
             JOIN seat_zones sz ON lr.zone_id = sz.zone_id
             WHERE lr.layout_id = $1 AND lr.row_letter = $2`,
            [layoutId, rowLetter]
        );

        return result.rows[0] || null;
    }
}

module.exports = LayoutRow;
