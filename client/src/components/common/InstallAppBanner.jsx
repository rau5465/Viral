import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';

const InstallAppBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if running as installed standalone PWA
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    // Check if dismissed previously in this session
    const isDismissed = sessionStorage.getItem('vr_install_dismissed');
    if (isDismissed) return;

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
      console.log('🎉 [PWA] ViralRecharge installed successfully!');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Guide iOS or browsers without native prompt
      alert(
        'To install this app on your phone:\n1. Tap the Share or 3-dots Menu button in your browser.\n2. Tap "Add to Home screen" or "Install App".'
      );
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('vr_install_dismissed', 'true');
  };

  if (isInstalled || !showBanner) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '80px',
        left: '12px',
        right: '12px',
        zIndex: 999,
        background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.95), rgba(15, 23, 42, 0.95))',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(99, 102, 241, 0.4)',
        borderRadius: '16px',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(99, 102, 241, 0.3)',
        animation: 'slideUp 0.3s ease-out',
        maxWidth: '500px',
        margin: '0 auto',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.5)',
          }}
        >
          <Smartphone size={22} color="#ffffff" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Save App to Phone</span>
            <Sparkles size={14} color="#fbbf24" />
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: '#94a3b8',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Fast 1-tap launch • Works online & offline
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '10px' }}>
        <button
          onClick={handleInstallClick}
          style={{
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '8px 14px',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
          }}
        >
          <Download size={14} />
          <span>Install</span>
        </button>

        <button
          onClick={handleDismiss}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            cursor: 'pointer',
          }}
          aria-label="Dismiss banner"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default InstallAppBanner;
