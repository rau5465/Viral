import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import { apiService } from '../services/api';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await apiService.getLeaderboard(15);
        setLeaders(res.leaderboard || []);
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const top3 = leaders.slice(0, 3);
  const remainingLeaders = leaders.slice(3);

  return (
    <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '0 20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <Trophy size={32} color="#fdcb6e" /> Top Referrers Hall of Fame
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '6px' }}>
          Real-time leaderboard of the highest earning referral champions
        </p>
      </div>

      {/* Top 3 Podium */}
      {top3.length > 0 && (
        <div
          className="podium-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
            marginBottom: '36px',
          }}
        >
          {top3.map((leader, index) => {
            const isFirst = index === 0;
            const medalColor = index === 0 ? '#fdcb6e' : index === 1 ? '#e0e0e0' : '#cd7f32';
            return (
              <div
                key={leader.id}
                className="glass-card"
                style={{
                  padding: '28px',
                  textAlign: 'center',
                  border: isFirst ? '2px solid rgba(253, 203, 110, 0.5)' : '1px solid var(--border-glass)',
                  background: isFirst
                    ? 'linear-gradient(180deg, rgba(253, 203, 110, 0.1) 0%, rgba(22, 27, 34, 0.95) 100%)'
                    : 'var(--bg-card)',
                  transform: isFirst ? 'scale(1.03)' : 'none',
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: `rgba(${index === 0 ? '253, 203, 110' : index === 1 ? '224, 224, 224' : '205, 127, 50'}, 0.2)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px auto',
                  }}
                >
                  {index === 0 ? (
                    <Trophy size={28} color={medalColor} />
                  ) : index === 1 ? (
                    <Medal size={28} color={medalColor} />
                  ) : (
                    <Award size={28} color={medalColor} />
                  )}
                </div>

                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: medalColor, textTransform: 'uppercase' }}>
                  Rank #{leader.rank}
                </div>
                <h3 style={{ fontSize: '1.25rem', margin: '4px 0 8px 0' }}>{leader.name}</h3>

                <span className={`badge badge-${leader.level || 'bronze'}`} style={{ marginBottom: '16px' }}>
                  {leader.level}
                </span>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    padding: '12px',
                    borderRadius: '10px',
                    display: 'flex',
                    justifyContent: 'space-around',
                    fontSize: '0.85rem',
                  }}
                >
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Referrals</div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>
                      {leader.totalReferrals}
                    </div>
                  </div>
                  <div style={{ width: '1px', background: 'var(--border-glass)' }} />
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Earned</div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fdcb6e' }}>
                      {leader.totalEarned} CR
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Full Rankings</h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div className="spinner" style={{ margin: '0 auto 12px auto' }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading rankings...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {remainingLeaders.map((leader) => (
              <div
                key={leader.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                  padding: '12px 18px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-glass)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontWeight: 800, fontSize: '1rem', width: '28px', color: 'var(--text-sub)' }}>
                    #{leader.rank}
                  </span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{leader.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                      Tier: {leader.level}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                      {leader.totalReferrals} Friends
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#fdcb6e', fontWeight: 600 }}>
                      {leader.totalEarned} CR
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
