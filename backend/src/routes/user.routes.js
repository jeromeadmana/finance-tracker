const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');

// Placeholder for user profile routes
router.use(authenticateToken);

router.get('/profile', (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
