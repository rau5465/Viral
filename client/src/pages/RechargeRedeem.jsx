import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Smartphone,
  CheckCircle2,
  Clock,
  History,
  Coins,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  PhoneCall,
  Wifi,
  Gift,
  HelpCircle,
} from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/common/Modal';
import { OperatorLogo, JioLogo, AirtelLogo, ViLogo, BsnlLogo } from '../components/common/OperatorLogos';
import confetti from 'canvas-confetti';

const OPERATORS_METADATA = [
  {
    id: 'Jio',
    name: 'Reliance Jio',
    tagline: 'True 5G Unlimited',
    color: '#005CB9',
    bgColor: 'rgba(0, 92, 185, 0.12)',
    borderColor: 'rgba(0, 92, 185, 0.4)',
    activeBorder: '#00d2ff',
    logo: <JioLogo size={36} />,
  },
  {
    id: 'Airtel',
    name: 'Bharti Airtel',
    tagline: 'Airtel 5G Plus',
    color: '#ED1B24',
    bgColor: 'rgba(237, 27, 36, 0.12)',
    borderColor: 'rgba(237, 27, 36, 0.4)',
    activeBorder: '#ff4d4d',
    logo: <AirtelLogo size={36} />,
  },
  {
    id: 'Vi',
    name: 'Vodafone Idea',
    tagline: 'Vi Hero Unlimited',
    color: '#E60000',
    bgColor: 'rgba(230, 0, 0, 0.12)',
    borderColor: 'rgba(230, 0, 0, 0.4)',
    activeBorder: '#ff7675',
    logo: <ViLogo size={36} />,
  },
  {
    id: 'BSNL',
    name: 'BSNL Mobile',
    tagline: 'Connecting India 4G',
    color: '#002B7F',
    bgColor: 'rgba(0, 43, 127, 0.15)',
    borderColor: 'rgba(0, 43, 127, 0.4)',
    activeBorder: '#fdcb6e',
    logo: <BsnlLogo size={36} />,
  },
];

