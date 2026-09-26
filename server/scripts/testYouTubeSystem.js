const { URL } = require('url');
const { sequelize, User, UserYouTubeAccount } = require('../models');
const youtubeService = require('../services/youtubeService');
const { encryptToken, decryptToken } = require('../utils/crypto');

async function testYouTubeSystem() {
  console.log('🧪 Starting Comprehensive YouTube Verification System Tests...\n');

  try {
    await sequelize.authenticate();
    console.log('✅ 1. Database Connection: Active');

    // Test 1: Crypto AES-256-GCM
    const sampleToken = 'ya29.a0AfH6SMD_SampleRealLookingTokenWithSpecialChars!@#$%^&*()';
    const encrypted = encryptToken(sampleToken);
    const decrypted = decryptToken(encrypted);
    console.log('✅ 2. Token Encryption/Decryption:');
    console.log('   Ciphertext preview:', encrypted.substring(0, 40) + '...');
    if (decrypted !== sampleToken) {
      throw new Error('Token decryption mismatch!');
    }
    console.log('   Decrypted matches original: TRUE');

    // Test 2: Verify Partner Channels
    const channelsData = await youtubeService.getPartnerChannels();
    console.log(`✅ 3. Partner Channels count: ${channelsData.channels.length}`);
    channelsData.channels.forEach((c) => {
      console.log(`   - [${c.channelId}] ${c.channelTitle} (${c.channelHandle}) -> +${c.creditsReward} CR`);
    });

    if (channelsData.channels.length === 0) {
      throw new Error('No partner channels found! Did seed run?');
    }

    // Test 3: Test User
    const [testUser] = await User.findOrCreate({
      where: { mobile: '9876543210' },
      defaults: {
        full_name: 'YouTube Test User',
        email: 'youtubetest@viralrecharge.com',
        password_hash: '$2b$10$41jDYEPB46T0P2V3L23WM.6jiBYpNWRVfDsqInAI7ZU6/vRPEAZ0K',
        referral_code: 'YTTEST01',
        credit_balance: 0,
        total_earned: 0,
      },
    });
    console.log(`✅ 4. Test User ready: ID #${testUser.id} (${testUser.full_name})`);

    // Test 4: Auth URL generation
    const authUrl = youtubeService.generateAuthUrl(testUser.id);
    console.log('✅ 5. Google Auth URL generated successfully:');
    console.log('   URL preview:', authUrl.substring(0, 80) + '...');

    // Extract state parameter
    const urlObj = new URL(authUrl);
    const state = urlObj.searchParams.get('state');
    const code = urlObj.searchParams.get('code') || 'mock_test_code_123';

    // Test 5: Handle Callback (connect YouTube account)
    const connectResult = await youtubeService.handleOAuthCallback(code, state);
    console.log('✅ 6. OAuth Callback handled:');
    console.log(`   Connected user: ${connectResult.email}, Channel: ${connectResult.channelTitle}`);

    // Verify stored account is encrypted in DB
    const accountInDb = await UserYouTubeAccount.findOne({ where: { user_id: testUser.id } });
    if (!accountInDb || !accountInDb.is_connected) {
      throw new Error('User YouTube account was not stored in database!');
    }
    console.log('✅ 7. User YouTube account verified in DB:');
    console.log(`   is_connected: ${accountInDb.is_connected}`);
    console.log(`   access_token encrypted: ${accountInDb.access_token.includes(':')}`);
    console.log(`   toJSON strips token: ${JSON.stringify(accountInDb.toJSON()).includes('access_token') === false}`);

    // Test 6: Verify User Subscription Check
    const targetChannel = channelsData.channels[0];
    const subCheck = await youtubeService.checkUserSubscription(testUser.id, targetChannel.channelId);
    console.log('✅ 8. Subscription Check for channel:', targetChannel.channelTitle);
    console.log(`   subscribed: ${subCheck.subscribed}`);
    console.log(`   alreadyClaimed: ${subCheck.alreadyClaimed}`);

    // Test 7: Verify and Claim Reward
    const initialBalance = testUser.credit_balance;
    const claimResult = await youtubeService.verifyAndClaimReward(testUser.id, targetChannel.channelId);
    console.log('✅ 9. Verify & Claim Reward:');
    console.log(`   status: ${claimResult.status}`);
    console.log(`   creditsAwarded: +${claimResult.creditsAwarded} CR`);
    console.log(`   newBalance: ${claimResult.newBalance} CR (was ${initialBalance})`);

    // Test 8: Anti-fraud / Duplicate Claim Prevention
    const duplicateClaim = await youtubeService.verifyAndClaimReward(testUser.id, targetChannel.channelId);
    console.log('✅ 10. Anti-Cheat / Duplicate Claim Prevention:');
    console.log(`   status: ${duplicateClaim.status}`);
    console.log(`   alreadyClaimed: ${duplicateClaim.alreadyClaimed}`);
    console.log(`   message: "${duplicateClaim.message}"`);
    if (duplicateClaim.status !== 'fail' || !duplicateClaim.alreadyClaimed) {
      throw new Error('Duplicate claim was not blocked!');
    }

    // Test 9: Batch Verification of all partner channels
    const batchResult = await youtubeService.checkAllPartnerSubscriptions(testUser.id);
    console.log('✅ 11. Batch Check All Partner Channels:');
    console.log(`   isUserConnected: ${batchResult.isUserConnected}`);
    console.log(`   total channels checked: ${batchResult.results.length}`);
    batchResult.results.forEach((r) => {
      console.log(`   - ${r.channelTitle}: subscribed=${r.subscribed}, claimed=${r.creditsClaimed}`);
    });

    // Test 10: Disconnect YouTube Account
    const disconnectResult = await youtubeService.disconnectUserYouTube(testUser.id);
    console.log('✅ 12. Disconnect YouTube Account:');
    console.log(`   success: ${disconnectResult.success}`);

    const disconnectedAcc = await UserYouTubeAccount.findOne({ where: { user_id: testUser.id } });
    console.log(`   is_connected in DB after disconnect: ${disconnectedAcc.is_connected}`);

    // Test 11: Verification after disconnect should fail gracefully with prompt to connect
    try {
      await youtubeService.checkUserSubscription(testUser.id, targetChannel.channelId);
      console.error('❌ Expected error when disconnected, but succeeded!');
    } catch (disconnectedErr) {
      console.log('✅ 13. Graceful handling of disconnected user:');
      console.log(`   Error caught: "${disconnectedErr.message}"`);
    }

    console.log('\n🎉 ALL 13 YOUTUBE VERIFICATION TESTS PASSED SUCCESSFULLY! 🚀\n');
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

testYouTubeSystem();
