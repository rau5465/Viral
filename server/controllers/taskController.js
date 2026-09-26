const { Task } = require('../models');
const { getAvailableTasks, startTask, completeTask } = require('../services/taskService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// List available tasks with user status
const getTasks = asyncHandler(async (req, res, _next) => {
  const tasks = await getAvailableTasks(req.user.id);
  res.status(200).json({
    status: 'success',
    count: tasks.length,
    tasks,
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
  getTasks,
  getTaskDetails,
  startTaskSession,
  completeTaskSession,
};
