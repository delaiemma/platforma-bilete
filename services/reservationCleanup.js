/**
 * @fileoverview Reservation cleanup service that automatically removes expired reservations and seat reservations.
 * This service runs a scheduled cron job every 2 minutes to clean up expired data and notify clients
 * via Socket.IO when seats become available again. Ensures inventory availability and prevents
 * stale reservations from blocking event capacity.
 */

const cron = require('node-cron');
const Reservation = require('../models/Reservation');
const Cart = require('../models/Cart');
const SeatReservation = require('../models/SeatReservation');
const Waitlist = require('../models/Waitlist');
const { UpgradeOffer, UPGRADE_PERCENTAGE } = require('../models/UpgradeOffer');
const pool = require('../config/database');
const { sendUpgradeEmail } = require('./emailService');

/**
 * Starts a scheduled cron job that cleans up expired reservations and seat reservations.
 * Runs every 2 minutes to check for and remove expired data, and emits real-time updates
 * to connected clients when seats are released.
 *
 * @param {import('socket.io').Server} io - Socket.IO server instance for broadcasting seat availability updates
 *
 * @description
 * The cleanup process performs the following operations:
 * 1. Finds all expired general reservations
 * 2. Deletes expired reservations from the database
 * 3. Removes corresponding items from user shopping carts
 * 4. Finds all expired seat reservations
 * 5. Deletes expired seat reservations from the database
 * 6. Groups expired seats by event ID
 * 7. Emits 'seats-released' Socket.IO events to all clients in the event room
 *
 * Side effects:
 * - Modifies database by deleting expired reservations and seat reservations
 * - Removes items from user shopping carts
 * - Emits Socket.IO events to connected clients
 * - Logs cleanup operations to console
 * - Runs continuously every 2 minutes after initialization
 */
