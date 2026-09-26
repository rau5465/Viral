const express = require('express');
const { getProfile, updateProfile, getDashboard, getBalance } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All user routes require authentication

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/dashboard', getDashboard);
router.get('/balance', getBalance);

module.exports = router;
