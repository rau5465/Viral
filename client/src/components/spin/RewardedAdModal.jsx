import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Gift,
} from 'lucide-react';
import Modal from '../common/Modal';

// Sample sponsor video campaigns rotated randomly
const SPONSOR_CAMPAIGNS = [
  {
    sponsor: 'Airtel 5G Plus',
    tagline: 'Experience Unlimited 5G Data with Ultra-low Latency!',
    cta: 'Explore 5G Plans',
    accent: '#ff0000',
    bgGradient: 'linear-gradient(135deg, #3d0000 0%, #150000 100%)',
    iconText: '5G',
  },
  {
    sponsor: 'Jio True 5G',
    tagline: 'India’s Largest Standalone 5G Network with Free OTT Perks.',
    cta: 'Get Jio Connection',
    accent: '#0057ff',
    bgGradient: 'linear-gradient(135deg, #001740 0%, #000918 100%)',
    iconText: 'JIO',
  },
  {
    sponsor: 'Vi Hero Unlimited',
    tagline: 'Binge All Night (12am - 6am) with Zero Data Deductions!',
    cta: 'Upgrade to Vi Hero',
    accent: '#ff9900',
    bgGradient: 'linear-gradient(135deg, #3d2200 0%, #140b00 100%)',
    iconText: 'Vi',
  },
  {
    sponsor: 'Google Play Games',
    tagline: 'Play high-graphic mobile games smoothly on any device.',
    cta: 'Install Now',
    accent: '#00e699',
    bgGradient: 'linear-gradient(135deg, #003322 0%, #00140d 100%)',
    iconText: 'PLAY',
  },
];

