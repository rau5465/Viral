const { User } = require('../models');
const { verifyToken } = require('../utils/token');
const { get, set, del } = require('../config/redis');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// Cache TTL for authenticated user session data in seconds (5 minutes)
const AUTH_CACHE_TTL = 300;

/**
 * Invalidate cached user session and profile data
 * Call whenever user details change (e.g. banned, profile update, credits award)
 */
const invalidateUserCache = async (userId) => {
  if (!userId) return;
  try {
    await del(
      `cache:user:auth:${userId}`,
      `cache:user:profile:${userId}`,
      `cache:user:dashboard:${userId}`
    );
  } catch (err) {
    console.warn(`[invalidateUserCache error for User #${userId}]`, err.message);
  }
};

const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  try {
    const decoded = verifyToken(token);
    const cacheKey = `cache:user:auth:${decoded.id}`;

    // Fast-path: Check Redis cache first to bypass MySQL query
    let userData = await get(cacheKey);
    let currentUser;

    if (userData) {
      currentUser = User.build(userData, { isNewRecord: false });
    } else {
      // Cache miss: Query MySQL and populate Redis cache
      try {
        currentUser = await User.findByPk(decoded.id);
      } catch (dbErr) {
        console.warn('Database offline in protect middleware, checking in-memory users:', dbErr.message);
      }

      if (!currentUser) {
        const { inMemoryUsers } = require('../controllers/authController');
        currentUser = inMemoryUsers.find((u) => u.id === decoded.id || String(u.id) === String(decoded.id));
      }

      if (!currentUser) {
        return next(new AppError('The user belonging to this token no longer exists.', 401));
      }

      // Save user data in Redis
      await set(cacheKey, currentUser.toJSON ? currentUser.toJSON() : currentUser, AUTH_CACHE_TTL);
    }

    if (currentUser.is_banned) {
      return next(new AppError('Your account has been suspended. Please contact support.', 403));
    }

    req.user = currentUser;
    next();
  } catch {
    return next(new AppError('Invalid or expired authentication token. Please log in again.', 401));
  }
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
};

const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyToken(token);
    const cacheKey = `cache:user:auth:${decoded.id}`;

    let userData = await get(cacheKey);
    let currentUser;

    if (userData) {
      currentUser = User.build(userData, { isNewRecord: false });
    } else {
      currentUser = await User.findByPk(decoded.id);
      if (currentUser) {
        await set(cacheKey, currentUser.toJSON(), AUTH_CACHE_TTL);
      }
    }

    if (currentUser && !currentUser.is_banned) {
      req.user = currentUser;
    }
  } catch {
    // Ignore invalid token in optionalAuth
  }
  next();
});

module.exports = {
  protect,
  restrictTo,
  optionalAuth,
  invalidateUserCache,
};
