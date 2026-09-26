const { User, Referral, sequelize } = require('../models');
const { awardCredits } = require('./creditService');

// Check and automatically trigger 4x bonus if eligible
const checkAndApplyBonusMultiplier = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) return { qualified: false, message: 'User not found' };

  // Already applied?
  if (user.signup_bonus_multiplied) {
    return { qualified: true, alreadyMultiplied: true };
  }

  // Has deadline passed?
  const now = new Date();
  if (!user.bonus_deadline || now > new Date(user.bonus_deadline)) {
    return { qualified: false, expired: true };
  }

  // Count active referrals created before the bonus deadline
  const referralCount = await Referral.count({
    where: {
      referrer_id: userId,
      created_at: {
        [sequelize.Sequelize.Op.lte]: user.bonus_deadline,
      },
    },
  });

  const target = parseInt(process.env.BONUS_REFERRAL_TARGET, 10) || 2;

  if (referralCount >= target) {
    // Eligible for 4x bonus!
    const baseBonus = parseInt(process.env.BASE_SIGNUP_BONUS, 10) || 25;
    const multipliedBonus = parseInt(process.env.MULTIPLIED_SIGNUP_BONUS, 10) || 100;
    const extraReward = multipliedBonus - baseBonus; // 75 credits

    await sequelize.transaction(async (t) => {
      user.signup_bonus_multiplied = true;
      await user.save({ transaction: t });

      await awardCredits({
        userId: user.id,
        amount: extraReward,
        category: 'bonus_multiplier',
        description: `🔥 4x Viral Referral Bonus unlocked! You referred ${referralCount} users within 2 hours.`,
        referenceId: user.id,
        transaction: t,
      });
    });

    return {
      qualified: true,
      multiplierApplied: true,
      creditsAwarded: extraReward,
      totalSignupCredits: multipliedBonus,
    };
  }

  return {
    qualified: false,
    referralCount,
    target,
    remaining: target - referralCount,
  };
};

// Get real-time 4x bonus status for countdown timer
const getBonusStatus = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) return null;

  const now = new Date();
  const deadline = user.bonus_deadline ? new Date(user.bonus_deadline) : null;
  const isExpired = deadline ? now > deadline : true;
  const target = parseInt(process.env.BONUS_REFERRAL_TARGET, 10) || 2;

  const referralCount = await Referral.count({
    where: { referrer_id: userId },
  });

  let secondsRemaining = 0;
  if (deadline && !isExpired) {
    secondsRemaining = Math.max(0, Math.floor((deadline.getTime() - now.getTime()) / 1000));
  }

  return {
    isMultiplied: user.signup_bonus_multiplied,
    isExpired,
    deadline,
    secondsRemaining,
    referralCount,
    target,
    progressPercent: Math.min(100, Math.round((referralCount / target) * 100)),
    bonusMultiplier: 4,
    bonusPotentialCredits: 100,
  };
};

module.exports = {
  checkAndApplyBonusMultiplier,
  getBonusStatus,
};
