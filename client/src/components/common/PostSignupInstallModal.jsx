import React, { useState, useEffect } from 'react';
import { Smartphone, Sparkles, X, Share2, Plus, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const checkIsIOS = () => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor || window.opera || '';
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
};

const checkIsAndroid = () => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor || window.opera || '';
  return /android/i.test(ua);
};

const PostSignupInstallModal = () => {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isApple, setIsApple] = useState(false);
  const [isAndroidDevice, setIsAndroidDevice] = useState(false);

  useEffect(() => {
    // Only trigger if post-signup flag was set
    const shouldPrompt = sessionStorage.getItem('far_post_signup_save_app');
    if (!shouldPrompt) return;

    // If app is already running in standalone PWA mode, don't show prompt
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    ) {
      sessionStorage.removeItem('far_post_signup_save_app');
      return;
    }

    setIsApple(checkIsIOS());
    setIsAndroidDevice(checkIsAndroid());

    // Check if deferred prompt already captured
    if (window.__farDeferredInstallPrompt) {
      setDeferredPrompt(window.__farDeferredInstallPrompt);
    }

    const handlePromptReady = () => {
      if (window.__farDeferredInstallPrompt) {
        setDeferredPrompt(window.__farDeferredInstallPrompt);
      }
    };

    const handleAppInstalled = () => {
      setInstalledSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2200);
    };

    window.addEventListener('far-pwa-prompt-ready', handlePromptReady);
    window.addEventListener('beforeinstallprompt', handlePromptReady);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Show modal smoothly after brief 600ms delay so dashboard finishes loading
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 600);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('far-pwa-prompt-ready', handlePromptReady);
      window.removeEventListener('beforeinstallprompt', handlePromptReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isAuthenticated]);

  const handleClose = () => {
    sessionStorage.removeItem('far_post_signup_save_app');
    setIsOpen(false);
  };

  const handleInstallClick = async () => {
    const promptEvent = deferredPrompt || window.__farDeferredInstallPrompt;

    if (promptEvent) {
      try {
        promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === 'accepted') {
          setInstalledSuccess(true);
          setTimeout(() => {
            handleClose();
          }, 2000);
        } else {
          handleClose();
        }
        window.__farDeferredInstallPrompt = null;
        setDeferredPrompt(null);
      } catch (err) {
        console.error('PWA prompt execution error:', err);
        setShowGuide(true);
      }
      return;
    }

    // If native prompt unavailable (iOS Safari, desktop, or prompt consumed), show illustrated guide
    setShowGuide(true);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: 'rgba(3, 7, 18, 0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        animation: 'fadeIn 0.25s ease-out',
      }}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '460px',
          width: '100%',
          padding: '28px 24px',
          background: 'linear-gradient(180deg, #090e1d 0%, #030611 100%)',
          border: '1.5px solid rgba(0, 238, 253, 0.55)',
          borderRadius: '24px',
          boxShadow: '0 0 45px rgba(0, 238, 253, 0.25), 0 24px 60px rgba(0, 0, 0, 0.9)',
          position: 'relative',
          textAlign: 'center',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Dismiss Button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
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
            transition: 'background 0.2s',
          }}
          title="Dismiss"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {installedSuccess ? (
          <div style={{ padding: '20px 0' }}>
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
              FAR App Saved to Your Phone!
            </h3>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginBottom: '20px' }}>
              You can now open FAR directly from your phone's home screen with 1 tap.
            </p>
            <button
              onClick={handleClose}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontWeight: 700 }}
            >
              Enter Dashboard
            </button>
          </div>
        ) : (
          <>
            {/* App Icon */}
            <div style={{ position: 'relative', width: '72px', height: '72px', margin: '0 auto 16px auto' }}>
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, #001f3f, #000b18)',
                  border: '1.5px solid rgba(0, 238, 253, 0.6)',
                  boxShadow: '0 0 28px rgba(0, 238, 253, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px',
                }}
              >
                <img
                  src="/far-logo-sm.png"
                  alt="FAR"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: '-4px',
                  right: '-4px',
                  background: '#fda702',
                  borderRadius: '50%',
                  width: '22px',
                  height: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #090e1d',
                }}
              >
                <Sparkles size={12} color="#000" />
              </div>
            </div>

            {/* Welcome Celebration Eyebrow */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(0, 238, 253, 0.12)',
                border: '1px solid rgba(0, 238, 253, 0.35)',
                borderRadius: '20px',
                padding: '4px 12px',
                color: '#00eefd',
                fontSize: '0.78rem',
                fontWeight: 700,
                marginBottom: '10px',
              }}
            >
              <span>🎉 Signup Completed • 25 Bonus Credits Added</span>
            </div>

            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', marginBottom: '8px', lineHeight: 1.25 }}>
              Save FAR to Your Phone
            </h2>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: '1.45', marginBottom: '18px' }}>
              Keep FAR on your phone's home screen for 1-tap instant access to your free mobile recharges and daily rewards.
            </p>

            {/* Feature Badges */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                marginBottom: '20px',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '10px 8px',
                  textAlign: 'center',
                }}
              >
                <Zap size={18} color="#00eefd" style={{ margin: '0 auto 4px auto' }} />
                <div style={{ color: '#fff', fontSize: '0.76rem', fontWeight: 700 }}>1-Tap Access</div>
                <div style={{ color: 'var(--text-sub)', fontSize: '0.68rem', marginTop: '2px' }}>No typing URLs</div>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '10px 8px',
                  textAlign: 'center',
                }}
              >
                <Sparkles size={18} color="#fda702" style={{ margin: '0 auto 4px auto' }} />
                <div style={{ color: '#fff', fontSize: '0.76rem', fontWeight: 700 }}>Fast Recharges</div>
                <div style={{ color: 'var(--text-sub)', fontSize: '0.68rem', marginTop: '2px' }}>Instant credits</div>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '10px 8px',
                  textAlign: 'center',
                }}
              >
                <Smartphone size={18} color="#00e699" style={{ margin: '0 auto 4px auto' }} />
                <div style={{ color: '#fff', fontSize: '0.76rem', fontWeight: 700 }}>0 MB Storage</div>
                <div style={{ color: 'var(--text-sub)', fontSize: '0.68rem', marginTop: '2px' }}>Lightweight PWA</div>
              </div>
            </div>

            {/* Illustrated Instructions if guide requested or on iOS */}
            {showGuide ? (
              <div
                style={{
                  background: 'rgba(0, 102, 255, 0.1)',
                  border: '1px solid rgba(0, 238, 253, 0.35)',
                  borderRadius: '14px',
                  padding: '14px',
                  marginBottom: '18px',
                  textAlign: 'left',
                  fontSize: '0.82rem',
                  lineHeight: '1.5',
                  color: '#e2e8f0',
                }}
              >
                <div style={{ fontWeight: 700, color: '#00eefd', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Smartphone size={16} />
                  <span>How to add to your Home Screen:</span>
                </div>
                {isApple ? (
                  <ol style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <li>
                      Tap the Safari <strong>Share</strong> button (
                      <Share2 size={13} color="#00eefd" style={{ display: 'inline', verticalAlign: 'middle' }} />
                      ) at the bottom toolbar.
                    </li>
                    <li>
                      Scroll down and tap <strong>"Add to Home Screen"</strong> (➕).
                    </li>
                    <li>
                      Tap <strong>"Add"</strong> in top right corner to finish!
                    </li>
                  </ol>
                ) : (
                  <ol style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <li>
                      Tap your browser's <strong>menu (⋮)</strong> at the top right corner.
                    </li>
                    <li>
                      Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>.
                    </li>
                    <li>
                      Tap <strong>"Install / Add"</strong> to save FAR to your phone!
                    </li>
                  </ol>
                )}
              </div>
            ) : null}

            {/* Primary Action Button */}
            <button
              onClick={handleInstallClick}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #00eefd 0%, #0066ff 100%)',
                color: '#070b14',
                padding: '14px 18px',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '1rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 8px 24px rgba(0, 102, 255, 0.45)',
                marginBottom: '10px',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
            >
              <Smartphone size={18} color="#070b14" />
              <span>{showGuide ? 'Got It! Save to Screen' : '📲 Save App to Phone Now'}</span>
            </button>

            {/* Secondary Dismiss Button */}
            <button
              onClick={handleClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-sub)',
                fontSize: '0.84rem',
                cursor: 'pointer',
                padding: '6px 12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'color 0.2s',
              }}
            >
              <span>Continue to Dashboard</span>
              <ArrowRight size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PostSignupInstallModal;
