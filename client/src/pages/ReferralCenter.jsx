import React, { useState, useEffect } from 'react';
import {
  Flame,
  Copy,
  Share2,
  Users,
  Coins,
  Send,
  MessageCircle,
  Gift,
  CheckCircle2,
} from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BonusTimerWidget from '../components/common/BonusTimerWidget';

const ReferralCenter = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [referralData, setReferralData] = useState(null);
  const [bonus, setBonus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReferrals = async () => {
    try {
      const [refRes, bonusRes] = await Promise.all([
        apiService.getReferralStats(),
        apiService.getBonusStatus(),
      ]);
      setReferralData(refRes);
      setBonus(bonusRes.bonus);
    } catch (err) {
      console.error('Failed to load referrals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const referralLink =
    referralData?.referralLink ||
    `${window.location.origin}/register?ref=${user?.referral_code || ''}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied to clipboard!');
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `🔥 Get 100% FREE Mobile Recharges with FAR (Forget About Recharge)! Sign up using my referral link for instant free credits: ${referralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleTelegram = () => {
    const text = encodeURIComponent(
      `🔥 Claim free mobile recharges! Join FAR (Forget About Recharge) here: ${referralLink}`
    );
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${text}`, '_blank');
  };

  const handleTwitter = () => {
    const text = encodeURIComponent(
      `Get FREE mobile talktime & data recharges on Jio, Airtel, Vi with FAR (Forget About Recharge)! 🚀 ${referralLink}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  if (loading) {
    return (
      <div className="inner-page-offset" style={{ maxWidth: '1100px', margin: '0 auto', padding: '52px 20px', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '40px auto' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading Referral Center...</p>
      </div>
    );
  }

  return (
    <div
      className="inner-page-offset"
      style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '52px 20px 30px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users size={28} color="var(--accent)" /> Invite &amp; Referral Program
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Get Up to 5x Rewards On Refer if you share app in next two hours! Single refer unlocks massive bonus credits.
        </p>
      </div>

      {/* Bonus Countdown Widget */}
      <BonusTimerWidget
        bonus={bonus}
        referralCode={user?.referral_code}
        referralLink={referralLink}
      />

      {/* Referral Link & Social Sharing Card */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Your Exclusive Referral Link</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '18px' }}>
          Share your personal link. Get Up to 5x Rewards on Refer if you share app in next two hours!
        </p>

        {/* Link Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
          <input
            type="text"
            readOnly
            value={referralLink}
            className="form-input"
            style={{ flex: 1, minWidth: '240px', background: 'rgba(0,0,0,0.4)', fontWeight: 600 }}
          />
          <button onClick={handleCopyLink} className="btn btn-primary" style={{ padding: '0 20px' }}>
            <Copy size={16} /> Copy Link
          </button>
        </div>

        {/* Instant Share Buttons */}
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Share Instantly On:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <button
              onClick={handleWhatsApp}
              className="btn"
              style={{ background: '#25D366', color: '#fff', padding: '10px 18px' }}
            >
              <Share2 size={16} /> WhatsApp
            </button>
            <button
              onClick={handleTelegram}
              className="btn"
              style={{ background: '#0088cc', color: '#fff', padding: '10px 18px' }}
            >
              <Send size={16} /> Telegram
            </button>
            <button
              onClick={handleTwitter}
              className="btn"
              style={{ background: '#1DA1F2', color: '#fff', padding: '10px 18px' }}
            >
              <MessageCircle size={16} /> X (Twitter)
            </button>
          </div>
        </div>
      </div>

      {/* Referral Performance Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Referrals</span>
            <Users size={22} color="var(--accent)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '8px' }}>
            {referralData?.totalReferrals || 0}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '6px' }}>
            Friends registered with your code
          </p>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Referral Credits Earned</span>
            <Coins size={22} color="#fdcb6e" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '8px', color: '#fdcb6e' }}>
            +{referralData?.totalCreditsEarned || 0} CR
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '6px' }}>
            Earned from successful invitations
          </p>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Reward Per Friend</span>
            <Gift size={22} color="#00b894" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '8px', color: '#00b894' }}>
            +50 CR
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '6px' }}>
            No limit on total friends invited
          </p>
        </div>
      </div>

      {/* Referred Friends List */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Referred Friends Network</h3>

        {referralData?.referrals?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            You haven&apos;t invited any friends yet. Share your link above to start earning!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {referralData?.referrals?.map((item) => (
              <div
                key={item.id}
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
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    {item.user?.name || 'Referred User'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                    Joined: {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="badge badge-success">
                    <CheckCircle2 size={12} /> {item.status}
                  </span>
                  <span style={{ fontWeight: 800, color: '#00b894' }}>
                    +{item.creditsAwarded || 50} CR
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

export default ReferralCenter;
