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
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [securityModalReason, setSecurityModalReason] = useState('signup'); // 'signup' | 'logout' | 'manual'

  // Admin Impersonation state
  const [isImpersonating, setIsImpersonating] = useState(() => {
    return !!localStorage.getItem('vr_admin_impersonator_token');
  });
  const [impersonatorAdmin, setImpersonatorAdmin] = useState(() => {
    const savedAdmin = localStorage.getItem('vr_admin_impersonator_user');
    return savedAdmin ? JSON.parse(savedAdmin) : null;
  });

  // Start impersonating regular user (preserves admin session)
  const startImpersonation = (targetUserData, accessToken, refreshToken) => {
    // Save current admin credentials to backup keys
    if (!localStorage.getItem('vr_admin_impersonator_token') && token) {
      localStorage.setItem('vr_admin_impersonator_token', token);
      const currRefresh = localStorage.getItem('vr_refresh_token');
      if (currRefresh) localStorage.setItem('vr_admin_impersonator_refresh_token', currRefresh);
      if (user) localStorage.setItem('vr_admin_impersonator_user', JSON.stringify(user));
      setImpersonatorAdmin(user);
    }

    // Switch active credentials to target user
    setUser(targetUserData);
    setToken(accessToken);
    localStorage.setItem('vr_user', JSON.stringify(targetUserData));
    localStorage.setItem('vr_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('vr_refresh_token', refreshToken);
    }
    setIsImpersonating(true);
  };

  // Exit impersonation and restore original admin session
  const stopImpersonation = () => {
    const savedAdminToken = localStorage.getItem('vr_admin_impersonator_token');
    const savedAdminRefresh = localStorage.getItem('vr_admin_impersonator_refresh_token');
    const savedAdminUserStr = localStorage.getItem('vr_admin_impersonator_user');

    if (savedAdminToken && savedAdminUserStr) {
      const savedAdminUser = JSON.parse(savedAdminUserStr);
      // Restore admin session
      localStorage.setItem('vr_token', savedAdminToken);
      localStorage.setItem('vr_user', JSON.stringify(savedAdminUser));
      if (savedAdminRefresh) {
        localStorage.setItem('vr_refresh_token', savedAdminRefresh);
      } else {
        localStorage.removeItem('vr_refresh_token');
      }

      // Clean up impersonation backup keys
      localStorage.removeItem('vr_admin_impersonator_token');
      localStorage.removeItem('vr_admin_impersonator_refresh_token');
      localStorage.removeItem('vr_admin_impersonator_user');

      setUser(savedAdminUser);
      setToken(savedAdminToken);
      setIsImpersonating(false);
      setImpersonatorAdmin(null);
      return savedAdminUser;
    } else {
      // Fallback: full logout
      logout(true);
      return null;
    }
  };

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

  const openSecurityModal = (reason = 'manual') => {
    setSecurityModalReason(reason);
    setSecurityModalOpen(true);
  };

  const closeSecurityModal = () => {
    setSecurityModalOpen(false);
  };

  const logout = async (force = false) => {
    // Intercept logout if user has not set their 2 security questions!
    if (!force && user && !user.security_questions_set) {
      setSecurityModalReason('logout');
      setSecurityModalOpen(true);
      return false; // Prevent logout
    }

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
      localStorage.removeItem('vr_admin_impersonator_token');
      localStorage.removeItem('vr_admin_impersonator_refresh_token');
      localStorage.removeItem('vr_admin_impersonator_user');
      setIsImpersonating(false);
      setImpersonatorAdmin(null);
      sessionStorage.removeItem('far_post_signup_save_app');
      sessionStorage.removeItem('far_prompt_security_questions');
    }
    return true;
  };

  const refreshUser = async () => {
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const res = await apiService.getProfile();
      if (res && res.user) {
        setUser(res.user);
        localStorage.setItem('vr_user', JSON.stringify(res.user));
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem('vr_user');
        localStorage.removeItem('vr_token');
        localStorage.removeItem('vr_refresh_token');
      }
    } catch (err) {
      // Only clear session if explicitly unauthenticated (401) or invalid token
      const isUnauthorized =
        err?.status === 401 ||
        err?.statusCode === 401 ||
        err?.response?.status === 401 ||
        err?.message?.includes('not logged in') ||
        err?.message?.includes('jwt') ||
        err?.message?.includes('token');

      if (isUnauthorized) {
        setUser(null);
        setToken(null);
        localStorage.removeItem('vr_user');
        localStorage.removeItem('vr_token');
        localStorage.removeItem('vr_refresh_token');
      }
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

  useEffect(() => {
    if (user && !user.security_questions_set) {
      const promptSignup = sessionStorage.getItem('far_prompt_security_questions');
      if (promptSignup) {
        // Trigger security question modal after post-signup app modal
        const t = setTimeout(() => {
          setSecurityModalReason('signup');
          setSecurityModalOpen(true);
        }, 1200);
        return () => clearTimeout(t);
      }
    }
  }, [user]);

  const value = {
    user,
    setUser,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin',
    securityModalOpen,
    securityModalReason,
    openSecurityModal,
    closeSecurityModal,
    handleAuthSuccess,
    logout,
    refreshUser,
    updateUserBalance,
    isImpersonating,
    impersonatorAdmin,
    startImpersonation,
    stopImpersonation,
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
