module.exports = {
  apps: [
    {
      name: 'viral-recharge-api',
      script: './server.js',
      instances: 'max', // Scales across all available CPU cores
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
        DB_POOL_MAX: 30,
        DB_LOGGING: 'false',
        REDIS_ENABLED: 'true',
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 5000,
        DB_POOL_MAX: 10,
        DB_LOGGING: 'false',
        REDIS_ENABLED: 'true',
      },
      kill_timeout: 5000,
      listen_timeout: 8000,
      exp_backoff_restart_delay: 100,
    },
  ],
};
