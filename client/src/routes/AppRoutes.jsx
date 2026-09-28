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
import PrivacyPolicy from '../pages/PrivacyPolicy';
import TermsOfService from '../pages/TermsOfService';
import RefundPolicy from '../pages/RefundPolicy';
import About from '../pages/About';
import ContactUs from '../pages/ContactUs';
import RechargePolicy from '../pages/RechargePolicy';
import Partners from '../pages/Partners';
import MultiplyGame from '../pages/MultiplyGame';

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

const UserRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <div className="spinner" style={{ margin: '0 auto' }} />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace /> : children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Landing />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/partners" element={<Partners />} />
      <Route path="/partner" element={<Partners />} />
      <Route path="/advertise" element={<Partners />} />
      <Route path="/advertisers" element={<Partners />} />
      <Route path="/advertiser" element={<Partners />} />
      <Route path="/sponsors" element={<Partners />} />
      <Route path="/sponsor" element={<Partners />} />
      <Route path="/creators" element={<Partners />} />
      <Route path="/about" element={<About />} />
      <Route path="/about-us" element={<About />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/contact-us" element={<ContactUs />} />
      <Route path="/recharge-policy" element={<RechargePolicy />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/refund" element={<RefundPolicy />} />
      <Route path="/refund-policy" element={<RefundPolicy />} />

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
          <UserRoute>
            <Dashboard />
          </UserRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <UserRoute>
            <Tasks />
          </UserRoute>
        }
      />
      <Route
        path="/referrals"
        element={
          <UserRoute>
            <ReferralCenter />
          </UserRoute>
        }
      />
      <Route
        path="/recharge"
        element={
          <UserRoute>
            <RechargeRedeem />
          </UserRoute>
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
      <Route
        path="/multiply"
        element={
          <UserRoute>
            <MultiplyGame />
          </UserRoute>
        }
      />
      <Route
        path="/game"
        element={
          <UserRoute>
            <MultiplyGame />
          </UserRoute>
        }
      />
      <Route
        path="/multiply-credits"
        element={
          <UserRoute>
            <MultiplyGame />
          </UserRoute>
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
