import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileNav from './MobileNav';
import InstallAppBanner from '../common/InstallAppBanner';
import MultiplyPromoModal from '../common/MultiplyPromoModal';
import AnnouncementTicker from '../common/AnnouncementTicker';
import MaintenanceBanner from '../common/MaintenanceBanner';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="layout-root">
      <Navbar />
      {/* Scrolling notice bar — visible to all logged-in users */}
      <AnnouncementTicker />
      {/* Maintenance mode banner — shows system-wide alerts */}
      <MaintenanceBanner />
      <main className="layout-main">
        {children}
      </main>
      {/* Footer only for guests / logged-out users */}
      {!isAuthenticated && <Footer />}
      <MobileNav />
      <InstallAppBanner />
      <MultiplyPromoModal />
    </div>
  );
};

export default Layout;
