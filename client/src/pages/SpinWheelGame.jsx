import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Sparkles,
  Play,
  Volume2,
  VolumeX,
  Coins,
  History,
  Users,
  Info,
  Gift,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SpinWheelCanvas from '../components/spin/SpinWheelCanvas';
import RewardedAdModal from '../components/spin/RewardedAdModal';

const DEFAULT_SEGMENTS = [
  { id: 0, label: '1 Credit', credits: 1, color: '#3a86ff', textColor: '#ffffff' },
  { id: 1, label: '2 Credits', credits: 2, color: '#00e699', textColor: '#041d14' },
  { id: 2, label: '5 Credits', credits: 5, color: '#fde502', textColor: '#1a1800' },
  { id: 3, label: '1 Credit', credits: 1, color: '#8338ec', textColor: '#ffffff' },
  { id: 4, label: '10 Credits 🔥', credits: 10, color: '#ff006e', textColor: '#ffffff' },
  { id: 5, label: '1 Credit', credits: 1, color: '#00f5d4', textColor: '#03201a' },
  { id: 6, label: '20 Credits 👑', credits: 20, color: '#ffbe0b', textColor: '#261b00' },
  { id: 7, label: '2 Credits', credits: 2, color: '#fb5607', textColor: '#ffffff' },
];

