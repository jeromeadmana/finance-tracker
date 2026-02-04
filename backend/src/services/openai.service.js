const OpenAI = require('openai');
const { pool } = require('../config/database');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Get all active AI instructions from super admin
const getAdminInstructions = async () => {
  try {
    const result = await pool.query(
      `SELECT instruction_type, instruction_text, priority
       FROM ft_ai_instructions
       WHERE is_active = true
       ORDER BY priority DESC, created_at ASC`
    );

    return result.rows;
  } catch (error) {
    console.error('Error fetching admin instructions:', error);
    return [];
  }
};

// Get admin settings
const getAdminSettings = async () => {
  try {
    const result = await pool.query(
      'SELECT setting_key, setting_value FROM ft_admin_settings'
    );

    const settings = {};
    result.rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });

    return settings;
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    return {};
  }
};

// Build system prompt with admin instructions
const buildSystemPrompt = async (instructionType = 'global') => {
  const instructions = await getAdminInstructions();

  let systemPrompt = 'You are a helpful AI financial assistant for a personal finance tracking application.\n\n';

  // Add relevant instructions
  const relevantInstructions = instructions.filter(
    inst => inst.instruction_type === 'global' || inst.instruction_type === instructionType
  );

  if (relevantInstructions.length > 0) {
    systemPrompt += '=== Administrator Guidelines ===\n';
    relevantInstructions.forEach(inst => {
      systemPrompt += `${inst.instruction_text}\n\n`;
    });
  }

  return systemPrompt;
};

// Categorize transaction using AI
const categorizeTransaction = async (description, amount, merchant = null) => {
  try {
    const settings = await getAdminSettings();

    if (settings.auto_categorization_enabled === 'false') {
      return null;
    }

    // Get ft_categories (both income and expense)
    const ft_categoriesResult = await pool.query(
      `SELECT id, name, type FROM ft_categories ORDER BY type, name`
    );

    const ft_categories = ft_categoriesResult.rows.map(cat => ({
      id: cat.id,
      name: cat.name,
      type: cat.type
    }));

    const systemPrompt = await buildSystemPrompt('categorization');
    const userPrompt = `Categorize the following transaction:
Description: ${description}
Amount: $${amount}
${merchant ? `Merchant: ${merchant}` : ''}

Available categories (grouped by type):
INCOME CATEGORIES:
${ft_categories.filter(cat => cat.type === 'income').map(cat => `- ${cat.name} (ID: ${cat.id})`).join('\n')}

EXPENSE CATEGORIES:
${ft_categories.filter(cat => cat.type === 'expense').map(cat => `- ${cat.name} (ID: ${cat.id})`).join('\n')}

IMPORTANT: If the description suggests this is income (received, earned, paid to me, salary, etc.), choose an INCOME category. Otherwise, choose an EXPENSE category.

Return ONLY a JSON object with the category_id and confidence (0-1). Example: {"category_id": "uuid-here", "confidence": 0.95}`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 100
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result;
  } catch (error) {
    console.error('AI categorization error:', error);
    return null;
  }
};

// Parse natural language transaction
const parseNaturalLanguageTransaction = async (input) => {
  try {
    const systemPrompt = await buildSystemPrompt('categorization');
    const userPrompt = `Parse the following natural language transaction input into structured data:

"${input}"

Extract:
- amount (number)
- description (string)
- merchant (string, if mentioned)
- date (YYYY-MM-DD format, use today if not specified: ${new Date().toISOString().split('T')[0]})
- type (income or expense)

Return ONLY a JSON object. Example:
{
  "amount": 45.50,
  "description": "Groceries",
  "merchant": "Whole Foods",
  "date": "2024-01-15",
  "type": "expense"
}`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 200
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result;
  } catch (error) {
    console.error('NL parsing error:', error);
    throw error;
  }
};

