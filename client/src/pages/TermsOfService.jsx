import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft, Shield, AlertTriangle, Coins, Zap, Mail } from 'lucide-react';

const TermsOfService = () => {
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
          <FileText size={15} /> Legal Terms &amp; Conditions
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, marginBottom: '8px' }}>
          Terms of Service
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Effective Date: September 2026 | Governing the FAR (Forget About Recharge) Platform
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
            <span style={{ color: 'var(--accent)' }}>1.</span> Agreement to Terms
          </h2>
          <p>
            By creating an account, browsing, or utilizing any services provided by <strong>FAR (Forget About Recharge)</strong> at{' '}
            <Link to="/" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
              forgetaboutrecharge.com
            </Link>
            , you agree to be legally bound by these Terms of Service. If you do not accept these terms, please discontinue using the platform immediately.
          </p>
        </section>

        {/* Section 2 */}
        <section>
          <h2 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--accent)' }}>2.</span> Eligibility &amp; User Accounts
          </h2>
          <ul style={{ paddingLeft: '22px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>You must be at least 13 years of age and possess an active Indian prepaid mobile number.</li>
            <li>Each individual user is permitted to hold strictly <strong>one account</strong>. Multi-accounting, automated account farming, or virtual device emulation will result in immediate permanent account termination.</li>
            <li>You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section>
          <h2 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--accent)' }}>3.</span> Earning Credits &amp; Valuation
          </h2>
          <div
            style={{
              background: 'rgba(253, 203, 110, 0.12)',
              border: '1px solid rgba(253, 203, 110, 0.35)',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fda702', fontWeight: 800 }}>
              <Coins size={18} /> Official Credit Value: 1 Credit = ₹1 Recharge Value
            </div>
            <p style={{ marginTop: '6px', fontSize: '0.9rem', color: '#f1f5f9' }}>
              FAR Credits are promotional reward tokens designed exclusively for redemption toward Indian telecom prepaid packs (Jio, Airtel, Vi, BSNL). Credits have no direct fiat cash value, cannot be withdrawn to bank accounts, UPI, or PayPal, and cannot be transferred between user accounts.
            </p>
          </div>
          <p>Users earn credits by:</p>
          <ul style={{ paddingLeft: '22px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>Completing verified YouTube creator channel subscriptions (authenticated through Google API).</li>
            <li>Watching promotional videos and engaging with 30-second sponsored web discovery offers.</li>
            <li>Inviting new genuine users through personal referral links.</li>
            <li>Participating in daily login streaks and seasonal community quests.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section>
          <h2 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--accent)' }}>4.</span> The 2-Hour Up to 5X Referral Challenge
          </h2>
          <p>
            New users receive 25 Welcome Credits upon registration. A 2-hour countdown timer begins at the exact moment of registration.
          </p>
          <ul style={{ paddingLeft: '22px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>Get Up to 5x Rewards On Refer if you share app in next two hours — inviting a <strong>single verified user</strong> before the 2-hour countdown expires unlocks massive bonus rewards.</li>
            <li>Invited users must verify their account and originate from authentic, unique IP addresses and mobile devices. Self-referrals or creating secondary accounts will immediately void the challenge and revoke bonus credits.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section>
          <h2 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--accent)' }}>5.</span> Recharge Fulfillment &amp; Operator Policies
          </h2>
          <p>
            Recharges are dispatched automatically via high-speed API connections to our telecom gateway partners supporting:
          </p>
          <ul style={{ paddingLeft: '22px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong>Reliance Jio Infocomm Ltd.</strong></li>
            <li><strong>Bharti Airtel Ltd.</strong></li>
            <li><strong>Vodafone Idea Ltd. (Vi)</strong></li>
            <li><strong>Bharat Sanchar Nigam Ltd. (BSNL)</strong></li>
          </ul>
          <p style={{ marginTop: '12px' }}>
            While 99.8% of recharges are credited within 30 to 60 seconds, occasional telecom operator gateway downtime may take up to 24 hours. If an operator gateway rejects a transaction due to incorrect circle or deactivated SIM, your credits are refunded 100% back to your FAR wallet.
          </p>
        </section>

        {/* Section 6 */}
        <section>
          <h2 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--accent)' }}>6.</span> Prohibited Activities &amp; Account Suspension
          </h2>
          <div
            style={{
              background: 'rgba(255, 82, 82, 0.1)',
              border: '1px solid rgba(255, 82, 82, 0.3)',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff5252', fontWeight: 800 }}>
              <AlertTriangle size={18} /> Zero Tolerance Anti-Fraud Policy
            </div>
            <p style={{ marginTop: '6px', fontSize: '0.9rem' }}>
              The following actions will result in immediate permanent account ban and forfeiture of all accumulated credits:
            </p>
            <ul style={{ paddingLeft: '20px', marginTop: '8px', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Using automated click bots, headless browsers, or macro scripts to complete tasks.</li>
              <li>Operating emulator farms, disposable proxy networks, or Tor nodes to simulate referrals.</li>
              <li>Unsubscribing immediately from creator channels after claiming subscription credits.</li>
              <li>Attempting to reverse-engineer or tamper with the recharge dispatch API.</li>
            </ul>
          </div>
        </section>

        {/* Section 7 */}
        <section>
          <h2 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--accent)' }}>7.</span> Disclaimers &amp; Third-Party Trademarks
          </h2>
          <p>
            Reliance Jio, Airtel, Vodafone Idea (Vi), and BSNL are registered trademarks of their respective telecom operators. FAR is an independent promotional engagement platform and is not directly owned by or affiliated with Reliance Industries, Bharti Enterprises, or the Government of India.
          </p>
        </section>

        {/* Section 8: Support */}
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
            <Mail size={20} color="#00eefd" /> Questions Regarding Terms
          </h2>
          <p style={{ fontSize: '0.92rem', marginBottom: '12px' }}>
            For legal inquiries, dispute resolutions, or clarifications on these Terms of Service, contact our compliance team:
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

export default TermsOfService;
