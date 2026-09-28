import React, { useState, useEffect } from 'react';
import { Plus, X, Smartphone, Sparkles, Share2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Device detection helper — strictly detects mobile browsers, Android, or iOS
const checkIsMobileOrHandheld = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

  const ua = navigator.userAgent || navigator.vendor || window.opera || '';

  // Explicit Android check
  const isAndroid = /android/i.test(ua);

  // Explicit iOS check (iPhone, iPad, iPod, or iPadOS with touch on Mac platform)
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  // Exclude desktop operating systems (Windows PC, Mac desktop, Linux desktop) unless it's iOS or Android
  const isDesktopOS =
    /Windows NT|Macintosh(?!.*Touch)|X11|Linux x86_64/i.test(ua) && !isIOS && !isAndroid;

  if (isDesktopOS) {
    return false;
  }

  // Mobile User-Agent tokens
  const isMobileUA =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(
      ua
    );

  const isSmallScreen =
    typeof window.innerWidth !== 'undefined' && window.innerWidth <= 820;
  const hasTouch =
    (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
    'ontouchstart' in window;

  return isAndroid || isIOS || isMobileUA || (isSmallScreen && hasTouch);
};

const checkIsIOS = () => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor || window.opera || '';
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
};

const InstallAppBanner = () => {
  const { isAuthenticated } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [isAppleDevice, setIsAppleDevice] = useState(false);

  useEffect(() => {
    // Only proceed if client is on a mobile device or Android/iOS browser
    const mobileDetected = checkIsMobileOrHandheld();
    if (!mobileDetected) {
      return;
    }
    setIsMobile(true);
    setIsAppleDevice(checkIsIOS());

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

    // Listen for Chromium PWA install prompt (Android Chrome, Edge mobile, etc.)
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
    });

    // On iOS Safari and mobile browsers where beforeinstallprompt does not fire,
    // display the banner after a gentle 1.5s delay
    const delayTimer = setTimeout(() => {
      setShowBanner(true);
    }, 1500);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(delayTimer);
    };
  }, []);

  const handleActionClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setShowBanner(false);
          sessionStorage.setItem('vr_install_dismissed', 'true');
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error('PWA prompt error:', err);
      }
      return;
    }

    // If native prompt is not available (e.g. iOS Safari, Firefox, or already prompted), show friendly visual guide
    setShowGuide(true);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('vr_install_dismissed', 'true');
  };

  // Only show on verified mobile browsers and if not standalone installed
  if (!isMobile || isInstalled || !showBanner) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: isAuthenticated ? '76px' : '18px',
        left: '12px',
        right: '12px',
        zIndex: 999,
        background: 'linear-gradient(135deg, rgba(8, 12, 22, 0.98), rgba(2, 26, 75, 0.98))',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(0, 238, 253, 0.35)',
        borderRadius: '16px',
        padding: '12px 14px',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.75), 0 0 24px rgba(0, 210, 255, 0.2)',
        animation: 'slideUp 0.3s ease-out',
        maxWidth: '480px',
        margin: '0 auto',
      }}
    >
      {showGuide ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Smartphone size={16} color="#00eefd" />
              <span>Save FAR to your Home Screen</span>
            </div>
            <button
              onClick={() => setShowGuide(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                borderRadius: '50%',
                width: '26px',
                height: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                cursor: 'pointer',
              }}
              aria-label="Close guide"
            >
              <X size={15} />
            </button>
          </div>

          <div
            style={{
              fontSize: '0.78rem',
              color: '#cbd5e1',
              lineHeight: '1.45',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {isAppleDevice ? (
              <ol
                style={{
                  margin: 0,
                  paddingLeft: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                }}
              >
                <li>
                  Tap the Safari <strong>Share</strong> button (
                  <Share2
                    size={12}
                    color="#00eefd"
                    style={{ display: 'inline', verticalAlign: 'middle', margin: '0 2px' }}
                  />
                  ) at the bottom.
                </li>
                <li>
                  Scroll down and tap <strong>"Add to Home Screen"</strong> (➕).
                </li>
                <li>
                  Tap <strong>"Add"</strong> in the top right to access FAR directly anytime!
                </li>
              </ol>
            ) : (
              <ol
                style={{
                  margin: 0,
                  paddingLeft: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                }}
              >
                <li>
                  Tap the browser <strong>menu (⋮)</strong> in the top-right corner.
                </li>
                <li>
                  Tap <strong>"Add to Home screen"</strong>.
                </li>
                <li>
                  Tap <strong>"Add"</strong> to open FAR directly anytime!
                </li>
              </ol>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              onClick={() => {
                setShowGuide(false);
                handleDismiss();
              }}
              style={{
                background: 'linear-gradient(135deg, #00eefd, #0066ff)',
                color: '#070b14',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Got it!
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #00eefd, #0066ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(0, 102, 255, 0.45)',
              }}
            >
              <Smartphone size={20} color="#ffffff" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  lineHeight: 1.25,
                }}
              >
                <span>Save to Phone's Home Screen</span>
                <Sparkles size={13} color="#fda702" />
              </div>
              <div
                style={{
                  fontSize: '0.72rem',
                  color: '#94a3b8',
                  marginTop: '2px',
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                Use directly with 1 tap • No download needed
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <button
              onClick={handleActionClick}
              style={{
                background: 'linear-gradient(135deg, #00eefd, #0066ff)',
                color: '#070b14',
                border: 'none',
                borderRadius: '9px',
                padding: '7px 12px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 4px 12px rgba(0, 210, 255, 0.35)',
                whiteSpace: 'nowrap',
              }}
            >
              <Plus size={14} strokeWidth={2.6} color="#070b14" />
              <span>Add to Screen</span>
            </button>

            <button
              onClick={handleDismiss}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                borderRadius: '50%',
                width: '26px',
                height: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              aria-label="Dismiss banner"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstallAppBanner;
