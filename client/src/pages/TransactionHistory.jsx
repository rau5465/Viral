import React, { useState, useEffect } from 'react';
import { History, ArrowDownLeft, ArrowUpRight, Filter } from 'lucide-react';
import { apiService } from '../services/api';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const [txRes, sumRes] = await Promise.all([
        apiService.getTransactions({
          category: categoryFilter || undefined,
          type: typeFilter || undefined,
          limit: 50,
        }),
        apiService.getTransactionSummary(),
      ]);
      setTransactions(txRes.transactions || []);
      setSummary(sumRes.summary || []);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [categoryFilter, typeFilter]);

  return (
    <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '0 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <History size={28} color="var(--primary)" /> Wallet Ledger & History
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Complete record of credits earned, spent, and multiplied.
        </p>
      </div>

      {/* Summary Chips */}
      {summary.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          {summary.map((item, idx) => (
            <div
              key={idx}
              className="glass-card"
              style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {item.category?.replace('_', ' ')}
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#00b894' }}>
                +{item.total_amount} CR
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                {item.count} events
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Filter Bar */}
      <div
        className="glass-card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <Filter size={16} /> Filters:
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="form-input"
          style={{ width: 'auto', flex: '1 1 140px', padding: '8px 12px', fontSize: '0.85rem' }}
        >
          <option value="">All Categories</option>
          <option value="signup_bonus">Signup Bonus</option>
          <option value="referral">Referral</option>
          <option value="task">Tasks</option>
          <option value="bonus_multiplier">4x Multiplier</option>
          <option value="recharge">Recharge</option>
          <option value="adjustment">Admin Adjustment</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="form-input"
          style={{ width: 'auto', flex: '1 1 140px', padding: '8px 12px', fontSize: '0.85rem' }}
        >
          <option value="">Credit & Debit</option>
          <option value="credit">Credits In (+)</option>
          <option value="debit">Debits Out (-)</option>
        </select>
      </div>

      {/* Ledger Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div className="spinner" style={{ margin: '0 auto 12px auto' }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading records...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            No transactions matching criteria.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {transactions.map((tx) => {
              const isCredit = tx.type === 'credit';
              return (
                <div
                  key={tx.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                    padding: '14px 18px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-glass)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: isCredit ? 'rgba(0, 184, 148, 0.15)' : 'rgba(255, 118, 117, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isCredit ? (
                        <ArrowDownLeft size={18} color="#00b894" />
                      ) : (
                        <ArrowUpRight size={18} color="#ff7675" />
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{tx.description}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                        {new Date(tx.created_at).toLocaleString()} • Category: {tx.category.replace('_', ' ')}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: '1.05rem',
                        color: isCredit ? '#00b894' : '#ff7675',
                      }}
                    >
                      {isCredit ? `+${tx.amount}` : `-${tx.amount}`} CR
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                      Bal: {tx.balance_after} CR
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
