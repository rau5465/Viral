const { Task } = require('../models');
const {
  getAvailableTasks,
  getTasksVersion,
  getUserCompletionsToday,
  startTask,
  completeTask,
} = require('../services/taskService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// Get lightweight current task catalog version (~30 bytes)
const getCatalogVersion = asyncHandler(async (_req, res, _next) => {
  const version = await getTasksVersion();
  res.status(200).json({
    status: 'success',
    version,
  });
});

// Get user's today completions
const getMyCompletionsToday = asyncHandler(async (req, res, _next) => {
  const completions = await getUserCompletionsToday(req.user.id);
  res.status(200).json({
    status: 'success',
    completions,
  });
});

// List available tasks with version-aware conditional caching
const getTasks = asyncHandler(async (req, res, _next) => {
  const clientVersion = req.query.version || req.headers['if-none-match'];
  const result = await getAvailableTasks(req.user.id, clientVersion);

  // Set ETag header for HTTP caching
  res.setHeader('ETag', `"${result.version}"`);
  res.setHeader('Cache-Control', 'private, no-cache');

  if (result.notModified) {
    return res.status(200).json({
      status: 'success',
      notModified: true,
      version: result.version,
      completionsToday: result.completionsToday,
    });
  }

  res.status(200).json({
    status: 'success',
    notModified: false,
    version: result.version,
    count: result.tasks.length,
    tasks: result.tasks,
    completionsToday: result.completionsToday,
  });
});

// Get task details
const getTaskDetails = asyncHandler(async (req, res, next) => {
  const task = await Task.findByPk(req.params.id);
  if (!task) {
    return next(new AppError('Task not found.', 404));
  }

  res.status(200).json({
    status: 'success',
    task,
  });
});

// Start a task
const startTaskSession = asyncHandler(async (req, res, _next) => {
  const result = await startTask(req.user.id, req.params.id);
  res.status(200).json({
    status: 'success',
    session: result,
  });
});

// Complete and verify a task
const completeTaskSession = asyncHandler(async (req, res, _next) => {
  const { verificationData } = req.body;
  const result = await completeTask(req.user.id, req.params.id, verificationData);
  res.status(200).json({
    status: 'success',
    result,
  });
});

module.exports = {
  getCatalogVersion,
  getMyCompletionsToday,
  getTasks,
  getTaskDetails,
  startTaskSession,
  completeTaskSession,
};
