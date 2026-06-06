/**
 * @fileoverview Contact routes for handling contact form submissions
 * Manages communication between users and site administrators
 */

const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

/**
 * Submit contact form
 * @route POST /api/contact
 * @access Public
 * @returns {Object} 200 - Contact form submitted successfully
 * @returns {Object} 400 - Invalid form data
 */
router.post('/', contactController.submitContactForm);

module.exports = router;
