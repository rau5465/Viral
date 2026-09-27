import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Zap,
  ShieldCheck,
  Users,
  Award,
  CheckCircle2,
  Mail,
  Smartphone,
  Globe2,
  Layers,
  HeartHandshake,
} from 'lucide-react';
import { JioLogo, AirtelLogo, ViLogo, BsnlLogo } from '../components/common/OperatorLogos';

const About = () => {
  return (
    <div className="page-container page-header-offset" style={{ maxWidth: '960px', margin: '0 auto', padding: '64px 20px 80px 20px' }}>
      {/* Back button */}
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
          marginBottom: '24px',
          textDecoration: 'none',
          transition: 'color 0.2s',
        }}
      >
        <ArrowLeft size={16} /> Back to Home
      </Link>

      {/* Hero Badge & Header */}
      <div style={{ marginBottom: '32px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(0, 238, 253, 0.1)',
            border: '1px solid rgba(0, 238, 253, 0.3)',
            borderRadius: '30px',
            padding: '6px 16px',
            color: 'var(--accent)',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '14px',
          }}
        >
          <Sparkles size={15} /> Democratizing Digital Connectivity
        </div>
        <h1
          style={{
            fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            marginBottom: '14px',
            letterSpacing: '-0.5px',
          }}
        >
          About <span style={{ color: '#00EEFD', textShadow: '0 0 15px rgba(0,238,253,0.4)' }}>F</span>orget{' '}
          <span style={{ color: '#00EEFD', textShadow: '0 0 15px rgba(0,238,253,0.4)' }}>A</span>bout{' '}
          <span style={{ color: '#00EEFD', textShadow: '0 0 15px rgba(0,238,253,0.4)' }}>R</span>echarge
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.6', maxWidth: '800px' }}>
          We believe high-speed mobile internet and unlimited calling should not be a recurring financial strain.
          FAR empowers smartphone users across India to turn everyday digital actions into 100% free prepaid recharges.
        </p>
      </div>

      {/* Quick Metrics Bar */}
      <div
        className="glass-card"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          padding: '24px',
          marginBottom: '36px',
          textAlign: 'center',
          borderColor: 'rgba(0, 238, 253, 0.25)',
        }}
      >
        <div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)' }}>₹0.00</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Cost to User Forever</div>
        </div>
        <div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#00e699' }}>4 Major</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Operators (Jio, Airtel, Vi, BSNL)</div>
        </div>
        <div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fdcb6e' }}>4X Multiplier</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Viral Referral Growth Engine</div>
        </div>
        <div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#a29bfe' }}>&lt; 60 Sec</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>API Automated Dispatch</div>
        </div>
      </div>

      {/* Main Content Body */}
      <div
        className="glass-card"
        style={{
          padding: '36px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '36px',
          lineHeight: '1.75',
          color: 'var(--text-sub)',
        }}
      >
        {/* Section 1: The Problem & The FAR Vision */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Zap size={22} color="var(--accent)" />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              The Vision Behind FAR
            </h2>
          </div>
          <p>
            In modern India, high-speed mobile connectivity is not a luxury—it is the lifeline for education, remote work,
            commerce, payments, and staying connected with loved ones. Yet, frequent telecom tariff hikes have made 28-day,
            56-day, and 84-day recharge plans an unavoidable monthly tax on students, freelancers, and families.
          </p>
          <p style={{ marginTop: '12px' }}>
            <strong>Forget About Recharge (FAR)</strong> was born out of a simple, ambitious premise: <em>what if brand advertising budgets
            could pay for your phone bill instead of lining digital monopolies?</em> By creating a transparent ecosystem where advertisers
            reward users directly for authenticated attention, FAR turns micro-engagements into genuine prepaid airtime.
          </p>
        </section>

        {/* Section 2: How It Works */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Layers size={22} color="#00e699" />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              The 3-Pillar Value Engine
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.07)',
              }}
            >
              <div style={{ color: 'var(--accent)', fontWeight: 700, marginBottom: '6px' }}>1. Micro-Engagements</div>
              <p style={{ fontSize: '0.88rem', margin: 0, color: 'var(--text-muted)' }}>
                Discover innovative mobile applications, explore partner web platforms, complete short surveys, or subscribe to educational creator channels.
              </p>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.07)',
              }}
            >
              <div style={{ color: '#fdcb6e', fontWeight: 700, marginBottom: '6px' }}>2. 4X Referral Multiplier</div>
              <p style={{ fontSize: '0.88rem', margin: 0, color: 'var(--text-muted)' }}>
                Invite friends and unlock up to 4X bonus credits when your network verifies tasks, allowing your credit balance to compound exponentially.
              </p>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.07)',
              }}
            >
              <div style={{ color: '#00e699', fontWeight: 700, marginBottom: '6px' }}>3. Instant Redemptions</div>
              <p style={{ fontSize: '0.88rem', margin: 0, color: 'var(--text-muted)' }}>
                Select your operator plan (e.g. ₹299, ₹349, ₹859), enter your phone number, and our direct API dispatches your recharge within seconds.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Supported Operators */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Smartphone size={22} color="#fdcb6e" />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              Universal Telecom Coverage Across India
            </h2>
          </div>
          <p style={{ marginBottom: '20px' }}>
            FAR integrates with direct aggregator gateways supporting all major telecommunications providers across all 22 telecom circles in India:
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
            }}
          >
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(10, 61, 230, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <JioLogo size={42} />
              <div>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>Reliance Jio</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>True 5G Unlimited, 1.5GB/day to 3GB/day plans</div>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(237, 27, 36, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <AirtelLogo size={42} />
              <div>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>Bharti Airtel</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Airtel 5G Plus, Truly Unlimited voice packs</div>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(235, 18, 42, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <ViLogo size={42} />
              <div>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>Vodafone Idea (Vi)</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hero Unlimited, Binge All Night, Weekend Rollover</div>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(254, 203, 27, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <BsnlLogo size={42} />
              <div>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>BSNL</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>High-value long validity packs across all zones</div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Our Commitments */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <ShieldCheck size={22} color="var(--accent)" />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              Our Uncompromising Commitments
            </h2>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <CheckCircle2 size={18} color="#00e699" style={{ marginTop: '3px', flexShrink: 0 }} />
              <span>
                <strong style={{ color: '#fff' }}>No Financial Payment Demanded:</strong> We will never ask for your debit/credit card, UPI PIN, or bank OTP. FAR is strictly non-custodial and reward-driven.
              </span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <CheckCircle2 size={18} color="#00e699" style={{ marginTop: '3px', flexShrink: 0 }} />
              <span>
                <strong style={{ color: '#fff' }}>Zero Spam Policy:</strong> We do not sell your phone numbers to telemarketers or third-party call centers. Your details are used solely to fulfill your recharge requests.
              </span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <CheckCircle2 size={18} color="#00e699" style={{ marginTop: '3px', flexShrink: 0 }} />
              <span>
                <strong style={{ color: '#fff' }}>Transparent & Verifiable Fulfillment:</strong> Every recharge transaction generates an operator reference ID that you can cross-verify immediately in your MyJio, Airtel Thanks, or Vi app.
              </span>
            </li>
          </ul>
        </section>

        {/* Section 5: Connect with us */}
        <section
          style={{
            background: 'rgba(0, 238, 253, 0.05)',
            border: '1px solid rgba(0, 238, 253, 0.2)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Mail size={22} color="var(--accent)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              Direct Support &amp; Partnerships
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            Have a question, feedback, operator inquiry, or brand partnership proposal? Our support engineering and partner operations team is always ready to assist.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginTop: '6px' }}>
            <a
              href="mailto:contact@forgetaboutrecharge.com"
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              <Mail size={16} /> contact@forgetaboutrecharge.com
            </a>
            <Link
              to="/contact"
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                textDecoration: 'none',
              }}
            >
              Contact Support Form →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
