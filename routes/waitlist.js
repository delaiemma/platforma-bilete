const express = require('express');
const router = express.Router();
const waitlistController = require('../controllers/waitlistController');
const { authenticate } = require('../middleware/auth');

router.post('/events/:eventId/waitlist', authenticate, waitlistController.join);
router.delete('/events/:eventId/waitlist', authenticate, waitlistController.leave);
router.get('/events/:eventId/waitlist/status', authenticate, waitlistController.getStatus);
router.get('/notifications', authenticate, waitlistController.getNotifications);
router.put('/notifications/read', authenticate, waitlistController.markRead);

module.exports = router;
