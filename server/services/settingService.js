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
//  SPIN WHEEL & REWARDED AD SETTINGS
// ─────────────────────────────────────────────────────────────────────

const DEFAULT_SPIN_SEGMENTS = [
  { id: 0, label: '1 Credit', credits: 1, color: '#3a86ff', textColor: '#ffffff', weight: 25 },
  { id: 1, label: '2 Credits', credits: 2, color: '#00e699', textColor: '#041d14', weight: 20 },
  { id: 2, label: '5 Credits', credits: 5, color: '#fde502', textColor: '#1a1800', weight: 15 },
  { id: 3, label: '1 Credit', credits: 1, color: '#8338ec', textColor: '#ffffff', weight: 15 },
  { id: 4, label: '10 Credits 🔥', credits: 10, color: '#ff006e', textColor: '#ffffff', weight: 8 },
  { id: 5, label: '1 Credit', credits: 1, color: '#00f5d4', textColor: '#03201a', weight: 10 },
  { id: 6, label: '20 Credits 👑', credits: 20, color: '#ffbe0b', textColor: '#261b00', weight: 4 },
  { id: 7, label: '2 Credits', credits: 2, color: '#fb5607', textColor: '#ffffff', weight: 3 },
];

let spinSettings = {
  max_daily_spins: 10,
  ad_duration_seconds: 15,
  enabled: true,
  segments: DEFAULT_SPIN_SEGMENTS,
  updated_at: new Date().toISOString(),
  updated_by: 'System Administrator',
};

const SPIN_SETTINGS_CACHE_KEY = 'cache:platform:settings:spin_wheel';

const getSpinSettings = async () => {
  try {
    const cached = await get(SPIN_SETTINGS_CACHE_KEY);
    if (cached) return cached;
  } catch (err) {
    console.warn('[settingService] Redis get spin settings error:', err.message);
  }

  const dbVal = await getFromDB('spin_settings');
  if (dbVal) {
    spinSettings = {
      ...spinSettings,
      ...dbVal,
      segments: (Array.isArray(dbVal.segments) && dbVal.segments.length > 0)
        ? dbVal.segments
        : DEFAULT_SPIN_SEGMENTS,
    };
    return spinSettings;
  }

  return spinSettings;
};

const updateSpinSettings = async ({
  max_daily_spins,
  ad_duration_seconds,
  enabled,
  segments,
  adminName = 'Admin',
}) => {
  const current = (await getFromDB('spin_settings')) || spinSettings;

  // Validate segments if provided
  let updatedSegments = current.segments || DEFAULT_SPIN_SEGMENTS;
  if (Array.isArray(segments) && segments.length === 8) {
    updatedSegments = segments.map((s, idx) => ({
      id: idx,
      label: String(s.label || `${s.credits || 1} Credit`).trim(),
      credits: Math.max(0, parseInt(s.credits, 10) || 0),
      color: s.color || DEFAULT_SPIN_SEGMENTS[idx].color,
      textColor: s.textColor || DEFAULT_SPIN_SEGMENTS[idx].textColor,
      weight: Math.max(1, parseInt(s.weight, 10) || 1),
    }));
  }

  spinSettings = {
    max_daily_spins: Number(max_daily_spins !== undefined ? max_daily_spins : (current.max_daily_spins || 10)),
    ad_duration_seconds: Number(ad_duration_seconds !== undefined ? ad_duration_seconds : (current.ad_duration_seconds || 15)),
    enabled: enabled !== undefined ? Boolean(enabled) : (current.enabled !== undefined ? current.enabled : true),
    segments: updatedSegments,
    updated_at: new Date().toISOString(),
    updated_by: adminName,
  };

  await saveToDB('spin_settings', spinSettings, adminName);

  try {
    await set(SPIN_SETTINGS_CACHE_KEY, spinSettings, 86400 * 30);
  } catch (err) {
    console.warn('[settingService] Redis set spin settings error:', err.message);
  }

  return spinSettings;
};

// ─────────────────────────────────────────────────────────────────────
//  MULTIPLIER (HI-LO DICE) GAME SETTINGS
// ─────────────────────────────────────────────────────────────────────

const DEFAULT_MULTIPLY_SETTINGS = {
  enabled: true,
  min_bet: 1,
  max_bet: 500,
  multiplier: 2.0,
  loss_zone_min: 4500,
  loss_zone_max: 5500,
  updated_at: new Date().toISOString(),
  updated_by: 'System Administrator',
};

let multiplySettings = { ...DEFAULT_MULTIPLY_SETTINGS };
const MULTIPLY_SETTINGS_CACHE_KEY = 'cache:platform:settings:multiply_game';

const getMultiplySettings = async () => {
  try {
    const cached = await get(MULTIPLY_SETTINGS_CACHE_KEY);
    if (cached) return cached;
  } catch (err) {
    console.warn('[settingService] Redis get multiply settings error:', err.message);
  }

  const dbVal = await getFromDB('multiply_settings');
  if (dbVal) {
    multiplySettings = {
      ...DEFAULT_MULTIPLY_SETTINGS,
      ...dbVal,
    };
    return multiplySettings;
  }

  return multiplySettings;
};

const updateMultiplySettings = async ({
  enabled,
  min_bet,
  max_bet,
  multiplier,
  loss_zone_min,
  loss_zone_max,
  adminName = 'Admin',
}) => {
  const current = (await getFromDB('multiply_settings')) || multiplySettings;

  multiplySettings = {
    enabled: enabled !== undefined ? Boolean(enabled) : (current.enabled !== undefined ? current.enabled : true),
    min_bet: min_bet !== undefined ? Math.max(1, parseInt(min_bet, 10) || 1) : (current.min_bet || 1),
    max_bet: max_bet !== undefined ? Math.max(1, parseInt(max_bet, 10) || 500) : (current.max_bet || 500),
    multiplier: multiplier !== undefined ? Math.max(1.1, parseFloat(multiplier) || 2.0) : (current.multiplier || 2.0),
    loss_zone_min: loss_zone_min !== undefined ? Math.max(1, parseInt(loss_zone_min, 10) || 4500) : (current.loss_zone_min || 4500),
    loss_zone_max: loss_zone_max !== undefined ? Math.min(10000, parseInt(loss_zone_max, 10) || 5500) : (current.loss_zone_max || 5500),
    updated_at: new Date().toISOString(),
    updated_by: adminName,
  };

  await saveToDB('multiply_settings', multiplySettings, adminName);

  try {
    await set(MULTIPLY_SETTINGS_CACHE_KEY, multiplySettings, 86400 * 30);
  } catch (err) {
    console.warn('[settingService] Redis set multiply settings error:', err.message);
  }

  return multiplySettings;
};

// ─────────────────────────────────────────────────────────────────────
//  CACHE CLEARING
// ─────────────────────────────────────────────────────────────────────

const clearPlatformCache = async () => {
  const keys = [
    SETTINGS_CACHE_KEY,
    MAINTENANCE_CACHE_KEY,
    REFERRAL_SETTINGS_CACHE_KEY,
    SPIN_SETTINGS_CACHE_KEY,
    MULTIPLY_SETTINGS_CACHE_KEY,
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
  getSpinSettings,
  updateSpinSettings,
  spinSettings,
  DEFAULT_SPIN_SEGMENTS,
  getMultiplySettings,
  updateMultiplySettings,
  multiplySettings,
  DEFAULT_MULTIPLY_SETTINGS,
  clearPlatformCache,
  getFromDB,
  saveToDB,
};
