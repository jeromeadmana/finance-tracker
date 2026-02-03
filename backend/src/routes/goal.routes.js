const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { pool } = require('../config/database');

router.use(authenticateToken);

// Get user goals
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM financial_goals
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ goals: result.rows });
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch goals' } });
  }
});

// Create goal
router.post('/', async (req, res) => {
  try {
    const { title, description, targetAmount, targetDate } = req.body;

    const result = await pool.query(
      `INSERT INTO financial_goals (user_id, title, description, target_amount, target_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, title, description, targetAmount, targetDate]
    );

    res.status(201).json({
      message: 'Goal created successfully',
      goal: result.rows[0]
    });
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ error: { message: 'Failed to create goal' } });
  }
});

module.exports = router;