const RewardedAdModal = ({ isOpen, onClose, onAdCompleted, adDurationSeconds = 15 }) => {
  const [secondsLeft, setSecondsLeft] = useState(adDurationSeconds);
  const [canClaim, setCanClaim] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [campaign, setCampaign] = useState(SPONSOR_CAMPAIGNS[0]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Pick random sponsor campaign
      const randomIdx = Math.floor(Math.random() * SPONSOR_CAMPAIGNS.length);
      setCampaign(SPONSOR_CAMPAIGNS[randomIdx]);
      setSecondsLeft(adDurationSeconds);
      setCanClaim(false);
      setShowExitConfirm(false);

      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setCanClaim(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, adDurationSeconds]);

  if (!isOpen) return null;

  const handleAttemptClose = () => {
    if (canClaim) {
      onClose();
    } else {
      setShowExitConfirm(true);
    }
  };

  const progressPercent = Math.min(
    100,
    Math.round(((adDurationSeconds - secondsLeft) / adDurationSeconds) * 100)
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.92)',
        backdropFilter: 'blur(12px)',
        padding: '16px',
        animation: 'fadeIn 0.25s ease-out',
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '520px',
          background: '#090d16',
          border: '1px solid rgba(0, 238, 253, 0.4)',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 238, 253, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Top Ad Banner Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            background: 'rgba(255, 255, 255, 0.04)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '2px 7px',
                borderRadius: '4px',
                color: 'var(--text-muted)',
              }}
            >
              Sponsored Ad
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#00eefd', fontSize: '0.8rem', fontWeight: 600 }}>
              <ShieldCheck size={14} />
              <span>Verified Partner</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
              }}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            <button
              type="button"
              onClick={handleAttemptClose}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Close Ad"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Video Canvas / Creative Stage */}
        <div
          style={{
            minHeight: '260px',
            background: campaign.bgGradient,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Subtle animated background pulse circle */}
          <div
            style={{
              position: 'absolute',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: campaign.accent,
              opacity: 0.12,
              filter: 'blur(40px)',
              animation: 'pulse 3s infinite',
            }}
          />

          {/* Sponsor Logo Icon */}
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '18px',
              background: 'rgba(0, 0, 0, 0.4)',
              border: `2px solid ${campaign.accent}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              fontWeight: 900,
              color: campaign.accent,
              boxShadow: `0 0 25px ${campaign.accent}44`,
              marginBottom: '16px',
              zIndex: 2,
            }}
          >
            {campaign.iconText}
          </div>

          <h3
            style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              color: '#ffffff',
              marginBottom: '6px',
              zIndex: 2,
            }}
          >
            {campaign.sponsor}
          </h3>

          <p
            style={{
              fontSize: '0.9rem',
              color: 'rgba(255, 255, 255, 0.8)',
              maxWidth: '380px',
              lineHeight: 1.4,
              marginBottom: '18px',
              zIndex: 2,
            }}
          >
            {campaign.tagline}
          </p>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 600,
              zIndex: 2,
            }}
          >
            <Sparkles size={14} color="#fde502" /> {campaign.cta}
          </span>

          {/* Rewarded Spin Indicator Badge */}
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '14px',
              background: 'rgba(0, 0, 0, 0.75)',
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              color: '#fde502',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              zIndex: 3,
            }}
          >
            <Gift size={13} />
            <span>Reward: 1 Free Spin</span>
          </div>

          {/* Countdown Pill in Video */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '14px',
              background: canClaim ? 'rgba(0, 230, 153, 0.25)' : 'rgba(0, 0, 0, 0.75)',
              border: canClaim ? '1px solid #00e699' : '1px solid rgba(255, 255, 255, 0.15)',
              padding: '4px 10px',
              borderRadius: '14px',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: canClaim ? '#00e699' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              zIndex: 3,
            }}
          >
            {canClaim ? (
              <>
                <CheckCircle2 size={14} color="#00e699" />
                <span>Ready to Claim!</span>
              </>
            ) : (
              <>
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: '#ff006e',
                    display: 'inline-block',
                    animation: 'pulse 1s infinite',
                  }}
                />
                <span>Reward in {secondsLeft}s</span>
              </>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ height: '4px', background: 'rgba(255, 255, 255, 0.08)', width: '100%' }}>
          <div
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              background: canClaim
                ? 'linear-gradient(90deg, #00e699, #00eefd)'
                : 'linear-gradient(90deg, #ff006e, #fde502)',
              transition: 'width 1s linear',
            }}
          />
        </div>

        {/* Bottom Claim Action Bar */}
        <div
          style={{
            padding: '16px 20px',
            background: 'rgba(12, 16, 26, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {canClaim ? 'Video Completed!' : 'Watch full video to unlock spin'}
            </span>
            <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>
              {canClaim ? 'Spin Token Unlocked' : `Watch ${secondsLeft}s more`}
            </span>
          </div>

          <button
            type="button"
            disabled={!canClaim}
            onClick={() => onAdCompleted && onAdCompleted()}
            style={{
              padding: '10px 24px',
              borderRadius: '12px',
              fontSize: '0.95rem',
              fontWeight: 800,
              cursor: canClaim ? 'pointer' : 'not-allowed',
              background: canClaim
                ? 'linear-gradient(135deg, #00eefd 0%, #00e699 100%)'
                : 'rgba(255, 255, 255, 0.08)',
              color: canClaim ? '#031410' : 'rgba(255, 255, 255, 0.3)',
              border: canClaim ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: canClaim ? '0 0 20px rgba(0, 238, 253, 0.4)' : 'none',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Sparkles size={16} />
            <span>CLAIM FREE SPIN</span>
          </button>
        </div>

        {/* Exit Confirmation Warning Overlay */}
        {showExitConfirm && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.9)',
              backdropFilter: 'blur(8px)',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              textAlign: 'center',
            }}
          >
            <AlertTriangle size={42} color="#fde502" style={{ marginBottom: '12px' }} />
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
              Exit without Free Spin?
            </h4>
            <p
              style={{
                fontSize: '0.88rem',
                color: 'var(--text-muted)',
                maxWidth: '320px',
                marginBottom: '20px',
                lineHeight: 1.4,
              }}
            >
              If you close now, you will lose your progress and will not unlock your free wheel spin.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  background: 'var(--accent)',
                  color: '#000',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Resume Video ({secondsLeft}s left)
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: 'var(--text-muted)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Close Anyway
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardedAdModal;
