import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import './App.css';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budget from './pages/Budget';
import AIChat from './pages/AIChat';
import SuperAdmin from './pages/SuperAdmin';
import Layout from './components/Layout';

// Auth Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Configure NProgress
NProgress.configure({ showSpinner: false, speed: 400, minimum: 0.1 });

function PrivateRoute({ children, requireSuperAdmin = false, requireDemoUser = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireSuperAdmin && user.role !== 'super_admin') {
    return <Navigate to="/super-admin" />;
  }

  if (requireDemoUser && user.role === 'super_admin') {
    return <Navigate to="/super-admin" />;
  }

  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  const location = useLocation();

  // Show loading bar on route change
  useEffect(() => {
    NProgress.start();
    const timer = setTimeout(() => {
      NProgress.done();
    }, 200);

    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={
          <Navigate to={user?.role === 'super_admin' ? '/super-admin' : '/dashboard'} />
        } />
        <Route path="dashboard" element={
          <PrivateRoute requireDemoUser={true}>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="transactions" element={
          <PrivateRoute requireDemoUser={true}>
            <Transactions />
          </PrivateRoute>
        } />
        <Route path="budget" element={
          <PrivateRoute requireDemoUser={true}>
            <Budget />
          </PrivateRoute>
        } />
        <Route path="ai-chat" element={
          <PrivateRoute requireDemoUser={true}>
            <AIChat />
          </PrivateRoute>
        } />
        <Route
          path="super-admin"
          element={
            <PrivateRoute requireSuperAdmin={true}>
              <SuperAdmin />
            </PrivateRoute>
          }
        />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
