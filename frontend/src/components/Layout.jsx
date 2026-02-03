import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>Finance Tracker</h2>
          <p>{user?.firstName} {user?.lastName}</p>
        </div>

        <ul className="nav-menu">
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/transactions">Transactions</Link></li>
          <li><Link to="/budget">Budget</Link></li>
          <li><Link to="/ai-chat">AI Assistant</Link></li>
          {user?.role === 'super_admin' && (
            <li><Link to="/super-admin">Super Admin</Link></li>
          )}
        </ul>

        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
