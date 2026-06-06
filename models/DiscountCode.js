const pool = require('../config/database');

/**
 * DiscountCode model for managing discount codes and validation
 * @class DiscountCode
 */
class DiscountCode {

    /**
     * Validates a discount code against various criteria
     * @param {string} code - The discount code to validate
     * @param {number} userId - The unique identifier of the user
     * @param {Array<number>} [eventIds=[]] - Array of event IDs to validate against
     * @returns {Promise<Object>} Validation result with discount details or error message
     * @throws {Error} If validation fails
     */
    static async validateCode(code, userId, eventIds = []) {
        try {
            const upperCode = code.toUpperCase().trim();

            const codeQuery = `
                SELECT * FROM discount_codes
                WHERE UPPER(code) = $1 AND is_active = TRUE
            `;
            const codeResult = await pool.query(codeQuery, [upperCode]);

            if (codeResult.rows.length === 0) {
                return { valid: false, error: 'Invalid discount code' };
            }

            const discount = codeResult.rows[0];

            if (upperCode === 'EARLYBIRD' && eventIds && eventIds.length > 0) {
                const eventDatesQuery = `
                    SELECT event_id, date, title
                    FROM event
                    WHERE event_id = ANY($1)
                `;
                const eventResult = await pool.query(eventDatesQuery, [eventIds]);

                const thirtyDaysFromNow = new Date();
                thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

                for (const event of eventResult.rows) {
                    const eventDate = new Date(event.date);
                    if (eventDate <= thirtyDaysFromNow) {
                        return {
                            valid: false,
                            error: 'EARLYBIRD code is only valid for events 30+ days away'
                        };
                    }
                }
            }

            const now = new Date();
            if (discount.valid_until && new Date(discount.valid_until) < now) {
                return { valid: false, error: 'This discount code has expired' };
            }

            if (discount.valid_from && new Date(discount.valid_from) > now) {
                return { valid: false, error: 'This discount code is not yet valid' };
            }

            if (discount.max_uses && discount.current_uses >= discount.max_uses) {
                return { valid: false, error: 'This discount code has reached its usage limit' };
            }

            if (discount.first_purchase_only && userId) {
                const purchaseCheck = await pool.query(
                    `SELECT COUNT(*) as purchase_count
                     FROM purchases
                     WHERE user_id = $1 AND status != 'cancelled'`,
                    [userId]
                );

                if (parseInt(purchaseCheck.rows[0].purchase_count) > 0) {
                    return { valid: false, error: 'This code is only valid for first-time customers' };
                }
            }

            return {
                valid: true,
                code: discount.code,
                discountType: discount.discount_type,
                discountValue: parseFloat(discount.discount_value),
                description: discount.description
            };

        } catch (error) {
            console.error('Error validating discount code:', error);
            throw error;
        }
    }

    /**
     * Calculates discount amount based on discount information
     * @param {number} originalAmount - The original purchase amount
     * @param {Object} discountInfo - Discount information object
     * @param {string} discountInfo.discountType - Type of discount (percentage or fixed_amount)
     * @param {number} discountInfo.discountValue - Value of the discount
     * @param {string} discountInfo.code - The discount code
     * @returns {Object} Object containing original, discount, and final amounts
     */
    static calculateDiscount(originalAmount, discountInfo) {
        let discountAmount = 0;

        if (discountInfo.discountType === 'percentage') {
            discountAmount = (originalAmount * discountInfo.discountValue) / 100;
        } else if (discountInfo.discountType === 'fixed_amount') {
            discountAmount = discountInfo.discountValue;
        }

        discountAmount = Math.min(discountAmount, originalAmount);

        const finalAmount = Math.max(0, originalAmount - discountAmount);

        return {
            originalAmount: parseFloat(originalAmount.toFixed(2)),
            discountAmount: parseFloat(discountAmount.toFixed(2)),
            finalAmount: parseFloat(finalAmount.toFixed(2)),
            discountCode: discountInfo.code
        };
    }

    /**
     * Increments the usage count for a discount code
     * @param {string} code - The discount code
     * @returns {Promise<void>}
     * @throws {Error} If incrementing usage fails
     */
    static async incrementUsage(code) {
        try {
            await pool.query(
                `UPDATE discount_codes
                 SET current_uses = current_uses + 1, updated_at = CURRENT_TIMESTAMP
                 WHERE UPPER(code) = UPPER($1)`,
                [code]
            );
        } catch (error) {
            console.error('Error incrementing discount usage:', error);
            throw error;
        }
    }

