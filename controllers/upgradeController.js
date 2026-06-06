const { UpgradeOffer, UPGRADE_PERCENTAGE } = require('../models/UpgradeOffer');
const pool = require('../config/database');
const { sendUpgradeEmail } = require('../services/emailService');

exports.getOffer = async (req, res) => {
    try {
        const { token } = req.params;
        const offer = await UpgradeOffer.getByToken(token);

        if (!offer) {
            return res.status(404).json({ success: false, message: 'Oferta nu a fost găsită.' });
        }

        if (offer.status === 'accepted') {
            return res.json({ success: true, offer, alreadyAccepted: true });
        }

        if (offer.status === 'expired' || new Date(offer.expires_at) < new Date()) {
            return res.json({ success: true, offer, expired: true });
        }

        return res.json({ success: true, offer });
    } catch (error) {
        console.error('❌ [upgradeController.getOffer]', error);
        res.status(500).json({ success: false, message: 'Eroare server.' });
    }
};

exports.acceptOffer = async (req, res) => {
    const client = await pool.connect();
    try {
        const { token } = req.params;

        await client.query('BEGIN');

        const offer = await UpgradeOffer.accept(token);
        if (!offer) {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, message: 'Oferta a expirat sau nu mai este disponibilă.' });
        }

        const seatCheck = await client.query(
            `SELECT COUNT(*) as count FROM ticket_seats
             WHERE event_id = $1 AND row_letter = $2 AND seat_number = $3`,
            [offer.event_id, offer.new_row, offer.new_seat]
        );
        if (parseInt(seatCheck.rows[0].count) > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({ success: false, message: 'Locul nu mai este disponibil.' });
        }

        await client.query(
            `UPDATE ticket_seats
             SET zone_id = $1, row_letter = $2, seat_number = $3
             WHERE purchase_id = $4 AND event_id = $5 AND zone_id = $6`,
            [offer.to_zone_id, offer.new_row, offer.new_seat, offer.purchase_id, offer.event_id, offer.from_zone_id]
        );

        await client.query('COMMIT');

        res.json({ success: true, message: 'Upgrade acceptat! Locul tău a fost actualizat.' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ [upgradeController.acceptOffer]', error);
        res.status(500).json({ success: false, message: 'Eroare server.' });
    } finally {
        client.release();
    }
};

exports.triggerForEvent = async (req, res) => {
    try {
        const eventId = parseInt(req.params.eventId);

        const eventResult = await pool.query('SELECT event_id, title FROM event WHERE event_id = $1', [eventId]);
        if (eventResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Eveniment negăsit.' });
        const event = eventResult.rows[0];

        const fromZoneResult = await pool.query(
            `SELECT sz.zone_id, sz.name FROM seat_zones sz
             JOIN event_layouts el ON el.layout_id = sz.layout_id
             WHERE el.event_id = $1 AND sz.name = 'Balcony'`,
            [eventId]
        );
        if (fromZoneResult.rows.length === 0) return res.status(400).json({ success: false, message: 'Nu există zonă Balcony.' });
        const fromZone = fromZoneResult.rows[0];

        const toZoneResult = await pool.query(
            `SELECT sz.zone_id, sz.name FROM seat_zones sz
             JOIN event_layouts el ON el.layout_id = sz.layout_id
             WHERE el.event_id = $1 AND sz.name = 'VIP'`,
            [eventId]
        );
        if (toZoneResult.rows.length === 0) return res.status(400).json({ success: false, message: 'Nu există zonă VIP.' });
        const toZone = toZoneResult.rows[0];

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
        if (totalBuyers === 0) return res.json({ success: false, message: 'Nu există cumpărători Balcony.' });

        const cap = Math.max(1, Math.floor(totalBuyers * UPGRADE_PERCENTAGE));
        const alreadyOffered = await UpgradeOffer.getOfferCount(eventId, fromZone.zone_id);
        const remainingSlots = cap - alreadyOffered;
        if (remainingSlots <= 0) return res.json({ success: false, message: 'Limita de oferte atinsă.' });

        const vipRowsResult = await pool.query(
            `SELECT row_letter, seats_in_row FROM layout_rows WHERE zone_id = $1 ORDER BY row_order ASC`,
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

        const availableVipSeats = [];
        for (const row of vipRowsResult.rows) {
            for (let seat = 1; seat <= row.seats_in_row; seat++) {
                if (!takenSeats.has(`${row.row_letter}-${seat}`)) {
                    availableVipSeats.push({ row: row.row_letter, seat });
                }
            }
        }

        let vipSeatIdx = 0;
        const sent = [];

        for (const buyer of buyersResult.rows) {
            if (sent.length >= remainingSlots || vipSeatIdx >= availableVipSeats.length) break;
            const alreadyHas = await UpgradeOffer.hasOffer(buyer.user_id, eventId);
            if (alreadyHas) continue;

            const vipSeat = availableVipSeats[vipSeatIdx++];
            const offer = await UpgradeOffer.createOffer(
                buyer.purchase_id, buyer.user_id, eventId,
                fromZone.zone_id, toZone.zone_id,
                vipSeat.row, vipSeat.seat
            );
            await sendUpgradeEmail({
                email: buyer.user_email,
                userName: buyer.user_name,
                eventTitle: event.title,
                fromZone: fromZone.name,
                toZone: toZone.name,
                newRow: vipSeat.row,
                newSeat: vipSeat.seat,
                token: offer.token,
                expiresAt: offer.expires_at
            });
            sent.push({ user: buyer.user_name, email: buyer.user_email, seat: `${vipSeat.row}${vipSeat.seat}`, token: offer.token });
        }

        res.json({ success: true, sent, totalBuyers, cap });
    } catch (error) {
        console.error('❌ [upgradeController.triggerForEvent]', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
