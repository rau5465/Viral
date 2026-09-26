import React, { useState, useEffect } from 'react';
import { Smartphone, CheckCircle2, Clock, History } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/common/Modal';
import confetti from 'canvas-confetti';

const RechargeRedeem = () => {
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  const [plansData, setPlansData] = useState({ operators: [], plans: [] });
  const [mobileNumber, setMobileNumber] = useState(user?.mobile || '');
  const [operator, setOperator] = useState('Jio');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadPlansAndHistory = async () => {
      try {
        const [plansRes, histRes] = await Promise.all([
          apiService.getPlans(),
          apiService.getRechargeHistory(),
        ]);
        setPlansData(plansRes);
        setHistory(histRes.history || []);
        if (plansRes.operators?.length > 0) {
          setOperator(plansRes.operators[0]);
        }
      } catch (err) {
        console.error('Failed to load plans or history:', err);
      }
    };
    loadPlansAndHistory();
  }, []);

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setConfirmModal(true);
  };

  const handleRedeem = async () => {
    if (!mobileNumber || mobileNumber.replace(/\D/g, '').length !== 10) {
      return toast.warning('Please enter a valid 10-digit mobile number.');
    }
    if (!selectedPlan) return;

    if ((user?.credit_balance || 0) < selectedPlan.credits) {
      return toast.error(
        `Insufficient balance. You need ${selectedPlan.credits} credits, but have ${user?.credit_balance} credits.`
      );
    }

    setLoading(true);
    try {
      const res = await apiService.redeemRecharge({
        mobileNumber,
        operator,
        planId: selectedPlan.id,
      });

      toast.success(res.message || 'Recharge processed successfully!');
      try {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      } catch (_e) {
        // Ignore confetti error
      }

      await refreshUser();
      const updatedHistory = await apiService.getRechargeHistory();
      setHistory(updatedHistory.history || []);
      setConfirmModal(false);
    } catch (err) {
      toast.error(err.message || 'Recharge failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '0 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Smartphone size={28} color="#00d2d3" /> Redeem Mobile Recharge
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Exchange your earned credits for free mobile top-ups and data packs.
        </p>
      </div>

      {/* Recharge Details Configuration Card */}
      <div className="glass-card" style={{ padding: '28px', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>1. Enter Mobile & Operator</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {/* Mobile Number */}
          <div className="form-group">
            <label className="form-label">10-Digit Mobile Number</label>
            <input
              type="tel"
              maxLength={10}
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="e.g. 9876543210"
              className="form-input"
            />
          </div>

          {/* Operator Selector */}
          <div className="form-group">
            <label className="form-label">Telecom Operator</label>
            <select
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="form-input"
              style={{ background: 'rgba(13, 17, 23, 0.9)' }}
            >
              {plansData.operators?.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.2rem' }}>2. Select Recharge Plan</h3>
          <div style={{ fontSize: '0.9rem', color: '#fdcb6e', fontWeight: 700 }}>
            Your Balance: {user?.credit_balance ?? 0} Credits
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
          }}
        >
          {plansData.plans?.map((plan) => {
            const hasEnough = (user?.credit_balance || 0) >= plan.credits;
            return (
              <div
                key={plan.id}
                className="glass-card interactive"
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: hasEnough ? '1px solid rgba(0, 210, 211, 0.4)' : '1px solid var(--border-glass)',
                  opacity: hasEnough ? 1 : 0.65,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff' }}>
                      ₹{plan.amount}
                    </span>
                    <span className="badge badge-platinum">Recharge</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '8px 0 16px 0' }}>
                    {plan.label}
                  </p>
                </div>

                <div>
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      marginBottom: '14px',
                      textAlign: 'center',
                    }}
                  >
                    <span style={{ fontWeight: 800, color: '#fdcb6e', fontSize: '1.05rem' }}>
                      {plan.credits} Credits
                    </span>
                  </div>

                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={!hasEnough}
                    className={hasEnough ? 'btn btn-accent' : 'btn btn-secondary'}
                    style={{ width: '100%', padding: '10px' }}
                  >
                    {hasEnough ? 'Redeem Now' : 'Not Enough Credits'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal */}
      {selectedPlan && (
        <Modal
          isOpen={confirmModal}
          onClose={() => setConfirmModal(false)}
          title="Confirm Recharge Redemption"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Are you sure you want to redeem <strong>{selectedPlan.credits} Credits</strong> for a{' '}
              <strong>₹{selectedPlan.amount}</strong> recharge?
            </p>

            <div
              style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '16px',
                borderRadius: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '0.9rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Mobile Number:</span>
                <span style={{ fontWeight: 700 }}>{mobileNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Operator:</span>
                <span style={{ fontWeight: 700 }}>{operator}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Recharge Amount:</span>
                <span style={{ fontWeight: 700, color: '#00d2d3' }}>₹{selectedPlan.amount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Credits Deducted:</span>
                <span style={{ fontWeight: 700, color: '#fdcb6e' }}>{selectedPlan.credits} CR</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                onClick={() => setConfirmModal(false)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                onClick={handleRedeem}
                disabled={loading}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                {loading ? 'Processing...' : 'Confirm & Redeem'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Recharge History Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={20} /> Your Recharge History
        </h3>

        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            No recharges redeemed yet. Earn credits to claim your first free recharge!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {history.map((rc) => (
              <div
                key={rc.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-glass)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
                    ₹{rc.amount} Recharge — {rc.operator} ({rc.mobile_number})
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                    Tx ID: {rc.transaction_id || `TX_${rc.id}`} • {new Date(rc.created_at).toLocaleString()}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className={`badge badge-${rc.status === 'completed' ? 'success' : 'warning'}`}>
                    {rc.status === 'completed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {rc.status}
                  </span>
                  <span style={{ fontWeight: 700, color: '#ff7675' }}>
                    -{rc.credits_spent} CR
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RechargeRedeem;
