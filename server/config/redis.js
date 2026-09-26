const Redis = require('ioredis');
const { RedisStore } = require('rate-limit-redis');
require('dotenv').config();

// Redis connection parameters
const REDIS_URL = process.env.REDIS_URL;
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = parseInt(process.env.REDIS_PORT, 10) || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;
const REDIS_DB = parseInt(process.env.REDIS_DB, 10) || 0;
const REDIS_PREFIX = process.env.REDIS_KEY_PREFIX || 'vr:';
const REDIS_ENABLED = process.env.REDIS_ENABLED !== 'false';

let redisClient = null;
let isConnected = false;
let connectionAttempted = false;
let warnLogged = false;

// In-memory fallback cache for development/offline mode
const memoryCache = new Map();
const memoryTimeouts = new Map();

/**
 * Initializes and returns the Redis client singleton
 */
const initRedis = () => {
  if (redisClient || !REDIS_ENABLED) {
    return redisClient;
  }

  const options = {
    keyPrefix: REDIS_PREFIX,
    lazyConnect: true,
    connectTimeout: 5000,
    maxRetriesPerRequest: 2,
    enableReadyCheck: true,
    retryStrategy: (times) => {
      // Exponential backoff capped at 5 seconds
      const delay = Math.min(times * 200, 5000);
      if (times > 10 && !warnLogged) {
        console.warn('⚠️ [Redis] High reconnect count reached. Continuing with graceful degraded fallback...');
        warnLogged = true;
      }
      return delay;
    },
  };

  if (REDIS_PASSWORD) {
    options.password = REDIS_PASSWORD;
  }
  if (REDIS_DB) {
    options.db = REDIS_DB;
  }

  try {
    if (REDIS_URL) {
      redisClient = new Redis(REDIS_URL, options);
    } else {
      redisClient = new Redis({
        host: REDIS_HOST,
        port: REDIS_PORT,
        ...options,
      });
    }

    redisClient.on('connect', () => {
      console.log('🔌 [Redis] Establishing connection to Redis server...');
    });

    redisClient.on('ready', () => {
      isConnected = true;
      warnLogged = false;
      console.log(`✅ [Redis] Connected successfully to Redis at ${REDIS_HOST}:${REDIS_PORT} (DB: ${REDIS_DB})`);
    });

    redisClient.on('error', (err) => {
      isConnected = false;
      if (!warnLogged) {
        console.warn(`⚠️ [Redis] Connection warning: ${err.message}. Seamless fallback active.`);
        warnLogged = true;
      }
    });

    redisClient.on('close', () => {
      isConnected = false;
    });

    redisClient.on('reconnecting', () => {
      // Background reconnection
    });
  } catch (err) {
    console.warn(`⚠️ [Redis] Failed to initialize client: ${err.message}`);
    redisClient = null;
  }

  return redisClient;
};

// Initialize client
initRedis();

/**
 * Check if Redis is actively connected and ready for commands
 */
const isRedisReady = () => {
  return !!(redisClient && isConnected && redisClient.status === 'ready');
};

/**
 * Connect to Redis explicitly if using lazyConnect
 */
const connectRedis = async () => {
  if (!REDIS_ENABLED || !redisClient) return false;
  if (connectionAttempted && isConnected) return true;

  connectionAttempted = true;
  try {
    await redisClient.connect();
    isConnected = true;
    return true;
  } catch (err) {
    if (!warnLogged) {
      console.warn(`⚠️ [Redis] Startup connection to ${REDIS_HOST}:${REDIS_PORT} skipped (${err.message}). Using resilient in-memory fallback.`);
      warnLogged = true;
    }
    return false;
  }
};

/**
 * Get cached value (JSON parsed or raw string)
 * @param {string} key
 * @returns {Promise<any|null>}
 */
const get = async (key) => {
  if (isRedisReady()) {
    try {
      const data = await redisClient.get(key);
      if (!data) return null;
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    } catch (err) {
      console.warn(`[Redis GET error: ${key}]`, err.message);
    }
  }

  // In-memory fallback
  const item = memoryCache.get(key);
  if (!item) return null;
  if (item.expiry && item.expiry < Date.now()) {
    memoryCache.delete(key);
    return null;
  }
  return item.value;
};

/**
 * Set cache value with TTL in seconds
 * @param {string} key
 * @param {any} value
 * @param {number} ttlSeconds
 */
