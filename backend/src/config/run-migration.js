const { pool } = require('./database');

async function runMigration() {
  try {
    console.log('🔄 Running migration: Add monthly_income column...');

    // Add monthly_income column
    await pool.query(`
      ALTER TABLE ft_users
      ADD COLUMN IF NOT EXISTS monthly_income DECIMAL(12,2) DEFAULT NULL
    `);

    console.log('✅ Migration completed successfully!');

    // Verify the column was added
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'ft_users' AND column_name = 'monthly_income'
    `);

    if (result.rows.length > 0) {
      console.log('✅ Verified: monthly_income column exists');
      console.log('   Column details:', result.rows[0]);
    } else {
      console.log('❌ Warning: monthly_income column not found after migration');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
