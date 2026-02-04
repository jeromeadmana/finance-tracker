const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: { message: 'Access token required' } });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from database to ensure they still exist and are active
    const result = await pool.query(
      'SELECT id, email, role, is_active FROM ft_users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: { message: 'User not found' } });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ error: { message: 'Account is inactive' } });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: { message: 'Invalid token' } });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: { message: 'Token expired' } });
    }
    return res.status(500).json({ error: { message: 'Authentication error' } });
  }
};

// Check if user has required role
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: { message: 'Authentication required' } });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: { message: 'Insufficient permissions' }
      });
    }

    next();
  };
};

// Super admin only
const requireSuperAdmin = requireRole('super_admin');

// Super admin only (no 'admin' role in simplified auth)
const requireAdmin = requireRole('super_admin');

module.exports = {
  authenticateToken,
  requireRole,
  requireSuperAdmin,
  requireAdmin
};
