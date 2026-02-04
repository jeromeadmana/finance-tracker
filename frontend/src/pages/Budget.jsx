import { useState, useEffect } from 'react';
import { budgetAPI, categoryAPI, aiAPI } from '../services/api';
import { formatCurrency, getCurrencySymbol } from '../utils/currency';

function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    period: 'monthly'
  });

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, []);

  const fetchBudgets = async () => {
    try {
      const response = await budgetAPI.getAll();
      setBudgets(response.data.budgets || []);
    } catch (error) {
      console.error('Failed to fetch budgets:', error);
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await budgetAPI.create({
        category_id: formData.categoryId,
        amount: parseFloat(formData.amount),
        period: formData.period
      });

      setFormData({ categoryId: '', amount: '', period: 'monthly' });
      setShowForm(false);
      fetchBudgets();
      alert('Budget created successfully!');
    } catch (error) {
      console.error('Failed to create budget:', error);
      alert('Failed to create budget');
    }
  };

  const handleAISuggestions = async () => {
    setAiLoading(true);
    try {
      const response = await aiAPI.getBudgetRecommendations(0); // Will analyze transactions
      alert('AI Budget Suggestions feature coming soon! The AI will analyze your spending patterns and suggest budgets.');
    } catch (error) {
      console.error('Failed to get AI suggestions:', error);
      alert('Failed to get AI suggestions');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  return (
    <div>
      <h1>Budget Management</h1>

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '12px 24px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          {showForm ? 'Cancel' : '+ Create Budget'}
        </button>

        <button
          onClick={handleAISuggestions}
          disabled={aiLoading}
          style={{
            padding: '12px 24px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: aiLoading ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            opacity: aiLoading ? 0.6 : 1
          }}
        >
          {aiLoading ? 'Analyzing...' : '✨ AI Budget Suggestions'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginTop: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2>Create New Budget</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                Category
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              >
                <option value="">Select a category</option>
                {expenseCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                Amount ({getCurrencySymbol()})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                placeholder="0.00"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                Period
              </label>
              <select
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '16px'
              }}
            >
              Create Budget
            </button>
          </form>
        </div>
      )}

      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginTop: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2>Your Budgets</h2>
        {budgets.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: '40px 0' }}>
            No budgets created yet. Click "Create Budget" above to add your first budget!
          </p>
        ) : (
          <div>
            {budgets.map((budget) => (
              <div key={budget.id} style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0' }}>{budget.category_name || 'General'}</h3>
                    <p style={{ margin: 0, color: '#666', fontSize: '14px', textTransform: 'capitalize' }}>
                      {budget.period}
                    </p>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>
                    {formatCurrency(budget.amount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Budget;
