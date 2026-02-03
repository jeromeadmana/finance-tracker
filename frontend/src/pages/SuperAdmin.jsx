import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

function SuperAdmin() {
  const [activeTab, setActiveTab] = useState('instructions');
  const [aiInstructions, setAiInstructions] = useState([]);
  const [settings, setSettings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'instructions') {
      fetchAIInstructions();
    } else if (activeTab === 'settings') {
      fetchSettings();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

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

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getSettings();
      setSettings(response.data.settings);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAllUsers();
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Super Admin Panel</h1>

      <div style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #eee', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab('instructions')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'instructions' ? '#667eea' : 'transparent',
              color: activeTab === 'instructions' ? 'white' : '#666',
              border: 'none',
              borderBottom: activeTab === 'instructions' ? '3px solid #667eea' : 'none',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            AI Instructions
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'settings' ? '#667eea' : 'transparent',
              color: activeTab === 'settings' ? 'white' : '#666',
              border: 'none',
              borderBottom: activeTab === 'settings' ? '3px solid #667eea' : 'none',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'users' ? '#667eea' : 'transparent',
              color: activeTab === 'users' ? 'white' : '#666',
              border: 'none',
              borderBottom: activeTab === 'users' ? '3px solid #667eea' : 'none',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Users
          </button>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            {activeTab === 'instructions' && (
              <div>
                <h2>AI Instructions</h2>
                <p style={{ color: '#666', marginBottom: '20px' }}>Configure global AI behavior for all users</p>
                {aiInstructions.map((instruction) => (
                  <div key={instruction.id} style={{ padding: '15px', border: '1px solid #eee', borderRadius: '8px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0', color: '#667eea' }}>{instruction.instruction_type}</h4>
                        <p style={{ margin: 0, color: '#333' }}>{instruction.instruction_text}</p>
                        <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#999' }}>
                          Priority: {instruction.priority} | Status: {instruction.is_active ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h2>System Settings</h2>
                <p style={{ color: '#666', marginBottom: '20px' }}>Configure system-wide settings</p>
                {settings.map((setting) => (
                  <div key={setting.id} style={{ padding: '15px', border: '1px solid #eee', borderRadius: '8px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0' }}>{setting.setting_key}</h4>
                        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{setting.description}</p>
                      </div>
                      <div style={{ fontWeight: 'bold', color: '#667eea' }}>{setting.setting_value}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <h2>User Management</h2>
                <p style={{ color: '#666', marginBottom: '20px' }}>Manage user accounts and roles</p>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                      <th style={{ padding: '12px' }}>Email</th>
                      <th style={{ padding: '12px' }}>Name</th>
                      <th style={{ padding: '12px' }}>Role</th>
                      <th style={{ padding: '12px' }}>Status</th>
                      <th style={{ padding: '12px' }}>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px' }}>{user.email}</td>
                        <td style={{ padding: '12px' }}>{user.first_name} {user.last_name}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            background: user.role === 'super_admin' ? '#fef3c7' : user.role === 'admin' ? '#dbeafe' : '#f3f4f6',
                            color: user.role === 'super_admin' ? '#92400e' : user.role === 'admin' ? '#1e40af' : '#1f2937'
                          }}>
                            {user.role}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            background: user.is_active ? '#d1fae5' : '#fee2e2',
                            color: user.is_active ? '#065f46' : '#991b1b'
                          }}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>{new Date(user.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SuperAdmin;
