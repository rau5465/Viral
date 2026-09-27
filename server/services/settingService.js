const { del, get, set } = require('../config/redis');

// ─────────────────────────────────────────────────────────────────────
//  CREDIT RATE SETTINGS
// ─────────────────────────────────────────────────────────────────────

// In-memory persistent default settings
let platformSettings = {
  credit_rate_display: '1Rs = 1 Credit',
  rupees: 1,
  credits: 1,
  updated_at: new Date().toISOString(),
  updated_by: 'System Administrator',
};

const SETTINGS_CACHE_KEY = 'cache:platform:settings:credit_rate';

/**
 * Get current platform credit rate
 */
const getCreditRate = async () => {
  try {
    const cached = await get(SETTINGS_CACHE_KEY);
    if (cached) {
      return cached;
    }
  } catch (err) {
    console.warn('[settingService] Redis get error:', err.message);
  }
  return platformSettings;
};

/**
 * Update current platform credit rate (Admin only)
 */
const updateCreditRate = async ({ rate_display, rupees = 1, credits = 1, adminName = 'Admin' }) => {
  const display = rate_display || `${rupees}Rs = ${credits} Credit${credits > 1 ? 's' : ''}`;
  platformSettings = {
    credit_rate_display: display,
    rupees: Number(rupees),
    credits: Number(credits),
    updated_at: new Date().toISOString(),
    updated_by: adminName,
  };

  try {
    await set(SETTINGS_CACHE_KEY, platformSettings, 86400 * 30); // Cache for 30 days
  } catch (err) {
    console.warn('[settingService] Redis set error:', err.message);
  }

  return platformSettings;
};

// ─────────────────────────────────────────────────────────────────────
//  MAINTENANCE MODE SETTINGS
// ─────────────────────────────────────────────────────────────────────

let maintenanceState = {
  enabled: false,
  message: 'We are currently performing scheduled maintenance. We will be back shortly. Thank you for your patience!',
  updated_at: new Date().toISOString(),
  updated_by: 'System',
};

const MAINTENANCE_CACHE_KEY = 'cache:platform:settings:maintenance';

/**
 * Get current maintenance mode status (public)
 */
const getMaintenanceMode = async () => {
  try {
    const cached = await get(MAINTENANCE_CACHE_KEY);
    if (cached) return cached;
  } catch (err) {
    console.warn('[settingService] Redis get maintenance error:', err.message);
  }
  return maintenanceState;
};

/**
 * Update maintenance mode (Admin only)
 */
const updateMaintenanceMode = async ({ enabled, message, adminName = 'Admin' }) => {
  maintenanceState = {
    enabled: Boolean(enabled),
    message: message || maintenanceState.message,
    updated_at: new Date().toISOString(),
    updated_by: adminName,
  };

  try {
    await set(MAINTENANCE_CACHE_KEY, maintenanceState, 86400); // Cache for 24 hours
  } catch (err) {
    console.warn('[settingService] Redis set maintenance error:', err.message);
  }

  return maintenanceState;
};

/**
 * Clear all platform cache keys
 */
const clearPlatformCache = async () => {
  const keys = [
    SETTINGS_CACHE_KEY,
    MAINTENANCE_CACHE_KEY,
    'cache:platform:settings:*',
  ];
  let cleared = 0;
  for (const key of keys) {
    try {
      await del(key);
      cleared++;
    } catch (_err) {
      // Ignore individual key errors
    }
  }
  return cleared;
};

module.exports = {
  getCreditRate,
  updateCreditRate,
  platformSettings,
  getMaintenanceMode,
  updateMaintenanceMode,
  clearPlatformCache,
};
