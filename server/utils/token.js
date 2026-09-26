const jwt = require('jsonwebtoken');

const signToken = (id, role = 'user') => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'super_secret_viral_jwt_key_2026', {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d',
  });
};

const signRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'super_secret_viral_refresh_key_2026', {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '180d',
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'super_secret_viral_jwt_key_2026');
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'super_secret_viral_refresh_key_2026');
};

module.exports = {
  signToken,
  signRefreshToken,
  verifyToken,
  verifyRefreshToken,
};
