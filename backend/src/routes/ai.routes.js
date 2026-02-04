const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { restrictSuperAdminAccess } = require('../middleware/demo.middleware');
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
    const { monthlyIncome } = req.body;

    if (!monthlyIncome) {
      return res.status(400).json({ error: { message: 'Monthly income is required' } });
    }

    const recommendations = await generateBudgetRecommendations(req.user.id, monthlyIncome);

    res.json({ recommendations });
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
