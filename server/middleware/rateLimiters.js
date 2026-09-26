const rateLimit = require('express-rate-limit');
const { createRateLimitStore } = require('../config/redis');

// Global API limiter (Redis-backed in cluster/production)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Elevated for high realtime traffic
  standardHeaders: true,
  legacyHeaders: false,
  store: createRateLimitStore('api'),
  message: {
    status: 'error',
    message: 'Too many requests, please try again later.',
  },
});

// Authentication rate limiter (protects /api/auth routes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 60, // 60 attempts per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  store: createRateLimitStore('auth'),
  message: {
    status: 'fail',
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
  },
});

// OTP request limiter
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 10, // 10 OTP requests per 10 mins
  standardHeaders: true,
  legacyHeaders: false,
  store: createRateLimitStore('otp'),
  message: {
    status: 'fail',
    message: 'Too many OTP requests. Please wait 10 minutes before requesting again.',
  },
});

// Task completion / action limiter
const taskLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 30, // 30 task actions per minute
  standardHeaders: true,
  legacyHeaders: false,
  store: createRateLimitStore('task'),
  message: {
    status: 'fail',
    message: 'Too many task actions. Slow down and try again in a minute.',
  },
});

// YouTube verification limiter
const youtubeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 20, // 20 verifications per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  store: createRateLimitStore('youtube'),
  message: {
    status: 'fail',
    message: 'Too many YouTube verification requests. Please wait a minute before retrying.',
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  otpLimiter,
  taskLimiter,
  youtubeLimiter,
};
