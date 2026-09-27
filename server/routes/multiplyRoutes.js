const express = require('express');
const router = express.Router();
const multiplyController = require('../controllers/multiplyController');
const { protect, optionalAuth } = require('../middleware/auth');

// Protected Game Actions
router.post('/roll', protect, multiplyController.rollDice);
router.get('/my-rolls', protect, multiplyController.getMyRolls);
router.get('/stats', protect, multiplyController.getGameStats);

// Live community rolls feed (available to both visitors and members)
router.get('/live-rolls', optionalAuth, multiplyController.getLiveRolls);

module.exports = router;
