const { pool } = require('./database');
const { sampleTransactions } = require('./sample-data');

/**
 * Insert sample data for a specific user
 * @param {string} userId - The UUID of the user
 * @returns {Promise<Object>} Result statistics
 */
async function insertSampleData(userId) {
  try {
    // Get all categories for mapping
    const categoriesResult = await pool.query('SELECT id, name FROM ft_categories');
    const categoryMap = {};
    categoriesResult.rows.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });

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
            userId,
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
      } catch (error) {
        console.error(`Error inserting transaction: ${transaction.description}`, error.message);
        errorCount++;
      }
    }

    return {
      success: true,
      successCount,
      errorCount,
      totalAttempted: sampleTransactions.length
    };

  } catch (error) {
    console.error('Error in insertSampleData:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  insertSampleData
};
