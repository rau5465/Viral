const redis = require('../config/redis');
const { getLeaderboard } = require('../services/referralService');
const { getAvailableTasks } = require('../services/taskService');
const { getActiveAnnouncements } = require('../services/announcementService');
const { getPartnerChannels } = require('../services/youtubeService');

const runTests = async () => {
  console.log('🧪 Starting ViralRecharge Redis & High-Traffic Optimization Test Suite...\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  };

  try {
    // Test 1: Redis Health Check
    console.log('--- Test 1: Redis Telemetry & Health ---');
    const health = await redis.getRedisHealth();
    assert(health && health.status, `Redis health reported (status: ${health.status}, type: ${health.type})`);

    // Test 2: Basic Set and Get
    console.log('\n--- Test 2: Cache Key Operations (SET, GET, DEL) ---');
    await redis.set('test:speed', { message: 'instant', number: 100 }, 5);
    const cachedVal = await redis.get('test:speed');
    assert(cachedVal && cachedVal.message === 'instant' && cachedVal.number === 100, 'Cache SET and GET serialized JSON');

    await redis.del('test:speed');
    const deletedVal = await redis.get('test:speed');
    assert(deletedVal === null, 'Cache DEL successfully removes key');

    // Test 3: Pattern Deletion
    console.log('\n--- Test 3: Safe Pattern Deletion (delPattern) ---');
    await redis.set('cache:user:1:profile', { name: 'User 1' }, 10);
    await redis.set('cache:user:2:profile', { name: 'User 2' }, 10);
    await redis.set('cache:tasks:list', { tasks: [] }, 10);

    const deletedCount = await redis.delPattern('cache:user:*');
    assert(deletedCount >= 2, `Pattern matching correctly deleted user keys (deleted: ${deletedCount})`);
    const remainingTaskCache = await redis.get('cache:tasks:list');
    assert(remainingTaskCache !== null, 'Pattern deletion spared non-matching keys');
    await redis.del('cache:tasks:list');

    // Test 4: Cache-Aside (getOrSet)
    console.log('\n--- Test 4: Cache-Aside Pattern (getOrSet) ---');
    let dbQueryCount = 0;
    const fetchFromDb = async () => {
      dbQueryCount++;
      return { data: 'heavy_query_result', timestamp: Date.now() };
    };

    const firstCall = await redis.getOrSet('test:cache_aside', fetchFromDb, 10);
    const secondCall = await redis.getOrSet('test:cache_aside', fetchFromDb, 10);
    assert(dbQueryCount === 1, `DB fetch executed only once on first call (dbQueryCount: ${dbQueryCount})`);
    assert(firstCall.data === secondCall.data, 'Cached value returned on second call');
    await redis.del('test:cache_aside');

    // Test 5: Distributed Locking
    console.log('\n--- Test 5: Distributed Lock & Concurrency Defense ---');
    const lockKey = 'user:payout:42';
    const token1 = await redis.acquireLock(lockKey, 5);
    assert(!!token1, 'Successfully acquired lock on first attempt');

    const token2 = await redis.acquireLock(lockKey, 5);
    assert(token2 === null, 'Second concurrent lock attempt blocked (returns null)');

    const released = await redis.releaseLock(lockKey, token1);
    assert(released === true, 'Lock released safely with token verification');

    const token3 = await redis.acquireLock(lockKey, 5);
    assert(!!token3, 'Lock can be re-acquired after release');
    await redis.releaseLock(lockKey, token3);

    // Test 6: Rate Limiter Store Factory
    console.log('\n--- Test 6: Rate Limiter Store Creation ---');
    const rateStore = redis.createRateLimitStore('api');
    assert(rateStore !== null, 'Rate limit store factory cleanly handles environment');

    // Test 7: Caching Services Integration
    console.log('\n--- Test 7: Service Caching Integrations ---');
    const announcements = await getActiveAnnouncements();
    assert(Array.isArray(announcements), `getActiveAnnouncements returns cached array (${announcements.length} items)`);

    const leaderboard = await getLeaderboard(5);
    assert(Array.isArray(leaderboard), `getLeaderboard returns cached rankings (${leaderboard.length} entries)`);

    const tasks = await getAvailableTasks(1);
    assert(Array.isArray(tasks), `getAvailableTasks returns cached catalog (${tasks.length} tasks)`);

    const ytChannels = await getPartnerChannels(1);
    assert(ytChannels && Array.isArray(ytChannels.channels), `getPartnerChannels returns cached partner channels (${ytChannels.channels.length} channels)`);

  } catch (err) {
    console.error('Unexpected error during tests:', err);
    failed++;
  }

  console.log(`\n===============================================`);
  console.log(`🏁 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`===============================================`);

  process.exit(failed > 0 ? 1 : 0);
};

runTests();
