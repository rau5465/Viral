import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './AnnouncementTicker.css';

/**
 * AnnouncementTicker - A horizontally scrolling notice bar shown to all logged-in users,
 * just below the header. Content is controlled by the admin via the Announcements panel.
 */
const AnnouncementTicker = () => {
  const { isAuthenticated } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchAnnouncements = async () => {
      try {
        const res = await apiService.getAdminAnnouncements();
        const list = res?.announcements || res?.data || [];
        setAnnouncements(list.filter((a) => a && (a.message || a.content || a.title)));
      } catch (_err) {
        // Silently fail — announcements are non-critical
      }
    };

    fetchAnnouncements();
  }, [isAuthenticated]);

  if (!isAuthenticated || !visible || announcements.length === 0) return null;

  const messages = announcements
    .map((a) => a.message || a.content || a.title)
    .filter(Boolean);

  const tickerText = messages.join('   ⬥   ');

  return (
    <div className="announcement-ticker">
      <span className="ticker-label">📢 Notice</span>
      <div className="ticker-wrapper">
        <div className="ticker-content">
          {tickerText}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{tickerText}
        </div>
      </div>
      <button
        className="ticker-close"
        onClick={() => setVisible(false)}
        aria-label="Dismiss announcements"
        title="Dismiss"
      >
        ✕
      </button>
    </div>
  );
};

export default AnnouncementTicker;
