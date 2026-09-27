import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/layout/Layout';
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from './components/common/ScrollToTop';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ScrollToTop />
          <Layout>
            <AppRoutes />
          </Layout>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
