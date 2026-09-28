import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, ArrowLeft, ShieldCheck, AlertCircle, HelpCircle, CheckCircle, Mail, Clock } from 'lucide-react';

const RefundPolicy = () => {
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
            background: 'rgba(0, 230, 153, 0.12)',
            border: '1px solid rgba(0, 230, 153, 0.35)',
            borderRadius: '30px',
            padding: '6px 16px',
            color: '#00e699',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '12px',
          }}
        >
          <RefreshCw size={15} /> 100% Recharge Protection
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, marginBottom: '8px' }}>
          Refund &amp; Cancellation Policy
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Clear, Transparent &amp; Automated Credit Protections | FAR (Forget About Recharge)
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
            <span style={{ color: 'var(--accent)' }}>1.</span> The Zero-Cost Reward Model
          </h2>
          <p>
            On <strong>FAR (Forget About Recharge)</strong>, users never spend real money out of pocket to purchase recharges. All mobile recharges (Jio, Airtel, Vi, and BSNL) are funded entirely by redeeming FAR Credits earned through sponsored creator engagements, YouTube subscriptions, and the 2-Hour Referral Challenge.
          </p>
          <p style={{ marginTop: '10px' }}>
            Consequently, this policy defines how your <strong>earned Credits and telecom operator deliveries</strong> are safeguarded, refunded, or reversed in the event of technical failure.
          </p>
        </section>

        {/* Section 2: Automated 100% Refund */}
        <section>
          <h2 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--accent)' }}>2.</span> Automated 100% Credit Refund Guarantee
          </h2>
          <div
            style={{
              background: 'rgba(0, 230, 153, 0.12)',
              border: '1px solid rgba(0, 230, 153, 0.35)',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              gap: '14px',
              alignItems: 'flex-start',
            }}
          >
            <ShieldCheck size={26} color="#00e699" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#00e699', fontSize: '1.05rem' }}>
                Zero Risk: Instant Automatic Reversal on Failed Transactions
              </strong>
              <p style={{ marginTop: '6px', fontSize: '0.92rem', color: '#f1f5f9' }}>
                If a telecom operator gateway rejects a recharge request (due to temporary operator downtime, network congestion, mismatched telecom circles, or unsupported plan code), our system automatically marks the transaction as <code>FAILED</code> and <strong>reverses 100% of the redeemed credits back into your FAR wallet immediately</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section>
          <h2 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--accent)' }}>3.</span> Delivery Timeframes &amp; Pending Status
          </h2>
          <p>
            Over 99.8% of recharges are confirmed by Jio, Airtel, Vi, or BSNL within <strong>30 to 60 seconds</strong>. However, in rare instances:
          </p>
          <ul style={{ paddingLeft: '22px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>
              <strong>Pending Status:</strong> If an operator experiences upstream delays, your transaction status will reflect <code>PENDING</code> while our automated queue polls the operator every 60 seconds.
            </li>
            <li>
              <strong>24-Hour Finality:</strong> If an operator does not confirm success within 24 hours, the order is automatically cancelled by our system and your credits are fully refunded to your balance.
            </li>
          </ul>
        </section>

        {/* Section 4 */}
        <section>
          <h2 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--accent)' }}>4.</span> Incorrect Mobile Number Submissions
          </h2>
          <div
            style={{
              background: 'rgba(253, 167, 2, 0.1)',
              border: '1px solid rgba(253, 167, 2, 0.3)',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
            }}
          >
            <AlertCircle size={22} color="#fda702" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#fda702' }}>Important Notice on User Accuracy:</strong>
              <p style={{ marginTop: '4px', fontSize: '0.9rem', color: '#f1f5f9' }}>
                Please double-check your 10-digit mobile number and operator selection before clicking &quot;Redeem&quot;. Once a mobile recharge is accepted and delivered by Jio, Airtel, Vi, or BSNL to an active phone number, telecom regulations prevent reversing talktime or data packs already loaded onto a SIM card.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section>
          <h2 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--accent)' }}>5.</span> Non-Cash Equivalency
          </h2>
          <p>
            FAR Credits are strictly digital utility rewards redeemable exclusively for Indian prepaid telecom packs. Credits cannot be refunded as fiat cash, bank transfers, UPI payouts, or cryptocurrency under any circumstances.
          </p>
        </section>

        {/* Section 6: Support & Dispute Claims */}
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
            <Mail size={20} color="#00eefd" /> 24/7 Fast Recharge Support &amp; Dispute Resolution
          </h2>
          <p style={{ fontSize: '0.92rem', marginBottom: '12px' }}>
            Did your balance deduct but you haven&apos;t received your operator confirmation SMS? Our priority support team will review your gateway transaction logs and resolve any dispute within <strong>12 to 24 hours</strong>:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Please include your registered FAR email, target mobile number, operator, and Transaction ID in your email for express 1-hour resolution.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default RefundPolicy;
