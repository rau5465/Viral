const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { protect, restrictTo } = require('../middleware/auth');

// ─── Public Routes ───────────────────────────────────────────────────────────
// Fetch current credit conversion rate
router.get('/credit-rate', settingController.getCreditRate);

// Fetch current maintenance mode status
router.get('/maintenance', settingController.getMaintenanceMode);

// Fetch current referral reward settings
router.get('/referral', settingController.getReferralSettings);

// Fetch current spin wheel settings
router.get('/spin', settingController.getSpinSettings);

// Fetch current multiplier game settings
router.get('/multiply', settingController.getMultiplySettings);

// Fetch public active site announcements
router.get('/announcements', settingController.getPublicAnnouncements);

// ─── Admin-Only Routes ────────────────────────────────────────────────────────
// Update credit conversion rate
router.put('/credit-rate', protect, restrictTo('admin'), settingController.updateCreditRate);
router.post('/credit-rate', protect, restrictTo('admin'), settingController.updateCreditRate);

// Update maintenance mode
router.put('/maintenance', protect, restrictTo('admin'), settingController.updateMaintenanceMode);
router.post('/maintenance', protect, restrictTo('admin'), settingController.updateMaintenanceMode);

// Update referral reward settings (single refer in first 2 hours & standard reward)
router.put('/referral', protect, restrictTo('admin'), settingController.updateReferralSettings);
router.post('/referral', protect, restrictTo('admin'), settingController.updateReferralSettings);

// Update spin wheel settings & segment values
router.put('/spin', protect, restrictTo('admin'), settingController.updateSpinSettings);
router.post('/spin', protect, restrictTo('admin'), settingController.updateSpinSettings);

// Update multiplier game settings & limits
router.put('/multiply', protect, restrictTo('admin'), settingController.updateMultiplySettings);
router.post('/multiply', protect, restrictTo('admin'), settingController.updateMultiplySettings);

// WhatsApp verification settings
const {
  getVerificationSettings,
  updateVerificationSettings,
} = require('../controllers/verificationController');

router.get('/whatsapp-verification', getVerificationSettings);
router.put('/whatsapp-verification', protect, restrictTo('admin'), updateVerificationSettings);
router.post('/whatsapp-verification', protect, restrictTo('admin'), updateVerificationSettings);

// Clear platform cache
router.post('/cache/clear', protect, restrictTo('admin'), settingController.clearCache);

module.exports = router;
