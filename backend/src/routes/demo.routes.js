const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');
const { pool } = require('../config/database');
const { insertSampleData } = require('../config/sample-data-helper');

// Apply authentication to all routes
router.use(authenticateToken);

// Get demo user stats (transaction count and limit)
router.get('/stats', requireRole('user'), async (req, res) => {
  try {
    // Get transaction limit from settings
    const settingResult = await pool.query(
      `SELECT setting_value FROM ft_admin_settings WHERE setting_key = 'demo_user_transaction_limit'`
    );

    const limit = settingResult.rows.length > 0
      ? parseInt(settingResult.rows[0].setting_value)
      : 50;

    // Count user's transactions
    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM ft_transactions WHERE user_id = $1',
      [req.user.id]
    );

    const currentCount = parseInt(countResult.rows[0].count);

    res.json({
      transactionCount: currentCount,
      transactionLimit: limit,
      remaining: limit - currentCount,
      limitReached: currentCount >= limit
    });
  } catch (error) {
    console.error('Get demo stats error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch demo stats' } });
  }
});

// Delete all demo user data and repopulate with sample data
router.delete('/reset', requireRole('user'), async (req, res) => {
  try {
    const userId = req.user.id;

    // Start transaction
    await pool.query('BEGIN');

    // Delete all user data in order (respecting foreign key constraints)
    await pool.query('DELETE FROM ft_receipts WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM ft_ai_chat_history WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM ft_transactions WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM ft_budgets WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM ft_financial_goals WHERE user_id = $1', [userId]);

    // Insert fresh sample data
    const sampleDataResult = await insertSampleData(userId);

    // Commit transaction
    await pool.query('COMMIT');

    res.json({
      message: 'Demo data has been reset with fresh sample transactions',
      deletedData: {
        transactions: true,
        budgets: true,
        goals: true,
        chatHistory: true,
        receipts: true
      },
      sampleDataInserted: {
        success: sampleDataResult.success,
        transactionsCreated: sampleDataResult.successCount || 0,
        errors: sampleDataResult.errorCount || 0
      }
    });
  } catch (error) {
    // Rollback on error
    await pool.query('ROLLBACK');
    console.error('Delete demo data error:', error);
    res.status(500).json({ error: { message: 'Failed to reset demo data' } });
  }
});

module.exports = router;
