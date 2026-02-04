const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { restrictSuperAdminAccess } = require('../middleware/demo.middleware');
const { pool } = require('../config/database');

router.use(authenticateToken);
router.use(restrictSuperAdminAccess);

// Get user ft_budgets
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, c.name as category_name, c.icon, c.color
       FROM ft_budgets b
       LEFT JOIN ft_categories c ON b.category_id = c.id
       WHERE b.user_id = $1 AND b.is_active = true
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json({ ft_budgets: result.rows });
  } catch (error) {
    console.error('Get ft_budgets error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch ft_budgets' } });
  }
});

// Create budget
router.post('/', async (req, res) => {
  try {
    const { categoryId, amount, period, startDate, endDate } = req.body;

    const result = await pool.query(
      `INSERT INTO ft_budgets (user_id, category_id, amount, period, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.id, categoryId, amount, period, startDate, endDate]
    );

    res.status(201).json({
      message: 'Budget created successfully',
      budget: result.rows[0]
    });
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({ error: { message: 'Failed to create budget' } });
  }
});

module.exports = router;
