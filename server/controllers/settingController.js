const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const {
  getCreditRate,
  updateCreditRate,
  getMaintenanceMode,
  updateMaintenanceMode,
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
