import { useState, useEffect } from 'react';
import { goalAPI } from '../services/api';
import { formatCurrency, getCurrencySymbol } from '../utils/currency';

function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [savingsGoalId, setSavingsGoalId] = useState(null);
  const [savingsAmount, setSavingsAmount] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    targetDate: ''
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await goalAPI.getAll();
      setGoals(response.data.goals || []);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', targetAmount: '', targetDate: '' });
    setShowForm(false);
    setEditingGoal(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        targetAmount: parseFloat(formData.targetAmount),
        targetDate: formData.targetDate || null
      };

      if (editingGoal) {
        await goalAPI.update(editingGoal.id, payload);
        alert('Goal updated successfully!');
      } else {
        await goalAPI.create(payload);
        alert('Goal created successfully!');
      }

      resetForm();
      fetchGoals();
    } catch (error) {
      console.error('Failed to save goal:', error);
      alert('Failed to save goal');
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || '',
      targetAmount: parseFloat(goal.target_amount).toString(),
      targetDate: goal.target_date ? goal.target_date.split('T')[0] : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (goal) => {
    if (!window.confirm(`Delete goal "${goal.title}"? This cannot be undone.`)) return;
    try {
      await goalAPI.delete(goal.id);
      fetchGoals();
    } catch (error) {
      console.error('Failed to delete goal:', error);
      alert('Failed to delete goal');
    }
  };

  const handleAddSavings = async (goal) => {
    const amount = parseFloat(savingsAmount);
    if (!amount || amount <= 0) return;

    try {
      const newAmount = parseFloat(goal.current_amount) + amount;
      const targetReached = newAmount >= parseFloat(goal.target_amount);

      await goalAPI.update(goal.id, {
        currentAmount: newAmount,
        status: targetReached ? 'completed' : goal.status
      });

      setSavingsGoalId(null);
      setSavingsAmount('');
      fetchGoals();

      if (targetReached) {
        alert(`Congratulations! You've reached your goal "${goal.title}"!`);
      }
    } catch (error) {
      console.error('Failed to add savings:', error);
      alert('Failed to add savings');
    }
  };

  const handleStatusChange = async (goal, newStatus) => {
    try {
      await goalAPI.update(goal.id, { status: newStatus });
      fetchGoals();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    }
  };

  const getProgress = (goal) => {
    const current = parseFloat(goal.current_amount) || 0;
    const target = parseFloat(goal.target_amount) || 1;
    return Math.min(100, Math.round((current / target) * 100));
  };

  const getDaysRemaining = (targetDate) => {
    if (!targetDate) return null;
    const target = new Date(targetDate);
    const now = new Date();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'cancelled': return '#6b7280';
      default: return '#3b82f6';
    }
  };

  const getProgressBarColor = (progress) => {
    if (progress >= 100) return '#10b981';
    if (progress >= 60) return '#3b82f6';
    if (progress >= 30) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');
  const cancelledGoals = goals.filter(g => g.status === 'cancelled');

  return (
    <div>
      <h1>Financial Goals</h1>

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => { if (showForm && !editingGoal) { resetForm(); } else { resetForm(); setShowForm(true); } }}
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
          {showForm && !editingGoal ? 'Cancel' : '+ Add Goal'}
        </button>
      </div>

      {/* Summary Cards */}
      {goals.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6' }}>{activeGoals.length}</div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Active Goals</div>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>{completedGoals.length}</div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Completed</div>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#667eea' }}>
              {formatCurrency(goals.reduce((sum, g) => sum + parseFloat(g.current_amount || 0), 0))}
            </div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Total Saved</div>
          </div>
        </div>
      )}

      {/* Create / Edit Form */}
      {showForm && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginTop: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g., Emergency Fund"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '16px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Description (optional)</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Save 6 months of expenses"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '16px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                Target Amount ({getCurrencySymbol()})
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                required
                placeholder="0.00"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '16px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Target Date (optional)</label>
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '16px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                style={{ flex: 1, padding: '12px', background: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '16px' }}
              >
                {editingGoal ? 'Update Goal' : 'Create Goal'}
              </button>
              {editingGoal && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={{ padding: '12px 24px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Goals List */}
      {goals.length === 0 ? (
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginTop: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <p style={{ color: '#666', textAlign: 'center', padding: '40px 0' }}>
            No financial goals yet. Click "+ Add Goal" to set your first goal!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          {goals.map((goal) => {
            const progress = getProgress(goal);
            const daysRemaining = getDaysRemaining(goal.target_date);
            const statusColor = getStatusColor(goal.status);
            const progressColor = getProgressBarColor(progress);
            const current = parseFloat(goal.current_amount) || 0;
            const target = parseFloat(goal.target_amount);

            return (
              <div
                key={goal.id}
                style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  borderLeft: `4px solid ${statusColor}`,
                  opacity: goal.status === 'cancelled' ? 0.7 : 1
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>{goal.title}</h3>
                    {goal.description && (
                      <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>{goal.description}</p>
                    )}
                  </div>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'white',
                    background: statusColor,
                    textTransform: 'capitalize'
                  }}>
                    {goal.status}
                  </span>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
                    <span style={{ fontWeight: '600', color: progressColor }}>{progress}% complete</span>
                    <span style={{ color: '#374151', fontWeight: '600' }}>
                      {formatCurrency(current)} / {formatCurrency(target)}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '10px', background: '#e5e7eb', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${progress}%`,
                      height: '100%',
                      background: progressColor,
                      borderRadius: '5px',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>

                {/* Date Info */}
                {goal.target_date && (
                  <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                    Target: {new Date(goal.target_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    {daysRemaining !== null && goal.status === 'active' && (
                      <span style={{ marginLeft: '10px', color: daysRemaining < 0 ? '#ef4444' : daysRemaining < 30 ? '#f59e0b' : '#6b7280' }}>
                        {daysRemaining < 0
                          ? `${Math.abs(daysRemaining)} days overdue`
                          : daysRemaining === 0
                            ? 'Due today'
                            : `${daysRemaining} days remaining`}
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {goal.status === 'active' && (
                    <>
                      {savingsGoalId === goal.id ? (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={savingsAmount}
                            onChange={(e) => setSavingsAmount(e.target.value)}
                            placeholder="Amount"
                            style={{ width: '120px', padding: '6px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                            autoFocus
                          />
                          <button
                            onClick={() => handleAddSavings(goal)}
                            disabled={!savingsAmount || parseFloat(savingsAmount) <= 0}
                            style={{ padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => { setSavingsGoalId(null); setSavingsAmount(''); }}
                            style={{ padding: '6px 12px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSavingsGoalId(goal.id)}
                          style={{ padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                        >
                          + Add Savings
                        </button>
                      )}
                      <button
                        onClick={() => handleStatusChange(goal, 'completed')}
                        style={{ padding: '6px 12px', background: '#dbeafe', color: '#1d4ed8', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                      >
                        Mark Complete
                      </button>
                      <button
                        onClick={() => handleStatusChange(goal, 'cancelled')}
                        style={{ padding: '6px 12px', background: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                      >
                        Cancel Goal
                      </button>
                    </>
                  )}
                  {goal.status === 'completed' && (
                    <button
                      onClick={() => handleStatusChange(goal, 'active')}
                      style={{ padding: '6px 12px', background: '#dbeafe', color: '#1d4ed8', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                    >
                      Reopen
                    </button>
                  )}
                  {goal.status === 'cancelled' && (
                    <button
                      onClick={() => handleStatusChange(goal, 'active')}
                      style={{ padding: '6px 12px', background: '#dbeafe', color: '#1d4ed8', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                    >
                      Reactivate
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(goal)}
                    style={{ padding: '6px 12px', background: '#fef3c7', color: '#92400e', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(goal)}
                    style={{ padding: '6px 12px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Goals;
