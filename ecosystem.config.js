const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

module.exports = {
  apps: [{
    name: 'sol-trading-bot-enhanced',
    script: 'enhanced-bot.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    restart_delay: 5000,
    env_file: '.env',
    log_file: './logs/enhanced-combined.log',
    out_file: './logs/enhanced-out.log',
    error_file: './logs/enhanced-error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    time: true
  }, {
    name: 'sol-trading-bot-enhanced-buycurrent',
    script: 'enhanced-bot.js',
    args: '--buy-current-price',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    restart_delay: 5000,
    env_file: '.env',
    log_file: './logs/enhanced-buycurrent-combined.log',
    out_file: './logs/enhanced-buycurrent-out.log',
    error_file: './logs/enhanced-buycurrent-error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    time: true
  }, {
    name: 'sol-trading-bot-basic',
    script: 'bot.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    restart_delay: 5000,
    env_file: '.env',
    log_file: './logs/basic-combined.log',
    out_file: './logs/basic-out.log',
    error_file: './logs/basic-error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    time: true
  }, {
    name: 'pm2-env-test',
    script: 'test-pm2-env.js',
    instances: 1,
    autorestart: true,
    watch: false,
    env_file: '.env',
    log_file: './logs/pm2-test.log',
    out_file: './logs/pm2-test-out.log',
    error_file: './logs/pm2-test-error.log'
  }]
};
