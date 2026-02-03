import { useState, useEffect } from 'react';
import { budgetAPI } from '../services/api';

function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const response = await budgetAPI.getAll();
      setBudgets(response.data.budgets);
    } catch (error) {
      console.error('Failed to fetch budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Budget Management</h1>

      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginTop: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2>Your Budgets</h2>
        {budgets.length === 0 ? (
          <p>No budgets created yet. Create your first budget to start tracking your spending!</p>
        ) : (
          <div>
            {budgets.map((budget) => (
              <div key={budget.id} style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0' }}>{budget.category_name || 'General'}</h3>
                    <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{budget.period}</p>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>
                    ${parseFloat(budget.amount).toFixed(2)}
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
