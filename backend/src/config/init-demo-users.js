// Load environment variables FIRST before importing database
require('dotenv').config();

const bcrypt = require('bcryptjs');
const { pool } = require('./database');

/**
 * Initialize demo users for portfolio version
 * Creates two fixed users:
 * 1. Super Admin - For managing AI instructions only
 * 2. Demo User - For testing the finance tracker features with limits
 */
async function initializeDemoUsers() {
  try {
    console.log('🚀 Initializing demo users for Finance Tracker...\n');

    const saltRounds = 10;

    // User 1: Super Admin
    const superAdminEmail = 'admin@financetracker.com';
    const superAdminPassword = 'admin123';
    const superAdminHash = await bcrypt.hash(superAdminPassword, saltRounds);

    // User 2: Demo User
    const demoUserEmail = 'demo@financetracker.com';
    const demoUserPassword = 'demo123';
    const demoUserHash = await bcrypt.hash(demoUserPassword, saltRounds);

    // Check and create/update Super Admin
    const existingSuperAdmin = await pool.query(
      'SELECT id FROM ft_users WHERE email = $1',
      [superAdminEmail]
    );

    if (existingSuperAdmin.rows.length > 0) {
      console.log('✅ Super Admin already exists');
      await pool.query(
        'UPDATE ft_users SET role = $1, password_hash = $2 WHERE email = $3',
        ['super_admin', superAdminHash, superAdminEmail]
      );
      console.log('🔄 Super Admin updated\n');
    } else {
      await pool.query(
        `INSERT INTO ft_users (email, password_hash, first_name, last_name, role, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [superAdminEmail, superAdminHash, 'Super', 'Admin', 'super_admin', true]
      );
      console.log('✅ Super Admin created\n');
    }

    // Check and create/update Demo User
    const existingDemoUser = await pool.query(
      'SELECT id FROM ft_users WHERE email = $1',
      [demoUserEmail]
    );

    if (existingDemoUser.rows.length > 0) {
      console.log('✅ Demo User already exists');
      await pool.query(
        'UPDATE ft_users SET role = $1, password_hash = $2 WHERE email = $3',
        ['user', demoUserHash, demoUserEmail]
      );
      console.log('🔄 Demo User updated\n');
    } else {
      await pool.query(
        `INSERT INTO ft_users (email, password_hash, first_name, last_name, role, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [demoUserEmail, demoUserHash, 'Demo', 'User', 'user', true]
      );
      console.log('✅ Demo User created\n');
    }

    // Display credentials
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 DEMO CREDENTIALS FOR PORTFOLIO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('👤 SUPER ADMIN (AI Instructions Management Only)');
    console.log('   📧 Email:    ', superAdminEmail);
    console.log('   🔐 Password: ', superAdminPassword);
    console.log('   🎯 Access:    Super Admin Panel - AI Instructions\n');

    console.log('👤 DEMO USER (Full Finance Tracker Features)');
    console.log('   📧 Email:    ', demoUserEmail);
    console.log('   🔐 Password: ', demoUserPassword);
    console.log('   🎯 Access:    Dashboard, Transactions, Budgets, Goals, AI Chat');
    console.log('   ⚠️  Limit:     50 transactions max\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Demo users initialized successfully!');

  } catch (error) {
    console.error('❌ Error initializing demo users:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

// Run the script
initializeDemoUsers();