const SpinWheelGame = () => {
  const { user, isAuthenticated, loading: authLoading, refreshUser, updateUserBalance } = useAuth();
  const toast = useToast();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [statusData, setStatusData] = useState(null);
  const [segments, setSegments] = useState(DEFAULT_SEGMENTS);
  const [hasPendingSpin, setHasPendingSpin] = useState(false);
  const [spinToken, setSpinToken] = useState(null);

  // Ad Modal State
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [adLoading, setAdLoading] = useState(false);

  // Spin State
  const [isSpinning, setIsSpinning] = useState(false);
  const [targetSliceIndex, setTargetSliceIndex] = useState(null);
  const [spinResult, setSpinResult] = useState(null);
  const [showWinCelebration, setShowWinCelebration] = useState(false);

  // History Tab
  const [activeTab, setActiveTab] = useState('my_spins'); // 'my_spins' | 'live_winners' | 'rules'

  // Fetch wheel and user spin status
  const fetchStatus = async () => {
    try {
      const res = await apiService.getSpinStatus();
      if (res && res.data) {
        setStatusData(res.data);
        if (res.data.segments && res.data.segments.length > 0) {
          setSegments(res.data.segments);
        }
        setHasPendingSpin(Boolean(res.data.hasPendingSpin));
      }
    } catch (err) {
      console.error('Failed to load spin status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchStatus();
    }
  }, [isAuthenticated]);

  if (!authLoading && (!isAuthenticated || !user)) {
    return <Navigate to="/login" replace />;
  }

  // Handle Rewarded Ad Completed
  const handleAdCompleted = async () => {
    setAdModalOpen(false);
    setAdLoading(true);
    try {
      const res = await apiService.claimAdSpin({
        ad_network: 'rewarded_video_simulator',
        completed_at: Date.now(),
      });

      if (res && res.spinToken) {
        setSpinToken(res.spinToken);
        setHasPendingSpin(true);
        toast.success('🎉 Rewarded Ad Verified! 1 Free Spin Unlocked!');
      } else {
        setHasPendingSpin(true);
        toast.success('🎉 Free Spin Unlocked!');
      }
      await fetchStatus();
    } catch (err) {
      toast.error(err.message || 'Failed to claim spin from ad.');
    } finally {
      setAdLoading(false);
    }
  };

  // Trigger Spin Execution
  const handleStartSpin = async () => {
    if (isSpinning || !hasPendingSpin) return;

    setIsSpinning(true);
    setShowWinCelebration(false);
    setSpinResult(null);

    try {
      const res = await apiService.playSpin(spinToken);
      if (res && res.data) {
        setSpinResult(res.data);
        setTargetSliceIndex(res.data.sliceIndex);
        setHasPendingSpin(false);
        setSpinToken(null);
      }
    } catch (err) {
      setIsSpinning(false);
      setTargetSliceIndex(null);
      toast.error(err.message || 'Failed to spin the wheel. Please try again.');
    }
  };

  // Callback when canvas animation completes
  const handleSpinFinish = async (_landedIndex) => {
    setIsSpinning(false);
    setShowWinCelebration(true);

    // Confetti burst
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (_e) {
      // Ignore confetti errors if blocked by browser
    }

    // Update balance
    if (spinResult && spinResult.newBalance !== undefined) {
      updateUserBalance(spinResult.newBalance);
    } else {
      await refreshUser();
    }

    toast.success(
      `🎉 Won ${spinResult?.rewardCredits || 1} Credits (${spinResult?.segmentLabel || 'Lucky Win'})!`
    );

    // Refresh history and stats
    await fetchStatus();
  };

  const spinsCompletedToday = statusData?.spinsCompletedToday ?? 0;
  const maxDailySpins = statusData?.maxDailySpins ?? 10;
  const spinsRemainingToday = statusData?.spinsRemainingToday ?? Math.max(0, maxDailySpins - spinsCompletedToday);
  const canWatchMoreAds = spinsRemainingToday > 0;

  return (
    <div
      className="inner-page-offset"
      style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '52px 20px 40px 20px',
      }}
    >
      {/* Rewarded Ad Modal */}
      <RewardedAdModal
        isOpen={adModalOpen}
        onClose={() => setAdModalOpen(false)}
        onAdCompleted={handleAdCompleted}
        adDurationSeconds={statusData?.adDurationSeconds || 15}
      />

      {/* Top Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ fontSize: '2rem' }}>🎡</span>
            <h1
              style={{
                fontSize: '1.9rem',
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '-0.5px',
              }}
            >
              Lucky Spin Wheel
            </h1>
            <span
              style={{
                background: 'rgba(253, 229, 2, 0.15)',
                border: '1px solid rgba(253, 229, 2, 0.5)',
                color: '#fde502',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '3px 9px',
                borderRadius: '12px',
                textTransform: 'uppercase',
              }}
            >
              100% Win
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', margin: 0 }}>
            Watch a short rewarded sponsor video to unlock your free spin and win guaranteed recharge credits!
          </p>
        </div>

        {/* Right Badges: Balance & Sound Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              padding: '8px 12px',
              color: soundEnabled ? '#00eefd' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.84rem',
              fontWeight: 600,
            }}
            title={soundEnabled ? 'Sound On' : 'Sound Muted'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>{soundEnabled ? 'Sound On' : 'Muted'}</span>
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(253, 203, 110, 0.12)',
              border: '1px solid rgba(253, 203, 110, 0.4)',
              borderRadius: '14px',
              padding: '8px 16px',
            }}
          >
            <Coins size={18} color="#fdcb6e" />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Balance
              </span>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fdcb6e' }}>
                {user?.credit_balance ?? 0} <span style={{ fontSize: '0.75rem' }}>CR</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Wheel Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px',
          alignItems: 'start',
          marginBottom: '32px',
        }}
      >
        {/* Left Column: Interactive Wheel Stage */}
        <div
          className="glass-card"
          style={{
            background: 'rgba(8, 12, 22, 0.85)',
            border: '1px solid rgba(0, 238, 253, 0.25)',
            borderRadius: '24px',
            padding: '28px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 238, 253, 0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle background ambient glow */}
          <div
            style={{
              position: 'absolute',
              top: '20%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '320px',
              height: '320px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0, 238, 253, 0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* Daily Limit Status Chip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              maxWidth: '380px',
              marginBottom: '20px',
              padding: '8px 14px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.84rem',
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>Daily Free Spins:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 800, color: spinsRemainingToday > 0 ? '#00e699' : '#ff006e' }}>
                {spinsCompletedToday} / {maxDailySpins} Used
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                ({spinsRemainingToday} left)
              </span>
            </div>
          </div>

          {/* The Spinning Canvas Wheel */}
          <SpinWheelCanvas
            segments={segments}
            isSpinning={isSpinning}
            targetSliceIndex={targetSliceIndex}
            onSpinFinish={handleSpinFinish}
            soundEnabled={soundEnabled}
            size={360}
          />

          {/* Action Control Button Area */}
          <div
            style={{
              width: '100%',
              maxWidth: '380px',
              marginTop: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {hasPendingSpin ? (
              /* User has unlocked 1 spin via ad */
              <button
                type="button"
                disabled={isSpinning}
                onClick={handleStartSpin}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '16px',
                  fontSize: '1.2rem',
                  fontWeight: 900,
                  cursor: isSpinning ? 'not-allowed' : 'pointer',
                  background: isSpinning
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'linear-gradient(135deg, #fde502 0%, #ff006e 100%)',
                  color: isSpinning ? 'var(--text-muted)' : '#000000',
                  border: 'none',
                  boxShadow: isSpinning
                    ? 'none'
                    : '0 0 30px rgba(253, 229, 2, 0.6), 0 8px 20px rgba(0, 0, 0, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  letterSpacing: '0.5px',
                  transition: 'all 0.2s',
                  animation: !isSpinning ? 'pulse 2s infinite' : 'none',
                }}
              >
                <Sparkles size={22} />
                <span>{isSpinning ? 'SPINNING WHEEL...' : 'SPIN NOW! (1 FREE)'}</span>
              </button>
            ) : canWatchMoreAds ? (
              /* User must watch an ad to get a spin */
              <button
                type="button"
                disabled={adLoading}
                onClick={() => setAdModalOpen(true)}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '16px',
                  fontSize: '1.08rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #00eefd 0%, #00e699 100%)',
                  color: '#031410',
                  border: 'none',
                  boxShadow: '0 0 25px rgba(0, 238, 253, 0.4), 0 8px 20px rgba(0, 0, 0, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'all 0.2s',
                }}
              >
                <Play size={20} fill="#031410" />
                <span>WATCH AD TO UNLOCK SPIN</span>
              </button>
            ) : (
              /* Daily Limit Reached */
              <div
                style={{
                  padding: '14px',
                  borderRadius: '14px',
                  background: 'rgba(255, 0, 110, 0.1)',
                  border: '1px solid rgba(255, 0, 110, 0.3)',
                  textAlign: 'center',
                  color: '#ff006e',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                }}
              >
                🎯 Daily Limit Reached (10/10 Spins). Check back tomorrow for more free spins!
              </div>
            )}

            {/* Instruction footnote */}
            <p
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                textAlign: 'center',
                margin: 0,
              }}
            >
              {hasPendingSpin
                ? '✨ You have 1 spin token ready! Tap above to spin.'
                : '⚡ Watch a 15-second sponsor video to claim 1 free spin. Guaranteed win every time!'}
            </p>
          </div>

          {/* Win Celebration Banner */}
          {showWinCelebration && spinResult && (
            <div
              style={{
                marginTop: '20px',
                width: '100%',
                maxWidth: '380px',
                padding: '14px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(0, 230, 153, 0.2) 0%, rgba(0, 238, 253, 0.2) 100%)',
                border: '1px solid #00e699',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                animation: 'modalSlideIn 0.3s ease-out',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={24} color="#00e699" />
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>
                    {spinResult.message || '🎉 Congratulations!'}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    +{spinResult.rewardCredits} Credits added to your balance
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowWinCelebration(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Recent Activity & Multi-tab Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Feature Highlights Card */}
          <div
            className="glass-card"
            style={{
              background: 'rgba(8, 12, 22, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Zap size={18} color="#fde502" />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                How Wheel Rewards Work
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'rgba(0, 238, 253, 0.15)',
                    color: '#00eefd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  1
                </div>
                <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  <strong style={{ color: '#ffffff' }}>Watch a 15-second sponsor video:</strong> Video ads are 100% sponsored by partner brands.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'rgba(0, 230, 153, 0.15)',
                    color: '#00e699',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  2
                </div>
                <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  <strong style={{ color: '#ffffff' }}>Receive 1 Free Spin:</strong> No credit deductions. Every spin is strictly a reward.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'rgba(253, 229, 2, 0.15)',
                    color: '#fde502',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  3
                </div>
                <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  <strong style={{ color: '#ffffff' }}>Guaranteed Win:</strong> Win up to 25 Credits per spin and redeem anytime for mobile recharges!
                </div>
              </div>
            </div>
          </div>

          {/* Tabs: My Spins / Live Winners / Wheel Slices */}
          <div
            className="glass-card"
            style={{
              background: 'rgba(8, 12, 22, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '20px',
              minHeight: '340px',
            }}
          >
            {/* Tab Header Buttons */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                paddingBottom: '12px',
                marginBottom: '16px',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('my_spins')}
                style={{
                  background: activeTab === 'my_spins' ? 'rgba(0, 238, 253, 0.15)' : 'transparent',
                  border: activeTab === 'my_spins' ? '1px solid #00eefd' : '1px solid transparent',
                  color: activeTab === 'my_spins' ? '#00eefd' : 'var(--text-muted)',
                  borderRadius: '10px',
                  padding: '6px 14px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <History size={14} />
                <span>My Spins</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('live_winners')}
                style={{
                  background: activeTab === 'live_winners' ? 'rgba(0, 230, 153, 0.15)' : 'transparent',
                  border: activeTab === 'live_winners' ? '1px solid #00e699' : '1px solid transparent',
                  color: activeTab === 'live_winners' ? '#00e699' : 'var(--text-muted)',
                  borderRadius: '10px',
                  padding: '6px 14px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Users size={14} />
                <span>Live Winners</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('rules')}
                style={{
                  background: activeTab === 'rules' ? 'rgba(253, 229, 2, 0.15)' : 'transparent',
                  border: activeTab === 'rules' ? '1px solid #fde502' : '1px solid transparent',
                  color: activeTab === 'rules' ? '#fde502' : 'var(--text-muted)',
                  borderRadius: '10px',
                  padding: '6px 14px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Info size={14} />
                <span>Wheel Odds</span>
              </button>
            </div>

            {/* Tab 1: My Spins */}
            {activeTab === 'my_spins' && (
              <div>
                {!statusData?.myRecentSpins || statusData.myRecentSpins.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
                    <Gift size={36} style={{ opacity: 0.3, marginBottom: '8px' }} />
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>No spins yet today!</p>
                    <p style={{ fontSize: '0.78rem', opacity: 0.7 }}>Watch your first video ad to spin.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {statusData.myRecentSpins.map((s) => (
                      <div
                        key={s.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '1.2rem' }}>🎡</span>
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
                              {s.segment_label}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              {new Date(s.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        </div>

                        <span
                          style={{
                            fontSize: '0.9rem',
                            fontWeight: 800,
                            color: '#00e699',
                            background: 'rgba(0, 230, 153, 0.12)',
                            padding: '4px 10px',
                            borderRadius: '20px',
                          }}
                        >
                          +{s.reward_credits} CR
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Live Platform Winners */}
            {activeTab === 'live_winners' && (
              <div>
                {!statusData?.recentWinners || statusData.recentWinners.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
                    <p style={{ fontSize: '0.88rem' }}>Live winners feed will appear as players spin!</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {statusData.recentWinners.map((w) => (
                      <div
                        key={w.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          borderRadius: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: '#00e699',
                              display: 'inline-block',
                            }}
                          />
                          <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#ffffff' }}>
                            {w.name} {w.mobile ? `(${w.mobile})` : ''}
                          </span>
                        </div>

                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fde502' }}>
                          +{w.reward_credits} Credits
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Slices & Odds */}
            {activeTab === 'rules' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 6px 0' }}>
                  Every spin guarantees credits! The odds are certified server-side:
                </p>
                {segments.map((seg) => (
                  <div
                    key={seg.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '8px',
                      borderLeft: `4px solid ${seg.color}`,
                    }}
                  >
                    <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#ffffff' }}>
                      {seg.label}
                    </span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#00eefd' }}>
                      {seg.credits} Credits
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpinWheelGame;
