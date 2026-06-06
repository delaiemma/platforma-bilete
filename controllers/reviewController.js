/**
 * @file Review Controller
 * @description Manages event reviews including retrieving, creating, updating, and deleting reviews.
 */

const Review = require('../models/Review');

/**
 * Retrieves all reviews for a specific event along with review statistics.
 *
 * @param {Object} req - Express request object containing eventId in params and optional authenticated user
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {500} If database query fails
 *
 * Side effects:
 * - Fetches all reviews for the event with user details
 * - Calculates review statistics (average rating, count)
 * - If user is authenticated, checks if user can review and retrieves their existing review
 */
exports.getEventReviews = async (req, res) => {
    try {
        const { eventId } = req.params;
        const [reviews, stats] = await Promise.all([
            Review.getByEvent(eventId),
            Review.getStats(eventId)
        ]);

        let userReview = null;
        let canReview = false;
        if (req.user) {
            [userReview, canReview] = await Promise.all([
                Review.getUserReview(req.user.id, eventId),
                Review.canUserReview(req.user.id, eventId)
            ]);
        }

        res.json({ success: true, reviews, stats, userReview, canReview });
    } catch (error) {
        console.error('❌ Error getting reviews:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Creates or updates a review for an event.
 *
 * @param {Object} req - Express request object containing eventId in params, rating and comment in body, and authenticated user
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {400} If rating is missing or invalid (not between 1-5)
 * @throws {403} If user hasn't purchased a ticket for the event
 * @throws {500} If review creation fails
 *
 * Side effects:
 * - Validates that user has purchased tickets for the event
 * - Creates new review or updates existing review
 * - Stores rating (1-5) and optional comment
 */
exports.createOrUpdateReview = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.id;
        const { rating, comment } = req.body;

        const ratingNum = parseInt(rating);
        if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
            return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
        }

        const canReview = await Review.canUserReview(userId, eventId);
        if (!canReview) {
            return res.status(403).json({ success: false, message: 'You must have purchased a ticket to review this event' });
        }

        const review = await Review.create({ userId, eventId, rating: ratingNum, comment });
        res.status(201).json({ success: true, review });
    } catch (error) {
        console.error('❌ Error creating review:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Deletes a review if it belongs to the authenticated user.
 *
 * @param {Object} req - Express request object containing reviewId in params and authenticated user
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {404} If review is not found or doesn't belong to the user
 * @throws {500} If deletion fails
 *
 * Side effects:
 * - Validates review ownership before deletion
 * - Removes review from database
 */
exports.deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user.id;

        const deleted = await Review.delete(reviewId, userId);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Review not found or not yours' });
        }

        res.json({ success: true, message: 'Review deleted' });
    } catch (error) {
        console.error('❌ Error deleting review:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
