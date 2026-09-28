import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ShieldAlert, LogOut, ExternalLink, UserCheck, AlertTriangle } from 'lucide-react';

/**
 * ImpersonationBanner
 * Sticky notification bar rendered at the very top of the app when an Admin
 * is currently browsing as a simulated/impersonated regular user.
 * Provides instant visibility, target user details, and 1-click exit back to Admin panel.
 */
const ImpersonationBanner = () => {
  const { isImpersonating, impersonatorAdmin, stopImpersonation, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [exiting, setExiting] = useState(false);

  if (!isImpersonating) return null;

  const handleExit = () => {
    setExiting(true);
    try {
      const restoredAdmin = stopImpersonation();
      const adminName = restoredAdmin?.full_name || impersonatorAdmin?.full_name || 'Administrator';
      toast.success(`Exited impersonation mode. Welcome back, ${adminName}!`);
      navigate('/admin?tab=users');
    } catch (err) {
      toast.error('Failed to exit impersonation mode cleanly.');
    } finally {
      setExiting(false);
    }
  };

  return (
    <div
      className="impersonation-top-banner"
      style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        background: 'linear-gradient(90deg, #7928ca 0%, #ff0080 50%, #7928ca 100%)',
        backgroundSize: '200% 100%',
        animation: 'impersonateGradient 8s ease infinite',
        color: '#ffffff',
        padding: '8px 16px',
        boxShadow: '0 4px 20px rgba(121, 40, 202, 0.45)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        fontSize: '0.85rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            backgroundColor: 'rgba(0, 0, 0, 0.35)',
            padding: '4px 10px',
            borderRadius: '20px',
            fontWeight: 800,
            letterSpacing: '0.5px',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          <ShieldAlert size={14} color="#ffd166" />
          Admin Impersonation Mode
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem' }}>
          <span>Viewing as:</span>
          <strong
            style={{
              color: '#ffffff',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              padding: '2px 8px',
              borderRadius: '6px',
              fontWeight: 700,
            }}
          >
            {user?.full_name || 'Regular User'}
          </strong>
          <span style={{ opacity: 0.9, fontSize: '0.8rem' }}>
            ({user?.mobile ? `+91 ${user.mobile}` : user?.email})
          </span>
          <span
            style={{
              color: '#00ffa3',
              fontWeight: 800,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              padding: '2px 8px',
              borderRadius: '6px',
              marginLeft: '4px',
            }}
          >
            💰 {user?.credit_balance ?? 0} CR
          </span>
        </div>

        {impersonatorAdmin && (
          <span style={{ opacity: 0.8, fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            (Admin: <strong>{impersonatorAdmin.full_name}</strong>)
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          onClick={handleExit}
          disabled={exiting}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#ffffff',
            color: '#111827',
            border: 'none',
            padding: '6px 14px',
            borderRadius: '6px',
            fontWeight: 800,
            fontSize: '0.8rem',
            cursor: exiting ? 'wait' : 'pointer',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
            transition: 'all 0.15s ease-in-out',
          }}
          title="Exit impersonation mode and return to Admin Dashboard"
        >
          <LogOut size={14} color="#e11d48" />
          <span>{exiting ? 'Exiting...' : 'Exit Impersonation'}</span>
        </button>
      </div>
    </div>
  );
};

export default ImpersonationBanner;
