import React, { useEffect, useRef } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileNav from './MobileNav';
import InstallAppBanner from '../common/InstallAppBanner';
import PostSignupInstallModal from '../common/PostSignupInstallModal';
import SecurityQuestionsModal from '../common/SecurityQuestionsModal';
import MultiplyPromoModal from '../common/MultiplyPromoModal';
import AnnouncementTicker from '../common/AnnouncementTicker';
import MaintenanceBanner from '../common/MaintenanceBanner';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';

const Layout = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const lastHeartbeatRef = useRef(0);

  // Ultra-optimized live user presence tracking:
  // - Interval is 90 seconds (low overhead)
  // - Pauses when browser tab is inactive / minimized (visibilitychange)
  // - Heartbeat payload is minimal (< 50 bytes)
  useEffect(() => {
    // Generate or reuse client fingerprint ID in localStorage
    let clientId = localStorage.getItem('far_client_id');
    if (!clientId) {
      clientId = 'c_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
      localStorage.setItem('far_client_id', clientId);
    }

    const sendPulse = () => {
      // Don't send if tab is hidden (saves bandwidth and server CPU)
      if (document.visibilityState === 'hidden') return;

      const now = Date.now();
      // Throttle minimum 45s between pulses
      if (now - lastHeartbeatRef.current < 45000) return;
      lastHeartbeatRef.current = now;

      apiService.sendHeartbeat(clientId).catch(() => {
        // Silently fail without impacting user experience
      });
    };

    // Send initial pulse on page load
    sendPulse();

    // Pulse every 90 seconds while active
    const interval = setInterval(sendPulse, 90000);

    // Also pulse when user switches back to this tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sendPulse();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated]);

  return (
    <div className="layout-root">
      {/* Top Navbar & Notice Banner — hidden for Admin, active for users and guests */}
      {!isAdmin && <Navbar />}
      {!isAdmin && <AnnouncementTicker />}

      {/* Maintenance mode banner — shows system-wide alerts */}
      <MaintenanceBanner />

      <main className="layout-main">
        {children}
      </main>

      {/* Footer only for guests / logged-out users */}
      {!isAuthenticated && <Footer />}
      {!isAdmin && <MobileNav />}
      {!isAdmin && <InstallAppBanner />}
      {!isAdmin && <PostSignupInstallModal />}
      <SecurityQuestionsModal />
      {!isAdmin && <MultiplyPromoModal />}
    </div>
  );
};

export default Layout;
