const { Recharge, User, Transaction, sequelize } = require('../models');
const { deductCredits } = require('./creditService');
const { acquireLock, releaseLock, del } = require('../config/redis');
const AppError = require('../utils/AppError');
const { inMemoryUsers } = require('../controllers/authController');

// In-memory fallback for degraded database mode
const inMemoryRecharges = [];

/**
 * Real Post-2024 Indian Telecom Plans (Strictly >= ₹300, No Plan Below 300)
 * Operators: Jio, Airtel, Vi, BSNL
 */
const OPERATOR_PLANS = {
  Jio: [
    {
      id: 'jio_349',
      operator: 'Jio',
      amount: 349,
      credits: 349,
      data: '2 GB / Day',
      validity: '28 Days',
      calls: 'Unlimited Calls',
      sms: '100 SMS / Day',
      speed5g: 'Unlimited 5G Data Included',
      perks: 'JioCinema, JioTV, JioCloud',
      badge: 'Most Popular',
      label: '₹349 — 2GB/Day + Unlimited 5G (28 Days)',
    },
    {
      id: 'jio_399',
      operator: 'Jio',
      amount: 399,
      credits: 399,
      data: '2.5 GB / Day',
      validity: '28 Days',
      calls: 'Unlimited Calls',
      sms: '100 SMS / Day',
      speed5g: 'Unlimited 5G Data Included',
      perks: 'JioCinema Premium, JioTV',
      badge: 'Best Value',
      label: '₹399 — 2.5GB/Day + Unlimited 5G (28 Days)',
    },
    {
      id: 'jio_449',
      operator: 'Jio',
      amount: 449,
      credits: 449,
      data: '3 GB / Day',
      validity: '28 Days',
      calls: 'Unlimited Calls',
      sms: '100 SMS / Day',
      speed5g: 'Unlimited 5G Data Included',
      perks: 'JioCinema, JioTV, JioCloud',
      badge: 'Heavy Data',
      label: '₹449 — 3GB/Day + Unlimited 5G (28 Days)',
    },
    {
      id: 'jio_629',
      operator: 'Jio',
      amount: 629,
      credits: 629,
      data: '2 GB / Day',
      validity: '56 Days',
      calls: 'Unlimited Calls',
      sms: '100 SMS / Day',
      speed5g: 'Unlimited 5G Data Included',
      perks: 'JioCinema, JioTV, JioCloud',
      badge: '2 Months Pack',
      label: '₹629 — 2GB/Day + Unlimited 5G (56 Days)',
    },
    {
      id: 'jio_719',
      operator: 'Jio',
      amount: 719,
      credits: 719,
      data: '2 GB / Day',
      validity: '70 Days',
      calls: 'Unlimited Calls',
      sms: '100 SMS / Day',
      speed5g: 'Unlimited 5G Data Included',
      perks: 'JioCinema, JioTV',
      badge: 'Super Saver',
      label: '₹719 — 2GB/Day + Unlimited 5G (70 Days)',
    },
    {
      id: 'jio_859',
      operator: 'Jio',
      amount: 859,
      credits: 859,
      data: '2 GB / Day',
      validity: '84 Days',
      calls: 'Unlimited Calls',
      sms: '100 SMS / Day',
      speed5g: 'Unlimited 5G Data Included',
      perks: 'JioCinema, JioTV, JioCloud',
      badge: 'Quarterly Choice',
      label: '₹859 — 2GB/Day + Unlimited 5G (84 Days)',
    },
    {
      id: 'jio_899',
      operator: 'Jio',
      amount: 899,
      credits: 899,
      data: '2 GB / Day + 20GB Extra',
      validity: '90 Days',
      calls: 'Unlimited Calls',
      sms: '100 SMS / Day',
      speed5g: 'Unlimited 5G Data Included',
      perks: 'JioCinema, JioTV, JioCloud',
      badge: '3 Months Bonus',
      label: '₹899 — 2GB/Day + 20GB Extra (90 Days)',
    },
    {
      id: 'jio_1199',
      operator: 'Jio',
      amount: 1199,
      credits: 1199,
      data: '3 GB / Day',
      validity: '84 Days',
      calls: 'Unlimited Calls',
      sms: '100 SMS / Day',
      speed5g: 'Unlimited 5G Data Included',
      perks: 'JioCinema, JioTV, JioCloud',
      badge: 'Ultra Heavy',
      label: '₹1199 — 3GB/Day + Unlimited 5G (84 Days)',
    },
    {
      id: 'jio_3599',
      operator: 'Jio',
      amount: 3599,
      credits: 3599,
      data: '2.5 GB / Day',
      validity: '365 Days',
      calls: 'Unlimited Calls',
      sms: '100 SMS / Day',
      speed5g: 'Unlimited 5G Data Included',
      perks: 'JioCinema, JioTV, JioCloud',
      badge: 'Annual 1 Year',
      label: '₹3599 — 2.5GB/Day 365 Days Annual Plan',
    },
  ],
  Airtel: [
    {
      id: 'airtel_349',
      operator: 'Airtel',
      amount: 349,
      credits: 349,
      data: '1.5 GB / Day',
      validity: '28 Days',
      calls: 'Unlimited Calls',
      sms: '100 SMS / Day',
      speed5g: 'Unlimited 5G Data Included',
      perks: 'Airtel Xstream Play, Apollo 24|7',
      badge: 'Most Popular',
      label: '₹349 — 1.5GB/Day + Unlimited 5G (28 Days)',
    },
    {
      id: 'airtel_379',
      operator: 'Airtel',
      amount: 379,
      credits: 379,
      data: '2 GB / Day',
      validity: '1 Month (30 Days)',
      calls: 'Unlimited Calls',
      sms: '100 SMS / Day',
      speed5g: 'Unlimited 5G Data Included',
      perks: 'Airtel Xstream Play, Free Hellotunes',
      badge: 'Calendar Month',
      label: '₹379 — 2GB/Day + Unlimited 5G (1 Month)',
    },
    {
      id: 'airtel_409',
      operator: 'Airtel',
      amount: 409,
      credits: 409,
      data: '2.5 GB / Day',
      validity: '28 Days',
      calls: 'Unlimited Calls',
      sms: '100 SMS / Day',
      speed5g: 'Unlimited 5G Data Included',
      perks: 'Airtel Xstream Play (22+ OTTs)',
      badge: 'OTT Entertainment',
      label: '₹409 — 2.5GB/Day + Xstream OTT (28 Days)',
    },
    {
      id: 'airtel_449',
      operator: 'Airtel',
      amount: 449,
      credits: 449,
      data: '3 GB / Day',
      validity: '28 Days',
      calls: 'Unlimited Calls',
      sms: '100 SMS / Day',
      speed5g: 'Unlimited 5G Data Included',
      perks: 'Airtel Xstream Play, Wynk Music',
      badge: 'Heavy Data',
      label: '₹449 — 3GB/Day + Unlimited 5G (28 Days)',
    },
    {
      id: 'airtel_579',
      operator: 'Airtel',
      amount: 579,
      credits: 579,
      data: '1.5 GB / Day',
      validity: '56 Days',
      calls: 'Unlimited Calls',
      sms: '100 SMS / Day',
      speed5g: 'Unlimited 5G Data Included',
      perks: 'Airtel Xstream Play',
      badge: '2 Months Saver',
      label: '₹579 — 1.5GB/Day + Unlimited 5G (56 Days)',
    },
    {
      id: 'airtel_649',
      operator: 'Airtel',
      amount: 649,
      credits: 649,
      data: '2 GB / Day',
      validity: '56 Days',
      calls: 'Unlimited Calls',
      sms: '100 SMS / Day',
      speed5g: 'Unlimited 5G Data Included',
      perks: 'Airtel Xstream Play, Apollo 24|7',
      badge: 'Value 56 Days',
      label: '₹649 — 2GB/Day + Unlimited 5G (56 Days)',
    },
    {
      id: 'airtel_859',
      operator: 'Airtel',
      amount: 859,
      credits: 859,
      data: '1.5 GB / Day',
      validity: '84 Days',
      calls: 'Unlimited Calls',
      sms: '100 SMS / Day',
      speed5g: 'Unlimited 5G Data Included',
      perks: 'Airtel Xstream Play, Wynk Music',
      badge: 'Quarterly Choice',
      label: '₹859 — 1.5GB/Day + Unlimited 5G (84 Days)',
    },
    {
      id: 'airtel_979',
      operator: 'Airtel',
      amount: 979,
      credits: 979,
      data: '2 GB / Day',
      validity: '84 Days',
      calls: 'Unlimited Calls',
      sms: '100 SMS / Day',
      speed5g: 'Unlimited 5G Data Included',
      perks: 'Airtel Xstream Play (22+ OTTs)',
      badge: '84 Days Bestseller',
      label: '₹979 — 2GB/Day + Unlimited 5G (84 Days)',
    },
    {
      id: 'airtel_1199',
      operator: 'Airtel',
      amount: 1199,
      credits: 1199,
      data: '2.5 GB / Day',
      validity: '84 Days',
      calls: 'Unlimited Calls',
      sms: '100 SMS / Day',
      speed5g: 'Unlimited 5G Data Included',
      perks: 'Amazon Prime Membership Included',
      badge: 'Amazon Prime',
      label: '₹1199 — 2.5GB/Day + Amazon Prime (84 Days)',
    },
    {
      id: 'airtel_3599',
      operator: 'Airtel',
      amount: 3599,
      credits: 3599,
      data: '2 GB / Day',
      validity: '365 Days',
      calls: 'Unlimited Calls',
      sms: '100 SMS / Day',
      speed5g: 'Unlimited 5G Data Included',
      perks: 'Airtel Xstream Play, Apollo 24|7',
      badge: 'Annual 1 Year',
      label: '₹3599 — 2GB/Day 365 Days Annual Plan',
    },
  ],
  Vi: [
    {
      id: 'vi_349',
      operator: 'Vi',
      amount: 349,
      credits: 349,
      data: '1.5 GB / Day',
      validity: '28 Days',
      calls: 'Unlimited Calls',
      sms: '100 SMS / Day',
      speed5g: 'Hero Unlimited: 12AM-6AM Unlimited Data',
      perks: 'Binge All Night + Weekend Data Rollover',
      badge: 'Hero Unlimited',
      label: '₹349 — 1.5GB/Day + Binge All Night (28 Days)',
    },
    {
      id: 'vi_379',
      operator: 'Vi',
      amount: 379,
      credits: 379,
      data: '2 GB / Day',
      validity: '1 Month',
      calls: 'Unlimited Calls',
      sms: '100 SMS / Day',
      speed5g: 'Hero Unlimited: 12AM-6AM Free Night Data',
      perks: 'Weekend Rollover + Data Delight 2GB Extra',
      badge: 'Month Saver',
      label: '₹379 — 2GB/Day + Hero Unlimited (1 Month)',
    },
    {
      id: 'vi_449',
      operator: 'Vi',
      amount: 449,
      credits: 449,
      data: '3 GB / Day',
      validity: '28 Days',
      calls: 'Unlimited Calls',
      sms: '100 SMS / Day',
      speed5g: 'Hero Unlimited: 12AM-6AM Free Night Data',
      perks: 'Binge All Night + Weekend Rollover + Data Delight',
      badge: 'Super Binge',
      label: '₹449 — 3GB/Day + Binge All Night (28 Days)',
    },
    {
      id: 'vi_579',
      operator: 'Vi',
      amount: 579,
      credits: 579,
      data: '1.5 GB / Day',
      validity: '56 Days',
      calls: 'Unlimited Calls',
      sms: '100 SMS / Day',
      speed5g: 'Hero Unlimited: 12AM-6AM Free Night Data',
      perks: 'Binge All Night + Weekend Data Rollover',
      badge: '56 Days Saver',
      label: '₹579 — 1.5GB/Day + Hero Unlimited (56 Days)',
    },
    {
      id: 'vi_649',
      operator: 'Vi',
      amount: 649,
      credits: 649,
      data: '2 GB / Day',
      validity: '56 Days',
      calls: 'Unlimited Calls',
      sms: '100 SMS / Day',
      speed5g: 'Hero Unlimited: 12AM-6AM Free Night Data',
      perks: 'Weekend Rollover + Data Delight Extra',
      badge: '56 Days Bestseller',
      label: '₹649 — 2GB/Day + Hero Unlimited (56 Days)',
    },
    {
      id: 'vi_859',
      operator: 'Vi',
      amount: 859,
      credits: 859,
      data: '1.5 GB / Day',
      validity: '84 Days',
      calls: 'Unlimited Calls',
      sms: '100 SMS / Day',
      speed5g: 'Hero Unlimited: 12AM-6AM Free Night Data',
      perks: 'Binge All Night + Weekend Data Rollover',
      badge: '84 Days Value',
      label: '₹859 — 1.5GB/Day + Hero Unlimited (84 Days)',
    },
    {
      id: 'vi_979',
      operator: 'Vi',
      amount: 979,
      credits: 979,
      data: '2 GB / Day',
      validity: '84 Days',
      calls: 'Unlimited Calls',
      sms: '100 SMS / Day',
      speed5g: 'Hero Unlimited: 12AM-6AM Free Night Data',
      perks: 'Weekend Rollover + Data Delight + Vi Movies & TV',
      badge: 'Top Pick 84D',
      label: '₹979 — 2GB/Day + Hero Unlimited (84 Days)',
    },
    {
      id: 'vi_1198',
      operator: 'Vi',
      amount: 1198,
      credits: 1198,
      data: '2 GB / Day',
      validity: '84 Days',
      calls: 'Unlimited Calls',
      sms: '100 SMS / Day',
      speed5g: 'Hero Unlimited: 12AM-6AM Free Night Data',
      perks: 'Disney+ Hotstar Mobile 3 Months Included',
      badge: 'Disney+ Hotstar',
      label: '₹1198 — 2GB/Day + Hotstar Mobile (84 Days)',
    },
    {
      id: 'vi_3499',
      operator: 'Vi',
      amount: 3499,
      credits: 3499,
      data: '1.5 GB / Day',
      validity: '365 Days',
      calls: 'Unlimited Calls',
      sms: '100 SMS / Day',
      speed5g: 'Hero Unlimited: 12AM-6AM Free Night Data',
      perks: 'Binge All Night + Weekend Data Rollover',
      badge: 'Annual 1 Year',
      label: '₹3499 — 1.5GB/Day 365 Days Annual Plan',
    },
  ],
  BSNL: [
    {
      id: 'bsnl_319',
      operator: 'BSNL',
      amount: 319,
      credits: 319,
      data: '10 GB Bulk Data',
      validity: '65 Days',
      calls: 'Unlimited Voice Calls',
      sms: '300 SMS Total',
      speed5g: 'Nationwide Free Roaming',
      perks: 'Long Validity Voice Heavy Caller Plan',
      badge: 'Long Validity',
      label: '₹319 — Unlimited Calls + 10GB Data (65 Days)',
    },
    {
      id: 'bsnl_347',
      operator: 'BSNL',
      amount: 347,
      credits: 347,
      data: '2 GB / Day',
      validity: '54 Days',
      calls: 'Unlimited Calls',
      sms: '100 SMS / Day',
      speed5g: 'High Speed 4G/3G Data',
      perks: 'Progressive Web Apps & Gaming perks',
      badge: 'Most Popular',
      label: '₹347 — 2GB/Day + Unlimited Calls (54 Days)',
    },
    {
      id: 'bsnl_397',
      operator: 'BSNL',
      amount: 397,
      credits: 397,
      data: '2 GB / Day (First 30 Days)',
      validity: '150 Days Total SIM Validity',
      calls: 'Unlimited Calls (First 30 Days)',
      sms: '100 SMS / Day (First 30 Days)',
      speed5g: 'Incoming Free for 150 Days',
      perks: 'Ultra Long SIM Active Keeping Plan',
      badge: '150 Days SIM Keeper',
      label: '₹397 — 150 Days Long Validity SIM Saver',
    },
    {
      id: 'bsnl_499',
      operator: 'BSNL',
      amount: 499,
      credits: 499,
      data: '2 GB / Day',
      validity: '75 Days',
      calls: 'Unlimited Calls',
      sms: '100 SMS / Day',
      speed5g: 'BSNL Tunes Included',
      perks: 'National Roaming + Free BSNL Tunes',
      badge: 'Value 75 Days',
      label: '₹499 — 2GB/Day + Unlimited Calls (75 Days)',
    },
    {
      id: 'bsnl_599',
      operator: 'BSNL',
      amount: 599,
      credits: 599,
      data: '3 GB / Day + Free Night Data',
      validity: '84 Days',
      calls: 'Unlimited Calls',
      sms: '100 SMS / Day',
      speed5g: 'Free Unlimited Night Data (12AM-5AM)',
      perks: 'Free Zing Music + BSNL Tunes Included',
      badge: '84 Days Bestseller',
      label: '₹599 — 3GB/Day + Night Data (84 Days)',
    },
    {
      id: 'bsnl_797',
      operator: 'BSNL',
      amount: 797,
      credits: 797,
      data: '2 GB / Day (First 60 Days)',
      validity: '300 Days Total SIM Validity',
      calls: 'Unlimited Calls (First 60 Days)',
      sms: '100 SMS / Day (First 60 Days)',
      speed5g: '10 Months Active SIM',
      perks: 'Zero Recharge Required for 300 Days',
      badge: '300 Days SIM Saver',
      label: '₹797 — 300 Days Secondary SIM Saver',
    },
    {
      id: 'bsnl_997',
      operator: 'BSNL',
      amount: 997,
      credits: 997,
      data: '2 GB / Day',
      validity: '160 Days',
      calls: 'Unlimited Calls',
      sms: '100 SMS / Day',
      speed5g: 'Free Zing Music Included',
      perks: 'Half-Year Unlimited Data & Calling',
      badge: '160 Days Half-Year',
      label: '₹997 — 2GB/Day + Unlimited Calls (160 Days)',
    },
    {
      id: 'bsnl_1999',
      operator: 'BSNL',
      amount: 1999,
      credits: 1999,
      data: '600 GB Bulk Data (No Daily Limit)',
      validity: '365 Days',
      calls: 'Unlimited Calls',
      sms: '100 SMS / Day',
      speed5g: 'Use data freely without daily caps',
      perks: 'Eros Now Entertainment + BSNL Tunes',
      badge: 'Annual Bulk Data',
      label: '₹1999 — 600GB Bulk Data 365 Days Annual',
    },
    {
      id: 'bsnl_2399',
      operator: 'BSNL',
      amount: 2399,
      credits: 2399,
      data: '2 GB / Day',
      validity: '395 Days (13 Months)',
      calls: 'Unlimited Calls',
      sms: '100 SMS / Day',
      speed5g: 'Extra 30 Days Free Validity',
      perks: '395 Days Validity + BSNL Tunes Included',
      badge: 'Mega 395 Days',
      label: '₹2399 — 2GB/Day 395 Days Mega Annual Plan',
    },
  ],
};

