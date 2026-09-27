const {
  getRechargePlans,
  redeemRecharge,
  getRechargeHistory,
} = require('../services/rechargeService');
const asyncHandler = require('../utils/asyncHandler');

// Available recharge plans
const getPlans = asyncHandler(async (req, res, _next) => {
  const { operator } = req.query;
  const data = getRechargePlans(operator);
  res.status(200).json({
    status: 'success',
    ...data,
  });
});

// Redeem credits for mobile recharge
const redeemCredits = asyncHandler(async (req, res, _next) => {
  const { mobileNumber, operator, planId } = req.body;
  const result = await redeemRecharge(req.user.id, { mobileNumber, operator, planId });
  res.status(200).json({
    status: 'success',
    message: 'Recharge request processed successfully! 🎉',
    recharge: result,
  });
});

// User recharge history
const getHistory = asyncHandler(async (req, res, _next) => {
  const history = await getRechargeHistory(req.user.id);
  res.status(200).json({
    status: 'success',
    count: history.length,
    history,
  });
});

module.exports = {
  getPlans,
  redeemCredits,
  getHistory,
};
