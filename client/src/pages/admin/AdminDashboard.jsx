import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  CheckSquare,
  Smartphone,
  Coins,
  Plus,
  Trash2,
  Search,
} from 'lucide-react';
import { apiService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';

const AdminDashboard = () => {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('overview'); // overview, users, tasks, recharges, announcements, logs
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, tasksRes, rechargesRes, annRes, logsRes] = await Promise.all([
        apiService.getAdminStats(),
        apiService.getAdminUsers(),
        apiService.getAdminTasks(),
        apiService.getAdminRecharges(),
        apiService.getAdminAnnouncements(),
        apiService.getAdminLogs(),
      ]);

      setStats(statsRes.stats);
      setUsers(usersRes.users || []);
      setTasks(tasksRes.tasks || []);
      setRecharges(rechargesRes.recharges || []);
      setAnnouncements(annRes.announcements || []);
      setLogs(logsRes.logs || []);
    } catch (err) {
      toast.error('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '40px auto' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading Control Panel data...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
      {/* Admin Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={28} color="#00d2d3" /> Control Panel & Administration
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            System overview, user moderation, task management & recharge queue
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          borderBottom: '1px solid var(--border-glass)',
          paddingBottom: '10px',
          marginBottom: '24px',
        }}
      >
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'users', label: `Users (${users.length})` },
          { id: 'tasks', label: `Tasks (${tasks.length})` },
          { id: 'recharges', label: `Recharges (${recharges.length})` },
          { id: 'announcements', label: `Announcements (${announcements.length})` },
          { id: 'logs', label: 'Activity Logs' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.9rem',
              background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
              color: activeTab === tab.id ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
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
            <button
              onClick={() => setTaskModalOpen(true)}
              className="btn btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              <Plus size={16} /> New Campaign
            </button>
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

      {/* TAB 5: ANNOUNCEMENTS */}
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
    </div>
  );
};

export default AdminDashboard;
