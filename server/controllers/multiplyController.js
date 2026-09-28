const { User, GameRoll, Transaction, sequelize } = require('../models');
const { invalidateUserCache } = require('../middleware/auth');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { inMemoryUsers } = require('./authController');
const { getMultiplySettings } = require('../services/settingService');

// In-memory fallback for degraded database mode
const inMemoryGameRolls = [];

/**
 * Execute a Multiply Credits HI-LO Roll
 * Number Range: 1 - 10000
 * Multiplier Game Rules:
 *   - Bet HI: Wins if roll > loss_zone_max
 *   - Bet LO: Wins if roll < loss_zone_min
 *   - Loss Zone: loss_zone_min - loss_zone_max (Always Loss for both HI and LO)
 */
exports.rollDice = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { bet_amount, bet_type } = req.body;

  // 1. Fetch dynamic settings
  const settings = await getMultiplySettings();
  if (settings.enabled === false) {
    return next(new AppError('The Multiplier game is temporarily paused for maintenance. Please check back shortly!', 403));
  }

  const minBet = settings.min_bet || 1;
  const maxBet = settings.max_bet || 500;

  // 2. Validation
  const bet = parseInt(bet_amount, 10);
  if (isNaN(bet) || bet < minBet) {
    return next(new AppError(`Bet amount must be at least ${minBet} credit(s).`, 400));
  }
  if (bet > maxBet) {
    return next(new AppError(`Bet amount cannot exceed ${maxBet} credits.`, 400));
  }

  const normalizedBetType = String(bet_type).toUpperCase();
  if (normalizedBetType !== 'HI' && normalizedBetType !== 'LO') {
    return next(new AppError('Invalid bet type. Must be "HI" or "LO".', 400));
  }

  // 2. Fetch latest user balance
  let userRecord = null;
  let isDbOnline = true;

  try {
    userRecord = await User.findByPk(userId);
  } catch (dbErr) {
    isDbOnline = false;
    console.warn('[MultiplyController] DB degraded mode, using in-memory user:', dbErr.message);
  }

  if (!userRecord) {
    userRecord = inMemoryUsers.find((u) => u.id === userId || String(u.id) === String(userId));
  }

  if (!userRecord) {
    return next(new AppError('User account not found.', 404));
  }

  if (userRecord.credit_balance < bet) {
    return next(
      new AppError(
        `Insufficient credits. You bet ${bet} credits, but your current balance is ${userRecord.credit_balance} credits.`,
        400
      )
    );
  }

  // 3. Roll RNG: 1 to 10000
  // Crypto-random or high-resolution Math.random
  const roll = Math.floor(Math.random() * 10000) + 1;

  // 4. Determine Outcome with Dynamic Loss Zone & Multiplier
  const lossZoneMin = settings.loss_zone_min !== undefined ? settings.loss_zone_min : 4500;
  const lossZoneMax = settings.loss_zone_max !== undefined ? settings.loss_zone_max : 5500;
  const inLossZone = roll >= lossZoneMin && roll <= lossZoneMax;
  let isWin = false;

  if (normalizedBetType === 'HI') {
    isWin = roll > lossZoneMax;
  } else if (normalizedBetType === 'LO') {
    isWin = roll < lossZoneMin;
  }

  // Multiplier payout (e.g. 2.0x)
  const multiplier = Number(settings.multiplier) || 2.0;
  const payout = isWin ? Math.round(bet * multiplier) : 0;
  const profit = isWin ? Math.round(bet * (multiplier - 1)) : -bet;
  const balanceAfter = userRecord.credit_balance + profit;

  const targetCondition = normalizedBetType === 'HI' ? `> ${lossZoneMax}` : `< ${lossZoneMin}`;

  // 5. Persist to Database or In-Memory
  let savedRoll = null;

  if (isDbOnline) {
    const t = await sequelize.transaction();
    try {
      // Deduct or add credits
      await User.update(
        { credit_balance: balanceAfter },
        { where: { id: userId }, transaction: t }
      );

      // Create GameRoll record
      savedRoll = await GameRoll.create(
        {
          user_id: userId,
          bet_amount: bet,
          bet_type: normalizedBetType,
          target_condition: targetCondition,
          roll_result: roll,
          multiplier,
          payout,
          profit,
          status: isWin ? 'won' : 'lost',
          in_loss_zone: inLossZone,
          balance_after: balanceAfter,
        },
        { transaction: t }
      );

      // Record transaction
      await Transaction.create(
        {
          user_id: userId,
          type: isWin ? 'credit' : 'debit',
          category: 'multiply_game',
          amount: Math.abs(profit),
          description: `Multiply HI-LO Roll #${roll} (${normalizedBetType}) - ${isWin ? `WON ${multiplier}X` : inLossZone ? `LOST (Dead Zone ${lossZoneMin}-${lossZoneMax})` : 'LOST'}`,
          reference_id: savedRoll.id,
        },
        { transaction: t }
      );

      await t.commit();
    } catch (err) {
      await t.rollback();
      console.warn('[MultiplyController] Transaction failed, falling back to in-memory:', err.message);
      isDbOnline = false;
    }
  }

  // Update in-memory user and roll record (for fallback & live sync)
  userRecord.credit_balance = balanceAfter;

  if (!savedRoll) {
    savedRoll = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      user_id: userId,
      bet_amount: bet,
      bet_type: normalizedBetType,
      target_condition: targetCondition,
      roll_result: roll,
      multiplier,
      payout,
      profit,
      status: isWin ? 'won' : 'lost',
      in_loss_zone: inLossZone,
      balance_after: balanceAfter,
      created_at: new Date().toISOString(),
      user_name: userRecord.full_name?.split(' ')[0] || 'Player',
    };
    inMemoryGameRolls.unshift(savedRoll);
    if (inMemoryGameRolls.length > 500) inMemoryGameRolls.pop();
  }

  // Invalidate cache so updated balance reflects immediately
  await invalidateUserCache(userId);

  // Return roll result to client
  res.status(200).json({
    status: 'success',
    data: {
      roll: {
        id: savedRoll.id,
        roll_result: roll,
        bet_type: normalizedBetType,
        bet_amount: bet,
        target_condition: targetCondition,
        status: isWin ? 'won' : 'lost',
        is_win: isWin,
        payout,
        profit,
        in_loss_zone: inLossZone,
        balance_after: balanceAfter,
        created_at: savedRoll.created_at || new Date().toISOString(),
      },
    },
  });
});

