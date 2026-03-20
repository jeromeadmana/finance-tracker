const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { restrictSuperAdminAccess } = require('../middleware/demo.middleware');
const { pool } = require('../config/database');

router.use(authenticateToken);
router.use(restrictSuperAdminAccess);

// Get user goals
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM ft_financial_goals
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
      `INSERT INTO ft_financial_goals (user_id, title, description, target_amount, target_date)
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

// Update goal
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, targetAmount, currentAmount, targetDate, status } = req.body;

    // Verify ownership
    const existing = await pool.query(
      'SELECT id FROM ft_financial_goals WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Goal not found' } });
    }

    const result = await pool.query(
      `UPDATE ft_financial_goals
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           target_amount = COALESCE($3, target_amount),
           current_amount = COALESCE($4, current_amount),
           target_date = COALESCE($5, target_date),
           status = COALESCE($6, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [title, description, targetAmount, currentAmount, targetDate, status, id, req.user.id]
    );

    res.json({ message: 'Goal updated successfully', goal: result.rows[0] });
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ error: { message: 'Failed to update goal' } });
  }
});

// Delete goal
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM ft_financial_goals WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Goal not found' } });
    }

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ error: { message: 'Failed to delete goal' } });
  }
});

module.exports = router;
