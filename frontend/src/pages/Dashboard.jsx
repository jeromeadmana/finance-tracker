import { useState, useEffect } from 'react';
import { transactionAPI } from '../services/api';
import { formatCurrency } from '../utils/currency';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await transactionAPI.getStats({
        startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const income = stats?.totals?.find(t => t.type === 'income')?.total || 0;
  const expenses = stats?.totals?.find(t => t.type === 'expense')?.total || 0;
  const balance = income - expenses;

  return (
    <div>
      <h1>Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Income</h3>
          <p style={{ fontSize: '28px', margin: 0, color: '#10b981' }}>{formatCurrency(income)}</p>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Expenses</h3>
          <p style={{ fontSize: '28px', margin: 0, color: '#ef4444' }}>{formatCurrency(expenses)}</p>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Balance</h3>
          <p style={{ fontSize: '28px', margin: 0, color: balance >= 0 ? '#10b981' : '#ef4444' }}>
            {formatCurrency(balance)}
          </p>
        </div>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginTop: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2>Top Spending Categories</h2>
        {stats?.byCategory?.filter(c => c.type === 'expense').slice(0, 5).map((cat, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
            <span>{cat.category || 'Uncategorized'}</span>
            <span style={{ fontWeight: 'bold' }}>{formatCurrency(cat.total)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
