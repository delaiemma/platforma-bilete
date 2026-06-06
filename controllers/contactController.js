/**
 * @file Contact Controller
 * @description Handles contact form submissions and sends confirmation emails to users.
 */

const { sendContactConfirmationEmail } = require('../services/emailService');

/**
 * Processes contact form submission and sends confirmation email.
 *
 * @param {express.Request} req - Express request object containing name, email, phone, and message in body
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {400} If required fields are missing or email format is invalid
 * @throws {500} If processing fails
 *
 * Side effects:
 * - Validates email format using regex
 * - Sends confirmation email to the user
 * - Logs contact form submission details
 */
exports.submitContactForm = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        if (!name || !email || !phone || !message) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        console.log(`📨 Contact form submitted by ${name} (${email})`);
        console.log(`   Phone: ${phone}`);
        console.log(`   Message: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`);

        try {
            await sendContactConfirmationEmail(email, name);
            console.log(`✅ Confirmation email sent to ${email}`);
        } catch (emailError) {
            console.error('❌ Failed to send confirmation email:', emailError);

        }

        res.json({
            success: true,
            message: 'Thank you for contacting us! We will get back to you soon.'
        });

    } catch (error) {
        console.error('❌ Error processing contact form:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process your request. Please try again later.'
        });
    }
};
