import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Clock,
  Eye,
  Video,
  PlayCircle,
  ThumbsUp,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { apiService } from '../services/api';
import TaskExecutionModal from '../components/tasks/TaskExecutionModal';
import YouTubeVerificationSection from '../components/youtube/YouTubeVerificationSection';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fromCache, setFromCache] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTask, setActiveTask] = useState(null);

  const fetchTasks = async (force = false) => {
    if (force) setRefreshing(true);
    try {
      const res = await apiService.getTasks(force);
      setTasks(res.tasks || []);
      setFromCache(!!res.fromCache);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskDone = () => {
    fetchTasks(); // Refresh completions today count
  };

  const getCategoryIcon = (type) => {
    switch (type) {
      case 'visit_site':
        return <Eye size={20} color="#00d2d3" />;
      case 'watch_ad':
      case 'watch_video':
        return <Video size={20} color="#a29bfe" />;
      case 'youtube_subscribe':
        return <PlayCircle size={20} color="#ff0000" />;
      case 'social_follow':
        return <ThumbsUp size={20} color="#54a0ff" />;
      default:
        return <Sparkles size={20} color="#fdcb6e" />;
    }
  };

  const categories = [
    { id: 'all', label: 'All Tasks' },
    { id: 'visit_site', label: 'Visit Websites' },
    { id: 'watch_ad', label: 'Watch Ads' },
    { id: 'youtube_subscribe', label: 'YouTube' },
    { id: 'watch_video', label: 'Videos' },
    { id: 'social_follow', label: 'Social' },
  ];

  const filteredTasks =
    selectedCategory === 'all'
      ? tasks
      : tasks.filter((t) => t.type === selectedCategory);

  return (
    <div style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 20px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckSquare size={28} color="var(--primary)" /> Earn Credits
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Complete simple micro-tasks to accumulate recharge credits in real-time.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {fromCache ? (
            <span
              style={{
                fontSize: '0.75rem',
                color: '#10b981',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '20px',
                padding: '4px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Zap size={12} />
              <span>Offline Device Cached</span>
            </span>
          ) : (
            <span
              style={{
                fontSize: '0.75rem',
                color: '#6366f1',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '20px',
                padding: '4px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Sparkles size={12} />
              <span>Live Synced</span>
            </span>
          )}

          <button
            onClick={() => fetchTasks(true)}
            disabled={refreshing}
            title="Force refresh tasks from server"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-glass)',
              borderRadius: '8px',
              padding: '6px 10px',
              color: 'var(--text-muted)',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
            }}
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '12px',
          marginBottom: '24px',
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: 600,
              background:
                selectedCategory === cat.id ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
              color: selectedCategory === cat.id ? '#fff' : 'var(--text-muted)',
              border: '1px solid var(--border-glass)',
              transition: 'all 0.2s',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Featured YouTube Partner Channels Verification Section */}
      {(selectedCategory === 'all' || selectedCategory === 'youtube_subscribe') && (
        <YouTubeVerificationSection />
      )}

      {/* Task Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ margin: '0 auto 12px auto' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading active tasks...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            No tasks found in this category right now. Check back soon for newly sponsored campaigns!
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="glass-card interactive"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                opacity: task.isAvailable ? 1 : 0.6,
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '14px',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {getCategoryIcon(task.type)}
                  </div>
                  <span
                    className="badge badge-gold"
                    style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                  >
                    +{task.creditsReward} CR
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', marginBottom: '8px', lineHeight: '1.4' }}>
                  {task.title}
                </h3>
                <p
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                    lineHeight: '1.5',
                    marginBottom: '16px',
                  }}
                >
                  {task.description}
                </p>
              </div>

              <div>
                {/* Meta details */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    color: 'var(--text-sub)',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-glass)',
                    marginBottom: '16px',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} />{' '}
                    {task.durationSeconds > 0 ? `${task.durationSeconds}s` : 'Instant'}
                  </span>
                  <span>
                    Daily: {task.completionsToday}
                    {task.dailyLimit > 0 ? ` / ${task.dailyLimit}` : ' (Unlimited)'}
                  </span>
                </div>

                <button
                  onClick={() => setActiveTask(task)}
                  disabled={!task.isAvailable}
                  className={task.isAvailable ? 'btn btn-primary' : 'btn btn-secondary'}
                  style={{ width: '100%', padding: '10px' }}
                >
                  {task.isAvailable ? (
                    <>
                      Start Task <ArrowRight size={16} />
                    </>
                  ) : (
                    'Daily Limit Reached'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Execution Modal */}
      {activeTask && (
        <TaskExecutionModal
          task={activeTask}
          isOpen={!!activeTask}
          onClose={() => setActiveTask(null)}
          onTaskCompleted={handleTaskDone}
        />
      )}
    </div>
  );
};

export default Tasks;
