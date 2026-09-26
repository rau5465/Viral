const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { sequelize, getDbPoolStatus } = require('./config/db');
const { getRedisHealth } = require('./config/redis');
const { apiLimiter } = require('./middleware/rateLimiters');

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const referralRoutes = require('./routes/referralRoutes');
const rechargeRoutes = require('./routes/rechargeRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const youtubeRoutes = require('./routes/youtubeRoutes');

const errorHandler = require('./middleware/errorMiddleware');
const AppError = require('./utils/AppError');
require('dotenv').config();

const app = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// High-Traffic HTTP Compression (gzip / deflate for responses > 1KB)
app.use(
  compression({
    threshold: 1024,
    level: 6,
  })
);

// Logging Middleware (streamlined in high-load production)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// Body Parser
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Global Distributed Rate Limiter
app.use('/api', apiLimiter);

// High-Traffic Comprehensive Health & Telemetry Check
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    await sequelize.authenticate();
    dbStatus = 'connected';
  } catch (error) {
    dbStatus = `error: ${error.message}`;
  }

  const redisHealth = await getRedisHealth();
  const dbPool = getDbPoolStatus();
  const memUsage = process.memoryUsage();

  res.status(200).json({
    status: 'success',
    app: 'ViralRecharge API',
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      name: process.env.DB_NAME || 'viral',
      pool: dbPool,
    },
    redis: redisHealth,
    process: {
      pid: process.pid,
      nodeVersion: process.version,
      memory: {
        rssMB: (memUsage.rss / 1024 / 1024).toFixed(2),
        heapUsedMB: (memUsage.heapUsed / 1024 / 1024).toFixed(2),
        heapTotalMB: (memUsage.heapTotal / 1024 / 1024).toFixed(2),
      },
    },
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/recharges', rechargeRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/youtube', youtubeRoutes);

// 404 Handler
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