const RechargeRedeem = () => {
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  const [plansData, setPlansData] = useState({ operators: [], plansByOperator: {}, plans: [] });
  const [mobileNumber, setMobileNumber] = useState(user?.mobile || '');
  const [operator, setOperator] = useState('Jio');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [validityFilter, setValidityFilter] = useState('all'); // 'all' | 'monthly' | 'mid' | 'quarterly' | 'annual'
  const [confirmModal, setConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [creditRateDisplay, setCreditRateDisplay] = useState('1Rs = 1 Credit');

  useEffect(() => {
    const loadPlansAndHistory = async () => {
      setDataLoading(true);
      try {
        const [plansRes, histRes, rateRes] = await Promise.allSettled([
          apiService.getPlans(),
          apiService.getRechargeHistory(),
          apiService.getCreditRate(),
        ]);
        if (plansRes.status === 'fulfilled') setPlansData(plansRes.value);
        if (histRes.status === 'fulfilled') setHistory(histRes.value.history || []);
        if (
          rateRes.status === 'fulfilled' &&
          rateRes.value.data?.credit_rate?.credit_rate_display
        ) {
          setCreditRateDisplay(rateRes.value.data.credit_rate.credit_rate_display);
        }
      } catch (err) {
        console.error('Failed to load plans or history:', err);
      } finally {
        setDataLoading(false);
      }
    };
    loadPlansAndHistory();
  }, []);

  // Filter plans for the currently active operator (all strictly >= 300)
  const currentOperatorPlans = (plansData.plansByOperator?.[operator] || plansData.plans || []).filter(
    (p) => p.amount >= 300
  );

  const filteredPlans = currentOperatorPlans.filter((plan) => {
    if (validityFilter === 'monthly') return plan.validity.includes('28') || plan.validity.includes('30') || plan.validity.includes('1 Month');
    if (validityFilter === 'mid') return plan.validity.includes('54') || plan.validity.includes('56') || plan.validity.includes('65') || plan.validity.includes('70') || plan.validity.includes('75');
    if (validityFilter === 'quarterly') return plan.validity.includes('84') || plan.validity.includes('90') || plan.validity.includes('150') || plan.validity.includes('160');
    if (validityFilter === 'annual') return plan.validity.includes('300') || plan.validity.includes('365') || plan.validity.includes('395');
    return true;
  });

  const handleSelectPlan = (plan) => {
    if (!mobileNumber || mobileNumber.replace(/\D/g, '').length !== 10) {
      return toast.warning('Please enter a valid 10-digit mobile number first.');
    }
    setSelectedPlan(plan);
    setConfirmModal(true);
  };

  const handleRedeem = async () => {
    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      return toast.warning('Please enter a valid 10-digit mobile number.');
    }
    if (!selectedPlan) return;

    if ((user?.credit_balance || 0) < selectedPlan.credits) {
      return toast.error(
        `Insufficient balance. You need ${selectedPlan.credits} credits, but have ${user?.credit_balance || 0} credits.`
      );
    }

    setLoading(true);
    try {
      const res = await apiService.redeemRecharge({
        mobileNumber: cleanMobile,
        operator,
        planId: selectedPlan.id,
      });

      toast.success(res.message || 'Recharge request processed successfully! 🎉');
      try {
        confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
      } catch (_e) {}

      await refreshUser();
      const updatedHistory = await apiService.getRechargeHistory();
      setHistory(updatedHistory.history || []);
      setConfirmModal(false);
    } catch (err) {
      toast.error(err.message || 'Recharge failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentBalance = user?.credit_balance || 0;

  return (
    <div
      className="inner-page-offset"
      style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '52px 20px 40px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '28px',
      }}
    >
      {/* Top Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(0, 238, 253, 0.1)',
              border: '1px solid rgba(0, 238, 253, 0.3)',
              borderRadius: '20px',
              padding: '4px 14px',
              fontSize: '0.8rem',
              color: 'var(--accent)',
              fontWeight: 700,
              marginBottom: '10px',
            }}
          >
            <Sparkles size={14} /> 100% Free Telecom Redemptions
          </div>
          <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <Smartphone size={30} color="var(--accent)" /> Redeem Mobile Recharge
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px', maxWidth: '700px' }}>
            Enter your own number or recharge for family &amp; friends. Select your telecom operator to choose from real monthly, quarterly, and annual prepaid plans (starting at ₹319/₹349).
          </p>
        </div>

        {/* Live Balance Card */}
        <div
          className="glass-card"
          style={{
            padding: '16px 22px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            background: 'linear-gradient(135deg, rgba(253, 203, 110, 0.12) 0%, rgba(13, 17, 23, 0.95) 100%)',
            border: '1.5px solid rgba(253, 203, 110, 0.4)',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'rgba(253, 203, 110, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fdcb6e',
            }}
          >
            <Coins size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>AVAILABLE BALANCE</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fdcb6e', lineHeight: 1.1 }}>
              {currentBalance} <span style={{ fontSize: '0.85rem' }}>Credits</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#00e699', marginTop: '2px', fontWeight: 600 }}>
              Current Credit Rate: {creditRateDisplay}
            </div>
          </div>
        </div>
      </div>

      {/* Step 1: Mobile Number Entry */}
      <div className="glass-card" style={{ padding: '24px 26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <span
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: 'var(--primary)',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              1
            </span>
            Enter 10-Digit Mobile Number
          </h3>

          {/* Quick Number Pre-fill Button */}
          {user?.mobile && (
            <button
              onClick={() => setMobileNumber(user.mobile)}
              style={{
                background: mobileNumber === user.mobile ? 'rgba(0, 238, 253, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                border: mobileNumber === user.mobile ? '1px solid var(--accent)' : '1px solid var(--border-glass)',
                borderRadius: '20px',
                padding: '6px 14px',
                color: mobileNumber === user.mobile ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Smartphone size={14} /> Use My WhatsApp Number (+91 {user.mobile})
            </button>
          )}
        </div>

        <div style={{ maxWidth: '480px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                position: 'absolute',
                left: '16px',
                color: 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '1rem',
                pointerEvents: 'none',
              }}
            >
              🇮🇳 +91
            </span>
            <input
              type="tel"
              maxLength={10}
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 9876543210"
              style={{
                width: '100%',
                padding: '14px 16px 14px 76px',
                background: '#040711',
                border:
                  mobileNumber.length === 10
                    ? '1.5px solid #00e699'
                    : '1.5px solid var(--border-glass)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '1.15rem',
                fontWeight: 700,
                letterSpacing: '1px',
                outline: 'none',
                boxShadow:
                  mobileNumber.length === 10
                    ? '0 0 15px rgba(0, 230, 153, 0.2)'
                    : 'none',
              }}
            />
          </div>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.8rem', marginTop: '8px' }}>
            * You can recharge any active Indian prepaid mobile number (self, family, or friends).
          </p>
        </div>
      </div>

      {/* Step 2: Telecom Operator Selector with Authentic Logos */}
      <div className="glass-card" style={{ padding: '24px 26px' }}>
        <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'var(--primary)',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            2
          </span>
          Select Telecom Operator
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
          }}
        >
          {OPERATORS_METADATA.map((opMeta) => {
            const isSelected = operator === opMeta.id;
            return (
              <div
                key={opMeta.id}
                onClick={() => setOperator(opMeta.id)}
                style={{
                  background: isSelected ? opMeta.bgColor : 'rgba(255, 255, 255, 0.02)',
                  border: isSelected ? `2px solid ${opMeta.activeBorder}` : '1px solid var(--border-glass)',
                  borderRadius: '16px',
                  padding: '18px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected
                    ? `0 6px 20px rgba(0, 0, 0, 0.6), 0 0 15px ${opMeta.bgColor}`
                    : 'none',
                  position: 'relative',
                }}
              >
                {opMeta.logo}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>
                    {opMeta.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: isSelected ? 'var(--accent)' : 'var(--text-muted)' }}>
                    {opMeta.tagline}
                  </div>
                </div>
                {isSelected && (
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: opMeta.activeBorder,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#000',
                    }}
                  >
                    <CheckCircle2 size={16} strokeWidth={3} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 3: Available Plans Grid (Strictly >= ₹300) */}
      <div className="glass-card" style={{ padding: '24px 26px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            marginBottom: '20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: 'var(--primary)',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              3
            </span>
            <div>
              <h3 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                Select {operator} Recharge Plan
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: '#00e699',
                    background: 'rgba(0, 230, 153, 0.12)',
                    border: '1px solid rgba(0, 230, 153, 0.3)',
                    borderRadius: '12px',
                    padding: '2px 8px',
                    fontWeight: 700,
                  }}
                >
                  Strictly ₹300+ Plans
                </span>
              </h3>
            </div>
          </div>

          {/* Validity Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Plans' },
              { id: 'monthly', label: '1 Month (28D)' },
              { id: 'mid', label: '54–75 Days' },
              { id: 'quarterly', label: '84–90 Days' },
              { id: 'annual', label: '365 Days' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setValidityFilter(tab.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  background: validityFilter === tab.id ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                  color: validityFilter === tab.id ? '#fff' : 'var(--text-muted)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Plans Cards Grid */}
        {dataLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div className="spinner" style={{ margin: '0 auto 12px auto' }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading verified {operator} plans...</p>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            No plans found for this filter. Please select "All Plans".
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {filteredPlans.map((plan) => {
              const hasEnough = currentBalance >= plan.credits;
              const creditsNeeded = plan.credits - currentBalance;

              return (
                <div
                  key={plan.id}
                  className="glass-card"
                  style={{
                    padding: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: hasEnough
                      ? '1.5px solid rgba(0, 210, 255, 0.35)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '18px',
                    background: hasEnough ? '#090f1d' : '#05070e',
                    position: 'relative',
                    transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                  }}
                >
                  {/* Top Badge & Operator Logo */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <OperatorLogo operator={plan.operator} size={28} />
                      {plan.badge && (
                        <span
                          style={{
                            background:
                              plan.badge.includes('Popular')
                                ? 'linear-gradient(135deg, rgba(253, 167, 2, 0.25), rgba(253, 229, 2, 0.25))'
                                : 'rgba(0, 210, 255, 0.15)',
                            border:
                              plan.badge.includes('Popular')
                                ? '1px solid #fda702'
                                : '1px solid rgba(0, 210, 255, 0.35)',
                            color: plan.badge.includes('Popular') ? '#fde502' : 'var(--accent)',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '3px 10px',
                            borderRadius: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}
                        >
                          {plan.badge}
                        </span>
                      )}
                    </div>

                    {/* Price and Validity */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                        ₹{plan.amount}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        / {plan.validity}
                      </span>
                    </div>

                    {/* Data & Voice Pills */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '14px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent)' }}>
                        <Wifi size={16} /> {plan.data}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                        <PhoneCall size={15} color="#00e699" /> {plan.calls} • {plan.sms}
                      </div>
                      {plan.speed5g && (
                        <div style={{ fontSize: '0.78rem', color: '#fde502', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Zap size={14} color="#fde502" /> {plan.speed5g}
                        </div>
                      )}
                      {plan.perks && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '4px' }}>
                          🎁 Perks: {plan.perks}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Credits & Action Button */}
                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '14px', marginTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cost in Credits:</span>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fdcb6e' }}>
                        {plan.credits} CR
                      </span>
                    </div>

                    {hasEnough ? (
                      <button
                        onClick={() => handleSelectPlan(plan)}
                        className="btn btn-primary"
                        style={{
                          width: '100%',
                          padding: '11px',
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          background: 'linear-gradient(135deg, #00d2d3 0%, #0066ff 100%)',
                          boxShadow: '0 4px 15px rgba(0, 210, 211, 0.3)',
                        }}
                      >
                        ⚡ Redeem Free Recharge
                      </button>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <button
                          disabled
                          style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: 'var(--text-muted)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'not-allowed',
                          }}
                        >
                          Need {creditsNeeded} More Credits
                        </button>
                        <Link
                          to="/tasks"
                          style={{
                            textAlign: 'center',
                            fontSize: '0.75rem',
                            color: 'var(--accent)',
                            textDecoration: 'none',
                            fontWeight: 600,
                          }}
                        >
                          + Earn Credits Now &rarr;
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {selectedPlan && (
        <Modal
          isOpen={confirmModal}
          onClose={() => setConfirmModal(false)}
          title="Confirm Free Mobile Recharge"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '14px',
                border: '1px solid var(--border-glass)',
              }}
            >
              <OperatorLogo operator={operator} size={42} />
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{operator} Prepaid Recharge</div>
                <div style={{ color: '#00e699', fontWeight: 700, fontSize: '0.85rem' }}>
                  ₹{selectedPlan.amount} Plan • {selectedPlan.validity}
                </div>
              </div>
            </div>

            <div
              style={{
                background: '#040711',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid var(--border-glass)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                fontSize: '0.9rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Recipient Mobile Number:</span>
                <span style={{ fontWeight: 800, color: '#fff', letterSpacing: '0.5px' }}>
                  +91 {mobileNumber}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Data Allowance:</span>
                <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{selectedPlan.data}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Validity:</span>
                <span style={{ fontWeight: 700 }}>{selectedPlan.validity}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Credits to Deduct:</span>
                <span style={{ fontWeight: 800, color: '#fdcb6e' }}>- {selectedPlan.credits} CR</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Remaining Balance:</span>
                <span style={{ fontWeight: 800, color: '#00e699' }}>
                  {currentBalance - selectedPlan.credits} CR
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                onClick={() => setConfirmModal(false)}
                disabled={loading}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '12px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleRedeem}
                disabled={loading}
                className="btn btn-primary"
                style={{
                  flex: 2,
                  padding: '12px',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #00e699 0%, #0066ff 100%)',
                }}
              >
                {loading ? 'Processing Recharge...' : `Confirm & Recharge ₹${selectedPlan.amount}`}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Recharge History Table */}
      <div className="glass-card" style={{ padding: '24px 26px' }}>
        <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <History size={20} color="var(--primary)" /> My Recharge Orders History ({history.length})
        </h3>

        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
            No mobile recharges redeemed yet. Pick a plan above to claim your first free recharge!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Operator</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Mobile Number</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Credits</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '12px 10px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                      <OperatorLogo operator={item.operator} size={24} />
                      <span>{item.operator}</span>
                    </td>
                    <td style={{ padding: '12px 10px', fontFamily: 'monospace', fontWeight: 600 }}>
                      +91 {item.mobile_number}
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 800, color: '#fff' }}>
                      ₹{item.amount}
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'right', color: '#fdcb6e', fontWeight: 700 }}>
                      {item.credits_spent} CR
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                      <span
                        style={{
                          background: item.status === 'completed' ? 'rgba(0, 230, 153, 0.15)' : 'rgba(253, 167, 2, 0.15)',
                          color: item.status === 'completed' ? '#00e699' : '#fda702',
                          border: item.status === 'completed' ? '1px solid rgba(0, 230, 153, 0.3)' : '1px solid rgba(253, 167, 2, 0.3)',
                          borderRadius: '12px',
                          padding: '3px 10px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          textTransform: 'capitalize',
                        }}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'right', color: 'var(--text-sub)' }}>
                      {new Date(item.created_at || item.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RechargeRedeem;
