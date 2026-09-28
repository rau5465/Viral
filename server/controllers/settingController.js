const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const {
  getCreditRate,
  updateCreditRate,
  getMaintenanceMode,
  updateMaintenanceMode,
  getReferralSettings,
  updateReferralSettings,
  clearPlatformCache,
} = require('../services/settingService');

// ─── Credit Rate ──────────────────────────────────────────────────────────────

// Public: Get current credit conversion rate
exports.getCreditRate = asyncHandler(async (req, res) => {
  const rate = await getCreditRate();
  res.status(200).json({
    status: 'success',
    credit_rate: rate,
  });
});

// Admin: Update credit conversion rate
exports.updateCreditRate = asyncHandler(async (req, res, next) => {
  const { rate_display, rupees, credits } = req.body;

  if (!rate_display && (!rupees || !credits)) {
    return next(new AppError('Please provide either rate_display or both rupees and credits.', 400));
  }

  const updated = await updateCreditRate({
    rate_display,
    rupees: rupees || 1,
    credits: credits || 1,
    adminName: req.user?.full_name || 'Admin',
  });

  res.status(200).json({
    status: 'success',
    message: 'Credit rate updated successfully!',
    credit_rate: updated,
  });
});

// ─── Maintenance Mode ─────────────────────────────────────────────────────────

// Public: Get current maintenance mode status
exports.getMaintenanceMode = asyncHandler(async (req, res) => {
  const maintenance = await getMaintenanceMode();
  res.status(200).json({
    status: 'success',
    maintenance,
  });
});

// Admin: Update maintenance mode
exports.updateMaintenanceMode = asyncHandler(async (req, res, next) => {
  const { enabled, message } = req.body;

  if (enabled === undefined || enabled === null) {
    return next(new AppError('Please provide "enabled" field (true/false).', 400));
  }

  const updated = await updateMaintenanceMode({
    enabled,
    message,
    adminName: req.user?.full_name || 'Admin',
  });

  res.status(200).json({
    status: 'success',
    message: `Maintenance mode ${updated.enabled ? 'ENABLED' : 'DISABLED'} successfully.`,
    maintenance: updated,
  });
});

// ─── Referral Settings ────────────────────────────────────────────────────────

// Public: Get current referral reward rates
exports.getReferralSettings = asyncHandler(async (req, res) => {
  const settings = await getReferralSettings();
  res.status(200).json({
    status: 'success',
    referral_settings: settings,
  });
});

// Admin: Update referral reward rates & 2-hour single refer rules
exports.updateReferralSettings = asyncHandler(async (req, res, next) => {
  const { bonus_reward_2h, standard_reward, target_referrals, bonus_window_hours } = req.body;

  if (bonus_reward_2h === undefined && standard_reward === undefined && target_referrals === undefined) {
    return next(new AppError('Please provide at least one referral setting field to update.', 400));
  }

  const updated = await updateReferralSettings({
    bonus_reward_2h: bonus_reward_2h !== undefined ? Number(bonus_reward_2h) : undefined,
    standard_reward: standard_reward !== undefined ? Number(standard_reward) : undefined,
    target_referrals: target_referrals !== undefined ? Number(target_referrals) : undefined,
    bonus_window_hours: bonus_window_hours !== undefined ? Number(bonus_window_hours) : undefined,
    adminName: req.user?.full_name || 'Admin',
  });

  res.status(200).json({
    status: 'success',
    message: 'Referral reward settings updated successfully!',
    referral_settings: updated,
  });
});

// ─── Clear Cache ──────────────────────────────────────────────────────────────

// Admin: Clear platform cache
exports.clearCache = asyncHandler(async (req, res) => {
  const count = await clearPlatformCache();
  res.status(200).json({
    status: 'success',
    message: `Platform cache cleared. ${count} cache key(s) removed.`,
    cleared_at: new Date().toISOString(),
  });
});

// Public: Get active announcements for ticker and banners
exports.getPublicAnnouncements = asyncHandler(async (req, res) => {
  let announcements = [];
  try {
    const { getActiveAnnouncements } = require('../services/announcementService');
    announcements = await getActiveAnnouncements();
  } catch (err) {
    console.warn('Could not fetch active announcements:', err.message);
  }
  res.status(200).json({
    status: 'success',
    announcements: announcements || [],
  });
});
