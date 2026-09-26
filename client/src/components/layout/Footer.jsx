import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Heart, Shield, HelpCircle, FileText } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-glass)',
        background: 'rgba(10, 13, 18, 0.95)',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'var(--primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Zap size={16} color="#fff" />
            </div>
            <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>ViralRecharge</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.6' }}>
            India&apos;s fastest viral referral platform. Complete tasks, refer friends, and unlock free mobile recharges for Jio, Airtel, Vi, and BSNL.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '14px', color: '#fff' }}>Quick Links</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
            <li><Link to="/tasks" style={{ color: 'var(--text-muted)' }}>Earn Credits</Link></li>
            <li><Link to="/referrals" style={{ color: 'var(--text-muted)' }}>Refer & Earn (4x Bonus)</Link></li>
            <li><Link to="/recharge" style={{ color: 'var(--text-muted)' }}>Redeem Recharge</Link></li>
            <li><Link to="/leaderboard" style={{ color: 'var(--text-muted)' }}>Top Referrers Leaderboard</Link></li>
          </ul>
        </div>

        {/* Trust & Security */}
        <div>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '14px', color: '#fff' }}>Trust & Safety</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
              <Shield size={14} color="#00b894" /> 100% Free & Verified Recharges
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
              <HelpCircle size={14} color="#00d2d3" /> 24/7 Fast Support
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
              <FileText size={14} color="#fdcb6e" /> Terms of Service & Privacy
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
        <div>© 2026 ViralRecharge. All rights reserved.</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          Built with <Heart size={14} color="#ff7675" fill="#ff7675" /> for viral exponential growth
        </div>
      </div>
    </footer>
  );
};

export default Footer;
