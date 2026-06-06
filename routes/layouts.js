/**
 * @fileoverview Layout routes for managing venue seating layouts
 * Handles layout CRUD operations and management of zones and rows within layouts
 */

const express = require('express');
const router = express.Router();
const layoutController = require('../controllers/layoutController');

/**
 * Create a new layout
 * @route POST /api/layouts
 * @access Admin
 * @returns {Object} 201 - Created layout
 * @returns {Object} 400 - Invalid layout data
 */
router.post('/', layoutController.createLayout);

/**
 * Get all layouts
 * @route GET /api/layouts
 * @access Public
 * @returns {Object} 200 - Array of all layouts
 */
router.get('/', layoutController.getAllLayouts);

/**
 * Get layout by ID
 * @route GET /api/layouts/:layoutId
 * @access Public
 * @param {string} layoutId - Layout ID
 * @returns {Object} 200 - Layout details
 * @returns {Object} 404 - Layout not found
 */
router.get('/:layoutId', layoutController.getLayoutById);

/**
 * Update layout
 * @route PUT /api/layouts/:layoutId
 * @access Admin
 * @param {string} layoutId - Layout ID
 * @returns {Object} 200 - Updated layout
 * @returns {Object} 404 - Layout not found
 */
router.put('/:layoutId', layoutController.updateLayout);

/**
 * Delete layout
 * @route DELETE /api/layouts/:layoutId
 * @access Admin
 * @param {string} layoutId - Layout ID
 * @returns {Object} 200 - Layout deleted successfully
 * @returns {Object} 404 - Layout not found
 */
router.delete('/:layoutId', layoutController.deleteLayout);

/**
 * Add zone to layout
 * @route POST /api/layouts/:layoutId/zones
 * @access Admin
 * @param {string} layoutId - Layout ID
 * @returns {Object} 201 - Zone added successfully
 * @returns {Object} 400 - Invalid zone data
 */
router.post('/:layoutId/zones', layoutController.addZone);

/**
 * Update zone
 * @route PUT /api/layouts/zones/:zoneId
 * @access Admin
 * @param {string} zoneId - Zone ID
 * @returns {Object} 200 - Updated zone
 * @returns {Object} 404 - Zone not found
 */
router.put('/zones/:zoneId', layoutController.updateZone);

/**
 * Delete zone
 * @route DELETE /api/layouts/zones/:zoneId
 * @access Admin
 * @param {string} zoneId - Zone ID
 * @returns {Object} 200 - Zone deleted successfully
 * @returns {Object} 404 - Zone not found
 */
router.delete('/zones/:zoneId', layoutController.deleteZone);

/**
 * Add row to layout
 * @route POST /api/layouts/:layoutId/rows
 * @access Admin
 * @param {string} layoutId - Layout ID
 * @returns {Object} 201 - Row added successfully
 * @returns {Object} 400 - Invalid row data
 */
router.post('/:layoutId/rows', layoutController.addRow);

/**
 * Update row
 * @route PUT /api/layouts/rows/:rowId
 * @access Admin
 * @param {string} rowId - Row ID
 * @returns {Object} 200 - Updated row
 * @returns {Object} 404 - Row not found
 */
router.put('/rows/:rowId', layoutController.updateRow);

/**
 * Delete row
 * @route DELETE /api/layouts/rows/:rowId
 * @access Admin
 * @param {string} rowId - Row ID
 * @returns {Object} 200 - Row deleted successfully
 * @returns {Object} 404 - Row not found
 */
router.delete('/rows/:rowId', layoutController.deleteRow);

module.exports = router;
