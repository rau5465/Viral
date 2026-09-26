import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Zap, Flame, Lock, Mail, Phone, User, Gift, CheckCircle2 } from 'lucide-react';
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
    email: '',
    password: '',
    confirmPassword: '',
    referral_code: '',
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setFormData((prev) => ({ ...prev, referral_code: refCode.toUpperCase() }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async () => {
    if (!formData.mobile || formData.mobile.length !== 10) {
      return toast.warning('Please enter a valid 10-digit mobile number first.');
    }
    setLoading(true);
    try {
      const res = await apiService.sendOtp({ mobile: formData.mobile, purpose: 'registration' });
      setOtpSent(true);
      toast.success(res.message);
      if (res.demoOtp) {
        setOtpCode(res.demoOtp); // Auto-fill in dev mode for supreme convenience
      }
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      return toast.warning('Please enter the 6-digit OTP.');
    }
    setLoading(true);
    try {
      await apiService.verifyOtp({
        mobile: formData.mobile,
        code: otpCode,
        purpose: 'registration',
      });
      setOtpVerified(true);
      toast.success('Mobile number verified! 🎉');
    } catch (err) {
      toast.error(err.message || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match.');
    }
    if (formData.password.length < 6) {
      return toast.error('Password must be at least 6 characters.');
    }

    setLoading(true);
    try {
      const res = await apiService.register({
        full_name: formData.full_name,
        mobile: formData.mobile,
        email: formData.email,
        password: formData.password,
        referral_code: formData.referral_code,
      });

      handleAuthSuccess(res.user, res.token, res.refreshToken);
      toast.success('Welcome to ViralRecharge! 25 bonus credits added.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '480px',
        margin: '40px auto',
        padding: '0 20px',
      }}
    >
      <div className="glass-card" style={{ padding: '32px' }}>
        {/* Header */}
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
          <h2 style={{ fontSize: '1.6rem', marginBottom: '6px' }}>Create Your Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Get 25 credits instantly + unlock the 4x 2-hour bonus!
          </p>
        </div>

        {/* 4x Bonus Alert Box */}
        <div
          style={{
            background: 'rgba(255, 118, 117, 0.12)',
            border: '1px solid rgba(255, 118, 117, 0.3)',
            borderRadius: '10px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px',
            fontSize: '0.85rem',
            color: '#ff7675',
          }}
        >
          <Flame size={18} flexShrink={0} />
          <span>
            <strong>4X Challenge:</strong> Refer 2 friends within 2 hours after signup to boost your bonus to 100 Credits!
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

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
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

          {/* Mobile + OTP Verification */}
          <div className="form-group">
            <label className="form-label">Mobile Number (10 Digits)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="tel"
                  name="mobile"
                  required
                  maxLength={10}
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                  disabled={otpVerified}
                />
                <Phone
                  size={18}
                  color="var(--text-sub)"
                  style={{ position: 'absolute', left: '12px', top: '14px' }}
                />
              </div>
              {!otpVerified ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading || formData.mobile.length !== 10}
                  className="btn btn-secondary"
                  style={{ padding: '0 14px', fontSize: '0.85rem' }}
                >
                  {otpSent ? 'Resend' : 'Send OTP'}
                </button>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#00b894',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    padding: '0 10px',
                  }}
                >
                  <CheckCircle2 size={16} /> Verified
                </div>
              )}
            </div>
          </div>

          {/* OTP Input Field */}
          {otpSent && !otpVerified && (
            <div className="form-group" style={{ animation: 'slideDown 0.2s ease' }}>
              <label className="form-label">Enter 6-Digit OTP</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className="form-input"
                  style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '1.1rem' }}
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  className="btn btn-accent"
                  style={{ padding: '0 16px' }}
                >
                  Verify
                </button>
              </div>
            </div>
          )}

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
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
                placeholder="Confirm password"
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

          {/* Referral Code */}
          <div className="form-group">
            <label className="form-label">
              Referral Code <span style={{ color: 'var(--text-sub)' }}>(Optional)</span>
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
                color="#fdcb6e"
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
            {loading ? 'Creating Account...' : 'Complete Registration & Claim 25 CR'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
