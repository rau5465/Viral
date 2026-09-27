import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Zap, Flame, Lock, User, Gift, ArrowRight } from 'lucide-react';
import { WhatsAppIcon } from '../components/common/WhatsAppIcon';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Register = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleAuthSuccess } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    full_name: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    referral_code: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setFormData((prev) => ({ ...prev, referral_code: refCode.toUpperCase() }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobile') {
      // Keep only numeric digits, max 10
      const digitsOnly = value.replace(/[^0-9]/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, mobile: digitsOnly }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.full_name.trim()) {
      return toast.warning('Please enter your full name.');
    }

    if (!formData.mobile || formData.mobile.length !== 10) {
      return toast.warning('Please enter a valid 10-digit WhatsApp mobile number.');
    }

    if (formData.password.length < 6) {
      return toast.error('Password must be at least 6 characters.');
    }

    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match.');
    }

    setLoading(true);
    try {
      const res = await apiService.register({
        full_name: formData.full_name.trim(),
        mobile: formData.mobile.trim(),
        password: formData.password,
        referral_code: formData.referral_code.trim(),
      });

      handleAuthSuccess(res.user, res.token, res.refreshToken);
      toast.success('Welcome to FAR! 25 welcome bonus credits added.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please check your WhatsApp mobile number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '480px',
        margin: '56px auto',
        padding: '0 20px',
      }}
    >
      <div className="glass-card" style={{ padding: '32px' }}>
        {/* Header */}
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
          <h2 style={{ fontSize: '1.6rem', marginBottom: '6px' }}>Create Your FAR Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Instant sign up via WhatsApp mobile number • No OTP required
          </p>
        </div>

        {/* 4x Bonus Alert Box */}
        <div
          style={{
            background: 'rgba(253, 167, 2, 0.12)',
            border: '1px solid rgba(253, 167, 2, 0.35)',
            borderRadius: '12px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '22px',
            fontSize: '0.85rem',
            color: '#fda702',
          }}
        >
          <Flame size={20} flexShrink={0} />
          <span>
            <strong>Instant 25 Credits Welcome Bonus:</strong> Complete signup to get 25 credits. Refer 2 friends in 2 hours to 4X boost to 100 credits!
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
                placeholder="e.g. Rahul Sharma"
                className="form-input"
                style={{ paddingLeft: '40px' }}
              />
              <User
                size={18}
                color="var(--text-sub)"
                style={{ position: 'absolute', left: '12px', top: '14px' }}
              />
            </div>
          </div>

          {/* WhatsApp Mobile Number */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <WhatsAppIcon size={16} />
              <span>WhatsApp Mobile Number</span>
              <span style={{ fontSize: '0.75rem', color: '#25D366', fontWeight: 600 }}>(No OTP Needed)</span>
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
                name="mobile"
                required
                maxLength={10}
                value={formData.mobile}
                onChange={handleChange}
                placeholder="9876543210"
                className="form-input"
                style={{ paddingLeft: '80px', width: '100%', letterSpacing: '1px', fontWeight: 600 }}
              />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Used to fulfill mobile recharges (Jio, Airtel, Vi, BSNL) and account recovery.
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Create Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
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

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
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

          {/* Referral Code (Optional) */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Referral Code (Optional)</span>
              {formData.referral_code && (
                <span style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600 }}>
                  ✓ Code Applied
                </span>
              )}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="referral_code"
                value={formData.referral_code}
                onChange={handleChange}
                placeholder="e.g. VR123456"
                className="form-input"
                style={{ paddingLeft: '40px', textTransform: 'uppercase' }}
              />
              <Gift
                size={18}
                color="var(--text-sub)"
                style={{ position: 'absolute', left: '12px', top: '14px' }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '1rem',
              fontWeight: 700,
              marginTop: '12px',
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
                <span>Create Account &amp; Claim 25 Credits</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-sub)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
            Sign In with WhatsApp
          </Link>
        </div>

        <div
          style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-glass)',
            textAlign: 'center',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
          }}
        >
          By signing up, you agree to our{' '}
          <Link to="/terms" style={{ color: 'var(--text-sub)', textDecoration: 'underline' }}>
            Terms
          </Link>{' '}
          and{' '}
          <Link to="/privacy" style={{ color: 'var(--text-sub)', textDecoration: 'underline' }}>
            Privacy Policy
          </Link>
          .
        </div>
      </div>
    </div>
  );
};

export default Register;
