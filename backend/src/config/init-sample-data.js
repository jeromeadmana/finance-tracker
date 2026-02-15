// Load environment variables FIRST before importing database
require('dotenv').config();

const { pool } = require('./database');
const { sampleTransactions } = require('./sample-data');

/**
 * Initialize sample data for demo user
 * Pre-populates demo user account with realistic transactions
 */
async function initializeSampleData() {
  try {
    console.log('🚀 Initializing sample data for demo user...\n');

    // Get demo user ID
    const demoUserResult = await pool.query(
      'SELECT id, email FROM ft_users WHERE email = $1',
      ['demo@financetracker.com']
    );

    if (demoUserResult.rows.length === 0) {
      console.log('❌ Demo user not found. Please run "npm run init-demo" first.');
      return;
    }

    const demoUserId = demoUserResult.rows[0].id;
    console.log('✅ Found demo user:', demoUserResult.rows[0].email);

    // Check existing transaction count
    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM ft_transactions WHERE user_id = $1',
      [demoUserId]
    );

    const existingCount = parseInt(countResult.rows[0].count);
    console.log(`📊 Current transactions: ${existingCount}\n`);

    if (existingCount > 0) {
      console.log('⚠️  Demo user already has transactions.');
      console.log('   Run "npm run reset-demo-data" to clear existing data first,');
      console.log('   or delete transactions manually from the database.\n');
      return;
    }

    // Get all categories for mapping
    const categoriesResult = await pool.query('SELECT id, name FROM ft_categories');
    const categoryMap = {};
    categoriesResult.rows.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });

    console.log('📝 Inserting sample transactions...\n');

    let successCount = 0;
    let errorCount = 0;

    // Insert each sample transaction
    for (const transaction of sampleTransactions) {
      try {
        const categoryId = categoryMap[transaction.category] || null;

        if (!categoryId) {
          console.log(`⚠️  Warning: Category "${transaction.category}" not found, skipping transaction`);
          errorCount++;
          continue;
        }

        await pool.query(
          `INSERT INTO ft_transactions
           (user_id, category_id, amount, type, description, merchant, transaction_date, ai_categorized, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            demoUserId,
            categoryId,
            transaction.amount,
            transaction.type,
            transaction.description,
            transaction.merchant,
            transaction.date,
            transaction.ai_categorized || false,
            transaction.notes || null
          ]
        );

        successCount++;

        // Show progress every 10 transactions
        if (successCount % 10 === 0) {
          console.log(`   ✓ Inserted ${successCount} transactions...`);
        }

      } catch (error) {
        console.error(`   ❌ Error inserting transaction: ${transaction.description}`);
        console.error(`      ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 SAMPLE DATA INITIALIZATION COMPLETE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log(`✅ Successfully inserted: ${successCount} transactions`);
    if (errorCount > 0) {
      console.log(`❌ Failed to insert: ${errorCount} transactions`);
    }

    // Get final statistics
    const statsResult = await pool.query(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
        SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as balance
       FROM ft_transactions
       WHERE user_id = $1`,
      [demoUserId]
    );

    const stats = statsResult.rows[0];
    console.log(`\n📈 Demo Account Statistics:`);
    console.log(`   Total Transactions: ${stats.total}`);
    console.log(`   Total Income:       $${parseFloat(stats.total_income).toFixed(2)}`);
    console.log(`   Total Expenses:     $${parseFloat(stats.total_expenses).toFixed(2)}`);
    console.log(`   Current Balance:    $${parseFloat(stats.balance).toFixed(2)}`);
    console.log(`   Remaining Slots:    ${50 - parseInt(stats.total)} / 50\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Sample data ready for demo!');
    console.log('\n💡 Login as demo user to see the data:');
    console.log('   📧 Email: demo@financetracker.com');
    console.log('   🔐 Password: demo123\n');

  } catch (error) {
    console.error('❌ Error initializing sample data:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

// Run the script
initializeSampleData();
