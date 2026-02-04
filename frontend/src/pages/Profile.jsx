import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, getCurrencySymbol } from '../utils/currency';
import './Profile.css';

function Profile() {
  const { user, updateProfile } = useAuth();
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [hasIncome, setHasIncome] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user?.monthlyIncome !== null && user?.monthlyIncome !== undefined) {
      setMonthlyIncome(user.monthlyIncome.toString());
      setHasIncome(true);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const incomeValue = hasIncome && monthlyIncome
        ? parseFloat(monthlyIncome)
        : null;

      await updateProfile({ monthlyIncome: incomeValue });

      setMessage({
        type: 'success',
        text: 'Profile updated successfully!'
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      setMessage({
        type: 'error',
        text: 'Failed to update profile. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleIncomeToggle = (value) => {
    setHasIncome(value);
    if (!value) {
      setMonthlyIncome('');
    }
  };

  return (
    <div className="profile-page">
      <h1>Profile Settings</h1>

      <div className="profile-card">
        <div className="profile-section">
          <h2>Account Information</h2>
          <div className="info-row">
            <label>Email:</label>
            <span>{user?.email}</span>
          </div>
          <div className="info-row">
            <label>Name:</label>
            <span>{user?.firstName} {user?.lastName}</span>
          </div>
          <div className="info-row">
            <label>Role:</label>
            <span className="role-badge">{user?.role === 'super_admin' ? 'Admin' : 'User'}</span>
          </div>
        </div>

        <div className="profile-section">
          <h2>Financial Settings</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="section-label">Do you have a fixed monthly income?</label>
              <p className="help-text">
                If you're a gig worker, freelancer, or have variable income, select "No".
                The AI will still provide budget recommendations based on your spending patterns.
              </p>

              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    checked={hasIncome}
                    onChange={() => handleIncomeToggle(true)}
                  />
                  <span>Yes, I have fixed monthly income</span>
                </label>

                <label className="radio-option">
                  <input
                    type="radio"
                    checked={!hasIncome}
                    onChange={() => handleIncomeToggle(false)}
                  />
                  <span>No, my income varies (gig/project work)</span>
                </label>
              </div>
            </div>

            {hasIncome && (
              <div className="form-group">
                <label htmlFor="monthlyIncome">
                  Monthly Income ({getCurrencySymbol()})
                </label>
                <input
                  type="number"
                  id="monthlyIncome"
                  step="0.01"
                  min="0"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  placeholder="0.00"
                  required={hasIncome}
                  className="income-input"
                />
                <p className="help-text">
                  This will be used for AI budget recommendations based on the 50/30/20 rule.
                </p>
              </div>
            )}

            {message.text && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="save-button"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
