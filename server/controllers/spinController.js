const crypto = require('crypto');
const { Op } = require('sequelize');
const { User, UserSpin, Transaction, sequelize } = require('../models');
const { invalidateUserCache } = require('../middleware/auth');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { redisClient } = require('../config/redis');
const { getSpinSettings, DEFAULT_SPIN_SEGMENTS } = require('../services/settingService');

// In-memory fallback for unlocked spin tokens if Redis is offline
const inMemorySpinTokens = new Map();

/**
 * Get start and end of current day in UTC
 */
const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

/**
 * GET /api/spin/status
 * Get current user spin status, limits, wheel configuration, and recent history
 */
exports.getSpinStatus = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { start, end } = getTodayRange();

  // 1. Count spins completed today by user
  let spinsCompletedToday = 0;
  let myRecentSpins = [];
  let recentWinners = [];

  try {
    spinsCompletedToday = await UserSpin.count({
      where: {
        user_id: userId,
        created_at: { [Op.between]: [start, end] },
      },
    });

    // User's recent spins (up to 20)
    myRecentSpins = await UserSpin.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: 20,
      attributes: ['id', 'reward_credits', 'segment_label', 'slice_index', 'created_at'],
    });

    // Recent winners across platform
    recentWinners = await UserSpin.findAll({
      order: [['created_at', 'DESC']],
      limit: 12,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'mobile'],
        },
      ],
      attributes: ['id', 'reward_credits', 'segment_label', 'created_at'],
    });
  } catch (err) {
    console.warn('[SpinController] DB warning in getSpinStatus:', err.message);
  }

  // Mask user names & phones for privacy
  const maskedWinners = (recentWinners || []).map((rw) => {
    const rawName = rw.user?.full_name || 'Lucky Player';
    const parts = rawName.trim().split(' ');
    const maskedName = parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0];
    const mobile = rw.user?.mobile ? `${rw.user.mobile.slice(0, 3)}****${rw.user.mobile.slice(-3)}` : '';
    return {
      id: rw.id,
      name: maskedName,
      mobile,
      reward_credits: rw.reward_credits,
      segment_label: rw.segment_label,
      created_at: rw.created_at,
    };
  });

  // Check if user currently has an unused spin token in Redis/memory
  let hasPendingSpin = false;
  const redisKey = `spin:token:user:${userId}`;
  if (redisClient && redisClient.status === 'ready') {
    const token = await redisClient.get(redisKey);
    hasPendingSpin = Boolean(token);
  } else {
    hasPendingSpin = inMemorySpinTokens.has(String(userId));
  }

  // Load dynamic settings configured by Admin
  const spinConfig = await getSpinSettings();
  const maxDailySpins = Number(spinConfig.max_daily_spins || 10);
  const adDurationSeconds = Number(spinConfig.ad_duration_seconds || 15);
  const activeSegments = Array.isArray(spinConfig.segments) && spinConfig.segments.length > 0
    ? spinConfig.segments
    : DEFAULT_SPIN_SEGMENTS;

  const spinsRemainingToday = Math.max(0, maxDailySpins - spinsCompletedToday);

  res.status(200).json({
    status: 'success',
    data: {
      maxDailySpins,
      spinsCompletedToday,
      spinsRemainingToday,
      canWatchAd: spinsRemainingToday > 0 && spinConfig.enabled !== false,
      hasPendingSpin,
      adDurationSeconds,
      enabled: spinConfig.enabled !== false,
      segments: activeSegments.map(({ id, label, credits, color, textColor }) => ({
        id,
        label,
        credits,
        color,
        textColor,
      })),
      myRecentSpins,
      recentWinners: maskedWinners,
    },
  });
});

/**
 * POST /api/spin/watch-ad-complete
 * Verifies rewarded video ad completion and issues a Spin Token
 */
exports.claimAdSpin = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { start, end } = getTodayRange();

  const spinConfig = await getSpinSettings();
  const maxDailySpins = Number(spinConfig.max_daily_spins || 10);

  if (spinConfig.enabled === false) {
    return next(new AppError('Spin Wheel is temporarily paused for maintenance.', 400));
  }

  // 1. Verify user hasn't exceeded daily limit
  let spinsCompletedToday = 0;
  try {
    spinsCompletedToday = await UserSpin.count({
      where: {
        user_id: userId,
        created_at: { [Op.between]: [start, end] },
      },
    });
  } catch (_e) {}

  if (spinsCompletedToday >= maxDailySpins) {
    return next(
      new AppError(
        `Daily limit reached. You have already completed ${maxDailySpins} spins today. Please check back tomorrow!`,
        400
      )
    );
  }

  // 2. Generate secure spin token valid for 15 minutes
  const spinToken = crypto.randomBytes(24).toString('hex');
  const redisKey = `spin:token:user:${userId}`;
  const tokenData = JSON.stringify({
    token: spinToken,
    userId,
    issuedAt: Date.now(),
  });

  if (redisClient && redisClient.status === 'ready') {
    await redisClient.set(redisKey, tokenData, 'EX', 900); // 15 mins
  } else {
    inMemorySpinTokens.set(String(userId), {
      token: spinToken,
      issuedAt: Date.now(),
      expiresAt: Date.now() + 15 * 60 * 1000,
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Rewarded ad verified! You have unlocked 1 Free Spin.',
    spinToken,
  });
});

