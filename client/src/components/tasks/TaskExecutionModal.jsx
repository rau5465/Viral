import React, { useState, useEffect } from 'react';
import { ExternalLink, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { apiService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';
import confetti from 'canvas-confetti';

const TaskExecutionModal = ({ task, isOpen, onClose, onTaskCompleted }) => {
  const toast = useToast();
  const { refreshUser } = useAuth();

  const [session, setSession] = useState(null);
  const [secondsRemaining, setSecondsRemaining] = useState(task?.durationSeconds || 0);
  const [timerActive, setTimerActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task && isOpen) {
      setSecondsRemaining(task.durationSeconds || 0);
      setTimerActive(false);
      setIsCompleted(false);
      setSession(null);
    }
  }, [task, isOpen]);

  useEffect(() => {
    let interval = null;
    if (timerActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timerActive && secondsRemaining === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, secondsRemaining]);

  if (!task) return null;

  const handleStartTask = async () => {
    setLoading(true);
    try {
      const res = await apiService.startTask(task.id);
      setSession(res.session);

      // Open task URL in new tab
      window.open(task.url, '_blank', 'noopener,noreferrer');

      // Start countdown
      if (task.durationSeconds > 0) {
        setSecondsRemaining(task.durationSeconds);
        setTimerActive(true);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to start task.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndClaim = async () => {
    setLoading(true);
    try {
      const res = await apiService.completeTask(task.id);
      setIsCompleted(true);
      toast.success(`🎉 +${res.result.creditsAwarded} Credits Claimed!`);

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (_e) {
        // Ignore confetti error
      }

      await refreshUser();
      if (onTaskCompleted) {
        onTaskCompleted(task.id, res.result.creditsAwarded);
      }
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      toast.error(err.message || 'Verification failed. Please ensure requirements were met.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task.title}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Reward Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '12px 16px',
            borderRadius: '10px',
            border: '1px solid var(--border-glass)',
          }}
        >
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Reward</span>
          <span style={{ color: 'var(--warning)', fontWeight: 800, fontSize: '1.1rem' }}>
            +{task.creditsReward} Credits
          </span>
        </div>

        {/* Instructions */}
        <div>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '6px' }}>Instructions:</h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            {task.instructions || 'Click the link below, fulfill the instructions, and return here to claim credits.'}
          </p>
        </div>

        {/* Timer / Progress Section */}
        {task.durationSeconds > 0 && (
          <div
            style={{
              padding: '16px',
              borderRadius: '10px',
              background: 'rgba(13, 17, 23, 0.8)',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} color={secondsRemaining === 0 ? '#00b894' : '#fdcb6e'} />
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Required Time</div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                  {secondsRemaining > 0 ? `${secondsRemaining}s remaining` : 'Time Completed!'}
                </div>
              </div>
            </div>
            {secondsRemaining === 0 && session && (
              <span className="badge badge-success">Ready to Claim</span>
            )}
          </div>
        )}

        {/* Anti-Cheat notice */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.8rem', color: 'var(--text-sub)' }}>
          <AlertCircle size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
          <span>Our automated verification system checks dwell time and task activity. Closing the window early will invalidate the reward.</span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
          {!session ? (
            <button
              onClick={handleStartTask}
              disabled={loading}
              className="btn btn-primary"
              style={{ flex: 1, padding: '12px' }}
            >
              <ExternalLink size={18} />
              {loading ? 'Starting...' : 'Open Task & Start'}
            </button>
          ) : (
            <button
              onClick={handleVerifyAndClaim}
              disabled={loading || secondsRemaining > 0 || isCompleted}
              className="btn btn-accent"
              style={{ flex: 1, padding: '12px' }}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 size={18} /> Claimed!
                </>
              ) : secondsRemaining > 0 ? (
                `Wait ${secondsRemaining}s...`
              ) : (
                <>
                  <CheckCircle2 size={18} /> Verify & Claim +{task.creditsReward} CR
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default TaskExecutionModal;
