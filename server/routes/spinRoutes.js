const express = require('express');
const router = express.Router();
const spinController = require('../controllers/spinController');
const { protect } = require('../middleware/auth');
const { taskLimiter } = require('../middleware/rateLimiters');

// All spin routes require user authentication
router.use(protect);

// GET /api/spin/status - View user limits, remaining spins, segments, and live wins
router.get('/status', spinController.getSpinStatus);

// POST /api/spin/watch-ad - Verify rewarded video ad watch and unlock 1 spin
router.post('/watch-ad', taskLimiter, spinController.claimAdSpin);

// POST /api/spin/play - Play the wheel spin
router.post('/play', taskLimiter, spinController.playSpin);

module.exports = router;
