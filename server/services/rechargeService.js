const { Recharge, User, sequelize } = require('../models');
const { deductCredits } = require('./creditService');
const AppError = require('../utils/AppError');

const RECHARGE_PLANS = [
  { id: 'plan_10', amount: 10, credits: 200, label: '₹10 Talktime' },
  { id: 'plan_20', amount: 20, credits: 380, label: '₹20 Top-up (5% discount)' },
  { id: 'plan_50', amount: 50, credits: 900, label: '₹50 Standard Recharge (10% discount)' },
  { id: 'plan_100', amount: 100, credits: 1700, label: '₹100 Mega Recharge (15% discount)' },
];

const SUPPORTED_OPERATORS = ['Jio', 'Airtel', 'Vi (Vodafone Idea)', 'BSNL'];

// Get available recharge plans
const getRechargePlans = () => {
  return {
    operators: SUPPORTED_OPERATORS,
    plans: RECHARGE_PLANS,
  };
};

// Redeem credits for recharge
const redeemRecharge = async (userId, { mobileNumber, operator, planId }) => {
  if (!mobileNumber || !operator || !planId) {
    throw new AppError('Please provide mobile number, operator, and select a recharge plan.', 400);
  }

  // Mobile validation
  const cleanMobile = mobileNumber.replace(/\D/g, '');
  if (cleanMobile.length !== 10) {
    throw new AppError('Please enter a valid 10-digit mobile number.', 400);
  }

  const selectedPlan = RECHARGE_PLANS.find((p) => p.id === planId);
  if (!selectedPlan) {
    throw new AppError('Invalid recharge plan selected.', 400);
  }

  const user = await User.findByPk(userId);
  if (!user) throw new AppError('User not found.', 404);

  if (user.credit_balance < selectedPlan.credits) {
    throw new AppError(
      `Insufficient credits. You need ${selectedPlan.credits} credits for ₹${selectedPlan.amount} recharge, but you only have ${user.credit_balance} credits. Complete more tasks or invite friends!`,
      400
    );
  }

  const txId = `VR_RC_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

  let recharge;
  await sequelize.transaction(async (t) => {
    recharge = await Recharge.create(
      {
        user_id: user.id,
        mobile_number: cleanMobile,
        operator,
        amount: selectedPlan.amount,
        credits_spent: selectedPlan.credits,
        status: 'completed', // Auto-completed simulation for instant user satisfaction
        transaction_id: txId,
        processed_at: new Date(),
        api_response: {
          operatorRef: `OP_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          status: 'SUCCESS',
          message: 'Mobile recharge processed successfully.',
        },
      },
      { transaction: t }
    );

    // Deduct credits from user
    await deductCredits({
      userId: user.id,
      amount: selectedPlan.credits,
      category: 'recharge',
      description: `Redeemed for ₹${selectedPlan.amount} ${operator} Mobile Recharge (${cleanMobile})`,
      referenceId: recharge.id,
      transaction: t,
    });

    // Update total_recharged
    user.total_recharged = parseFloat(user.total_recharged || 0) + selectedPlan.amount;
    await user.save({ transaction: t });
  });

  return {
    rechargeId: recharge.id,
    transactionId: txId,
    mobileNumber: cleanMobile,
    operator,
    amount: selectedPlan.amount,
    creditsSpent: selectedPlan.credits,
    status: recharge.status,
    createdAt: recharge.created_at,
  };
};

// Get user recharge history
const getRechargeHistory = async (userId) => {
  return await Recharge.findAll({
    where: { user_id: userId },
    order: [['created_at', 'DESC']],
  });
};

module.exports = {
  getRechargePlans,
  redeemRecharge,
  getRechargeHistory,
};