const set = async (key, value, ttlSeconds = 300) => {
  const serialized = typeof value === 'object' ? JSON.stringify(value) : String(value);

  if (isRedisReady()) {
    try {
      if (ttlSeconds && ttlSeconds > 0) {
        await redisClient.set(key, serialized, 'EX', ttlSeconds);
      } else {
        await redisClient.set(key, serialized);
      }
      return true;
    } catch (err) {
      console.warn(`[Redis SET error: ${key}]`, err.message);
    }
  }

  // In-memory fallback
  if (memoryTimeouts.has(key)) {
    clearTimeout(memoryTimeouts.get(key));
    memoryTimeouts.delete(key);
  }

  const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
  memoryCache.set(key, { value, expiry });

  if (ttlSeconds) {
    const maxDelay = 2147483647; // Max 32-bit signed int (~24.8 days)
    const delay = Math.min(ttlSeconds * 1000, maxDelay);
    const timeout = setTimeout(() => {
      memoryCache.delete(key);
      memoryTimeouts.delete(key);
    }, delay);
    if (timeout.unref) timeout.unref();
    memoryTimeouts.set(key, timeout);
  }

  return true;
};

/**
 * Delete one or more keys
 * @param  {...string} keys
 */
const del = async (...keys) => {
  if (!keys.length) return 0;

  keys.forEach((k) => {
    if (memoryTimeouts.has(k)) {
      clearTimeout(memoryTimeouts.get(k));
      memoryTimeouts.delete(k);
    }
    memoryCache.delete(k);
  });

  if (isRedisReady()) {
    try {
      return await redisClient.del(...keys);
    } catch (err) {
      console.warn('[Redis DEL error]', err.message);
    }
  }
  return keys.length;
};

/**
 * Delete keys matching pattern using non-blocking SCAN (safe for production)
 * @param {string} pattern - e.g. "cache:user:*"
 */
const delPattern = async (pattern) => {
  // Clear memory cache matching pattern
  let memDeleted = 0;
  const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
  for (const k of memoryCache.keys()) {
    if (regex.test(k)) {
      if (memoryTimeouts.has(k)) {
        clearTimeout(memoryTimeouts.get(k));
        memoryTimeouts.delete(k);
      }
      memoryCache.delete(k);
      memDeleted++;
    }
  }

  if (!isRedisReady()) return memDeleted;

  try {
    let cursor = '0';
    let totalDeleted = 0;
    // Prefix is already handled by ioredis keyPrefix option
    do {
      const [nextCursor, keys] = await redisClient.scan(
        cursor,
        'MATCH',
        `${REDIS_PREFIX}${pattern}`,
        'COUNT',
        100
      );
      cursor = nextCursor;
      if (keys.length > 0) {
        // Strip out the prefix before passing to redisClient.del because ioredis re-prepends keyPrefix
        const unprefixedKeys = keys.map((k) =>
          k.startsWith(REDIS_PREFIX) ? k.slice(REDIS_PREFIX.length) : k
        );
        const deleted = await redisClient.del(...unprefixedKeys);
        totalDeleted += deleted;
      }
    } while (cursor !== '0');

    return totalDeleted;
  } catch (err) {
    console.warn(`[Redis SCAN/DEL pattern error: ${pattern}]`, err.message);
    return 0;
  }
};

/**
 * Cache-Aside Pattern: Get cached data or execute fetchFn, cache result, and return
 * @param {string} key
 * @param {Function} fetchFn - Async function to fetch data if cache miss
 * @param {number} ttlSeconds - Cache TTL in seconds (default 300s = 5m)
 */
const getOrSet = async (key, fetchFn, ttlSeconds = 300) => {
  const cached = await get(key);
  if (cached !== null && cached !== undefined) {
    return cached;
  }

  const freshData = await fetchFn();
  if (freshData !== null && freshData !== undefined) {
    // Fire and forget caching to minimize response latency
    set(key, freshData, ttlSeconds).catch((err) =>
      console.warn(`[Redis async set error: ${key}]`, err.message)
    );
  }
  return freshData;
};

/**
 * Acquire a distributed lock for concurrency protection (SET lock:key token NX EX ttl)
 * Prevents race conditions / double credit claims across multiple server processes.
 * @param {string} lockKey
 * @param {number} ttlSeconds - Lock timeout in seconds (default 10s)
 * @returns {Promise<string|null>} Returns lock token if acquired, null if already locked
 */
