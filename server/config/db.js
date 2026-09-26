const { Sequelize } = require('sequelize');
require('dotenv').config();

const isLoggingEnabled = process.env.DB_LOGGING === 'true';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'viral',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    dialect: 'mysql',
    logging: isLoggingEnabled ? console.log : false,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX, 10) || 50,
      min: parseInt(process.env.DB_POOL_MIN, 10) || 5,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE, 10) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE, 10) || 10000,
      evict: 1000,
    },
    dialectOptions: {
      connectTimeout: 10000,
      decimalNumbers: true,
    },
    define: {
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Database connected successfully via Sequelize!');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to MySQL database:', error.message);
    return false;
  }
};

/**
 * Returns current database pool status for health monitoring
 */
const getDbPoolStatus = () => {
  try {
    const pool = sequelize.connectionManager.pool;
    if (!pool) return { status: 'uninitialized' };
    return {
      size: pool.size,
      available: pool.available,
      using: pool.using,
      waiting: pool.waiting,
      max: pool.max,
      min: pool.min,
    };
  } catch {
    return { status: 'unknown' };
  }
};

module.exports = {
  sequelize,
  testConnection,
  getDbPoolStatus,
};
