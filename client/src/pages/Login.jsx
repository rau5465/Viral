import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Lock, Mail, ShieldAlert } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const navigate = useNavigate();
  const { handleAuthSuccess } = useAuth();
  const toast = useToast();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      return toast.warning('Please enter both email/mobile and password.');
    }

    setLoading(true);
    try {
      const res = await apiService.login({ identifier, password });
      handleAuthSuccess(res.user, res.token, res.refreshToken);
      toast.success(`Welcome back, ${res.user.full_name}! 👋`);

      if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (email, pass) => {
    setIdentifier(email);
    setPassword(pass);
  };

  return (
    <div style={{ maxWidth: '440px', margin: '60px auto', padding: '0 20px' }}>
      <div className="glass-card" style={{ padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
            }}
          >
            <Zap size={26} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '6px' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Log in to manage your credits & free recharges
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email or Mobile Number</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="name@example.com or 9876543210"
                className="form-input"
                style={{ paddingLeft: '40px' }}
              />
              <Mail
                size={18}
                color="var(--text-sub)"
                style={{ position: 'absolute', left: '12px', top: '14px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="form-label">Password</label>
              <Link
                to="/forgot-password"
                style={{ fontSize: '0.8rem', color: 'var(--accent)', textDecoration: 'none' }}
              >
                Forgot Password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="form-input"
                style={{ paddingLeft: '40px' }}
              />
              <Lock
                size={18}
                color="var(--text-sub)"
                style={{ position: 'absolute', left: '12px', top: '14px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', marginTop: '10px', fontSize: '1rem' }}
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Accounts Quick-Fill Box for pair programming/testing */}
        <div
          style={{
            marginTop: '24px',
            padding: '14px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px dashed var(--border-glass)',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <ShieldAlert size={14} color="#fdcb6e" /> Quick Demo Fill
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@viralrecharge.com', 'Admin@123')}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '6px', fontSize: '0.75rem' }}
            >
              Demo Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('rahul@example.com', 'Password@123')}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '6px', fontSize: '0.75rem' }}
            >
              Demo User
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don&apos;t have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>
            Join Free & Claim 25 CR
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
