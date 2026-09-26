const express = require('express');
const { getPlans, redeemCredits, getHistory } = require('../controllers/rechargeController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // Protected routes

router.get('/plans', getPlans);
router.post('/redeem', redeemCredits);
router.get('/history', getHistory);

module.exports = router;
