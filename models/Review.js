const pool = require('../config/database');

/**
 * Review model for managing event reviews and ratings
 * @class Review
 */
class Review {
    /**
     * Retrieves all reviews for a specific event with user information
     * @param {number} eventId - The unique identifier of the event
     * @returns {Promise<Array>} Array of review objects with user names
     */
    static async getByEvent(eventId) {
        const result = await pool.query(
            `SELECT r.review_id, r.rating, r.comment, r.created_at, u.name as user_name
             FROM reviews r
             JOIN "user" u ON r.user_id = u.user_id
             WHERE r.event_id = $1
             ORDER BY r.created_at DESC`,
            [eventId]
        );
        return result.rows;
    }

    /**
     * Retrieves review statistics for an event
     * @param {number} eventId - The unique identifier of the event
     * @returns {Promise<Object>} Object containing average rating and total count
     */
    static async getStats(eventId) {
        const result = await pool.query(
            `SELECT ROUND(AVG(rating)::numeric, 1) as avg_rating, COUNT(*) as total
             FROM reviews WHERE event_id = $1`,
            [eventId]
        );
        return result.rows[0];
    }

    /**
     * Retrieves a specific user's review for an event
     * @param {number} userId - The unique identifier of the user
     * @param {number} eventId - The unique identifier of the event
     * @returns {Promise<Object|null>} Review object or null if not found
     */
    static async getUserReview(userId, eventId) {
        const result = await pool.query(
            `SELECT * FROM reviews WHERE user_id = $1 AND event_id = $2`,
            [userId, eventId]
        );
        return result.rows[0] || null;
    }

    /**
     * Checks if a user is eligible to review an event
     * @param {number} userId - The unique identifier of the user
     * @param {number} eventId - The unique identifier of the event
     * @returns {Promise<boolean>} True if user has purchased tickets for the event
     */
    static async canUserReview(userId, eventId) {
        const result = await pool.query(
            `SELECT COUNT(*) FROM purchases
             WHERE user_id = $1 AND event_id = $2 AND status != 'cancelled'`,
            [userId, eventId]
        );
        return parseInt(result.rows[0].count) > 0;
    }

    /**
     * Creates or updates a review for an event
     * @param {Object} reviewData - Review data object
     * @param {number} reviewData.userId - The unique identifier of the user
     * @param {number} reviewData.eventId - The unique identifier of the event
     * @param {number} reviewData.rating - Rating value (typically 1-5)
     * @param {string} [reviewData.comment] - Optional review comment
     * @returns {Promise<Object>} Created or updated review object
     */
    static async create({ userId, eventId, rating, comment }) {
        const result = await pool.query(
            `INSERT INTO reviews (user_id, event_id, rating, comment)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (user_id, event_id)
             DO UPDATE SET rating = $3, comment = $4, created_at = NOW()
             RETURNING *`,
            [userId, eventId, rating, comment || null]
        );
        return result.rows[0];
    }

    /**
     * Deletes a review
     * @param {number} reviewId - The unique identifier of the review
     * @param {number} userId - The unique identifier of the user (for authorization)
     * @returns {Promise<Object|null>} Deleted review object or null if not found
     */
    static async delete(reviewId, userId) {
        const result = await pool.query(
            `DELETE FROM reviews WHERE review_id = $1 AND user_id = $2 RETURNING *`,
            [reviewId, userId]
        );
        return result.rows[0] || null;
    }
}

module.exports = Review;
