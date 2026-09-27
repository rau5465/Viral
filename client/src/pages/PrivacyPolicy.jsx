import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, ArrowLeft, Lock, Smartphone, Eye, CheckCircle2, FileText } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="page-container page-header-offset" style={{ maxWidth: '900px', margin: '0 auto', padding: '64px 20px 80px 20px' }}>
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

      {/* Hero Badge */}
      <div style={{ marginBottom: '28px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(0, 210, 255, 0.1)',
            border: '1px solid rgba(0, 210, 255, 0.3)',
            borderRadius: '30px',
            padding: '6px 16px',
            color: 'var(--accent)',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '12px',
          }}
        >
          <Lock size={15} /> Privacy &amp; Data Protection
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, marginBottom: '8px' }}>
          Privacy Policy
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Last Updated: September 2026 | Effective for all users of FAR (Forget About Recharge)
        </p>
      </div>

      {/* Main Glass Content Card */}
      <div
        className="glass-card"
        style={{
          padding: '36px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '28px',
          lineHeight: '1.75',
          color: '#cbd5e1',
        }}
      >
        {/* Section 1 */}
        <section>
          <h2 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--accent)' }}>1.</span> Introduction &amp; Core Principles
          </h2>
          <p>
            Welcome to <strong>FAR (Forget About Recharge)</strong>, accessible at{' '}
            <Link to="/" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
              forgetaboutrecharge.com
            </Link>
            . We believe that accessing mobile data and talktime in India should be 100% free through genuine engagement with creators and brand sponsors.
          </p>
          <p style={{ marginTop: '10px' }}>
            We deeply respect your privacy. This Privacy Policy outlines what information we collect, why we collect it, how your mobile operator recharges are processed, and the measures we take to keep your personal data strictly confidential and secure.
          </p>
        </section>

        {/* Section 2 */}
        <section>
          <h2 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--accent)' }}>2.</span> Information We Collect
          </h2>
          <p>We only collect the minimal information necessary to deliver our services, verify engagement, and credit mobile recharge packs:</p>
          <ul style={{ paddingLeft: '22px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>
              <strong>Account Information:</strong> Full name, valid email address, and encrypted password created during registration.
            </li>
            <li>
              <strong>Mobile Recharge Details:</strong> 10-digit Indian prepaid mobile number, telecom circle/state, and selected carrier (Jio, Airtel, Vi, or BSNL) submitted exclusively when you redeem your earned credits.
            </li>
            <li>
              <strong>Engagement &amp; Task Verification:</strong> Verified subscription IDs via the official Google YouTube API, task completion confirmations, timestamp logs, and referral invite links associated with the 2-Hour 4X Multiplier Challenge.
            </li>
            <li>
              <strong>Technical &amp; Device Identifiers:</strong> IP address, device type, browser user-agent, and anti-fraud telemetry used to prevent automated bot networks, duplicate multi-accounts, and referral exploitation.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section>
          <h2 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--accent)' }}>3.</span> How We Use Your Information
          </h2>
          <p>Your data is processed strictly for the following purposes:</p>
          <ul style={{ paddingLeft: '22px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>To dispatch genuine 4G/5G mobile recharges to your telecom provider (Jio, Airtel, Vi, BSNL) in real-time.</li>
            <li>To verify YouTube creator channel subscriptions and ensure partner compliance through Google OAuth / APIs.</li>
            <li>To track wallet balances and engagement milestones (standard platform benchmark: 1Rs = 1 Credit, subject to periodic administrative updates based on utility and partner allocations).</li>
            <li>To detect and block malicious script injection, automated scrapers, and fraudulent referral ring abuse.</li>
            <li>To send critical transaction confirmations, security notices, and password reset instructions.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section>
          <h2 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--accent)' }}>4.</span> Zero Selling of Personal Data
          </h2>
          <div
            style={{
              background: 'rgba(0, 230, 153, 0.1)',
              border: '1px solid rgba(0, 230, 153, 0.3)',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
            }}
          >
            <ShieldCheck size={24} color="#00e699" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#00e699' }}>Our Absolute Promise:</strong> We never sell, rent, monetize, or trade your phone numbers, email addresses, or personal identity to third-party telemarketers, loan sharks, or advertising brokers. Your mobile number is used strictly to trigger the operator recharge API.
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section>
          <h2 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--accent)' }}>5.</span> Third-Party Service Providers &amp; Telecom Gateways
          </h2>
          <p>
            When you request a recharge, your 10-digit mobile number and plan package code are securely transmitted via encrypted HTTPS REST APIs to licensed Indian telecom aggregators (processing packs directly with Reliance Jio Infocomm, Bharti Airtel, Vodafone Idea, and Bharat Sanchar Nigam Limited).
          </p>
          <p style={{ marginTop: '10px' }}>
            YouTube task verification utilizes Google API Services. Our usage and transfer of information received from Google APIs adheres to the Google API Services User Data Policy.
          </p>
        </section>

        {/* Section 6 */}
        <section>
          <h2 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--accent)' }}>6.</span> Data Security &amp; Encryption
          </h2>
          <p>
            We implement 256-bit SSL/TLS encryption for all in-transit communications. Passwords are cryptographically hashed using salted bcrypt algorithms. Database clusters are shielded behind strict VPC firewalls and monitored continuously for unauthorized intrusion attempts.
          </p>
        </section>

        {/* Section 7 */}
        <section>
          <h2 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--accent)' }}>7.</span> Your Rights &amp; Data Control
          </h2>
          <p>You have full ownership of your data on FAR:</p>
          <ul style={{ paddingLeft: '22px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>You may review, update, or edit your account information anytime in your User Profile.</li>
            <li>You may request complete erasure of your account and associated transaction history.</li>
            <li>You can opt out of promotional emails by clicking the unsubscribe link in any message.</li>
          </ul>
        </section>

        {/* Section 8: Contact */}
        <section
          style={{
            background: 'rgba(0, 102, 255, 0.1)',
            border: '1px solid rgba(0, 102, 255, 0.3)',
            borderRadius: '16px',
            padding: '24px',
            marginTop: '10px',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={20} color="#00eefd" /> Contact Privacy Grievance Officer
          </h2>
          <p style={{ fontSize: '0.92rem', marginBottom: '12px' }}>
            If you have any questions, concerns, or requests regarding this Privacy Policy or your personal information, please write to us at:
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 700 }}>
            <a
              href="mailto:contact@forgetaboutrecharge.com"
              style={{
                color: 'var(--accent)',
                textDecoration: 'none',
                background: 'rgba(0, 238, 253, 0.15)',
                padding: '8px 18px',
                borderRadius: '8px',
                border: '1px solid rgba(0, 238, 253, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Mail size={16} /> contact@forgetaboutrecharge.com
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
