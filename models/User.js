const pool = require('../config/database');

/**
 * User model for managing user data and authentication
 * @class User
 */
class User {
    /**
     * Retrieves all users from the database
     * @returns {Promise<Array>} Array of user objects without passwords
     */
    static async getAll() {
        const result = await pool.query('SELECT user_id, name, email, role FROM "user" ORDER BY user_id');
        return result.rows;
    }

    /**
     * Retrieves a user by their ID
     * @param {number} userId - The unique identifier of the user
     * @returns {Promise<Object>} User object including password
     */
    static async getById(userId) {
        const result = await pool.query('SELECT * FROM "user" WHERE user_id = $1', [userId]);
        return result.rows[0];
    }

    /**
     * Retrieves a user by their email address
     * @param {string} email - The email address of the user
     * @returns {Promise<Object>} User object including password
     */
    static async getByEmail(email) {
        const result = await pool.query('SELECT * FROM "user" WHERE email = $1', [email]);
        return result.rows[0];
    }

    /**
     * Creates a new user in the database
     * @param {string} name - The name of the user
     * @param {string} email - The email address of the user
     * @param {string} password - The hashed password
     * @param {string} [role='client'] - The role of the user (admin or client)
     * @returns {Promise<Object>} Created user object without password
     */
    static async create(name, email, password, role = 'client') {
        const result = await pool.query(
            'INSERT INTO "user" (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING user_id, name, email, role',
            [name, email, password, role]
        );
        return result.rows[0];
    }

    /**
     * Updates a user's role
     * @param {number} userId - The unique identifier of the user
     * @param {string} role - The new role (admin or client)
     * @returns {Promise<Object>} Updated user object without password
     */
    static async updateRole(userId, role) {
        const result = await pool.query(
            'UPDATE "user" SET role = $1 WHERE user_id = $2 RETURNING user_id, name, email, role',
            [role, userId]
        );
        return result.rows[0];
    }

    /**
     * Updates user information (name and/or email)
     * @param {number} userId - The unique identifier of the user
     * @param {Object} updates - Object containing fields to update
     * @param {string} [updates.name] - New name
     * @param {string} [updates.email] - New email
     * @returns {Promise<Object>} Updated user object without password
     * @throws {Error} If no fields to update
     */
    static async update(userId, updates) {
        const { name, email } = updates;
        const fields = [];
        const values = [];
        let paramCount = 1;

        if (name !== undefined) {
            fields.push(`name = $${paramCount}`);
            values.push(name);
            paramCount++;
        }

        if (email !== undefined) {
            fields.push(`email = $${paramCount}`);
            values.push(email);
            paramCount++;
        }

        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        values.push(userId);

        const result = await pool.query(
            `UPDATE "user" SET ${fields.join(', ')} WHERE user_id = $${paramCount} RETURNING user_id, name, email, role`,
            values
        );
        return result.rows[0];
    }

    /**
     * Updates a user's password
     * @param {number} userId - The unique identifier of the user
     * @param {string} hashedPassword - The new hashed password
     * @returns {Promise<Object>} Object with user_id
     */
    static async updatePassword(userId, hashedPassword) {
        const result = await pool.query(
            'UPDATE "user" SET password = $1 WHERE user_id = $2 RETURNING user_id',
            [hashedPassword, userId]
        );
        return result.rows[0];
    }

    /**
     * Sets a password reset token for a user
     * @param {number} userId - The unique identifier of the user
     * @param {string} token - The reset token
     * @param {Date} expires - Token expiration date
     * @returns {Promise<Object>} Object with user_id
     */
    static async setResetToken(userId, token, expires) {
        const result = await pool.query(
            'UPDATE "user" SET reset_token = $1, reset_token_expires = $2 WHERE user_id = $3 RETURNING user_id',
            [token, expires, userId]
        );
        return result.rows[0];
    }

    /**
     * Retrieves a user by their reset token
     * @param {string} token - The reset token
     * @returns {Promise<Object>} User object including password and reset token data
     */
    static async getByResetToken(token) {
        const result = await pool.query(
            'SELECT * FROM "user" WHERE reset_token = $1',
            [token]
        );
        return result.rows[0];
    }

    /**
     * Resets a user's password and clears reset token
     * @param {number} userId - The unique identifier of the user
     * @param {string} hashedPassword - The new hashed password
     * @returns {Promise<Object>} Object with user_id
     */
    static async resetPassword(userId, hashedPassword) {
        const result = await pool.query(
            'UPDATE "user" SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE user_id = $2 RETURNING user_id',
            [hashedPassword, userId]
        );
        return result.rows[0];
    }
}

module.exports = User;
