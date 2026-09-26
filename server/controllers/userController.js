const { User, Transaction, TaskCompletion, Referral } = require('../models');
const { getBonusStatus } = require('../services/bonusService');
const { getActiveAnnouncements } = require('../services/announcementService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// Get current user profile
const getProfile = asyncHandler(async (req, res, _next) => {
  const user = await User.findByPk(req.user.id);
  const bonus = await getBonusStatus(req.user.id);

  res.status(200).json({
    status: 'success',
    user: user.toJSON(),
    bonus,
  });
});

// Update user profile
const updateProfile = asyncHandler(async (req, res, next) => {
  const { full_name } = req.body;
  if (!full_name) {
    return next(new AppError('Full name is required.', 400));
  }

  const user = await User.findByPk(req.user.id);
  user.full_name = full_name;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully.',
    user: user.toJSON(),
  });
});

// Get comprehensive user dashboard data
const getDashboard = asyncHandler(async (req, res, _next) => {
  const userId = req.user.id;
  const user = await User.findByPk(userId);
  const bonus = await getBonusStatus(userId);
  const announcements = await getActiveAnnouncements();

  // Recent 5 transactions
  const recentTransactions = await Transaction.findAll({
    where: { user_id: userId },
    order: [['created_at', 'DESC']],
    limit: 5,
  });

  // Today's completed tasks count
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const tasksCompletedToday = await TaskCompletion.count({
    where: {
      user_id: userId,
      status: 'completed',
      completed_at: {
        [require('sequelize').Op.gte]: startOfDay,
      },
    },
  });

  // Total active referrals
  const totalReferrals = await Referral.count({
    where: { referrer_id: userId },
  });

  res.status(200).json({
    status: 'success',
    dashboard: {
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        mobile: user.mobile,
        referralCode: user.referral_code,
        creditBalance: user.credit_balance,
        totalEarned: user.total_earned,
        totalRecharged: user.total_recharged,
        level: user.level,
        role: user.role,
      },
      bonus,
      stats: {
        tasksCompletedToday,
        totalReferrals,
      },
      recentTransactions,
      announcements,
    },
  });
});

// Get user credit balance
const getBalance = asyncHandler(async (req, res, _next) => {
  const user = await User.findByPk(req.user.id, {
    attributes: ['id', 'credit_balance', 'total_earned', 'total_recharged', 'level'],
  });

  res.status(200).json({
    status: 'success',
    balance: user.credit_balance,
    totalEarned: user.total_earned,
    totalRecharged: user.total_recharged,
    level: user.level,
  });
});

module.exports = {
  getProfile,
  updateProfile,
  getDashboard,
  getBalance,
};
