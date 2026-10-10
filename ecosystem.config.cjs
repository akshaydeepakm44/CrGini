const path = require('path');

module.exports = {
  apps: [
    {
      name: 'creativegini-backend',
      script: 'src/server.js',
      cwd: path.resolve(__dirname, 'backend'),
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      watch: false,
      max_memory_restart: '512M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      restart_delay: 4000,
      max_restarts: 10,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
};
