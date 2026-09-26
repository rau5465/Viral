import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Coins,
  Flame,
  Smartphone,
  CheckSquare,
  Users,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  Info,
} from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BonusTimerWidget from '../components/common/BonusTimerWidget';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await apiService.getDashboard();
      setDashboardData(res.dashboard);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '40px auto' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading your dashboard...</p>
      </div>
    );
  }

  const bonus = dashboardData?.bonus;
  const stats = dashboardData?.stats;
  const recentTransactions = dashboardData?.recentTransactions || [];
  const announcements = dashboardData?.announcements || [];

  return (
    <div
      style={{
        maxWidth: '1100px',
        margin: '24px auto',
        padding: '0 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      {/* Announcements */}
      {announcements.length > 0 && (
        <div
          style={{
            background: 'rgba(0, 210, 211, 0.1)',
            border: '1px solid rgba(0, 210, 211, 0.3)',
            borderRadius: '12px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#f0f6fc',
            fontSize: '0.9rem',
          }}
        >
          <Info size={18} color="var(--accent)" flexShrink={0} />
          <div>
            <strong>{announcements[0].title}:</strong> {announcements[0].message}
          </div>
        </div>
      )}

      {/* 2-Hour 4x Viral Bonus Widget */}
      <BonusTimerWidget
        bonus={bonus}
        referralCode={user?.referral_code}
        referralLink={`${window.location.origin}/register?ref=${user?.referral_code || ''}`}
      />

      {/* Wallet Balance & Key Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Credit Balance Card */}
        <div
          className="glass-card"
          style={{
            padding: '24px',
            background: 'linear-gradient(135deg, rgba(108, 92, 231, 0.2) 0%, rgba(22, 27, 34, 0.95) 100%)',
            border: '1px solid rgba(108, 92, 231, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Wallet Balance</span>
              <Coins size={20} color="#fdcb6e" />
            </div>
            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#fff', marginTop: '6px' }}>
              {user?.credit_balance ?? 0}{' '}
              <span style={{ fontSize: '1rem', color: '#fdcb6e', fontWeight: 700 }}>CR</span>
            </div>
          </div>
          <div style={{ marginTop: '16px' }}>
            <Link
              to="/recharge"
              className="btn btn-accent"
              style={{ width: '100%', padding: '10px', fontSize: '0.9rem' }}
            >
              <Smartphone size={16} /> Redeem Recharge
            </Link>
          </div>
        </div>

        {/* Total Earned Card */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Lifetime Earnings</span>
            <TrendingUp size={20} color="var(--success)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px' }}>
            {user?.total_earned ?? 0}{' '}
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>CR</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tier Level:</span>
            <span className={`badge badge-${user?.level || 'bronze'}`}>
              <Sparkles size={12} /> {user?.level || 'Bronze'}
            </span>
          </div>
        </div>

        {/* Referrals Stats Card */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Friends Referred</span>
            <Users size={20} color="var(--accent)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px' }}>
            {stats?.totalReferrals ?? 0}
          </div>
          <div style={{ marginTop: '14px' }}>
            <Link
              to="/referrals"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--accent)',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              Open Referral Center <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {/* Tasks Completed Today */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tasks Done Today</span>
            <CheckSquare size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px' }}>
            {stats?.tasksCompletedToday ?? 0}
          </div>
          <div style={{ marginTop: '14px' }}>
            <Link
              to="/tasks"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--primary)',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              Browse Available Tasks <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Action Banner */}
      <div
        className="glass-card"
        style={{
          padding: '20px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Ready to accumulate more credits?</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Visit websites, watch short videos, or invite contacts to earn up to 50 CR per referral!
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/tasks" className="btn btn-secondary">
            <CheckSquare size={16} /> Earn Tasks
          </Link>
          <Link to="/referrals" className="btn btn-primary">
            <Flame size={16} /> Refer Friends
          </Link>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <h3 style={{ fontSize: '1.15rem' }}>Recent Wallet Activity</h3>
          <Link
            to="/history"
            style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600 }}
          >
            View Full Ledger
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            No activity recorded yet. Start completing tasks to earn your first credits!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-glass)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{tx.description}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                    {new Date(tx.created_at).toLocaleString()} • {tx.category.replace('_', ' ')}
                  </div>
                </div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: '1rem',
                    color: tx.type === 'credit' ? '#00b894' : '#ff7675',
                  }}
                >
                  {tx.type === 'credit' ? `+${tx.amount}` : `-${tx.amount}`} CR
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
