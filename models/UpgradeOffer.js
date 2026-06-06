const pool = require('../config/database');
const crypto = require('crypto');

const UPGRADE_MAP = {
  'Balcony': 'VIP',
  'Balcon I': 'Lojă',
  'Balcon II': 'Balcon I',
};

const UPGRADE_PERCENTAGE = 0.30;

class UpgradeOffer {
    static getUpgradeTarget(zoneName) {
        return UPGRADE_MAP[zoneName] || null;
    }

    static async createOffer(purchaseId, userId, eventId, fromZoneId, toZoneId, newRow, newSeat) {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

        const result = await pool.query(
            `INSERT INTO upgrade_offers
             (purchase_id, user_id, event_id, from_zone_id, to_zone_id, new_row, new_seat, token, status, expires_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9)
             RETURNING *`,
            [purchaseId, userId, eventId, fromZoneId, toZoneId, newRow, newSeat, token, expiresAt]
        );
        return result.rows[0];
    }

    static async getByToken(token) {
        const result = await pool.query(
            `SELECT uo.*,
                    fz.name as from_zone_name, tz.name as to_zone_name,
                    e.title as event_title, e.date as event_date, e.time as event_time,
                    u.name as user_name, u.email as user_email
             FROM upgrade_offers uo
             JOIN seat_zones fz ON fz.zone_id = uo.from_zone_id
             JOIN seat_zones tz ON tz.zone_id = uo.to_zone_id
             JOIN event e ON e.event_id = uo.event_id
             JOIN "user" u ON u.user_id = uo.user_id
             WHERE uo.token = $1`,
            [token]
        );
        return result.rows[0] || null;
    }

    static async accept(token) {
        const result = await pool.query(
            `UPDATE upgrade_offers SET status = 'accepted'
             WHERE token = $1 AND status = 'pending' AND expires_at > NOW()
             RETURNING *`,
            [token]
        );
        return result.rows[0] || null;
    }

    static async expireOld() {
        await pool.query(
            `UPDATE upgrade_offers SET status = 'expired'
             WHERE status = 'pending' AND expires_at < NOW()`
        );
    }

    static async hasOffer(userId, eventId) {
        const result = await pool.query(
            `SELECT offer_id FROM upgrade_offers
             WHERE user_id = $1 AND event_id = $2 AND status IN ('pending', 'accepted')`,
            [userId, eventId]
        );
        return result.rows.length > 0;
    }

    static async getOfferCount(eventId, fromZoneId) {
        const result = await pool.query(
            `SELECT COUNT(*) as count FROM upgrade_offers
             WHERE event_id = $1 AND from_zone_id = $2`,
            [eventId, fromZoneId]
        );
        return parseInt(result.rows[0].count);
    }
}

module.exports = { UpgradeOffer, UPGRADE_MAP, UPGRADE_PERCENTAGE };
