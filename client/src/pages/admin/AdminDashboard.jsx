import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  CheckSquare,
  Smartphone,
  Coins,
  Plus,
  Trash2,
  Search,
  RefreshCw,
  Mail,
  Eye,
  FileImage,
  ExternalLink,
  MessageSquare,
  Filter,
  CheckCircle2,
  Settings,
  Sliders,
  DollarSign,
  Save,
  Wrench,
  ToggleLeft,
  ToggleRight,
  DatabaseZap,
  Copy,
  Terminal,
  Send,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Megaphone,
  History,
  Activity,
  Radio,
  LogOut,
  Menu,
} from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import { WhatsAppIcon } from '../../components/common/WhatsAppIcon';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTabQuery = searchParams.get('tab');
  const [activeTab, setActiveTabState] = useState(currentTabQuery || 'overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (currentTabQuery && currentTabQuery !== activeTab) {
      setActiveTabState(currentTabQuery);
    }
  }, [currentTabQuery]);

  const setActiveTab = (tabId) => {
    setActiveTabState(tabId);
    setSearchParams({ tab: tabId });
  };

  // Live Users & Chart Analytics State
  const [liveStats, setLiveStats] = useState({ liveUsers: 0, liveAuthenticated: 0, liveGuests: 0 });
  const [liveChartRange, setLiveChartRange] = useState('24h');
  const [liveChartData, setLiveChartData] = useState([]);
  const [liveChartLoading, setLiveChartLoading] = useState(false);

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Contacts state
  const [contacts, setContacts] = useState([]);
  const [contactSearch, setContactSearch] = useState('');
  const [contactStatusFilter, setContactStatusFilter] = useState('all');
  const [selectedContact, setSelectedContact] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [activeImageSrc, setActiveImageSrc] = useState(null);

  // Users state
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [creditAdjustment, setCreditAdjustment] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [userModalOpen, setUserModalOpen] = useState(false);

  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    type: 'visit_site',
    url: '',
    instructions: '',
    credits_reward: 10,
    duration_seconds: 30,
    daily_limit: 5,
  });

  // Recharges state
  const [recharges, setRecharges] = useState([]);

  // Announcements state
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '', type: 'info' });

  // Logs state
  const [logs, setLogs] = useState([]);

  // Platform Settings & Credit Rate state
  const [creditRate, setCreditRate] = useState({
    credit_rate_display: '1Rs = 1 Credit',
    rupees: 1,
    credits: 1,
    updated_at: null,
    updated_by: 'System Administrator',
  });
  const [rateEditDisplay, setRateEditDisplay] = useState('1Rs = 1 Credit');
  const [rateRupees, setRateRupees] = useState(1);
  const [rateCredits, setRateCredits] = useState(1);
  const [rateSaving, setRateSaving] = useState(false);

  // Referral Reward Settings state
  const [referralSettings, setReferralSettings] = useState({
    bonus_reward_2h: 50,
    standard_reward: 10,
    target_referrals: 1,
    bonus_window_hours: 2,
    updated_at: null,
    updated_by: 'System Administrator',
  });
  const [refBonus2h, setRefBonus2h] = useState(50);
  const [refStandard, setRefStandard] = useState(10);
  const [refTarget, setRefTarget] = useState(1);
  const [refWindowHours, setRefWindowHours] = useState(2);
  const [refSaving, setRefSaving] = useState(false);

  // Maintenance Mode state
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    'We are currently performing scheduled maintenance. We will be back shortly. Thank you for your patience!'
  );
  const [maintenanceSaving, setMaintenanceSaving] = useState(false);
  const [cacheClearLoading, setCacheClearLoading] = useState(false);

  // WhatsApp wacli Verification state
  const [waSettings, setWaSettings] = useState({
    enabled: true,
    whatsapp_number: '919999999999',
    code_expiry_minutes: 10,
    webhook_secret: '',
    auto_reply: false,
    auto_reply_message: '✅ Your WhatsApp number has been verified for FAR! You can now finish creating your account.',
    wacli_binary_path: 'wacli',
  });
  const [waSaving, setWaSaving] = useState(false);
  const [simMobile, setSimMobile] = useState('');
  const [simCode, setSimCode] = useState('');
  const [simLoading, setSimLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, tasksRes, rechargesRes, annRes, logsRes, contactsRes, rateRes, maintenanceRes, refSettingsRes, waRes] = await Promise.all([
        apiService.getAdminStats(),
        apiService.getAdminUsers(),
        apiService.getAdminTasks(),
        apiService.getAdminRecharges(),
        apiService.getAdminAnnouncements(),
        apiService.getAdminLogs(),
        apiService.getAdminContacts().catch(() => ({ data: { contacts: [] } })),
        apiService.getCreditRate().catch(() => ({ data: { credit_rate: {} } })),
        apiService.getMaintenanceMode().catch(() => ({ maintenance: { enabled: false } })),
        apiService.getReferralSettings().catch(() => ({ data: { referral_settings: {} } })),
        apiService.getWhatsAppVerificationSettings().catch(() => ({ data: { settings: {} } })),
      ]);

      if (waRes.data?.settings) {
        setWaSettings((prev) => ({ ...prev, ...waRes.data.settings }));
      }

      if (statsRes.stats) {
        setStats(statsRes.stats);
        if (statsRes.stats.liveUsers !== undefined) {
          setLiveStats({
            liveUsers: statsRes.stats.liveUsers || 0,
            liveAuthenticated: statsRes.stats.liveAuthenticated || 0,
            liveGuests: statsRes.stats.liveGuests || 0,
          });
        }
      }
      setUsers(usersRes.users || []);
      setTasks(tasksRes.tasks || []);
      setRecharges(rechargesRes.recharges || []);
      setAnnouncements(annRes.announcements || []);
      setLogs(logsRes.logs || []);
      setContacts(contactsRes.data?.contacts || contactsRes.contacts || []);

      const cr = rateRes?.credit_rate || rateRes?.data?.credit_rate;
      if (cr) {
        setCreditRate(cr);
        setRateEditDisplay(cr.credit_rate_display || '1Rs = 1 Credit');
        setRateRupees(cr.rupees || 1);
        setRateCredits(cr.credits || 1);
      }

      const rs = refSettingsRes?.referral_settings || refSettingsRes?.data?.referral_settings;
      if (rs) {
        setReferralSettings(rs);
        setRefBonus2h(rs.bonus_reward_2h ?? 50);
        setRefStandard(rs.standard_reward ?? 10);
        setRefTarget(rs.target_referrals ?? 1);
        setRefWindowHours(rs.bonus_window_hours ?? 2);
      }

      const mnt = maintenanceRes?.maintenance;
      if (mnt) {
        setMaintenanceEnabled(mnt.enabled || false);
        setMaintenanceMessage(mnt.message || maintenanceMessage);
      }
    } catch (err) {
      toast.error('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch live user history for the chart
  const loadLiveChartData = async (range = liveChartRange) => {
    setLiveChartLoading(true);
    try {
      const res = await apiService.getLiveUserAnalytics({ range });
      if (res.data) {
        setLiveChartData(res.data.history || []);
        if (res.data.current) {
          setLiveStats({
            liveUsers: res.data.current.totalLive || 0,
            liveAuthenticated: res.data.current.authenticated || 0,
            liveGuests: res.data.current.guests || 0,
          });
        }
      }
    } catch (_err) {
      // Silent error
    } finally {
      setLiveChartLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    loadLiveChartData(liveChartRange);

    // Refresh live stats and chart every 30s while viewing Admin Panel
    const liveTimer = setInterval(() => {
      loadLiveChartData(liveChartRange);
    }, 30000);

    return () => clearInterval(liveTimer);
  }, []);

  useEffect(() => {
    loadLiveChartData(liveChartRange);
  }, [liveChartRange]);

  // Update Credit Conversion Rate
  const handleSaveCreditRate = async (e) => {
    if (e) e.preventDefault();
    if (!rateEditDisplay.trim()) {
      return toast.warning('Rate display string cannot be empty.');
    }
    setRateSaving(true);
    try {
      const res = await apiService.updateCreditRate({
        rate_display: rateEditDisplay.trim(),
        rupees: Number(rateRupees) || 1,
        credits: Number(rateCredits) || 1,
      });
      const cr = res?.credit_rate || res?.data?.credit_rate;
      if (cr) {
        setCreditRate(cr);
        setRateEditDisplay(cr.credit_rate_display);
      }
      toast.success('Credit conversion rate updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update credit rate.');
    } finally {
      setRateSaving(false);
    }
  };

  // Update Referral Reward Settings (Single Refer in first 2h & After 2h)
  const handleSaveReferralSettings = async (e) => {
    if (e) e.preventDefault();
    setRefSaving(true);
    try {
      const res = await apiService.updateReferralSettings({
        bonus_reward_2h: Number(refBonus2h),
        standard_reward: Number(refStandard),
        target_referrals: 1, // Single Refer policy
        bonus_window_hours: Number(refWindowHours),
      });
      const rs = res?.referral_settings || res?.data?.referral_settings;
      if (rs) {
        setReferralSettings(rs);
        setRefBonus2h(rs.bonus_reward_2h ?? 50);
        setRefStandard(rs.standard_reward ?? 10);
        setRefWindowHours(rs.bonus_window_hours ?? 2);
      }
      toast.success('Referral reward settings updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update referral settings.');
    } finally {
      setRefSaving(false);
    }
  };

  // Update WhatsApp Verification Settings (wacli)
  const handleSaveWaSettings = async (e) => {
    if (e) e.preventDefault();
    setWaSaving(true);
    try {
      const res = await apiService.updateWhatsAppVerificationSettings(waSettings);
      if (res.data?.settings) {
        setWaSettings(res.data.settings);
      }
      toast.success('WhatsApp verification settings updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update WhatsApp settings.');
    } finally {
      setWaSaving(false);
    }
  };

  // Simulate WhatsApp verification for testing
  const handleAdminSimulateVerification = async (e) => {
    if (e) e.preventDefault();
    if (!simMobile || !simCode) {
      return toast.warning('Please enter mobile number and 6-char verification code.');
    }
    setSimLoading(true);
    try {
      const res = await apiService.simulateWhatsAppVerification(simMobile.trim(), simCode.trim());
      if (res.result?.verified) {
        toast.success(`✅ Mobile +91 ${simMobile} verified with code ${simCode}!`);
        setSimCode('');
      } else {
        toast.warning(res.result?.reason || 'Simulation failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Simulation error.');
    } finally {
      setSimLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save Maintenance Mode
  const handleSaveMaintenance = async (e) => {
    if (e) e.preventDefault();
    setMaintenanceSaving(true);
    try {
      const res = await apiService.updateMaintenanceMode({
        enabled: maintenanceEnabled,
        message: maintenanceMessage,
      });
      const mnt = res?.maintenance;
      if (mnt) {
        setMaintenanceEnabled(mnt.enabled);
        setMaintenanceMessage(mnt.message);
      }
      toast.success(`Maintenance mode ${maintenanceEnabled ? 'ENABLED' : 'DISABLED'} successfully!`);
    } catch (err) {
      toast.error(err?.message || 'Failed to update maintenance mode.');
    } finally {
      setMaintenanceSaving(false);
    }
  };

  // Clear Platform Cache
  const handleClearCache = async () => {
    if (!window.confirm('This will clear all platform caches. Users may experience slower responses briefly. Continue?')) return;
    setCacheClearLoading(true);
    try {
      const res = await apiService.clearPlatformCache();
      toast.success(res?.message || 'Platform cache cleared successfully!');
    } catch (err) {
      toast.error(err?.message || 'Failed to clear cache.');
    } finally {
      setCacheClearLoading(false);
    }
  };

  // Search & Filter Contacts
  const handleContactSearch = async (e) => {
    if (e) e.preventDefault();
    try {
      const params = {};
      if (contactSearch.trim()) params.search = contactSearch.trim();
      if (contactStatusFilter !== 'all') params.status = contactStatusFilter;
      const res = await apiService.getAdminContacts(params);
      setContacts(res.data?.contacts || res.contacts || []);
    } catch (err) {
      toast.error('Search contact inquiries failed.');
    }
  };

  // Update Contact Inquiry Status
  const handleUpdateContactStatus = async (id, status) => {
    try {
      await apiService.updateAdminContactStatus(id, status);
      toast.success(`Inquiry marked as ${status}.`);
      setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
      if (selectedContact && selectedContact.id === id) {
        setSelectedContact((prev) => ({ ...prev, status }));
      }
    } catch (err) {
      toast.error('Failed to update inquiry status.');
    }
  };

  // Delete Contact Inquiry
  const handleDeleteContact = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this contact inquiry?')) return;
    try {
      await apiService.deleteAdminContact(id);
      toast.success('Inquiry deleted successfully.');
      setContacts((prev) => prev.filter((c) => c.id !== id));
      if (selectedContact && selectedContact.id === id) {
        setContactModalOpen(false);
        setSelectedContact(null);
      }
    } catch (err) {
      toast.error('Failed to delete inquiry.');
    }
  };

  // Search users
  const handleUserSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await apiService.getAdminUsers({ search: userSearch });
      setUsers(res.users || []);
    } catch (err) {
      toast.error('Search failed.');
    }
  };

  // User Ban / Unban
  const handleToggleBan = async (user) => {
    try {
      await apiService.updateAdminUser(user.id, {
        is_banned: !user.is_banned,
        reason: user.is_banned ? 'Admin unban' : 'Violation of terms',
      });
      toast.success(`User ${user.is_banned ? 'unbanned' : 'banned'} successfully.`);
      loadData();
    } catch (err) {
      toast.error('Failed to update ban status.');
    }
  };

  // Adjust User Credits
  const handleAdjustCredits = async () => {
    if (!creditAdjustment || isNaN(creditAdjustment)) {
      return toast.warning('Enter a valid credit adjustment number.');
    }
    try {
      await apiService.updateAdminUser(selectedUser.id, {
        credit_adjustment: parseInt(creditAdjustment, 10),
        reason: adjustmentReason || 'Admin adjustment',
      });
      toast.success('Credits adjusted successfully!');
      setUserModalOpen(false);
      setCreditAdjustment('');
      setAdjustmentReason('');
      loadData();
    } catch (err) {
      toast.error('Failed to adjust credits.');
    }
  };

  // Create Task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await apiService.createAdminTask(newTask);
      toast.success('Task created successfully!');
      setTaskModalOpen(false);
      setNewTask({
        title: '',
        description: '',
        type: 'visit_site',
        url: '',
        instructions: '',
        credits_reward: 10,
        duration_seconds: 30,
        daily_limit: 5,
      });
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to create task.');
    }
  };

  // Toggle Task Active
  const handleToggleTask = async (task) => {
    try {
      await apiService.updateAdminTask(task.id, { is_active: !task.is_active });
      toast.success(`Task ${task.is_active ? 'deactivated' : 'activated'}.`);
      loadData();
    } catch (err) {
      toast.error('Failed to update task.');
    }
  };

  // Delete Task
  const handleDeleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await apiService.deleteAdminTask(id);
      toast.success('Task deleted.');
      loadData();
    } catch (err) {
      toast.error('Failed to delete task.');
    }
  };

  // Clear Tasks Cache across all devices
  const handleClearTasksCache = async () => {
    try {
      const res = await apiService.clearAdminTasksCache();
      toast.success(res.message || 'Task cache purged! All mobile clients will refresh.');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to clear task cache.');
    }
  };

  // Update Recharge Status
  const handleRechargeStatus = async (id, status) => {
    try {
      await apiService.updateAdminRecharge(id, { status });
      toast.success(`Recharge marked as ${status}.`);
      loadData();
    } catch (err) {
      toast.error('Failed to update recharge.');
    }
  };

  // Create Announcement
  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.message) {
      return toast.warning('Title and message are required.');
    }
    try {
      await apiService.createAdminAnnouncement(newAnnouncement);
      toast.success('Announcement published!');
      setNewAnnouncement({ title: '', message: '', type: 'info' });
      loadData();
    } catch (err) {
      toast.error('Failed to create announcement.');
    }
  };

  // Delete Announcement
  const handleDeleteAnnouncement = async (id) => {
    try {
      await apiService.deleteAdminAnnouncement(id);
      toast.success('Announcement deleted.');
      loadData();
    } catch (err) {
      toast.error('Failed to delete.');
    }
  };

  const adminNavItems = [
    { id: 'overview', label: 'Platform Analytics', icon: <BarChart3 size={18} color="#00eefd" /> },
    {
      id: 'live_users',
      label: 'Live Users Activity',
      badge: `${liveStats.liveUsers} LIVE`,
      isLiveBadge: true,
      icon: <Radio size={18} color="#00e699" />,
    },
    { id: 'users', label: 'User Moderation', badge: users.length, icon: <Users size={18} color="#00e699" /> },
    { id: 'tasks', label: 'Tasks & Ads', badge: tasks.length, icon: <CheckSquare size={18} color="#00d2d3" /> },
    { id: 'recharges', label: 'Recharge Orders', badge: recharges.length, icon: <Smartphone size={18} color="#fdcb6e" /> },
    { id: 'contacts', label: 'Sponsors & Inquiries', badge: contacts.length, icon: <Megaphone size={18} color="#ff7675" /> },
    { id: 'settings', label: 'Rates & Referrals', badge: creditRate.credit_rate_display, icon: <Settings size={18} color="#a29bfe" /> },
    { id: 'announcements', label: 'Announcements', badge: announcements.length, icon: <Megaphone size={18} color="#fbbf24" /> },
    { id: 'maintenance', label: 'Maintenance Mode', badge: maintenanceEnabled ? 'ON' : null, icon: <ShieldCheck size={18} color="#fd79a8" /> },
    { id: 'logs', label: 'Activity Logs', icon: <History size={18} color="#00cec9" /> },
  ];

  if (loading) {
    return (
      <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000000', padding: '40px 20px' }}>
        <div className="spinner" style={{ marginBottom: '16px' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading Control Panel data...</p>
      </div>
    );
  }

  return (
    <div className="admin-fullwidth-wrapper">
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Collapsible Left Side Menu */}
      <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="admin-sidebar-header">
          {!sidebarCollapsed ? (
            <Link
              to="/admin"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textDecoration: 'none',
                minWidth: 0,
                outline: 'none',
              }}
            >
              <img
                src="/far-logo-md.png"
                alt="FAR Logo"
                style={{
                  height: '38px',
                  width: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 8px rgba(0, 238, 253, 0.25))',
                }}
              />
              <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 900,
                    color: '#ffffff',
                    letterSpacing: '0.8px',
                    lineHeight: 1.1,
                  }}
                >
                  FAR
                </span>
                <span
                  style={{
                    fontSize: '0.66rem',
                    color: '#00eefd',
                    fontWeight: 700,
                    letterSpacing: '0.8px',
                    textTransform: 'uppercase',
                  }}
                >
                  Admin Console
                </span>
              </div>
            </Link>
          ) : (
            <Link
              to="/admin"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                margin: '0 auto',
                outline: 'none',
              }}
              title="FAR Admin Console"
            >
              <img
                src="/far-logo-sm.png"
                alt="FAR Logo"
                style={{
                  height: '30px',
                  width: '30px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 8px rgba(0, 238, 253, 0.25))',
                }}
              />
            </Link>
          )}
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--border-glass)',
              borderRadius: '6px',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              marginLeft: sidebarCollapsed ? 'auto' : '0',
              marginRight: sidebarCollapsed ? 'auto' : '0',
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
            title={sidebarCollapsed ? 'Expand Side Menu' : 'Collapse Side Menu'}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Side Menu Navigation List */}
        <nav className="admin-sidebar-nav">
          {adminNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileSidebarOpen(false);
                }}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
                title={sidebarCollapsed ? item.label : undefined}
                style={{
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  padding: sidebarCollapsed ? '10px 0' : '10px 14px',
                }}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                {!sidebarCollapsed && (
                  <>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                    {item.badge !== undefined && item.badge !== null && (
                      <span
                        className="admin-nav-badge"
                        style={
                          item.isLiveBadge
                            ? {
                                background: 'rgba(0, 230, 153, 0.18)',
                                color: '#00e699',
                                border: '1px solid rgba(0, 230, 153, 0.4)',
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }
                            : {}
                        }
                      >
                        {item.isLiveBadge && (
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: '#00e699',
                              boxShadow: '0 0 8px #00e699',
                              display: 'inline-block',
                            }}
                          />
                        )}
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer with Admin Profile & Logout */}
        <div className="admin-sidebar-footer">
          {!sidebarCollapsed ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 6px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00eefd 0%, #0066ff 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    color: '#000',
                    fontSize: '0.9rem',
                    flexShrink: 0,
                  }}
                >
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      color: '#fff',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {user?.full_name || 'System Admin'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#00e699', fontWeight: 600 }}>
                    ● Super Administrator
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <Link
                  to="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-footer-btn"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-glass)',
                    color: 'var(--text-sub)',
                    fontSize: '0.78rem',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                  title="Open Public User Web App in new tab"
                >
                  <ExternalLink size={14} />
                  <span>User App</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="admin-footer-btn logout"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 71, 87, 0.1)',
                    border: '1px solid rgba(255, 71, 87, 0.25)',
                    color: '#ff4757',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  title="Sign Out of Admin Console"
                >
                  <LogOut size={14} />
                  <span>Exit</span>
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <Link
                to="/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-glass)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-sub)',
                  textDecoration: 'none',
                }}
                title="Open Public User Web App"
              >
                <ExternalLink size={16} />
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'rgba(255, 71, 87, 0.1)',
                  border: '1px solid rgba(255, 71, 87, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ff4757',
                  cursor: 'pointer',
                }}
                title="Sign Out of Admin Console"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Full-Width Content Area */}
      <main className="admin-main-content">
        {/* Top Header inside main view */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              type="button"
              className="admin-mobile-toggle-btn"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              title="Toggle Menu"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
                <ShieldCheck size={28} color="#00eefd" /> Control Panel &amp; Administration
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '2px' }}>
                System overview, user moderation, task management &amp; recharge dispatch queue
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={loadData}
              className="btn btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                fontSize: '0.84rem',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-glass)',
                color: '#fff',
                cursor: 'pointer',
              }}
              title="Refresh Dashboard Data"
            >
              <RefreshCw size={15} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Registered Users</span>
                <Users size={20} color="var(--accent)" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px' }}>
                {stats?.totalUsers || 0}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active Tasks</span>
                <CheckSquare size={20} color="var(--primary)" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px' }}>
                {stats?.activeTasks || 0} / {stats?.totalTasks || 0}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Credits Distributed</span>
                <Coins size={20} color="#fdcb6e" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: '#fdcb6e' }}>
                {stats?.totalCreditsDistributed || 0} CR
              </div>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Recharges Sent</span>
                <Smartphone size={20} color="#00b894" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: '#00b894' }}>
                ₹{stats?.totalRechargeAmount || 0}
              </div>
            </div>
          </div>

          {/* Quick Platform Credit Rate Summary Card */}
          <div
            className="glass-card"
            style={{
              padding: '24px 28px',
              background: 'linear-gradient(135deg, rgba(0, 238, 253, 0.08) 0%, rgba(13, 27, 62, 0.95) 100%)',
              border: '1.5px solid rgba(0, 238, 253, 0.35)',
              borderRadius: '18px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '18px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span
                  style={{
                    background: 'rgba(0, 238, 253, 0.15)',
                    border: '1px solid var(--accent)',
                    borderRadius: '20px',
                    padding: '3px 12px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: 'var(--accent)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Platform Conversion Policy
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                  Updated: {creditRate.updated_at ? new Date(creditRate.updated_at).toLocaleString() : 'System Default'}
                </span>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>
                Current Credit Rate: <span style={{ color: '#00e699' }}>{creditRate.credit_rate_display}</span>
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0 }}>
                Controls conversion across Recharge Redemption, User Dashboards, and Partner Payout calculations. Updatable by Admin at any time.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => setActiveTab('settings')}
                className="btn btn-primary"
                style={{
                  padding: '10px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                }}
              >
                <Settings size={16} /> Edit Credit Rate
              </button>
            </div>
          </div>

          {/* Real-Time Live Users & Activity Chart Section */}
          <div
            className="glass-card"
            style={{
              padding: '24px 28px',
              background: 'linear-gradient(135deg, rgba(8, 14, 24, 0.95) 0%, rgba(13, 20, 36, 0.95) 100%)',
              border: '1.5px solid rgba(0, 230, 153, 0.3)',
              borderRadius: '18px',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'rgba(0, 230, 153, 0.15)',
                      border: '1px solid rgba(0, 230, 153, 0.4)',
                      borderRadius: '20px',
                      padding: '4px 12px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      color: '#00e699',
                      letterSpacing: '0.5px',
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#00e699',
                        boxShadow: '0 0 10px #00e699',
                        display: 'inline-block',
                      }}
                    />
                    REAL-TIME LIVE TELEMETRY
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                    Auto-refreshes every 30s • Zero DB-load on user clients
                  </span>
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>
                  Active Live Users: <span style={{ color: '#00eefd' }}>{liveStats.liveUsers} Online</span>
                </h3>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0 }}>
                  Logged-in Users: <strong style={{ color: '#00e699' }}>{liveStats.liveAuthenticated}</strong> &nbsp;•&nbsp; Active Visitors: <strong style={{ color: '#fdcb6e' }}>{liveStats.liveGuests}</strong>
                </p>
              </div>

              {/* Time Range Filter for Chart */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
                {[
                  { id: '1h', label: '1 Hour' },
                  { id: '6h', label: '6 Hours' },
                  { id: '24h', label: '24 Hours' },
                  { id: '7d', label: '7 Days' },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setLiveChartRange(r.id)}
                    style={{
                      background: liveChartRange === r.id ? 'var(--primary)' : 'transparent',
                      color: liveChartRange === r.id ? '#fff' : 'var(--text-muted)',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive SVG Chart of Live Users */}
            <div style={{ marginTop: '16px', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '14px', padding: '20px 16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              {liveChartLoading ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div className="spinner" style={{ margin: '0 auto 12px auto' }} />
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading live user chart data...</p>
                </div>
              ) : liveChartData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
                  <Activity size={36} color="var(--accent)" style={{ margin: '0 auto 10px auto', display: 'block', opacity: 0.7 }} />
                  <p style={{ fontWeight: 600, color: '#fff', marginBottom: '4px' }}>Live User Snapshot Tracker Active</p>
                  <p style={{ fontSize: '0.85rem' }}>
                    Currently <strong style={{ color: '#00eefd' }}>{liveStats.liveUsers}</strong> active users online. Historical time-series points are recorded every 2 minutes automatically.
                  </p>
                </div>
              ) : (
                (() => {
                  const points = liveChartData;
                  const maxCount = Math.max(...points.map((p) => Number(p.live_users_count) || 0), 5);
                  const minCount = 0;
                  const chartHeight = 220;
                  const svgWidth = 900;
                  const paddingX = 40;
                  const paddingY = 25;
                  const usableWidth = svgWidth - paddingX * 2;
                  const usableHeight = chartHeight - paddingY * 2;

                  const getX = (idx) => paddingX + (idx / Math.max(points.length - 1, 1)) * usableWidth;
                  const getY = (val) => paddingY + usableHeight - ((val - minCount) / (maxCount - minCount || 1)) * usableHeight;

                  const pathD = points
                    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx).toFixed(1)} ${getY(Number(p.live_users_count) || 0).toFixed(1)}`)
                    .join(' ');

                  const areaD = `${pathD} L ${getX(points.length - 1).toFixed(1)} ${chartHeight - paddingY} L ${getX(0).toFixed(1)} ${chartHeight - paddingY} Z`;

                  return (
                    <div>
                      <svg viewBox={`0 0 ${svgWidth} ${chartHeight}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
                        <defs>
                          <linearGradient id="liveChartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00eefd" stopOpacity="0.45" />
                            <stop offset="100%" stopColor="#00eefd" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Horizontal Grid lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                          const y = paddingY + usableHeight * (1 - pct);
                          const val = Math.round(minCount + pct * (maxCount - minCount));
                          return (
                            <g key={i}>
                              <line x1={paddingX} y1={y} x2={svgWidth - paddingX} y2={y} stroke="rgba(255,255,255,0.07)" strokeDasharray="3 3" />
                              <text x={paddingX - 10} y={y + 4} fill="#64748b" fontSize="10" textAnchor="end">
                                {val}
                              </text>
                            </g>
                          );
                        })}

                        {/* Shaded Area */}
                        <path d={areaD} fill="url(#liveChartGrad)" />

                        {/* Neon Line */}
                        <path d={pathD} fill="none" stroke="#00eefd" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                        {/* Data Points */}
                        {points.map((p, idx) => (
                          <circle
                            key={p.id || idx}
                            cx={getX(idx)}
                            cy={getY(Number(p.live_users_count) || 0)}
                            r="4"
                            fill="#000"
                            stroke="#00eefd"
                            strokeWidth="2"
                          >
                            <title>{`${new Date(p.timestamp).toLocaleTimeString()}: ${p.live_users_count} Users Online (${p.authenticated_count} Users, ${p.guest_count} Guests)`}</title>
                          </circle>
                        ))}
                      </svg>

                      {/* X-Axis Time Labels */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 30px 0 30px', color: '#64748b', fontSize: '0.75rem' }}>
                        <span>{new Date(points[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {points.length > 2 && (
                          <span>{new Date(points[Math.floor(points.length / 2)].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        )}
                        <span>{new Date(points[points.length - 1].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: LIVE USERS ACTIVITY DEDICATED VIEW */}
      {activeTab === 'live_users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="glass-card" style={{ padding: '22px', borderLeft: '4px solid #00e699' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Currently Live Users</span>
                <Radio size={20} color="#00e699" />
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, marginTop: '8px', color: '#00e699' }}>
                {liveStats.liveUsers}
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>
                Active in the last 3 minutes
              </span>
            </div>

            <div className="glass-card" style={{ padding: '22px', borderLeft: '4px solid #00eefd' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Authenticated Users</span>
                <Users size={20} color="#00eefd" />
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, marginTop: '8px', color: '#00eefd' }}>
                {liveStats.liveAuthenticated}
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>
                Logged-in user accounts browsing
              </span>
            </div>

            <div className="glass-card" style={{ padding: '22px', borderLeft: '4px solid #fdcb6e' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Guest Visitors</span>
                <Activity size={20} color="#fdcb6e" />
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, marginTop: '8px', color: '#fdcb6e' }}>
                {liveStats.liveGuests}
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>
                Unauthenticated visitors browsing landing / earn
              </span>
            </div>
          </div>

          {/* Time-Series Chart Box */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>Historical Live Traffic Graph</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                  Tracks user volume peaks and valleys over time without taxing server database
                </p>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                {['1h', '6h', '24h', '7d'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setLiveChartRange(r)}
                    className="btn btn-secondary"
                    style={{
                      padding: '6px 14px',
                      fontSize: '0.8rem',
                      borderRadius: '8px',
                      background: liveChartRange === r ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                      color: liveChartRange === r ? '#fff' : 'var(--text-muted)',
                    }}
                  >
                    {r.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Render High-Res SVG Chart */}
            <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '12px', padding: '24px 16px', border: '1px solid var(--border-glass)' }}>
              {liveChartLoading ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div className="spinner" style={{ margin: '0 auto 12px auto' }} />
                  <p style={{ color: 'var(--text-muted)' }}>Loading live analytics graph...</p>
                </div>
              ) : liveChartData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                  <Radio size={40} color="#00e699" style={{ margin: '0 auto 12px auto', display: 'block' }} />
                  <h4 style={{ color: '#fff', marginBottom: '6px' }}>Recording Live Data</h4>
                  <p style={{ fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto' }}>
                    Currently <strong style={{ color: '#00eefd' }}>{liveStats.liveUsers} users</strong> are actively connected. Historical data points are automatically plotted every 2 minutes.
                  </p>
                </div>
              ) : (
                (() => {
                  const points = liveChartData;
                  const maxCount = Math.max(...points.map((p) => Number(p.live_users_count) || 0), 10);
                  const minCount = 0;
                  const chartHeight = 260;
                  const svgWidth = 950;
                  const paddingX = 40;
                  const paddingY = 25;
                  const usableWidth = svgWidth - paddingX * 2;
                  const usableHeight = chartHeight - paddingY * 2;

                  const getX = (idx) => paddingX + (idx / Math.max(points.length - 1, 1)) * usableWidth;
                  const getY = (val) => paddingY + usableHeight - ((val - minCount) / (maxCount - minCount || 1)) * usableHeight;

                  const pathD = points
                    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx).toFixed(1)} ${getY(Number(p.live_users_count) || 0).toFixed(1)}`)
                    .join(' ');

                  const areaD = `${pathD} L ${getX(points.length - 1).toFixed(1)} ${chartHeight - paddingY} L ${getX(0).toFixed(1)} ${chartHeight - paddingY} Z`;

                  return (
                    <div>
                      <svg viewBox={`0 0 ${svgWidth} ${chartHeight}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
                        <defs>
                          <linearGradient id="liveDetailGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00e699" stopOpacity="0.45" />
                            <stop offset="100%" stopColor="#00e699" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Grid Lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                          const y = paddingY + usableHeight * (1 - pct);
                          const val = Math.round(minCount + pct * (maxCount - minCount));
                          return (
                            <g key={i}>
                              <line x1={paddingX} y1={y} x2={svgWidth - paddingX} y2={y} stroke="rgba(255,255,255,0.07)" strokeDasharray="3 3" />
                              <text x={paddingX - 10} y={y + 4} fill="#64748b" fontSize="10" textAnchor="end">
                                {val}
                              </text>
                            </g>
                          );
                        })}

                        <path d={areaD} fill="url(#liveDetailGrad)" />
                        <path d={pathD} fill="none" stroke="#00e699" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                        {points.map((p, idx) => (
                          <circle
                            key={p.id || idx}
                            cx={getX(idx)}
                            cy={getY(Number(p.live_users_count) || 0)}
                            r="4.5"
                            fill="#000"
                            stroke="#00e699"
                            strokeWidth="2"
                          >
                            <title>{`${new Date(p.timestamp).toLocaleString()}: ${p.live_users_count} Live Users (${p.authenticated_count} Authenticated, ${p.guest_count} Guests)`}</title>
                          </circle>
                        ))}
                      </svg>

                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 30px 0 30px', color: '#64748b', fontSize: '0.78rem' }}>
                        <span>{new Date(points[0].timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        <span>{new Date(points[points.length - 1].timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem' }}>User Directory & Moderation</h3>
            <form onSubmit={handleUserSearch} style={{ display: 'flex', gap: '8px', flex: '1 1 240px', maxWidth: '380px' }}>
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search name, email, phone, code..."
                className="form-input"
                style={{ padding: '8px 12px', fontSize: '0.85rem', flex: 1, minWidth: '160px' }}
              />
              <button type="submit" className="btn btn-secondary" style={{ padding: '0 14px', flexShrink: 0 }}>
                <Search size={16} />
              </button>
            </form>
          </div>

          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 8px' }}>User</th>
                  <th style={{ padding: '12px 8px' }}>Contact</th>
                  <th style={{ padding: '12px 8px' }}>Referral Code</th>
                  <th style={{ padding: '12px 8px' }}>Balance</th>
                  <th style={{ padding: '12px 8px' }}>Tier</th>
                  <th style={{ padding: '12px 8px' }}>Status</th>
                  <th style={{ padding: '12px 8px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px 8px', fontWeight: 600 }}>{u.full_name}</td>
                    <td style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {u.email}<br />{u.mobile}
                    </td>
                    <td style={{ padding: '12px 8px', fontFamily: 'monospace', color: '#fdcb6e' }}>
                      {u.referral_code}
                    </td>
                    <td style={{ padding: '12px 8px', fontWeight: 700 }}>
                      {u.credit_balance} CR
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <span className={`badge badge-${u.level}`}>{u.level}</span>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <span className={`badge badge-${u.is_banned ? 'danger' : 'success'}`}>
                        {u.is_banned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setUserModalOpen(true);
                          }}
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        >
                          Adjust Credits
                        </button>
                        <button
                          onClick={() => handleToggleBan(u)}
                          className={u.is_banned ? 'btn btn-secondary' : 'btn btn-danger'}
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        >
                          {u.is_banned ? 'Unban' : 'Ban'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust User Credits Modal */}
      {selectedUser && (
        <Modal
          isOpen={userModalOpen}
          onClose={() => setUserModalOpen(false)}
          title={`Adjust Credits for ${selectedUser.full_name}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>Current Balance: <strong>{selectedUser.credit_balance} Credits</strong></div>
            <div className="form-group">
              <label className="form-label">Adjustment Amount (+ to add, - to deduct)</label>
              <input
                type="number"
                value={creditAdjustment}
                onChange={(e) => setCreditAdjustment(e.target.value)}
                placeholder="e.g. 100 or -50"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Reason for adjustment</label>
              <input
                type="text"
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                placeholder="e.g. Promotional grant, contest winner"
                className="form-input"
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setUserModalOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
              <button onClick={handleAdjustCredits} className="btn btn-primary" style={{ flex: 1 }}>
                Apply Adjustment
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* TAB 3: TASK MANAGEMENT */}
      {activeTab === 'tasks' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem' }}>Task Campaigns</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleClearTasksCache}
                className="btn btn-secondary"
                title="Bumps task catalog version, forcing all 100k mobile devices to refresh tasks"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                <RefreshCw size={14} /> Clear Client Cache
              </button>
              <button
                onClick={() => setTaskModalOpen(true)}
                className="btn btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                <Plus size={16} /> New Campaign
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tasks.map((task) => (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  padding: '16px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-glass)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>{task.title}</span>
                    <span className="badge badge-gold">+{task.credits_reward} CR</span>
                    <span className={`badge badge-${task.is_active ? 'success' : 'danger'}`}>
                      {task.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Type: {task.type} • Duration: {task.duration_seconds}s • Limit: {task.daily_limit} • Completions: {task.total_completions}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleToggleTask(task)}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    {task.is_active ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="btn btn-danger"
                    style={{ padding: '6px 10px' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      <Modal isOpen={taskModalOpen} onClose={() => setTaskModalOpen(false)} title="Create New Task Campaign">
        <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">Task Title</label>
            <input
              type="text"
              required
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="e.g. Visit Partner Promo Site"
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Task Type</label>
            <select
              value={newTask.type}
              onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
              className="form-input"
              style={{ background: 'rgba(13, 17, 23, 0.9)' }}
            >
              <option value="visit_site">Visit Website</option>
              <option value="watch_ad">Watch Ad</option>
              <option value="youtube_subscribe">YouTube Subscribe</option>
              <option value="watch_video">Watch Video</option>
              <option value="social_follow">Social Follow</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Target URL</label>
            <input
              type="url"
              required
              value={newTask.url}
              onChange={(e) => setNewTask({ ...newTask, url: e.target.value })}
              placeholder="https://..."
              className="form-input"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Credits Reward</label>
              <input
                type="number"
                required
                value={newTask.credits_reward}
                onChange={(e) => setNewTask({ ...newTask, credits_reward: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Min Seconds</label>
              <input
                type="number"
                value={newTask.duration_seconds}
                onChange={(e) => setNewTask({ ...newTask, duration_seconds: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Daily Limit</label>
              <input
                type="number"
                value={newTask.daily_limit}
                onChange={(e) => setNewTask({ ...newTask, daily_limit: e.target.value })}
                className="form-input"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Instructions</label>
            <textarea
              rows={3}
              value={newTask.instructions}
              onChange={(e) => setNewTask({ ...newTask, instructions: e.target.value })}
              placeholder="Describe what the user should do..."
              className="form-input"
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '12px', marginTop: '8px' }}>
            Publish Campaign
          </button>
        </form>
      </Modal>

      {/* TAB 4: RECHARGES */}
      {activeTab === 'recharges' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Recharge Queue & History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recharges.map((rc) => (
              <div
                key={rc.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-glass)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    ₹{rc.amount} Recharge — {rc.operator} ({rc.mobile_number})
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                    User: {rc.user?.full_name || `ID ${rc.user_id}`} • Credits: {rc.credits_spent} CR • Date: {new Date(rc.created_at).toLocaleString()}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span className={`badge badge-${rc.status === 'completed' ? 'success' : rc.status === 'pending' ? 'warning' : 'danger'}`}>
                    {rc.status}
                  </span>
                  {rc.status === 'pending' && (
                    <button
                      onClick={() => handleRechargeStatus(rc.id, 'completed')}
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    >
                      Approve & Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SPONSORS & CONTACT INQUIRIES */}
      {activeTab === 'contacts' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Megaphone size={20} color="var(--accent)" />
                Sponsors, Advertisers &amp; Support Inquiries ({contacts.length})
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                Review partner proposals, sponsor advertising campaigns, and user inquiries. Inspect compressed artwork/media and manage resolution statuses.
              </p>
            </div>
            <button
              onClick={() => handleContactSearch()}
              className="btn btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={14} /> Refresh Inquiries
            </button>
          </div>

          {/* Search & Filter Bar */}
          <form
            onSubmit={handleContactSearch}
            style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '20px',
              flexWrap: 'wrap',
              background: 'rgba(255, 255, 255, 0.02)',
              padding: '12px',
              borderRadius: '10px',
              border: '1px solid var(--border-glass)',
            }}
          >
            <div style={{ flex: '1 1 240px', position: 'relative' }}>
              <input
                type="text"
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                placeholder="Search by name, email, phone, subject, or message keyword..."
                className="form-input"
                style={{ paddingLeft: '36px', width: '100%' }}
              />
              <Search
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>

            <div style={{ width: '160px' }}>
              <select
                value={contactStatusFilter}
                onChange={(e) => setContactStatusFilter(e.target.value)}
                className="form-input"
                style={{ width: '100%', background: 'rgba(13, 17, 23, 0.95)' }}
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
              Search
            </button>
            {(contactSearch || contactStatusFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setContactSearch('');
                  setContactStatusFilter('all');
                  apiService.getAdminContacts().then((res) => {
                    setContacts(res.data?.contacts || res.contacts || []);
                  });
                }}
                className="btn btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
              >
                Reset
              </button>
            )}
          </form>

          {/* Inquiries List */}
          {contacts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <Mail size={36} style={{ opacity: 0.4, marginBottom: '8px' }} />
              <p>No support inquiries match your current search criteria.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {contacts.map((c) => (
                <div
                  key={c.id}
                  style={{
                    padding: '16px 20px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-glass)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          background: 'rgba(0, 238, 253, 0.1)',
                          color: 'var(--accent)',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                        }}
                      >
                        #{c.id}
                      </span>
                      <strong style={{ fontSize: '1rem', color: '#fff' }}>{c.name}</strong>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>• {c.email}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>• 📞 {c.phone}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {/* Status Badge */}
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: '20px',
                          textTransform: 'uppercase',
                          background:
                            c.status === 'resolved'
                              ? 'rgba(0, 230, 153, 0.15)'
                              : c.status === 'in_progress'
                              ? 'rgba(253, 203, 110, 0.15)'
                              : c.status === 'closed'
                              ? 'rgba(255, 255, 255, 0.1)'
                              : 'rgba(0, 238, 253, 0.15)',
                          color:
                            c.status === 'resolved'
                              ? '#00e699'
                              : c.status === 'in_progress'
                              ? '#fdcb6e'
                              : c.status === 'closed'
                              ? '#aaa'
                              : '#00eefd',
                          border: `1px solid ${
                            c.status === 'resolved'
                              ? 'rgba(0, 230, 153, 0.3)'
                              : c.status === 'in_progress'
                              ? 'rgba(253, 203, 110, 0.3)'
                              : c.status === 'closed'
                              ? 'rgba(255, 255, 255, 0.2)'
                              : 'rgba(0, 238, 253, 0.3)'
                          }`,
                        }}
                      >
                        {c.status.replace('_', ' ')}
                      </span>

                      {/* Status Select */}
                      <select
                        value={c.status}
                        onChange={(e) => handleUpdateContactStatus(c.id, e.target.value)}
                        style={{
                          background: 'rgba(13, 17, 23, 0.9)',
                          color: '#fff',
                          border: '1px solid var(--border-glass)',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="new">New</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  {/* Subject & Preview */}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#00eefd', marginBottom: '2px' }}>
                      Subject: {c.subject}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', margin: 0, lineHeight: '1.5' }}>
                      {c.message}
                    </p>
                  </div>

                  {/* Footer Bar: Image indicator + Actions */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                      paddingTop: '8px',
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <div>
                      Received: {new Date(c.created_at).toLocaleString()}
                      {(c.image_url || c.image_path) && (
                        <button
                          onClick={() => {
                            setActiveImageSrc(c.image_url || c.image_path);
                            setImageModalOpen(true);
                          }}
                          style={{
                            marginLeft: '12px',
                            background: 'rgba(0, 238, 253, 0.1)',
                            border: '1px solid rgba(0, 238, 253, 0.3)',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            color: 'var(--accent)',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <FileImage size={13} /> View Compressed Screenshot
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => {
                          setSelectedContact(c);
                          setContactModalOpen(true);
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Eye size={13} /> Full Details
                      </button>
                      <button
                        onClick={() => handleDeleteContact(c.id)}
                        className="btn btn-danger"
                        style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                        title="Delete Inquiry"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Site Announcements & Banners</h3>

          {/* New Announcement Form */}
          <form onSubmit={handleCreateAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <input
                type="text"
                required
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                placeholder="Announcement Title"
                className="form-input"
              />
              <select
                value={newAnnouncement.type}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, type: e.target.value })}
                className="form-input"
                style={{ background: 'rgba(13, 17, 23, 0.9)' }}
              >
                <option value="info">Info</option>
                <option value="promo">Promo</option>
                <option value="warning">Warning</option>
              </select>
            </div>
            <textarea
              rows={2}
              required
              value={newAnnouncement.message}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
              placeholder="Announcement Message..."
              className="form-input"
            />
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '8px 18px' }}>
              Post Announcement
            </button>
          </form>

          {/* List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {announcements.map((a) => (
              <div
                key={a.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-glass)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{a.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{a.message}</div>
                </div>
                <button onClick={() => handleDeleteAnnouncement(a.id)} className="btn btn-danger" style={{ padding: '6px' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Admin Activity Audit Trail</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {logs.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-glass)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.85rem',
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, color: '#00d2d3' }}>{log.action}</span> by{' '}
                  <strong>{log.admin?.full_name || 'Admin'}</strong>
                  {log.details && (
                    <span style={{ color: 'var(--text-sub)', marginLeft: '8px' }}>
                      ({JSON.stringify(log.details)})
                    </span>
                  )}
                </div>
                <div style={{ color: 'var(--text-sub)', fontSize: '0.75rem' }}>
                  {new Date(log.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: PLATFORM SETTINGS & CREDIT CONVERSION RATE */}
      {activeTab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header Card */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(0, 238, 253, 0.15)',
                  border: '1px solid var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent)',
                }}
              >
                <Sliders size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem', margin: 0, color: '#fff' }}>
                  Platform Credit Conversion Rate
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                  Manage the official conversion valuation between Indian Rupees (₹) and platform Credits (CR).
                </p>
              </div>
            </div>

            {/* Current Active Status Pill */}
            <div
              style={{
                marginTop: '20px',
                padding: '16px 20px',
                background: 'rgba(0, 230, 153, 0.08)',
                border: '1.5px solid rgba(0, 230, 153, 0.3)',
                borderRadius: '14px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Active Live Rate Across Entire Website
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#00e699', marginTop: '2px' }}>
                  {creditRate.credit_rate_display}
                </div>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                <div>Last updated by: <strong style={{ color: '#fff' }}>{creditRate.updated_by || 'Admin'}</strong></div>
                <div>Timestamp: <span style={{ color: 'var(--text-sub)' }}>{creditRate.updated_at ? new Date(creditRate.updated_at).toLocaleString() : 'System Default'}</span></div>
              </div>
            </div>

            {/* Editor Form */}
            <form onSubmit={handleSaveCreditRate} style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>
                  Credit Rate Display String (shown to users):
                </label>
                <input
                  type="text"
                  value={rateEditDisplay}
                  onChange={(e) => setRateEditDisplay(e.target.value)}
                  placeholder="e.g. 1Rs = 1 Credit"
                  className="form-input"
                  style={{
                    width: '100%',
                    maxWidth: '480px',
                    padding: '12px 16px',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    background: '#040711',
                    border: '1.5px solid rgba(0, 210, 255, 0.4)',
                    color: '#fff',
                  }}
                  required
                />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)', marginTop: '4px', display: 'block' }}>
                  Standard convention required by policy: <code>1Rs = 1 Credit</code>
                </span>
              </div>

              {/* Quick Math Inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', maxWidth: '480px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
                    Rupees (₹):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={rateRupees}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setRateRupees(val);
                      setRateEditDisplay(`${val}Rs = ${rateCredits} Credit${rateCredits > 1 ? 's' : ''}`);
                    }}
                    className="form-input"
                    style={{ width: '100%', padding: '10px 14px', background: '#040711' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
                    Credits (CR):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={rateCredits}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setRateCredits(val);
                      setRateEditDisplay(`${rateRupees}Rs = ${val} Credit${val > 1 ? 's' : ''}`);
                    }}
                    className="form-input"
                    style={{ width: '100%', padding: '10px 14px', background: '#040711' }}
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-sub)', marginBottom: '8px' }}>
                  Quick Preset Configurations:
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {[
                    { label: '1Rs = 1 Credit (Default)', r: 1, c: 1, text: '1Rs = 1 Credit' },
                    { label: '1Rs = 2 Credits', r: 1, c: 2, text: '1Rs = 2 Credits' },
                    { label: '2Rs = 1 Credit', r: 2, c: 1, text: '2Rs = 1 Credit' },
                    { label: '5Rs = 5 Credits', r: 5, c: 5, text: '5Rs = 5 Credits' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setRateRupees(preset.r);
                        setRateCredits(preset.c);
                        setRateEditDisplay(preset.text);
                      }}
                      style={{
                        background: rateEditDisplay === preset.text ? 'rgba(0, 238, 253, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        border: rateEditDisplay === preset.text ? '1px solid var(--accent)' : '1px solid var(--border-glass)',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '0.82rem',
                        color: rateEditDisplay === preset.text ? 'var(--accent)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
                <button
                  type="submit"
                  disabled={rateSaving}
                  className="btn btn-primary"
                  style={{
                    padding: '12px 28px',
                    fontSize: '1rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 18px rgba(0, 210, 255, 0.35)',
                    cursor: rateSaving ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Save size={18} />
                  {rateSaving ? 'Saving Rate...' : 'Save & Update Platform Rate'}
                </button>
              </div>
            </form>
          </div>

          {/* Referral Reward Rates & 2-Hour Rules Card */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(253, 167, 2, 0.15)',
                  border: '1px solid #fda702',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fda702',
                }}
              >
                <Users size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem', margin: 0, color: '#fff' }}>
                  Referral Reward Rates &amp; 2-Hour Rules
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                  Configure rewards for single refer in first 2 hours vs after 2 hours. Changes reflect immediately across the entire platform.
                </p>
              </div>
            </div>

            {/* Current Active Status Pill */}
            <div
              style={{
                marginTop: '20px',
                padding: '16px 20px',
                background: 'rgba(253, 167, 2, 0.08)',
                border: '1.5px solid rgba(253, 167, 2, 0.35)',
                borderRadius: '14px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', textTransform: 'uppercase', fontWeight: 700 }}>
                    First 2 Hours Reward (Single Refer)
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fda702', marginTop: '2px' }}>
                    +{referralSettings.bonus_reward_2h} CR
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', textTransform: 'uppercase', fontWeight: 700 }}>
                    After 2 Hours Reward (Standard)
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#00e699', marginTop: '2px' }}>
                    +{referralSettings.standard_reward} CR
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Bonus Target
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#00eefd', marginTop: '2px' }}>
                    {referralSettings.target_referrals} Friend (Single Refer)
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                <div>Last updated by: <strong style={{ color: '#fff' }}>{referralSettings.updated_by || 'Admin'}</strong></div>
                <div>Timestamp: <span style={{ color: 'var(--text-sub)' }}>{referralSettings.updated_at ? new Date(referralSettings.updated_at).toLocaleString() : 'System Default'}</span></div>
              </div>
            </div>

            {/* Editor Form */}
            <form onSubmit={handleSaveReferralSettings} style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>
                    Single Refer in First 2 Hours (Credits):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={refBonus2h}
                    onChange={(e) => setRefBonus2h(e.target.value)}
                    className="form-input"
                    style={{ width: '100%', padding: '12px 14px', background: '#040711', fontSize: '1rem', fontWeight: 700, color: '#fda702' }}
                    required
                  />
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-sub)', marginTop: '4px', display: 'block' }}>
                    Reward given to referrer for inviting during the initial 2-hour window (default: 50 CR).
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>
                    Referral Reward After 2 Hours (Credits):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={refStandard}
                    onChange={(e) => setRefStandard(e.target.value)}
                    className="form-input"
                    style={{ width: '100%', padding: '12px 14px', background: '#040711', fontSize: '1rem', fontWeight: 700, color: '#00e699' }}
                    required
                  />
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-sub)', marginTop: '4px', display: 'block' }}>
                    Standard ongoing reward after the 2-hour window has expired (default: 10 CR = ₹10).
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>
                    Bonus Window Duration (Hours):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="72"
                    value={refWindowHours}
                    onChange={(e) => setRefWindowHours(e.target.value)}
                    className="form-input"
                    style={{ width: '100%', padding: '12px 14px', background: '#040711', fontSize: '1rem', fontWeight: 700, color: '#fff' }}
                    required
                  />
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-sub)', marginTop: '4px', display: 'block' }}>
                    Countdown duration starting from user registration (default: 2 hours).
                  </span>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={refSaving}
                  className="btn btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, #fda702, #ff6b6b)',
                    padding: '12px 28px',
                    fontSize: '1rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 18px rgba(253, 167, 2, 0.35)',
                    cursor: refSaving ? 'not-allowed' : 'pointer',
                    color: '#fff',
                  }}
                >
                  <Save size={18} />
                  {refSaving ? 'Saving Referral Settings...' : 'Save & Update Referral Rules'}
                </button>
              </div>
            </form>
          </div>

          {/* WhatsApp Verification Management (wacli Bot) */}
          <div className="glass-card" style={{ padding: '28px', border: '1px solid rgba(37, 211, 102, 0.3)', background: 'linear-gradient(180deg, rgba(37, 211, 102, 0.05) 0%, rgba(13, 20, 36, 0.6) 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(37, 211, 102, 0.15)',
                  border: '1px solid rgba(37, 211, 102, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <WhatsAppIcon size={24} color="#25D366" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    WhatsApp Mobile Verification (<code style={{ color: '#25D366', fontSize: '1rem' }}>wacli</code>)
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                    Verify users' WhatsApp phone numbers automatically during signup using a local or remote WhatsApp CLI bot.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  background: waSettings.enabled ? 'rgba(37, 211, 102, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: waSettings.enabled ? '#25D366' : '#ef4444',
                  border: `1px solid ${waSettings.enabled ? '#25D366' : '#ef4444'}`,
                }}>
                  {waSettings.enabled ? 'ACTIVE & ENFORCED' : 'DISABLED (OPTIONAL)'}
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveWaSettings}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                {/* Enable toggle */}
                <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-glass)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 700, color: '#fff' }}>
                    <input
                      type="checkbox"
                      checked={waSettings.enabled}
                      onChange={(e) => setWaSettings({ ...waSettings, enabled: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: '#25D366' }}
                    />
                    <span>Require WhatsApp Verification</span>
                  </label>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '6px', margin: 0 }}>
                    When enabled, users must send verification code on WhatsApp to complete signup.
                  </p>
                </div>

                {/* Auto Reply toggle */}
                <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-glass)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 700, color: '#fff' }}>
                    <input
                      type="checkbox"
                      checked={waSettings.autoReply}
                      onChange={(e) => setWaSettings({ ...waSettings, autoReply: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: '#25D366' }}
                    />
                    <span>Auto-Reply via wacli</span>
                  </label>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '6px', margin: 0 }}>
                    Sends confirmation reply "✅ Mobile number verified!" back to user.
                  </p>
                </div>

                {/* Bot WhatsApp Number */}
                <div className="input-group">
                  <label className="input-label" style={{ color: '#fff', fontWeight: 700 }}>
                    Bot WhatsApp Number (with Country Code)
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="919876543210"
                    value={waSettings.botNumber}
                    onChange={(e) => setWaSettings({ ...waSettings, botNumber: e.target.value.replace(/[^0-9]/g, '') })}
                    style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#fff', borderColor: 'var(--border-glass)' }}
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    Users will click to open a chat with this number (wa.me/{waSettings.botNumber || 'YOUR_BOT'}).
                  </small>
                </div>

                {/* Code Expiry Minutes */}
                <div className="input-group">
                  <label className="input-label" style={{ color: '#fff', fontWeight: 700 }}>
                    Code Validity (Minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    className="input-field"
                    value={waSettings.expiryMinutes}
                    onChange={(e) => setWaSettings({ ...waSettings, expiryMinutes: Math.max(1, parseInt(e.target.value) || 15) })}
                    style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#fff', borderColor: 'var(--border-glass)' }}
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    Time before verification code expires (default: 15 mins).
                  </small>
                </div>

                {/* Webhook Secret */}
                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label className="input-label" style={{ color: '#fff', fontWeight: 700 }}>
                    Webhook Secret (Optional HMAC Token)
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. your-secret-webhook-key"
                    value={waSettings.webhookSecret || ''}
                    onChange={(e) => setWaSettings({ ...waSettings, webhookSecret: e.target.value })}
                    style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#fff', borderColor: 'var(--border-glass)' }}
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    If specified, requests to <code>/api/auth/wacli/webhook</code> must provide matching <code>X-Wacli-Signature</code> or Bearer token.
                  </small>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                <button
                  type="submit"
                  disabled={waSaving}
                  className="btn btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, #25D366, #128C7E)',
                    padding: '12px 28px',
                    fontSize: '1rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 18px rgba(37, 211, 102, 0.35)',
                    cursor: waSaving ? 'not-allowed' : 'pointer',
                    color: '#fff',
                  }}
                >
                  <Save size={18} />
                  {waSaving ? 'Saving WhatsApp Settings...' : 'Save WhatsApp Configuration'}
                </button>
              </div>
            </form>

            {/* wacli Setup & Execution Guide Box */}
            <div style={{ padding: '18px', borderRadius: '12px', background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#25D366', fontWeight: 700 }}>
                <Terminal size={18} />
                <span>How to run wacli on your server:</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', margin: '0 0 10px 0' }}>
                Run this command in your terminal where <code style={{ color: '#fff' }}>wacli</code> is installed and logged in to forward incoming verification messages directly to this server:
              </p>
              <div style={{
                position: 'relative',
                background: '#0d1117',
                padding: '12px 48px 12px 14px',
                borderRadius: '8px',
                fontFamily: 'Consolas, monospace',
                fontSize: '0.85rem',
                color: '#58a6ff',
                overflowX: 'auto',
                border: '1px solid #30363d',
              }}>
                wacli sync --follow --webhook http://localhost:5000/api/auth/wacli/webhook --webhook-allow-private
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('wacli sync --follow --webhook http://localhost:5000/api/auth/wacli/webhook --webhook-allow-private');
                    toast.success('wacli command copied to clipboard!');
                  }}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: '#fff',
                    padding: '6px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                  title="Copy command"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>

            {/* Inbound WhatsApp Message Simulator */}
            <div style={{ padding: '18px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: '#fda702', fontWeight: 700 }}>
                <Send size={18} />
                <span>Development & Testing: Simulate WhatsApp Inbound Message</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '0 0 12px 0' }}>
                Test the complete flow without needing a real phone or active wacli connection. Enter the mobile number and the 6-character verification code displayed on the registration page:
              </p>
              <form onSubmit={handleAdminSimulateVerification} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Mobile number (10 digits)"
                  value={simMobile}
                  onChange={(e) => setSimMobile(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                  style={{
                    flex: '1 1 180px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid var(--border-glass)',
                    color: '#fff',
                    fontSize: '0.9rem',
                  }}
                />
                <input
                  type="text"
                  placeholder="6-char Code (e.g. 7K4P92)"
                  value={simCode}
                  onChange={(e) => setSimCode(e.target.value.toUpperCase().slice(0, 6))}
                  style={{
                    width: '180px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid var(--border-glass)',
                    color: '#25D366',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    fontSize: '1rem',
                    textAlign: 'center',
                    letterSpacing: '2px',
                  }}
                />
                <button
                  type="submit"
                  disabled={simLoading}
                  className="btn"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: simLoading ? 'not-allowed' : 'pointer',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Send size={16} />
                  {simLoading ? 'Simulating...' : 'Simulate Message Received'}
                </button>
              </form>
            </div>
          </div>

          {/* Integration & Policy Documentation Card */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="var(--accent)" /> Where This Rate Is Applied
            </h4>
            <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '8px', margin: 0 }}>
              <li>
                <strong>Mobile Recharge Redeem:</strong> Displayed prominently in the available balance banner so users always see the operational exchange value.
              </li>
              <li>
                <strong>User Dashboard:</strong> Displayed under the Wallet Balance card for all logged-in members.
              </li>
              <li>
                <strong>Privacy Policy Compliance:</strong> Transparently recorded under Section 3 of the published Privacy Policy for complete compliance.
              </li>
              <li>
                <strong>Redis Cache &amp; In-Memory Persistence:</strong> Synced instantly across all backend server instances and cached for maximum high-traffic performance.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB: MAINTENANCE MODE & CACHE */}
      {activeTab === 'maintenance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Maintenance Mode Card */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: maintenanceEnabled ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${maintenanceEnabled ? '#fbbf24' : 'var(--border-glass)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: maintenanceEnabled ? '#fbbf24' : 'var(--text-muted)',
              }}>
                <Wrench size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', margin: 0, color: '#fff' }}>Maintenance Mode</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                  When enabled, all non-admin users will see a full-screen maintenance overlay.
                </p>
              </div>
            </div>

            {/* Status Banner */}
            <div style={{
              padding: '14px 18px',
              borderRadius: '12px',
              background: maintenanceEnabled ? 'rgba(251, 191, 36, 0.1)' : 'rgba(0, 230, 153, 0.08)',
              border: `1.5px solid ${maintenanceEnabled ? 'rgba(251,191,36,0.4)' : 'rgba(0,230,153,0.3)'}`,
              display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px',
            }}>
              {maintenanceEnabled
                ? <ToggleRight size={28} color="#fbbf24" />
                : <ToggleLeft size={28} color="#00e699" />}
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: maintenanceEnabled ? '#fbbf24' : '#00e699' }}>
                  {maintenanceEnabled ? '⚠️ MAINTENANCE MODE IS CURRENTLY ON' : '✅ SITE IS LIVE — Maintenance Mode OFF'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {maintenanceEnabled
                    ? 'Users are seeing the maintenance overlay right now.'
                    : 'Users can access the platform normally.'}
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveMaintenance} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontWeight: 600, color: '#fff' }}>Maintenance Mode:</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setMaintenanceEnabled(true)}
                    style={{
                      padding: '8px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer',
                      background: maintenanceEnabled ? '#fbbf24' : 'rgba(251,191,36,0.08)',
                      color: maintenanceEnabled ? '#0a0a0a' : '#fbbf24',
                      border: '1.5px solid rgba(251,191,36,0.5)',
                    }}
                  >
                    <ToggleRight size={14} style={{ display: 'inline', marginRight: '6px' }} />
                    Enable
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaintenanceEnabled(false)}
                    style={{
                      padding: '8px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer',
                      background: !maintenanceEnabled ? '#00e699' : 'rgba(0,230,153,0.08)',
                      color: !maintenanceEnabled ? '#0a0a0a' : '#00e699',
                      border: '1.5px solid rgba(0,230,153,0.5)',
                    }}
                  >
                    <ToggleLeft size={14} style={{ display: 'inline', marginRight: '6px' }} />
                    Disable
                  </button>
                </div>
              </div>

              {/* Message Editor */}
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>
                  Maintenance Message (shown to users):
                </label>
                <textarea
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  rows={3}
                  className="form-input"
                  placeholder="Enter the maintenance message users will see..."
                  style={{
                    width: '100%', padding: '12px 16px', fontSize: '0.95rem',
                    background: '#040711', border: '1.5px solid rgba(251,191,36,0.3)',
                    color: '#fff', borderRadius: '10px', resize: 'vertical',
                  }}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={maintenanceSaving}
                  className="btn btn-primary"
                  style={{
                    padding: '12px 28px', fontSize: '1rem', fontWeight: 800,
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    background: maintenanceEnabled ? 'linear-gradient(135deg, #f59e0b, #fbbf24)' : undefined,
                    cursor: maintenanceSaving ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Save size={18} />
                  {maintenanceSaving ? 'Saving...' : `Save — ${maintenanceEnabled ? 'Enable Maintenance' : 'Disable Maintenance'}`}
                </button>
              </div>
            </form>
          </div>

          {/* Clear Cache Card */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: 'rgba(129, 140, 248, 0.15)',
                border: '1px solid rgba(129,140,248,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#818cf8',
              }}>
                <DatabaseZap size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', margin: 0, color: '#fff' }}>Clear Platform Cache</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                  Force-clears all Redis/in-memory cache. Use after bulk updates or to force users to refresh stale data.
                </p>
              </div>
            </div>

            <div style={{
              padding: '14px 18px', borderRadius: '10px',
              background: 'rgba(129,140,248,0.08)',
              border: '1px solid rgba(129,140,248,0.25)',
              marginBottom: '20px', fontSize: '0.87rem', color: 'var(--text-muted)',
              lineHeight: 1.6,
            }}>
              <strong style={{ color: '#818cf8' }}>What gets cleared:</strong> Credit rate cache, maintenance settings cache, task lists cache, user profile caches. Users will see slightly slower responses for 1–2 minutes while caches rebuild.
            </div>

            <button
              type="button"
              onClick={handleClearCache}
              disabled={cacheClearLoading}
              className="btn"
              style={{
                padding: '12px 28px', fontSize: '1rem', fontWeight: 800,
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                cursor: cacheClearLoading ? 'not-allowed' : 'pointer',
                opacity: cacheClearLoading ? 0.7 : 1,
              }}
            >
              <DatabaseZap size={18} />
              {cacheClearLoading ? 'Clearing Cache...' : '🗑️ Clear All Platform Cache'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL: CONTACT INQUIRY DETAILS */}
      <Modal
        isOpen={contactModalOpen}
        onClose={() => {
          setContactModalOpen(false);
          setSelectedContact(null);
        }}
        title={`Support Inquiry #${selectedContact?.id || ''}`}
        maxWidth="650px"
      >
        {selectedContact && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sender Name</div>
                <strong style={{ fontSize: '0.95rem', color: '#fff' }}>{selectedContact.name}</strong>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email Address</div>
                <a href={`mailto:${selectedContact.email}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '0.9rem' }}>
                  {selectedContact.email}
                </a>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phone Number</div>
                <a href={`tel:${selectedContact.phone}`} style={{ color: '#00e699', textDecoration: 'none', fontSize: '0.9rem' }}>
                  {selectedContact.phone}
                </a>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Received At</div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                  {new Date(selectedContact.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Inquiry Category</div>
              <div style={{ fontWeight: 700, color: '#00eefd', fontSize: '1rem' }}>{selectedContact.subject}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Message Content</div>
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-glass)',
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  color: '#fff',
                }}
              >
                {selectedContact.message}
              </div>
            </div>

            {(selectedContact.image_url || selectedContact.image_path) && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Attached Screenshot (Compressed Server-side to WebP)
                  </div>
                  <a
                    href={selectedContact.image_url || selectedContact.image_path}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '0.75rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                  >
                    Open Original <ExternalLink size={12} />
                  </a>
                </div>
                <div
                  style={{
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid var(--border-glass)',
                    maxHeight: '260px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#05070a',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setActiveImageSrc(selectedContact.image_url || selectedContact.image_path);
                    setImageModalOpen(true);
                  }}
                >
                  <img
                    src={selectedContact.image_url || selectedContact.image_path}
                    alt="User Attachment"
                    style={{ maxHeight: '260px', maxWidth: '100%', objectFit: 'contain' }}
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingTop: '14px', borderTop: '1px solid var(--border-glass)', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status:</span>
                <select
                  value={selectedContact.status}
                  onChange={(e) => handleUpdateContactStatus(selectedContact.id, e.target.value)}
                  className="form-input"
                  style={{ background: 'rgba(13, 17, 23, 0.95)', padding: '6px 12px', fontSize: '0.85rem' }}
                >
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => handleDeleteContact(selectedContact.id)}
                  className="btn btn-danger"
                  style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                >
                  Delete Inquiry
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setContactModalOpen(false);
                    setSelectedContact(null);
                  }}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: IMAGE LIGHTBOX */}
      <Modal
        isOpen={imageModalOpen}
        onClose={() => {
          setImageModalOpen(false);
          setActiveImageSrc(null);
        }}
        title="Compressed Screenshot Attachment"
        maxWidth="850px"
      >
        {activeImageSrc && (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#05070a',
                border: '1px solid var(--border-glass)',
                padding: '8px',
                marginBottom: '16px',
              }}
            >
              <img
                src={activeImageSrc}
                alt="Attachment Preview"
                style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '4px' }}
              />
            </div>
            <a
              href={activeImageSrc}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px', fontSize: '0.85rem', textDecoration: 'none' }}
            >
              Open In New Tab <ExternalLink size={14} />
            </a>
          </div>
        )}
      </Modal>
      </main>
    </div>
  );
};

export default AdminDashboard;