/**
 * Get User's Personal Roll History
 */
exports.getMyRolls = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  let rolls = [];

  try {
    rolls = await GameRoll.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: 30,
    });
  } catch (err) {
    console.warn('[MultiplyController] DB error fetching my rolls, using memory:', err.message);
    rolls = inMemoryGameRolls.filter((r) => r.user_id === userId).slice(0, 30);
  }

  res.status(200).json({
    status: 'success',
    data: {
      rolls,
    },
  });
});

/**
 * Get Live Recent Rolls (Simulated / Community Stream)
 */
exports.getLiveRolls = asyncHandler(async (req, res) => {
  let liveRolls = [];

  try {
    liveRolls = await GameRoll.findAll({
      order: [['created_at', 'DESC']],
      limit: 20,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'mobile'],
        },
      ],
    });

    liveRolls = liveRolls.map((r) => {
      const u = r.user;
      const firstName = u?.full_name ? u.full_name.split(' ')[0] : 'Player';
      const maskedPhone = u?.mobile ? `${u.mobile.slice(0, 3)}****${u.mobile.slice(-3)}` : 'User';
      return {
        id: r.id,
        user_display: `${firstName} (${maskedPhone})`,
        bet_amount: r.bet_amount,
        bet_type: r.bet_type,
        roll_result: r.roll_result,
        profit: r.profit,
        status: r.status,
        in_loss_zone: r.in_loss_zone,
        created_at: r.created_at,
      };
    });
  } catch (err) {
    // If DB is offline, take in-memory rolls or generate realistic community seeds
    liveRolls = inMemoryGameRolls.slice(0, 20).map((r) => ({
      id: r.id,
      user_display: r.user_name || 'Player (982****123)',
      bet_amount: r.bet_amount,
      bet_type: r.bet_type,
      roll_result: r.roll_result,
      profit: r.profit,
      status: r.status,
      in_loss_zone: r.in_loss_zone,
      created_at: r.created_at,
    }));
  }

  // If empty, generate a few authentic simulated recent bets
  if (liveRolls.length === 0) {
    const seedNames = ['Amit', 'Rahul', 'Pooja', 'Vikram', 'Anjali', 'Kunal', 'Deepak', 'Sneha'];
    liveRolls = Array.from({ length: 10 }).map((_, i) => {
      const fakeRoll = Math.floor(Math.random() * 10000) + 1;
      const fakeBetType = Math.random() > 0.5 ? 'HI' : 'LO';
      const fakeLossZone = fakeRoll >= 4500 && fakeRoll <= 5500;
      const fakeWin = fakeBetType === 'HI' ? fakeRoll > 5500 : fakeRoll < 4500;
      const fakeBet = [5, 10, 25, 50, 100][Math.floor(Math.random() * 5)];
      return {
        id: Date.now() - i * 45000,
        user_display: `${seedNames[i % seedNames.length]} (98${Math.floor(10 + Math.random() * 90)}****${Math.floor(100 + Math.random() * 900)})`,
        bet_amount: fakeBet,
        bet_type: fakeBetType,
        roll_result: fakeRoll,
        profit: fakeWin ? fakeBet : -fakeBet,
        status: fakeWin ? 'won' : 'lost',
        in_loss_zone: fakeLossZone,
        created_at: new Date(Date.now() - i * 45000).toISOString(),
      };
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      rolls: liveRolls,
    },
  });
});

