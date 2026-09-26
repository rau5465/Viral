const { Task, TaskCompletion, sequelize } = require('../models');
const { awardCredits } = require('./creditService');
const { checkAndApplyBonusMultiplier } = require('./bonusService');
const AppError = require('../utils/AppError');

// Get all active tasks with user's today's completion count
const getAvailableTasks = async (userId) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const tasks = await Task.findAll({
    where: { is_active: true },
    order: [['credits_reward', 'DESC']],
  });

  const completionsToday = await TaskCompletion.findAll({
    where: {
      user_id: userId,
      status: 'completed',
      completed_at: {
        [sequelize.Sequelize.Op.gte]: startOfDay,
      },
    },
  });

  // Map completions count by taskId
  const completionMap = {};
  completionsToday.forEach((c) => {
    completionMap[c.task_id] = (completionMap[c.task_id] || 0) + 1;
  });

  return tasks.map((task) => {
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
};

// Start a task
const startTask = async (userId, taskId) => {
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
};

// Complete a task and award credits
const completeTask = async (userId, taskId, verificationData = {}) => {
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
};

module.exports = {
  getAvailableTasks,
  startTask,
  completeTask,
};
