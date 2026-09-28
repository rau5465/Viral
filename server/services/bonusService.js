const { User, Referral, sequelize } = require('../models');
const { awardCredits } = require('./creditService');
const { getReferralSettings } = require('./settingService');

// Check and automatically trigger 5x bonus if eligible (Single Refer within 2 hours)
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

  const refSettings = await getReferralSettings();
  const target = Number(refSettings?.target_referrals) || 1; // Single Refer in first 2 hours!

  if (referralCount >= target) {
    // Eligible for 5x bonus!
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
        description: `🔥 Up to 5x Viral Referral Bonus unlocked! You referred ${referralCount} user within 2 hours.`,
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
    remaining: Math.max(0, target - referralCount),
  };
};

// Get real-time 5x bonus status for countdown timer
const getBonusStatus = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) return null;

  const refSettings = await getReferralSettings();
  const target = Number(refSettings?.target_referrals) || 1; // Single Refer in first 2 hours!

  const now = new Date();
  const deadline = user.bonus_deadline ? new Date(user.bonus_deadline) : null;
  const isExpired = deadline ? now > deadline : true;

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
    bonusMultiplier: 5,
    bonusPotentialCredits: 100,
    bonusRateWithin2Hours: Number(refSettings?.bonus_reward_2h) || 50,
    bonusRateStandard: Number(refSettings?.standard_reward) || 10,
  };
};

module.exports = {
  checkAndApplyBonusMultiplier,
  getBonusStatus,
};
