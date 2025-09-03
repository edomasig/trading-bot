# 🤖 Enhanced Trading Bot Background Service Setup (PM2)

## ⚡ Quick Start Commands

### 🚀 Start Enhanced Bot (Recommended):
```bash
npm run pm2:start:enhanced
```

### 🔧 Start Basic Bot:
```bash
npm run pm2:start:basic
```

### 🌟 Start Both Bots:
```bash
npm run pm2:start
```

### 📊 Check bot status:
```bash
npm run pm2:status
```

### 📋 View live logs (Enhanced):
```bash
npm run pm2:logs:live
```

### � View logs (Basic bot):
```bash
npm run pm2:logs:basic
```

### �🔄 Restart Enhanced Bot:
```bash
npm run pm2:restart
```

### ⏹️ Stop Enhanced Bot:
```bash
npm run pm2:stop
```

### ⏹️ Stop All Bots:
```bash
npm run pm2:stop:all
```

### 🗑️ Remove Enhanced Bot from PM2:
```bash
npm run pm2:delete
```

### 🗑️ Remove All Bots from PM2:
```bash
npm run pm2:delete:all
```

### 📈 View trading history:
```bash
npm run history
```

### 🖥️ Full system monitor (with graphs):
```bash
npm run pm2:monitor
```

## 🤖 Bot Types Available

### 🌟 Enhanced Bot (Recommended)
- **Script**: `enhanced-bot.js`
- **Features**: 
  - ✅ Technical Analysis (RSI, Moving Averages, Bollinger Bands)
  - ✅ Risk Management (Stop-loss, Take-profit, Trailing stops)
  - ✅ Adaptive Thresholds (Dynamic based on market conditions)
  - ✅ Market Data Analysis (Order book, volume analysis)
  - ✅ Multi-timeframe Analysis
  - ✅ Comprehensive Logging
- **PM2 Name**: `sol-trading-bot-enhanced`

### 🔧 Basic Bot
- **Script**: `bot.js`
- **Features**: 
  - ✅ Simple price-based trading
  - ✅ Basic logging
  - ✅ Reliable execution
- **PM2 Name**: `sol-trading-bot-basic`

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
pm2 show sol-trading-bot-enhanced
pm2 show sol-trading-bot-basic
```

### Clear all logs:
```bash
pm2 flush
```

### Update environment variables:
```bash
pm2 restart sol-trading-bot-enhanced --update-env
```

## 🧪 Testing & Debugging

### Test environment and API connectivity:
```bash
npm run test:debug
```

### Test enhanced bot features:
```bash
npm run test:enhanced-debug
```

### Test basic connection:
```bash
npm test
```

## 📁 Log Files Location

### Enhanced Bot Logs:
- Combined logs: `./logs/enhanced-combined.log`
- Output logs: `./logs/enhanced-out.log`
- Error logs: `./logs/enhanced-error.log`

### Basic Bot Logs:
- Combined logs: `./logs/basic-combined.log`
- Output logs: `./logs/basic-out.log`
- Error logs: `./logs/basic-error.log`

### Transaction Logs:
- Trading history: `./transactions.log`

## 🆘 Troubleshooting

### If bot won't start:
1. **Check environment variables**: `npm run test:debug`
2. **Verify .env file** configuration
3. **Test API credentials**: `npm test`
4. **Check PM2 status**: `npm run pm2:status`
5. **Clear old logs**: `pm2 flush`

### If bot keeps restarting:
1. **Check error logs**: `npm run pm2:logs:live`
2. **Review .env configuration**
3. **Ensure sufficient balance** in OKX account
4. **Test enhanced features**: `npm run test:enhanced-debug`

### Environment Variable Issues:
1. **Clear PM2 cache**: `pm2 flush`
2. **Restart with env update**: `pm2 restart sol-trading-bot-enhanced --update-env`
3. **Test env loading**: `npm run test:debug`

### To completely reset:
```bash
npm run pm2:delete:all
pm2 flush
npm run pm2:start:enhanced
```

## ⚙️ Enhanced Bot Configuration

### Core Trading Settings (.env):
```env
# Trading pair
TRADING_SYMBOL=SOL-USDT

# Price threshold for trades
PRICE_CHANGE_THRESHOLD=0.005

# Trading limits
MIN_ORDER_SIZE=5
MAX_USDT_TO_USE=15

# Check frequency
CHECK_INTERVAL_SECONDS=60
```

### Advanced Features (.env):
```env
# Technical Analysis
ENABLE_TECHNICAL_ANALYSIS=true
RSI_PERIOD=14
RSI_OVERSOLD=30
RSI_OVERBOUGHT=70

# Risk Management
ENABLE_RISK_MANAGEMENT=true
ENABLE_STOP_LOSS=true
STOP_LOSS_PERCENTAGE=0.02
TAKE_PROFIT_PERCENTAGE=0.03

# Market Analysis
ENABLE_MARKET_DATA_ANALYSIS=true
ENABLE_ORDER_BOOK_ANALYSIS=true
ENABLE_ADAPTIVE_THRESHOLD=true
```

## 🔍 Monitoring Your Bots

### Enhanced Bot Features:
✅ **Intelligent Trading**: Technical analysis-based decisions  
✅ **Risk Management**: Stop-loss, take-profit, position sizing  
✅ **Adaptive Thresholds**: Dynamic based on market volatility  
✅ **Market Analysis**: Order book depth, volume analysis  
✅ **Multi-timeframe**: 5m, 15m, 1H candle analysis  
✅ **Comprehensive Logging**: Detailed trade reasoning  
✅ **Auto-restart**: Crash protection  
✅ **Persistent**: Runs independently of terminal  

### Expected Performance:
- **Conservative**: 2-5% daily returns with risk management
- **Moderate**: 5-10% daily returns with balanced settings  
- **Aggressive**: 10%+ daily returns with higher risk tolerance

### Bot Status Indicators:
- 🟢 **Online**: Bot is running and monitoring
- 🔄 **Restarting**: Temporary restart (normal)
- 🔴 **Stopped**: Manual stop or critical error
- ⚠️ **Errored**: Check logs for issues

Use `npm run pm2:status` to check current status anytime!
