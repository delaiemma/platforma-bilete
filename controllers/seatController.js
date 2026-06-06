/**
 * @file Seat Controller
 * @description Manages seat reservations, availability, and ticket verification for events
 * with assigned seating.
 */

const SeatReservation = require('../models/SeatReservation');
const TicketSeat = require('../models/TicketSeat');
const EventLayout = require('../models/EventLayout');

/**
 * Reserves specific seats for a user at an event.
 *
 * @param {Object} req - Express request object containing userId, eventId, and seats array in body
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {400} If required fields are missing, event has no seating, or seats are unavailable
 * @throws {500} If reservation fails
 *
 * Side effects:
 * - Validates event has seat selection enabled
 * - Creates temporary seat reservations with expiration time
 * - Emits real-time socket events for seat status updates
 * - Prevents double-booking of seats
 */
exports.reserveSeats = async (req, res) => {
    try {
        const { userId, eventId, seats } = req.body;

        if (!userId || !eventId || !seats || !Array.isArray(seats) || seats.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'userId, eventId, and seats array are required'
            });
        }

        const eventLayout = await EventLayout.getByEventId(eventId);
        if (!eventLayout) {
            return res.status(400).json({
                success: false,
                message: 'This event does not have seat selection enabled'
            });
        }

        const reservations = await SeatReservation.reserveSeats(userId, eventId, seats);

        const io = req.app.get('io');
        if (io) {
            io.to(`event-${eventId}`).emit('seats-reserved', {
                eventId,
                seats: seats.map(s => ({ row: s.row_letter, number: s.seat_number })),
                userId,
                action: 'reserve'
            });

            io.to(`event-${eventId}`).emit('tickets-updated', {
                eventId: parseInt(eventId),
                userId,
                action: 'seat-reservation-created'
            });

            console.log(`📡 Emitted seats-reserved for event ${eventId}: ${seats.length} seats`);
            console.log(`📡 Emitted tickets-updated for event ${eventId} (seat reservation created)`);
        }

        res.status(201).json({
            success: true,
            message: `${reservations.length} seat(s) reserved successfully`,
            reservations,
            expires_at: reservations[0]?.expires_at
        });

    } catch (error) {
        console.error('Error reserving seats:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Error reserving seats'
        });
    }
};

/**
 * Releases seat reservations for a user at an event.
 *
 * @param {Object} req - Express request object containing userId, eventId, and seats array in body
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {400} If required fields are missing
 * @throws {500} If release operation fails
 *
 * Side effects:
 * - Deletes seat reservations from database
 * - Emits real-time socket events for seat availability updates
 * - Makes seats available for other users
 */
exports.unreserveSeats = async (req, res) => {
    try {
        const { userId, eventId, seats } = req.body;

        if (!userId || !eventId || !seats || !Array.isArray(seats)) {
            return res.status(400).json({
                success: false,
                message: 'userId, eventId, and seats array are required'
            });
        }

        const deletedCount = await SeatReservation.releaseSeats(userId, eventId, seats);

        const io = req.app.get('io');
        if (io) {
            io.to(`event-${eventId}`).emit('seats-released', {
                eventId,
                seats: seats.map(s => ({ row: s.row_letter, number: s.seat_number })),
                userId,
                action: 'release'
            });

            io.to(`event-${eventId}`).emit('tickets-updated', {
                eventId: parseInt(eventId),
                userId,
                action: 'seat-reservation-released'
            });

            console.log(`📡 Emitted seats-released for event ${eventId}: ${deletedCount} seats`);
            console.log(`📡 Emitted tickets-updated for event ${eventId} (seat reservation released)`);
        }

        res.json({
            success: true,
            message: `${deletedCount} seat(s) released successfully`,
            deletedCount
        });

    } catch (error) {
        console.error('Error releasing seats:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error releasing seats'
        });
    }
};

/**
 * Retrieves seat availability and layout for an event.
 *
 * @param {Object} req - Express request object containing eventId in params and optional userId in query
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {404} If event has no seating layout
 * @throws {500} If retrieval fails
 *
 * Side effects:
 * - Fetches event layout with zones and rows
 * - Retrieves seat status (available, reserved, sold)
 * - Marks user's own reservations as 'selected' if userId provided
 * - Returns complete seat map with status for each seat
 */
