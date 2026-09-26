import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/layout/Layout';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Layout>
            <AppRoutes />
          </Layout>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
