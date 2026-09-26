import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, KeyRound } from 'lucide-react';
import { apiService } from '../services/api';
import { useToast } from '../context/ToastContext';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState(1); // 1 = Request, 2 = Verify & Reset
  const [identifier, setIdentifier] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!identifier) return toast.warning('Please enter your email or mobile.');

    setLoading(true);
    try {
      const res = await apiService.forgotPassword({ identifier });
      toast.success(res.message);
      if (res.demoOtp) {
        setCode(res.demoOtp);
      }
      setStep(2);
    } catch (err) {
      toast.error(err.message || 'Failed to request reset OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!code || !newPassword) {
      return toast.warning('Please enter the OTP and your new password.');
    }

    setLoading(true);
    try {
      const res = await apiService.resetPassword({ identifier, code, newPassword });
      toast.success(res.message);
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
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
          <h2 style={{ fontSize: '1.6rem', marginBottom: '6px' }}>Reset Password</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {step === 1
              ? 'Enter your registered email or mobile number to receive a reset code'
              : 'Enter the 6-digit code and your new password'}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRequestOtp}>
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

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', marginTop: '10px' }}
            >
              {loading ? 'Sending OTP...' : 'Send Reset Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label className="form-label">6-Digit Reset Code</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  className="form-input"
                  style={{ paddingLeft: '40px', letterSpacing: '4px' }}
                />
                <KeyRound
                  size={18}
                  color="var(--text-sub)"
                  style={{ position: 'absolute', left: '12px', top: '14px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', marginTop: '10px' }}
            >
              {loading ? 'Resetting Password...' : 'Save New Password & Login'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
          <Link to="/login" style={{ color: 'var(--text-muted)' }}>
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
