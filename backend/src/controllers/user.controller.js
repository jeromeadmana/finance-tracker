const { pool } = require('../config/database');

// Get user profile (extended with monthly_income)
const getUserProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, monthly_income, role, is_active, created_at
       FROM ft_users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }

    const user = result.rows[0];

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        monthlyIncome: user.monthly_income,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch user profile' } });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { monthlyIncome } = req.body;

    // Validate monthlyIncome if provided
    if (monthlyIncome !== undefined && monthlyIncome !== null) {
      const income = parseFloat(monthlyIncome);
      if (isNaN(income) || income < 0) {
        return res.status(400).json({
          error: { message: 'Monthly income must be a positive number or null' }
        });
      }
    }

    // Update only monthly_income for now (can be extended later)
    const result = await pool.query(
      `UPDATE ft_users
       SET monthly_income = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, email, first_name, last_name, monthly_income, role, is_active, created_at`,
      [monthlyIncome === null ? null : parseFloat(monthlyIncome), req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }

    const user = result.rows[0];

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        monthlyIncome: user.monthly_income,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ error: { message: 'Failed to update user profile' } });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile
};
