const app = require('./app');
const { testConnection } = require('./config/db');
const { connectRedis, closeRedis } = require('./config/redis');
const { initCronJobs } = require('./jobs/cronJobs');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Initialize Redis connection
    await connectRedis();

    // 2. Test MySQL connection
    const isDbConnected = await testConnection();
    if (!isDbConnected) {
      console.warn('⚠️ Warning: Database connection failed. Starting server in degraded mode...');
    } else {
      // Start background cron jobs once DB is ready
      initCronJobs();
    }

    const server = app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 ViralRecharge Server running on port ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
      console.log(`===============================================`);
    });

    const shutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        console.log('💤 HTTP server closed.');
        await closeRedis();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
};

startServer();
