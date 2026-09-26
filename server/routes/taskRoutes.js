const express = require('express');
const {
  getTasks,
  getTaskDetails,
  startTaskSession,
  completeTaskSession,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { taskLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.use(protect); // Protected routes

router.get('/', getTasks);
router.get('/:id', getTaskDetails);
router.post('/:id/start', taskLimiter, startTaskSession);
router.post('/:id/complete', taskLimiter, completeTaskSession);

module.exports = router;
