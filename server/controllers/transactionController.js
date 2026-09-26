const { Transaction, sequelize } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

// Get user transaction history with category filter & pagination
const getTransactions = asyncHandler(async (req, res, _next) => {
  const { category, type, limit = 20, page = 1 } = req.query;

  const where = { user_id: req.user.id };
  if (category) where.category = category;
  if (type) where.type = type;

  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const { count, rows } = await Transaction.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit: parseInt(limit, 10),
    offset,
  });

  res.status(200).json({
    status: 'success',
    totalRecords: count,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page, 10),
    transactions: rows,
  });
});

// Get user earnings summary by category
const getSummary = asyncHandler(async (req, res, _next) => {
  const [summary] = await sequelize.query(`
    SELECT 
      category, 
      SUM(amount) AS total_amount,
      COUNT(id) AS count
    FROM transactions
    WHERE user_id = ${req.user.id} AND type = 'credit'
    GROUP BY category
  `);

  res.status(200).json({
    status: 'success',
    summary,
  });
});

module.exports = {
  getTransactions,
  getSummary,
};