exports.getSeatAvailability = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.query.userId ? parseInt(req.query.userId) : null;

        const eventLayout = await EventLayout.getByEventId(parseInt(eventId));

        if (!eventLayout) {
            return res.status(404).json({
                success: false,
                message: 'Event does not have seat selection or not found'
            });
        }

        const seatMap = await TicketSeat.getSeatMapStatus(parseInt(eventId));

        let userReservations = [];
        if (userId) {
            userReservations = await SeatReservation.getByUserAndEvent(userId, parseInt(eventId));
        }

        const firstRow = eventLayout.rows.reduce((min, r) => r.row_order < min.row_order ? r : min);
        const accessCount = Math.max(2, Math.round(firstRow.seats_in_row * 0.2));
        const half = Math.floor(accessCount / 2);
        const accessibilitySeats = new Set();
        for (let i = 1; i <= half; i++) accessibilitySeats.add(`${firstRow.row_letter}-${i}`);
        for (let i = firstRow.seats_in_row - half + 1; i <= firstRow.seats_in_row; i++) accessibilitySeats.add(`${firstRow.row_letter}-${i}`);

        const availability = {};
        eventLayout.rows.forEach(row => {
            for (let seatNum = 1; seatNum <= row.seats_in_row; seatNum++) {
                const key = `${row.row_letter}-${seatNum}`;
                const isAccessibility = accessibilitySeats.has(key);

                if (seatMap[key]) {
                    if (seatMap[key].status === 'sold') {
                        availability[key] = { status: 'sold', accessibility: isAccessibility };
                    } else if (seatMap[key].status === 'reserved') {
                        if (userId && seatMap[key].user_id === userId) {
                            availability[key] = { status: 'selected', user: 'self', accessibility: isAccessibility };
                        } else {
                            availability[key] = { status: 'reserved', accessibility: isAccessibility };
                        }
                    }
                } else {
                    availability[key] = { status: 'available', accessibility: isAccessibility };
                }
            }
        });

        res.json({
            success: true,
            layout: eventLayout,
            availability,
            userReservations
        });

    } catch (error) {
        console.error('Error getting seat availability:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving seat availability'
        });
    }
};

/**
 * Extends the expiration time of seat reservations for a user.
 *
 * @param {Object} req - Express request object containing userId and eventId in body
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {400} If required fields are missing
 * @throws {500} If extension fails
 *
 * Side effects:
 * - Updates reservation expiration time in database
 * - Extends reservation by default time period
 */
exports.extendReservation = async (req, res) => {
    try {
        const { userId, eventId } = req.body;

        if (!userId || !eventId) {
            return res.status(400).json({
                success: false,
                message: 'userId and eventId are required'
            });
        }

        const updatedCount = await SeatReservation.extendReservation(userId, eventId);

        res.json({
            success: true,
            message: `Reservation extended for ${updatedCount} seat(s)`,
            updatedCount
        });

    } catch (error) {
        console.error('Error extending reservation:', error);
        res.status(500).json({
            success: false,
            message: 'Error extending reservation'
        });
    }
};

/**
 * Retrieves all active seat reservations for a user.
 *
 * @param {Object} req - Express request object containing userId in params
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {500} If retrieval fails
 *
 * Side effects:
 * - Queries all reservations for the user with event details
 * - Groups reservations by event
 * - Returns expiration time for each event
 */
exports.getUserReservations = async (req, res) => {
    try {
        const { userId } = req.params;

        const reservations = await SeatReservation.getByUser(parseInt(userId));

        const groupedByEvent = {};
        reservations.forEach(reservation => {
            if (!groupedByEvent[reservation.event_id]) {
                groupedByEvent[reservation.event_id] = {
                    event_id: reservation.event_id,
                    event_title: reservation.event_title,
                    seats: [],
                    expires_at: reservation.expires_at
                };
            }

            groupedByEvent[reservation.event_id].seats.push({
                row: reservation.row_letter,
                number: reservation.seat_number,
                zone: reservation.zone_name
            });

            const currentExpiry = new Date(groupedByEvent[reservation.event_id].expires_at);
            const thisExpiry = new Date(reservation.expires_at);
            if (thisExpiry < currentExpiry) {
                groupedByEvent[reservation.event_id].expires_at = reservation.expires_at;
            }
        });

        const groupedReservations = Object.values(groupedByEvent);

        res.json({
            success: true,
            reservations: groupedReservations
        });

    } catch (error) {
        console.error('Error getting user reservations:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving reservations'
        });
    }
};

/**
 * Retrieves all purchased tickets with seat assignments for a user.
 *
 * @param {Object} req - Express request object containing userId in params
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {500} If retrieval fails
 *
 * Side effects:
 * - Queries purchased ticket seats with event details
 * - Groups tickets by purchase
 * - Returns QR codes for each ticket
 */
