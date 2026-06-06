/**
 * @file Discount Controller
 * @description Manages discount code operations including validation, creation, updating,
 * and deletion of promotional codes.
 */

const DiscountCode = require('../models/DiscountCode');

/**
 * Validates a discount code and calculates the discount amount.
 *
 * @param {express.Request} req - Express request object containing code, userId, amount, and eventIds in body
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {400} If required fields are missing, invalid, or discount code is invalid
 * @throws {500} If validation fails
 *
 * Side effects:
 * - Validates discount code against database rules
 * - Calculates discount based on type (percentage or fixed amount)
 */
exports.validateDiscount = async (req, res) => {
    try {
        console.log('🎫 Validating discount code request:', req.body);
        const { code, userId, amount, eventIds } = req.body;

        if (!code) {
            console.log('❌ No code provided');
            return res.status(400).json({
                success: false,
                message: 'Discount code is required'
            });
        }

        if (!amount || amount <= 0) {
            console.log('❌ Invalid amount:', amount);
            return res.status(400).json({
                success: false,
                message: 'Valid amount is required'
            });
        }

        console.log(`🔍 Validating code: ${code} for user: ${userId}, amount: ${amount}, events: ${eventIds}`);
        const validation = await DiscountCode.validateCode(code, userId, eventIds);

        if (!validation.valid) {
            console.log('❌ Validation failed:', validation.error);
            return res.status(400).json({
                success: false,
                message: validation.error
            });
        }

        console.log('✅ Code valid, calculating discount...');
        const calculation = DiscountCode.calculateDiscount(amount, validation);

        console.log('✅ Discount applied:', calculation);
        res.json({
            success: true,
            message: 'Discount code applied successfully',
            discount: {
                code: validation.code,
                description: validation.description,
                type: validation.discountType,
                value: validation.discountValue,
                ...calculation
            }
        });

    } catch (error) {
        console.error('Error validating discount:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to validate discount code'
        });
    }
};

/**
 * Retrieves all discount codes from the database.
 *
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {500} If database query fails
 *
 * Side effects:
 * - Queries all discount codes from database
 */
exports.getAllDiscounts = async (req, res) => {
    try {
        const codes = await DiscountCode.getAllCodes();

        res.json({
            success: true,
            discounts: codes
        });

    } catch (error) {
        console.error('Error fetching discounts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch discount codes'
        });
    }
};

/**
 * Creates a new discount code with specified parameters.
 *
 * @param {express.Request} req - Express request object containing discount details in body
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {400} If required fields are missing, invalid, or discount code already exists
 * @throws {500} If creation fails
 *
 * Side effects:
 * - Inserts new discount code into database
 * - Validates discount type and value constraints
 */
exports.createDiscount = async (req, res) => {
    try {
        const {
            code,
            description,
            discountType,
            discountValue,
            validFrom,
            validUntil,
            maxUses,
            firstPurchaseOnly
        } = req.body;

        if (!code || !discountType || !discountValue) {
            return res.status(400).json({
                success: false,
                message: 'Code, discount type, and discount value are required'
            });
        }

        if (!['percentage', 'fixed_amount'].includes(discountType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid discount type. Must be "percentage" or "fixed_amount"'
            });
        }

        if (discountValue <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Discount value must be greater than 0'
            });
        }

        if (discountType === 'percentage' && discountValue > 100) {
            return res.status(400).json({
                success: false,
                message: 'Percentage discount cannot exceed 100%'
            });
        }

        const newCode = await DiscountCode.create({
            code,
            description,
            discountType,
            discountValue,
            validFrom,
            validUntil,
            maxUses,
            firstPurchaseOnly
        });

        res.status(201).json({
            success: true,
            message: 'Discount code created successfully',
            discount: newCode
        });

    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({
                success: false,
                message: 'Discount code already exists'
            });
        }

        console.error('Error creating discount:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create discount code'
        });
    }
};

/**
 * Retrieves a specific discount code by its ID.
 *
 * @param {express.Request} req - Express request object containing id in params
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {404} If discount code is not found
 * @throws {500} If database query fails
 *
 * Side effects:
 * - Queries discount code from database
 */
exports.getDiscountById = async (req, res) => {
    try {
        const { id } = req.params;
        const discount = await DiscountCode.getById(id);

        if (!discount) {
            return res.status(404).json({
                success: false,
                message: 'Discount code not found'
            });
        }

        res.json({
            success: true,
            discount
        });
    } catch (error) {
        console.error('Error fetching discount:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch discount code'
        });
    }
};

/**
 * Updates an existing discount code with new parameters.
 *
 * @param {express.Request} req - Express request object containing id in params and update data in body
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {400} If required fields are missing, invalid, or code name already exists
 * @throws {404} If discount code is not found
 * @throws {500} If update fails
 *
 * Side effects:
 * - Updates discount code in database
 * - Validates discount type and value constraints
 */
exports.updateDiscount = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            code,
            description,
            discountType,
            discountValue,
            validFrom,
            validUntil,
            maxUses,
            firstPurchaseOnly,
            isActive
        } = req.body;

        if (!code || !discountType || !discountValue) {
            return res.status(400).json({
                success: false,
                message: 'Code, discount type, and discount value are required'
            });
        }

        if (discountValue <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Discount value must be greater than 0'
            });
        }

        if (discountType === 'percentage' && discountValue > 100) {
            return res.status(400).json({
                success: false,
                message: 'Percentage discount cannot exceed 100%'
            });
        }

        const discount = await DiscountCode.update(id, {
            code,
            description,
            discountType,
            discountValue,
            validFrom,
            validUntil,
            maxUses,
            firstPurchaseOnly,
            isActive
        });

        if (!discount) {
            return res.status(404).json({
                success: false,
                message: 'Discount code not found'
            });
        }

        res.json({
            success: true,
            message: 'Discount code updated successfully',
            discount
        });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({
                success: false,
                message: 'A discount code with this name already exists'
            });
        }

        console.error('Error updating discount:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update discount code'
        });
    }
};

/**
 * Deletes a discount code from the database.
 *
 * @param {express.Request} req - Express request object containing id in params
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {404} If discount code is not found
 * @throws {500} If deletion fails
 *
 * Side effects:
 * - Removes discount code from database
 */
exports.deleteDiscount = async (req, res) => {
    try {
        const { id } = req.params;
        const discount = await DiscountCode.delete(id);

        if (!discount) {
            return res.status(404).json({
                success: false,
                message: 'Discount code not found'
            });
        }

        res.json({
            success: true,
            message: 'Discount code deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting discount:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete discount code'
        });
    }
};

/**
 * Toggles the active status of a discount code (activates or deactivates).
 *
 * @param {express.Request} req - Express request object containing id in params
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {404} If discount code is not found
 * @throws {500} If status toggle fails
 *
 * Side effects:
 * - Updates is_active field in database
 */
exports.toggleDiscountStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const discount = await DiscountCode.toggleActive(id);

        if (!discount) {
            return res.status(404).json({
                success: false,
                message: 'Discount code not found'
            });
        }

        res.json({
            success: true,
            message: `Discount code ${discount.is_active ? 'activated' : 'deactivated'} successfully`,
            discount
        });
    } catch (error) {
        console.error('Error toggling discount status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle discount status'
        });
    }
};

module.exports = exports;
