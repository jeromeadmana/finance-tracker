const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { pool } = require('../config/database');

router.use(authenticateToken);

// Get all ft_categories
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM ft_categories ORDER BY type, name'
    );
    res.json({ ft_categories: result.rows });
  } catch (error) {
    console.error('Get ft_categories error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch ft_categories' } });
  }
});

module.exports = router;
