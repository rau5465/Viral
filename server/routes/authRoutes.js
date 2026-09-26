const express = require('express');
const {
  register,
  login,
  sendOtp,
  verifyOtp,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  googleAuth,
} = require('../controllers/authController');
const { authLimiter, otpLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/send-otp', otpLimiter, sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.post('/google', googleAuth);

module.exports = router;
