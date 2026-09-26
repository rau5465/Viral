const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./config/db');

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const referralRoutes = require('./routes/referralRoutes');
const rechargeRoutes = require('./routes/rechargeRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const adminRoutes = require('./routes/adminRoutes');

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

// Logging Middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests, please try again later.',
  },
});
app.use('/api', apiLimiter);

// Health Check API
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    await sequelize.authenticate();
    dbStatus = 'connected';
  } catch (error) {
    dbStatus = `error: ${error.message}`;
  }

  res.status(200).json({
    status: 'success',
    app: 'ViralRecharge API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      name: process.env.DB_NAME || 'viral',
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

// 404 Handler
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
