// Load environment variables FIRST before importing database
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { pool } = require('./database');

async function runSchema() {
  try {
    console.log('🚀 Running database schema...\n');

    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute the schema
    await pool.query(schema);

    console.log('✅ Database schema executed successfully!');
    console.log('\nTables created with ft_ prefix:');
    console.log('  - ft_users');
    console.log('  - ft_transactions');
    console.log('  - ft_categories');
    console.log('  - ft_budgets');
    console.log('  - ft_financial_goals');
    console.log('  - ft_admin_settings');
    console.log('  - ft_ai_instructions');
    console.log('  - ft_ai_prompts');
    console.log('  - ft_category_rules');
    console.log('  - ft_budget_templates');
    console.log('  - ft_ai_chat_history');
    console.log('  - ft_receipts');
    console.log('\n✅ Default data inserted (categories, AI instructions, settings)');

  } catch (error) {
    console.error('❌ Error running schema:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

// Run the script
runSchema();