    /**
     * Retrieves all discount codes from the database
     * @returns {Promise<Array>} Array of discount code objects
     * @throws {Error} If fetching codes fails
     */
    static async getAllCodes() {
        try {
            const result = await pool.query(
                `SELECT * FROM discount_codes ORDER BY created_at DESC`
            );
            return result.rows;
        } catch (error) {
            console.error('Error fetching discount codes:', error);
            throw error;
        }
    }

    /**
     * Creates a new discount code
     * @param {Object} codeData - Discount code data
     * @param {string} codeData.code - The discount code string
     * @param {string} codeData.description - Description of the discount
     * @param {string} codeData.discountType - Type of discount (percentage or fixed_amount)
     * @param {number} codeData.discountValue - Value of the discount
     * @param {Date} codeData.validFrom - Start date for code validity
     * @param {Date} codeData.validUntil - End date for code validity
     * @param {number} codeData.maxUses - Maximum number of uses allowed
     * @param {boolean} codeData.firstPurchaseOnly - Whether code is only for first-time customers
     * @returns {Promise<Object>} Created discount code object
     * @throws {Error} If creating code fails
     */
    static async create(codeData) {
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
            } = codeData;

            const result = await pool.query(
                `INSERT INTO discount_codes
                 (code, description, discount_type, discount_value, valid_from, valid_until, max_uses, first_purchase_only)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 RETURNING *`,
                [code.toUpperCase(), description, discountType, discountValue, validFrom, validUntil, maxUses, firstPurchaseOnly]
            );

            return result.rows[0];
        } catch (error) {
            console.error('Error creating discount code:', error);
            throw error;
        }
    }

    /**
     * Retrieves a discount code by its ID
     * @param {number} codeId - The unique identifier of the discount code
     * @returns {Promise<Object>} Discount code object
     * @throws {Error} If fetching code fails
     */
    static async getById(codeId) {
        try {
            const result = await pool.query(
                `SELECT * FROM discount_codes WHERE code_id = $1`,
                [codeId]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error fetching discount code:', error);
            throw error;
        }
    }

    /**
     * Updates an existing discount code
     * @param {number} codeId - The unique identifier of the discount code
     * @param {Object} codeData - Updated discount code data
     * @param {string} codeData.code - The discount code string
     * @param {string} codeData.description - Description of the discount
     * @param {string} codeData.discountType - Type of discount
     * @param {number} codeData.discountValue - Value of the discount
     * @param {Date} codeData.validFrom - Start date for code validity
     * @param {Date} codeData.validUntil - End date for code validity
     * @param {number} codeData.maxUses - Maximum number of uses allowed
     * @param {boolean} codeData.firstPurchaseOnly - Whether code is only for first-time customers
     * @param {boolean} codeData.isActive - Whether the code is active
     * @returns {Promise<Object>} Updated discount code object
     * @throws {Error} If updating code fails
     */
    static async update(codeId, codeData) {
        try {
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
            } = codeData;

            const result = await pool.query(
                `UPDATE discount_codes
                 SET code = $1, description = $2, discount_type = $3, discount_value = $4,
                     valid_from = $5, valid_until = $6, max_uses = $7, first_purchase_only = $8,
                     is_active = $9, updated_at = CURRENT_TIMESTAMP
                 WHERE code_id = $10
                 RETURNING *`,
                [code.toUpperCase(), description, discountType, discountValue, validFrom, validUntil, maxUses, firstPurchaseOnly, isActive, codeId]
            );

            return result.rows[0];
        } catch (error) {
            console.error('Error updating discount code:', error);
            throw error;
        }
    }

    /**
     * Deletes a discount code
     * @param {number} codeId - The unique identifier of the discount code
     * @returns {Promise<Object>} Deleted discount code object
     * @throws {Error} If deleting code fails
     */
    static async delete(codeId) {
        try {
            const result = await pool.query(
                `DELETE FROM discount_codes WHERE code_id = $1 RETURNING *`,
                [codeId]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error deleting discount code:', error);
            throw error;
        }
    }

    /**
     * Toggles the active status of a discount code
     * @param {number} codeId - The unique identifier of the discount code
     * @returns {Promise<Object>} Updated discount code object
     * @throws {Error} If toggling status fails
     */
    static async toggleActive(codeId) {
        try {
            const result = await pool.query(
                `UPDATE discount_codes
                 SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP
                 WHERE code_id = $1
                 RETURNING *`,
                [codeId]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error toggling discount code status:', error);
            throw error;
        }
    }
}

module.exports = DiscountCode;
