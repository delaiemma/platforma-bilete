/**
 * @file Statistics Controller
 * @description Provides various statistical data and analytics for events, sales, and revenue.
 */

const Purchase = require('../models/Purchase');
const Event = require('../models/Event');
const User = require('../models/User');
const pool = require('../config/database');

/**
 * Retrieves overview statistics including events, tickets, revenue, and users.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {500} If statistics retrieval fails
 *
 * Side effects:
 * - Aggregates total events count
 * - Calculates total tickets sold across all events
 * - Calculates total revenue from all purchases
 * - Counts total registered users
 */
exports.getOverview = async (req, res) => {
    try {
        const events = await Event.getAll();
        const totalTicketsSold = await Purchase.getTotalTicketsSold();
        const totalRevenue = await Purchase.getTotalRevenue();
        const users = await User.getAll();

        res.json({
            success: true,
            stats: {
                totalEvents: events.length,
                totalTicketsSold,
                totalRevenue,
                totalUsers: users.length
            }
        });
    } catch (error) {
        console.error('❌ Error getting overview stats:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Retrieves sales statistics grouped by event.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {500} If query fails
 *
 * Side effects:
 * - Returns top 10 events by ticket sales
 * - Includes event title and tickets sold count
 */
exports.getSalesByEvent = async (req, res) => {
    try {
        const rawEvents = await Purchase.getSalesByEvent(10);
        const events = rawEvents.map(e => ({
            title: e.title,
            tickets_sold: parseInt(e.tickets_sold)
        }));
        res.json({
            success: true,
            events
        });
    } catch (error) {
        console.error('❌ Error getting sales by event:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Retrieves revenue data over time for charting purposes.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {500} If query fails
 *
 * Side effects:
 * - Returns daily revenue for the last 30 days
 * - Aggregates revenue by purchase date
 */
exports.getRevenueOverTime = async (req, res) => {
    try {
        const rawData = await Purchase.getRevenueOverTime(30);
        const revenue = rawData.map(r => ({
            date: r.date,
            total: parseFloat(r.revenue)
        }));
        res.json({
            success: true,
            revenue
        });
    } catch (error) {
        console.error('❌ Error getting revenue over time:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Retrieves top events ranked by revenue.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {500} If query fails
 *
 * Side effects:
 * - Returns top 5 events by total revenue
 * - Includes event title and revenue amount
 */
exports.getTopEvents = async (req, res) => {
    try {
        const rawEvents = await Purchase.getTopEventsByRevenue(5);
        const events = rawEvents.map(e => ({
            title: e.title,
            revenue: parseFloat(e.revenue)
        }));
        res.json({
            success: true,
            events
        });
    } catch (error) {
        console.error('❌ Error getting top events:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Retrieves event type distribution statistics.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {500} If query fails
 *
 * Side effects:
 * - Groups events by type
 * - Returns count of events for each type
 * - Ordered by count descending
 */
exports.getEventTypes = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT type, COUNT(*) as count
            FROM event
            GROUP BY type
            ORDER BY count DESC
        `);
        const types = result.rows.map(t => ({
            type: t.type,
            count: parseInt(t.count)
        }));
        res.json({
            success: true,
            types
        });
    } catch (error) {
        console.error('❌ Error getting event types:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Retrieves the most recent purchases across the platform.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {500} If query fails
 *
 * Side effects:
 * - Returns the 20 most recent purchases
 * - Includes purchase details, user info, and event info
 * - Ordered by purchase date descending
 */
exports.getRecentPurchases = async (req, res) => {
    try {
        const purchases = await Purchase.getRecent(20);
        res.json({
            success: true,
            purchases
        });
    } catch (error) {
        console.error('❌ Error getting recent purchases:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
