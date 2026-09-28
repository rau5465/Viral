const crypto = require('crypto');
const wacliService = require('../services/wacliService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

/**
 * Initiate WhatsApp verification for registration
 * POST /api/auth/verify/initiate
 */
const initiateVerification = asyncHandler(async (req, res, next) => {
  const { mobile } = req.body;
  if (!mobile) {
    return next(new AppError('Please provide your WhatsApp mobile number.', 400));
  }

  try {
    const data = await wacliService.initiateVerification(mobile);
    return res.status(200).json({
      status: 'success',
      message: 'Verification code generated. Please send the WhatsApp verification message.',
      data,
    });
  } catch (err) {
    return next(new AppError(err.message, 400));
  }
});

/**
 * Check verification status (polled by registration page)
 * GET /api/auth/verify/status?mobile=...&code=...
 */
const checkVerificationStatus = asyncHandler(async (req, res, next) => {
  const { mobile, code } = req.query;
  if (!mobile || !code) {
    return next(new AppError('Mobile number and verification code are required.', 400));
  }

  const data = await wacliService.checkVerificationStatus(mobile, code);
  return res.status(200).json({
    status: 'success',
    data,
  });
});

/**
 * Webhook receiver for wacli sync events
 * POST /api/auth/wacli/webhook
 */
const handleWacliWebhook = asyncHandler(async (req, res) => {
  const settings = await wacliService.getSettings();

  // If secret configured, verify HMAC signature
  if (settings.webhook_secret) {
    const signature = req.headers['x-wacli-signature'] || '';
    const hmac = crypto.createHmac('sha256', settings.webhook_secret);
    const expected = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');

    if (signature !== expected) {
      console.warn('[wacliWebhook] Invalid webhook signature received');
      return res.status(401).json({ status: 'fail', message: 'Invalid webhook signature' });
    }
  }

  console.log('[wacliWebhook] Received event:', JSON.stringify(req.body));
  const result = await wacliService.processInboundMessage(req.body);

  return res.status(200).json({
    status: 'success',
    result,
  });
});

/**
 * Get WhatsApp verification settings
 * GET /api/settings/whatsapp-verification
 */
const getVerificationSettings = asyncHandler(async (req, res) => {
  const settings = await wacliService.getSettings();
  // Don't leak webhook_secret to non-admin users
  const isReqAdmin = req.user && req.user.role === 'admin';
  const safeSettings = isReqAdmin
    ? settings
    : {
        enabled: settings.enabled,
        whatsapp_number: settings.whatsapp_number,
        code_expiry_minutes: settings.code_expiry_minutes,
      };

  return res.status(200).json({
    status: 'success',
    data: {
      settings: safeSettings,
    },
  });
});

/**
 * Update WhatsApp verification settings (Admin only)
 * PUT /api/settings/whatsapp-verification
 */
const updateVerificationSettings = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new AppError('Only administrators can update WhatsApp verification settings.', 403));
  }

  const updated = await wacliService.updateSettings(req.body, req.user.full_name || 'Admin');

  return res.status(200).json({
    status: 'success',
    message: 'WhatsApp verification settings updated successfully!',
    data: {
      settings: updated,
    },
  });
});

/**
 * Simulate inbound WhatsApp message verification (for admin / developer testing)
 * POST /api/auth/verify/simulate
 */
const simulateVerification = asyncHandler(async (req, res, next) => {
  const { mobile, code } = req.body;
  if (!mobile || !code) {
    return next(new AppError('Mobile and code are required to simulate verification.', 400));
  }

  const result = await wacliService.simulateVerification(mobile, code);

  return res.status(200).json({
    status: 'success',
    message: result.verified
      ? `Mobile +91 ${mobile} successfully verified!`
      : `Simulation completed: ${result.reason || 'Verification failed'}`,
    result,
  });
});

module.exports = {
  initiateVerification,
  checkVerificationStatus,
  handleWacliWebhook,
  getVerificationSettings,
  updateVerificationSettings,
  simulateVerification,
};
