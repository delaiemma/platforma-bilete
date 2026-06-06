/**
 * @file Event Controller
 * @description Handles all event-related operations including CRUD operations,
 * search functionality, layout assignment, and ticket availability management.
 */

const Event = require('../models/Event');
const EventLayout = require('../models/EventLayout');
const pool = require('../config/database');

/**
 * Searches events based on multiple filter criteria.
 *
 * @param {express.Request} req - Express request object with query parameters (q, types, cities, minPrice, maxPrice, dateFrom, dateTo, sort, order)
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {500} If search operation fails
 *
 * Side effects:
 * - Queries events from database with multiple filters
 * - Parses comma-separated filter values
 */
exports.searchEvents = async (req, res) => {
    try {
        const { q, types, cities, minPrice, maxPrice, dateFrom, dateTo, sort, order } = req.query;
        const events = await Event.search({
            q: q || '',
            types: types ? types.split(',').filter(Boolean) : [],
            cities: cities ? cities.split(',').filter(Boolean) : [],
            minPrice: minPrice !== undefined ? parseFloat(minPrice) : null,
            maxPrice: maxPrice !== undefined ? parseFloat(maxPrice) : null,
            dateFrom: dateFrom || null,
            dateTo: dateTo || null,
            sort: sort || 'date',
            order: order || 'asc'
        });
        res.json(events);
    } catch (error) {
        console.error('❌ Error searching events:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Retrieves a list of distinct cities where events are held.
 *
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {500} If database query fails
 *
 * Side effects:
 * - Queries unique city values from events table
 */
exports.getDistinctCities = async (req, res) => {
    try {
        const cities = await Event.getDistinctCities();
        res.json(cities);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Retrieves all events from the database.
 *
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {500} If database query fails
 *
 * Side effects:
 * - Queries all events from database
 */
exports.getAllEvents = async (req, res) => {
    try {
        const events = await Event.getAll();
        res.json(events);
    } catch (error) {
        console.error('❌ Error getting events:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Retrieves all upcoming events (events scheduled in the future).
 *
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {500} If database query fails
 *
 * Side effects:
 * - Queries events with future dates from database
 */
exports.getUpcomingEvents = async (req, res) => {
    try {
        const events = await Event.getUpcomingEvents();
        res.json(events);
    } catch (error) {
        console.error('❌ Error getting upcoming events:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Retrieves all past events (events that have already occurred).
 *
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {500} If database query fails
 *
 * Side effects:
 * - Queries events with past dates from database
 */
exports.getPastEvents = async (req, res) => {
    try {
        const events = await Event.getPastEvents();
        res.json(events);
    } catch (error) {
        console.error('❌ Error getting past events:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Retrieves a specific event by its ID.
 *
 * @param {express.Request} req - Express request object containing id in params
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {404} If event is not found
 * @throws {500} If database query fails
 *
 * Side effects:
 * - Queries event details from database
 */
exports.getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.getById(id);

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        res.json(event);
    } catch (error) {
        console.error('❌ Error getting event:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Creates a new event with the provided details.
 *
 * @param {express.Request} req - Express request object containing event data in body and optional file upload
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {500} If event creation fails
 *
 * Side effects:
 * - Inserts new event into database
 * - Processes uploaded image file
 * - Sets default values for optional fields
 */
exports.createEvent = async (req, res) => {
    try {
        const eventData = {
            title: req.body.title,
            description: req.body.description || '',
            venue: req.body.location,
            date: req.body.date,
            time: req.body.time,
            price: req.body.price,
            tickets: req.body.available_tickets,
            type: req.body.type || 'General',
            city: req.body.city,
            organizer: req.body.organizer || '',
            imagePath: req.file ? req.file.filename : 'default.jpg',
            userId: req.body.user_id
        };

        const event = await Event.create(eventData);
        console.log('✅ Event created:', event.title);

        const io = req.app.get('io');
        if (io) {
            io.emit('event-created', {
                event: event,
                action: 'created'
            });
            console.log(`📡 Emitted event-created for event ${event.event_id}`);
        }

        res.json({ success: true, event });
    } catch (error) {
        console.error('❌ Error creating event:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Updates an existing event with new details.
 *
 * @param {express.Request} req - Express request object containing id in params and update data in body
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {400} If ticket reduction would go below reserved count
 * @throws {404} If event is not found
 * @throws {500} If update operation fails
 *
 * Side effects:
 * - Updates event in database
 * - Validates ticket availability against reservations
 * - Regenerates seating layout if ticket count changes and no seats are sold
 * - Processes uploaded image file if provided
 */
exports.updateEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const currentEvent = await Event.getById(id);
        if (!currentEvent) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        let newAvailableTickets;
        if (req.body.available_tickets !== undefined && req.body.available_tickets !== '') {
            newAvailableTickets = parseInt(req.body.available_tickets);
            if (isNaN(newAvailableTickets)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid available_tickets value'
                });
            }
        } else {
            newAvailableTickets = currentEvent.available_tickets;
        }
        const reservedTickets = currentEvent.reserved_tickets || 0;

        if (req.body.available_tickets && newAvailableTickets < reservedTickets) {
            return res.status(400).json({
                success: false,
                message: `Cannot reduce tickets below ${reservedTickets}. ${reservedTickets} tickets reserved in carts.`,
                errors: {
                    available_tickets: `Minimum ${reservedTickets} tickets required (currently in carts)`
                }
            });
        }

        console.log('📸 Image file received:', req.file ? req.file.filename : 'NO FILE');
        const eventData = {
            title: req.body.title,
            description: req.body.description || '',
            venue: req.body.location,
            date: req.body.date,
            time: req.body.time,
            price: req.body.price,
            tickets: newAvailableTickets,
            type: req.body.type || 'General',
            city: req.body.city,
            organizer: req.body.organizer || '',
            imagePath: req.file ? req.file.filename : undefined,
            hasSeating: req.body.has_seating === 'true' || req.body.has_seating === true
        };

        const event = await Event.update(id, eventData);

        if (event.has_seating && currentEvent.available_tickets !== newAvailableTickets) {
            const layoutResult = await pool.query(
                'SELECT el.layout_id, vl.name FROM event_layouts el JOIN venue_layouts vl ON el.layout_id = vl.layout_id WHERE el.event_id = $1',
                [id]
            );

            if (layoutResult.rows.length > 0) {
                const layoutId = layoutResult.rows[0].layout_id;
                const layoutName = layoutResult.rows[0].name;

                const predefinedVenues = ['Opera Națională București', 'Teatrul Nottara București', 'Filarmonica Brașov'];
                const isPredefinedVenue = predefinedVenues.includes(layoutName);

                if (isPredefinedVenue) {
                    console.log(`⚠️  Cannot change seat count for predefined venue "${layoutName}" - it has a fixed capacity`);
                    await pool.query('UPDATE event SET available_tickets = $1 WHERE event_id = $2',
                        [(await pool.query('SELECT SUM(seats_in_row) FROM layout_rows WHERE layout_id = $1', [layoutId])).rows[0].sum, id]);
                } else {
                    const soldSeatsCheck = await pool.query(
                        `SELECT COUNT(*) FROM ticket_seats ts
                         JOIN purchases p ON ts.purchase_id = p.purchase_id
                         WHERE p.event_id = $1 AND p.status != 'cancelled'`,
                        [id]
                    );

                    if (parseInt(soldSeatsCheck.rows[0].count) === 0) {

                        console.log(`🔄 Regenerating seating layout for event ${id} (${currentEvent.available_tickets} → ${newAvailableTickets} seats)`);

                        await pool.query('DELETE FROM layout_rows WHERE layout_id = $1', [layoutId]);

                        let zoneResult = await pool.query(
                            'SELECT zone_id FROM seat_zones WHERE layout_id = $1 LIMIT 1',
                            [layoutId]
                        );

                        let zoneId;
                        if (zoneResult.rows.length === 0) {

                            const newZone = await pool.query(
                                `INSERT INTO seat_zones (layout_id, name, color, display_order)
                                 VALUES ($1, 'General Admission', '#4CAF50', 1) RETURNING zone_id`,
                                [layoutId]
                            );
                            zoneId = newZone.rows[0].zone_id;
                        } else {
                            zoneId = zoneResult.rows[0].zone_id;
                        }

                        const MAX_SEATS_PER_ROW = 20;
                        const totalRows = Math.ceil(newAvailableTickets / MAX_SEATS_PER_ROW);
                        let remainingSeats = newAvailableTickets;

                        const getRowLetter = (i) => {
                            if (i < 26) return String.fromCharCode(65 + i);
                            const first = String.fromCharCode(65 + Math.floor((i - 26) / 26));
                            const second = String.fromCharCode(65 + ((i - 26) % 26));
                            return first + second;
                        };

                        for (let i = 0; i < totalRows; i++) {
                            const seatsInRow = Math.min(remainingSeats, MAX_SEATS_PER_ROW);
                            const rowLetter = getRowLetter(i);

                            await pool.query(
                                `INSERT INTO layout_rows (layout_id, zone_id, row_letter, seats_in_row, row_order)
                                 VALUES ($1, $2, $3, $4, $5)`,
                                [layoutId, zoneId, rowLetter, seatsInRow, i + 1]
                            );

                            remainingSeats -= seatsInRow;
                        }

                        console.log(`✅ Layout regenerated: ${totalRows} rows, ${newAvailableTickets} total seats`);
                    } else {
                        console.warn(`⚠️  Cannot auto-regenerate layout - ${soldSeatsCheck.rows[0].count} tickets already sold with specific seats`);
                    }
                }
            }
        }

        console.log('✅ Event updated:', event.title);

        const io = req.app.get('io');
        if (io) {
            io.emit('event-updated', {
                event: event,
                action: 'updated'
            });
            io.to(`event-${id}`).emit('tickets-updated', {
                eventId: parseInt(id),
                action: 'event-updated'
            });
            console.log(`📡 Emitted event-updated for event ${event.event_id}`);
        }

        res.json({ success: true, event });
    } catch (error) {
        console.error('❌ Error updating event:', error);
        res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

/**
 * Deletes an event from the database.
 *
 * @param {express.Request} req - Express request object containing id in params
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {400} If event has purchased tickets
 * @throws {500} If deletion fails
 *
 * Side effects:
 * - Removes event from database
 * - Checks for existing purchases before deletion
 */
exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const purchaseCheck = await pool.query(
            `SELECT COUNT(*) FROM purchases WHERE event_id = $1 AND status != 'cancelled'`,
            [id]
        );

        if (parseInt(purchaseCheck.rows[0].count) > 0) {
            return res.status(400).json({
                success: false,
                message: 'Nu poți șterge un eveniment care are bilete cumpărate.'
            });
        }

        await Event.delete(id);
        console.log('✅ Event deleted:', id);

        const io = req.app.get('io');
        if (io) {
            io.emit('event-deleted', {
                eventId: parseInt(id),
                action: 'deleted'
            });
            console.log(`📡 Emitted event-deleted for event ${id}`);
        }

        res.json({ success: true, message: 'Event deleted successfully' });
    } catch (error) {
        console.error('❌ Error deleting event:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Assigns a seating layout to an event with zone-specific pricing.
 *
 * @param {express.Request} req - Express request object containing id in params and layoutId, zonePricing in body
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {400} If required fields are missing or assignment fails
 *
 * Side effects:
 * - Links layout to event in database
 * - Creates zone pricing records
 */
exports.assignLayout = async (req, res) => {
    try {
        const { id } = req.params;
        const { layoutId, zonePricing } = req.body;

        if (!layoutId || !zonePricing || !Array.isArray(zonePricing)) {
            return res.status(400).json({
                success: false,
                message: 'layoutId and zonePricing array are required'
            });
        }

        const result = await EventLayout.assignLayoutToEvent(parseInt(id), parseInt(layoutId), zonePricing);

        res.status(201).json({
            success: true,
            message: 'Layout assigned to event',
            eventLayout: result
        });
    } catch (error) {
        console.error('❌ Error assigning layout:', error);
        res.status(400).json({ success: false, message: error.message || 'Error assigning layout' });
    }
};

/**
 * Removes the seating layout assignment from an event.
 *
 * @param {express.Request} req - Express request object containing id in params
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {400} If removal fails
 *
 * Side effects:
 * - Deletes layout-event association from database
 */
exports.removeLayout = async (req, res) => {
    try {
        const { id } = req.params;
        await EventLayout.removeLayout(parseInt(id));

        res.json({ success: true, message: 'Layout removed from event' });
    } catch (error) {
        console.error('❌ Error removing layout:', error);
        res.status(400).json({ success: false, message: error.message || 'Error removing layout' });
    }
};

/**
 * Updates the pricing for zones in an event's seating layout.
 *
 * @param {express.Request} req - Express request object containing id in params and zonePricing array in body
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {400} If zonePricing array is missing or update fails
 *
 * Side effects:
 * - Updates zone pricing records in database
 */
exports.updateLayoutPricing = async (req, res) => {
    try {
        const { id } = req.params;
        const { zonePricing } = req.body;

        if (!zonePricing || !Array.isArray(zonePricing)) {
            return res.status(400).json({
                success: false,
                message: 'zonePricing array is required'
            });
        }

        await EventLayout.updatePricing(parseInt(id), zonePricing);

        res.json({ success: true, message: 'Pricing updated' });
    } catch (error) {
        console.error('❌ Error updating pricing:', error);
        res.status(400).json({ success: false, message: error.message || 'Error updating pricing' });
    }
};

/**
 * Retrieves the seating layout assigned to a specific event.
 *
 * @param {express.Request} req - Express request object containing id in params
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {404} If no layout is assigned to the event
 * @throws {500} If retrieval fails
 *
 * Side effects:
 * - Queries layout details with zones and rows from database
 */
exports.getEventLayout = async (req, res) => {
    try {
        const { id } = req.params;
        const layout = await EventLayout.getByEventId(parseInt(id));

        if (!layout) {
            return res.status(404).json({ success: false, message: 'No layout assigned to this event' });
        }

        res.json({ success: true, layout });
    } catch (error) {
        console.error('❌ Error getting event layout:', error);
        res.status(500).json({ success: false, message: 'Error retrieving layout' });
    }
};
