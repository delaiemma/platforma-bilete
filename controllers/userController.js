/**
 * @file User Controller
 * @description Handles user authentication, profile management, and password operations.
 */

const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { JWT_SECRET } = require('../middleware/auth');
const { sendPasswordResetEmail, sendRegistrationConfirmationEmail } = require('../services/emailService');

const SALT_ROUNDS = 10;

/**
 * Registers a new user account.
 *
 * @param {Object} req - Express request object containing name, email, password, and optional role in body
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {400} If required fields are missing or email already exists
 * @throws {500} If registration fails
 *
 * Side effects:
 * - Validates required fields (name, email, password)
 * - Checks for existing email address
 * - Hashes password with bcrypt (10 rounds)
 * - Creates user record in database
 * - Sends registration confirmation email
 * - Generates JWT token valid for 7 days
 */
exports.signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email and password are required'
            });
        }

        const existingUser = await User.getByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const user = await User.create(name, email, hashedPassword, role);
        console.log('✅ User created:', user.email);

        sendRegistrationConfirmationEmail(user.email, user.name).catch(err => {
            console.error('Failed to send registration confirmation email:', err);
        });

        const io = req.app.get('io');
        if (io) {
            io.emit('user-registered', {
                userId: user.user_id,
                action: 'registered'
            });
            console.log(`📡 Emitted user-registered for user ${user.user_id}`);
        }

        const token = jwt.sign(
            { id: user.user_id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Registration successful',
            token,
            user: {
                id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('❌ Error during signup:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Authenticates a user and generates a JWT token.
 *
 * @param {Object} req - Express request object containing email and password in body
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {400} If required fields are missing
 * @throws {401} If email or password is invalid
 * @throws {500} If login fails
 *
 * Side effects:
 * - Validates email and password
 * - Compares password with hashed password using bcrypt
 * - Generates JWT token valid for 7 days
 * - Returns user details (excluding password)
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const user = await User.getByEmail(email);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        console.log(`✅ User logged in: ${user.email}`);

        const token = jwt.sign(
            { id: user.user_id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('❌ Error during login:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Retrieves the total count of registered users.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {500} If query fails
 *
 * Side effects:
 * - Queries all users from database
 * - Returns count of users
 */
exports.getUserCount = async (req, res) => {
    try {
        const users = await User.getAll();
        res.json({ count: users.length });
    } catch (error) {
        console.error('❌ Error getting user count:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Retrieves the profile information for the authenticated user.
 *
 * @param {Object} req - Express request object with authenticated user
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {404} If user is not found
 * @throws {500} If query fails
 *
 * Side effects:
 * - Queries user details by ID from JWT token
 * - Returns user profile (excluding password)
 */
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.getById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('❌ Error getting profile:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Updates the profile information for the authenticated user.
 *
 * @param {Object} req - Express request object with authenticated user and name, email in body
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {400} If no fields provided or email already in use
 * @throws {500} If update fails
 *
 * Side effects:
 * - Validates at least one field is provided (name or email)
 * - Checks email uniqueness if email is being changed
 * - Updates user record in database
 * - Returns updated user profile
 */
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, email } = req.body;

        if (!name && !email) {
            return res.status(400).json({
                success: false,
                message: 'Name or email is required'
            });
        }

        if (email) {
            const existingUser = await User.getByEmail(email);
            if (existingUser && existingUser.user_id !== userId) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already in use'
                });
            }
        }

        const updatedUser = await User.update(userId, { name, email });

        console.log(`✅ Profile updated for user: ${updatedUser.email}`);

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: updatedUser.user_id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role
            }
        });
    } catch (error) {
        console.error('❌ Error updating profile:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Updates the password for the authenticated user.
 *
 * @param {Object} req - Express request object with authenticated user and currentPassword, newPassword in body
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {400} If required fields are missing or new password is too short
 * @throws {401} If current password is incorrect
 * @throws {404} If user is not found
 * @throws {500} If update fails
 *
 * Side effects:
 * - Validates current password with bcrypt
 * - Validates new password length (minimum 6 characters)
 * - Hashes new password with bcrypt (10 rounds)
 * - Updates password in database
 */
exports.updatePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters'
            });
        }

        const user = await User.getById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

        await User.updatePassword(userId, hashedPassword);

        console.log(`✅ Password updated for user: ${user.email}`);

        res.json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error('❌ Error updating password:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Initiates password reset process by sending reset link to user's email.
 *
 * @param {Object} req - Express request object containing email in body
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {400} If email is missing
 * @throws {500} If operation fails
 *
 * Side effects:
 * - Generates cryptographically secure random reset token
 * - Stores reset token with 1-hour expiration in database
 * - Sends password reset email with reset link
 * - Returns generic success message (security: doesn't reveal if email exists)
 */
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const user = await User.getByEmail(email);

        if (!user) {
            return res.json({
                success: true,
                message: 'If that email exists, a password reset link has been sent'
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);

        await User.setResetToken(user.user_id, resetToken, resetTokenExpires);

        const resetLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
        await sendPasswordResetEmail(user.email, user.name, resetLink);

        console.log(`✅ Password reset email sent to: ${user.email}`);

        res.json({
            success: true,
            message: 'If that email exists, a password reset link has been sent'
        });
    } catch (error) {
        console.error('❌ Error in forgot password:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Resets user password using a valid reset token.
 *
 * @param {Object} req - Express request object containing token and newPassword in body
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {400} If required fields are missing, token is invalid/expired, or password is too short
 * @throws {500} If reset fails
 *
 * Side effects:
 * - Validates reset token and expiration time
 * - Validates new password length (minimum 6 characters)
 * - Hashes new password with bcrypt (10 rounds)
 * - Updates password in database
 * - Clears reset token after successful reset
 */
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Token and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        const user = await User.getByResetToken(token);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        if (new Date() > new Date(user.reset_token_expires)) {
            return res.status(400).json({
                success: false,
                message: 'Reset token has expired'
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

        await User.resetPassword(user.user_id, hashedPassword);

        console.log(`✅ Password reset successful for: ${user.email}`);

        res.json({
            success: true,
            message: 'Password has been reset successfully'
        });
    } catch (error) {
        console.error('❌ Error in reset password:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
