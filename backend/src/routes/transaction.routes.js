const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { checkTransactionLimit, restrictSuperAdminAccess } = require('../middleware/demo.middleware');
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

// Super admin cannot access transactions
router.use(restrictSuperAdminAccess);

// GET routes (no limit check needed for reading)
router.get('/', getTransactions);
router.get('/stats', getTransactionStats);
router.get('/:id', getTransactionById);

// POST routes (check transaction limit before creating)
router.post('/', checkTransactionLimit, createTransaction);
router.post('/natural-language', checkTransactionLimit, createTransactionFromNL);

// PUT and DELETE routes (no limit check needed)
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
