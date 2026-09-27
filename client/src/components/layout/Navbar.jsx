import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Coins,
  LogOut,
  ShieldCheck,
  User,
  Menu,
  X,
  ChevronDown,
  Trophy,
  History,
  Handshake,
  Info,
  Phone,
  LayoutDashboard,
  CheckSquare,
  Users,
  Smartphone,
  Dices,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close menus when route changes
  useEffect(() => {
    setMoreMenuOpen(false);
    setSideDrawerOpen(false);
  }, [location.pathname]);

  // Click outside listener for "More" dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMoreMenuOpen(false);
      }
    };
    if (moreMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [moreMenuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <header className="site-header">
        <div className="site-header-container">
          {/* Brand Logo: Prominent hanging tab extending outside header */}
          <div className="header-brand-wrapper">
            <Link to="/" className="header-brand-link" title="FAR - Forget About Recharge">
              <img
                src="/far-logo-md.png"
                alt="FAR - Forget About Recharge"
                className="header-brand-logo"
              />
            </Link>
          </div>

          {/* Desktop Navigation Links: Streamlined with Submenu for optimal spacing */}
          {isAuthenticated && (
            <nav className="desktop-nav">
              <NavLink to="/dashboard" className="nav-link">
                Dashboard
              </NavLink>
              <NavLink to="/tasks" className="nav-link">
                Earn
              </NavLink>
              <NavLink to="/referrals" className="nav-link">
                Invite
              </NavLink>
              <NavLink to="/recharge" className="nav-link">
                Recharge
              </NavLink>
              <NavLink
                to="/multiply"
                className="nav-link"
                style={{ color: '#fde502', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <span>🎲</span> Multiplier Game
              </NavLink>

              {/* Submenu Dropdown for Secondary Pages (Prevents Header Clutter) */}
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                  className="nav-link"
                  style={{
                    background: moreMenuOpen ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: moreMenuOpen ? 'var(--accent)' : 'var(--text-muted)',
                  }}
                >
                  <span>More</span>
                  <ChevronDown
                    size={14}
                    style={{
                      transform: moreMenuOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                </button>

                {moreMenuOpen && (
                  <div
                    className="glass-card"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 10px)',
                      left: '0',
                      width: '210px',
                      padding: '8px',
                      background: 'rgba(8, 12, 22, 0.96)',
                      border: '1px solid rgba(0, 238, 253, 0.3)',
                      borderRadius: '14px',
                      boxShadow: '0 12px 35px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 238, 253, 0.15)',
                      zIndex: 100,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      backdropFilter: 'blur(16px)',
                      animation: 'modalSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    <NavLink
                      to="/leaderboard"
                      className="nav-link"
                      style={{ padding: '8px 12px', fontSize: '0.84rem' }}
                    >
                      <Trophy size={15} color="#fdcb6e" />
                      <span>Leaderboard</span>
                    </NavLink>
                    <NavLink
                      to="/history"
                      className="nav-link"
                      style={{ padding: '8px 12px', fontSize: '0.84rem' }}
                    >
                      <History size={15} color="#00e699" />
                      <span>History</span>
                    </NavLink>
                    <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', margin: '4px 0' }} />
                    <NavLink
                      to="/partners"
                      className="nav-link"
                      style={{ padding: '8px 12px', fontSize: '0.84rem', color: 'var(--accent)' }}
                    >
                      <Handshake size={15} color="var(--accent)" />
                      <span>For Partners</span>
                    </NavLink>
                    <NavLink
                      to="/about"
                      className="nav-link"
                      style={{ padding: '8px 12px', fontSize: '0.84rem' }}
                    >
                      <Info size={15} />
                      <span>About FAR</span>
                    </NavLink>
                    <NavLink
                      to="/contact"
                      className="nav-link"
                      style={{ padding: '8px 12px', fontSize: '0.84rem' }}
                    >
                      <Phone size={15} />
                      <span>Contact Us</span>
                    </NavLink>
                  </div>
                )}
              </div>
            </nav>
          )}

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isAuthenticated ? (
              <>
                {/* Credits Balance Pill — always visible */}
                <Link
                  to="/recharge"
                  title="Redeem Recharge"
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
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  <Coins size={16} />
                  <span>{user?.credit_balance ?? 0}</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>CR</span>
                </Link>

                {/* Admin badge — hidden on mobile, accessible via side drawer */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="btn btn-secondary nav-desktop-only"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    title="Control Panel"
                  >
                    <ShieldCheck size={16} color="#00d2d3" />
                    <span>Admin</span>
                  </Link>
                )}

                {/* Profile link + Logout — hidden on mobile, accessible via side drawer */}
                <div className="nav-desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Link
                    to="/profile"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      background: 'var(--bg-surface)',
                      textDecoration: 'none',
                      color: '#fff',
                    }}
                    title="My Profile"
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
              /* Guest links — hidden on mobile, show only hamburger */
              <>
                <div className="nav-desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Link
                    to="/partners"
                    style={{
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      color: 'var(--accent)',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      background: 'rgba(0, 238, 253, 0.08)',
                      border: '1px solid rgba(0, 238, 253, 0.3)',
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    🤝 For Partners
                  </Link>
                  <Link
                    to="/about"
                    style={{
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      color: 'var(--text-sub)',
                      padding: '8px 6px',
                      textDecoration: 'none',
                    }}
                  >
                    About
                  </Link>
                  <Link
                    to="/contact"
                    style={{
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      color: 'var(--text-sub)',
                      padding: '8px 6px',
                      textDecoration: 'none',
                    }}
                  >
                    Contact
                  </Link>
                  <Link
                    to="/login"
                    style={{
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      padding: '8px 10px',
                      textDecoration: 'none',
                    }}
                  >
                    Log In
                  </Link>
                  <Link to="/register" className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.88rem' }}>
                    Join Free
                  </Link>
                </div>
              </>
            )}

            {/* Hamburger — always visible on all screen sizes */}
            <button
              type="button"
              onClick={() => setSideDrawerOpen(!sideDrawerOpen)}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-glass)',
                borderRadius: '8px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              title="Open Navigation Menu"
            >
              {sideDrawerOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out Side Drawer Navigation (Available across devices) */}
      {sideDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          onClick={() => setSideDrawerOpen(false)}
        >
          <div
            style={{
              width: '320px',
              maxWidth: '85vw',
              height: '100%',
              background: '#040711',
              borderLeft: '1px solid rgba(0, 238, 253, 0.25)',
              boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.9)',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Drawer Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <Link to="/" onClick={() => setSideDrawerOpen(false)}>
                  <img src="/far-logo-md.png" alt="FAR" style={{ height: '42px' }} />
                </Link>
                <button
                  type="button"
                  onClick={() => setSideDrawerOpen(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* User Balance Card in Drawer */}
              {isAuthenticated && user && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(253, 203, 110, 0.15) 0%, rgba(22, 27, 34, 0.8) 100%)',
                    border: '1px solid rgba(253, 203, 110, 0.3)',
                    borderRadius: '14px',
                    padding: '14px 16px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Wallet Balance</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fdcb6e' }}>
                      {user.credit_balance ?? 0} <span style={{ fontSize: '0.8rem' }}>CR</span>
                    </div>
                  </div>
                  <Link
                    to="/recharge"
                    onClick={() => setSideDrawerOpen(false)}
                    className="btn btn-accent"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    Redeem
                  </Link>
                </div>
              )}

              {/* Drawer Links */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {isAuthenticated ? (
                  <>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', margin: '8px 0 4px 6px' }}>
                      Main Menu
                    </div>
                    <NavLink
                      to="/dashboard"
                      className="nav-link"
                      onClick={() => setSideDrawerOpen(false)}
                    >
                      <LayoutDashboard size={18} color="var(--accent)" />
                      <span>Dashboard</span>
                    </NavLink>
                    <NavLink
                      to="/tasks"
                      className="nav-link"
                      onClick={() => setSideDrawerOpen(false)}
                    >
                      <CheckSquare size={18} color="#00e699" />
                      <span>Earn Tasks</span>
                    </NavLink>
                    <NavLink
                      to="/referrals"
                      className="nav-link"
                      onClick={() => setSideDrawerOpen(false)}
                    >
                      <Users size={18} color="#ff7675" />
                      <span>Invite (5X Bonus)</span>
                    </NavLink>
                    <NavLink
                      to="/recharge"
                      className="nav-link"
                      onClick={() => setSideDrawerOpen(false)}
                    >
                      <Smartphone size={18} color="#00d2d3" />
                      <span>Redeem Recharge</span>
                    </NavLink>
                    <NavLink
                      to="/multiply"
                      className="nav-link"
                      style={{ color: '#fde502' }}
                      onClick={() => setSideDrawerOpen(false)}
                    >
                      <Dices size={18} color="#fde502" />
                      <span>Multiplier Game</span>
                    </NavLink>

                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', margin: '14px 0 4px 6px' }}>
                      Activity &amp; Community
                    </div>
                    <NavLink
                      to="/leaderboard"
                      className="nav-link"
                      onClick={() => setSideDrawerOpen(false)}
                    >
                      <Trophy size={18} color="#fdcb6e" />
                      <span>Leaderboard</span>
                    </NavLink>
                    <NavLink
                      to="/history"
                      className="nav-link"
                      onClick={() => setSideDrawerOpen(false)}
                    >
                      <History size={18} color="#00e699" />
                      <span>Transaction History</span>
                    </NavLink>

                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', margin: '14px 0 4px 6px' }}>
                      Explore &amp; Support
                    </div>
                    <NavLink
                      to="/partners"
                      className="nav-link"
                      style={{ color: 'var(--accent)' }}
                      onClick={() => setSideDrawerOpen(false)}
                    >
                      <Handshake size={18} />
                      <span>For Partners &amp; Creators</span>
                    </NavLink>
                    <NavLink
                      to="/about"
                      className="nav-link"
                      onClick={() => setSideDrawerOpen(false)}
                    >
                      <Info size={18} />
                      <span>About FAR</span>
                    </NavLink>
                    <NavLink
                      to="/contact"
                      className="nav-link"
                      onClick={() => setSideDrawerOpen(false)}
                    >
                      <Phone size={18} />
                      <span>Contact Us</span>
                    </NavLink>
                    <NavLink
                      to="/profile"
                      className="nav-link"
                      onClick={() => setSideDrawerOpen(false)}
                    >
                      <User size={18} />
                      <span>My Profile</span>
                    </NavLink>
                    {isAdmin && (
                      <NavLink
                        to="/admin"
                        className="nav-link"
                        style={{ color: '#00d2d3' }}
                        onClick={() => setSideDrawerOpen(false)}
                      >
                        <ShieldCheck size={18} />
                        <span>Control Panel</span>
                      </NavLink>
                    )}
                  </>
                ) : (
                  <>
                    <NavLink
                      to="/partners"
                      className="nav-link"
                      style={{ color: 'var(--accent)' }}
                      onClick={() => setSideDrawerOpen(false)}
                    >
                      <Handshake size={18} />
                      <span>For Partners</span>
                    </NavLink>
                    <NavLink
                      to="/about"
                      className="nav-link"
                      onClick={() => setSideDrawerOpen(false)}
                    >
                      <Info size={18} />
                      <span>About Us</span>
                    </NavLink>
                    <NavLink
                      to="/contact"
                      className="nav-link"
                      onClick={() => setSideDrawerOpen(false)}
                    >
                      <Phone size={18} />
                      <span>Contact Support</span>
                    </NavLink>
                    <NavLink
                      to="/login"
                      className="nav-link"
                      onClick={() => setSideDrawerOpen(false)}
                    >
                      <User size={18} />
                      <span>Log In</span>
                    </NavLink>
                    <NavLink
                      to="/register"
                      className="btn btn-primary"
                      style={{ textAlign: 'center', marginTop: '10px' }}
                      onClick={() => setSideDrawerOpen(false)}
                    >
                      Join Free
                    </NavLink>
                  </>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            {isAuthenticated && (
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setSideDrawerOpen(false);
                    handleLogout();
                  }}
                  className="btn btn-secondary"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
