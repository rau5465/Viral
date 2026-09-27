import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dices, Flame, Sparkles, X, ArrowRight, Coins } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PROMO_DAILY_KEY = 'far_multiply_promo_shown_date';

const MultiplyPromoModal = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    // Don't show modal if already on the game page
    if (location.pathname === '/multiply' || location.pathname === '/game') return;

    // Calculate account age: >= 2 days (48 hours)
    const createdAt = user.created_at || user.createdAt;
    if (!createdAt) return;

    const accountAgeMs = Date.now() - new Date(createdAt).getTime();
    const isOver2Days = accountAgeMs >= 2 * 24 * 60 * 60 * 1000;

    if (!isOver2Days) return;

    // Show popup just once a day: check calendar date
    const todayDateString = new Date().toDateString();
    const lastShownDate = localStorage.getItem(PROMO_DAILY_KEY);
    if (lastShownDate === todayDateString) {
      return; // Already promoted once today
    }

    // Trigger promotion popup with a 1.5s delay after page load for high impact
    const timer = setTimeout(() => {
      setIsOpen(true);
      // Mark as shown for today
      localStorage.setItem(PROMO_DAILY_KEY, todayDateString);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, location.pathname]);

  const handleDismiss = () => {
    localStorage.setItem(PROMO_DAILY_KEY, new Date().toDateString());
    setIsOpen(false);
  };

  const handlePlayNow = () => {
    localStorage.setItem(PROMO_DAILY_KEY, new Date().toDateString());
    setIsOpen(false);
    navigate('/multiply');
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '36px 28px',
          background: 'linear-gradient(180deg, #0d1222 0%, #060913 100%)',
          border: '2px solid rgba(253, 167, 2, 0.7)',
          borderRadius: '24px',
          boxShadow: '0 0 50px rgba(253, 167, 2, 0.4), 0 20px 60px rgba(0, 0, 0, 0.9)',
          position: 'relative',
          textAlign: 'center',
          animation: 'modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Close Button */}
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
          title="Close"
        >
          <X size={18} />
        </button>

        {/* Floating Glowing Icon */}
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: 'var(--lightning-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            boxShadow: '0 0 30px rgba(253, 167, 2, 0.8)',
          }}
        >
          <Dices size={36} color="#000" />
        </div>

        {/* Promo Eyebrow Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(253, 167, 2, 0.15)',
            border: '1px solid rgba(253, 167, 2, 0.4)',
            borderRadius: '20px',
            padding: '4px 14px',
            color: '#fde502',
            fontWeight: 800,
            fontSize: '0.8rem',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          <Flame size={14} color="#fde502" /> Daily Multiplier Bonus
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '10px', color: '#fff', lineHeight: 1.3 }}>
          Multiply Your Credits 100X by playing multiplier game
        </h2>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '22px' }}>
          You've been earning with FAR for over <strong>2 days</strong>! Don't let your credits sit idle — roll the <strong>1-10000 HI-LO Dice</strong> and multiply your credits up to <strong>100X</strong>!
        </p>

        {/* Feature Highlights */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              background: 'rgba(0, 238, 253, 0.08)',
              border: '1px solid rgba(0, 238, 253, 0.25)',
              borderRadius: '12px',
              padding: '10px',
              fontSize: '0.85rem',
            }}
          >
            <div style={{ color: 'var(--accent)', fontWeight: 800 }}>⚡ 100X Multiplier</div>
            <div style={{ color: 'var(--text-sub)', fontSize: '0.75rem' }}>Roll HI &gt;5500 or LO &lt;4500</div>
          </div>

          <div
            style={{
              background: 'rgba(0, 230, 153, 0.08)',
              border: '1px solid rgba(0, 230, 153, 0.25)',
              borderRadius: '12px',
              padding: '10px',
              fontSize: '0.85rem',
            }}
          >
            <div style={{ color: '#00e699', fontWeight: 800 }}>🚀 Instant Credits</div>
            <div style={{ color: 'var(--text-sub)', fontSize: '0.75rem' }}>Real-time balance update</div>
          </div>
        </div>

        {/* Action Buttons */}
        <button
          onClick={handlePlayNow}
          style={{
            width: '100%',
            background: 'var(--lightning-gradient)',
            color: '#070b14',
            padding: '14px',
            borderRadius: '14px',
            fontWeight: 800,
            fontSize: '1.05rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 8px 25px rgba(253, 167, 2, 0.5)',
            marginBottom: '10px',
            cursor: 'pointer',
            border: 'none',
          }}
        >
          <span>🎲 Roll Dice &amp; Multiply Credits</span>
          <ArrowRight size={18} />
        </button>

        <button
          onClick={handleDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-sub)',
            fontSize: '0.85rem',
            cursor: 'pointer',
            padding: '6px',
          }}
        >
          Remind Me Tomorrow
        </button>
      </div>
    </div>
  );
};

export default MultiplyPromoModal;
