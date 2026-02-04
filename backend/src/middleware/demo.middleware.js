const { pool } = require('../config/database');

// Check if demo user has reached transaction limit
const checkTransactionLimit = async (req, res, next) => {
  try {
    // Only apply limit to demo user
    if (req.user.role !== 'user') {
      return next();
    }

    // Get demo user transaction limit from settings
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

    if (currentCount >= limit) {
      return res.status(403).json({
        error: {
          message: `Demo account has reached the limit of ${limit} transactions. Please use "Delete All Data" to reset.`,
          code: 'DEMO_LIMIT_REACHED',
          currentCount,
          limit
        }
      });
    }

    // Add current count to request for use in response
    req.transactionCount = currentCount;
    req.transactionLimit = limit;

    next();
  } catch (error) {
    console.error('Transaction limit check error:', error);
    next(); // Allow request to continue on error
  }
};

// Restrict super admin to only AI instructions
const restrictSuperAdminAccess = (req, res, next) => {
  if (req.user.role === 'super_admin') {
    return res.status(403).json({
      error: {
        message: 'Super Admin can only access AI Instructions management.',
        code: 'SUPER_ADMIN_RESTRICTED'
      }
    });
  }
  next();
};

module.exports = {
  checkTransactionLimit,
  restrictSuperAdminAccess
};
