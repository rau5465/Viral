const express = require('express');
const {
  getDashboardStats,
  getUsers,
  updateUser,
  impersonateUser,
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
} = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Require admin authentication for all routes
router.use(protect);
router.use(restrictTo('admin'));

// Stats & Analytics
router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/live-users', getLiveUserAnalytics);
router.get('/logs', getAdminLogs);

// Users
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.post('/users/:id/impersonate', impersonateUser);

// Tasks
router.get('/tasks', getAllTasks);
router.post('/tasks', createTask);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);
router.post('/tasks/clear-cache', clearTasksCache);

// Recharges
router.get('/recharges', getAdminRecharges);
router.put('/recharges/:id', updateRechargeStatus);

// Announcements
router.get('/announcements', getAdminAnnouncements);
router.post('/announcements', createAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

module.exports = router;
