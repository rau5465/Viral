const express = require('express');
const {
  getMyReferrals,
  getReferralLink,
  getReferralLeaderboard,
  getMyBonusStatus,
} = require('../controllers/referralController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public leaderboard
router.get('/leaderboard', getReferralLeaderboard);

// Protected routes
router.use(protect);
router.get('/', getMyReferrals);
router.get('/link', getReferralLink);
router.get('/bonus-status', getMyBonusStatus);

module.exports = router;
