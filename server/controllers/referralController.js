const { getReferralStats, getLeaderboard } = require('../services/referralService');
const { getBonusStatus } = require('../services/bonusService');
const asyncHandler = require('../utils/asyncHandler');

// Get current user referral statistics & tree
const getMyReferrals = asyncHandler(async (req, res, _next) => {
  const stats = await getReferralStats(req.user.id);
  res.status(200).json({
    status: 'success',
    ...stats,
  });
});

// Get referral link and code
const getReferralLink = asyncHandler(async (req, res, _next) => {
  const referralLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/register?ref=${req.user.referral_code}`;
  res.status(200).json({
    status: 'success',
    referralCode: req.user.referral_code,
    referralLink,
  });
});

// Top referrers leaderboard
const getReferralLeaderboard = asyncHandler(async (req, res, _next) => {
  const limit = req.query.limit || 10;
  const leaderboard = await getLeaderboard(limit);
  res.status(200).json({
    status: 'success',
    leaderboard,
  });
});

// 4x Bonus countdown timer status
const getMyBonusStatus = asyncHandler(async (req, res, _next) => {
  const bonus = await getBonusStatus(req.user.id);
  res.status(200).json({
    status: 'success',
    bonus,
  });
});

module.exports = {
  getMyReferrals,
  getReferralLink,
  getReferralLeaderboard,
  getMyBonusStatus,
};
