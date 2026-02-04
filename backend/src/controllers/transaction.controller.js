const { pool } = require('../config/database');
const { categorizeTransaction, parseNaturalLanguageTransaction } = require('../services/openai.service');

// Get all ft_transactions for user
const getTransactions = async (req, res) => {
  try {
    const { startDate, endDate, categoryId, type } = req.query;

    let query = `
      SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM ft_transactions t
      LEFT JOIN ft_categories c ON t.category_id = c.id
      WHERE t.user_id = $1
    `;
    const params = [req.user.id];
    let paramCount = 1;

    if (startDate) {
      paramCount++;
      query += ` AND t.transaction_date >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      query += ` AND t.transaction_date <= $${paramCount}`;
      params.push(endDate);
    }

    if (categoryId) {
      paramCount++;
      query += ` AND t.category_id = $${paramCount}`;
      params.push(categoryId);
    }

    if (type) {
      paramCount++;
      query += ` AND t.type = $${paramCount}`;
      params.push(type);
    }

    query += ' ORDER BY t.transaction_date DESC, t.created_at DESC';

    const result = await pool.query(query, params);

    res.json({ ft_transactions: result.rows });
  } catch (error) {
    console.error('Get ft_transactions error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch ft_transactions' } });
  }
};

// Get transaction by ID
const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT t.*, c.name as category_name
       FROM ft_transactions t
       LEFT JOIN ft_categories c ON t.category_id = c.id
       WHERE t.id = $1 AND t.user_id = $2`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Transaction not found' } });
    }

    res.json({ transaction: result.rows[0] });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch transaction' } });
  }
};

// Create transaction
const createTransaction = async (req, res) => {
  try {
    const {
      categoryId,
      amount,
      type,
      description,
      merchant,
      transactionDate,
      paymentMethod,
      notes,
      isRecurring,
      recurringPattern,
      tags
    } = req.body;

    let finalCategoryId = categoryId;
    let aiCategorized = false;

    // If no category provided, use AI to categorize
    if (!categoryId && description) {
      const aiResult = await categorizeTransaction(description, amount, merchant);
      if (aiResult && aiResult.category_id) {
        finalCategoryId = aiResult.category_id;
        aiCategorized = true;
      }
    }

    const result = await pool.query(
      `INSERT INTO ft_transactions (
        user_id, category_id, amount, type, description, merchant,
        transaction_date, payment_method, notes, is_recurring,
        recurring_pattern, tags, ai_categorized
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        req.user.id,
        finalCategoryId,
        amount,
        type,
        description,
        merchant,
        transactionDate || new Date().toISOString().split('T')[0],
        paymentMethod,
        notes,
        isRecurring || false,
        recurringPattern,
        tags,
        aiCategorized
      ]
    );

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction: result.rows[0],
      aiCategorized
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: { message: 'Failed to create transaction' } });
  }
};

// Create transaction from natural language
const createTransactionFromNL = async (req, res) => {
  try {
    const { input } = req.body;

    if (!input) {
      return res.status(400).json({ error: { message: 'Input text is required' } });
    }

    // Parse natural language
    const parsedData = await parseNaturalLanguageTransaction(input);

    // Categorize the transaction
    let categoryId = null;
    let aiCategorized = false;

    if (parsedData.description) {
      const aiResult = await categorizeTransaction(
        parsedData.description,
        parsedData.amount,
        parsedData.merchant
      );
      if (aiResult && aiResult.category_id) {
        categoryId = aiResult.category_id;
        aiCategorized = true;
      }
    }

    // Create transaction
    const result = await pool.query(
      `INSERT INTO ft_transactions (
        user_id, category_id, amount, type, description, merchant,
        transaction_date, ai_categorized
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        req.user.id,
        categoryId,
        parsedData.amount,
        parsedData.type,
        parsedData.description,
        parsedData.merchant,
        parsedData.date,
        aiCategorized
      ]
    );

    res.status(201).json({
      message: 'Transaction created successfully from natural language',
      transaction: result.rows[0],
      parsedData,
      aiCategorized
    });
  } catch (error) {
    console.error('Create transaction from NL error:', error);
    res.status(500).json({ error: { message: 'Failed to parse and create transaction' } });
  }
};

// Update transaction
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      categoryId,
      amount,
      type,
      description,
      merchant,
      transactionDate,
      paymentMethod,
      notes,
      tags
    } = req.body;

    const result = await pool.query(
      `UPDATE ft_transactions
       SET category_id = COALESCE($1, category_id),
           amount = COALESCE($2, amount),
           type = COALESCE($3, type),
           description = COALESCE($4, description),
           merchant = COALESCE($5, merchant),
           transaction_date = COALESCE($6, transaction_date),
           payment_method = COALESCE($7, payment_method),
           notes = COALESCE($8, notes),
           tags = COALESCE($9, tags)
       WHERE id = $10 AND user_id = $11
       RETURNING *`,
      [categoryId, amount, type, description, merchant, transactionDate, paymentMethod, notes, tags, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Transaction not found' } });
    }

    res.json({
      message: 'Transaction updated successfully',
      transaction: result.rows[0]
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: { message: 'Failed to update transaction' } });
  }
};

// Delete transaction
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM ft_transactions WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Transaction not found' } });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: { message: 'Failed to delete transaction' } });
  }
};

// Get transaction statistics
const getTransactionStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    const params = [req.user.id];

    if (startDate && endDate) {
      dateFilter = 'AND transaction_date BETWEEN $2 AND $3';
      params.push(startDate, endDate);
    } else if (startDate) {
      dateFilter = 'AND transaction_date >= $2';
      params.push(startDate);
    } else if (endDate) {
      dateFilter = 'AND transaction_date <= $2';
      params.push(endDate);
    }

    // Total income and expenses
    const totalsResult = await pool.query(
      `SELECT
        type,
        SUM(amount) as total,
        COUNT(*) as count,
        AVG(amount) as average
       FROM ft_transactions
       WHERE user_id = $1 ${dateFilter}
       GROUP BY type`,
      params
    );

    // Category breakdown
    const categoryResult = await pool.query(
      `SELECT
        c.name as category,
        c.icon,
        c.color,
        t.type,
        SUM(t.amount) as total,
        COUNT(*) as count
       FROM ft_transactions t
       LEFT JOIN ft_categories c ON t.category_id = c.id
       WHERE t.user_id = $1 ${dateFilter}
       GROUP BY c.name, c.icon, c.color, t.type
       ORDER BY total DESC`,
      params
    );

    // Monthly trends
    const trendsResult = await pool.query(
      `SELECT
        DATE_TRUNC('month', transaction_date) as month,
        type,
        SUM(amount) as total
       FROM ft_transactions
       WHERE user_id = $1 ${dateFilter}
       GROUP BY month, type
       ORDER BY month DESC`,
      params
    );

    res.json({
      totals: totalsResult.rows,
      byCategory: categoryResult.rows,
      monthlyTrends: trendsResult.rows
    });
  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch transaction statistics' } });
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  createTransactionFromNL,
  updateTransaction,
  deleteTransaction,
  getTransactionStats
};
