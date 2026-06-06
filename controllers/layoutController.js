/**
 * @file Layout Controller
 * @description Manages venue seating layouts including zones, rows, and seat configurations
 * for events with assigned seating.
 */

const VenueLayout = require('../models/VenueLayout');
const SeatZone = require('../models/SeatZone');
const LayoutRow = require('../models/LayoutRow');
const EventLayout = require('../models/EventLayout');

/**
 * Creates a new venue layout with zones and rows.
 *
 * @param {express.Request} req - Express request object containing name, description, zones, and rows in body
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {400} If required fields are missing or validation fails
 * @throws {500} If creation fails
 *
 * Side effects:
 * - Creates layout record in database
 * - Creates multiple zone records
 * - Creates multiple row records with zone associations
 */
exports.createLayout = async (req, res) => {
    try {
        const { name, description, zones, rows } = req.body;
        const userId = req.user?.id || req.body.created_by;

        if (!name || !zones || !rows) {
            return res.status(400).json({
                success: false,
                message: 'Name, zones, and rows are required'
            });
        }

        if (zones.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one zone is required'
            });
        }

        if (rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one row is required'
            });
        }

        const layout = await VenueLayout.create({
            name,
            description,
            created_by: userId
        });

        const createdZones = await SeatZone.createBulk(layout.layout_id, zones);

        const zoneMap = {};
        createdZones.forEach(zone => {
            zoneMap[zone.name] = zone.zone_id;
        });

        const rowsWithZoneIds = rows.map(row => ({
            ...row,
            zone_id: row.zone_id || zoneMap[row.zone_name]
        }));

        const createdRows = await LayoutRow.createBulk(layout.layout_id, rowsWithZoneIds);

        const fullLayout = await VenueLayout.getFullLayout(layout.layout_id);

        res.status(201).json({
            success: true,
            message: 'Layout created successfully',
            layout: fullLayout
        });

    } catch (error) {
        console.error('Error creating layout:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating layout'
        });
    }
};

/**
 * Retrieves all venue layouts from the database.
 * IMPORTANT: Only returns predefined, realistic venue layouts (not random/test layouts).
 * This filters out old test/random layouts to show users only the 3 professional venues.
 *
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {500} If database query fails
 *
 * Side effects:
 * - Queries all layouts from database
 * - Filters to show only predefined venues
 */
exports.getAllLayouts = async (req, res) => {
    try {
        const layouts = await VenueLayout.getAll();

        const predefinedVenueNames = [
            'Opera Națională București',
            'Teatrul Nottara București',
            'Filarmonica Brașov'
        ];

        const filteredLayouts = layouts.filter(layout =>
            predefinedVenueNames.includes(layout.name)
        );

        res.json({
            success: true,
            layouts: filteredLayouts
        });

    } catch (error) {
        console.error('Error getting layouts:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving layouts'
        });
    }
};

/**
 * Retrieves a specific layout with all its zones and rows.
 *
 * @param {express.Request} req - Express request object containing layoutId in params
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {404} If layout is not found
 * @throws {500} If database query fails
 *
 * Side effects:
 * - Queries layout with nested zones and rows from database
 */
exports.getLayoutById = async (req, res) => {
    try {
        const { layoutId } = req.params;

        const layout = await VenueLayout.getFullLayout(parseInt(layoutId));

        if (!layout) {
            return res.status(404).json({
                success: false,
                message: 'Layout not found'
            });
        }

        res.json({
            success: true,
            layout
        });

    } catch (error) {
        console.error('Error getting layout:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving layout'
        });
    }
};

/**
 * Updates a layout's basic information (name and description).
 *
 * @param {express.Request} req - Express request object containing layoutId in params and name, description in body
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {404} If layout is not found
 * @throws {500} If update fails
 *
 * Side effects:
 * - Updates layout record in database
 */
exports.updateLayout = async (req, res) => {
    try {
        const { layoutId } = req.params;
        const { name, description } = req.body;

        const layout = await VenueLayout.update(parseInt(layoutId), { name, description });

        if (!layout) {
            return res.status(404).json({
                success: false,
                message: 'Layout not found'
            });
        }

        res.json({
            success: true,
            message: 'Layout updated successfully',
            layout
        });

    } catch (error) {
        console.error('Error updating layout:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating layout'
        });
    }
};

/**
 * Deletes a layout and all its associated zones and rows.
 *
 * @param {express.Request} req - Express request object containing layoutId in params
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {400} If layout is in use by events
 * @throws {404} If layout is not found
 *
 * Side effects:
 * - Cascades deletion of zones and rows
 * - Removes layout from database
 */
