import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { demoAPI } from '../services/api';
import './Layout.css';

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [demoStats, setDemoStats] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Fetch demo stats for demo user
  useEffect(() => {
    if (user?.role === 'user') {
      fetchDemoStats();
    }
  }, [user]);

  // Listen for transaction creation events
  useEffect(() => {
    const handleTransactionCreated = () => {
      if (user?.role === 'user') {
        fetchDemoStats();
      }
    };

    window.addEventListener('transactionCreated', handleTransactionCreated);
    return () => window.removeEventListener('transactionCreated', handleTransactionCreated);
  }, [user]);

  const fetchDemoStats = async () => {
    try {
      const response = await demoAPI.getStats();
      setDemoStats(response.data);
    } catch (error) {
      console.error('Failed to fetch demo stats:', error);
    }
  };

  const handleResetData = async () => {
    setResetting(true);
    try {
      await demoAPI.resetData();
      setShowResetConfirm(false);
      fetchDemoStats();
      // Refresh the page to update all data
      window.location.reload();
    } catch (error) {
      console.error('Failed to reset demo data:', error);
      alert('Failed to reset data. Please try again.');
    } finally {
      setResetting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isDemoUser = user?.role === 'user';
  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>Finance Tracker</h2>
          <p className="user-name">{user?.firstName} {user?.lastName}</p>
          <span className={`role-badge ${user?.role}`}>
            {user?.role === 'super_admin' ? 'Super Admin' : 'Demo User'}
          </span>
        </div>

        {isDemoUser && demoStats && (
          <div className="demo-stats">
            <div className="stat-item">
              <span className="stat-label">Transactions</span>
              <span className={`stat-value ${demoStats.limitReached ? 'limit-reached' : ''}`}>
                {demoStats.transactionCount} / {demoStats.transactionLimit}
              </span>
            </div>
            {demoStats.remaining <= 10 && demoStats.remaining > 0 && (
              <div className="warning-message">
                Only {demoStats.remaining} transactions remaining
              </div>
            )}
            {demoStats.limitReached && (
              <div className="error-message">
                Limit reached! Reset data to continue.
              </div>
            )}
          </div>
        )}

        <ul className="nav-menu">
          {isDemoUser && (
            <>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/transactions">Transactions</Link></li>
              <li><Link to="/budget">Budget</Link></li>
              <li><Link to="/ai-chat">AI Assistant</Link></li>
            </>
          )}
          {isSuperAdmin && (
            <li><Link to="/super-admin">AI Instructions</Link></li>
          )}
        </ul>

        {isDemoUser && (
          <div className="demo-actions">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="reset-btn"
              title="Delete all your demo data"
            >
              Reset Demo Data
            </button>
          </div>
        )}

        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>

      {showResetConfirm && (
        <div className="modal-overlay" onClick={() => !resetting && setShowResetConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Reset Demo Data?</h3>
            <p>This will permanently delete:</p>
            <ul>
              <li>All transactions</li>
              <li>All budgets</li>
              <li>All financial goals</li>
              <li>All AI chat history</li>
            </ul>
            <p className="warning-text">This action cannot be undone!</p>
            <div className="modal-actions">
              <button
                onClick={() => setShowResetConfirm(false)}
                disabled={resetting}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleResetData}
                disabled={resetting}
                className="btn-danger"
              >
                {resetting ? 'Resetting...' : 'Yes, Reset All Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Layout;
