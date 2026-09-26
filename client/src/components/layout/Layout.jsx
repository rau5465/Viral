import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileNav from './MobileNav';

const Layout = ({ children }) => {
  return (
    <div className="layout-root">
      <Navbar />
      <main className="layout-main">
        {children}
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
};

export default Layout;
