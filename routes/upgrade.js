const express = require('express');
const router = express.Router();
const upgradeController = require('../controllers/upgradeController');

router.post('/trigger/:eventId', upgradeController.triggerForEvent);
router.get('/:token', upgradeController.getOffer);
router.post('/:token/accept', upgradeController.acceptOffer);

module.exports = router;