/**
 * Get User Game Stats & 2-Day Promo Eligibility
 */
exports.getGameStats = asyncHandler(async (req, res) => {
  const user = req.user;
  const createdAt = user.created_at || user.createdAt || new Date();
  const accountAgeMs = Date.now() - new Date(createdAt).getTime();
  const accountAgeDays = accountAgeMs / (1000 * 60 * 60 * 24);

  // Eligible for aggressive promo after 2 days (48 hours)
  const isEligibleFor2DayPromo = accountAgeDays >= 2;

  let totalRolls = 0;
  let totalWon = 0;
  let totalLost = 0;
  let netProfit = 0;

  try {
    const userRolls = await GameRoll.findAll({
      where: { user_id: user.id },
      attributes: ['status', 'profit'],
    });

    totalRolls = userRolls.length;
    userRolls.forEach((r) => {
      if (r.status === 'won') totalWon++;
      else totalLost++;
      netProfit += r.profit;
    });
  } catch {
    const memRolls = inMemoryGameRolls.filter((r) => r.user_id === user.id);
    totalRolls = memRolls.length;
    memRolls.forEach((r) => {
      if (r.status === 'won') totalWon++;
      else totalLost++;
      netProfit += r.profit;
    });
  }

  const winRate = totalRolls > 0 ? ((totalWon / totalRolls) * 100).toFixed(1) : 0;

  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        total_rolls: totalRolls,
        total_won: totalWon,
        total_lost: totalLost,
        win_rate: Number(winRate),
        net_profit: netProfit,
        credit_balance: user.credit_balance || 0,
      },
      promo: {
        account_age_days: Number(accountAgeDays.toFixed(2)),
        is_eligible_for_2day_promo: isEligibleFor2DayPromo,
      },
    },
  });
});

module.exports.inMemoryGameRolls = inMemoryGameRolls;
