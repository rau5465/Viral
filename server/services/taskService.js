const { Task, TaskCompletion, sequelize } = require('../models');
const { awardCredits } = require('./creditService');
const { checkAndApplyBonusMultiplier } = require('./bonusService');
const { get, set, getOrSet, del, acquireLock, releaseLock } = require('../config/redis');
const AppError = require('../utils/AppError');

// Cache keys for active tasks catalog and catalog version
const TASKS_CATALOG_CACHE_KEY = 'cache:tasks:active_catalog';
const TASKS_VERSION_KEY = 'cache:tasks:catalog:version';

/**
 * Get current tasks catalog version hash
 */
const getTasksVersion = async () => {
  let version = await get(TASKS_VERSION_KEY);
  if (!version) {
    version = 'v_' + Date.now();
    await set(TASKS_VERSION_KEY, version, 86400 * 365); // 1 year TTL
  }
  return version;
};

/**
 * Invalidate cached tasks catalog and bump version
 * Called on admin task add/edit/delete or explicit cache clear
 */
const bumpTasksVersion = async () => {
  const newVersion = 'v_' + Date.now();
  try {
    await set(TASKS_VERSION_KEY, newVersion, 86400 * 365);
    await del(TASKS_CATALOG_CACHE_KEY);
    console.log(`🔄 [TaskService] Task catalog version bumped to: ${newVersion}`);
  } catch (err) {
    console.warn('[bumpTasksVersion error]', err.message);
  }
  return newVersion;
};

const invalidateTasksCache = bumpTasksVersion;

/**
 * Get user's today's completed task IDs and count
 */
const getUserCompletionsToday = async (userId) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const completionsToday = await TaskCompletion.findAll({
    where: {
      user_id: userId,
      status: 'completed',
      completed_at: {
        [sequelize.Sequelize.Op.gte]: startOfDay,
      },
    },
    attributes: ['task_id'],
  });

  const completionMap = {};
  completionsToday.forEach((c) => {
    completionMap[c.task_id] = (completionMap[c.task_id] || 0) + 1;
  });

  return completionMap;
};

/**
 * Get all active tasks with user's today's completion count.
 * Supports conditional client version check: if client has latest version,
 * tasks array is omitted (notModified: true), saving bandwidth!
 */
const getAvailableTasks = async (userId, clientVersion = null) => {
  const currentVersion = await getTasksVersion();
  const completionMap = await getUserCompletionsToday(userId);

  // If client already has the latest task catalog version cached on their phone/browser
  if (clientVersion && clientVersion === currentVersion) {
    const notMod = [];
    notMod.notModified = true;
    notMod.version = currentVersion;
    notMod.completionsToday = completionMap;
    return notMod;
  }

  // Otherwise, fetch active task definitions from Redis cache (or MySQL if cache miss)
  const activeTasks = await getOrSet(
    TASKS_CATALOG_CACHE_KEY,
    async () => {
      const tasks = await Task.findAll({
        where: { is_active: true },
        order: [['credits_reward', 'DESC']],
      });
      return tasks.map((t) => t.toJSON());
    },
    86400 // 24 hours Redis cache (invalidated via bumpTasksVersion)
  );

  const mappedTasks = activeTasks.map((task) => {
    const userDoneCount = completionMap[task.id] || 0;
    const isLimitReached = task.daily_limit > 0 && userDoneCount >= task.daily_limit;

    return {
      id: task.id,
      title: task.title,
      description: task.description,
      type: task.type,
      url: task.url,
      instructions: task.instructions,
      creditsReward: task.credits_reward,
      durationSeconds: task.duration_seconds,
      dailyLimit: task.daily_limit,
      completionsToday: userDoneCount,
      isAvailable: !isLimitReached,
    };
  });

  mappedTasks.notModified = false;
  mappedTasks.version = currentVersion;
  mappedTasks.tasks = mappedTasks;
  mappedTasks.completionsToday = completionMap;

  return mappedTasks;
};

// Start a task with concurrency protection
const startTask = async (userId, taskId) => {
  const lockKey = `task:start:${userId}:${taskId}`;
  const lockToken = await acquireLock(lockKey, 3);
  if (!lockToken) {
    throw new AppError('Task is already being initialized. Please wait.', 429);
  }

  try {
    const task = await Task.findByPk(taskId);
    if (!task || !task.is_active) {
      throw new AppError('Task not found or is currently inactive.', 404);
    }

    // Check today's limit
    if (task.daily_limit > 0) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const countToday = await TaskCompletion.count({
        where: {
          user_id: userId,
          task_id: taskId,
          status: 'completed',
          completed_at: {
            [sequelize.Sequelize.Op.gte]: startOfDay,
          },
        },
      });

      if (countToday >= task.daily_limit) {
        throw new AppError('You have reached the daily limit for this task. Try again tomorrow!', 400);
      }
    }

    const completion = await TaskCompletion.create({
      user_id: userId,
      task_id: taskId,
      status: 'started',
      started_at: new Date(),
    });

    return {
      completionId: completion.id,
      taskId: task.id,
      title: task.title,
      url: task.url,
      instructions: task.instructions,
      durationSeconds: task.duration_seconds,
      startedAt: completion.started_at,
    };
  } finally {
    await releaseLock(lockKey, lockToken);
  }
};

// Complete a task and award credits with distributed locking
const completeTask = async (userId, taskId, verificationData = {}) => {
  const lockKey = `task:complete:${userId}:${taskId}`;
  const lockToken = await acquireLock(lockKey, 10);
  if (!lockToken) {
    throw new AppError('Task completion verification already in progress. Please wait a moment.', 429);
  }

  try {
    const task = await Task.findByPk(taskId);
    if (!task || !task.is_active) {
      throw new AppError('Task not found or inactive.', 404);
    }

    // Find the most recent started completion
    const completion = await TaskCompletion.findOne({
      where: {
        user_id: userId,
        task_id: taskId,
        status: 'started',
      },
      order: [['started_at', 'DESC']],
    });

    if (!completion) {
      throw new AppError('No active task session found. Please start the task first.', 400);
    }

    const now = new Date();
    const elapsedSeconds = Math.floor((now.getTime() - new Date(completion.started_at).getTime()) / 1000);

    // If task has duration, verify minimum duration (grace tolerance of 3s)
    if (task.duration_seconds > 0) {
      const minRequired = Math.max(0, task.duration_seconds - 3);
      if (elapsedSeconds < minRequired) {
        throw new AppError(
          `Task requires staying for at least ${task.duration_seconds} seconds. You stayed only ${elapsedSeconds} seconds.`,
          400
        );
      }
    }

    await sequelize.transaction(async (t) => {
      completion.status = 'completed';
      completion.completed_at = now;
      completion.credits_awarded = task.credits_reward;
      completion.verification_data = verificationData;
      await completion.save({ transaction: t });

      task.total_completions += 1;
      await task.save({ transaction: t });

      await awardCredits({
        userId,
        amount: task.credits_reward,
        category: 'task',
        description: `Completed task: ${task.title}`,
        referenceId: task.id,
        transaction: t,
      });
    });

    await checkAndApplyBonusMultiplier(userId);

    return {
      status: 'completed',
      creditsAwarded: task.credits_reward,
      taskTitle: task.title,
    };
  } finally {
    await releaseLock(lockKey, lockToken);
  }
};

module.exports = {
  getTasksVersion,
  bumpTasksVersion,
  getUserCompletionsToday,
  getAvailableTasks,
  startTask,
  completeTask,
  invalidateTasksCache,
};
