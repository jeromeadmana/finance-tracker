const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const {
  getTransactions,
  getTransactionById,
  createTransaction,
  createTransactionFromNL,
  updateTransaction,
  deleteTransaction,
  getTransactionStats
} = require('../controllers/transaction.controller');

// All transaction routes require authentication
router.use(authenticateToken);

router.get('/', getTransactions);
router.get('/stats', getTransactionStats);
router.get('/:id', getTransactionById);
router.post('/', createTransaction);
router.post('/natural-language', createTransactionFromNL);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