exports.getUserTickets = async (req, res) => {
    try {
        const { userId } = req.params;

        const tickets = await TicketSeat.getByUserId(parseInt(userId));

        const groupedByPurchase = {};
        tickets.forEach(ticket => {
            if (!groupedByPurchase[ticket.purchase_id]) {
                groupedByPurchase[ticket.purchase_id] = {
                    purchase_id: ticket.purchase_id,
                    event_id: ticket.event_id,
                    event_title: ticket.event_title,
                    location: ticket.location,
                    city: ticket.city,
                    date: ticket.date,
                    time: ticket.time,
                    purchase_date: ticket.purchase_date,
                    seats: []
                };
            }

            groupedByPurchase[ticket.purchase_id].seats.push({
                row: ticket.row_letter,
                number: ticket.seat_number,
                zone: ticket.zone_name,
                ticket_id: ticket.ticket_id,
                qr_code: ticket.qr_code
            });
        });

        const groupedTickets = Object.values(groupedByPurchase);

        res.json({
            success: true,
            tickets: groupedTickets
        });

    } catch (error) {
        console.error('Error getting user tickets:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving tickets'
        });
    }
};

/**
 * Verifies a ticket by its unique ticket ID (typically scanned from QR code).
 *
 * @param {Object} req - Express request object containing ticketId in params
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {404} If ticket is not found
 * @throws {500} If verification fails
 *
 * Side effects:
 * - Queries ticket details including event information
 * - Returns ticket validity status
 * - Returns event and seat details if valid
 */
exports.verifyTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;

        const ticket = await TicketSeat.getByTicketId(ticketId);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found',
                valid: false
            });
        }

        res.json({
            success: true,
            valid: true,
            ticket: {
                ticket_id: ticket.ticket_id,
                event_title: ticket.event_title,
                location: ticket.location,
                city: ticket.city,
                date: ticket.date,
                time: ticket.time,
                seat: `${ticket.row_letter}${ticket.seat_number}`,
                zone: ticket.zone_name
            }
        });

    } catch (error) {
        console.error('Error verifying ticket:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying ticket'
        });
    }
};

exports.recommendSeats = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { count, maxBudget } = req.body;

        const seatCount = parseInt(count);
        const budget = maxBudget ? parseFloat(maxBudget) : null;

        if (!seatCount || seatCount < 1) {
            return res.status(400).json({ success: false, message: 'Invalid seat count' });
        }

        const eventLayout = await EventLayout.getByEventId(parseInt(eventId));
        if (!eventLayout) {
            return res.status(404).json({ success: false, message: 'No seat layout found' });
        }

        const zonePrices = {};
        eventLayout.zones.forEach(z => {
            zonePrices[z.zone_id] = { price: parseFloat(z.price) || 0, name: z.name, color: z.color };
        });

        const seatMap = await TicketSeat.getSeatMapStatus(parseInt(eventId));
        const reservations = await SeatReservation.getByEvent(parseInt(eventId));
        const unavailable = new Set(Object.keys(seatMap));
        reservations.forEach(r => unavailable.add(`${r.row_letter}-${r.seat_number}`));

        const sortedRows = [...eventLayout.rows].sort((a, b) => a.row_order - b.row_order);

        const accessibilitySeats = new Set();
        if (sortedRows.length > 0) {
            const firstRow = sortedRows[0];
            const half = Math.floor(firstRow.seats_in_row * 0.2 / 2);
            for (let i = 1; i <= half; i++) accessibilitySeats.add(`${firstRow.row_letter}-${i}`);
            for (let i = firstRow.seats_in_row - half + 1; i <= firstRow.seats_in_row; i++) accessibilitySeats.add(`${firstRow.row_letter}-${i}`);
        }

        for (const row of sortedRows) {
            const zone = zonePrices[row.zone_id] || { price: 0 };
            const totalCost = zone.price * seatCount;

            if (budget !== null && totalCost > budget) continue;

            const available = [];
            for (let n = 1; n <= row.seats_in_row; n++) {
                const key = `${row.row_letter}-${n}`;
                if (!unavailable.has(key) && !accessibilitySeats.has(key)) {
                    available.push(n);
                }
            }

            const candidates = [];
            for (let i = 0; i <= available.length - seatCount; i++) {
                const group = available.slice(i, i + seatCount);
                const isConsecutive = group.every((n, j) => j === 0 || n === group[j - 1] + 1);
                if (isConsecutive) candidates.push(group);
            }

            if (candidates.length === 0) continue;

            const rowCenter = (row.seats_in_row + 1) / 2;
            candidates.sort((a, b) => {
                const centerA = (a[0] + a[a.length - 1]) / 2;
                const centerB = (b[0] + b[b.length - 1]) / 2;
                return Math.abs(centerA - rowCenter) - Math.abs(centerB - rowCenter);
            });

            const best = candidates[0];
            return res.json({
                success: true,
                seats: best.map(num => ({
                    row: row.row_letter,
                    number: num,
                    zone_id: row.zone_id,
                    zone_name: zone.name,
                    price: zone.price
                })),
                totalPrice: totalCost
            });
        }

        res.json({ success: false, message: 'No suitable seats found for your criteria.' });

    } catch (error) {
        console.error('Error recommending seats:', error);
        res.status(500).json({ success: false, message: 'Error finding seat recommendations' });
    }
};
