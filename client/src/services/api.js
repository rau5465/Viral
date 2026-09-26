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

  // Tasks
  getTasks: () => API.get('/tasks'),
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
  getAdminRecharges: (params = {}) => API.get('/admin/recharges', { params }),
  updateAdminRecharge: (id, data) => API.put(`/admin/recharges/${id}`, data),
  getAdminAnnouncements: () => API.get('/admin/announcements'),
  createAdminAnnouncement: (data) => API.post('/admin/announcements', data),
  deleteAdminAnnouncement: (id) => API.delete(`/admin/announcements/${id}`),
  getAdminAnalytics: () => API.get('/admin/analytics'),
  getAdminLogs: () => API.get('/admin/logs'),
};

export default API;
