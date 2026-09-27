import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('vr_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('vr_token'));
  const [loading, setLoading] = useState(true);

  // Sync state with local storage
  const handleAuthSuccess = (userData, accessToken, refreshToken) => {
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem('vr_user', JSON.stringify(userData));
    localStorage.setItem('vr_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('vr_refresh_token', refreshToken);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (_err) {
      // Ignore error during logout
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('vr_user');
      localStorage.removeItem('vr_token');
      localStorage.removeItem('vr_refresh_token');
    }
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await apiService.getProfile();
      if (res && res.user) {
        setUser(res.user);
        localStorage.setItem('vr_user', JSON.stringify(res.user));
      }
    } catch (_err) {
      // If profile fails due to 401, interceptor will clear session
    }
  };

  useEffect(() => {
    if (token) {
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const updateUserBalance = (newBalance) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, credit_balance: Number(newBalance) };
      try {
        localStorage.setItem('vr_user', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin',
    handleAuthSuccess,
    logout,
    refreshUser,
    updateUserBalance,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
