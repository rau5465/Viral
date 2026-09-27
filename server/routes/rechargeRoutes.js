const express = require('express');
const { getPlans, redeemCredits, getHistory } = require('../controllers/rechargeController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public route to view plans
router.get('/plans', getPlans);

// Protected user routes
router.post('/redeem', protect, redeemCredits);
router.get('/history', protect, getHistory);

module.exports = router;
