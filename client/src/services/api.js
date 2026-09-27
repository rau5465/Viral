import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Bearer token if present
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vr_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
API.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('vr_refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post('/api/auth/refresh-token', { refreshToken });
          if (res.data && res.data.token) {
            localStorage.setItem('vr_token', res.data.token);
            originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
            return API(originalRequest);
          }
        } catch (_err) {
          localStorage.removeItem('vr_token');
          localStorage.removeItem('vr_refresh_token');
          localStorage.removeItem('vr_user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error.response ? error.response.data : error);
  }
);

export const apiService = {
  // Auth
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  sendOtp: (data) => API.post('/auth/send-otp', data),
  verifyOtp: (data) => API.post('/auth/verify-otp', data),
  forgotPassword: (data) => API.post('/auth/forgot-password', data),
  resetPassword: (data) => API.post('/auth/reset-password', data),
  googleAuth: (data) => API.post('/auth/google', data),
  logout: () => {
    const refreshToken = localStorage.getItem('vr_refresh_token');
    return API.post('/auth/logout', { refreshToken });
  },

  // User
  getDashboard: () => API.get('/user/dashboard'),
  getProfile: () => API.get('/user/profile'),
  updateProfile: (data) => API.put('/user/profile', data),
  getBalance: () => API.get('/user/balance'),

  // Tasks (Intelligent Client-Side Caching with 304 Versioning)
  getTasksVersion: () => API.get('/tasks/version'),
  getTasks: async (forceRefresh = false) => {
    const cachedVersion = localStorage.getItem('vr_tasks_version');
    const cachedTasksRaw = localStorage.getItem('vr_tasks_cache');

    const params = {};
    if (!forceRefresh && cachedVersion && cachedTasksRaw) {
      params.version = cachedVersion;
    }

    try {
      const res = await API.get('/tasks', { params });

      // If server confirms tasks haven't changed, reuse mobile cached tasks
      if (res.notModified && cachedTasksRaw) {
        const cachedTasks = JSON.parse(cachedTasksRaw);
        const completionMap = res.completionsToday || {};
        const freshTasks = cachedTasks.map((t) => {
          const userDoneCount = completionMap[t.id] || 0;
          return {
            ...t,
            completionsToday: userDoneCount,
            isAvailable: t.dailyLimit === 0 || userDoneCount < t.dailyLimit,
          };
        });

        return {
          fromCache: true,
          version: res.version,
          tasks: freshTasks,
        };
      }

      // New task catalog or forced refresh: update device local storage
      if (res.tasks) {
        localStorage.setItem('vr_tasks_cache', JSON.stringify(res.tasks));
        localStorage.setItem('vr_tasks_version', res.version);
      }

      return {
        fromCache: false,
        version: res.version,
        tasks: res.tasks,
      };
    } catch (err) {
      // Offline fallback: load from phone cache if available
      if (cachedTasksRaw) {
        console.warn('⚠️ Offline mode: loading cached tasks from device storage');
        return {
          fromCache: true,
          version: cachedVersion,
          tasks: JSON.parse(cachedTasksRaw),
        };
      }
      throw err;
    }
  },
  getTaskDetails: (id) => API.get(`/tasks/${id}`),
  startTask: (id) => API.post(`/tasks/${id}/start`),
  completeTask: (id, verificationData = {}) => API.post(`/tasks/${id}/complete`, { verificationData }),

  // Referrals
  getReferralStats: () => API.get('/referrals'),
  getReferralLink: () => API.get('/referrals/link'),
  getLeaderboard: (limit = 10) => API.get(`/referrals/leaderboard?limit=${limit}`),
  getBonusStatus: () => API.get('/referrals/bonus-status'),

  // Recharges
  getPlans: () => API.get('/recharges/plans'),
  redeemRecharge: (data) => API.post('/recharges/redeem', data),
  getRechargeHistory: () => API.get('/recharges/history'),

  // Transactions
  getTransactions: (params = {}) => API.get('/transactions', { params }),
  getTransactionSummary: () => API.get('/transactions/summary'),

  // YouTube Verification
  getYouTubeChannels: () => API.get('/youtube/channels'),
  getYouTubeSubscriptionStatus: (channelId) => API.get(`/youtube/subscription-status/${channelId}`),
  verifyAndClaimYouTube: (channelId) => API.post(`/youtube/verify-and-claim/${channelId}`),
  getYouTubeAuthUrl: () => API.get('/youtube/auth-url'),
  getYouTubeStatus: () => API.get('/youtube/status'),
  disconnectYouTube: () => API.post('/youtube/disconnect'),
  verifyAllYouTube: () => API.post('/youtube/verify-all'),
  addYouTubeChannel: (data) => API.post('/youtube/partner/channels', data),
  updateYouTubeChannel: (id, data) => API.put(`/youtube/partner/channels/${id}`, data),
  deleteYouTubeChannel: (id) => API.delete(`/youtube/partner/channels/${id}`),

  // Admin
  getAdminStats: () => API.get('/admin/dashboard'),
  getAdminUsers: (params = {}) => API.get('/admin/users', { params }),
  updateAdminUser: (id, data) => API.put(`/admin/users/${id}`, data),
  getAdminTasks: () => API.get('/admin/tasks'),
  createAdminTask: (data) => API.post('/admin/tasks', data),
  updateAdminTask: (id, data) => API.put(`/admin/tasks/${id}`, data),
  deleteAdminTask: (id) => API.delete(`/admin/tasks/${id}`),
  clearAdminTasksCache: () => API.post('/admin/tasks/clear-cache'),
  getAdminRecharges: (params = {}) => API.get('/admin/recharges', { params }),
  updateAdminRecharge: (id, data) => API.put(`/admin/recharges/${id}`, data),
  getAdminAnnouncements: () => API.get('/admin/announcements'),
  createAdminAnnouncement: (data) => API.post('/admin/announcements', data),
  deleteAdminAnnouncement: (id) => API.delete(`/admin/announcements/${id}`),
  getAdminAnalytics: () => API.get('/admin/analytics'),
  getAdminLogs: () => API.get('/admin/logs'),

  // Contact Inquiries
  submitContact: (formData) =>
    API.post('/contact', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAdminContacts: (params = {}) => API.get('/contact/admin', { params }),
  updateAdminContactStatus: (id, status) => API.patch(`/contact/admin/${id}/status`, { status }),
  deleteAdminContact: (id) => API.delete(`/contact/admin/${id}`),

  // Multiply HI-LO Game
  rollMultiply: (data) => API.post('/multiply/roll', data),
  getMyRolls: () => API.get('/multiply/my-rolls'),
  getLiveRolls: () => API.get('/multiply/live-rolls'),
  getMultiplyStats: () => API.get('/multiply/stats'),

  // Platform Settings & Credit Rate
  getCreditRate: () => API.get('/settings/credit-rate'),
  updateCreditRate: (data) => API.put('/settings/credit-rate', data),

  // Maintenance Mode
  getMaintenanceMode: () => API.get('/settings/maintenance'),
  updateMaintenanceMode: (data) => API.put('/settings/maintenance', data),

  // Cache Management
  clearPlatformCache: () => API.post('/settings/cache/clear'),
};

export default API;
