const Waitlist = require('../models/Waitlist');
const pool = require('../config/database');

exports.join = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ success: false, message: 'Autentificare necesară' });

        const eventResult = await pool.query(
            `SELECT available_tickets, title FROM event WHERE event_id = $1`, [eventId]
        );
        if (!eventResult.rows[0]) return res.status(404).json({ success: false, message: 'Eveniment negăsit' });
        if (eventResult.rows[0].available_tickets > 0) {
            return res.status(400).json({ success: false, message: 'Evenimentul mai are locuri disponibile' });
        }

        const entry = await Waitlist.join(parseInt(eventId), userId);
        if (!entry) {
            return res.status(400).json({ success: false, message: 'Ești deja pe lista de așteptare' });
        }

        const position = await Waitlist.getPosition(parseInt(eventId), userId);
        res.status(201).json({ success: true, message: 'Ai fost adăugat pe lista de așteptare', position: parseInt(position.position) });
    } catch (error) {
        console.error('Error joining waitlist:', error);
        res.status(500).json({ success: false, message: 'Eroare server' });
    }
};

exports.leave = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ success: false, message: 'Autentificare necesară' });

        await Waitlist.leave(parseInt(eventId), userId);
        res.json({ success: true, message: 'Ai fost eliminat din lista de așteptare' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Eroare server' });
    }
};

exports.getStatus = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user?.id;

        if (!userId) return res.json({ success: true, inWaitlist: false });

        const entry = await Waitlist.getPosition(parseInt(eventId), userId);
        const queueLength = await Waitlist.getQueueLength(parseInt(eventId));

        const activeStatuses = ['waiting', 'notified'];
        const inWaitlist = !!entry && activeStatuses.includes(entry.status);

        res.json({
            success: true,
            inWaitlist,
            status: entry?.status || null,
            position: entry ? parseInt(entry.position) : null,
            expiresAt: entry?.expires_at || null,
            queueLength
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Eroare server' });
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ success: false, message: 'Autentificare necesară' });

        const result = await pool.query(
            `SELECT n.*, e.title as event_title
             FROM notifications n
             LEFT JOIN event e ON e.event_id = n.event_id
             WHERE n.user_id = $1
             ORDER BY n.created_at DESC
             LIMIT 20`,
            [userId]
        );
        res.json({ success: true, notifications: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Eroare server' });
    }
};

exports.markRead = async (req, res) => {
    try {
        const userId = req.user?.id;
        await pool.query(
            `UPDATE notifications SET is_read = TRUE WHERE user_id = $1`, [userId]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Eroare server' });
    }
};
