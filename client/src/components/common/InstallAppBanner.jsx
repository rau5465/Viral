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
        background: 'linear-gradient(135deg, rgba(7, 11, 20, 0.96), rgba(1, 24, 70, 0.96))',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(0, 210, 255, 0.4)',
        borderRadius: '16px',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.7), 0 0 24px rgba(0, 210, 255, 0.25)',
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
            background: 'linear-gradient(135deg, #00eefd, #0066ff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 14px rgba(0, 102, 255, 0.5)',
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
            <span>Install FAR Web App</span>
            <Sparkles size={14} color="#fda702" />
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
            Instant 1-tap recharges • Works lightning fast
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '10px' }}>
        <button
          onClick={handleInstallClick}
          style={{
            background: 'linear-gradient(135deg, #00eefd, #0066ff)',
            color: '#070b14',
            border: 'none',
            borderRadius: '10px',
            padding: '8px 14px',
            fontSize: '0.8rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 14px rgba(0, 210, 255, 0.4)',
          }}
        >
          <Download size={14} color="#070b14" />
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
