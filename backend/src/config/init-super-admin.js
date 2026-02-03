const bcrypt = require('bcryptjs');
const { pool } = require('./database');
require('dotenv').config();

async function createSuperAdmin() {
  try {
    const email = process.env.SUPER_ADMIN_EMAIL || 'admin@financetracker.com';
    const password = process.env.SUPER_ADMIN_PASSWORD || 'Admin123!';

    // Check if super admin already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log('✅ Super admin user already exists:', email);
      console.log('🔄 Updating to super_admin role...');

      await pool.query(
        'UPDATE users SET role = $1 WHERE email = $2',
        ['super_admin', email]
      );

      console.log('✅ User updated to super_admin role');
      return;
    }

    // Create new super admin
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, role`,
      [email, passwordHash, 'Super', 'Admin', 'super_admin', true]
    );

    console.log('✅ Super admin created successfully!');
    console.log('📧 Email:', result.rows[0].email);
    console.log('🔐 Password:', password);
    console.log('⚠️  Please change the password after first login');

  } catch (error) {
    console.error('❌ Error creating super admin:', error.message);
  } finally {
    await pool.end();
  }
}

// Run the script
createSuperAdmin();
