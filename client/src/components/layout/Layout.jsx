import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileNav from './MobileNav';

const Layout = ({ children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1, paddingBottom: '30px' }}>
        {children}
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
};

export default Layout;
