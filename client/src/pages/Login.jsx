import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Lock, ShieldAlert, ArrowRight } from 'lucide-react';
import { WhatsAppIcon } from '../components/common/WhatsAppIcon';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const navigate = useNavigate();
  const { handleAuthSuccess } = useAuth();
  const toast = useToast();

  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMobileChange = (e) => {
    // Keep only numeric digits, max 10
    const digitsOnly = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
    setMobile(digitsOnly);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mobile || mobile.length !== 10) {
      return toast.warning('Please enter your 10-digit WhatsApp mobile number.');
    }
    if (!password) {
      return toast.warning('Please enter your password.');
    }

    setLoading(true);
    try {
      const res = await apiService.login({ mobile, identifier: mobile, password });
      handleAuthSuccess(res.user, res.token, res.refreshToken);
      toast.success(`Welcome back, ${res.user.full_name}! 👋`);

      if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your WhatsApp number & password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoPhone, pass) => {
    setMobile(demoPhone);
    setPassword(pass);
    toast.info(`Demo credentials filled: ${demoPhone} / ${pass}`);
  };

  return (
    <div style={{ maxWidth: '440px', margin: '60px auto', padding: '0 20px' }}>
      <div className="glass-card" style={{ padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img
            src="/far-logo-sm.png"
            alt="FAR - Forget About Recharge"
            style={{
              height: '46px',
              width: 'auto',
              margin: '0 auto 12px auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 12px rgba(0, 210, 255, 0.35))',
            }}
          />
          <h2 style={{ fontSize: '1.6rem', marginBottom: '6px' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Sign in with your registered mobile number &amp; password
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* WhatsApp Mobile Number */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <WhatsAppIcon size={16} />
              <span>WhatsApp Mobile Number</span>
            </label>
            <div style={{ position: 'relative', display: 'flex' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--text-sub)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  borderRight: '1px solid var(--border-glass)',
                  paddingRight: '8px',
                  zIndex: 2,
                }}
              >
                <WhatsAppIcon size={16} /> +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                value={mobile}
                onChange={handleMobileChange}
                placeholder="9876543210"
                className="form-input"
                style={{ paddingLeft: '80px', width: '100%', letterSpacing: '1px', fontWeight: 600 }}
              />
            </div>
          </div>

          {/* Password */}
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
            style={{
              width: '100%',
              padding: '14px',
              marginTop: '10px',
              fontSize: '1rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {loading ? (
              <div className="spinner" style={{ width: '20px', height: '20px', margin: 0 }} />
            ) : (
              <>
                <Zap size={18} />
                <span>Sign In with WhatsApp</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Demo Accounts Quick-Fill Box for testing */}
        <div
          style={{
            marginTop: '24px',
            padding: '14px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px dashed rgba(0, 238, 253, 0.35)',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--accent)',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <ShieldAlert size={14} color="#00eefd" />
              <span>Verified Demo Credentials</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>1-Tap Fill</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('9999999999', 'Admin@123')}
              className="btn btn-secondary"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                fontSize: '0.8rem',
                borderRadius: '8px',
              }}
            >
              <span><strong>Admin:</strong> 9999999999</span>
              <span style={{ color: '#00eefd', fontSize: '0.75rem' }}>Admin@123</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('9876543210', 'Password@123')}
              className="btn btn-secondary"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                fontSize: '0.8rem',
                borderRadius: '8px',
              }}
            >
              <span><strong>User:</strong> 9876543210</span>
              <span style={{ color: '#00eefd', fontSize: '0.75rem' }}>Password@123</span>
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don&apos;t have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>
            Join Free &amp; Claim 25 CR
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
