const { User, Transaction, sequelize } = require('../models');
const { del } = require('../config/redis');
const AppError = require('../utils/AppError');

// Calculate user level based on total credits earned
const calculateLevel = (totalEarned) => {
  if (totalEarned >= 1000) return 'platinum';
  if (totalEarned >= 500) return 'gold';
  if (totalEarned >= 200) return 'silver';
  return 'bronze';
};

// Evict user caches and dynamic stats caches
const evictCaches = async (userId) => {
  try {
    await del(
      `cache:user:auth:${userId}`,
      `cache:user:profile:${userId}`,
      `cache:user:dashboard:${userId}`,
      'cache:leaderboard:10',
      'cache:leaderboard:20',
      'cache:leaderboard:50',
      'cache:admin:dashboard:stats'
    );
  } catch (err) {
    console.warn('[Cache eviction error in creditService]', err.message);
  }
};

// Award credits to user and log transaction
const awardCredits = async ({
  userId,
  amount,
  category,
  description,
  referenceId = null,
  transaction = null,
}) => {
  const execute = async (t) => {
    const user = await User.findByPk(userId, { transaction: t, lock: true });
    if (!user) {
      throw new AppError('User not found to award credits.', 404);
    }

    const newBalance = user.credit_balance + amount;
    const newTotalEarned = user.total_earned + amount;
    const newLevel = calculateLevel(newTotalEarned);

    user.credit_balance = newBalance;
    user.total_earned = newTotalEarned;
    user.level = newLevel;
    await user.save({ transaction: t });

    const tx = await Transaction.create(
      {
        user_id: user.id,
        type: 'credit',
        category,
        amount,
        balance_after: newBalance,
        description,
        reference_id: referenceId,
      },
      { transaction: t }
    );

    return { user, transaction: tx };
  };

  let result;
  if (transaction) {
    result = await execute(transaction);
  } else {
    result = await sequelize.transaction(execute);
  }

  // Evict stale user and leaderboard caches
  evictCaches(userId).catch(() => {});

  return result;
};

// Deduct credits from user (for recharges, penalties)
const deductCredits = async ({
  userId,
  amount,
  category,
  description,
  referenceId = null,
  transaction = null,
}) => {
  const execute = async (t) => {
    const user = await User.findByPk(userId, { transaction: t, lock: true });
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    if (user.credit_balance < amount) {
      throw new AppError(
        `Insufficient credit balance. You have ${user.credit_balance} credits, but ${amount} credits are required.`,
        400
      );
    }

    const newBalance = user.credit_balance - amount;
    user.credit_balance = newBalance;
    await user.save({ transaction: t });

    const tx = await Transaction.create(
      {
        user_id: user.id,
        type: 'debit',
        category,
        amount,
        balance_after: newBalance,
        description,
        reference_id: referenceId,
      },
      { transaction: t }
    );

    return { user, transaction: tx };
  };

  let result;
  if (transaction) {
    result = await execute(transaction);
  } else {
    result = await sequelize.transaction(execute);
  }

  // Evict stale user cache
  evictCaches(userId).catch(() => {});

  return result;
};

// Get current balance and summary
const getBalanceSummary = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: [
      'id',
      'credit_balance',
      'total_earned',
      'total_recharged',
      'level',
      'signup_bonus_multiplied',
    ],
  });

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  return user;
};

module.exports = {
  calculateLevel,
  awardCredits,
  deductCredits,
  getBalanceSummary,
};
