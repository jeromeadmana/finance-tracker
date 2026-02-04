import { useState, useEffect } from 'react';
import { transactionAPI } from '../services/api';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nlInput, setNlInput] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await transactionAPI.getAll();
      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNLSubmit = async (e) => {
    e.preventDefault();
    if (!nlInput.trim()) return;

    try {
      await transactionAPI.createFromNL(nlInput);
      setNlInput('');
      fetchTransactions();
      alert('Transaction created successfully!');
    } catch (error) {
      alert('Failed to create transaction');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Transactions</h1>

      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3>Natural Language Entry</h3>
        <form onSubmit={handleNLSubmit} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={nlInput}
            onChange={(e) => setNlInput(e.target.value)}
            placeholder="e.g., Spent $45 on groceries at Whole Foods yesterday"
            style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '16px' }}
          />
          <button type="submit" style={{ padding: '12px 24px', background: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Add
          </button>
        </form>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2>Recent Transactions</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>Date</th>
              <th style={{ padding: '12px' }}>Description</th>
              <th style={{ padding: '12px' }}>Category</th>
              <th style={{ padding: '12px' }}>Amount</th>
              <th style={{ padding: '12px' }}>Type</th>
            </tr>
          </thead>
          <tbody>
            {transactions && transactions.length > 0 ? (
              transactions.map((transaction) => (
                <tr key={transaction.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{new Date(transaction.transaction_date).toLocaleDateString()}</td>
                  <td style={{ padding: '12px' }}>{transaction.description}</td>
                  <td style={{ padding: '12px' }}>{transaction.category_name || 'Uncategorized'}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: transaction.type === 'income' ? '#10b981' : '#ef4444' }}>
                    ${parseFloat(transaction.amount).toFixed(2)}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      background: transaction.type === 'income' ? '#d1fae5' : '#fee2e2',
                      color: transaction.type === 'income' ? '#065f46' : '#991b1b'
                    }}>
                      {transaction.type}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                  No transactions yet. Add your first transaction above!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Transactions;
