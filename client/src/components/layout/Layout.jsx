import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileNav from './MobileNav';
import InstallAppBanner from '../common/InstallAppBanner';

const Layout = ({ children }) => {
  return (
    <div className="layout-root">
      <Navbar />
      <main className="layout-main">
        {children}
      </main>
      <Footer />
      <MobileNav />
      <InstallAppBanner />
    </div>
  );
};

export default Layout;
