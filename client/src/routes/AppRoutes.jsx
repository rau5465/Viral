import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Pages
import Landing from '../pages/Landing';
import Register from '../pages/Register';
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import Dashboard from '../pages/Dashboard';
import Tasks from '../pages/Tasks';
import ReferralCenter from '../pages/ReferralCenter';
import RechargeRedeem from '../pages/RechargeRedeem';
import TransactionHistory from '../pages/TransactionHistory';
import Leaderboard from '../pages/Leaderboard';
import Profile from '../pages/Profile';
import AdminDashboard from '../pages/admin/AdminDashboard';

// Route Guards
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <div className="spinner" style={{ margin: '0 auto' }} />
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <div className="spinner" style={{ margin: '0 auto' }} />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Landing />} />
      <Route path="/leaderboard" element={<Leaderboard />} />

      {/* Guest Only Pages */}
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicOnlyRoute>
            <ForgotPassword />
          </PublicOnlyRoute>
        }
      />

      {/* Authenticated User Pages */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/referrals"
        element={
          <ProtectedRoute>
            <ReferralCenter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recharge"
        element={
          <ProtectedRoute>
            <RechargeRedeem />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <TransactionHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Admin Protected Pages */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