exports.deleteLayout = async (req, res) => {
    try {
        const { layoutId } = req.params;

        const deleted = await VenueLayout.delete(parseInt(layoutId));

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Layout not found'
            });
        }

        res.json({
            success: true,
            message: 'Layout deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting layout:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Error deleting layout'
        });
    }
};

/**
 * Adds a new zone to an existing layout.
 *
 * @param {express.Request} req - Express request object containing layoutId in params and zone details in body
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {400} If zone name is missing
 * @throws {500} If creation fails
 *
 * Side effects:
 * - Inserts new zone record into database
 */
exports.addZone = async (req, res) => {
    try {
        const { layoutId } = req.params;
        const { name, color, display_order } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Zone name is required'
            });
        }

        const zone = await SeatZone.create({
            layout_id: parseInt(layoutId),
            name,
            color,
            display_order
        });

        res.status(201).json({
            success: true,
            message: 'Zone added successfully',
            zone
        });

    } catch (error) {
        console.error('Error adding zone:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error adding zone'
        });
    }
};

/**
 * Updates a zone's properties (name, color, display order).
 *
 * @param {express.Request} req - Express request object containing zoneId in params and update data in body
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {404} If zone is not found
 * @throws {500} If update fails
 *
 * Side effects:
 * - Updates zone record in database
 */
exports.updateZone = async (req, res) => {
    try {
        const { zoneId } = req.params;
        const { name, color, display_order } = req.body;

        const zone = await SeatZone.update(parseInt(zoneId), { name, color, display_order });

        if (!zone) {
            return res.status(404).json({
                success: false,
                message: 'Zone not found'
            });
        }

        res.json({
            success: true,
            message: 'Zone updated successfully',
            zone
        });

    } catch (error) {
        console.error('Error updating zone:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating zone'
        });
    }
};

/**
 * Deletes a zone and all its associated rows.
 *
 * @param {express.Request} req - Express request object containing zoneId in params
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {400} If zone is in use
 * @throws {404} If zone is not found
 *
 * Side effects:
 * - Cascades deletion of associated rows
 * - Removes zone from database
 */
exports.deleteZone = async (req, res) => {
    try {
        const { zoneId } = req.params;

        const deleted = await SeatZone.delete(parseInt(zoneId));

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Zone not found'
            });
        }

        res.json({
            success: true,
            message: 'Zone deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting zone:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Error deleting zone'
        });
    }
};

/**
 * Adds a new row to a layout's zone.
 *
 * @param {express.Request} req - Express request object containing layoutId in params and row details in body
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {400} If required fields are missing
 * @throws {500} If creation fails
 *
 * Side effects:
 * - Inserts new row record into database
 */
exports.addRow = async (req, res) => {
    try {
        const { layoutId } = req.params;
        const { zone_id, row_letter, seats_in_row, row_order } = req.body;

        if (!zone_id || !row_letter || !seats_in_row || row_order === undefined) {
            return res.status(400).json({
                success: false,
                message: 'zone_id, row_letter, seats_in_row, and row_order are required'
            });
        }

        const row = await LayoutRow.create({
            layout_id: parseInt(layoutId),
            zone_id,
            row_letter,
            seats_in_row,
            row_order
        });

        res.status(201).json({
            success: true,
            message: 'Row added successfully',
            row
        });

    } catch (error) {
        console.error('Error adding row:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error adding row'
        });
    }
};

/**
 * Updates a row's properties (zone, letter, seat count, order).
 *
 * @param {express.Request} req - Express request object containing rowId in params and update data in body
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {404} If row is not found
 * @throws {500} If update fails
 *
 * Side effects:
 * - Updates row record in database
 */
exports.updateRow = async (req, res) => {
    try {
        const { rowId } = req.params;
        const { zone_id, row_letter, seats_in_row, row_order } = req.body;

        const row = await LayoutRow.update(parseInt(rowId), {
            zone_id,
            row_letter,
            seats_in_row,
            row_order
        });

        if (!row) {
            return res.status(404).json({
                success: false,
                message: 'Row not found'
            });
        }

        res.json({
            success: true,
            message: 'Row updated successfully',
            row
        });

    } catch (error) {
        console.error('Error updating row:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating row'
        });
    }
};

/**
 * Deletes a row from a layout.
 *
 * @param {express.Request} req - Express request object containing rowId in params
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {404} If row is not found
 * @throws {500} If deletion fails
 *
 * Side effects:
 * - Removes row from database
 */
exports.deleteRow = async (req, res) => {
    try {
        const { rowId } = req.params;

        const deleted = await LayoutRow.delete(parseInt(rowId));

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Row not found'
            });
        }

        res.json({
            success: true,
            message: 'Row deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting row:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error deleting row'
        });
    }
};
