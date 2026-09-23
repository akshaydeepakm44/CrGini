module.exports = {
  apps: [
    {
      name: 'creativegini-backend',
      script: 'src/server.js',
      cwd: '/home/ubuntu/CreativeGiniWeb/backend',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        POSTGRES_HOST: '127.0.0.1',
        POSTGRES_PORT: 5432,
        POSTGRES_DB: 'creativegini',
        POSTGRES_USER: 'creativegini_app',
        POSTGRES_PASSWORD: 'Akhil@08082004hema',
        JWT_SECRET: 'creativegini_jwt_secret_2026_production_key_secure',
        CLIENT_URL: 'https://www.creativegini.com,https://creativegini.com,http://57.128.31.115,http://localhost:5173,http://localhost:5174'
      },
      watch: false,
      max_memory_restart: '512M',
      error_file: '/home/ubuntu/.pm2/logs/creativegini-backend-error.log',
      out_file: '/home/ubuntu/.pm2/logs/creativegini-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      restart_delay: 4000,
      max_restarts: 10,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
};
