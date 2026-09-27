const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { protect, restrictTo } = require('../middleware/auth');

// ─── Public Routes ───────────────────────────────────────────────────────────
// Fetch current credit conversion rate
router.get('/credit-rate', settingController.getCreditRate);

// Fetch current maintenance mode status
router.get('/maintenance', settingController.getMaintenanceMode);

// ─── Admin-Only Routes ────────────────────────────────────────────────────────
// Update credit conversion rate
router.put('/credit-rate', protect, restrictTo('admin'), settingController.updateCreditRate);
router.post('/credit-rate', protect, restrictTo('admin'), settingController.updateCreditRate);

// Update maintenance mode
router.put('/maintenance', protect, restrictTo('admin'), settingController.updateMaintenanceMode);
router.post('/maintenance', protect, restrictTo('admin'), settingController.updateMaintenanceMode);

// Clear platform cache
router.post('/cache/clear', protect, restrictTo('admin'), settingController.clearCache);

module.exports = router;