/**
 * POST /api/spin/play
 * Executes the wheel spin using server-side RNG with weighted probabilities
 */
exports.playSpin = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { spinToken } = req.body;

  // 1. Validate Spin Token
  const redisKey = `spin:token:user:${userId}`;
  let tokenValid = false;

  if (redisClient && redisClient.status === 'ready') {
    const raw = await redisClient.get(redisKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.userId === userId && (!spinToken || parsed.token === spinToken)) {
          tokenValid = true;
          await redisClient.del(redisKey); // Consume token immediately
        }
      } catch (_e) {}
    }
  } else {
    const stored = inMemorySpinTokens.get(String(userId));
    if (stored && stored.expiresAt > Date.now()) {
      if (!spinToken || stored.token === spinToken) {
        tokenValid = true;
        inMemorySpinTokens.delete(String(userId)); // Consume token immediately
      }
    }
  }

  if (!tokenValid) {
    return next(
      new AppError(
        'No active spin available. Please watch a rewarded video ad to unlock a free spin!',
        400
      )
    );
  }

  // 2. Verify dynamic daily limit & status
  const spinConfig = await getSpinSettings();
  const maxDailySpins = Number(spinConfig.max_daily_spins || 10);
  const activeSegments = Array.isArray(spinConfig.segments) && spinConfig.segments.length > 0
    ? spinConfig.segments
    : DEFAULT_SPIN_SEGMENTS;

  if (spinConfig.enabled === false) {
    return next(new AppError('Spin Wheel is temporarily paused for maintenance.', 400));
  }

  const { start, end } = getTodayRange();
  let spinsCompletedToday = 0;
  try {
    spinsCompletedToday = await UserSpin.count({
      where: {
        user_id: userId,
        created_at: { [Op.between]: [start, end] },
      },
    });
  } catch (_e) {}

  if (spinsCompletedToday >= maxDailySpins) {
    return next(
      new AppError(
        `Daily limit reached (${maxDailySpins}/${maxDailySpins}). Come back tomorrow!`,
        400
      )
    );
  }

  // 3. Weighted Random Selection for Winning Segment from Dynamic Config
  const totalWeight = activeSegments.reduce((sum, s) => sum + (Number(s.weight) || 1), 0);
  const randomVal = Math.random() * totalWeight;

  let cumulativeWeight = 0;
  let winningSegment = activeSegments[0];

  for (const segment of activeSegments) {
    cumulativeWeight += Number(segment.weight) || 1;
    if (randomVal <= cumulativeWeight) {
      winningSegment = segment;
      break;
    }
  }

  const rewardCredits = Number(winningSegment.credits) || 0;
  const sliceIndex = Number(winningSegment.id) || 0;
  const segmentLabel = winningSegment.label;

  // 4. Update Database in a Transaction
  let userRecord = null;
  let balanceAfter = 0;

  const t = await sequelize.transaction();
  try {
    userRecord = await User.findByPk(userId, { transaction: t, lock: true });
    if (!userRecord) {
      await t.rollback();
      return next(new AppError('User account not found.', 404));
    }

    balanceAfter = (userRecord.credit_balance || 0) + rewardCredits;
    const totalEarnedAfter = (userRecord.total_earned || 0) + rewardCredits;

    // Update user balance
    await userRecord.update(
      {
        credit_balance: balanceAfter,
        total_earned: totalEarnedAfter,
      },
      { transaction: t }
    );

    // Create UserSpin record
    const newSpin = await UserSpin.create(
      {
        user_id: userId,
        reward_credits: rewardCredits,
        segment_label: segmentLabel,
        slice_index: sliceIndex,
        ad_session_id: spinToken ? spinToken.slice(0, 16) : null,
      },
      { transaction: t }
    );

    // Create Transaction record
    await Transaction.create(
      {
        user_id: userId,
        type: 'credit',
        category: 'spin_wheel',
        amount: rewardCredits,
        balance_after: balanceAfter,
        description: `Lucky Spin Reward: Won ${rewardCredits} Credits (${segmentLabel})`,
        reference_id: newSpin.id,
      },
      { transaction: t }
    );

    await t.commit();
  } catch (dbErr) {
    await t.rollback();
    console.error('[SpinController] DB Transaction Error:', dbErr);
    return next(new AppError('Failed to process spin reward. Please try again.', 500));
  }

  // Invalidate Redis user session cache so frontend reflects new balance immediately
  await invalidateUserCache(userId);

  res.status(200).json({
    status: 'success',
    data: {
      sliceIndex,
      rewardCredits,
      segmentLabel,
      newBalance: balanceAfter,
      spinsCompletedToday: spinsCompletedToday + 1,
      spinsRemainingToday: Math.max(0, MAX_DAILY_SPINS - (spinsCompletedToday + 1)),
      message: `🎉 Congratulations! You won ${rewardCredits} Credits!`,
    },
  });
});
