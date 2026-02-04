const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { login, getCurrentUser } = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Validation middleware
const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Routes - No registration, only login for demo users
router.post('/login', validateLogin, login);
router.get('/me', authenticateToken, getCurrentUser);

module.exports = router;