// Financial advice chatbot
const getFinancialAdvice = async (userId, question, context = {}) => {
  try {
    const settings = await getAdminSettings();

    if (settings.chatbot_enabled === 'false') {
      return {
        response: 'AI chatbot is currently disabled by the administrator.',
        tokensUsed: 0
      };
    }

    // Get user's transaction summary for context
    const ft_transactionsResult = await pool.query(
      `SELECT
        type,
        SUM(amount) as total,
        COUNT(*) as count
       FROM ft_transactions
       WHERE user_id = $1 AND transaction_date >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY type`,
      [userId]
    );

    let userContext = '\n=== User Financial Context (Last 30 days) ===\n';
    ft_transactionsResult.rows.forEach(row => {
      userContext += `${row.type}: $${parseFloat(row.total).toFixed(2)} (${row.count} ft_transactions)\n`;
    });

    const systemPrompt = await buildSystemPrompt('financial_advice');
    const userPrompt = `${userContext}\n\nUser Question: ${question}`;

    const maxTokens = parseInt(settings.max_tokens_per_request || '1000');

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: maxTokens
    });

    const answer = response.choices[0].message.content;
    const tokensUsed = response.usage.total_tokens;

    // Save to chat history
    await pool.query(
      `INSERT INTO ft_ai_chat_history (user_id, message, response, tokens_used, context)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, question, answer, tokensUsed, JSON.stringify(context)]
    );

    return {
      response: answer,
      tokensUsed
    };
  } catch (error) {
    console.error('Financial advice error:', error);
    throw error;
  }
};

// Generate budget recommendations
const generateBudgetRecommendations = async (userId, monthlyIncome = null) => {
  try {
    const systemPrompt = await buildSystemPrompt('budget');

    // Get user's spending history
    const spendingResult = await pool.query(
      `SELECT
        c.name as category,
        AVG(t.amount) as avg_amount,
        SUM(t.amount) as total_amount
       FROM ft_transactions t
       JOIN ft_categories c ON t.category_id = c.id
       WHERE t.user_id = $1
         AND t.type = 'expense'
         AND t.transaction_date >= CURRENT_DATE - INTERVAL '90 days'
       GROUP BY c.name
       ORDER BY total_amount DESC`,
      [userId]
    );

    let spendingContext = '\n=== User Spending History (Last 90 days) ===\n';
    const totalSpending = spendingResult.rows.reduce(
      (sum, row) => sum + parseFloat(row.total_amount),
      0
    );

    spendingResult.rows.forEach(row => {
      spendingContext += `${row.category}: $${parseFloat(row.total_amount).toFixed(2)}\n`;
    });
    spendingContext += `Total Spending (90 days): $${totalSpending.toFixed(2)}\n`;
    spendingContext += `Average Monthly Spending: $${(totalSpending / 3).toFixed(2)}\n`;

    let userPrompt;

    if (monthlyIncome !== null && monthlyIncome !== undefined) {
      // User has provided or stored monthly income
      userPrompt = `Generate personalized budget recommendations for a user with monthly income of $${monthlyIncome}.

${spendingContext}

Provide budget allocations for major categories (Housing, Food, Transportation, Savings, etc.) with specific dollar amounts and percentages. Be practical and consider their spending history.

Return as JSON array:
[
  {"category": "Housing", "amount": 1500, "percentage": 30},
  {"category": "Food", "amount": 500, "percentage": 10},
  ...
]`;
    } else {
      // Variable income worker - no fixed monthly income
      userPrompt = `Generate personalized budget recommendations for a user with VARIABLE INCOME (gig/project worker).

${spendingContext}

Since the user doesn't have fixed monthly income, provide budget recommendations based on their spending patterns. Suggest:
1. Essential spending categories with recommended amounts based on their history
2. Flexible spending targets
3. Emergency fund recommendations (in months of expenses, not dollars)
4. Tips for managing variable income

Return as JSON array with practical suggestions:
[
  {"category": "Essential Expenses", "amount": 2000, "note": "Based on your average spending"},
  {"category": "Emergency Fund", "amount": 6000, "note": "3 months of expenses recommended"},
  {"category": "Variable Buffer", "amount": 500, "note": "For income fluctuations"},
  ...
]`;
    }

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.5,
      max_tokens: 800
    });

    const recommendations = JSON.parse(response.choices[0].message.content);
    return recommendations;
  } catch (error) {
    console.error('Budget recommendations error:', error);
    throw error;
  }
};

// Analyze spending patterns
const analyzeSpendingPatterns = async (userId, period = 'month') => {
  try {
    const systemPrompt = await buildSystemPrompt('financial_advice');

    // Get detailed transaction data
    const ft_transactionsResult = await pool.query(
      `SELECT
        t.amount,
        t.description,
        t.transaction_date,
        c.name as category
       FROM ft_transactions t
       LEFT JOIN ft_categories c ON t.category_id = c.id
       WHERE t.user_id = $1
         AND t.type = 'expense'
         AND t.transaction_date >= CURRENT_DATE - INTERVAL '1 ${period}'
       ORDER BY t.transaction_date DESC`,
      [userId]
    );

    const ft_transactions = ft_transactionsResult.rows;
    const totalSpent = ft_transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const userPrompt = `Analyze the following spending data and provide insights:

Total Spent: $${totalSpent.toFixed(2)}
Number of Transactions: ${ft_transactions.length}

Top Transactions:
${ft_transactions.slice(0, 20).map(t =>
  `- $${parseFloat(t.amount).toFixed(2)} on ${t.description} (${t.category || 'Uncategorized'}) - ${t.transaction_date}`
).join('\n')}

Provide:
1. Key spending patterns
2. Unusual or concerning spending
3. Recommendations for improvement
4. Potential savings opportunities`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    return {
      analysis: response.choices[0].message.content,
      totalSpent,
      transactionCount: ft_transactions.length
    };
  } catch (error) {
    console.error('Spending analysis error:', error);
    throw error;
  }
};

module.exports = {
  categorizeTransaction,
  parseNaturalLanguageTransaction,
  getFinancialAdvice,
  generateBudgetRecommendations,
  analyzeSpendingPatterns,
  getAdminInstructions,
  getAdminSettings
};
