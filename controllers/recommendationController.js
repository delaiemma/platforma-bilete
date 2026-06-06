/**
 * @file Recommendation Controller
 * @description Provides personalized event recommendations based on user preferences
 * and popular events for non-authenticated users.
 */

const pool = require('../config/database');

/**
 * Retrieves event recommendations for a user or popular events for guests.
 *
 * @param {Object} req - Express request object with optional userId and limit in query params
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {500} If recommendation query fails
 *
 * Side effects:
 * - Returns personalized recommendations if userId is provided
 * - Returns popular events if no userId is provided
 * - Defaults to 3 recommendations if limit not specified
 */
exports.getRecommendations = async (req, res) => {
    try {
        const userId = req.query.userId ? parseInt(req.query.userId) : null;
        const limit = parseInt(req.query.limit) || 3;

        let recommendations;

        if (userId) {

            recommendations = await getPersonalizedRecommendations(userId, limit);
        } else {

            recommendations = await getPopularEvents(limit);
        }

        res.json({
            success: true,
            recommendations,
            personalized: !!userId
        });
    } catch (error) {
        console.error('Error getting recommendations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get recommendations'
        });
    }
};

/**
 * Generates personalized event recommendations based on user's favorites and purchase history.
 *
 * @param {number} userId - The ID of the user
 * @param {number} limit - Maximum number of recommendations to return
 * @returns {Promise<Array>} Array of recommended events
 *
 * Side effects:
 * - Analyzes user's event type and city preferences from favorites and purchases
 * - Scores events based on type match (3 points), city match (2 points), and upcoming date (1 point)
 * - Excludes events already in user's favorites or purchases
 * - Falls back to popular events if insufficient personalized recommendations
 */
async function getPersonalizedRecommendations(userId, limit) {
    const query = `
        WITH user_events AS (
            SELECT e.type, e.city
            FROM favorites f JOIN event e ON f.event_id = e.event_id WHERE f.user_id = $1
            UNION ALL
            SELECT e.type, e.city
            FROM purchases p JOIN event e ON p.event_id = e.event_id WHERE p.user_id = $1
        ),
        type_preferences AS (
            SELECT type, COUNT(*) as affinity FROM user_events GROUP BY type
        ),
        city_preferences AS (
            SELECT city, COUNT(*) as affinity FROM user_events GROUP BY city
        ),
        scored_events AS (
            SELECT
                e.*,
                (CASE WHEN tp.affinity IS NOT NULL THEN 3 ELSE 0 END) +
                (CASE WHEN cp.affinity IS NOT NULL THEN 2 ELSE 0 END) +
                (CASE WHEN e.date <= CURRENT_DATE + INTERVAL '30 days' THEN 1 ELSE 0 END)
                as recommendation_score
            FROM event e
            LEFT JOIN type_preferences tp ON e.type = tp.type
            LEFT JOIN city_preferences cp ON e.city = cp.city
            WHERE e.available_tickets > 0
              AND (e.date || ' ' || e.time)::timestamp >= NOW()
              AND e.event_id NOT IN (SELECT event_id FROM favorites WHERE user_id = $1)
              AND e.event_id NOT IN (SELECT event_id FROM purchases WHERE user_id = $1)
        )
        SELECT *
        FROM scored_events
        WHERE recommendation_score > 0
        ORDER BY recommendation_score DESC, date ASC
        LIMIT $2
    `;

    const result = await pool.query(query, [userId, limit]);

    if (result.rows.length < limit) {
        const remaining = limit - result.rows.length;
        const popularEvents = await getPopularEvents(remaining, result.rows.map(r => r.event_id), userId);
        return [...result.rows, ...popularEvents];
    }

    return result.rows;
}

/**
 * Retrieves popular events based on ticket sales.
 *
 * @param {number} limit - Maximum number of events to return
 * @param {Array<number>} excludeIds - Event IDs to exclude from results
 * @param {number|null} userId - Optional user ID to exclude their favorites and purchases
 * @returns {Promise<Array>} Array of popular events
 *
 * Side effects:
 * - Orders events by tickets sold (descending) and date (ascending)
 * - Filters out events with no available tickets
 * - Excludes past events
 * - Excludes specified event IDs
 * - Excludes user's favorites and purchases if userId provided
 */
async function getPopularEvents(limit, excludeIds = [], userId = null) {
    const params = [limit];
    let idx = 2;

    const excludeCondition = excludeIds.length > 0
        ? `AND event_id NOT IN (${excludeIds.map(() => `$${idx++}`).join(',')})`
        : '';
    if (excludeIds.length > 0) params.push(...excludeIds);

    let userExcludeCondition = '';
    if (userId) {
        const uid = parseInt(userId);
        userExcludeCondition = `AND event_id NOT IN (SELECT event_id FROM favorites WHERE user_id = $${idx++})
           AND event_id NOT IN (SELECT event_id FROM purchases WHERE user_id = $${idx++})`;
        params.push(uid, uid);
    }

    const query = `
        SELECT *
        FROM event
        WHERE available_tickets > 0
          AND (date || ' ' || time)::timestamp >= NOW()
          ${excludeCondition}
          ${userExcludeCondition}
        ORDER BY
            tickets_sold DESC,
            date ASC
        LIMIT $1
    `;

    const result = await pool.query(query, params);
    return result.rows;
}