function startReservationCleanup(io) {

    cron.schedule('*/2 * * * *', async () => {
        try {
            console.log('🧹 [CRON] Checking for expired reservations...');

            const expiredReservations = await Reservation.getExpired();

            const expiredWaitlist = await Waitlist.expireNotified();
            for (const entry of expiredWaitlist) {
                console.log(`⏰ [CRON] Waitlist notification expired: User ${entry.user_id}, Event ${entry.event_id}`);
                const notified = await Waitlist.notifyNext(entry.event_id);
                if (notified) {
                    console.log(`📧 [CRON] Waitlist email sent to next: User ${notified.user_id}, Event ${entry.event_id}`);
                }
            }

            if (expiredReservations.length === 0) {
                console.log('✅ [CRON] No expired reservations found');
                return;
            }

            console.log(`⏰ [CRON] Found ${expiredReservations.length} expired reservations`);

            await Reservation.deleteExpired();

            for (const reservation of expiredReservations) {
                await Cart.remove(reservation.user_id, reservation.event_id);
                console.log(`🗑️ [CRON] Removed expired reservation: User ${reservation.user_id}, Event ${reservation.event_id}`);
            }

            console.log(`✅ [CRON] Cleaned up ${expiredReservations.length} expired reservations`);

            const expiredSeats = await SeatReservation.getExpired();
            const expiredSeatCount = await SeatReservation.deleteExpired();

            if (expiredSeatCount > 0) {
                console.log(`🪑 [CRON] Cleaned up ${expiredSeatCount} expired seat reservation(s)`);

                if (io && expiredSeats.length > 0) {

                    const seatsByEvent = {};
                    for (const seat of expiredSeats) {
                        if (!seatsByEvent[seat.event_id]) {
                            seatsByEvent[seat.event_id] = [];
                        }
                        seatsByEvent[seat.event_id].push({
                            row: seat.row_letter,
                            number: seat.seat_number
                        });
                    }

                    for (const [eventId, seats] of Object.entries(seatsByEvent)) {
                        io.to(`event-${eventId}`).emit('seats-released', {
                            eventId: parseInt(eventId),
                            seats,
                            action: 'expire'
                        });
                        console.log(`📡 [CRON] Emitted seats-released for event ${eventId}: ${seats.length} expired seats`);

                        const notified = await Waitlist.notifyNext(parseInt(eventId));
                        if (notified) {
                            console.log(`🔔 [CRON] Waitlist email sent: User ${notified.user_id} for event ${eventId}`);
                        }
                    }
                }
            }

        } catch (error) {
            console.error('❌ [CRON] Error cleaning up reservations:', error);
        }
    });

    console.log('⏰ Reservation cleanup cron job started (runs every 2 minutes)');

    cron.schedule('*/5 * * * *', async () => {
        try {
            await UpgradeOffer.expireOld();
        } catch (error) {
            console.error('❌ [CRON] Error expiring upgrade offers:', error);
        }
    });

    cron.schedule('*/10 * * * *', async () => {
        try {
            const eventsResult = await pool.query(
                `SELECT event_id, title
                 FROM event
                 WHERE (date + time) BETWEEN NOW() + interval '1 hour 55 minutes'
                                               AND NOW() + interval '2 hours 5 minutes'`
            );

            if (eventsResult.rows.length === 0) return;

            for (const event of eventsResult.rows) {
                const eventId = event.event_id;

                const zonesResult = await pool.query(
                    `SELECT sz.zone_id, sz.name, sz.price
                     FROM seat_zones sz
                     JOIN event_layouts el ON el.layout_id = sz.layout_id
                     WHERE el.event_id = $1
                     ORDER BY sz.price ASC`,
                    [eventId]
                );

                const zones = zonesResult.rows;
                if (zones.length < 2) continue;

                for (let i = 0; i < zones.length - 1; i++) {
                    const fromZone = zones[i];
                    const toZone = zones[i + 1];

                    const buyersResult = await pool.query(
                        `SELECT DISTINCT p.purchase_id, p.user_id, p.purchase_date,
                                u.name as user_name, u.email as user_email
                         FROM ticket_seats ts
                         JOIN purchases p ON ts.purchase_id = p.purchase_id
                         JOIN "user" u ON p.user_id = u.user_id
                         WHERE ts.event_id = $1 AND ts.zone_id = $2 AND p.status != 'cancelled'
                         ORDER BY p.purchase_date ASC`,
                        [eventId, fromZone.zone_id]
                    );

                    const totalBuyers = buyersResult.rows.length;
                    if (totalBuyers === 0) continue;

                    const cap = Math.floor(totalBuyers * UPGRADE_PERCENTAGE);
                    const alreadyOffered = await UpgradeOffer.getOfferCount(eventId, fromZone.zone_id);
                    const remainingSlots = cap - alreadyOffered;
                    if (remainingSlots <= 0) continue;

                    const toZoneRowsResult = await pool.query(
                        `SELECT row_letter, seats_in_row
                         FROM layout_rows
                         WHERE zone_id = $1
                         ORDER BY row_order ASC`,
                        [toZone.zone_id]
                    );

                    const soldResult = await pool.query(
                        `SELECT row_letter, seat_number FROM ticket_seats WHERE event_id = $1 AND zone_id = $2`,
                        [eventId, toZone.zone_id]
                    );
                    const reservedResult = await pool.query(
                        `SELECT row_letter, seat_number FROM seat_reservations WHERE event_id = $1 AND expires_at > NOW()`,
                        [eventId]
                    );
                    const offeredResult = await pool.query(
                        `SELECT new_row, new_seat FROM upgrade_offers WHERE event_id = $1 AND status IN ('pending', 'accepted')`,
                        [eventId]
                    );

                    const takenSeats = new Set();
                    soldResult.rows.forEach(s => takenSeats.add(`${s.row_letter}-${s.seat_number}`));
                    reservedResult.rows.forEach(s => takenSeats.add(`${s.row_letter}-${s.seat_number}`));
                    offeredResult.rows.forEach(s => takenSeats.add(`${s.new_row}-${s.new_seat}`));

                    const availableSeats = [];
                    for (const row of toZoneRowsResult.rows) {
                        for (let seat = 1; seat <= row.seats_in_row; seat++) {
                            if (!takenSeats.has(`${row.row_letter}-${seat}`)) {
                                availableSeats.push({ row: row.row_letter, seat });
                            }
                        }
                    }

                    let seatIdx = 0;
                    let offersCreated = 0;

                    for (const buyer of buyersResult.rows) {
                        if (offersCreated >= remainingSlots) break;
                        if (seatIdx >= availableSeats.length) break;

                        const alreadyHas = await UpgradeOffer.hasOffer(buyer.user_id, eventId);
                        if (alreadyHas) continue;

                        const newSeat = availableSeats[seatIdx++];
                        const offer = await UpgradeOffer.createOffer(
                            buyer.purchase_id, buyer.user_id, eventId,
                            fromZone.zone_id, toZone.zone_id,
                            newSeat.row, newSeat.seat
                        );

                        await sendUpgradeEmail({
                            email: buyer.user_email,
                            userName: buyer.user_name,
                            eventTitle: event.title,
                            fromZone: fromZone.name,
                            toZone: toZone.name,
                            newRow: newSeat.row,
                            newSeat: newSeat.seat,
                            token: offer.token,
                            expiresAt: offer.expires_at
                        });

                        console.log(`🎟️ [CRON] Upgrade offer sent: User ${buyer.user_id} ${fromZone.name} → ${toZone.name} ${newSeat.row}${newSeat.seat} (Event ${eventId})`);
                        offersCreated++;
                    }

                    if (offersCreated > 0) {
                        console.log(`✅ [CRON] Sent ${offersCreated} upgrade offer(s) for event ${eventId} (${fromZone.name} → ${toZone.name})`);
                    }
                }
            }
        } catch (error) {
            console.error('❌ [CRON] Error processing upgrade offers:', error);
        }
    });

    console.log('⏰ Upgrade offer cron job started (runs every 10 minutes)');
}

module.exports = { startReservationCleanup };