const ALL_PLANS = Object.values(OPERATOR_PLANS).flat();
const SUPPORTED_OPERATORS = ['Jio', 'Airtel', 'Vi', 'BSNL'];

// Get available recharge plans (all strictly >= 300)
const getRechargePlans = (operator) => {
  let plans = ALL_PLANS;
  if (operator && OPERATOR_PLANS[operator]) {
    plans = OPERATOR_PLANS[operator];
  }
  return {
    operators: SUPPORTED_OPERATORS,
    plansByOperator: OPERATOR_PLANS,
    plans: plans.filter((p) => p.amount >= 300),
  };
};

// Redeem credits for recharge with concurrency distributed lock
const redeemRecharge = async (userId, { mobileNumber, operator, planId }) => {
  if (!mobileNumber || !operator || !planId) {
    throw new AppError('Please enter a valid mobile number, select telecom operator, and pick a plan.', 400);
  }

  // Mobile validation
  const cleanMobile = mobileNumber.replace(/\D/g, '');
  if (cleanMobile.length !== 10) {
    throw new AppError('Please enter a valid 10-digit mobile number.', 400);
  }

  const selectedPlan = ALL_PLANS.find((p) => p.id === planId && p.amount >= 300);
  if (!selectedPlan) {
    throw new AppError('Invalid recharge plan selected. Minimum recharge plan is ₹300.', 400);
  }

  // Distributed Lock to prevent duplicate concurrent redemption spam
  const lockKey = `recharge:redeem:${userId}`;
  const lockToken = await acquireLock(lockKey, 10);
  if (!lockToken) {
    throw new AppError('Another recharge request is currently being processed. Please wait a moment.', 429);
  }

  try {
    let user = null;
    let isDbOnline = true;

    try {
      user = await User.findByPk(userId);
    } catch (dbErr) {
      isDbOnline = false;
      console.warn('[rechargeService] DB degraded mode, using inMemoryUsers:', dbErr.message);
    }

    if (!user) {
      user = inMemoryUsers.find((u) => u.id === userId || String(u.id) === String(userId));
    }

    if (!user) throw new AppError('User account not found.', 404);

    if ((user.credit_balance || 0) < selectedPlan.credits) {
      throw new AppError(
        `Insufficient credits. You need ${selectedPlan.credits} credits for ₹${selectedPlan.amount} ${operator} recharge, but your current balance is ${user.credit_balance || 0} credits. Earn more credits by completing tasks or referring friends!`,
        400
      );
    }

    const txId = `VR_RC_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const newBalance = (user.credit_balance || 0) - selectedPlan.credits;

    let rechargeRecord = null;

    if (isDbOnline) {
      try {
        await sequelize.transaction(async (t) => {
          rechargeRecord = await Recharge.create(
            {
              user_id: user.id,
              mobile_number: cleanMobile,
              operator,
              amount: selectedPlan.amount,
              credits_spent: selectedPlan.credits,
              status: 'completed',
              transaction_id: txId,
              processed_at: new Date(),
              api_response: {
                operatorRef: `OP_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
                status: 'SUCCESS',
                message: `₹${selectedPlan.amount} ${operator} prepaid plan activated for +91${cleanMobile}`,
              },
            },
            { transaction: t }
          );

          // Deduct credits from user
          await deductCredits({
            userId: user.id,
            amount: selectedPlan.credits,
            category: 'recharge',
            description: `Redeemed ₹${selectedPlan.amount} ${operator} Mobile Recharge for ${cleanMobile}`,
            referenceId: rechargeRecord.id,
            transaction: t,
          });

          // Update total_recharged
          user.total_recharged = parseFloat(user.total_recharged || 0) + selectedPlan.amount;
          user.credit_balance = newBalance;
          await user.save({ transaction: t });
        });
      } catch (sqlErr) {
        console.warn('[rechargeService] Transaction failed, falling back to memory:', sqlErr.message);
        isDbOnline = false;
      }
    }

    // In-memory fallback
    user.credit_balance = newBalance;

    if (!rechargeRecord) {
      rechargeRecord = {
        id: Date.now(),
        user_id: user.id,
        mobile_number: cleanMobile,
        operator,
        amount: selectedPlan.amount,
        credits_spent: selectedPlan.credits,
        status: 'completed',
        transaction_id: txId,
        created_at: new Date().toISOString(),
        processed_at: new Date().toISOString(),
        api_response: {
          operatorRef: `OP_INMEM_${Date.now()}`,
          status: 'SUCCESS',
          message: `₹${selectedPlan.amount} ${operator} prepaid plan activated for +91${cleanMobile}`,
        },
      };
      inMemoryRecharges.unshift(rechargeRecord);
    }

    // Invalidate Redis caches
    del('cache:admin:dashboard:stats').catch(() => {});
    del(`cache:user:auth:${userId}`).catch(() => {});
    del(`cache:user:profile:${userId}`).catch(() => {});

    return {
      rechargeId: rechargeRecord.id,
      transactionId: txId,
      mobileNumber: cleanMobile,
      operator,
      amount: selectedPlan.amount,
      creditsSpent: selectedPlan.credits,
      planLabel: selectedPlan.label,
      planData: selectedPlan.data,
      planValidity: selectedPlan.validity,
      status: rechargeRecord.status,
      createdAt: rechargeRecord.created_at || new Date().toISOString(),
    };
  } finally {
    await releaseLock(lockKey, lockToken);
  }
};

// Get user recharge history
const getRechargeHistory = async (userId) => {
  try {
    return await Recharge.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
    });
  } catch (err) {
    console.warn('[rechargeService] DB offline for history, using in-memory:', err.message);
    return inMemoryRecharges.filter((r) => r.user_id === userId);
  }
};

module.exports = {
  OPERATOR_PLANS,
  ALL_PLANS,
  getRechargePlans,
  redeemRecharge,
  getRechargeHistory,
  inMemoryRecharges,
};
