const express = require('express');
const {
  register,
  login,
  sendOtp,
  verifyOtp,
  refreshToken,
  logout,
  forgotPassword,
  getSecurityQuestionsByMobile,
  resetPassword,
  googleAuth,
} = require('../controllers/authController');
const {
  initiateVerification,
  checkVerificationStatus,
  handleWacliWebhook,
  simulateVerification,
} = require('../controllers/verificationController');
const { authLimiter, otpLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

// WhatsApp wacli Phone Verification routes
router.post('/verify/initiate', initiateVerification);
router.get('/verify/status', checkVerificationStatus);
router.post('/wacli/webhook', handleWacliWebhook);
router.post('/verify/simulate', simulateVerification);

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/send-otp', otpLimiter, sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.post('/security-questions/get-by-mobile', authLimiter, getSecurityQuestionsByMobile);
router.post('/google', googleAuth);

// Lightweight heartbeat for active live session tracking
router.post('/heartbeat', (req, res) => {
  const activeUserService = require('../services/activeUserService');
  let authHeader = req.headers.authorization;
  let identifier = req.body?.client_id || req.ip || 'anon';
  let isAuth = false;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const { verifyToken } = require('../utils/token');
      const decoded = verifyToken(authHeader.split(' ')[1]);
      if (decoded && decoded.id) {
        identifier = decoded.id;
        isAuth = true;
      }
    } catch {
      // Ignored
    }
  }

  activeUserService.recordHeartbeat(identifier, isAuth).catch(() => {});
  res.status(200).json({ status: 'ok' });
});

module.exports = router;
