/**
 * @file Favourite Controller
 * @description Manages user favorite events including retrieving, adding, and removing favorites.
 */

const Favourite = require('../models/Favourite');
const Event = require('../models/Event');
const User = require('../models/User');

/**
 * Retrieves all favorite event IDs for a specific user.
 *
 * @param {express.Request} req - Express request object containing userId in params
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {400} If userId is not provided
 * @throws {500} If database query fails
 *
 * Side effects:
 * - Creates favorites table if it doesn't exist
 * - Queries favorite event IDs from database
 */
exports.getUserFavourites = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        console.log(`📋 Getting favourites for user ${userId}`);

        await Favourite.createTableIfNotExists();

        const favouriteIds = await Favourite.getByUserId(userId);
        console.log(`📋 Found ${favouriteIds.length} favourites for user ${userId}:`, favouriteIds);

        res.json({
            success: true,
            favourites: favouriteIds
        });

    } catch (error) {
        console.error('❌ Error getting user favourites:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Adds an event to the user's favorites list.
 *
 * @param {express.Request} req - Express request object containing userId and eventId in body
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {400} If required fields are missing
 * @throws {404} If event or user is not found
 * @throws {500} If database operation fails
 *
 * Side effects:
 * - Validates event and user existence
 * - Inserts favorite record into database
 */
exports.addToFavourites = async (req, res) => {
    try {
        const { userId, eventId } = req.body;

        if (!userId || !eventId) {
            return res.status(400).json({
                success: false,
                message: 'User ID and Event ID are required'
            });
        }

        console.log(`❤️ Adding event ${eventId} to favourites for user ${userId}`);

        const event = await Event.getById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        const user = await User.getById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await Favourite.add(userId, eventId);

        console.log(`✅ Added event ${eventId} to favourites for user ${userId}`);

        res.json({
            success: true,
            message: 'Event added to favourites'
        });

    } catch (error) {
        console.error('❌ Error adding to favourites:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Removes an event from the user's favorites list.
 *
 * @param {express.Request} req - Express request object containing userId and eventId in body
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {400} If required fields are missing
 * @throws {500} If database operation fails
 *
 * Side effects:
 * - Deletes favorite record from database
 */
exports.removeFromFavourites = async (req, res) => {
    try {
        const { userId, eventId } = req.body;

        if (!userId || !eventId) {
            return res.status(400).json({
                success: false,
                message: 'User ID and Event ID are required'
            });
        }

        console.log(`🗑️ Removing event ${eventId} from favourites for user ${userId}`);

        await Favourite.remove(userId, eventId);

        console.log(`✅ Removed event ${eventId} from favourites for user ${userId}`);

        res.json({
            success: true,
            message: 'Event removed from favourites'
        });

    } catch (error) {
        console.error('❌ Error removing from favourites:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
