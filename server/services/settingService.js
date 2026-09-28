const { sequelize } = require('../config/db');
const { del, get, set } = require('../config/redis');

// ─────────────────────────────────────────────────────────────────────
//  MYSQL DATABASE HELPERS FOR RELIABLE PERSISTENCE
// ─────────────────────────────────────────────────────────────────────

const getFromDB = async (key) => {
  try {
    const [rows] = await sequelize.query(
      'SELECT setting_value, updated_at, updated_by FROM platform_settings WHERE setting_key = :key LIMIT 1',
      { replacements: { key } }
    );
    if (rows && rows.length > 0) {
      const val = typeof rows[0].setting_value === 'string'
        ? JSON.parse(rows[0].setting_value)
        : rows[0].setting_value;
      return {
        ...val,
        updated_at: rows[0].updated_at || val.updated_at,
        updated_by: rows[0].updated_by || val.updated_by,
      };
    }
  } catch (err) {
    console.warn('[settingService] DB get error for', key, err.message);
  }
  return null;
};

const saveToDB = async (key, valueObj, updatedBy = 'Admin') => {
  try {
    const jsonStr = JSON.stringify(valueObj);
    await sequelize.query(
      `INSERT INTO platform_settings (setting_key, setting_value, updated_by, updated_at)
       VALUES (:key, :val, :by, NOW())
       ON DUPLICATE KEY UPDATE setting_value = :val, updated_by = :by, updated_at = NOW()`,
      { replacements: { key, val: jsonStr, by: updatedBy } }
    );
  } catch (err) {
    console.warn('[settingService] DB save error for', key, err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────
//  CREDIT RATE SETTINGS
// ─────────────────────────────────────────────────────────────────────

let platformSettings = {
  credit_rate_display: '1Rs = 1 Credit',
  rupees: 1,
  credits: 1,
  updated_at: new Date().toISOString(),
  updated_by: 'System Administrator',
};

const SETTINGS_CACHE_KEY = 'cache:platform:settings:credit_rate';

const getCreditRate = async () => {
  try {
    const cached = await get(SETTINGS_CACHE_KEY);
    if (cached) return cached;
  } catch (err) {
    console.warn('[settingService] Redis get error:', err.message);
  }

  const dbVal = await getFromDB('credit_rate');
  if (dbVal) {
    platformSettings = dbVal;
    return dbVal;
  }

  return platformSettings;
};

const updateCreditRate = async ({ rate_display, rupees = 1, credits = 1, adminName = 'Admin' }) => {
  const display = rate_display || `${rupees}Rs = ${credits} Credit${credits > 1 ? 's' : ''}`;
  platformSettings = {
    credit_rate_display: display,
    rupees: Number(rupees),
    credits: Number(credits),
    updated_at: new Date().toISOString(),
    updated_by: adminName,
  };

  await saveToDB('credit_rate', platformSettings, adminName);

  try {
    await set(SETTINGS_CACHE_KEY, platformSettings, 86400 * 30);
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

const getMaintenanceMode = async () => {
  try {
    const cached = await get(MAINTENANCE_CACHE_KEY);
    if (cached) return cached;
  } catch (err) {
    console.warn('[settingService] Redis get maintenance error:', err.message);
  }

  const dbVal = await getFromDB('maintenance');
  if (dbVal) {
    maintenanceState = dbVal;
    return dbVal;
  }

  return maintenanceState;
};

const updateMaintenanceMode = async ({ enabled, message, adminName = 'Admin' }) => {
  const current = (await getFromDB('maintenance')) || maintenanceState;
  maintenanceState = {
    enabled: Boolean(enabled),
    message: message || current.message,
    updated_at: new Date().toISOString(),
    updated_by: adminName,
  };

  await saveToDB('maintenance', maintenanceState, adminName);

  try {
    await set(MAINTENANCE_CACHE_KEY, maintenanceState, 86400);
  } catch (err) {
    console.warn('[settingService] Redis set maintenance error:', err.message);
  }

  return maintenanceState;
};

// ─────────────────────────────────────────────────────────────────────
//  REFERRAL REWARD & BONUS SETTINGS (Single Refer in First 2 Hours)
// ─────────────────────────────────────────────────────────────────────

let referralSettings = {
  bonus_reward_2h: 50,     // Single Refer reward in first 2 hours
  standard_reward: 10,     // Referral reward after 2 hours
  target_referrals: 1,     // Single refer
  bonus_window_hours: 2,   // 2 hours window
  updated_at: new Date().toISOString(),
  updated_by: 'System Administrator',
};

const REFERRAL_SETTINGS_CACHE_KEY = 'cache:platform:settings:referral';

const getReferralSettings = async () => {
  try {
    const cached = await get(REFERRAL_SETTINGS_CACHE_KEY);
    if (cached) return cached;
  } catch (err) {
    console.warn('[settingService] Redis get referral settings error:', err.message);
  }

  const dbVal = await getFromDB('referral_settings');
  if (dbVal) {
    referralSettings = dbVal;
    return dbVal;
  }

  return referralSettings;
};

const updateReferralSettings = async ({
  bonus_reward_2h,
  standard_reward,
  bonus_window_hours = 2,
  adminName = 'Admin',
}) => {
  const current = (await getFromDB('referral_settings')) || referralSettings;
  referralSettings = {
    bonus_reward_2h: Number(bonus_reward_2h !== undefined ? bonus_reward_2h : current.bonus_reward_2h),
    standard_reward: Number(standard_reward !== undefined ? standard_reward : current.standard_reward),
    target_referrals: 1, // Fixed to 1 for Single Refer policy
    bonus_window_hours: Number(bonus_window_hours !== undefined ? bonus_window_hours : (current.bonus_window_hours || 2)),
    updated_at: new Date().toISOString(),
    updated_by: adminName,
  };

  await saveToDB('referral_settings', referralSettings, adminName);

  try {
    await set(REFERRAL_SETTINGS_CACHE_KEY, referralSettings, 86400 * 30);
  } catch (err) {
    console.warn('[settingService] Redis set referral settings error:', err.message);
  }

  return referralSettings;
};

// ─────────────────────────────────────────────────────────────────────
//  CACHE CLEARING
// ─────────────────────────────────────────────────────────────────────

const clearPlatformCache = async () => {
  const keys = [
    SETTINGS_CACHE_KEY,
    MAINTENANCE_CACHE_KEY,
    REFERRAL_SETTINGS_CACHE_KEY,
    'cache:platform:settings:*',
  ];
  let cleared = 0;
  for (const key of keys) {
    try {
      await del(key);
      cleared++;
    } catch (_err) {}
  }
  return cleared;
};

module.exports = {
  getCreditRate,
  updateCreditRate,
  platformSettings,
  getMaintenanceMode,
  updateMaintenanceMode,
  getReferralSettings,
  updateReferralSettings,
  referralSettings,
  clearPlatformCache,
  getFromDB,
  saveToDB,
};
