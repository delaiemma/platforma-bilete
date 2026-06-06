/**
 * @fileoverview Discount routes for managing promotional codes and discounts
 * Handles discount validation, CRUD operations, and status management
 */

const express = require('express');
const router = express.Router();
const discountController = require('../controllers/discountController');

/**
 * Validate a discount code
 * @route POST /api/discounts/validate
 * @access Public
 * @returns {Object} 200 - Discount validation result
 * @returns {Object} 400 - Invalid or expired discount code
 */
router.post('/validate', discountController.validateDiscount);

/**
 * Get all discounts
 * @route GET /api/discounts
 * @access Admin
 * @returns {Object} 200 - Array of all discounts
 */
router.get('/', discountController.getAllDiscounts);

/**
 * Create a new discount
 * @route POST /api/discounts
 * @access Admin
 * @returns {Object} 201 - Created discount
 * @returns {Object} 400 - Invalid discount data
 */
router.post('/', discountController.createDiscount);

/**
 * Get discount by ID
 * @route GET /api/discounts/:id
 * @access Admin
 * @param {string} id - Discount ID
 * @returns {Object} 200 - Discount details
 * @returns {Object} 404 - Discount not found
 */
router.get('/:id', discountController.getDiscountById);

/**
 * Update discount
 * @route PUT /api/discounts/:id
 * @access Admin
 * @param {string} id - Discount ID
 * @returns {Object} 200 - Updated discount
 * @returns {Object} 404 - Discount not found
 */
router.put('/:id', discountController.updateDiscount);

/**
 * Delete discount
 * @route DELETE /api/discounts/:id
 * @access Admin
 * @param {string} id - Discount ID
 * @returns {Object} 200 - Discount deleted successfully
 * @returns {Object} 404 - Discount not found
 */
router.delete('/:id', discountController.deleteDiscount);

/**
 * Toggle discount active status
 * @route PATCH /api/discounts/:id/toggle
 * @access Admin
 * @param {string} id - Discount ID
 * @returns {Object} 200 - Updated discount status
 * @returns {Object} 404 - Discount not found
 */
router.patch('/:id/toggle', discountController.toggleDiscountStatus);

module.exports = router;
