const { User } = require('../models');
const { verifyToken } = require('../utils/token');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

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
    const currentUser = await User.findByPk(decoded.id);

    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
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
    const currentUser = await User.findByPk(decoded.id);
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
};
