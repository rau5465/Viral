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
  const [drawerClosing, setDrawerClosing] = useState(false);
  const dropdownRef = useRef(null);

  // Animated close: trigger slide-out, then unmount after animation completes
  const closeDrawer = () => {
    setDrawerClosing(true);
    setTimeout(() => {
      setSideDrawerOpen(false);
      setDrawerClosing(false);
    }, 280); // match CSS animation duration
  };

  // Close menus when route changes
  useEffect(() => {
    setMoreMenuOpen(false);
    if (sideDrawerOpen) closeDrawer();
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
              onClick={() => sideDrawerOpen ? closeDrawer() : setSideDrawerOpen(true)}
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

      {/* Slide-out Side Drawer Navigation */}
      {sideDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: drawerClosing ? 'rgba(0,0,0,0)' : 'rgba(0, 0, 0, 0.72)',
            backdropFilter: drawerClosing ? 'blur(0px)' : 'blur(5px)',
            display: 'flex',
            justifyContent: 'flex-end',
            transition: 'background 0.28s ease, backdrop-filter 0.28s ease',
          }}
          onClick={closeDrawer}
        >
          <div
            style={{
              width: '300px',
              maxWidth: '85vw',
              height: '100%',
              background: 'linear-gradient(160deg, #070d1a 0%, #040711 100%)',
              borderLeft: '1px solid rgba(0, 238, 253, 0.2)',
              boxShadow: '-12px 0 50px rgba(0, 0, 0, 0.95)',
              padding: '20px 18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflowY: 'auto',
              animation: drawerClosing
                ? 'drawerSlideOut 0.28s cubic-bezier(0.4, 0, 1, 1) forwards'
                : 'drawerSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Drawer Header — Logo + Close */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <Link to="/" onClick={closeDrawer}>
                  <img src="/far-logo-md.png" alt="FAR" style={{ height: '38px' }} />
                </Link>
                <button
                  type="button"
                  onClick={closeDrawer}
                  style={{
                    background: 'rgba(255, 255, 255, 0.07)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  <X size={17} />
                </button>
              </div>

              {/* User Identity + Wallet Card */}
              {isAuthenticated && user && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(253,203,110,0.13) 0%, rgba(10,15,30,0.9) 100%)',
                    border: '1px solid rgba(253, 203, 110, 0.28)',
                    borderRadius: '14px',
                    padding: '14px 15px',
                    marginBottom: '18px',
                  }}
                >
                  {/* Username row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: 'rgba(0, 238, 253, 0.15)',
                      border: '1px solid rgba(0,238,253,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <User size={15} color="var(--accent)" />
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', lineHeight: 1 }}>Logged in as</div>
                      <div style={{
                        fontSize: '0.95rem', fontWeight: 700, color: '#fff',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {user.full_name || 'User'}
                      </div>
                    </div>
                  </div>

                  {/* Wallet balance + Redeem row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Wallet Balance</div>
                      <div style={{
                        fontSize: '1.35rem', fontWeight: 800, color: '#fdcb6e',
                        whiteSpace: 'nowrap', lineHeight: 1.1,
                        display: 'flex', alignItems: 'baseline', gap: '4px',
                      }}>
                        <span>{user.credit_balance ?? 0}</span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, opacity: 0.85 }}>CR</span>
                      </div>
                    </div>
                    <Link
                      to="/recharge"
                      onClick={closeDrawer}
                      className="btn btn-accent"
                      style={{ padding: '6px 13px', fontSize: '0.8rem', flexShrink: 0, whiteSpace: 'nowrap' }}
                    >
                      Redeem
                    </Link>
                  </div>
                </div>
              )}

              {/* Drawer Nav Links */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {isAuthenticated ? (
                  <>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', margin: '6px 0 4px 6px', letterSpacing: '0.06em' }}>
                      Main Menu
                    </div>
                    <NavLink to="/dashboard" className="nav-link" onClick={closeDrawer}>
                      <LayoutDashboard size={17} color="var(--accent)" />
                      <span>Dashboard</span>
                    </NavLink>
                    <NavLink to="/tasks" className="nav-link" onClick={closeDrawer}>
                      <CheckSquare size={17} color="#00e699" />
                      <span>Earn Tasks</span>
                    </NavLink>
                    <NavLink to="/referrals" className="nav-link" onClick={closeDrawer}>
                      <Users size={17} color="#ff7675" />
                      <span>Invite (5X Bonus)</span>
                    </NavLink>
                    <NavLink to="/recharge" className="nav-link" onClick={closeDrawer}>
                      <Smartphone size={17} color="#00d2d3" />
                      <span>Redeem Recharge</span>
                    </NavLink>
                    <NavLink to="/multiply" className="nav-link" style={{ color: '#fde502' }} onClick={closeDrawer}>
                      <Dices size={17} color="#fde502" />
                      <span>Multiplier Game</span>
                    </NavLink>

                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', margin: '12px 0 4px 6px', letterSpacing: '0.06em' }}>
                      Activity &amp; Community
                    </div>
                    <NavLink to="/leaderboard" className="nav-link" onClick={closeDrawer}>
                      <Trophy size={17} color="#fdcb6e" />
                      <span>Leaderboard</span>
                    </NavLink>
                    <NavLink to="/history" className="nav-link" onClick={closeDrawer}>
                      <History size={17} color="#00e699" />
                      <span>Transaction History</span>
                    </NavLink>

                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', margin: '12px 0 4px 6px', letterSpacing: '0.06em' }}>
                      Explore &amp; Support
                    </div>
                    <NavLink to="/partners" className="nav-link" style={{ color: 'var(--accent)' }} onClick={closeDrawer}>
                      <Handshake size={17} />
                      <span>For Partners &amp; Creators</span>
                    </NavLink>
                    <NavLink to="/about" className="nav-link" onClick={closeDrawer}>
                      <Info size={17} />
                      <span>About FAR</span>
                    </NavLink>
                    <NavLink to="/contact" className="nav-link" onClick={closeDrawer}>
                      <Phone size={17} />
                      <span>Contact Us</span>
                    </NavLink>
                    <NavLink to="/profile" className="nav-link" onClick={closeDrawer}>
                      <User size={17} />
                      <span>My Profile</span>
                    </NavLink>
                    {isAdmin && (
                      <NavLink to="/admin" className="nav-link" style={{ color: '#00d2d3' }} onClick={closeDrawer}>
                        <ShieldCheck size={17} />
                        <span>Control Panel</span>
                      </NavLink>
                    )}
                  </>
                ) : (
                  <>
                    <NavLink to="/partners" className="nav-link" style={{ color: 'var(--accent)' }} onClick={closeDrawer}>
                      <Handshake size={17} />
                      <span>For Partners</span>
                    </NavLink>
                    <NavLink to="/about" className="nav-link" onClick={closeDrawer}>
                      <Info size={17} />
                      <span>About Us</span>
                    </NavLink>
                    <NavLink to="/contact" className="nav-link" onClick={closeDrawer}>
                      <Phone size={17} />
                      <span>Contact Support</span>
                    </NavLink>
                    <NavLink to="/login" className="nav-link" onClick={closeDrawer}>
                      <User size={17} />
                      <span>Log In</span>
                    </NavLink>
                    <NavLink
                      to="/register"
                      className="btn btn-primary"
                      style={{ textAlign: 'center', marginTop: '10px' }}
                      onClick={closeDrawer}
                    >
                      Join Free
                    </NavLink>
                  </>
                )}
              </div>
            </div>

            {/* Drawer Footer — Logout */}
            {isAuthenticated && (
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.07)', paddingTop: '14px', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => { closeDrawer(); handleLogout(); }}
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
