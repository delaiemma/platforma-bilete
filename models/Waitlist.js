const pool = require('../config/database');
const { sendWaitlistEmail } = require('../services/emailService');

class Waitlist {
    static async join(eventId, userId) {
        const result = await pool.query(
            `INSERT INTO waitlist (event_id, user_id, status)
             VALUES ($1, $2, 'waiting')
             ON CONFLICT (event_id, user_id) DO NOTHING
             RETURNING *`,
            [eventId, userId]
        );
        return result.rows[0] || null;
    }

    static async leave(eventId, userId) {
        const result = await pool.query(
            `DELETE FROM waitlist WHERE event_id = $1 AND user_id = $2 RETURNING *`,
            [eventId, userId]
        );
        return result.rows.length > 0;
    }

    static async getPosition(eventId, userId) {
        const result = await pool.query(
            `SELECT waitlist_id, status, notified_at, expires_at,
                    (SELECT COUNT(*) FROM waitlist
                     WHERE event_id = $1 AND status = 'waiting'
                     AND created_at <= w.created_at) as position
             FROM waitlist w
             WHERE event_id = $1 AND user_id = $2`,
            [eventId, userId]
        );
        return result.rows[0] || null;
    }

    static async getQueueLength(eventId) {
        const result = await pool.query(
            `SELECT COUNT(*) as count FROM waitlist
             WHERE event_id = $1 AND status = 'waiting'`,
            [eventId]
        );
        return parseInt(result.rows[0].count);
    }

    static async getNextInQueue(eventId) {
        const result = await pool.query(
            `SELECT w.*, u.name, u.email
             FROM waitlist w
             JOIN "user" u ON u.user_id = w.user_id
             WHERE w.event_id = $1 AND w.status = 'waiting'
             ORDER BY w.created_at ASC
             LIMIT 1`,
            [eventId]
        );
        return result.rows[0] || null;
    }

    static async notifyNext(eventId) {
        const next = await this.getNextInQueue(eventId);
        if (!next) return null;

        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await pool.query(
            `UPDATE waitlist SET status = 'notified', notified_at = NOW(), expires_at = $1
             WHERE waitlist_id = $2`,
            [expiresAt, next.waitlist_id]
        );

        const eventResult = await pool.query(
            `SELECT title FROM event WHERE event_id = $1`, [eventId]
        );
        const eventTitle = eventResult.rows[0]?.title || 'eveniment';

        try {
            await sendWaitlistEmail({
                email: next.email,
                userName: next.name,
                eventTitle,
                eventId,
                expiresAt
            });
        } catch (err) {
            console.error('❌ Failed to send waitlist email:', err);
        }

        return { ...next, expires_at: expiresAt };
    }

    static async expireNotified() {
        const result = await pool.query(
            `DELETE FROM waitlist
             WHERE status = 'notified' AND expires_at < NOW()
             RETURNING event_id, user_id`
        );
        return result.rows;
    }

    static async markPurchased(eventId, userId) {
        await pool.query(
            `DELETE FROM waitlist WHERE event_id = $1 AND user_id = $2`,
            [eventId, userId]
        );
    }
}

module.exports = Waitlist;
