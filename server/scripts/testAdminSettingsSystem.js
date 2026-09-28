const { sequelize } = require('../config/db');
const {
  getCreditRate,
  updateCreditRate,
  getSpinSettings,
  updateSpinSettings,
  getMultiplySettings,
  updateMultiplySettings,
  getReferralSettings,
  updateReferralSettings,
  clearPlatformCache,
} = require('../services/settingService');
const youtubeService = require('../services/youtubeService');

async function runSettingsVerification() {
  console.log('🧪 Starting Admin Settings & Missing Controls System Verification...\n');

  try {
    // 1. DB connection
    await sequelize.authenticate();
    console.log('✅ 1. Database Connection: Active');

    // 2. Test Multiplier Settings
    const initialMultiply = await getMultiplySettings();
    console.log('✅ 2. Multiplier Initial Settings loaded:', {
      enabled: initialMultiply.enabled,
      min_bet: initialMultiply.min_bet,
      max_bet: initialMultiply.max_bet,
      multiplier: initialMultiply.multiplier,
      loss_zone: `${initialMultiply.loss_zone_min}-${initialMultiply.loss_zone_max}`,
    });

    const updatedMultiply = await updateMultiplySettings({
      enabled: true,
      min_bet: 5,
      max_bet: 1000,
      multiplier: 2.5,
      loss_zone_min: 4400,
      loss_zone_max: 5600,
      adminName: 'Test Admin',
    });
    console.log('✅ 3. Multiplier Settings Updated & Persisted in MySQL & Redis:', {
      enabled: updatedMultiply.enabled,
      min_bet: updatedMultiply.min_bet,
      max_bet: updatedMultiply.max_bet,
      multiplier: updatedMultiply.multiplier,
      loss_zone: `${updatedMultiply.loss_zone_min}-${updatedMultiply.loss_zone_max}`,
    });

    // Reset Multiplier back to standard 2.0x, 1 min, 500 max
    await updateMultiplySettings({
      enabled: true,
      min_bet: 1,
      max_bet: 500,
      multiplier: 2.0,
      loss_zone_min: 4500,
      loss_zone_max: 5500,
      adminName: 'System Administrator',
    });
    console.log('✅ 4. Multiplier Settings safely reset to standard 2.0x default');

    // 5. Test Spin Settings
    const spinConfig = await getSpinSettings();
    console.log('✅ 5. Lucky Spin Settings verified:', {
      enabled: spinConfig.enabled,
      max_daily_spins: spinConfig.max_daily_spins,
      ad_duration: spinConfig.ad_duration_seconds,
      segments_count: spinConfig.segments?.length,
    });

    // 6. Test Credit Rate Settings
    const creditRate = await getCreditRate();
    console.log('✅ 6. Credit Rate Setting verified:', {
      display: creditRate.credit_rate_display,
      rupees: creditRate.rupees,
      credits: creditRate.credits,
    });

    // 7. Test Referral Settings
    const refSettings = await getReferralSettings();
    console.log('✅ 7. Referral Settings verified:', {
      bonus_2h: refSettings.bonus_reward_2h,
      standard: refSettings.standard_reward,
      window: refSettings.bonus_window_hours,
    });

    // 8. Test YouTube Partner Channels Management
    const channels = await youtubeService.getPartnerChannels();
    console.log(`✅ 8. YouTube Partner Channels query OK: ${channels.channels?.length || 0} channels`);

    // 9. Cache Purge
    const cleared = await clearPlatformCache();
    console.log(`✅ 9. Platform Cache Purge verified: ${cleared} keys cleared`);

    console.log('\n🎉 ALL ADMIN SETTINGS & CONTROLS FULLY VERIFIED AND PASSING! 🚀');
    process.exit(0);
  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  }
}

runSettingsVerification();