const acquireLock = async (lockKey, ttlSeconds = 10) => {
  const token = `lock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  if (isRedisReady()) {
    try {
      const result = await redisClient.set(
        `lock:${lockKey}`,
        token,
        'NX',
        'EX',
        ttlSeconds
      );
      return result === 'OK' ? token : null;
    } catch (err) {
      console.warn(`[Redis Lock acquire error: ${lockKey}]`, err.message);
    }
  }

  // In-memory lock fallback
  const memKey = `mem_lock:${lockKey}`;
  if (memoryCache.has(memKey)) {
    return null;
  }
  memoryCache.set(memKey, { value: token, expiry: Date.now() + ttlSeconds * 1000 });
  const timeout = setTimeout(() => {
    memoryCache.delete(memKey);
  }, ttlSeconds * 1000);
  if (timeout.unref) timeout.unref();

  return token;
};

/**
 * Release a distributed lock safely using an atomic Lua script (verifies ownership)
 * @param {string} lockKey
 * @param {string} token
 */
const releaseLock = async (lockKey, token) => {
  if (!token) return false;

  if (isRedisReady()) {
    try {
      // Atomic Lua script: only delete if the token matches the lock holder
      const luaScript = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;
      const result = await redisClient.eval(luaScript, 1, `${REDIS_PREFIX}lock:${lockKey}`, token);
      return result === 1;
    } catch (err) {
      console.warn(`[Redis Lock release error: ${lockKey}]`, err.message);
    }
  }

  // In-memory fallback
  const memKey = `mem_lock:${lockKey}`;
  const held = memoryCache.get(memKey);
  if (held && held.value === token) {
    memoryCache.delete(memKey);
    return true;
  }
  return false;
};

/**
 * Sorted Set operations for real-time high-throughput Leaderboards
 */
const zadd = async (key, score, member) => {
  if (isRedisReady()) {
    try {
      return await redisClient.zadd(key, score, typeof member === 'object' ? JSON.stringify(member) : member);
    } catch (err) {
      console.warn(`[Redis ZADD error: ${key}]`, err.message);
    }
  }
  return 0;
};

const zrevrange = async (key, start = 0, stop = 9, withScores = false) => {
  if (isRedisReady()) {
    try {
      if (withScores) {
        return await redisClient.zrevrange(key, start, stop, 'WITHSCORES');
      }
      return await redisClient.zrevrange(key, start, stop);
    } catch (err) {
      console.warn(`[Redis ZREVRANGE error: ${key}]`, err.message);
    }
  }
  return [];
};

/**
 * Creates a rate-limit store backed by Redis (rate-limit-redis) with fallback
 * @param {string} prefix
 */
const createRateLimitStore = (prefix = 'rl') => {
  if (isRedisReady()) {
    try {
      return new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
        prefix: `vr:rl:${prefix}:`,
      });
    } catch (err) {
      console.warn(`[RateLimitStore initialization error]`, err.message);
    }
  }
  // undefined causes express-rate-limit to use its default MemoryStore
  return undefined;
};

/**
 * Get comprehensive Redis health check information
 */
const getRedisHealth = async () => {
  if (!REDIS_ENABLED) {
    return {
      status: 'disabled',
      type: 'in-memory-fallback',
      message: 'Redis disabled via REDIS_ENABLED=false',
    };
  }

  if (!isRedisReady()) {
    return {
      status: 'degraded',
      type: 'in-memory-fallback',
      connected: false,
      host: `${REDIS_HOST}:${REDIS_PORT}`,
      memoryCacheSize: memoryCache.size,
    };
  }

  try {
    const start = Date.now();
    await redisClient.ping();
    const pingLatencyMs = Date.now() - start;

    const info = await redisClient.info('server');
    const versionMatch = info.match(/redis_version:([^\r\n]+)/);
    const version = versionMatch ? versionMatch[1] : 'unknown';

    return {
      status: 'connected',
      type: 'redis',
      connected: true,
      pingMs: pingLatencyMs,
      version,
      host: `${REDIS_HOST}:${REDIS_PORT}`,
      db: REDIS_DB,
    };
  } catch (err) {
    return {
      status: 'error',
      type: 'in-memory-fallback',
      error: err.message,
    };
  }
};

/**
 * Close Redis connection gracefully on server shutdown
 */
const closeRedis = async () => {
  if (redisClient) {
    try {
      await redisClient.quit();
      console.log('💤 [Redis] Connection closed gracefully.');
    } catch (err) {
      console.warn('[Redis close error]', err.message);
    }
  }
};

module.exports = {
  redisClient,
  initRedis,
  connectRedis,
  isRedisReady,
  get,
  set,
  del,
  delPattern,
  getOrSet,
  acquireLock,
  releaseLock,
  zadd,
  zrevrange,
  createRateLimitStore,
  getRedisHealth,
  closeRedis,
};
