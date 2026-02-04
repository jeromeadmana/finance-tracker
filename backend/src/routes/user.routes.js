const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { getUserProfile, updateUserProfile } = require('../controllers/user.controller');
const { body } = require('express-validator');

router.use(authenticateToken);

// Get user profile
router.get('/profile', getUserProfile);

// Update user profile
router.put('/profile', [
  body('monthlyIncome')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Monthly income must be a positive number or null')
], updateUserProfile);

module.exports = router;
