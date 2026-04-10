const express = require('express');
const router = express.Router();
const { protect, adminOrManager } = require('../middleware/authMiddleware');
const { payMess, transferMoney, getHistory, getAllHistoryManager } = require('../controllers/transactionController');

router.post('/pay', protect, payMess);
router.post('/transfer', protect, transferMoney);
router.get('/history', protect, getHistory);
router.get('/manager/history', protect, adminOrManager, getAllHistoryManager);

module.exports = router;
