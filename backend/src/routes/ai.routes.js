const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { restrictSuperAdminAccess } = require('../middleware/demo.middleware');
const { pool } = require('../config/database');
const {
  getFinancialAdvice,
  generateBudgetRecommendations,
  analyzeSpendingPatterns
} = require('../services/openai.service');

router.use(authenticateToken);
router.use(restrictSuperAdminAccess);

// AI Financial Advice Chatbot
router.post('/chat', async (req, res) => {
  try {
    const { question, context } = req.body;

    if (!question) {
      return res.status(400).json({ error: { message: 'Question is required' } });
    }

    const result = await getFinancialAdvice(req.user.id, question, context);

    res.json({
      response: result.response,
      tokensUsed: result.tokensUsed
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: { message: 'Failed to get AI response' } });
  }
});

// Generate Budget Recommendations
router.post('/budget-recommendations', async (req, res) => {
  try {
    const { monthlyIncome: requestIncome } = req.body;

    // Get user's stored monthly income
    const userResult = await pool.query(
      'SELECT monthly_income FROM ft_users WHERE id = $1',
      [req.user.id]
    );

    const storedIncome = userResult.rows[0]?.monthly_income;

    // Priority: request income > stored income > null (for variable income workers)
    const incomeToUse = requestIncome !== undefined ? requestIncome : storedIncome;

    const recommendations = await generateBudgetRecommendations(
      req.user.id,
      incomeToUse
    );

    res.json({
      recommendations,
      incomeUsed: incomeToUse,
      incomeSource: requestIncome !== undefined ? 'request' :
                    storedIncome !== null ? 'profile' : 'none'
    });
  } catch (error) {
    console.error('Budget recommendations error:', error);
    res.status(500).json({ error: { message: 'Failed to generate budget recommendations' } });
  }
});

// Analyze Spending Patterns
router.get('/spending-analysis', async (req, res) => {
  try {
    const { period } = req.query;

    const analysis = await analyzeSpendingPatterns(req.user.id, period || 'month');

    res.json(analysis);
  } catch (error) {
    console.error('Spending analysis error:', error);
    res.status(500).json({ error: { message: 'Failed to analyze spending patterns' } });
  }
});

module.exports = router;
