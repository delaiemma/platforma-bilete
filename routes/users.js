/**
 * @fileoverview User routes for authentication and profile management
 * Handles user registration, login, profile operations, and password management
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validators');
const { authenticate } = require('../middleware/auth');

/**
 * Register new user
 * @route POST /api/users/signup
 * @access Public
 * @returns {Object} 201 - User created successfully
 * @returns {Object} 400 - Invalid registration data
 */
router.post('/signup', validateUserRegistration, userController.signup);

/**
 * User login
 * @route POST /api/users/login
 * @access Public
 * @returns {Object} 200 - Login successful with token
 * @returns {Object} 401 - Invalid credentials
 */
router.post('/login', validateUserLogin, userController.login);

/**
 * Get total user count
 * @route GET /api/users/count
 * @access Public
 * @returns {Object} 200 - Total number of users
 */
router.get('/count', userController.getUserCount);

/**
 * Get user profile
 * @route GET /api/users/profile
 * @access Private
 * @returns {Object} 200 - User profile data
 * @returns {Object} 404 - User not found
 */
router.get('/profile', authenticate, userController.getProfile);

/**
 * Update user profile
 * @route PUT /api/users/profile
 * @access Private
 * @returns {Object} 200 - Profile updated successfully
 * @returns {Object} 400 - Invalid profile data
 */
router.put('/profile', authenticate, userController.updateProfile);

/**
 * Update user password
 * @route PUT /api/users/password
 * @access Private
 * @returns {Object} 200 - Password updated successfully
 * @returns {Object} 400 - Invalid password data
 */
router.put('/password', authenticate, userController.updatePassword);

/**
 * Request password reset
 * @route POST /api/users/forgot-password
 * @access Public
 * @returns {Object} 200 - Password reset email sent
 * @returns {Object} 404 - User not found
 */
router.post('/forgot-password', userController.forgotPassword);

/**
 * Reset password with token
 * @route POST /api/users/reset-password
 * @access Public
 * @returns {Object} 200 - Password reset successful
 * @returns {Object} 400 - Invalid or expired token
 */
router.post('/reset-password', userController.resetPassword);

module.exports = router;
