import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Zap, Coins, LogOut, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(13, 17, 23, 0.9)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-glass)',
        padding: '12px 16px',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <Zap size={20} color="#ffffff" />
          </div>
          <span style={{ fontSize: 'clamp(1.1rem, 3.5vw, 1.3rem)', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Viral<span className="text-gradient">Recharge</span>
          </span>
        </Link>

        {/* Desktop Navigation Links (Hidden on screens <= 768px via CSS) */}
        {isAuthenticated && (
          <nav className="desktop-nav">
            <NavLink to="/dashboard" className="nav-link">
              Dashboard
            </NavLink>
            <NavLink to="/tasks" className="nav-link">
              Earn
            </NavLink>
            <NavLink to="/referrals" className="nav-link">
              4x Referrals
            </NavLink>
            <NavLink to="/recharge" className="nav-link">
              Recharge
            </NavLink>
            <NavLink to="/leaderboard" className="nav-link">
              Leaderboard
            </NavLink>
            <NavLink to="/history" className="nav-link">
              History
            </NavLink>
          </nav>
        )}

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isAuthenticated ? (
            <>
              {/* Credits Balance Pill */}
              <Link
                to="/recharge"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(253, 203, 110, 0.15)',
                  border: '1px solid rgba(253, 203, 110, 0.4)',
                  borderRadius: '20px',
                  padding: '6px 14px',
                  color: '#fdcb6e',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                }}
              >
                <Coins size={16} />
                <span>{user?.credit_balance ?? 0}</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>CR</span>
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                >
                  <ShieldCheck size={16} color="#00d2d3" />
                  <span style={{ display: 'none', smDisplay: 'inline' }}>Admin</span>
                </Link>
              )}

              {/* User Avatar & Logout */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link
                  to="/profile"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    background: 'var(--bg-surface)',
                  }}
                >
                  <User size={16} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    {user?.full_name?.split(' ')[0]}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '8px',
                    display: 'flex',
                    borderRadius: '8px',
                  }}
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link
                to="/login"
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  padding: '8px 14px',
                }}
              >
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px' }}>
                Join Free
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
