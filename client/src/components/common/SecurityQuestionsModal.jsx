import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, KeyRound, CheckCircle2, Lock, X, ArrowRight, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const QUESTION_OPTIONS_1 = [
  'What was the name of your first school?',
  'In which city or town were you born?',
  'What was the make or brand of your first mobile phone?',
  'What was your childhood nickname?',
  "What is your mother's maiden name or birthplace?",
];

export const QUESTION_OPTIONS_2 = [
  'What is your favorite food or home dish?',
  'What was the name of your favorite childhood teacher or mentor?',
  'What was your favorite childhood cartoon or movie?',
  'What was the name of your first street or neighborhood?',
  'What is the name of your first pet or childhood best friend?',
];

const SecurityQuestionsModal = () => {
  const {
    securityModalOpen,
    securityModalReason,
    closeSecurityModal,
    setUser,
    logout,
  } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [q1, setQ1] = useState(QUESTION_OPTIONS_1[0]);
  const [a1, setA1] = useState('');
  const [q2, setQ2] = useState(QUESTION_OPTIONS_2[0]);
  const [a2, setA2] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!securityModalOpen) return null;

  const isLogoutReason = securityModalReason === 'logout';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!q1 || !a1.trim() || !q2 || !a2.trim()) {
      return toast.warning('Please answer both security questions.');
    }

    if (q1 === q2) {
      return toast.warning('Please select two different security questions.');
    }

    if (a1.trim().length < 2 || a2.trim().length < 2) {
      return toast.warning('Each answer must be at least 2 characters.');
    }

    setLoading(true);
    try {
      const res = await apiService.setSecurityQuestions({
        q1,
        a1: a1.trim(),
        q2,
        a2: a2.trim(),
      });

      if (res.user) {
        setUser(res.user);
        try {
          localStorage.setItem('vr_user', JSON.stringify(res.user));
        } catch {}
      }

      sessionStorage.removeItem('far_prompt_security_questions');
      toast.success(res.message || 'Security questions saved successfully!');
      setSuccess(true);

      setTimeout(async () => {
        setSuccess(false);
        closeSecurityModal();
        if (isLogoutReason) {
          await logout(true);
          navigate('/login');
        }
      }, 1200);
    } catch (err) {
      toast.error(err.message || 'Failed to save security questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.removeItem('far_prompt_security_questions');
    closeSecurityModal();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10001,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: 'rgba(3, 7, 18, 0.92)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        animation: 'fadeIn 0.25s ease-out',
      }}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '500px',
          width: '100%',
          padding: '28px 24px',
          background: 'linear-gradient(180deg, #090f22 0%, #030612 100%)',
          border: isLogoutReason
            ? '1.5px solid rgba(239, 68, 68, 0.65)'
            : '1.5px solid rgba(0, 238, 253, 0.55)',
          borderRadius: '24px',
          boxShadow: isLogoutReason
            ? '0 0 50px rgba(239, 68, 68, 0.3), 0 24px 60px rgba(0, 0, 0, 0.95)'
            : '0 0 45px rgba(0, 238, 253, 0.25), 0 24px 60px rgba(0, 0, 0, 0.95)',
          position: 'relative',
          textAlign: 'left',
          maxHeight: '92vh',
          overflowY: 'auto',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Dismiss Button (only allowed if NOT logout interception) */}
        {!isLogoutReason && (
          <button
            onClick={handleDismiss}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
            title="Remind me later"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        )}

        {success ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(0, 230, 153, 0.15)',
                border: '2px solid #00e699',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <CheckCircle2 size={36} color="#00e699" />
            </div>
            <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '8px' }}>
              Security Questions Saved!
            </h3>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.88rem' }}>
              {isLogoutReason
                ? 'Your account is secured. Logging out now...'
                : 'Your account is now fully protected for password recovery.'}
            </p>
          </div>
        ) : (
          <>
            {/* Header Icon & Eyebrow */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: isLogoutReason
                    ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(245, 158, 11, 0.2))'
                    : 'linear-gradient(135deg, rgba(0, 238, 253, 0.2), rgba(0, 102, 255, 0.2))',
                  border: isLogoutReason ? '1.5px solid #ef4444' : '1.5px solid #00eefd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {isLogoutReason ? (
                  <ShieldAlert size={24} color="#ef4444" />
                ) : (
                  <ShieldCheck size={24} color="#00eefd" />
                )}
              </div>
              <div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: isLogoutReason ? '#ff6b6b' : '#00eefd',
                  }}
                >
                  {isLogoutReason ? '🔒 Action Required To Log Out' : '🛡️ Account Recovery Setup'}
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.25 }}>
                  {isLogoutReason ? 'Set Security Questions to Log Out' : 'Set Your 2 Security Questions'}
                </h2>
              </div>
            </div>

            {/* Explanation / Warning Alert */}
            {isLogoutReason ? (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  marginBottom: '18px',
                  fontSize: '0.82rem',
                  lineHeight: '1.45',
                  color: '#ffc9c9',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#ef4444', marginBottom: '4px' }}>
                  <AlertTriangle size={15} />
                  <span>Logout Blocked: Security Questions Not Configured</span>
                </div>
                You must set your 2 security questions before logging out. This ensures you can securely recover your account and balance if you ever forget your password.
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: '1.45', marginBottom: '18px' }}>
                Configure 2 security questions now to verify your identity if you ever forget your password.
              </p>
            )}

            {/* Lockout Warning Notice */}
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                borderRadius: '10px',
                padding: '10px 12px',
                marginBottom: '18px',
                fontSize: '0.78rem',
                color: '#fef08a',
                lineHeight: '1.4',
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start',
              }}
            >
              <AlertTriangle size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Important Recovery Warning:</strong> During password reset, answers must match. If an answer is wrong, password reset will be <strong>locked until the next day</strong>.
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Question 1 */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: '#00eefd' }}>
                  Security Question 1
                </label>
                <select
                  value={q1}
                  onChange={(e) => setQ1(e.target.value)}
                  className="form-input"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '0.84rem',
                    background: '#090e1f',
                    color: '#fff',
                    borderColor: 'var(--border-glass)',
                    borderRadius: '10px',
                    marginBottom: '8px',
                  }}
                >
                  {QUESTION_OPTIONS_1.map((opt) => (
                    <option key={opt} value={opt} style={{ background: '#090e1f', color: '#fff' }}>
                      {opt}
                    </option>
                  ))}
                </select>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    value={a1}
                    onChange={(e) => setA1(e.target.value)}
                    placeholder="Enter answer (case-insensitive)"
                    className="form-input"
                    style={{ paddingLeft: '38px', fontSize: '0.85rem' }}
                  />
                  <KeyRound
                    size={16}
                    color="var(--text-sub)"
                    style={{ position: 'absolute', left: '12px', top: '14px' }}
                  />
                </div>
              </div>

              {/* Question 2 */}
              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 700, color: '#00eefd' }}>
                  Security Question 2
                </label>
                <select
                  value={q2}
                  onChange={(e) => setQ2(e.target.value)}
                  className="form-input"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '0.84rem',
                    background: '#090e1f',
                    color: '#fff',
                    borderColor: 'var(--border-glass)',
                    borderRadius: '10px',
                    marginBottom: '8px',
                  }}
                >
                  {QUESTION_OPTIONS_2.map((opt) => (
                    <option key={opt} value={opt} style={{ background: '#090e1f', color: '#fff' }}>
                      {opt}
                    </option>
                  ))}
                </select>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    value={a2}
                    onChange={(e) => setA2(e.target.value)}
                    placeholder="Enter answer (case-insensitive)"
                    className="form-input"
                    style={{ paddingLeft: '38px', fontSize: '0.85rem' }}
                  />
                  <KeyRound
                    size={16}
                    color="var(--text-sub)"
                    style={{ position: 'absolute', left: '12px', top: '14px' }}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: isLogoutReason
                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                    : 'linear-gradient(135deg, #00eefd 0%, #0066ff 100%)',
                  color: isLogoutReason ? '#fff' : '#070b14',
                  padding: '13px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: isLogoutReason
                    ? '0 6px 20px rgba(239, 68, 68, 0.4)'
                    : '0 6px 20px rgba(0, 102, 255, 0.4)',
                  marginBottom: '10px',
                }}
              >
                <Lock size={16} />
                <span>
                  {loading
                    ? 'Saving...'
                    : isLogoutReason
                    ? 'Save Questions & Proceed to Log Out'
                    : 'Save Security Questions'}
                </span>
              </button>

              {/* Cancel / Dismiss Buttons */}
              <div style={{ textAlign: 'center' }}>
                {isLogoutReason ? (
                  <button
                    type="button"
                    onClick={closeSecurityModal}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-sub)',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      padding: '6px',
                    }}
                  >
                    Cancel &amp; Stay Logged In
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDismiss}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-sub)',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      padding: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>Remind me on logout</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default SecurityQuestionsModal;
