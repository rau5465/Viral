const {
  User,
  Task,
  Recharge,
  Transaction,
  Announcement,
  AdminLog,
  TaskCompletion,
  sequelize,
} = require('../models');
const { awardCredits, deductCredits } = require('../services/creditService');
const { invalidateUserCache } = require('../middleware/auth');
const { invalidateTasksCache, bumpTasksVersion } = require('../services/taskService');
const { invalidateAnnouncementsCache } = require('../services/announcementService');
const activeUserService = require('../services/activeUserService');
const { getOrSet, del } = require('../config/redis');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// Helper to log admin actions
const logAdminAction = async (adminId, action, targetType, targetId, details = {}) => {
  try {
    await AdminLog.create({
      admin_id: adminId,
      action,
      target_type: targetType,
      target_id: targetId,
      details,
    });
  } catch (err) {
    console.error('Failed to log admin action:', err.message);
  }
};

// 4.2 Admin Dashboard Stats (Cached in Redis for 30s)
const getDashboardStats = asyncHandler(async (req, res, _next) => {
  const stats = await getOrSet(
    'cache:admin:dashboard:stats',
    async () => {
      const totalUsers = await User.count({ where: { role: 'user' } });
      const bannedUsers = await User.count({ where: { is_banned: true } });
      const totalTasks = await Task.count();
      const activeTasks = await Task.count({ where: { is_active: true } });
      const totalCompletions = await TaskCompletion.count({ where: { status: 'completed' } });

      const totalCreditsDistributed =
        (await Transaction.sum('amount', {
          where: { type: 'credit' },
        })) || 0;

      const totalRechargeAmount =
        (await Recharge.sum('amount', {
          where: { status: 'completed' },
        })) || 0;

      const pendingRecharges = await Recharge.count({
        where: { status: 'pending' },
      });

      return {
        totalUsers,
        bannedUsers,
        totalTasks,
        activeTasks,
        totalCompletions,
        totalCreditsDistributed,
        totalRechargeAmount,
        pendingRecharges,
      };
    },
    30
  );

  // Real-time live active users (computed instantly from Redis / Memory with zero database hit)
  const liveStats = await activeUserService.getCurrentLiveStats();

  res.status(200).json({
    status: 'success',
    stats: {
      ...stats,
      liveUsers: liveStats.totalLive,
      liveAuthenticated: liveStats.authenticated,
      liveGuests: liveStats.guests,
    },
  });
});

// 4.3 User Management
const getUsers = asyncHandler(async (req, res, _next) => {
  const { search, level, role, is_banned, page = 1, limit = 20 } = req.query;

  const where = {};
  if (level) where.level = level;
  if (role) where.role = role;
  if (is_banned !== undefined) where.is_banned = is_banned === 'true';

  if (search) {
    where[sequelize.Sequelize.Op.or] = [
      { full_name: { [sequelize.Sequelize.Op.like]: `%${search}%` } },
      { email: { [sequelize.Sequelize.Op.like]: `%${search}%` } },
      { mobile: { [sequelize.Sequelize.Op.like]: `%${search}%` } },
      { referral_code: { [sequelize.Sequelize.Op.like]: `%${search}%` } },
    ];
  }

  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const { count, rows } = await User.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit: parseInt(limit, 10),
    offset,
  });

  res.status(200).json({
    status: 'success',
    totalUsers: count,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page, 10),
    users: rows,
  });
});

const updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { is_banned, role, credit_adjustment, reason } = req.body;

  const user = await User.findByPk(id);
  if (!user) return next(new AppError('User not found.', 404));

  if (is_banned !== undefined) {
    user.is_banned = is_banned;
    await logAdminAction(req.user.id, is_banned ? 'BAN_USER' : 'UNBAN_USER', 'user', user.id, {
      reason,
    });
  }

  if (role) {
    user.role = role;
    await logAdminAction(req.user.id, 'CHANGE_ROLE', 'user', user.id, { newRole: role });
  }

  // Admin credit adjustment (+ or -)
  if (credit_adjustment && parseInt(credit_adjustment, 10) !== 0) {
    const adj = parseInt(credit_adjustment, 10);
    if (adj > 0) {
      await awardCredits({
        userId: user.id,
        amount: adj,
        category: 'adjustment',
        description: `Admin Adjustment: ${reason || 'Manual credit grant'}`,
        referenceId: req.user.id,
      });
    } else {
      await deductCredits({
        userId: user.id,
        amount: Math.abs(adj),
        category: 'adjustment',
        description: `Admin Deduction: ${reason || 'Manual penalty'}`,
        referenceId: req.user.id,
      });
    }

    await logAdminAction(req.user.id, 'ADJUST_CREDITS', 'user', user.id, {
      amount: adj,
      reason,
    });
  }

  await user.save();
  await invalidateUserCache(user.id);
  del('cache:admin:dashboard:stats').catch(() => {});

  res.status(200).json({
    status: 'success',
    message: 'User updated successfully.',
    user: user.toJSON(),
  });
});

// 4.4 Task Management (CRUD)
const getAllTasks = asyncHandler(async (req, res, _next) => {
  const tasks = await Task.findAll({ order: [['created_at', 'DESC']] });
  res.status(200).json({ status: 'success', count: tasks.length, tasks });
});

const createTask = asyncHandler(async (req, res, next) => {
  const {
    title,
    description,
    type,
    url,
    instructions,
    credits_reward,
    duration_seconds,
    daily_limit,
    is_active,
  } = req.body;

  if (!title || !type || !url || credits_reward === undefined) {
    return next(new AppError('Title, type, url, and credits_reward are required.', 400));
  }

  const task = await Task.create({
    title,
    description,
    type,
    url,
    instructions,
    credits_reward: parseInt(credits_reward, 10),
    duration_seconds: parseInt(duration_seconds, 10) || 0,
    daily_limit: parseInt(daily_limit, 10) || 0,
    is_active: is_active !== undefined ? is_active : true,
    created_by: req.user.id,
  });

  await logAdminAction(req.user.id, 'CREATE_TASK', 'task', task.id, { title: task.title });
  await invalidateTasksCache();
  del('cache:admin:dashboard:stats').catch(() => {});

  res.status(201).json({ status: 'success', task });
});

const updateTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findByPk(req.params.id);
  if (!task) return next(new AppError('Task not found.', 404));

  await task.update(req.body);
  await logAdminAction(req.user.id, 'UPDATE_TASK', 'task', task.id, req.body);
  await invalidateTasksCache();
  del('cache:admin:dashboard:stats').catch(() => {});

  res.status(200).json({ status: 'success', task });
});

const deleteTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findByPk(req.params.id);
  if (!task) return next(new AppError('Task not found.', 404));

  const taskId = task.id;
  await task.destroy();
  await logAdminAction(req.user.id, 'DELETE_TASK', 'task', taskId, { title: task.title });
  await invalidateTasksCache();
  del('cache:admin:dashboard:stats').catch(() => {});

  res.status(200).json({ status: 'success', message: 'Task deleted successfully.' });
});

// Force purge task catalog cache and bump version for all mobile clients
const clearTasksCache = asyncHandler(async (req, res, _next) => {
  const newVersion = await bumpTasksVersion();
  await logAdminAction(req.user.id, 'CLEAR_TASKS_CACHE', 'system', 0, { newVersion });
  res.status(200).json({
    status: 'success',
    message: 'Task catalog cache purged and version bumped. All mobile clients will refresh tasks.',
    version: newVersion,
  });
});

// 4.5 Recharge Management
const getAdminRecharges = asyncHandler(async (req, res, _next) => {
  const { status, page = 1, limit = 20 } = req.query;
  const where = {};
  if (status) where.status = status;

  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const { count, rows } = await Recharge.findAndCountAll({
    where,
    include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'mobile', 'email'] }],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit, 10),
    offset,
  });

  res.status(200).json({
    status: 'success',
    totalRecharges: count,
    totalPages: Math.ceil(count / limit),
    recharges: rows,
  });
});

const updateRechargeStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status, rejectionReason } = req.body;

  const recharge = await Recharge.findByPk(id, {
    include: [{ model: User, as: 'user' }],
  });

  if (!recharge) return next(new AppError('Recharge record not found.', 404));

  const oldStatus = recharge.status;
  recharge.status = status;

  if (status === 'completed') {
    recharge.processed_at = new Date();
  } else if (status === 'failed' && oldStatus !== 'failed') {
    // Refund credits to user
    await awardCredits({
      userId: recharge.user_id,
      amount: recharge.credits_spent,
      category: 'adjustment',
      description: `Refund for failed recharge (#${recharge.id}): ${rejectionReason || 'Processing error'}`,
      referenceId: recharge.id,
    });
  }

  await recharge.save();
  await logAdminAction(req.user.id, 'UPDATE_RECHARGE', 'recharge', recharge.id, {
    oldStatus,
    newStatus: status,
    rejectionReason,
  });

  res.status(200).json({ status: 'success', recharge });
});

// 4.6 Analytics API
const getAnalytics = asyncHandler(async (req, res, _next) => {
  const [dailyUsers] = await sequelize.query(`
    SELECT DATE(created_at) as date, COUNT(id) as count
    FROM users
    WHERE role = 'user'
    GROUP BY DATE(created_at)
    ORDER BY date DESC
    LIMIT 7
  `);

  const [dailyEarnings] = await sequelize.query(`
    SELECT DATE(created_at) as date, SUM(amount) as totalCredits
    FROM transactions
    WHERE type = 'credit'
    GROUP BY DATE(created_at)
    ORDER BY date DESC
    LIMIT 7
  `);

  const [taskBreakdown] = await sequelize.query(`
    SELECT t.type, COUNT(tc.id) as completionCount
    FROM task_completions tc
    JOIN tasks t ON tc.task_id = t.id
    WHERE tc.status = 'completed'
    GROUP BY t.type
  `);

  res.status(200).json({
    status: 'success',
    analytics: {
      dailyUsers: dailyUsers.reverse(),
      dailyEarnings: dailyEarnings.reverse(),
      taskBreakdown,
    },
  });
});

// 4.7 Announcements Management
const getAdminAnnouncements = asyncHandler(async (req, res, _next) => {
  const announcements = await Announcement.findAll({ order: [['created_at', 'DESC']] });
  res.status(200).json({ status: 'success', announcements });
});

const createAnnouncement = asyncHandler(async (req, res, next) => {
  const { title, message, type, is_active, expires_at } = req.body;
  if (!title || !message) {
    return next(new AppError('Title and message are required.', 400));
  }

  const announcement = await Announcement.create({
    title,
    message,
    type: type || 'info',
    is_active: is_active !== undefined ? is_active : true,
    created_by: req.user.id,
    expires_at: expires_at || null,
  });

  await logAdminAction(req.user.id, 'CREATE_ANNOUNCEMENT', 'announcement', announcement.id, {
    title,
  });
  await invalidateAnnouncementsCache();
  res.status(201).json({ status: 'success', announcement });
});

const deleteAnnouncement = asyncHandler(async (req, res, next) => {
  const announcement = await Announcement.findByPk(req.params.id);
  if (!announcement) return next(new AppError('Announcement not found.', 404));

  await announcement.destroy();
  await logAdminAction(
    req.user.id,
    'DELETE_ANNOUNCEMENT',
    'announcement',
    announcement.id,
    {}
  );
  await invalidateAnnouncementsCache();
  res.status(200).json({ status: 'success', message: 'Announcement deleted.' });
});

// 4.8 Admin Logs
const getAdminLogs = asyncHandler(async (req, res, _next) => {
  const logs = await AdminLog.findAll({
    include: [{ model: User, as: 'admin', attributes: ['id', 'full_name', 'email'] }],
    order: [['created_at', 'DESC']],
    limit: 50,
  });

  res.status(200).json({ status: 'success', count: logs.length, logs });
});

// 4.9 Live User Time-Series Analytics
const getLiveUserAnalytics = asyncHandler(async (req, res, _next) => {
  const { range = '24h' } = req.query;
  const data = await activeUserService.getLiveUserHistory(range);
  res.status(200).json({ status: 'success', data });
});

module.exports = {
  getDashboardStats,
  getUsers,
  updateUser,
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  clearTasksCache,
  getAdminRecharges,
  updateRechargeStatus,
  getAnalytics,
  getAdminAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  getAdminLogs,
  getLiveUserAnalytics,
};
