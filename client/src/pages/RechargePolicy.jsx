import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Smartphone,
  Clock,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Zap,
  Info,
} from 'lucide-react';
import { JioLogo, AirtelLogo, ViLogo, BsnlLogo } from '../components/common/OperatorLogos';

const RechargePolicy = () => {
  return (
    <div className="page-container page-header-offset" style={{ maxWidth: '920px', margin: '0 auto', padding: '64px 20px 80px 20px' }}>
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
            background: 'rgba(0, 230, 153, 0.1)',
            border: '1px solid rgba(0, 230, 153, 0.3)',
            borderRadius: '30px',
            padding: '6px 16px',
            color: '#00e699',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '14px',
          }}
        >
          <Smartphone size={15} /> Airtime &amp; Data Fulfillment Rules
        </div>
        <h1
          style={{
            fontSize: 'clamp(2.2rem, 4.5vw, 3rem)',
            fontWeight: 900,
            marginBottom: '10px',
            letterSpacing: '-0.5px',
          }}
        >
          Recharge Fulfillment Policy
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Effective: September 2026 | Comprehensive rules governing airtime redemptions, SLAs, and failed order reversals on FAR (Forget About Recharge)
        </p>
      </div>

      {/* Main Content Body */}
      <div
        className="glass-card"
        style={{
          padding: '36px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
          lineHeight: '1.75',
          color: 'var(--text-sub)',
        }}
      >
        {/* Section 1: Introduction & Scope */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Zap size={22} color="var(--accent)" />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              1. Overview &amp; Redemption Mechanism
            </h2>
          </div>
          <p>
            At <strong>Forget About Recharge (FAR)</strong>, we partner with verified digital telecommunications aggregation
            gateways across India to provide instant, automated mobile recharge fulfillment.
          </p>
          <p style={{ marginTop: '10px' }}>
            Credits earned through our micro-task engine, sponsored brand offers, and up to 5X viral referral milestones can be redeemed
            towards prepaid packs for <strong>Reliance Jio, Bharti Airtel, Vodafone Idea (Vi), and Bharat Sanchar Nigam Limited (BSNL)</strong>.
            One FAR Credit is pegged at a 1:1 equivalent value to Indian Rupees (₹1.00) when redeeming eligible prepaid catalog packs.
          </p>
        </section>

        {/* Section 2: Fulfillment SLA */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Clock size={22} color="#fdcb6e" />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              2. Service Level Agreements (SLAs) &amp; Dispatch Times
            </h2>
          </div>
          <div
            style={{
              background: 'rgba(253, 203, 110, 0.08)',
              border: '1px solid rgba(253, 203, 110, 0.25)',
              borderRadius: '12px',
              padding: '18px',
              marginBottom: '16px',
            }}
          >
            <div style={{ fontWeight: 700, color: '#fdcb6e', marginBottom: '4px' }}>
              ⚡ Real-Time Instant Queue (98.6% of Transactions)
            </div>
            <p style={{ fontSize: '0.9rem', margin: 0 }}>
              Under standard operating network conditions, recharges are submitted and confirmed by the telecommunications operator
              within <strong>30 to 180 seconds</strong> from user confirmation.
            </p>
          </div>
          <p>
            During periodic telecommunication operator server maintenance or national network gateway downtime:
          </p>
          <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>Requests will remain in <code>processing</code> status for a maximum window of <strong>24 hours</strong>.</li>
            <li>Our backend dispatch worker automatically polls operator status APIs every 5 minutes until a definitive confirmation or failure code is received.</li>
            <li>Users receive an in-app transaction record with the exact Operator Reference / Transaction ID upon successful delivery.</li>
          </ul>
        </section>

        {/* Section 3: Operator Plans and Circle Accuracy */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Smartphone size={22} color="#00e699" />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              3. Telecom Operator Circles &amp; Plan Accuracy
            </h2>
          </div>
          <p>
            Telecommunication operators regularly calibrate prepaid offerings, tariff amounts, and plan benefits. FAR synchronizes its plan catalog with real-time operator tariff databases:
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '12px',
              margin: '16px 0',
            }}
          >
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <JioLogo size={32} />
              <div>
                <strong style={{ color: '#fff', fontSize: '0.85rem' }}>Reliance Jio</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹19, ₹29, ₹198, ₹349, ₹859</div>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AirtelLogo size={32} />
              <div>
                <strong style={{ color: '#fff', fontSize: '0.85rem' }}>Bharti Airtel</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹22, ₹33, ₹199, ₹349, ₹859</div>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ViLogo size={32} />
              <div>
                <strong style={{ color: '#fff', fontSize: '0.85rem' }}>Vodafone Idea</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹23, ₹39, ₹199, ₹349, ₹859</div>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BsnlLogo size={32} />
              <div>
                <strong style={{ color: '#fff', fontSize: '0.85rem' }}>BSNL</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹18, ₹99, ₹199, ₹397, ₹797</div>
              </div>
            </div>
          </div>
          <div
            style={{
              background: 'rgba(0, 238, 253, 0.05)',
              borderLeft: '4px solid var(--accent)',
              padding: '12px 16px',
              borderRadius: '0 8px 8px 0',
              fontSize: '0.9rem',
            }}
          >
            <strong>Mobile Number Portability (MNP) Notice:</strong> If you recently ported your number from one operator to another (e.g. Airtel to Jio), please make sure you select your CURRENT active operator when submitting your redemption request to prevent routing errors.
          </div>
        </section>

        {/* Section 4: Failed Transactions & Zero Loss Guarantee */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <RotateCcw size={22} color="var(--accent)" />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              4. Failed Recharges &amp; Zero Credit Loss Guarantee
            </h2>
          </div>
          <p>
            Your earned credits are protected at all times under our <strong>Zero Loss Guarantee</strong>:
          </p>
          <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>
              <strong>Automatic Credit Reversal:</strong> If an operator rejects a request (due to temporary operator downtime, invalid mobile number, non-prepaid connection, or circle tariff changes), the debited credits are automatically and instantly refunded to your FAR credit balance.
            </li>
            <li>
              <strong>Incorrect Number Entry:</strong> Recharges dispatched to a valid mobile number mistakenly entered by the user cannot be reversed once confirmed by the operator. Please verify your 10-digit mobile number carefully prior to clicking Redeem.
            </li>
            <li>
              <strong>Postpaid Numbers:</strong> FAR currently supports only prepaid connections. If a postpaid number is submitted, the transaction will fail and your credits will be refunded.
            </li>
          </ul>
        </section>

        {/* Section 5: Fair Use & Fraud Prevention */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <ShieldCheck size={22} color="#00e699" />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              5. Fair Usage, Velocity Limits &amp; Anti-Fraud
            </h2>
          </div>
          <p>
            To protect our community and sponsor ecosystem, all recharge redemption activity is audited by our automated fraud detection filters:
          </p>
          <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>Users may redeem up to <strong>3 prepaid recharges per 24-hour rolling window</strong> per account.</li>
            <li>Automated bot requests, multi-accounting on the same physical device, or self-referral spoofing violate our terms. Suspect transactions will be quarantined for manual compliance review.</li>
            <li>Legitimate credits earned honestly will never expire and can be redeemed whenever the user desires.</li>
          </ul>
        </section>

        {/* Section 6: Support & Contact Escalation */}
        <section
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <Mail size={22} color="var(--accent)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              Recharge Inquiries &amp; Escalations
            </h3>
          </div>
          <p style={{ fontSize: '0.92rem', margin: 0, marginBottom: '16px' }}>
            If your recharge shows as completed in FAR but has not reflected on your telecom operator's balance within 15 minutes, please reach out to our dedicated recharge resolution team:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <a
              href="mailto:contact@forgetaboutrecharge.com"
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
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
                padding: '10px 18px',
                textDecoration: 'none',
              }}
            >
              Submit Support Ticket →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default RechargePolicy;
