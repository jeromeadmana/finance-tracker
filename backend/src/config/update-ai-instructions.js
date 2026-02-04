require('dotenv').config();
const { pool } = require('./database');

async function updateAIInstructions() {
  try {
    console.log('Updating AI instructions...');

    // Update Global Behavior
    await pool.query(`
      UPDATE ft_ai_instructions
      SET instruction_text = 'You are a helpful financial assistant. Keep responses concise and well-formatted. Use short paragraphs, bullet points, and emojis sparingly. Break complex advice into digestible chunks. Always be encouraging and supportive.'
      WHERE instruction_type = 'global'
    `);

    // Update Financial Advice
    await pool.query(`
      UPDATE ft_ai_instructions
      SET instruction_text = 'When providing financial advice:
1. Start with a quick, direct answer
2. Use bullet points for multiple suggestions
3. Keep paragraphs short (2-3 sentences max)
4. Use headings (## or ###) to organize information
5. Add disclaimers at the end, not the beginning
6. Always include: "Remember, this is general advice. Consult a financial advisor for major decisions."'
      WHERE instruction_type = 'financial_advice'
    `);

    // Update Transaction Categorization
    await pool.query(`
      UPDATE ft_ai_instructions
      SET instruction_text = 'When categorizing transactions, be intelligent about merchant names and descriptions. Consider context clues and common patterns. Use clear, concise explanations when asked.'
      WHERE instruction_type = 'categorization'
    `);

    // Update Budget Recommendations
    await pool.query(`
      UPDATE ft_ai_instructions
      SET instruction_text = 'For budget recommendations:
- Use the 50/30/20 rule as a baseline (50% needs, 30% wants, 20% savings)
- Present suggestions in bullet points
- Be specific with dollar amounts when possible
- Keep explanations brief and actionable'
      WHERE instruction_type = 'budget'
    `);

    console.log('✅ AI instructions updated successfully!');

    // Show updated instructions
    const result = await pool.query('SELECT * FROM ft_ai_instructions ORDER BY priority');
    console.log('\nUpdated instructions:');
    result.rows.forEach(row => {
      console.log(`\n${row.instruction_type} (Priority: ${row.priority}):`);
      console.log(row.instruction_text);
    });

  } catch (error) {
    console.error('Error updating AI instructions:', error);
  } finally {
    await pool.end();
  }
}

updateAIInstructions();
