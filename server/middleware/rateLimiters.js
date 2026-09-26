const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 30, // 30 auth requests per 15 mins
  message: {
    status: 'fail',
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 5, // 5 OTP requests per 10 mins
  message: {
    status: 'fail',
    message: 'Too many OTP requests. Please wait 10 minutes before requesting again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const taskLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 20, // 20 task actions per minute
  message: {
    status: 'fail',
    message: 'Too many task actions. Slow down and try again in a minute.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authLimiter,
  otpLimiter,
  taskLimiter,
};
