import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import './SuperAdmin.css';

function SuperAdmin() {
  const [aiInstructions, setAiInstructions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    instructionType: 'global',
    instructionText: '',
    priority: 0,
    isActive: true
  });

  useEffect(() => {
    fetchAIInstructions();
  }, []);

  const fetchAIInstructions = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAIInstructions();
      setAiInstructions(response.data.instructions);
    } catch (error) {
      console.error('Failed to fetch AI instructions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await adminAPI.updateAIInstruction(editingId, formData);
      } else {
        await adminAPI.createAIInstruction(formData);
      }

      fetchAIInstructions();
      resetForm();
    } catch (error) {
      console.error('Failed to save AI instruction:', error);
      alert('Failed to save instruction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (instruction) => {
    setEditingId(instruction.id);
    setFormData({
      instructionType: instruction.instruction_type,
      instructionText: instruction.instruction_text,
      priority: instruction.priority,
      isActive: instruction.is_active
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this instruction?')) {
      return;
    }

    setLoading(true);
    try {
      await adminAPI.deleteAIInstruction(id);
      fetchAIInstructions();
    } catch (error) {
      console.error('Failed to delete AI instruction:', error);
      alert('Failed to delete instruction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      instructionType: 'global',
      instructionText: '',
      priority: 0,
      isActive: true
    });
    setShowAddForm(false);
  };

  const instructionTypes = [
    { value: 'global', label: 'Global Behavior' },
    { value: 'financial_advice', label: 'Financial Advice' },
    { value: 'categorization', label: 'Transaction Categorization' },
    { value: 'budget', label: 'Budget Recommendations' }
  ];

  return (
    <div className="super-admin">
      <div className="admin-header">
        <div>
          <h1>AI Instructions Management</h1>
          <p className="subtitle">Configure global AI behavior for all users</p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            + Add New Instruction
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="instruction-form-card">
          <h2>{editingId ? 'Edit Instruction' : 'Add New Instruction'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Instruction Type</label>
              <select
                value={formData.instructionType}
                onChange={(e) => setFormData({ ...formData, instructionType: e.target.value })}
                required
              >
                {instructionTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Instruction Text</label>
              <textarea
                value={formData.instructionText}
                onChange={(e) => setFormData({ ...formData, instructionText: e.target.value })}
                required
                rows={6}
                placeholder="Enter the instruction that will guide the AI's behavior..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Priority</label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  min="0"
                  max="100"
                />
                <small>Higher priority instructions are applied first</small>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span>Active</span>
                </label>
                <small>Only active instructions are used by the AI</small>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Saving...' : editingId ? 'Update Instruction' : 'Create Instruction'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="instructions-list">
        {loading && !showAddForm && <div className="loading">Loading...</div>}

        {!loading && aiInstructions.length === 0 && (
          <div className="empty-state">
            <p>No AI instructions configured yet.</p>
            <button onClick={() => setShowAddForm(true)} className="btn-primary">
              Create First Instruction
            </button>
          </div>
        )}

        {aiInstructions.map(instruction => (
          <div key={instruction.id} className={`instruction-card ${!instruction.is_active ? 'inactive' : ''}`}>
            <div className="instruction-header">
              <div>
                <span className="instruction-type-badge">
                  {instructionTypes.find(t => t.value === instruction.instruction_type)?.label}
                </span>
                <span className={`status-badge ${instruction.is_active ? 'active' : 'inactive'}`}>
                  {instruction.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="instruction-actions">
                <button
                  onClick={() => handleEdit(instruction)}
                  className="btn-icon"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(instruction.id)}
                  className="btn-icon danger"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div className="instruction-content">
              <p>{instruction.instruction_text}</p>
            </div>

            <div className="instruction-footer">
              <span>Priority: {instruction.priority}</span>
              <span>Created: {new Date(instruction.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="info-box">
        <h3>About AI Instructions</h3>
        <p>
          AI Instructions control how the AI assistant behaves across the entire application.
          These instructions are applied to all AI features including transaction categorization,
          financial advice, and budget recommendations.
        </p>
        <ul>
          <li><strong>Global:</strong> General behavior and personality of the AI</li>
          <li><strong>Financial Advice:</strong> Guidelines for providing financial guidance</li>
          <li><strong>Categorization:</strong> Rules for categorizing transactions</li>
          <li><strong>Budget:</strong> Principles for budget recommendations</li>
        </ul>
      </div>
    </div>
  );
}

export default SuperAdmin;
