const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const { generateToken } = require('../utils/jwt.util');

// Login (Portfolio demo - only two fixed users)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await pool.query(
      `SELECT id, email, password_hash, first_name, last_name, monthly_income, role, is_active
       FROM ft_users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: { message: 'Invalid email or password' }
      });
    }

    const user = result.rows[0];

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({
        error: { message: 'Account is inactive. Please contact support.' }
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        error: { message: 'Invalid email or password' }
      });
    }

    // Generate token
    const token = generateToken(user.id, user.role);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        monthlyIncome: user.monthly_income,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: { message: 'Login failed' } });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
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
    console.error('Get current user error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch user' } });
  }
};

module.exports = {
  login,
  getCurrentUser
};
