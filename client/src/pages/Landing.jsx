import React from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Smartphone,
  Video,
  Eye,
  PlayCircle,
  ThumbsUp,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

const Landing = () => {
  const earningMethods = [
    {
      icon: <Flame size={24} color="#ff7675" />,
      title: 'Refer & Earn',
      reward: '50 - 100 Credits',
      desc: 'Invite friends. Refer 2 in 2 hours to get a 4x bonus multiplier!',
    },
    {
      icon: <PlayCircle size={24} color="#ff0000" />,
      title: 'YouTube Subscriptions',
      reward: '15 - 20 Credits',
      desc: 'Subscribe to verified partner channels and content creators.',
    },
    {
      icon: <Eye size={24} color="#00d2d3" />,
      title: 'Visit Websites',
      reward: '5 - 10 Credits',
      desc: 'Browse partner websites and discover top offers for 30 seconds.',
    },
    {
      icon: <Video size={24} color="#a29bfe" />,
      title: 'Watch Videos',
      reward: '5 - 15 Credits',
      desc: 'Watch short video promos and trailers to accumulate points.',
    },
    {
      icon: <ThumbsUp size={24} color="#54a0ff" />,
      title: 'Social Follows',
      reward: '10 - 15 Credits',
      desc: 'Follow Instagram and Twitter accounts of trending brands.',
    },
    {
      icon: <Smartphone size={24} color="#fdcb6e" />,
      title: 'Free Recharge',
      reward: '100% Free',
      desc: 'Redeem credits instantly for Jio, Airtel, Vi, and BSNL recharges.',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', paddingTop: '20px' }}>
      {/* 1. Hero Section */}
      <section
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '40px 20px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 118, 117, 0.15)',
            border: '1px solid rgba(255, 118, 117, 0.3)',
            borderRadius: '30px',
            padding: '6px 18px',
            color: '#ff7675',
            fontSize: '0.85rem',
            fontWeight: 700,
          }}
        >
          <Flame size={16} /> 🔥 4X VIRAL BONUS: Refer 2 friends in 2 hours for 100 Credits!
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.4rem, 6vw, 4rem)',
            fontWeight: 900,
            maxWidth: '850px',
            letterSpacing: '-1px',
          }}
        >
          Earn Free Mobile Recharges with <span className="text-gradient-viral">ViralRecharge</span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--text-muted)',
            maxWidth: '650px',
            lineHeight: '1.6',
          }}
        >
          Complete fun micro-tasks, invite friends, earn credits in real-time, and get 100% free mobile talktime & data recharges for Jio, Airtel, Vi & BSNL.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
          <Link
            to="/register"
            className="btn btn-primary"
            style={{ padding: '14px 32px', fontSize: '1.1rem', borderRadius: '12px' }}
          >
            Claim 25 Free Signup Credits <ArrowRight size={20} />
          </Link>
          <Link
            to="/login"
            className="btn btn-secondary"
            style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: '12px' }}
          >
            Sign In to Dashboard
          </Link>
        </div>

        {/* Live Ticker Banner */}
        <div
          className="glass-card"
          style={{
            marginTop: '20px',
            padding: '16px 28px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '30px',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            maxWidth: '750px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <TrendingUp size={22} color="#00b894" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>12,450+</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Users Joined Today</div>
            </div>
          </div>
          <div className="ticker-divider" style={{ width: '1px', height: '30px', background: 'var(--border-glass)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Smartphone size={22} color="#00d2d3" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>₹3,20,000+</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Recharges Sent</div>
            </div>
          </div>
          <div className="ticker-divider" style={{ width: '1px', height: '30px', background: 'var(--border-glass)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={22} color="#fdcb6e" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>Instant</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Operator Delivery</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 4x Viral Mechanic Banner */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px', width: '100%' }}>
        <div
          className="glass-card pulse-glow"
          style={{
            background: 'linear-gradient(135deg, rgba(108, 92, 231, 0.2) 0%, rgba(255, 118, 117, 0.2) 100%)',
            border: '1px solid rgba(108, 92, 231, 0.4)',
            borderRadius: '24px',
            padding: '40px 30px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'var(--viral-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 20px rgba(255, 118, 117, 0.5)',
            }}
          >
            <Flame size={34} color="#0d1117" />
          </div>
          <h2 style={{ fontSize: '2rem', maxWidth: '700px' }}>
            The 2-Hour 4X Multiplier Challenge
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', fontSize: '1rem', lineHeight: '1.6' }}>
            When you sign up, you get <strong>25 Free Credits</strong> and a 2-hour timer begins. Invite just <strong>2 friends</strong> before the timer expires, and your signup bonus multiplies by <strong>4x into 100 Credits!</strong>
          </p>
          <Link to="/register" className="btn btn-accent" style={{ padding: '12px 28px', fontSize: '1rem' }}>
            Start Your 2-Hour Challenge Now
          </Link>
        </div>
      </section>

      {/* 3. How It Works (3 Steps) */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>How It Works</h2>
          <p style={{ color: 'var(--text-muted)' }}>Get your mobile recharged in 3 super simple steps</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '30px 24px', textAlign: 'center' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'rgba(108, 92, 231, 0.2)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                fontSize: '1.3rem',
                fontWeight: 800,
              }}
            >
              1
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Sign Up & Grab Bonus</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Create your account in 30 seconds. Instantly receive 25 credits in your wallet.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '30px 24px', textAlign: 'center' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'rgba(0, 210, 211, 0.2)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                fontSize: '1.3rem',
                fontWeight: 800,
              }}
            >
              2
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Complete Tasks & Refer</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Earn credits by visiting sites, watching videos, or sharing your link with friends.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '30px 24px', textAlign: 'center' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'rgba(0, 184, 148, 0.2)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                fontSize: '1.3rem',
                fontWeight: 800,
              }}
            >
              3
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Redeem Free Recharge</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Pick your operator and plan. Recharges are delivered straight to your mobile number.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Ways to Earn */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>Ways to Earn Credits</h2>
          <p style={{ color: 'var(--text-muted)' }}>Multiple daily earning channels to reach your recharge faster</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {earningMethods.map((m, idx) => (
            <div key={idx} className="glass-card interactive" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {m.icon}
                </div>
                <span className="badge badge-gold">{m.reward}</span>
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>{m.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Supported Operators */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px', width: '100%', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.3rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
          Supported Operators Across India
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
          {['Jio 4G/5G', 'Airtel', 'Vi (Vodafone Idea)', 'BSNL Mobile'].map((op, i) => (
            <div
              key={i}
              className="glass-card"
              style={{
                padding: '16px 32px',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Smartphone size={20} color="var(--accent)" />
              {op}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Landing;
