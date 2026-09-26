import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Flame, Smartphone, History } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MobileNav = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  const navItems = [
    { to: '/dashboard', label: 'Home', icon: <LayoutDashboard size={20} /> },
    { to: '/tasks', label: 'Earn', icon: <CheckSquare size={20} /> },
    { to: '/referrals', label: '4x Refer', icon: <Flame size={20} color="#ff7675" /> },
    { to: '/recharge', label: 'Redeem', icon: <Smartphone size={20} /> },
    { to: '/history', label: 'History', icon: <History size={20} /> },
  ];

  return (
    <nav
      className="mobile-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 90,
        background: 'rgba(13, 17, 23, 0.95)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border-glass)',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '8px 0',
      }}
    >
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            fontSize: '0.7rem',
            fontWeight: 600,
            color: isActive ? 'var(--accent)' : 'var(--text-muted)',
            textDecoration: 'none',
            padding: '4px 12px',
          })}
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default MobileNav;
