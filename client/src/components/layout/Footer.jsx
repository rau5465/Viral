import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Heart, Shield, HelpCircle, FileText } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-glass)',
        background: '#000000',
        padding: '40px 24px 80px 24px', // Extra bottom padding for mobile navigation bar
        marginTop: '60px',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '32px',
        }}
      >
        {/* Brand Col */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <img
              src="/far-logo-sm.png"
              alt="FAR - Forget About Recharge"
              style={{
                height: '42px',
                width: 'auto',
                objectFit: 'contain',
              }}
            />
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.6' }}>
            Never pay for mobile recharges again. Complete simple micro-tasks, unleash 5x viral referral bonuses, and claim 100% free talktime &amp; 5G data on Jio, Airtel, Vi, and BSNL.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '14px', color: '#fff' }}>Company &amp; Explore</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
            <li><Link to="/about" style={{ color: 'var(--text-muted)' }}>About Us</Link></li>
            <li><Link to="/contact" style={{ color: 'var(--text-muted)' }}>Contact Support</Link></li>
            <li><Link to="/tasks" style={{ color: 'var(--text-muted)' }}>Earn Credits</Link></li>
            <li><Link to="/referrals" style={{ color: 'var(--text-muted)' }}>Invite &amp; Earn (5x Bonus)</Link></li>
            <li><Link to="/recharge" style={{ color: 'var(--text-muted)' }}>Redeem Recharge</Link></li>
            <li><Link to="/multiply" style={{ color: '#fde502' }}>🎲 Multiplier Game</Link></li>
            <li><Link to="/leaderboard" style={{ color: 'var(--text-muted)' }}>Top Referrers Leaderboard</Link></li>
          </ul>
        </div>

        {/* Partners & Creators */}
        <div>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '14px', color: '#fff' }}>For Partners &amp; Brands</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
            <li>
              <Link to="/partners" style={{ color: 'var(--accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                🤝 Partner With Us
              </Link>
            </li>
            <li>
              <Link to="/partners" style={{ color: 'var(--text-muted)' }}>
                YouTube Creator Growth
              </Link>
            </li>
            <li>
              <Link to="/partners" style={{ color: 'var(--text-muted)' }}>
                Website Traffic &amp; Dwell
              </Link>
            </li>
            <li>
              <Link to="/partners" style={{ color: 'var(--text-muted)' }}>
                App Installs &amp; CPA
              </Link>
            </li>
            <li>
              <Link to="/partners#calculator" style={{ color: 'var(--text-muted)' }}>
                Campaign ROI Calculator
              </Link>
            </li>
            <li>
              <Link to="/partners#proposal-form" style={{ color: '#00e699', fontWeight: 600 }}>
                ⚡ Submit Campaign Proposal
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal & Policies */}
        <div>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '14px', color: '#fff' }}>Trust &amp; Legal</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
            <li>
              <Link to="/privacy" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={14} color="#00eefd" /> Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={14} color="#00e699" /> Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/recharge-policy" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={14} color="#00eefd" /> Recharge Policy
              </Link>
            </li>
            <li>
              <Link to="/refund" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HelpCircle size={14} color="#fdcb6e" /> Refund Policy
              </Link>
            </li>
            <li style={{ paddingTop: '4px' }}>
              <a
                href="mailto:contact@forgetaboutrecharge.com?subject=Partner%20Inquiry"
                style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.78rem' }}
              >
                ✉ contact@forgetaboutrecharge.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div
        style={{
          maxWidth: '1200px',
          margin: '32px auto 0 auto',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'var(--text-sub)',
          fontSize: '0.8rem',
        }}
      >
        <div>© 2026 FAR (Forget About Recharge). All rights reserved.</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          Powered by <Zap size={14} color="#00EEFD" fill="#00EEFD" /> Lightning Fast Recharges
        </div>
      </div>
    </footer>
  );
};

export default Footer;
