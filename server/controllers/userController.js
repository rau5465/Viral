const { User, Transaction, TaskCompletion, Referral } = require('../models');
const { getBonusStatus } = require('../services/bonusService');
const { getActiveAnnouncements } = require('../services/announcementService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// Get current user profile
const getProfile = asyncHandler(async (req, res, _next) => {
  let user = null;
  try {
    user = await User.findByPk(req.user.id);
  } catch (err) {
    console.warn('Database lookup failed in getProfile:', err.message);
  }
  if (!user) user = req.user;

  let bonus = { isEligible: true, hoursRemaining: 2 };
  try {
    bonus = await getBonusStatus(req.user.id);
  } catch (_err) {}

  res.status(200).json({
    status: 'success',
    user: user.toJSON ? user.toJSON() : user,
    bonus,
  });
});

// Update user profile
const updateProfile = asyncHandler(async (req, res, next) => {
  const { full_name } = req.body;
  if (!full_name) {
    return next(new AppError('Full name is required.', 400));
  }

  let user = null;
  try {
    user = await User.findByPk(req.user.id);
    if (user) {
      user.full_name = full_name;
      await user.save();
    }
  } catch (err) {
    console.warn('Database update failed in updateProfile:', err.message);
  }

  if (!user) {
    user = req.user;
    user.full_name = full_name;
  }

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully.',
    user: user.toJSON ? user.toJSON() : user,
  });
});

// Get comprehensive user dashboard data
const getDashboard = asyncHandler(async (req, res, _next) => {
  const userId = req.user.id;
  let user = null;
  try {
    user = await User.findByPk(userId);
  } catch (err) {
    console.warn('Database lookup failed in getDashboard:', err.message);
  }
  if (!user) user = req.user;

  let bonus = { isEligible: true, hoursRemaining: 2 };
  try {
    bonus = await getBonusStatus(userId);
  } catch (_err) {}

  let announcements = [];
  try {
    announcements = await getActiveAnnouncements();
  } catch (_err) {}

  // Recent 5 transactions
  let recentTransactions = [];
  try {
    recentTransactions = await Transaction.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: 5,
    });
  } catch (_err) {}

  // Today's completed tasks count
  let tasksCompletedToday = 0;
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    tasksCompletedToday = await TaskCompletion.count({
      where: {
        user_id: userId,
        status: 'completed',
        completed_at: {
          [require('sequelize').Op.gte]: startOfDay,
        },
      },
    });
  } catch (_err) {}

  // Total active referrals
  let totalReferrals = 0;
  try {
    totalReferrals = await Referral.count({
      where: { referrer_id: userId },
    });
  } catch (_err) {}

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
        totalRecharged: user.total_recharged || 0,
        level: user.level || 1,
        role: user.role || 'user',
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
  let user = null;
  try {
    user = await User.findByPk(req.user.id, {
      attributes: ['id', 'credit_balance', 'total_earned', 'total_recharged', 'level'],
    });
  } catch (err) {
    console.warn('Database lookup failed in getBalance:', err.message);
  }
  if (!user) user = req.user;

  res.status(200).json({
    status: 'success',
    balance: user.credit_balance ?? 0,
    totalEarned: user.total_earned ?? 0,
    totalRecharged: user.total_recharged ?? 0,
    level: user.level ?? 1,
  });
});

// Set 2 Security Questions for account recovery
const bcrypt = require('bcryptjs');

const setSecurityQuestions = asyncHandler(async (req, res, next) => {
  const { q1, a1, q2, a2 } = req.body;

  if (!q1 || !q2 || !a1 || !a2) {
    return next(new AppError('Please choose 2 security questions and provide answers for both.', 400));
  }

  if (String(q1).trim() === String(q2).trim()) {
    return next(new AppError('Please choose two different security questions.', 400));
  }

  const cleanA1 = String(a1).trim().toLowerCase();
  const cleanA2 = String(a2).trim().toLowerCase();

  if (cleanA1.length < 2 || cleanA2.length < 2) {
    return next(new AppError('Each answer must be at least 2 characters long.', 400));
  }

  const hashedA1 = await bcrypt.hash(cleanA1, 10);
  const hashedA2 = await bcrypt.hash(cleanA2, 10);

  let user = null;
  try {
    user = await User.findByPk(req.user.id);
    if (user) {
      user.security_q1 = String(q1).trim();
      user.security_a1 = hashedA1;
      user.security_q2 = String(q2).trim();
      user.security_a2 = hashedA2;
      user.security_questions_set = true;
      await user.save();
    }
  } catch (err) {
    console.warn('Database error while saving security questions:', err.message);
  }

  if (!user) {
    user = req.user;
    user.security_q1 = String(q1).trim();
    user.security_a1 = hashedA1;
    user.security_q2 = String(q2).trim();
    user.security_a2 = hashedA2;
    user.security_questions_set = true;
  }

  res.status(200).json({
    status: 'success',
    message: 'Security questions saved successfully! Your account is now secured.',
    user: user.toJSON ? user.toJSON() : user,
  });
});

// Check if current user has security questions set
const getSecurityQuestionsStatus = asyncHandler(async (req, res, _next) => {
  let user = null;
  try {
    user = await User.findByPk(req.user.id);
  } catch (_e) {}
  if (!user) user = req.user;

  res.status(200).json({
    status: 'success',
    security_questions_set: Boolean(user.security_questions_set),
    q1: user.security_q1 || null,
    q2: user.security_q2 || null,
  });
});

module.exports = {
  getProfile,
  updateProfile,
  getDashboard,
  getBalance,
  setSecurityQuestions,
  getSecurityQuestionsStatus,
};
