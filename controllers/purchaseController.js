/**
 * @file Purchase Controller
 * @description Handles ticket purchase processing, ticket retrieval, and purchase cancellations
 * with refund processing.
 */

const pool = require('../config/database');
const Purchase = require('../models/Purchase');
const Event = require('../models/Event');
const SeatReservation = require('../models/SeatReservation');
const TicketSeat = require('../models/TicketSeat');
const Payment = require('../models/Payment');
const Waitlist = require('../models/Waitlist');
const QRCode = require('qrcode');
const { sendTicketEmail, sendCancellationEmail } = require('../services/emailService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const DiscountCode = require('../models/DiscountCode');

/**
 * Processes a ticket purchase for one or more events.
 *
 * @param {express.Request} req - Express request object containing userId, events array, and optional paymentIntentId in body
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {400} If required fields are missing, payment not verified, event not found, or insufficient tickets
 * @throws {403} If payment belongs to different user
 * @throws {500} If purchase processing fails
 *
 * Side effects:
 * - Uses SERIALIZABLE transaction isolation level for consistency
 * - Verifies payment status if paymentIntentId provided
 * - Validates seat reservations for seat-based events
 * - Applies discount code if present in payment metadata
 * - Creates purchase records and generates QR codes for tickets
 * - Updates event ticket counts (available_tickets and tickets_sold)
 * - Releases seat reservations after purchase
 * - Deletes cart items after successful purchase
 * - Increments discount code usage counter
 * - Links payment to purchase in database
 * - Sends ticket confirmation email to user
 * - Emits real-time socket events for ticket updates
 */
exports.processPurchase = async (req, res) => {
    const client = await pool.connect();

    try {
        const { userId, events, paymentIntentId } = req.body;

        if (!userId || !Array.isArray(events) || events.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'User ID and events array are required'
            });
        }

        let discountCode = null;

        if (paymentIntentId) {
            console.log(`💳 Verifying payment: ${paymentIntentId}`);

            const payment = await Payment.getByStripeIntentId(paymentIntentId);

            if (!payment) {
                return res.status(400).json({
                    success: false,
                    message: 'Payment not found'
                });
            }

            if (payment.status !== 'succeeded') {
                return res.status(400).json({
                    success: false,
                    message: `Payment not completed. Status: ${payment.status}`
                });
            }

            if (payment.user_id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Payment does not belong to this user'
                });
            }

            try {
                const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
                discountCode = paymentIntent.metadata?.discountCode || null;
                if (discountCode && discountCode.trim() === '') {
                    discountCode = null;
                }
                if (discountCode) {
                    console.log(`🎫 Discount code used: ${discountCode}`);
                }
            } catch (error) {
                console.error('⚠️ Failed to retrieve payment intent metadata:', error.message);
            }

            console.log(`✅ Payment verified successfully`);
        }

        console.log(`🛒 Processing purchase for user ${userId}:`, events);

        await client.query('BEGIN');
        await client.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');

        let grandTotal = 0;
        let discountInfo = null;

        for (const eventItem of events) {
            const { eventId, quantity, seats } = eventItem;
            const isSeatBased = seats && Array.isArray(seats) && seats.length > 0;

            const eventResult = await client.query('SELECT * FROM event WHERE event_id = $1', [eventId]);
            if (eventResult.rows.length === 0) {
                throw new Error(`Event ${eventId} not found`);
            }
            const event = eventResult.rows[0];

            if (isSeatBased) {
                grandTotal += seats.reduce((sum, s) => sum + parseFloat(s.price || 0), 0);
            } else {
                grandTotal += parseFloat(event.price) * parseInt(quantity);
            }
        }

        let finalTotal = grandTotal;
        let discountAmount = 0;

        if (discountCode) {
            try {
                const validation = await DiscountCode.validateCode(discountCode, userId);
                if (validation.valid) {
                    const calculation = DiscountCode.calculateDiscount(grandTotal, validation);
                    discountAmount = calculation.discountAmount;
                    finalTotal = calculation.finalAmount;
                    discountInfo = validation;
                    console.log(`🎫 Discount applied: ${discountCode}, Amount: $${discountAmount}, Final: $${finalTotal}`);
                }
            } catch (error) {
                console.error('⚠️ Failed to apply discount:', error.message);

            }
        }

        const discountRatio = grandTotal > 0 ? (finalTotal / grandTotal) : 1;
        console.log(`💰 Grand Total: $${grandTotal}, Discount: $${discountAmount}, Final: $${finalTotal}, Ratio: ${discountRatio}`);

        const purchasedTickets = [];

        for (const eventItem of events) {
            const { eventId, quantity, seats } = eventItem;
            const isSeatBased = seats && Array.isArray(seats) && seats.length > 0;

            console.log(`🔍 Processing eventId: ${eventId}${isSeatBased ? `, seats: ${seats.length}` : `, quantity: ${quantity}`}`);

            const eventResult = await client.query(
                'SELECT * FROM event WHERE event_id = $1',
                [eventId]
            );

            if (eventResult.rows.length === 0) {
                throw new Error(`Event ${eventId} not found`);
            }

            const event = eventResult.rows[0];
            const ticketsSold = parseInt(event.tickets_sold) || 0;

            if (isSeatBased) {

                console.log(`🪑 Processing seat-based purchase for "${event.title}"`);

                for (const seat of seats) {
                    const reservationCheck = await client.query(
                        'SELECT * FROM seat_reservations WHERE user_id = $1 AND event_id = $2 AND row_letter = $3 AND seat_number = $4',
                        [userId, eventId, seat.row_letter, seat.seat_number]
                    );

                    if (reservationCheck.rows.length === 0) {
                        throw new Error(`Seat ${seat.row_letter}${seat.seat_number} is no longer reserved. Please refresh and try again.`);
                    }
                }

                const totalPrice = seats.reduce((sum, s) => sum + parseFloat(s.price || 0), 0);

                const discountedPrice = totalPrice * discountRatio;

                const purchaseResult = await client.query(
                    'INSERT INTO purchases (user_id, event_id, quantity, total_price) VALUES ($1, $2, $3, $4) RETURNING purchase_id',
                    [userId, eventId, seats.length, discountedPrice]
                );

                const purchaseId = purchaseResult.rows[0].purchase_id;

                const accessibilitySet = new Set();
                const firstRowResult = await client.query(
                    `SELECT lr.row_letter, lr.seats_in_row
                     FROM layout_rows lr
                     JOIN seat_zones sz ON lr.zone_id = sz.zone_id
                     JOIN event_layouts el ON el.layout_id = sz.layout_id
                     WHERE el.event_id = $1
                     ORDER BY lr.row_order ASC LIMIT 1`,
                    [eventId]
                );
                if (firstRowResult.rows.length > 0) {
                    const fr = firstRowResult.rows[0];
                    const half = Math.floor(fr.seats_in_row * 0.2 / 2);
                    for (let i = 1; i <= half; i++) accessibilitySet.add(`${fr.row_letter}-${i}`);
                    for (let i = fr.seats_in_row - half + 1; i <= fr.seats_in_row; i++) accessibilitySet.add(`${fr.row_letter}-${i}`);
                }

                const qrCodes = [];
                for (const seat of seats) {
                    const ticketId = `TKT-${purchaseId.toString().padStart(4, '0')}-${eventId.toString().padStart(4, '0')}-${seat.row_letter}${seat.seat_number}`;
                    const qrCodeData = await QRCode.toDataURL(ticketId);

                    await client.query(
                        `INSERT INTO ticket_seats (purchase_id, event_id, row_letter, seat_number, zone_id, ticket_id, qr_code)
                         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                        [purchaseId, eventId, seat.row_letter, seat.seat_number, seat.zone_id, ticketId, qrCodeData]
                    );

                    qrCodes.push({
                        ticketId,
                        qrCodeData,
                        seat: `${seat.row_letter}${seat.seat_number}`,
                        price: seat.price,
                        isAccessibility: accessibilitySet.has(`${seat.row_letter}-${seat.seat_number}`)
                    });
                }

                await client.query(
                    'DELETE FROM seat_reservations WHERE user_id = $1 AND event_id = $2',
                    [userId, eventId]
                );

                await client.query(
                    'UPDATE event SET tickets_sold = tickets_sold + $1 WHERE event_id = $2',
                    [seats.length, eventId]
                );

                purchasedTickets.push({
                    event,
                    quantity: seats.length,
                    totalPrice: discountedPrice,
                    qrCodes,
                    seats: seats.map(s => ({ row: s.row_letter, number: s.seat_number, price: s.price * discountRatio }))
                });

                console.log(`✅ Purchased ${seats.length} seats for "${event.title}". Original: $${totalPrice}, Final: $${discountedPrice}`);

            } else {

                const requestedQuantity = parseInt(quantity);
                const availableTickets = parseInt(event.available_tickets);
                const price = parseFloat(event.price) || 0;
                const totalPrice = price * requestedQuantity;

                const discountedPrice = totalPrice * discountRatio;

                console.log(`📊 Event: ${event.title}, Available: ${availableTickets}, Requested: ${requestedQuantity}, Original: $${totalPrice}, Discounted: $${discountedPrice}`);

                if (availableTickets < requestedQuantity) {
                    throw new Error(`Not enough tickets for "${event.title}". Available: ${availableTickets}, Requested: ${requestedQuantity}`);
                }

                await client.query(
                    'UPDATE event SET available_tickets = available_tickets - $1, tickets_sold = tickets_sold + $1 WHERE event_id = $2',
                    [requestedQuantity, eventId]
                );

                const updatedEventResult = await client.query(
                    'SELECT available_tickets FROM event WHERE event_id = $1',
                    [eventId]
                );
                const updatedAvailableTickets = parseInt(updatedEventResult.rows[0]?.available_tickets || 0);

                if (updatedAvailableTickets === 0) {
                    console.log(`🎉 Event ${eventId} sold out (0 tickets remaining).`);
                }

                await client.query(
                    'DELETE FROM cart_reservations WHERE user_id = $1 AND event_id = $2',
                    [userId, eventId]
                );

                await client.query(
                    'DELETE FROM cart WHERE user_id = $1 AND event_id = $2',
                    [userId, eventId]
                );

                const purchaseResult = await client.query(
                    'INSERT INTO purchases (user_id, event_id, quantity, total_price) VALUES ($1, $2, $3, $4) RETURNING purchase_id',
                    [userId, eventId, requestedQuantity, discountedPrice]
                );

                const purchaseId = purchaseResult.rows[0].purchase_id;

                const qrCodes = [];
                for (let i = 0; i < requestedQuantity; i++) {
                    const ticketId = `TKT-${purchaseId.toString().padStart(4, '0')}-${eventId.toString().padStart(4, '0')}-${(i + 1).toString().padStart(2, '0')}`;
                    const qrCodeData = await QRCode.toDataURL(ticketId);

                    await client.query(
                        `INSERT INTO ticket_seats (purchase_id, event_id, ticket_id, qr_code)
                         VALUES ($1, $2, $3, $4)`,
                        [purchaseId, eventId, ticketId, qrCodeData]
                    );

                    qrCodes.push({ ticketId, qrCodeData });
                }

                purchasedTickets.push({
                    event,
                    quantity: requestedQuantity,
                    totalPrice: discountedPrice,
                    qrCodes
                });

                console.log(`✅ Purchased ${requestedQuantity} tickets for "${event.title}". Original: $${totalPrice}, Final: $${discountedPrice}`);
            }
        }

        await client.query('COMMIT');

        if (discountCode) {
            try {
                await DiscountCode.incrementUsage(discountCode);
                console.log(`✅ Discount code ${discountCode} usage incremented`);
            } catch (error) {
                console.error(`❌ Failed to increment discount code usage for ${discountCode}:`, error.message);

            }
        }

        if (paymentIntentId && purchasedTickets.length > 0) {
            try {

                const purchaseIds = purchasedTickets.map(pt => {

                    const ticketId = pt.qrCodes[0]?.ticketId || '';
                    const parts = ticketId.split('-');
                    return parts.length > 1 ? parseInt(parts[1]) : null;
                }).filter(id => id !== null);

                if (purchaseIds.length > 0) {
                    await Payment.updatePurchaseId(paymentIntentId, purchaseIds[0]);
                    console.log(`✅ Payment ${paymentIntentId} linked to purchase ${purchaseIds[0]}`);
                }
            } catch (error) {
                console.error('❌ Failed to update payment record:', error.message);

            }
        }

        const userResult = await client.query(
            'SELECT name, email FROM "user" WHERE user_id = $1',
            [userId]
        );
        const user = userResult.rows[0];

        if (user && user.email) {
            sendTicketEmail(user.email, user.name, purchasedTickets)
                .then(() => {
                    console.log(`✉️ Email sent successfully to ${user.email}`);
                })
                .catch((error) => {
                    console.error(`❌ Failed to send email to ${user.email}:`, error.message);

                });
        }

        const tickets = [];
        for (const ticket of purchasedTickets) {

            if (ticket.seats && ticket.seats.length > 0) {

                ticket.qrCodes.forEach((qrCode, index) => {
                    const seat = ticket.seats[index];
                    tickets.push({
                        purchase_id: qrCode.ticketId.split('-')[1] || 'N/A',
                        event_id: ticket.event.event_id,
                        event_title: ticket.event.title,
                        location: ticket.event.location,
                        city: ticket.event.city,
                        date: ticket.event.date,
                        time: ticket.event.time,
                        quantity: 1,
                        price: seat.price,
                        total_price: seat.price,
                        seat: `${seat.row}${seat.number}`,
                        ticket_id: qrCode.ticketId,
                        qr_code: qrCode.qrCodeData
                    });
                });
            } else {

                const pricePerTicket = ticket.totalPrice / ticket.quantity;
                tickets.push({
                    purchase_id: ticket.qrCodes[0]?.ticketId.split('-')[1] || 'N/A',
                    event_id: ticket.event.event_id,
                    event_title: ticket.event.title,
                    location: ticket.event.location,
                    city: ticket.event.city,
                    date: ticket.event.date,
                    time: ticket.event.time,
                    quantity: ticket.quantity,
                    price: pricePerTicket,
                    total_price: ticket.totalPrice,
                    qr_codes: ticket.qrCodes
                });
            }
        }

        const io = req.app.get('io');
        if (io) {
            for (const ticket of purchasedTickets) {
                const eventId = ticket.event.event_id;

                const updatedEvent = await client.query(
                    'SELECT available_tickets FROM event WHERE event_id = $1',
                    [eventId]
                );
                const availableTickets = updatedEvent.rows[0]?.available_tickets || 0;

                io.to(`event-${eventId}`).emit('tickets-updated', {
                    eventId,
                    availableTickets,
                    action: 'purchase'
                });

                io.emit('tickets-updated', {
                    eventId,
                    availableTickets,
                    action: 'purchase'
                });

                console.log(`📡 Emitted tickets-updated for event ${eventId}: ${availableTickets} available (purchase)`);
            }
        }

        await Waitlist.markPurchased(eventId, userId).catch(() => {});

        res.json({
            success: true,
            message: 'Purchase completed successfully',
            emailSent: !!user?.email,
            tickets: tickets
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Purchase error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    } finally {
        client.release();
    }
};

/**
 * Retrieves all tickets purchased by a specific user.
 *
 * @param {Object} req - Express request object containing userId in params
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {500} If database query fails
 *
 * Side effects:
 * - Queries purchases with event and ticket seat details
 * - Groups tickets by purchase
 * - Excludes cancelled purchases
 * - Returns ticket details including QR codes
 */
exports.getUserTickets = async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await pool.query(`
            SELECT
                p.purchase_id,
                p.event_id,
                p.quantity,
                p.total_price,
                p.status,
                e.title as event_title,
                e.location,
                e.city,
                e.date,
                e.time,
                e.price,
                e.image_path,
                ts.ticket_seat_id,
                ts.row_letter,
                ts.seat_number,
                ts.ticket_id,
                ts.qr_code
            FROM purchases p
            JOIN event e ON p.event_id = e.event_id
            LEFT JOIN ticket_seats ts ON p.purchase_id = ts.purchase_id
            WHERE p.user_id = $1 AND p.status != 'cancelled'
            ORDER BY p.purchase_id DESC
        `, [userId]);

        const purchases = {};

        result.rows.forEach(row => {
            if (!purchases[row.purchase_id]) {
                purchases[row.purchase_id] = {
                    purchase_id: row.purchase_id,
                    event_id: row.event_id,
                    event_title: row.event_title,
                    location: row.location,
                    city: row.city,
                    date: row.date,
                    time: row.time,
                    price: row.price,
                    image_path: row.image_path,
                    quantity: row.quantity,
                    total_price: row.total_price,
                    status: row.status,
                    tickets: []
                };
            }

            if (row.ticket_seat_id) {
                purchases[row.purchase_id].tickets.push({
                    ticket_id: row.ticket_id,
                    seat: row.row_letter && row.seat_number ? `${row.row_letter}${row.seat_number}` : null,
                    qr_code: row.qr_code
                });
            }
        });

        const ticketsList = Object.values(purchases).sort((a, b) => b.purchase_id - a.purchase_id);

        res.json({
            success: true,
            tickets: ticketsList
        });

    } catch (error) {
        console.error('❌ Error fetching user tickets:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tickets'
        });
    }
};

/**
 * Cancels a purchase and processes a refund through Stripe.
 *
 * @param {Object} req - Express request object containing purchaseId in params and authenticated user
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {400} If purchaseId is invalid, purchase already cancelled, or event has already occurred
 * @throws {403} If user doesn't own the purchase
 * @throws {404} If purchase is not found
 * @throws {500} If cancellation fails
 *
 * Side effects:
 * - Uses database transaction for consistency
 * - Validates purchase ownership and status
 * - Creates Stripe refund if payment exists
 * - Updates purchase status to 'cancelled'
 * - Restores tickets to event availability
 * - Deletes ticket seat records
 * - Sends cancellation confirmation email with refund details
 * - Emits real-time socket events for ticket availability updates
 */
exports.cancelPurchase = async (req, res) => {
    const client = await pool.connect();

    try {
        const purchaseId = parseInt(req.params.purchaseId);

        if (!purchaseId) {
            return res.status(400).json({ success: false, message: 'Purchase ID invalid' });
        }

        const purchase = await Purchase.getById(purchaseId);

        if (!purchase) {
            return res.status(404).json({ success: false, message: 'Comanda nu a fost găsită' });
        }

        if (purchase.user_id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Nu ai permisiunea să anulezi această comandă' });
        }

        if (purchase.status === 'cancelled') {
            return res.status(400).json({ success: false, message: 'Biletul este deja anulat' });
        }

        const eventDateTime = new Date(`${purchase.date} ${purchase.time || '00:00'}`);
        const now = new Date();

        if (eventDateTime <= now) {
            return res.status(400).json({ success: false, message: 'Nu poți anula un bilet după ce evenimentul a avut loc' });
        }

        const cancellationDeadlineHours = parseInt(process.env.CANCELLATION_DEADLINE_HOURS || 24);
        const hoursUntilEvent = (eventDateTime - now) / (1000 * 60 * 60);

        if (hoursUntilEvent <= cancellationDeadlineHours) {
            return res.status(400).json({
                success: false,
                message: `Nu poți anula biletul cu ${cancellationDeadlineHours} ore sau mai puțin înainte de eveniment. Evenimentul are loc în ${Math.floor(hoursUntilEvent)} ore.`
            });
        }

        await client.query('BEGIN');

        const purchaseDetails = await client.query(
            `SELECT p.*, e.title as event_title, e.date as event_date, u.email, u.name
             FROM purchases p
             JOIN event e ON p.event_id = e.event_id
             JOIN "user" u ON p.user_id = u.user_id
             WHERE p.purchase_id = $1`,
            [purchaseId]
        );

        const fullPurchase = purchaseDetails.rows[0];

        const paymentResult = await client.query(
            `SELECT stripe_payment_intent_id FROM payments WHERE purchase_id = $1`,
            [purchaseId]
        );

        let refundId = null;
        let refundStatus = 'pending';

        if (paymentResult.rows.length > 0 && paymentResult.rows[0].stripe_payment_intent_id) {
            const stripePaymentIntentId = paymentResult.rows[0].stripe_payment_intent_id;

            try {
                console.log(`💰 Processing refund for payment intent: ${stripePaymentIntentId}`);

                const refund = await stripe.refunds.create({
                    payment_intent: stripePaymentIntentId,
                });

                refundId = refund.id;
                refundStatus = refund.status;

                console.log(`✅ Refund created: ${refund.id}, status: ${refund.status}`);

            } catch (stripeError) {
                console.error('❌ Stripe refund error:', stripeError);

            }
        }

        await client.query(
            `UPDATE purchases SET status = 'cancelled' WHERE purchase_id = $1`,
            [purchaseId]
        );

        await client.query(
            `UPDATE event
             SET available_tickets = available_tickets + $1,
                 tickets_sold = tickets_sold - $1
             WHERE event_id = $2`,
            [purchase.quantity, purchase.event_id]
        );

        await client.query(
            `DELETE FROM ticket_seats WHERE purchase_id = $1`,
            [purchaseId]
        );

        await client.query('COMMIT');

        try {
            await sendCancellationEmail({
                email: fullPurchase.email,
                userName: fullPurchase.name,
                eventTitle: fullPurchase.event_title,
                eventDate: fullPurchase.event_date,
                quantity: fullPurchase.quantity,
                refundAmount: fullPurchase.total_price,
                purchaseId: purchaseId,
                refundId: refundId,
                refundStatus: refundStatus
            });
            console.log('✅ Cancellation email sent to:', fullPurchase.email);
        } catch (emailError) {
            console.error('❌ Failed to send cancellation email:', emailError);

        }

        const io = req.app.get('io');
        if (io) {

            const eventUpdate = await client.query(
                'SELECT available_tickets FROM event WHERE event_id = $1',
                [purchase.event_id]
            );

            const availableTickets = eventUpdate.rows[0]?.available_tickets || 0;

            io.to(`event-${purchase.event_id}`).emit('tickets-updated', {
                eventId: purchase.event_id,
                availableTickets,
                action: 'cancel'
            });

            io.emit('tickets-updated', {
                eventId: purchase.event_id,
                availableTickets,
                action: 'cancel'
            });

            console.log(`📡 Emitted tickets-updated for event ${purchase.event_id}: ${availableTickets} available (cancel)`);

            await Waitlist.notifyNext(purchase.event_id);
        }

        res.json({
            success: true,
            message: 'Biletul a fost anulat cu succes. Vei primi un email de confirmare.',
            refundStatus: refundStatus
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Cancel purchase error:', error);
        res.status(500).json({ success: false, message: 'Eroare la anularea biletului' });
    } finally {
        client.release();
    }
};
