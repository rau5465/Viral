import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Flame,
  Smartphone,
  PlayCircle,
  Eye,
  Video,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  Users,
  Award,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Gift,
  Calculator,
  HelpCircle,
  Star,
  Check,
} from 'lucide-react';
import { OperatorLogo } from '../components/common/OperatorLogos';

const Landing = () => {
  // 1. Live ticker data simulation
  const liveRecharges = [
    { name: 'Rahul M.', location: 'Delhi', op: 'Jio', amount: '₹349', pack: '2GB/day True 5G (28 Days)', time: '2m ago' },
    { name: 'Priya K.', location: 'Mumbai', op: 'Airtel', amount: '₹349', pack: '1.5GB/day (28 Days)', time: '4m ago' },
    { name: 'Ananya S.', location: 'Bangalore', op: '5X Bonus', amount: '350 CR', pack: 'Referral Reward Won', time: '6m ago' },
    { name: 'Vikram P.', location: 'Kolkata', op: 'Vi', amount: '₹409', pack: '2GB/day Hero Unlimited (28 Days)', time: '9m ago' },
    { name: 'Sneha R.', location: 'Pune', op: 'Jio', amount: '₹859', pack: '2GB/day True 5G (84 Days)', time: '12m ago' },
    { name: 'Amit G.', location: 'Hyderabad', op: 'BSNL', amount: '₹397', pack: '2GB/day (150 Days Validity)', time: '15m ago' },
  ];

  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % liveRecharges.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [liveRecharges.length]);

  // 2. Savings Calculator State (Current Real Indian Telecom Rates >= 300)
  const [calcOperator, setCalcOperator] = useState('Jio');
  const [calcPlan, setCalcPlan] = useState('monthly'); // 'monthly', 'quarterly', 'annual'

  const planRates = {
    Jio: { monthly: 349, quarterly: 859, annual: 3599 },
    Airtel: { monthly: 349, quarterly: 859, annual: 3599 },
    Vi: { monthly: 349, quarterly: 859, annual: 3199 },
    BSNL: { monthly: 397, quarterly: 599, annual: 1999 },
  };

  const currentPlanCost = planRates[calcOperator][calcPlan];
  const yearlySavings =
    calcPlan === 'annual'
      ? currentPlanCost
      : calcPlan === 'quarterly'
      ? currentPlanCost * 4
      : currentPlanCost * 12;

  // 3. Genuine Indian Telecom Operator Plan Preview Tabs (Strictly >= ₹300 Plans)
  const [selectedOpTab, setSelectedOpTab] = useState('Jio');

  const operatorPacks = {
    Jio: [
      { name: '2GB/Day True 5G Unlimited Plan', credits: 349, validity: '28 Days', tag: '⚡ Top 5G Choice' },
      { name: '2.5GB/Day True 5G Super Pack', credits: 399, validity: '28 Days', tag: 'High Speed' },
      { name: '3GB/Day True 5G + OTT Subscription', credits: 449, validity: '28 Days', tag: '🔥 Entertainment' },
      { name: '1.5GB/Day All-India Long Term', credits: 799, validity: '84 Days', tag: 'Long Term' },
      { name: '2GB/Day True 5G Mega Saver', credits: 859, validity: '84 Days', tag: '⚡ Best Value' },
      { name: '2.5GB/Day Unlimited 365 Days Hero', credits: 3599, validity: '365 Days', tag: '👑 Annual Pack' },
    ],
    Airtel: [
      { name: '1.5GB/Day + Unlimited 5G + Thanks', credits: 349, validity: '28 Days', tag: '🔥 Most Popular' },
      { name: '2GB/Day Unlimited 5G + Wynk Music', credits: 379, validity: '28 Days', tag: 'Daily Saver' },
      { name: '2.5GB/Day Unlimited 5G + OTT', credits: 409, validity: '28 Days', tag: 'Entertainment' },
      { name: '3GB/Day Unlimited 5G Power Pack', credits: 549, validity: '56 Days', tag: 'Extended 5G' },
      { name: '1.5GB/Day All India 84 Days', credits: 859, validity: '84 Days', tag: '⚡ Best Value' },
      { name: '2GB/Day True 5G + Xstream Play', credits: 979, validity: '84 Days', tag: 'Mega Saver' },
    ],
    Vi: [
      { name: '1.5GB/Day + Binge All Night (12-6 AM)', credits: 349, validity: '28 Days', tag: '🔥 Hero Unlimited' },
      { name: '2GB/Day + Weekend Rollover + Data Delight', credits: 409, validity: '28 Days', tag: 'Power Pack' },
      { name: '2.5GB/Day + Binge All Night + OTT', credits: 479, validity: '28 Days', tag: 'Streaming Pack' },
      { name: '1.5GB/Day + Hero Unlimited 56 Days', credits: 539, validity: '56 Days', tag: 'Extended Value' },
      { name: '1.5GB/Day + Hero Unlimited 84 Days', credits: 859, validity: '84 Days', tag: '⚡ Best Value' },
      { name: '2GB/Day + Binge All Night 84 Days', credits: 979, validity: '84 Days', tag: 'Mega Saver' },
    ],
    BSNL: [
      { name: '2GB/Day (30D) + 150 Days Validity', credits: 397, validity: '150 Days', tag: 'Long Validity' },
      { name: '2GB/Day Unlimited Voice & SMS', credits: 485, validity: '82 Days', tag: '🔥 Super Saver' },
      { name: '3GB/Day + Unlimited Voice 84 Days', credits: 599, validity: '84 Days', tag: '⚡ Best Value' },
      { name: '2GB/Day Unlimited 160 Days Pack', credits: 997, validity: '160 Days', tag: 'Extended Pack' },
      { name: '2GB/Day All-India 365 Days', credits: 1999, validity: '365 Days', tag: 'Annual Plan' },
      { name: '3GB/Day Ultimate 395 Days Pack', credits: 2399, validity: '395 Days', tag: '👑 King of Validity' },
    ],
  };

  // 4. Earning channels
  const earningMethods = [
    {
      icon: <Flame size={26} color="#fda702" />,
      title: 'Up to 5X Viral Referrals',
      reward: 'Up to 5X Rewards',
      desc: 'Get Up to 5x Rewards On Refer if you share app in next two hours! Single refer unlocks massive bonus credits.',
      badgeClass: 'badge-gold',
    },
    {
      icon: <PlayCircle size={26} color="#ff3b30" />,
      title: 'YouTube Subscriptions',
      reward: '15 - 25 Credits',
      desc: 'Subscribe to verified YouTube creator channels. Verified automatically with Google API.',
      badgeClass: 'badge-cyan',
    },
    {
      icon: <Eye size={26} color="#00eefd" />,
      title: '30s Web Discovery',
      reward: '5 - 15 Credits',
      desc: 'Discover exciting partner offers, new products, and sponsored content for 30 seconds.',
      badgeClass: 'badge-blue',
    },
    {
      icon: <Video size={26} color="#38bdf8" />,
      title: 'Watch Video Promos',
      reward: '10 - 20 Credits',
      desc: 'Watch quick 30-second trailers and video advertisements to accumulate instant credits.',
      badgeClass: 'badge-cyan',
    },
    {
      icon: <Award size={26} color="#00e699" />,
      title: 'Daily Streak Bonuses',
      reward: '5 - 50 Credits',
      desc: 'Log in daily to claim escalating streak bonuses and unlock exclusive VIP multiplier perks.',
      badgeClass: 'badge-success',
    },
    {
      icon: <Smartphone size={26} color="#fda702" />,
      title: '100% Free Recharges',
      reward: 'Instant SMS',
      desc: 'Convert 1 Credit = ₹1 Recharge. Directly sent to your phone with zero hidden fees.',
      badgeClass: 'badge-gold',
    },
  ];

  // 5. FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      q: 'Is FAR really 100% free? How does it work?',
      a: 'Yes, 100% free! Major brands and YouTube creators partner with FAR to gain authentic views, subscriptions, and engagement. They pay FAR for your real attention, and we return the majority of those earnings directly to you as genuine mobile talktime and data recharges.',
    },
    {
      q: 'How does the 2-Hour Referral Multiplier Challenge work?',
      a: 'When you create an account, you receive 25 Free Welcome Credits instantly, and a 2-hour countdown starts on your dashboard. Get Up to 5x Rewards On Refer if you share app in next two hours — a single refer unlocks massive bonus rewards immediately!',
    },
    {
      q: 'How quickly is the recharge delivered to my phone?',
      a: 'Recharges are automated via high-speed telecom APIs. Once you click Redeem, the request is processed and you will receive an official confirmation SMS from Jio, Airtel, Vi, or BSNL typically within 30 to 60 seconds.',
    },
    {
      q: 'Which mobile telecom operators and states are supported?',
      a: 'FAR supports all major Indian operators — Jio, Airtel, Vodafone Idea (Vi), and BSNL Mobile across all 22 telecom circles in India (Prepaid mobile plans).',
    },
    {
      q: 'Can I recharge for a family member or friend?',
      a: 'Yes! When redeeming credits, you can enter any valid 10-digit Indian mobile number, select the appropriate operator, and the recharge will be credited to that phone number directly.',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', paddingTop: '10px', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      {/* =========================================================================
          1. HERO SECTION
          ========================================================================= */}
      <section
        className="hero-section"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '50px 20px 0 20px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div className="hero-grid">
          {/* Left Column (65% Width): Headline & Action */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0, maxWidth: '100%' }}>
            {/* Brand Eyebrow Badge: Forget About Recharge with standout F, A, R characters */}
            <div className="hero-eyebrow-badge">
              <Zap size={20} color="#fde502" style={{ filter: 'drop-shadow(0 0 10px #fde502)', flexShrink: 0 }} />
              <div className="hero-eyebrow-text">
                <span>
                  <strong
                    style={{
                      fontSize: '1.45em',
                      fontWeight: 900,
                      color: '#fde502',
                      textShadow: '0 0 12px #fda702, 0 0 24px rgba(253, 167, 2, 0.85)',
                      display: 'inline-block',
                      marginRight: '1px',
                    }}
                  >
                    F
                  </strong>
                  <span style={{ color: '#00eefd', textShadow: '0 0 10px rgba(0, 238, 253, 0.6)' }}>orget</span>
                </span>
                <span>
                  <strong
                    style={{
                      fontSize: '1.45em',
                      fontWeight: 900,
                      color: '#fde502',
                      textShadow: '0 0 12px #fda702, 0 0 24px rgba(253, 167, 2, 0.85)',
                      display: 'inline-block',
                      marginRight: '1px',
                    }}
                  >
                    A
                  </strong>
                  <span style={{ color: '#00eefd', textShadow: '0 0 10px rgba(0, 238, 253, 0.6)' }}>bout</span>
                </span>
                <span>
                  <strong
                    style={{
                      fontSize: '1.45em',
                      fontWeight: 900,
                      color: '#fde502',
                      textShadow: '0 0 12px #fda702, 0 0 24px rgba(253, 167, 2, 0.85)',
                      display: 'inline-block',
                      marginRight: '1px',
                    }}
                  >
                    R
                  </strong>
                  <span style={{ color: '#00eefd', textShadow: '0 0 10px rgba(0, 238, 253, 0.6)' }}>echarge</span>
                </span>
              </div>
            </div>

            {/* Headline */}
            <div>
              <h1
                style={{
                  fontSize: 'clamp(1.75rem, 3.2vw, 2.5rem)',
                  fontWeight: 800,
                  lineHeight: '1.25',
                  letterSpacing: '-0.5px',
                  marginBottom: '12px',
                }}
              >
                Never Pay For Mobile Recharges Again.{' '}
                <span className="text-gradient">100% Free Forever.</span>
              </h1>

              <p
                style={{
                  fontSize: 'clamp(0.92rem, 1.2vw, 1.02rem)',
                  color: 'var(--text-muted)',
                  lineHeight: '1.6',
                  maxWidth: '620px',
                }}
              >
                Complete fun micro-tasks, subscribe to verified YouTube channels, and invite friends for up to 5X rewards. Redeem 100% free high-speed 5G data &amp; talktime for <strong>Jio, Airtel, Vi, and BSNL</strong>.
              </p>
            </div>

            {/* CTAs */}
            <div className="hero-cta-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', width: '100%', maxWidth: '100%' }}>
              <Link
                to="/register"
                className="btn btn-lightning pulse-lightning hero-cta-btn"
                style={{
                  borderRadius: '12px',
                }}
              >
                <Zap size={20} fill="#070b14" style={{ flexShrink: 0 }} />
                <span>Claim 25 Free Welcome Credits</span>
                <ArrowRight size={18} style={{ flexShrink: 0 }} />
              </Link>

              <a
                href="#how-it-works"
                className="btn btn-secondary hero-cta-btn"
                style={{
                  borderRadius: '12px',
                }}
              >
                See How It Works
              </a>
            </div>

            {/* Micro Trust Points */}
            <div
              className="hero-trust-points"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px 18px',
                paddingTop: '8px',
                color: 'var(--text-sub)',
                fontSize: '0.85rem',
                maxWidth: '100%',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} color="#00e699" style={{ flexShrink: 0 }} />
                <span>100% Free Forever</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} color="#00e699" style={{ flexShrink: 0 }} />
                <span>No Bank Details Needed</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} color="#00e699" style={{ flexShrink: 0 }} />
                <span>Instant Operator Delivery</span>
              </div>
            </div>

            {/* Supported Networks Trust Strip with Operator Logos */}
            <div
              className="hero-telecom-strip"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'wrap',
                paddingTop: '6px',
                maxWidth: '100%',
              }}
            >
              <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)', fontWeight: 600 }}>
                Supported Telecoms:
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {['Jio', 'Airtel', 'Vi', 'BSNL'].map((op) => (
                  <div
                    key={op}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '20px',
                      padding: '4px 10px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#fff',
                    }}
                  >
                    <OperatorLogo operator={op} size={18} />
                    <span>{op}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Phone Showcase with Real-Time Mockup */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div
              className="float-phone"
              style={{
                width: '100%',
                maxWidth: '310px',
                background: 'linear-gradient(180deg, #091224 0%, #050a14 100%)',
                borderRadius: '34px',
                border: '2px solid rgba(0, 210, 255, 0.4)',
                boxShadow:
                  '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 35px rgba(0, 210, 255, 0.25), inset 0 0 20px rgba(0, 210, 255, 0.1)',
                padding: '16px 14px',
                position: 'relative',
              }}
            >
              {/* Phone Speaker Notch */}
              <div
                style={{
                  width: '90px',
                  height: '18px',
                  background: '#020610',
                  borderRadius: '0 0 12px 12px',
                  margin: '-18px auto 14px auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <div style={{ width: '40px', height: '4px', background: '#1e293b', borderRadius: '4px' }} />
                <div style={{ width: '6px', height: '6px', background: '#00eefd', borderRadius: '50%' }} />
              </div>

              {/* In-Phone Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '12px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  marginBottom: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <img src="/favicon.png" alt="FAR" style={{ width: '22px', height: '22px', borderRadius: '6px' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>FAR Wallet</span>
                </div>
                <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                  ● Live Active
                </span>
              </div>

              {/* Wallet Balance Card */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.25) 0%, rgba(0, 238, 253, 0.15) 100%)',
                  border: '1px solid rgba(0, 238, 253, 0.35)',
                  borderRadius: '18px',
                  padding: '14px 16px',
                  marginBottom: '14px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '2px' }}>
                  Available Balance
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '1.9rem',
                      fontWeight: 900,
                      color: '#fff',
                      letterSpacing: '-0.5px',
                    }}
                  >
                    349
                  </span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fda702' }}>CREDITS</span>
                  <span style={{ fontSize: '0.75rem', color: '#00e699', marginLeft: 'auto', fontWeight: 700 }}>
                    = ₹349 FREE
                  </span>
                </div>
              </div>

              {/* Simulated Live Operator Recharge Notification */}
              <div
                style={{
                  background: 'rgba(0, 230, 153, 0.12)',
                  border: '1px solid rgba(0, 230, 153, 0.35)',
                  borderRadius: '14px',
                  padding: '12px 14px',
                  marginBottom: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: '#00e699',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check size={14} color="#070b14" strokeWidth={3} />
                  </div>
                  <OperatorLogo operator="Jio" size={18} />
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fff' }}>
                    Recharge Successful!
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  <strong>Jio ₹349 Unlimited True 5G 28 Days (2GB/day)</strong> delivered to +91 98765*****
                </div>
              </div>

              {/* Micro Tasks Inside Phone */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Today&apos;s Quick Earn Tasks:
                </div>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PlayCircle size={16} color="#ff3b30" />
                    <span style={{ fontSize: '0.78rem', color: '#fff' }}>YouTube Partner Sub</span>
                  </div>
                  <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                    +20 CR
                  </span>
                </div>

                <div
                  style={{
                    background: 'rgba(253, 167, 2, 0.08)',
                    border: '1px solid rgba(253, 167, 2, 0.25)',
                    borderRadius: '10px',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Flame size={16} color="#fda702" />
                    <span style={{ fontSize: '0.78rem', color: '#fff' }}>Single Refer (Up to 5X)</span>
                  </div>
                  <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                    +100 CR
                  </span>
                </div>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Eye size={16} color="#00eefd" />
                    <span style={{ fontSize: '0.78rem', color: '#fff' }}>Visit Sponsored Site</span>
                  </div>
                  <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>
                    +10 CR
                  </span>
                </div>
              </div>

              {/* Instant Redeem Button in phone */}
              <Link
                to="/register"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  marginTop: '14px',
                  padding: '10px 0',
                  fontSize: '0.85rem',
                  borderRadius: '12px',
                }}
              >
                Claim Free Recharge Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. LIVE ACTIVITY & REAL-TIME TRUST TICKER
          ========================================================================= */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', width: '100%' }}>
        <div
          className="glass-card"
          style={{
            padding: '16px 24px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            border: '1px solid rgba(0, 210, 255, 0.2)',
          }}
        >
          {/* Live Recent Feed */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: '1 1 260px' }}>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#00e699',
                boxShadow: '0 0 10px #00e699',
              }}
            />
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
              <span style={{ color: '#00eefd', fontWeight: 800 }}>LIVE ACTIVITY:</span>{' '}
              <strong style={{ color: '#fff' }}>{liveRecharges[tickerIndex].name}</strong> from{' '}
              {liveRecharges[tickerIndex].location} redeemed{' '}
              <span style={{ color: '#fda702', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <OperatorLogo operator={liveRecharges[tickerIndex].op} size={16} />
                {liveRecharges[tickerIndex].op} {liveRecharges[tickerIndex].amount}
              </span>{' '}
              ({liveRecharges[tickerIndex].time})
            </div>
          </div>

          {/* Aggregate Proof Metrics */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="#00eefd" />
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>185,000+</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>Active Users</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="#fda702" />
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>₹4.2 Million+</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>Recharges Sent</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="#00e699" />
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>99.8%</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>Delivery Success</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. THE 2-HOUR UP TO 5X REFERRAL CHALLENGE (VIRAL ENGINE)
          ========================================================================= */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px', width: '100%' }}>
        <div
          className="glass-card pulse-lightning"
          style={{
            background:
              'linear-gradient(135deg, rgba(1, 24, 70, 0.6) 0%, rgba(253, 167, 2, 0.12) 100%)',
            border: '1px solid rgba(253, 167, 2, 0.5)',
            borderRadius: '24px',
            padding: '40px 32px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '18px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'var(--lightning-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 25px rgba(253, 167, 2, 0.5)',
            }}
          >
            <Flame size={36} color="#070b14" />
          </div>

          <div className="badge badge-gold" style={{ fontSize: '0.85rem', padding: '6px 16px' }}>
            ⚡ Exclusive New User Reward
          </div>

          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', maxWidth: '750px' }}>
            Get Up to 5x Rewards On Refer
          </h2>

          <p
            style={{
              color: 'var(--text-muted)',
              maxWidth: '680px',
              fontSize: '1.02rem',
              lineHeight: '1.7',
            }}
          >
            Sign up today and get <strong>25 Free Credits</strong> instantly in your wallet. A 2-hour timer begins immediately. Get Up to 5x Rewards On Refer if you share app in next two hours — just <strong>1 single refer</strong> unlocks massive bonus credits!
          </p>

          {/* Interactive Visual Progress Bar Demo */}
          <div
            style={{
              background: 'rgba(7, 11, 20, 0.8)',
              border: '1px solid rgba(253, 167, 2, 0.3)',
              borderRadius: '16px',
              padding: '16px 24px',
              width: '100%',
              maxWidth: '520px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
                fontSize: '0.85rem',
              }}
            >
              <span style={{ color: '#fff', fontWeight: 700 }}>
                Challenge Progress: <span style={{ color: '#fda702' }}>Single Refer to Unlock</span>
              </span>
              <span style={{ color: '#00eefd', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} /> 1h 42m left
              </span>
            </div>

            <div
              style={{
                width: '100%',
                height: '10px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: '50%',
                  height: '100%',
                  background: 'var(--lightning-gradient)',
                  boxShadow: '0 0 12px rgba(253, 167, 2, 0.8)',
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '8px',
                fontSize: '0.75rem',
                color: 'var(--text-sub)',
              }}
            >
              <span>Started: 25 CR</span>
              <span style={{ color: '#00e699', fontWeight: 700 }}>Target: Unlock Up to 5X Rewards</span>
            </div>
          </div>

          <Link
            to="/register"
            className="btn btn-lightning"
            style={{
              padding: '14px 34px',
              fontSize: '1.05rem',
              borderRadius: '12px',
              marginTop: '8px',
            }}
          >
            Start Your 2-Hour Challenge Now
          </Link>
        </div>
      </section>

      {/* =========================================================================
          4. INTERACTIVE RECHARGE SAVINGS CALCULATOR
          ========================================================================= */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="badge badge-cyan" style={{ marginBottom: '10px' }}>
            <Calculator size={14} /> Real Money Savings
          </div>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '10px' }}>
            How Much Money Will You Save on Recharges?
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            Select your mobile operator and your normal recharge cycle to calculate your yearly pocket savings.
          </p>
        </div>

        <div
          className="glass-card"
          style={{
            padding: '36px 30px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '36px',
            alignItems: 'center',
            border: '1px solid rgba(0, 210, 255, 0.25)',
          }}
        >
          {/* Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* Operator Selection */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>
                1. Select Your Telecom Operator:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {['Jio', 'Airtel', 'Vi', 'BSNL'].map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => setCalcOperator(op)}
                    style={{
                      padding: '10px 6px',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      background: calcOperator === op ? 'var(--primary-gradient)' : 'rgba(255, 255, 255, 0.05)',
                      color: calcOperator === op ? '#fff' : 'var(--text-muted)',
                      border: calcOperator === op ? '1px solid #00eefd' : '1px solid var(--border-glass)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: calcOperator === op ? 'var(--shadow-glow)' : 'none',
                    }}
                  >
                    <OperatorLogo operator={op} size={22} />
                    <span>{op}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Plan Type Selection */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>
                2. Choose Your Recharge Habit:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setCalcPlan('monthly')}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    textAlign: 'left',
                    background: calcPlan === 'monthly' ? 'rgba(0, 102, 255, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: calcPlan === 'monthly' ? '1px solid #00eefd' : '1px solid var(--border-glass)',
                    color: '#fff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>Monthly Unlimited Pack</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>1.5GB/day + Unlimited Calls for 28 Days</div>
                  </div>
                  <span style={{ fontWeight: 800, color: '#00eefd' }}>₹{planRates[calcOperator].monthly}/mo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCalcPlan('quarterly')}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    textAlign: 'left',
                    background: calcPlan === 'quarterly' ? 'rgba(0, 102, 255, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: calcPlan === 'quarterly' ? '1px solid #00eefd' : '1px solid var(--border-glass)',
                    color: '#fff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>84-Day Long Term Pack</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>2GB/day + 100 SMS/day for 3 Months</div>
                  </div>
                  <span style={{ fontWeight: 800, color: '#00eefd' }}>₹{planRates[calcOperator].quarterly}/pack</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCalcPlan('annual')}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    textAlign: 'left',
                    background: calcPlan === 'annual' ? 'rgba(0, 102, 255, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: calcPlan === 'annual' ? '1px solid #00eefd' : '1px solid var(--border-glass)',
                    color: '#fff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>Annual 365-Day Hero Pack</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>2.5GB/day + 365 Days Unlimited Calls</div>
                  </div>
                  <span style={{ fontWeight: 800, color: '#00eefd' }}>₹{planRates[calcOperator].annual}/yr</span>
                </button>
              </div>
            </div>
          </div>

          {/* Result Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.15) 0%, rgba(253, 167, 2, 0.15) 100%)',
              border: '2px solid rgba(0, 238, 253, 0.4)',
              borderRadius: '20px',
              padding: '32px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>
              Your Projected Yearly Savings on {calcOperator}:
            </div>

            <div
              style={{
                fontSize: 'clamp(2.4rem, 6vw, 3.5rem)',
                fontWeight: 900,
                color: '#fff',
                letterSpacing: '-1px',
                lineHeight: 1,
              }}
            >
              ₹{yearlySavings.toLocaleString('en-IN')}
            </div>

            <div className="badge badge-success" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
              ✓ 100% Retained in Your Bank Account
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.6' }}>
              Just ~5 to 10 minutes of quick daily micro-tasks or a couple of friend invites on FAR completely covers your entire mobile bill.
            </p>

            <Link
              to="/register"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px 0',
                fontSize: '1rem',
                borderRadius: '12px',
                marginTop: '6px',
              }}
            >
              Start Saving ₹{yearlySavings.toLocaleString('en-IN')} Today
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. BROWSE REAL AVAILABLE RECHARGE PACKS
          ========================================================================= */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="badge badge-gold" style={{ marginBottom: '10px' }}>
            <Smartphone size={14} /> Genuine Indian Telecom Plans
          </div>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '10px' }}>
            Popular Recharge Packs You Can Unlock
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            1 Credit = ₹1 Real Value. Pick your favorite operator below to explore redeemable packs.
          </p>
        </div>

        {/* Operator Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
          {['Jio', 'Airtel', 'Vi', 'BSNL'].map((op) => (
            <button
              key={op}
              type="button"
              onClick={() => setSelectedOpTab(op)}
              style={{
                padding: '10px 24px',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '0.95rem',
                background: selectedOpTab === op ? 'var(--primary-gradient)' : 'rgba(255, 255, 255, 0.05)',
                color: selectedOpTab === op ? '#fff' : 'var(--text-muted)',
                border: selectedOpTab === op ? '1px solid #00eefd' : '1px solid var(--border-glass)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: selectedOpTab === op ? 'var(--shadow-glow)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              <OperatorLogo operator={op} size={24} />
              {op} Plans
            </button>
          ))}
        </div>

        {/* Pack Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {operatorPacks[selectedOpTab].map((p, idx) => (
            <div
              key={idx}
              className="glass-card interactive"
              style={{
                padding: '24px 20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <OperatorLogo operator={selectedOpTab} size={22} />
                    <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>
                      {p.tag}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 600 }}>
                    {p.validity}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.05rem', marginBottom: '8px', lineHeight: '1.3' }}>
                  {p.name}
                </h3>
              </div>

              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-glass)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fda702' }}>
                      {p.credits}
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>CREDITS</span>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: '#00e699', fontWeight: 700 }}>
                    100% Free
                  </span>
                </div>

                <Link
                  to="/register"
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    padding: '8px 0',
                    fontSize: '0.85rem',
                    borderRadius: '8px',
                  }}
                >
                  Redeem Plan
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          6. HOW IT WORKS (THE 3-STEP LIGHTNING FLOW)
          ========================================================================= */}
      <section id="how-it-works" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="badge badge-cyan" style={{ marginBottom: '10px' }}>
            <Sparkles size={14} /> Fast &amp; Effortless
          </div>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '10px' }}>How FAR Works</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '550px', margin: '0 auto' }}>
            From sign up to receiving your operator recharge SMS in 3 simple steps.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {/* Step 1 */}
          <div className="glass-card" style={{ padding: '32px 24px', textAlign: 'center', position: 'relative' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                background: 'rgba(0, 102, 255, 0.2)',
                border: '1px solid rgba(0, 210, 255, 0.4)',
                color: '#00eefd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px auto',
                fontSize: '1.4rem',
                fontWeight: 900,
              }}
            >
              1
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Sign Up &amp; Grab 25 CR</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Create your account in under 30 seconds. 25 Welcome Credits are credited immediately to your wallet.
            </p>
          </div>

          {/* Step 2 */}
          <div className="glass-card" style={{ padding: '32px 24px', textAlign: 'center', position: 'relative' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                background: 'rgba(253, 167, 2, 0.2)',
                border: '1px solid rgba(253, 167, 2, 0.4)',
                color: '#fda702',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px auto',
                fontSize: '1.4rem',
                fontWeight: 900,
              }}
            >
              2
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Complete Tasks &amp; Share App</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Subscribe to YouTube partner channels, watch 30s videos, or share the app in your first 2 hours to unlock up to 5X rewards!
            </p>
          </div>

          {/* Step 3 */}
          <div className="glass-card" style={{ padding: '32px 24px', textAlign: 'center', position: 'relative' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                background: 'rgba(0, 230, 153, 0.2)',
                border: '1px solid rgba(0, 230, 153, 0.4)',
                color: '#00e699',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px auto',
                fontSize: '1.4rem',
                fontWeight: 900,
              }}
            >
              3
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Instant Mobile Recharge</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Select Jio, Airtel, Vi, or BSNL. Your free recharge is dispatched to your phone number in seconds.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '14px' }}>
              {['Jio', 'Airtel', 'Vi', 'BSNL'].map((op) => (
                <OperatorLogo key={op} operator={op} size={24} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. WAYS TO EARN CREDITS (FEATURE GRID)
          ========================================================================= */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div className="badge badge-gold" style={{ marginBottom: '10px' }}>
            <Gift size={14} /> Multiple Daily Channels
          </div>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '10px' }}>Ways to Earn Credits Daily</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            You control how fast you earn. Complete a couple of quick tasks each morning and never worry about mobile bills again.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '20px' }}>
          {earningMethods.map((m, idx) => (
            <div
              key={idx}
              className="glass-card interactive"
              style={{ padding: '26px 22px', display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-glass)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {m.icon}
                </div>
                <span className={`badge ${m.badgeClass}`}>{m.reward}</span>
              </div>
              <h3 style={{ fontSize: '1.15rem' }}>{m.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6' }}>{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          8. TESTIMONIALS & SOCIAL PROOF
          ========================================================================= */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div className="badge badge-cyan" style={{ marginBottom: '10px' }}>
            <Star size={14} fill="#fda702" color="#fda702" /> Verified Indian Users
          </div>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '10px' }}>Loved by Thousands Across India</h2>
          <p style={{ color: 'var(--text-muted)' }}>Real students, freelancers, and families who forgot about recharge bills</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '20px' }}>
          {[
            {
              quote:
                'I am a college student and honestly haven’t spent money on my Jio 5G plan since using FAR. Doing 2 micro-tasks a day completely covers my ₹349 monthly pack!',
              name: 'Karan Sharma',
              role: 'Engineering Student, Delhi',
              operator: 'Jio 5G',
            },
            {
              quote:
                'The 2-Hour referral challenge was super exciting. I shared my invite link in our college WhatsApp group, a friend joined, and boom — unlocked massive bonus credits!',
              name: 'Divya Nair',
              role: 'Graphic Designer, Bangalore',
              operator: 'Airtel',
            },
            {
              quote:
                'Recharge came through via official Vi SMS within 45 seconds of clicking redeem. Zero ads scam, zero fake points. 1 credit really equals 1 rupee!',
              name: 'Rohan Deshmukh',
              role: 'Freelancer, Pune',
              operator: 'Vodafone Idea',
            },
          ].map((t, i) => (
            <div
              key={i}
              className="glass-card"
              style={{
                padding: '28px 22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}>
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} size={16} fill="#fda702" color="#fda702" />
                  ))}
                </div>
                <p style={{ color: 'var(--text-main)', fontSize: '0.92rem', lineHeight: '1.65', marginBottom: '20px' }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-glass)', paddingTop: '14px' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff' }}>{t.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>{t.role}</div>
                </div>
                <span className="badge badge-blue">{t.operator}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          9. FREQUENTLY ASKED QUESTIONS (ACCORDION)
          ========================================================================= */}
      <section style={{ maxWidth: '850px', margin: '0 auto', padding: '0 20px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div className="badge badge-gold" style={{ marginBottom: '10px' }}>
            <HelpCircle size={14} /> Clear Answers
          </div>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '10px' }}>Frequently Asked Questions</h2>
          <p style={{ color: 'var(--text-muted)' }}>Everything you need to know about earning free recharges on FAR</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="glass-card"
                style={{
                  borderRadius: '14px',
                  overflow: 'hidden',
                  border: isOpen ? '1px solid rgba(0, 210, 255, 0.4)' : '1px solid var(--border-glass)',
                  transition: 'all 0.2s',
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  style={{
                    width: '100%',
                    padding: '18px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '14px',
                    background: 'transparent',
                    color: '#fff',
                    textAlign: 'left',
                    fontWeight: 700,
                    fontSize: '1rem',
                  }}
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={20} color="#00eefd" /> : <ChevronDown size={20} color="var(--text-sub)" />}
                </button>
                {isOpen && (
                  <div
                    style={{
                      padding: '0 20px 20px 20px',
                      color: 'var(--text-muted)',
                      fontSize: '0.92rem',
                      lineHeight: '1.7',
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          10. FINAL HIGH-VOLTAGE CALL-TO-ACTION BANNER
          ========================================================================= */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px 40px 20px', width: '100%' }}>
        <div
          className="glass-card"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.25) 0%, rgba(1, 24, 70, 0.8) 100%)',
            border: '2px solid rgba(0, 210, 255, 0.4)',
            borderRadius: '28px',
            padding: '48px 32px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 102, 255, 0.3)',
          }}
        >
          <img
            src="/far-logo-md.png"
            alt="FAR"
            style={{
              height: '52px',
              width: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 14px rgba(0, 210, 255, 0.4))',
            }}
          />

          <h2 style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', maxWidth: '750px', lineHeight: 1.2 }}>
            Ready to <span className="text-gradient">Forget About Recharge?</span>
          </h2>

          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', fontSize: '1.05rem', lineHeight: '1.65' }}>
            Join 185,000+ Indians who never spend their hard-earned money on mobile talktime or data packs again. Claim your 25 free credits right now.
          </p>

          <Link
            to="/register"
            className="btn btn-lightning pulse-lightning"
            style={{
              padding: '16px 36px',
              fontSize: '1.1rem',
              borderRadius: '14px',
            }}
          >
            <Zap size={22} fill="#070b14" />
            Claim Your 25 Free Welcome Credits Now
            <ArrowRight size={20} />
          </Link>

          {/* Partner Callout */}
          <div
            style={{
              marginTop: '12px',
              paddingTop: '18px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              fontSize: '0.9rem',
              color: 'var(--text-sub)',
            }}
          >
            <span>Are you a YouTuber, Website Owner, or App Developer?</span>
            <Link
              to="/advertisers"
              style={{
                color: 'var(--accent)',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'none',
              }}
            >
              📢 Advertise &amp; Sponsor on FAR — Reach 100% Real Users →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
