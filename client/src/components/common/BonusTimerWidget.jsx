import React, { useState, useEffect } from 'react';
import { Flame, Clock, Users, Share2, CheckCircle2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useToast } from '../../context/ToastContext';

const BonusTimerWidget = ({ bonus, referralLink, referralCode }) => {
  const toast = useToast();
  const [timeLeft, setTimeLeft] = useState(bonus?.secondsRemaining || 0);

  useEffect(() => {
    if (bonus?.isMultiplied) {
      // Fire confetti celebration once on load if unlocked
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (_err) {
        // Ignore confetti error
      }
    }
  }, [bonus?.isMultiplied]);

  // Countdown timer decrement
  useEffect(() => {
    setTimeLeft(bonus?.secondsRemaining || 0);

    if (!bonus || bonus.isExpired || bonus.isMultiplied || !bonus.secondsRemaining) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [bonus]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyLink = () => {
    const link = referralLink || `${window.location.origin}/register?ref=${referralCode || ''}`;
    navigator.clipboard.writeText(link);
    toast.success('Referral link copied to clipboard!');
  };

  const handleWhatsAppShare = () => {
    const link = referralLink || `${window.location.origin}/register?ref=${referralCode || ''}`;
    const text = encodeURIComponent(
      `🔥 Get FREE Mobile Recharges with ViralRecharge! Sign up using my referral link to get instant bonus credits: ${link}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  if (!bonus) return null;

  // Unlocked State
  if (bonus.isMultiplied) {
    return (
      <div
        className="glass-card"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 184, 148, 0.15) 0%, rgba(22, 27, 34, 0.95) 100%)',
          border: '1px solid rgba(0, 184, 148, 0.4)',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: '0 0 25px rgba(0, 184, 148, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(0, 184, 148, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={24} color="#00b894" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#00b894' }}>5x Viral Bonus Unlocked! 🎉</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                You earned 50 credits/user 5X bonus for referrals within your first 2 hours!
              </p>
            </div>
          </div>
          <span className="badge badge-success" style={{ padding: '6px 12px' }}>
            <Sparkles size={14} /> Completed
          </span>
        </div>
      </div>
    );
  }

  // Expired State
  if (bonus.isExpired) {
    return (
      <div
        className="glass-card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Clock size={20} color="var(--text-muted)" />
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>2-Hour 5x Bonus Window Ended</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Don&apos;t worry! You still earn 10 credits (₹10) for every single friend you refer!
            </div>
          </div>
        </div>
        <button onClick={handleCopyLink} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
          <Share2 size={15} /> Invite Friends
        </button>
      </div>
    );
  }

  // Active Countdown State
  return (
    <div
      className="glass-card pulse-glow"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 118, 117, 0.12) 0%, rgba(253, 203, 110, 0.08) 50%, rgba(22, 27, 34, 0.95) 100%)',
        border: '1px solid rgba(255, 118, 117, 0.4)',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #ff7675 0%, #fdcb6e 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(255, 118, 117, 0.4)',
            }}
          >
            <Flame size={26} color="#0d1117" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#ff7675' }}>5x Viral Referral Bonus!</h3>
              <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>2-Hour Window</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
              Earn <strong>50 Credits/User (5X Boost)</strong> within your first 2 hours! After that, standard reward is 10 Credits (₹10)/User.
            </p>
          </div>
        </div>

        {/* Live Timer Countdown */}
        <div
          style={{
            background: 'rgba(13, 17, 23, 0.9)',
            border: '1px solid rgba(255, 118, 117, 0.4)',
            borderRadius: '12px',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Clock size={20} color="#ff7675" />
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Time Left</div>
            <div className="timer-digit" style={{ fontFamily: 'monospace', fontSize: '1.3rem', fontWeight: 800, color: '#ff7675' }}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={16} color="var(--accent)" />
            Referrals: <strong>{bonus.referralCount || 0} / {bonus.target || 2}</strong>
          </span>
          <span style={{ color: 'var(--warning)', fontWeight: 700 }}>
            {bonus.referralCount >= (bonus.target || 2) ? 'Target Reached!' : `${(bonus.target || 2) - (bonus.referralCount || 0)} More Needed`}
          </span>
        </div>
        <div
          style={{
            width: '100%',
            height: '10px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${bonus.progressPercent || 0}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #ff7675 0%, #fdcb6e 100%)',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="btn-group-responsive" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        <button
          onClick={handleWhatsAppShare}
          className="btn btn-primary"
          style={{ background: '#25D366', color: '#fff', boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)', flex: '1 1 160px' }}
        >
          <Share2 size={16} /> Share on WhatsApp
        </button>
        <button onClick={handleCopyLink} className="btn btn-secondary" style={{ flex: '1 1 160px' }}>
          Copy Referral Link
        </button>
      </div>
    </div>
  );
};

export default BonusTimerWidget;
