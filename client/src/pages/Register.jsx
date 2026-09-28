import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Zap,
  Flame,
  Lock,
  User,
  Gift,
  ArrowRight,
  ShieldAlert,
  Smartphone,
  AlertTriangle,
  CheckCircle2,
  Copy,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { WhatsAppIcon } from '../components/common/WhatsAppIcon';
import { apiService } from '../services/api';
import { getDeviceFingerprint } from '../utils/deviceFingerprint';
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

  // WhatsApp wacli verification state
  const [verificationState, setVerificationState] = useState({
    initiated: false,
    loading: false,
    code: '',
    whatsappUrl: '',
    whatsappNumber: '',
    prefilledText: '',
    verified: false,
    expiresAt: null,
  });

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
      // If mobile changed, reset verification
      if (verificationState.initiated || verificationState.verified) {
        setVerificationState({
          initiated: false,
          loading: false,
          code: '',
          whatsappUrl: '',
          whatsappNumber: '',
          prefilledText: '',
          verified: false,
          expiresAt: null,
        });
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Initiate WhatsApp Verification via wacli
  const handleInitiateVerification = async () => {
    if (!formData.mobile || formData.mobile.length !== 10) {
      return toast.warning('Please enter a valid 10-digit WhatsApp mobile number first.');
    }

    setVerificationState((prev) => ({ ...prev, loading: true }));
    try {
      const res = await apiService.initiateWhatsAppVerification(formData.mobile);
      if (res.data) {
        setVerificationState({
          initiated: true,
          loading: false,
          code: res.data.code,
          whatsappUrl: res.data.whatsapp_url,
          whatsappNumber: res.data.whatsapp_number,
          prefilledText: res.data.prefilled_text,
          verified: false,
          expiresAt: res.data.expires_at,
        });
        toast.info(`Verification code ${res.data.code} generated! Send the WhatsApp message to verify.`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to initiate WhatsApp verification.');
      setVerificationState((prev) => ({ ...prev, loading: false }));
    }
  };

  // Polling for live WhatsApp verification from wacli
  useEffect(() => {
    let interval = null;
    if (verificationState.initiated && !verificationState.verified && verificationState.code) {
      interval = setInterval(async () => {
        try {
          const res = await apiService.checkWhatsAppVerificationStatus(formData.mobile, verificationState.code);
          if (res.data?.verified) {
            setVerificationState((prev) => ({ ...prev, verified: true }));
            toast.success('🎉 WhatsApp mobile number verified successfully!');
            clearInterval(interval);
          }
        } catch (_err) {
          // Silent polling failure
        }
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [verificationState.initiated, verificationState.verified, verificationState.code, formData.mobile]);

  const handleCopyCode = () => {
    if (verificationState.code) {
      const textToCopy = `VERIFY ${verificationState.code}`;
      navigator.clipboard.writeText(textToCopy);
      toast.success(`Copied "${textToCopy}" to clipboard!`);
    }
  };

  const handleSimulateVerification = async () => {
    try {
      const res = await apiService.simulateWhatsAppVerification(formData.mobile, verificationState.code);
      if (res.result?.verified) {
        setVerificationState((prev) => ({ ...prev, verified: true }));
        toast.success('✅ Simulated WhatsApp verification received and verified!');
      } else {
        toast.warning(res.result?.reason || 'Simulation failed');
      }
    } catch (err) {
      toast.error(err.message || 'Simulation request failed.');
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

    if (!verificationState.verified) {
      if (!verificationState.initiated) {
        handleInitiateVerification();
      }
      return toast.warning('Please verify your WhatsApp mobile number before completing signup.');
    }

    if (formData.password.length < 6) {
      return toast.error('Password must be at least 6 characters.');
    }

    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match.');
    }

    setLoading(true);
    try {
      const device_fingerprint = await getDeviceFingerprint();
      const res = await apiService.register({
        full_name: formData.full_name.trim(),
        mobile: formData.mobile.trim(),
        password: formData.password,
        referral_code: formData.referral_code.trim(),
        device_fingerprint,
      });

      handleAuthSuccess(res.user, res.token, res.refreshToken);
      sessionStorage.setItem('far_post_signup_save_app', 'true');
      sessionStorage.setItem('far_prompt_security_questions', 'true');
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
            Instant sign up with your registered mobile number
          </p>
        </div>

        {/* Verification Notice & One Device One Account Box */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.08) 0%, rgba(245, 158, 11, 0.07) 100%)',
            border: '1.5px solid rgba(245, 158, 11, 0.35)',
            borderRadius: '12px',
            padding: '12px 14px',
            marginBottom: '16px',
            fontSize: '0.84rem',
            lineHeight: '1.5',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00EEFD', fontWeight: 700 }}>
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>Important Verification Notice</span>
          </div>
          <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.83rem' }}>
            Your registered mobile number <strong>will be verified before using credits for recharge</strong>.
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              padding: '9px 11px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '8px',
              color: '#ff7b7b',
              fontSize: '0.81rem',
              fontWeight: 600,
              lineHeight: '1.45',
            }}
          >
            <AlertTriangle size={17} style={{ flexShrink: 0, marginTop: '2px', color: '#ef4444' }} />
            <span>
              <strong style={{ color: '#fff' }}>Account Policy:</strong> Do not try to create more than one account to avoid account ban. Only one account must be used in a single device.
            </span>
          </div>
        </div>

        {/* Referral Bonus Alert Box */}
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
            <strong>Instant 25 Credits Welcome Bonus:</strong> Complete signup to get 25 credits. Get Up to 5x Rewards On Refer if you share app in next two hours!
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

          {/* WhatsApp Mobile Number & wacli Verification */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <WhatsAppIcon size={16} />
                <span>WhatsApp Mobile Number</span>
              </span>
              {verificationState.verified && (
                <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={14} /> Verified
                </span>
              )}
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
                disabled={verificationState.verified}
                value={formData.mobile}
                onChange={handleChange}
                placeholder="9876543210"
                className="form-input"
                style={{
                  paddingLeft: '80px',
                  width: '100%',
                  letterSpacing: '1px',
                  fontWeight: 600,
                  borderColor: verificationState.verified ? '#10b981' : undefined,
                  background: verificationState.verified ? 'rgba(16, 185, 129, 0.05)' : undefined,
                }}
              />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Used to fulfill mobile recharges (Jio, Airtel, Vi, BSNL) and account security.
            </div>

            {/* Verification State 1: 10 Digits Entered, Not Yet Initiated */}
            {formData.mobile.length === 10 && !verificationState.initiated && !verificationState.verified && (
              <div style={{ marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={handleInitiateVerification}
                  disabled={verificationState.loading}
                  className="btn"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '11px 16px',
                    fontSize: '0.92rem',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                    color: '#ffffff',
                    fontWeight: 700,
                    border: 'none',
                    boxShadow: '0 4px 18px rgba(37, 211, 102, 0.4)',
                    cursor: 'pointer',
                  }}
                >
                  <WhatsAppIcon size={20} />
                  <span>{verificationState.loading ? 'Generating Code...' : 'Verify with WhatsApp 📲'}</span>
                </button>
              </div>
            )}

            {/* Verification State 2: Initiated, Waiting for WhatsApp Message */}
            {verificationState.initiated && !verificationState.verified && (
              <div
                style={{
                  marginTop: '12px',
                  background: 'linear-gradient(145deg, rgba(37, 211, 102, 0.08) 0%, rgba(10, 20, 35, 0.95) 100%)',
                  border: '1.5px solid rgba(37, 211, 102, 0.45)',
                  borderRadius: '14px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {/* Step Title */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#25D366', fontWeight: 700, fontSize: '0.9rem' }}>
                    <WhatsAppIcon size={18} />
                    <span>WhatsApp Verification Step</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Expires in 10 mins
                  </span>
                </div>

                {/* Generated Code Display */}
                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.6)',
                    border: '1px dashed rgba(37, 211, 102, 0.6)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Your Verification Code
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '4px', color: '#00EEFD', fontFamily: 'monospace' }}>
                      {verificationState.code}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    title="Copy message to clipboard"
                  >
                    <Copy size={14} /> Copy
                  </button>
                </div>

                {/* Primary CTA: Verify with WhatsApp Link */}
                <a
                  href={verificationState.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '12px 18px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    textDecoration: 'none',
                    boxShadow: '0 4px 20px rgba(37, 211, 102, 0.45)',
                    transition: 'transform 0.15s ease',
                  }}
                >
                  <WhatsAppIcon size={20} />
                  <span>Verify with WhatsApp</span>
                  <ExternalLink size={16} />
                </a>

                {/* Instructions */}
                <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', lineHeight: '1.5' }}>
                  1. Click <strong>&quot;Verify with WhatsApp&quot;</strong> above.<br />
                  2. Send the pre-filled message: <code style={{ color: '#00EEFD', fontWeight: 700, background: 'rgba(0,238,253,0.1)', padding: '2px 6px', borderRadius: '4px' }}>VERIFY {verificationState.code}</code> from your number <strong>+91 {formData.mobile}</strong>.<br />
                  3. Our server detects your message and marks your account verified!
                </div>

                {/* Waiting radar indicator */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'rgba(251, 191, 36, 0.1)',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    color: '#fbbf24',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <RefreshCw size={14} style={{ animation: 'spin 2s linear infinite' }} />
                    <span>Waiting for your WhatsApp message...</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSimulateVerification}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#00eefd',
                      cursor: 'pointer',
                      fontSize: '0.72rem',
                      textDecoration: 'underline',
                    }}
                    title="Click to simulate message reception if testing without WhatsApp app"
                  >
                    Simulate (Dev)
                  </button>
                </div>
              </div>
            )}

            {/* Verification State 3: Verified Successfully */}
            {verificationState.verified && (
              <div
                style={{
                  marginTop: '10px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1.5px solid rgba(16, 185, 129, 0.45)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: '#10b981',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.88rem' }}>
                  <CheckCircle2 size={18} color="#10b981" />
                  <span>Mobile Number +91 {formData.mobile} Verified via WhatsApp!</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setVerificationState({
                      initiated: false,
                      loading: false,
                      code: '',
                      whatsappUrl: '',
                      whatsappNumber: '',
                      prefilledText: '',
                      verified: false,
                      expiresAt: null,
                    });
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    textDecoration: 'underline',
                  }}
                >
                  Change
                </button>
              </div>
            )}
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
              background: verificationState.verified
                ? 'var(--primary-gradient)'
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: verificationState.verified
                ? '0 4px 18px rgba(0, 102, 255, 0.45)'
                : '0 4px 18px rgba(16, 185, 129, 0.35)',
            }}
          >
            {loading ? (
              <div className="spinner" style={{ width: '20px', height: '20px', margin: 0 }} />
            ) : (
              <>
                <Zap size={18} />
                <span>
                  {verificationState.verified
                    ? 'Create Account & Claim 25 Credits'
                    : 'Verify Mobile via WhatsApp to Sign Up'}
                </span>
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
