/**
 * @file Cart Controller
 * @description Handles shopping cart operations including adding/removing items,
 * updating quantities, and managing temporary seat reservations.
 */

const Cart = require('../models/Cart');
const Reservation = require('../models/Reservation');
const Event = require('../models/Event');

/**
 * Retrieves the shopping cart and active reservations for a specific user.
 *
 * @param {express.Request} req - Express request object containing userId in params
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {400} If userId is not provided
 * @throws {500} If database operation fails
 *
 * Side effects:
 * - Creates cart table if it doesn't exist
 * - Queries cart and reservation data from database
 */
exports.getUserCart = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        console.log(`🛒 Getting cart for user ${userId}`);

        await Cart.createTableIfNotExists();

        const cart = await Cart.getByUserId(userId);
        const reservations = await Reservation.getByUser(userId);

        console.log(`📋 Found ${Object.keys(cart).length} items in cart for user ${userId}`);

        res.json({
            success: true,
            cart,
            reservations
        });

    } catch (error) {
        console.error('❌ Error getting cart:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Adds an event to the user's cart and creates a temporary reservation.
 *
 * @param {express.Request} req - Express request object containing userId, eventId, and quantity in body
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {400} If required fields are missing or quantity exceeds available tickets
 * @throws {404} If event is not found
 * @throws {500} If database operation fails
 *
 * Side effects:
 * - Creates a temporary reservation with expiration time
 * - Adds item to cart in database
 * - Reserves tickets temporarily
 */
exports.addToCart = async (req, res) => {
    try {
        console.log('🚀 [addToCart] Function called');
        const { userId, eventId, quantity } = req.body;
        console.log('🚀 [addToCart] Body:', { userId, eventId, quantity });

        if (!userId || !eventId || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'User ID, Event ID and quantity are required'
            });
        }

        console.log(`➕ Adding to cart: User ${userId}, Event ${eventId}, Quantity ${quantity}`);

        const event = await Event.getById(eventId);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        const totalReserved = await Reservation.getTotalReservedByEvent(eventId);
        const availableTickets = event.available_tickets - totalReserved;

        if (quantity > availableTickets) {
            return res.status(400).json({
                success: false,
                message: `Only ${availableTickets} tickets available`
            });
        }

        const reservation = await Reservation.create(userId, eventId, quantity);
        console.log(`⏰ Created reservation expires at: ${reservation.expires_at}`);

        await Cart.add(userId, eventId, quantity);

        console.log('🔍 [addToCart] About to get io object...');
        const io = req.app.get('io');
        console.log('🔍 [addToCart] io object:', io ? 'EXISTS' : 'NULL/UNDEFINED');

        if (io) {
            console.log(`🔍 [addToCart] Emitting to room: event-${eventId}`);
            io.to(`event-${eventId}`).emit('tickets-updated', {
                eventId: parseInt(eventId),
                userId,
                action: 'cart-reservation-created'
            });
            console.log(`📡 Emitted tickets-updated for event ${eventId} (cart reservation created)`);
        } else {
            console.error('❌ [addToCart] IO object is not available!');
        }

        console.log(`✅ Added event ${eventId} to cart for user ${userId}`);

        res.json({
            success: true,
            message: 'Item added to cart',
            reservation
        });

    } catch (error) {
        console.error('❌ Error adding to cart:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Updates the quantity of an item in the cart or removes it if quantity is 0.
 *
 * @param {express.Request} req - Express request object containing userId, eventId, and quantity in body
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {400} If required fields are missing or quantity exceeds available tickets
 * @throws {404} If event is not found
 * @throws {500} If database operation fails
 *
 * Side effects:
 * - Updates or deletes cart item in database
 * - Updates or deletes reservation
 * - Refreshes reservation expiration time
 */
exports.updateCartItem = async (req, res) => {
    try {
        const { userId, eventId, quantity } = req.body;

        if (!userId || !eventId || quantity === undefined) {
            return res.status(400).json({
                success: false,
                message: 'User ID, Event ID and quantity are required'
            });
        }

        console.log(`🔄 Updating cart: User ${userId}, Event ${eventId}, Quantity ${quantity}`);

        if (quantity === 0) {
            console.log(`🗑️ Quantity is 0, removing item from cart`);

            await Reservation.delete(userId, eventId);
            console.log(`⏰ Deleted reservation for event ${eventId}`);

            await Cart.remove(userId, eventId);

            const io = req.app.get('io');
            if (io) {
                io.to(`event-${eventId}`).emit('tickets-updated', {
                    eventId: parseInt(eventId),
                    userId,
                    action: 'cart-reservation-deleted'
                });
                console.log(`📡 Emitted tickets-updated for event ${eventId} (cart reservation deleted)`);
            }

            console.log(`✅ Removed event ${eventId} from cart for user ${userId}`);

            return res.json({
                success: true,
                message: 'Item removed from cart'
            });
        }

        const event = await Event.getById(eventId);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        const totalReserved = await Reservation.getTotalReservedByEvent(eventId);
        const currentReservation = await Reservation.getByUserAndEvent(userId, eventId);
        const otherReservations = totalReserved - (currentReservation?.quantity || 0);
        const availableTickets = event.available_tickets - otherReservations;

        if (quantity > availableTickets) {
            return res.status(400).json({
                success: false,
                message: `Only ${availableTickets} tickets available`
            });
        }

        const reservation = await Reservation.updateQuantity(userId, eventId, quantity);
        console.log(`⏰ Updated reservation expires at: ${reservation.expires_at}`);

        await Cart.update(userId, eventId, quantity);

        const io = req.app.get('io');
        if (io) {
            io.to(`event-${eventId}`).emit('tickets-updated', {
                eventId: parseInt(eventId),
                userId,
                action: 'cart-reservation-updated'
            });
            console.log(`📡 Emitted tickets-updated for event ${eventId} (cart reservation updated)`);
        }

        console.log(`✅ Updated cart item for user ${userId}`);

        res.json({
            success: true,
            message: 'Cart updated',
            reservation
        });

    } catch (error) {
        console.error('❌ Error updating cart:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Removes an event from the user's cart and releases the associated reservation.
 *
 * @param {express.Request} req - Express request object containing userId and eventId in body
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {400} If required fields are missing
 * @throws {500} If database operation fails
 *
 * Side effects:
 * - Deletes reservation from database
 * - Removes item from cart
 * - Releases temporarily reserved tickets
 */
exports.removeFromCart = async (req, res) => {
    try {
        const { userId, eventId } = req.body;

        if (!userId || !eventId) {
            return res.status(400).json({
                success: false,
                message: 'User ID and Event ID are required'
            });
        }

        console.log(`🗑️ Removing from cart: User ${userId}, Event ${eventId}`);

        await Reservation.delete(userId, eventId);
        console.log(`⏰ Deleted reservation for event ${eventId}`);

        await Cart.remove(userId, eventId);

        const io = req.app.get('io');
        if (io) {
            io.to(`event-${eventId}`).emit('tickets-updated', {
                eventId: parseInt(eventId),
                userId,
                action: 'cart-reservation-deleted'
            });
            console.log(`📡 Emitted tickets-updated for event ${eventId} (cart reservation deleted)`);
        }

        console.log(`✅ Removed event ${eventId} from cart for user ${userId}`);

        res.json({
            success: true,
            message: 'Item removed from cart'
        });

    } catch (error) {
        console.error('❌ Error removing from cart:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
