const { User, Referral, sequelize } = require('../models');
const { awardCredits } = require('./creditService');
const { checkAndApplyBonusMultiplier } = require('./bonusService');
const { getOrSet, del } = require('../config/redis');
const AppError = require('../utils/AppError');

// Get referral details for a user
const getReferralStats = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) throw new AppError('User not found.', 404);

  const referrals = await Referral.findAll({
    where: { referrer_id: userId },
    include: [
      {
        model: User,
        as: 'referredUser',
        attributes: ['id', 'full_name', 'created_at', 'level'],
      },
    ],
    order: [['created_at', 'DESC']],
  });

  const totalCreditsAwarded = referrals.reduce((sum, r) => sum + (r.credits_awarded || 0), 0);

  return {
    referralCode: user.referral_code,
    referralLink: `${process.env.CLIENT_URL || 'http://localhost:5173'}/register?ref=${user.referral_code}`,
    totalReferrals: referrals.length,
    totalCreditsEarned: totalCreditsAwarded,
    referrals: referrals.map((r) => ({
      id: r.id,
      user: r.referredUser
        ? {
            id: r.referredUser.id,
            name: r.referredUser.full_name,
            level: r.referredUser.level,
            joinedAt: r.referredUser.created_at,
          }
        : null,
      status: r.status,
      creditsAwarded: r.credits_awarded,
      createdAt: r.created_at,
    })),
  };
};

// Award referral reward when a referee signs up / activates
// Within 2 hours of registration: 50 credits (5X bonus). After 2 hours: 10 credits (10 Rs).
const awardReferralReward = async (referrerId, referredUserId) => {
  const referrer = await User.findByPk(referrerId);
  const now = new Date();
  const isWithin2Hours = referrer?.bonus_deadline && now <= new Date(referrer.bonus_deadline);
  const rewardAmount = isWithin2Hours ? 50 : 10;

  const referral = await Referral.findOne({
    where: {
      referrer_id: referrerId,
      referred_user_id: referredUserId,
    },
  });

  if (!referral) return null;

  if (referral.credits_awarded > 0) {
    return { alreadyAwarded: true };
  }

  const referee = await User.findByPk(referredUserId);
  const refereeName = referee ? referee.full_name : 'New friend';

  await sequelize.transaction(async (t) => {
    referral.status = 'active';
    referral.credits_awarded = rewardAmount;
    await referral.save({ transaction: t });

    await awardCredits({
      userId: referrerId,
      amount: rewardAmount,
      category: 'referral',
      description: isWithin2Hours
        ? `🔥 5X Referral Bonus (+50 CR) for inviting ${refereeName} within 2 hours!`
        : `Referral reward (+10 CR) for inviting ${refereeName}!`,
      referenceId: referral.id,
      transaction: t,
    });
  });

  // Check if 5x bonus triggered for the referrer
  const bonusResult = await checkAndApplyBonusMultiplier(referrerId);

  // Invalidate cached leaderboard
  del('cache:leaderboard:10', 'cache:leaderboard:20', 'cache:leaderboard:50').catch(() => {});

  return {
    referralAwarded: rewardAmount,
    isWithin2Hours,
    bonusResult,
  };
};

// Global Leaderboard (Top Referrers) - High-speed Redis Cached (60s TTL)
const getLeaderboard = async (limit = 10) => {
  const safeLimit = parseInt(limit, 10) || 10;
  const cacheKey = `cache:leaderboard:${safeLimit}`;

  return await getOrSet(
    cacheKey,
    async () => {
      const [results] = await sequelize.query(`
        SELECT 
          u.id, 
          u.full_name, 
          u.level, 
          u.total_earned,
          COUNT(r.id) AS total_referrals
        FROM users u
        LEFT JOIN referrals r ON u.id = r.referrer_id
        WHERE u.role = 'user' AND u.is_banned = FALSE
        GROUP BY u.id, u.full_name, u.level, u.total_earned
        ORDER BY total_referrals DESC, u.total_earned DESC
        LIMIT ${safeLimit}
      `);

      return results.map((row, index) => ({
        rank: index + 1,
        id: row.id,
        name: row.full_name,
        level: row.level,
        totalEarned: row.total_earned,
        totalReferrals: parseInt(row.total_referrals, 10),
      }));
    },
    60
  );
};

module.exports = {
  getReferralStats,
  awardReferralReward,
  getLeaderboard,
};
