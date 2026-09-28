const { redisClient, isRedisReady } = require('../config/redis');
const { ActiveUserSnapshot, sequelize } = require('../models');

// Configuration
const ACTIVITY_WINDOW_SECONDS = 180; // 3 minutes idle window considers user "live"
const MEMORY_TTL_MS = ACTIVITY_WINDOW_SECONDS * 1000;

// High-performance In-Memory Fallback Map (userKey -> lastSeenEpochMs)
const activeMemoryUsers = new Map();

class ActiveUserService {
  /**
   * Register a user heartbeat.
   * Extremely lightweight: single in-memory Map entry or Redis ZADD (O(1)).
   *
   * @param {string|number} identifier - user ID or client fingerprint / guest session ID
   * @param {boolean} isAuthenticated
   */
  async recordHeartbeat(identifier, isAuthenticated = false) {
    if (!identifier) return;
    const now = Date.now();
    const type = isAuthenticated ? 'u' : 'g';
    const member = `${type}:${identifier}`;

    if (isRedisReady()) {
      try {
        await redisClient.zadd('active_live_users', now, member);
        return;
      } catch (err) {
        console.warn('[ActiveUserService] Redis zadd failed, falling back to memory:', err.message);
      }
    }

    // In-Memory fallback
    activeMemoryUsers.set(member, now);
  }

  /**
   * Prune expired members older than activity window.
   */
  async cleanupExpired(windowSeconds = ACTIVITY_WINDOW_SECONDS) {
    const cutoff = Date.now() - windowSeconds * 1000;

    if (isRedisReady()) {
      try {
        await redisClient.zremrangebyscore('active_live_users', '-inf', cutoff);
      } catch (err) {
        console.warn('[ActiveUserService] Redis cleanup error:', err.message);
      }
    }

    // Memory cleanup
    for (const [key, lastSeen] of activeMemoryUsers.entries()) {
      if (lastSeen < cutoff) {
        activeMemoryUsers.delete(key);
      }
    }
  }

  /**
   * Get current live user count broken down by authenticated vs guest.
   */
  async getCurrentLiveStats(windowSeconds = ACTIVITY_WINDOW_SECONDS) {
    const cutoff = Date.now() - windowSeconds * 1000;
    let members = [];

    if (isRedisReady()) {
      try {
        members = await redisClient.zrangebyscore('active_live_users', cutoff, '+inf');
      } catch (err) {
        console.warn('[ActiveUserService] Redis zrangebyscore error:', err.message);
      }
    }

    if (!members || members.length === 0) {
      // Memory fallback
      members = [];
      for (const [key, lastSeen] of activeMemoryUsers.entries()) {
        if (lastSeen >= cutoff) {
          members.push(key);
        }
      }
    }

    let authenticatedCount = 0;
    let guestCount = 0;

    for (const m of members) {
      if (m.startsWith('u:')) {
        authenticatedCount++;
      } else {
        guestCount++;
      }
    }

    return {
      totalLive: authenticatedCount + guestCount,
      authenticated: authenticatedCount,
      guests: guestCount,
      windowSeconds,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Save a historical snapshot to MySQL (called by background cron every 2-5 mins).
   */
  async recordSnapshot() {
    try {
      await this.cleanupExpired();
      const current = await this.getCurrentLiveStats();

      const snapshot = await ActiveUserSnapshot.create({
        timestamp: new Date(),
        live_users_count: current.totalLive,
        authenticated_count: current.authenticated,
        guest_count: current.guests,
      });

      return snapshot;
    } catch (err) {
      console.error('[ActiveUserService] Failed to record snapshot:', err.message);
      return null;
    }
  }

  /**
   * Get historical live user analytics for charts.
   * @param {string} range - '1h' | '6h' | '24h' | '7d'
   */
  async getLiveUserHistory(range = '24h') {
    let hours = 24;
    if (range === '1h') hours = 1;
    else if (range === '6h') hours = 6;
    else if (range === '7d') hours = 24 * 7;

    const [rows] = await sequelize.query(`
      SELECT 
        id,
        timestamp,
        live_users_count,
        authenticated_count,
        guest_count
      FROM active_user_snapshots
      WHERE timestamp >= NOW() - INTERVAL :hours HOUR
      ORDER BY timestamp ASC
    `, {
      replacements: { hours }
    });

    const currentLive = await this.getCurrentLiveStats();

    return {
      range,
      hours,
      current: currentLive,
      history: rows,
    };
  }
}

module.exports = new ActiveUserService();
