import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

/**
 * MaintenanceBanner — shows a dismissible maintenance alert to non-admin users
 * when maintenance mode is enabled by admin.
 * Admin users see a small reminder badge but can continue using the app.
 */
const MaintenanceBanner = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [maintenance, setMaintenance] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await apiService.getMaintenanceMode();
        if (res?.maintenance) {
          setMaintenance(res.maintenance);
        }
      } catch (_err) {
        // Silently fail
      }
    };

    fetchStatus();
    // Poll every 2 minutes so users see updates without full page reload
    const interval = setInterval(fetchStatus, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!maintenance?.enabled || dismissed) return null;

  // Admin sees a small, non-blocking badge
  if (isAdmin) {
    return (
      <div style={{
        background: 'rgba(251, 191, 36, 0.15)',
        border: '1px solid rgba(251, 191, 36, 0.4)',
        borderLeft: '4px solid #fbbf24',
        padding: '6px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.8rem',
        color: '#fbbf24',
        justifyContent: 'space-between',
      }}>
        <span>⚠️ <strong>Maintenance Mode is ON</strong> — Users see a maintenance screen.</span>
        <button
          onClick={() => setDismissed(true)}
          style={{ background: 'none', border: 'none', color: '#fbbf24', cursor: 'pointer', fontSize: '0.85rem' }}
        >
          ✕
        </button>
      </div>
    );
  }

  // Non-admin logged-in users see a full-screen maintenance overlay
  if (isAuthenticated) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '24px',
        color: '#e2e8f0',
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔧</div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '12px', color: '#fbbf24' }}>
          Under Maintenance
        </h1>
        <p style={{ fontSize: '1rem', color: '#94a3b8', maxWidth: '480px', lineHeight: 1.6 }}>
          {maintenance.message}
        </p>
        <p style={{ marginTop: '20px', fontSize: '0.8rem', color: '#4a5568' }}>
          Please check back later.
        </p>
      </div>
    );
  }

  // Guests (not logged in) also see the full-screen maintenance overlay
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(0,0,0,0.92)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '24px',
      color: '#e2e8f0',
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔧</div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '12px', color: '#fbbf24' }}>
        Under Maintenance
      </h1>
      <p style={{ fontSize: '1rem', color: '#94a3b8', maxWidth: '480px', lineHeight: 1.6 }}>
        {maintenance.message}
      </p>
      <p style={{ marginTop: '20px', fontSize: '0.8rem', color: '#4a5568' }}>
        Please check back later.
      </p>
    </div>
  );
};

export default MaintenanceBanner;
