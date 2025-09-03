# 🤖 Trading Bot Background Service Setup (PM2)

## Quick Start Commands

### 🚀 Start the bot as background service:
```bash
npm run pm2:start
```

### 📊 Check if bot is running:
```bash
npm run pm2:status
```

### 📋 View live logs:
```bash
npm run pm2:logs
```

### 🔄 Restart the bot:
```bash
npm run pm2:restart
```

### ⏹️ Stop the bot:
```bash
npm run pm2:stop
```

### 🗑️ Remove bot from PM2:
```bash
npm run pm2:delete
```

### 📈 View trading history:
```bash
npm run history
```

### 🖥️ Full system monitor (with graphs):
```bash
npm run pm2:monitor
```

### 📊 Custom bot monitor:
```bash
npm run monitor
```

## 🔧 Advanced Configuration

### Auto-start on system boot:
```bash
# Run once to enable auto-start
pm2 startup
pm2 save
```

### View all PM2 processes:
```bash
pm2 list
```

### View detailed bot info:
```bash
pm2 show sol-trading-bot
```

### Clear all logs:
```bash
pm2 flush
```

## 📁 Log Files Location
- Combined logs: `./logs/combined.log`
- Output logs: `./logs/out.log`
- Error logs: `./logs/error.log`

## 🆘 Troubleshooting

### If bot won't start:
1. Check your `.env` file configuration
2. Ensure MAX_USDT_TO_USE is set (not empty or 0)
3. Verify API credentials are correct
4. Run: `npm test` to test connection

### If bot keeps restarting:
1. Check error logs: `npm run pm2:logs`
2. Review `.env` configuration
3. Ensure sufficient balance in OKX account

### To completely reset:
```bash
npm run pm2:delete
npm run pm2:start
```

## 🎯 Trading Configuration

Edit `.env` file to configure:
- `TRADING_SYMBOL` - Which pair to trade (SOL-USDT, BTC-USDT, etc.)
- `PRICE_CHANGE_THRESHOLD` - When to trigger trades (0.005 = 0.5%)
- `MAX_USDT_TO_USE` - Max USDT per trade (leave empty for no limit)
- `CHECK_INTERVAL_SECONDS` - How often to check prices

## 🔍 Monitoring Your Bot

The bot will:
✅ Auto-restart if it crashes
✅ Log all activities to files
✅ Continue running even if you close terminal
✅ Start automatically on system reboot (if configured)

Use `npm run monitor` for a quick status overview!
