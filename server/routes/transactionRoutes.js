const express = require('express');
const { getTransactions, getSummary } = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getTransactions);
router.get('/summary', getSummary);

module.exports = router;
