import React, { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Dices,
  Flame,
  TrendingUp,
  AlertTriangle,
  History,
  Users,
  Info,
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Web Audio API Synthesizer for roll, win, and loss sounds (no external audio files needed)
const playSound = (type, soundEnabled = true) => {
  if (!soundEnabled) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'tick') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600 + Math.random() * 200, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'win') {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.28);
      });
    } else if (type === 'loss') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(75, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    }
  } catch {
    // Audio context may fail if user hasn't interacted yet
  }
};

const MultiplyGame = () => {
  const { user, isAuthenticated, loading, refreshUser, updateUserBalance } = useAuth();
  const toast = useToast();

  if (!loading && (!isAuthenticated || !user)) {
    return <Navigate to="/login" replace />;
  }

  const [balance, setBalance] = useState(user?.credit_balance ?? 0);
  const [betAmount, setBetAmount] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [displayNumber, setDisplayNumber] = useState('05000');
  const [lastResult, setLastResult] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState('my_bets'); // 'my_bets' | 'live_bets' | 'rules'

  const [myRolls, setMyRolls] = useState([]);
  const [liveRolls, setLiveRolls] = useState([]);
  const [stats, setStats] = useState(null);
  const [promoEligible, setPromoEligible] = useState(false);

  const rollIntervalRef = useRef(null);

  // Keep local balance in sync with auth state if updated externally
  useEffect(() => {
    if (user?.credit_balance !== undefined) {
      setBalance(user.credit_balance);
    }
  }, [user?.credit_balance]);

  // Load rolls and stats
  const loadGameData = async () => {
    try {
      const [myRes, liveRes, statsRes] = await Promise.allSettled([
        apiService.getMyRolls(),
        apiService.getLiveRolls(),
        apiService.getMultiplyStats(),
      ]);

      if (myRes.status === 'fulfilled' && myRes.value?.data?.rolls) {
        setMyRolls(myRes.value.data.rolls);
      }
      if (liveRes.status === 'fulfilled' && liveRes.value?.data?.rolls) {
        setLiveRolls(liveRes.value.data.rolls);
      }
      if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
        setStats(statsRes.value.data.stats);
        setPromoEligible(!!statsRes.value.data.promo?.is_eligible_for_2day_promo);
      }
    } catch (err) {
      console.warn('Error loading game data:', err);
    }
  };

  useEffect(() => {
    loadGameData();
    // Periodic refresh of live community rolls
    const interval = setInterval(async () => {
      try {
        const res = await apiService.getLiveRolls();
        if (res?.data?.rolls) setLiveRolls(res.data.rolls);
      } catch {}
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleBetChange = (newAmount) => {
    const parsed = parseInt(newAmount, 10);
    if (isNaN(parsed) || parsed < 1) {
      setBetAmount(1);
    } else {
      setBetAmount(Math.min(parsed, balance || 10000));
    }
  };

  const handleExecuteRoll = async (betType) => {
    if (rolling) return;

    if (balance < betAmount) {
      return toast.error(
        `Insufficient credits! You need ${betAmount} CR, but only have ${balance} CR.`
      );
    }

    setRolling(true);
    setLastResult(null);

    // Immediately deduct bet from balance so user sees real-time feedback
    const balanceWhileRolling = Math.max(0, balance - betAmount);
    setBalance(balanceWhileRolling);
    if (updateUserBalance) {
      updateUserBalance(balanceWhileRolling);
    }

    // Start mechanical odometer roll animation
    let tickCount = 0;
    rollIntervalRef.current = setInterval(() => {
      const randomRoll = Math.floor(Math.random() * 10000) + 1;
      setDisplayNumber(String(randomRoll).padStart(5, '0'));
      tickCount++;
      if (tickCount % 2 === 0) {
        playSound('tick', soundEnabled);
      }
    }, 50);

    try {
      const response = await apiService.rollMultiply({
        bet_amount: betAmount,
        bet_type: betType,
      });

      // Let animation run for 650ms for realistic excitement
      setTimeout(async () => {
        clearInterval(rollIntervalRef.current);
        const rollData = response.data.roll;
        setDisplayNumber(String(rollData.roll_result).padStart(5, '0'));
        setLastResult(rollData);
        setRolling(false);

        // INSTANTLY update balance as soon as User wins or loses
        const finalBalance = Number(rollData.balance_after);
        setBalance(finalBalance);
        if (updateUserBalance) {
          updateUserBalance(finalBalance);
        }

        // Sound & celebratory effects
        if (rollData.is_win) {
          playSound('win', soundEnabled);
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
          });
        } else {
          playSound('loss', soundEnabled);
        }

        // Refresh user's balance and roll ledger in background
        refreshUser().catch(() => {});
        loadGameData();
      }, 650);
    } catch (err) {
      clearInterval(rollIntervalRef.current);
      setRolling(false);
      // Restore balance on failure
      const restored = user?.credit_balance ?? balance;
      setBalance(restored);
      if (updateUserBalance) {
        updateUserBalance(restored);
      }
      toast.error(err.message || 'Roll failed. Please try again.');
    }
  };

  const currentBalance = balance;

  return (
    <div
      className="inner-page-offset"
      style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '52px 20px 40px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      {/* 2-Day Promo Special Banner */}
      {promoEligible && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(253, 167, 2, 0.15) 0%, rgba(0, 238, 253, 0.15) 100%)',
            border: '1.5px solid rgba(253, 167, 2, 0.5)',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            boxShadow: '0 0 25px rgba(253, 167, 2, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'var(--lightning-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(253, 167, 2, 0.6)',
              }}
            >
              <Flame size={24} color="#000" />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#fde502', fontSize: '1.05rem' }}>
                ⚡ Multiply Your Credits 100X by playing multiplier game!
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Your account is over 2 days old! Roll the 1–10,000 dice and multiply your credits up to 100X.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                background: 'rgba(0, 238, 253, 0.1)',
                border: '1px solid rgba(0, 238, 253, 0.3)',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '0.8rem',
                color: 'var(--accent)',
                fontWeight: 700,
              }}
            >
              100X Multiplier
            </span>
          </div>
        </div>
      )}

      {/* Main Game Card */}
      <div
        className="glass-card"
        style={{
          padding: '36px 28px',
          textAlign: 'center',
          background: '#090d16',
          border: '1px solid rgba(0, 210, 255, 0.2)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 102, 255, 0.12)',
          borderRadius: '24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top Sound Toggle & Balance Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Dices size={24} color="var(--accent)" />
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
              MULTIPLY CREDITS <span style={{ color: 'var(--accent)' }}>HI-LO</span>
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Balance Indicator */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(253, 203, 110, 0.12)',
                border: '1px solid rgba(253, 203, 110, 0.4)',
                borderRadius: '20px',
                padding: '6px 14px',
                color: '#fdcb6e',
                fontWeight: 800,
                fontSize: '0.9rem',
              }}
            >
              <Coins size={16} />
              <span>{currentBalance}</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>CR</span>
            </div>

            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-glass)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: soundEnabled ? 'var(--accent)' : 'var(--text-sub)',
                cursor: 'pointer',
              }}
              title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
        </div>

        {/* 5-Digit Digital Odometer Roller Display */}
        <div
          style={{
            maxWidth: '440px',
            margin: '0 auto 28px auto',
            background: '#020408',
            border: rolling
              ? '2px solid var(--accent)'
              : lastResult?.is_win
              ? '2px solid #00e699'
              : lastResult
              ? '2px solid #ff5252'
              : '2px solid rgba(0, 210, 255, 0.3)',
            borderRadius: '20px',
            padding: '24px 20px',
            boxShadow: rolling
              ? '0 0 35px rgba(0, 238, 253, 0.4), inset 0 0 20px rgba(0, 238, 253, 0.2)'
              : lastResult?.is_win
              ? '0 0 35px rgba(0, 230, 153, 0.45), inset 0 0 20px rgba(0, 230, 153, 0.2)'
              : lastResult
              ? '0 0 35px rgba(255, 82, 82, 0.45), inset 0 0 20px rgba(255, 82, 82, 0.2)'
              : '0 0 25px rgba(0, 0, 0, 0.8), inset 0 0 15px rgba(0, 210, 255, 0.08)',
            transition: 'all 0.25s ease',
          }}
        >
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: 'clamp(3rem, 7vw, 4.4rem)',
              fontWeight: 900,
              letterSpacing: '8px',
              color: rolling
                ? '#00eefd'
                : lastResult?.is_win
                ? '#00e699'
                : lastResult
                ? '#ff5252'
                : '#f1f5f9',
              textShadow: rolling
                ? '0 0 20px #00eefd'
                : lastResult?.is_win
                ? '0 0 25px #00e699'
                : lastResult
                ? '0 0 25px #ff5252'
                : 'none',
              lineHeight: 1,
            }}
          >
            {displayNumber}
          </div>

          <div
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              marginTop: '12px',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              fontWeight: 600,
            }}
          >
            {rolling
              ? '🎲 ROLLING RANDOM 1 - 10000...'
              : lastResult
              ? lastResult.is_win
                ? `🎉 WIN! ROLLED ${lastResult.roll_result} (${lastResult.target_condition})`
                : lastResult.in_loss_zone
                ? `❌ LOST IN DEAD ZONE (4500 - 5500)`
                : `❌ LOST! ROLLED ${lastResult.roll_result}`
              : 'ROLL NUMBER BETWEEN 1 AND 10,000'}
          </div>
        </div>

        {/* Loss Zone Visual Probability Spectrum */}
        <div style={{ maxWidth: '580px', margin: '0 auto 28px auto' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              marginBottom: '8px',
            }}
          >
            <span style={{ color: '#00d2d3', fontWeight: 700 }}>BET LO: 1 - 4499 (45%)</span>
            <span style={{ color: '#ff7675', fontWeight: 800 }}>⛔ LOSS ZONE: 4500 - 5500 (10%)</span>
            <span style={{ color: '#0066ff', fontWeight: 700 }}>BET HI: 5501 - 10000 (45%)</span>
          </div>

          <div
            style={{
              height: '14px',
              borderRadius: '7px',
              display: 'flex',
              overflow: 'hidden',
              background: '#070b14',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* LO Section: 45% */}
            <div
              style={{
                width: '45%',
                background: 'linear-gradient(90deg, #00d2d3 0%, #00eefd 100%)',
                opacity: 0.85,
              }}
              title="LO Win Zone (1 - 4499)"
            />
            {/* DEAD ZONE: 10% */}
            <div
              style={{
                width: '10%',
                background: 'repeating-linear-gradient(45deg, #ff5252, #ff5252 6px, #2a0000 6px, #2a0000 12px)',
                boxShadow: 'inset 0 0 6px rgba(255, 82, 82, 0.8)',
              }}
              title="Dead Zone: 4500 - 5500 (Always Loss for both HI and LO)"
            />
            {/* HI Section: 45% */}
            <div
              style={{
                width: '45%',
                background: 'linear-gradient(90deg, #0066ff 0%, #54a0ff 100%)',
                opacity: 0.85,
              }}
              title="HI Win Zone (5501 - 10000)"
            />
          </div>
        </div>

        {/* Bet Amount Controls */}
        <div
          style={{
            maxWidth: '520px',
            margin: '0 auto 28px auto',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-glass)',
            borderRadius: '16px',
            padding: '18px 20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
              fontSize: '0.85rem',
            }}
          >
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>BET AMOUNT</span>
            <span style={{ color: '#00e699', fontWeight: 700 }}>
              WIN PROFIT: +{betAmount} CR (2.0X)
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <input
              type="number"
              min={1}
              max={currentBalance || 10000}
              value={betAmount}
              disabled={rolling}
              onChange={(e) => handleBetChange(e.target.value)}
              style={{
                flex: 1,
                background: '#040711',
                border: '1.5px solid var(--border-glass)',
                borderRadius: '10px',
                padding: '10px 14px',
                fontSize: '1.2rem',
                fontWeight: 800,
                color: '#fff',
                textAlign: 'center',
              }}
            />
          </div>

          {/* Quick Bet Adjustment Chips */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '6px',
            }}
          >
            <button
              onClick={() => handleBetChange(1)}
              disabled={rolling}
              className="btn btn-secondary"
              style={{ padding: '6px 0', fontSize: '0.78rem', fontWeight: 700 }}
            >
              MIN
            </button>
            <button
              onClick={() => handleBetChange(Math.max(1, Math.floor(betAmount / 2)))}
              disabled={rolling}
              className="btn btn-secondary"
              style={{ padding: '6px 0', fontSize: '0.78rem', fontWeight: 700 }}
            >
              /2
            </button>
            <button
              onClick={() => handleBetChange(Math.min(currentBalance || 10000, betAmount * 2))}
              disabled={rolling}
              className="btn btn-secondary"
              style={{ padding: '6px 0', fontSize: '0.78rem', fontWeight: 700 }}
            >
              2X
            </button>
            <button
              onClick={() => handleBetChange(betAmount + 5)}
              disabled={rolling}
              className="btn btn-secondary"
              style={{ padding: '6px 0', fontSize: '0.78rem', fontWeight: 700 }}
            >
              +5
            </button>
            <button
              onClick={() => handleBetChange(betAmount + 25)}
              disabled={rolling}
              className="btn btn-secondary"
              style={{ padding: '6px 0', fontSize: '0.78rem', fontWeight: 700 }}
            >
              +25
            </button>
            <button
              onClick={() => handleBetChange(currentBalance || 1)}
              disabled={rolling}
              className="btn btn-secondary"
              style={{ padding: '6px 0', fontSize: '0.78rem', fontWeight: 700, color: '#fde502' }}
            >
              MAX
            </button>
          </div>
        </div>

        {/* Dual Primary Roll Buttons: BET HI & BET LO */}
        <div
          style={{
            maxWidth: '520px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
          }}
        >
          {/* BET LO BUTTON */}
          <button
            onClick={() => handleExecuteRoll('LO')}
            disabled={rolling || currentBalance < betAmount}
            style={{
              background: rolling
                ? 'rgba(0, 210, 211, 0.3)'
                : 'linear-gradient(135deg, #00d2d3 0%, #009999 100%)',
              color: '#fff',
              padding: '16px 12px',
              borderRadius: '16px',
              fontWeight: 800,
              fontSize: '1.05rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 8px 25px rgba(0, 210, 211, 0.35)',
              cursor: rolling || currentBalance < betAmount ? 'not-allowed' : 'pointer',
              opacity: rolling || currentBalance < betAmount ? 0.6 : 1,
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseDown={(e) => !rolling && (e.currentTarget.style.transform = 'scale(0.97)')}
            onMouseUp={(e) => !rolling && (e.currentTarget.style.transform = 'scale(1)')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowDownRight size={20} />
              <span>BET LO</span>
            </div>
            <span style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: 600 }}>
              Roll &lt; 4500 (2.0X)
            </span>
          </button>

          {/* BET HI BUTTON */}
          <button
            onClick={() => handleExecuteRoll('HI')}
            disabled={rolling || currentBalance < betAmount}
            style={{
              background: rolling
                ? 'rgba(0, 102, 255, 0.3)'
                : 'linear-gradient(135deg, #0066ff 0%, #00d2ff 100%)',
              color: '#fff',
              padding: '16px 12px',
              borderRadius: '16px',
              fontWeight: 800,
              fontSize: '1.05rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 8px 25px rgba(0, 102, 255, 0.35)',
              cursor: rolling || currentBalance < betAmount ? 'not-allowed' : 'pointer',
              opacity: rolling || currentBalance < betAmount ? 0.6 : 1,
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseDown={(e) => !rolling && (e.currentTarget.style.transform = 'scale(0.97)')}
            onMouseUp={(e) => !rolling && (e.currentTarget.style.transform = 'scale(1)')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowUpRight size={20} />
              <span>BET HI</span>
            </div>
            <span style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: 600 }}>
              Roll &gt; 5500 (2.0X)
            </span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
          }}
        >
          <div className="glass-card" style={{ padding: '16px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              TOTAL ROLLS
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{stats.total_rolls}</div>
          </div>

          <div className="glass-card" style={{ padding: '16px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              WIN RATE
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent)' }}>
              {stats.win_rate}%
            </div>
          </div>

          <div className="glass-card" style={{ padding: '16px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              WON / LOST
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>
              <span style={{ color: '#00e699' }}>{stats.total_won}</span> /{' '}
              <span style={{ color: '#ff5252' }}>{stats.total_lost}</span>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '16px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              NET PROFIT
            </div>
            <div
              style={{
                fontSize: '1.3rem',
                fontWeight: 800,
                color: stats.net_profit >= 0 ? '#00e699' : '#ff5252',
              }}
            >
              {stats.net_profit >= 0 ? `+${stats.net_profit}` : stats.net_profit} CR
            </div>
          </div>
        </div>
      )}

      {/* Tabs for My Bets / Live Community Bets / Rules */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '16px',
            marginBottom: '20px',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => setActiveTab('my_bets')}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              fontWeight: 700,
              fontSize: '0.88rem',
              background: activeTab === 'my_bets' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <History size={16} /> My Rolls History ({myRolls.length})
          </button>

          <button
            onClick={() => setActiveTab('live_bets')}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              fontWeight: 700,
              fontSize: '0.88rem',
              background: activeTab === 'live_bets' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Users size={16} /> Live Community Stream
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              fontWeight: 700,
              fontSize: '0.88rem',
              background: activeTab === 'rules' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Info size={16} /> Game Rules &amp; Odds
          </button>
        </div>

        {/* Tab 1: My Rolls History */}
        {activeTab === 'my_bets' && (
          <div>
            {myRolls.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                No rolls yet! Choose your bet and roll HI or LO above to multiply credits.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Time</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Bet Type</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Target</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Roll Result</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Bet</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myRolls.map((r) => {
                      const isWin = r.status === 'won';
                      return (
                        <tr
                          key={r.id}
                          style={{
                            borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                            background: isWin ? 'rgba(0, 230, 153, 0.04)' : 'transparent',
                          }}
                        >
                          <td style={{ padding: '10px', color: 'var(--text-sub)' }}>
                            {new Date(r.created_at || r.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            <span
                              style={{
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontWeight: 700,
                                fontSize: '0.78rem',
                                background: r.bet_type === 'HI' ? 'rgba(0, 102, 255, 0.2)' : 'rgba(0, 210, 211, 0.2)',
                                color: r.bet_type === 'HI' ? '#54a0ff' : '#00d2d3',
                              }}
                            >
                              BET {r.bet_type}
                            </span>
                          </td>
                          <td style={{ padding: '10px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            {r.target_condition}
                          </td>
                          <td style={{ padding: '10px', textAlign: 'center', fontWeight: 800 }}>
                            <span
                              style={{
                                color: isWin ? '#00e699' : r.in_loss_zone ? '#ff7675' : '#ff5252',
                              }}
                            >
                              {r.roll_result}
                            </span>
                            {r.in_loss_zone && (
                              <span style={{ fontSize: '0.7rem', color: '#ff7675', marginLeft: '6px' }}>
                                (Dead Zone)
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '10px', textAlign: 'right', fontWeight: 600 }}>
                            {r.bet_amount} CR
                          </td>
                          <td
                            style={{
                              padding: '10px',
                              textAlign: 'right',
                              fontWeight: 800,
                              color: isWin ? '#00e699' : '#ff5252',
                            }}
                          >
                            {isWin ? `+${r.profit}` : r.profit} CR
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Live Community Bets */}
        {activeTab === 'live_bets' && (
          <div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Player</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Bet</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Roll</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Stake</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {liveRolls.map((r) => {
                    const isWin = r.status === 'won';
                    return (
                      <tr
                        key={r.id}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                          background: isWin ? 'rgba(0, 230, 153, 0.04)' : 'transparent',
                        }}
                      >
                        <td style={{ padding: '10px', fontWeight: 600 }}>{r.user_display}</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              background: r.bet_type === 'HI' ? 'rgba(0, 102, 255, 0.2)' : 'rgba(0, 210, 211, 0.2)',
                              color: r.bet_type === 'HI' ? '#54a0ff' : '#00d2d3',
                            }}
                          >
                            {r.bet_type}
                          </span>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center', fontWeight: 800 }}>
                          <span style={{ color: isWin ? '#00e699' : '#ff5252' }}>{r.roll_result}</span>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>{r.bet_amount} CR</td>
                        <td
                          style={{
                            padding: '10px',
                            textAlign: 'right',
                            fontWeight: 800,
                            color: isWin ? '#00e699' : '#ff5252',
                          }}
                        >
                          {isWin ? `+${r.profit}` : r.profit} CR
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Rules & Odds Information */}
        {activeTab === 'rules' && (
          <div style={{ color: 'var(--text-main)', fontSize: '0.92rem', lineHeight: '1.7' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', color: '#fff' }}>
              How the Multiply Credits HI-LO Game Works
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
              Multiply Your Credits 100X by playing multiplier game. Predict whether the roll from 1 to 10,000 lands HI or LO to multiply your earned FAR credits instantly.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(0, 210, 211, 0.08)', border: '1px solid rgba(0, 210, 211, 0.25)', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ color: '#00d2d3', marginBottom: '8px' }}>🔵 BET LO (Under 4500)</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  If you click <strong>BET LO</strong> and roll any integer between <strong>1 and 4499</strong>, you win <strong>2.0X</strong> your bet amount.
                </p>
              </div>

              <div style={{ background: 'rgba(0, 102, 255, 0.08)', border: '1px solid rgba(0, 102, 255, 0.25)', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ color: '#54a0ff', marginBottom: '8px' }}>🟣 BET HI (Over 5500)</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  If you click <strong>BET HI</strong> and roll any integer between <strong>5501 and 10000</strong>, you win <strong>2.0X</strong> your bet amount.
                </p>
              </div>

              <div style={{ background: 'rgba(255, 82, 82, 0.08)', border: '1px solid rgba(255, 82, 82, 0.3)', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ color: '#ff5252', marginBottom: '8px' }}>⛔ The 4500–5500 Dead Zone</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  Any roll from <strong>4500 to 5500</strong> inclusive is the house edge zone. Both BET HI and BET LO lose in this dead zone.
                </p>
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', padding: '14px 18px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontWeight: 700 }}>
                <ShieldAlert size={16} color="var(--accent)" /> Fair Random Number Generation
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Every roll is independently generated server-side on a uniform distribution from 1 to 10000. All results are written to the database ledger for complete auditability.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiplyGame;
