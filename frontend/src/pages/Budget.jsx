import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { budgetAPI, categoryAPI, aiAPI } from '../services/api';
import { formatCurrency, getCurrencySymbol } from '../utils/currency';
import { useAuth } from '../contexts/AuthContext';

function Budget() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [tempIncome, setTempIncome] = useState('');
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
    // Check if user has income set in profile
    if (!user?.monthlyIncome) {
      setShowIncomeModal(true);
      return;
    }

    // User has income in profile, proceed directly
    await generateRecommendations(user.monthlyIncome);
  };

  const generateRecommendations = async (income) => {
    setAiLoading(true);
    try {
      const response = await aiAPI.getBudgetRecommendations(income);
      const recs = response.data.recommendations;
      const source = response.data.incomeSource;

      let message = `AI Budget Recommendations Generated!\n\n`;
      message += `Based on ${source === 'profile' ? `your monthly income of $${income}` :
                             source === 'request' ? `monthly income of $${income}` :
                             'your spending patterns'}\n\n`;
      message += `Recommendations:\n${JSON.stringify(recs, null, 2)}`;

      alert(message);
    } catch (error) {
      console.error('Failed to get AI suggestions:', error);
      alert('Failed to get AI suggestions. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleIncomeModalSubmit = async () => {
    const income = tempIncome ? parseFloat(tempIncome) : null;
    setShowIncomeModal(false);
    await generateRecommendations(income);
    setTempIncome('');
  };

  const handleSetInProfile = () => {
    setShowIncomeModal(false);
    navigate('/profile');
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

      {showIncomeModal && (
        <div className="modal-overlay" onClick={() => setShowIncomeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <h3>Monthly Income for Budget Recommendations</h3>
            <p style={{ marginBottom: '20px' }}>To provide personalized budget recommendations, we need information about your income.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ padding: '15px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>
                  Enter income for this recommendation:
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={tempIncome}
                  onChange={(e) => setTempIncome(e.target.value)}
                  placeholder="0.00"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '16px',
                    marginBottom: '10px'
                  }}
                />
                <button
                  onClick={handleIncomeModalSubmit}
                  disabled={!tempIncome}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: tempIncome ? '#667eea' : '#9ca3af',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: tempIncome ? 'pointer' : 'not-allowed',
                    fontWeight: '600'
                  }}
                >
                  Generate Recommendations
                </button>
              </div>

              <div style={{ textAlign: 'center', color: '#6b7280', fontWeight: '500' }}>OR</div>

              <div style={{ padding: '15px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <p style={{ marginBottom: '10px', fontSize: '14px' }}>Save income to your profile for future use</p>
                <button
                  onClick={handleSetInProfile}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Set in Profile
                </button>
              </div>

              <div style={{ textAlign: 'center', color: '#6b7280', fontWeight: '500' }}>OR</div>

              <div style={{ padding: '15px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <p style={{ marginBottom: '10px', fontSize: '14px' }}>Skip if you have variable income (gig/project work)</p>
                <button
                  onClick={() => {
                    setShowIncomeModal(false);
                    generateRecommendations(null);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Get Spending-Based Recommendations
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Budget;
