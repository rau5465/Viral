import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Lock, KeyRound, AlertTriangle, ArrowLeft, CheckCircle2, Clock } from 'lucide-react';
import { WhatsAppIcon } from '../components/common/WhatsAppIcon';
import { apiService } from '../services/api';
import { useToast } from '../context/ToastContext';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState(1); // 1 = Lookup Mobile, 2 = Answer Security Questions, 3 = Locked Out
  const [mobile, setMobile] = useState('');
  const [questions, setQuestions] = useState({ q1: '', q2: '' });
  const [a1, setA1] = useState('');
  const [a2, setA2] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockoutMessage, setLockoutMessage] = useState('');

  // Step 1: Submit Mobile Number to fetch Security Questions
  const handleFetchQuestions = async (e) => {
    e.preventDefault();
    const cleanMobile = mobile.replace(/[^0-9]/g, '');
    if (!cleanMobile || cleanMobile.length !== 10) {
      return toast.warning('Please enter a valid 10-digit WhatsApp mobile number.');
    }

    setLoading(true);
    try {
      const res = await apiService.getSecurityQuestionsByMobile({ mobile: cleanMobile });
      if (res.q1 && res.q2) {
        setQuestions({ q1: res.q1, q2: res.q2 });
        setStep(2);
      } else {
        toast.error('Could not find security questions for this account.');
      }
    } catch (err) {
      const msg = err.message || 'Failed to find account.';
      if (msg.includes('locked') || err.statusCode === 403) {
        setLockoutMessage(msg);
        setStep(3);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Answer 2 Security Questions and Set New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!a1.trim() || !a2.trim()) {
      return toast.warning('Please answer both security questions.');
    }

    if (newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters long.');
    }

    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match.');
    }

    setLoading(true);
    try {
      const res = await apiService.resetPasswordWithSecurityQuestions({
        mobile: mobile.replace(/[^0-9]/g, ''),
        a1: a1.trim(),
        a2: a2.trim(),
        newPassword,
      });

      toast.success(res.message || 'Password reset successfully! Please sign in.');
      navigate('/login');
    } catch (err) {
      const msg = err.message || 'Incorrect security answers.';
      if (msg.includes('locked') || msg.includes('tomorrow') || msg.includes('after 24 hours')) {
        setLockoutMessage(msg);
        setStep(3); // Transition to lockout view
        toast.error(msg);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '48px auto', padding: '0 20px' }}>
      <div className="glass-card" style={{ padding: '32px 26px' }}>
        {/* Header Icon */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: step === 3
                ? 'rgba(239, 68, 68, 0.18)'
                : 'linear-gradient(135deg, rgba(0, 238, 253, 0.2), rgba(0, 102, 255, 0.2))',
              border: step === 3 ? '1.5px solid #ef4444' : '1.5px solid #00eefd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
              boxShadow: step === 3 ? '0 0 24px rgba(239, 68, 68, 0.3)' : '0 0 24px rgba(0, 238, 253, 0.3)',
            }}
          >
            {step === 3 ? (
              <Clock size={28} color="#ef4444" />
            ) : (
              <ShieldCheck size={28} color="#00eefd" />
            )}
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>
            {step === 1 && 'Reset Your Password'}
            {step === 2 && 'Answer Security Questions'}
            {step === 3 && 'Password Reset Locked'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.45', margin: 0 }}>
            {step === 1 && 'Enter your registered WhatsApp mobile number to verify your security questions.'}
            {step === 2 && 'Answer your 2 configured questions below to verify identity and set your new password.'}
            {step === 3 && 'You have reached the maximum allowed incorrect attempts.'}
          </p>
        </div>

        {/* STEP 1: Enter WhatsApp Mobile */}
        {step === 1 && (
          <form onSubmit={handleFetchQuestions}>
            <div className="form-group" style={{ marginBottom: '18px' }}>
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
                  onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  className="form-input"
                  style={{ paddingLeft: '80px', width: '100%', letterSpacing: '1px', fontWeight: 600 }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px', fontWeight: 700 }}
            >
              {loading ? 'Finding Account...' : 'Continue to Security Questions'}
            </button>
          </form>
        )}

        {/* STEP 2: Answer 2 Security Questions */}
        {step === 2 && (
          <form onSubmit={handleResetPassword}>
            {/* Target Account Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '8px 12px',
                marginBottom: '16px',
                fontSize: '0.82rem',
              }}
            >
              <span style={{ color: 'var(--text-sub)' }}>Account:</span>
              <span style={{ fontWeight: 700, color: '#00eefd' }}>+91 {mobile}</span>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Change
              </button>
            </div>

            {/* Crucial Lockout Warning Notice */}
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1.5px solid rgba(245, 158, 11, 0.45)',
                borderRadius: '12px',
                padding: '12px 14px',
                marginBottom: '18px',
                fontSize: '0.82rem',
                lineHeight: '1.45',
                color: '#fef08a',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
              }}
            >
              <AlertTriangle size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#fff' }}>Strict Warning:</strong> You must enter the exact answers. If any answer is incorrect, password reset will be <strong>strictly locked until tomorrow (after 24 hours)</strong>.
              </div>
            </div>

            {/* Question 1 */}
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: '#00eefd' }}>
                Question 1: {questions.q1}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  value={a1}
                  onChange={(e) => setA1(e.target.value)}
                  placeholder="Enter your answer"
                  className="form-input"
                  style={{ paddingLeft: '38px', fontSize: '0.88rem' }}
                />
                <KeyRound
                  size={16}
                  color="var(--text-sub)"
                  style={{ position: 'absolute', left: '12px', top: '14px' }}
                />
              </div>
            </div>

            {/* Question 2 */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: '#00eefd' }}>
                Question 2: {questions.q2}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  value={a2}
                  onChange={(e) => setA2(e.target.value)}
                  placeholder="Enter your answer"
                  className="form-input"
                  style={{ paddingLeft: '38px', fontSize: '0.88rem' }}
                />
                <KeyRound
                  size={16}
                  color="var(--text-sub)"
                  style={{ position: 'absolute', left: '12px', top: '14px' }}
                />
              </div>
            </div>

            {/* New Password */}
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" style={{ fontSize: '0.84rem' }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                />
                <Lock
                  size={16}
                  color="var(--text-sub)"
                  style={{ position: 'absolute', left: '12px', top: '14px' }}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ fontSize: '0.84rem' }}>
                Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                />
                <Lock
                  size={16}
                  color="var(--text-sub)"
                  style={{ position: 'absolute', left: '12px', top: '14px' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px', fontWeight: 800 }}
            >
              {loading ? 'Verifying Answers...' : 'Verify Answers & Reset Password'}
            </button>
          </form>
        )}

        {/* STEP 3: Locked Out View */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1.5px solid rgba(239, 68, 68, 0.5)',
                borderRadius: '14px',
                padding: '16px',
                marginBottom: '20px',
                textAlign: 'left',
                fontSize: '0.88rem',
                lineHeight: '1.5',
                color: '#fca5a5',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontWeight: 800, marginBottom: '6px' }}>
                <ShieldAlert size={18} />
                <span>Account Password Reset Locked</span>
              </div>
              <p style={{ margin: 0, color: '#fecaca' }}>
                {lockoutMessage ||
                  'Your password reset is locked due to incorrect security answers. As warned, you can try again tomorrow.'}
              </p>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-sub)', marginBottom: '20px' }}>
              If you believe this is an error or need immediate access, please contact our support team via WhatsApp.
            </p>

            <Link
              to="/contact"
              className="btn btn-secondary"
              style={{ width: '100%', display: 'block', textAlign: 'center', padding: '12px', marginBottom: '10px' }}
            >
              Contact Support
            </Link>
          </div>
        )}

        {/* Back Link */}
        <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '0.88rem' }}>
          <Link
            to="/login"
            style={{
              color: 'var(--text-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={15} />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
