import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleQuickLogin = async (email, password, userType) => {
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(userType === 'admin' ? '/super-admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Finance Tracker</h1>
        <h2>Portfolio Demo</h2>

        <div className="demo-banner">
          No registration required - Choose a demo account to explore
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="demo-accounts">
          <div className="demo-account-card">
            <h3>Demo User</h3>
            <p>Explore all finance tracking features</p>
            <ul className="features-list">
              <li>Track transactions (up to 50)</li>
              <li>Create budgets and goals</li>
              <li>AI-powered insights</li>
              <li>Financial advice chatbot</li>
            </ul>
            <button
              onClick={() => handleQuickLogin('demo@financetracker.com', 'demo123', 'demo')}
              disabled={loading}
              className="btn-demo"
            >
              {loading ? 'Logging in...' : 'Login as Demo User'}
            </button>
            <div className="credentials">
              <small>Email: demo@financetracker.com</small>
              <small>Password: demo123</small>
            </div>
          </div>

          <div className="demo-account-card admin">
            <h3>Super Admin</h3>
            <p>Manage AI configuration</p>
            <ul className="features-list">
              <li>Configure AI instructions</li>
              <li>Set global AI behavior</li>
              <li>Manage categorization rules</li>
              <li>Budget recommendation settings</li>
            </ul>
            <button
              onClick={() => handleQuickLogin('admin@financetracker.com', 'admin123', 'admin')}
              disabled={loading}
              className="btn-admin"
            >
              {loading ? 'Logging in...' : 'Login as Super Admin'}
            </button>
            <div className="credentials">
              <small>Email: admin@financetracker.com</small>
              <small>Password: admin123</small>
            </div>
          </div>
        </div>

        <div className="portfolio-note">
          <p>This is a portfolio demonstration project showcasing AI-powered personal finance tracking capabilities.</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
