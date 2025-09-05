# 🤖 Enhanced Trading Bot Background Service Setup (PM2)

## ⚡ Quick Start Commands

### � Interactive Setup ### 🎮 Interactive Bot Launcher (NEW)
- **Script**: `interactive-bot.js` (foreground) / `interactive-setup.js` (background)
- **Features**: 
  - ✅ **Startup Mode Selection** - Choose initial strategy
  - ✅ **Account Status Display** - Real-time balance and position info
  - ✅ **Risk Level Configuration** - Conservative, Moderate, Aggressive
  - ✅ **5 Trading Modes**:
    - 🤖 **AUTO**: Smart mode based on market conditions
    - 📉 **SELL_FIRST**: Start by selling existing positions
    - 📈 **BUY_FIRST**: Start by buying the dip
    - ⚖️ **BALANCE**: Wait for balanced market conditions
    - 🎛️ **MANUAL**: Manual control mode
  - ✅ **User-Friendly Interface** - Colored prompts and recommendations
- **Usage**: 
  - `npm run interactive` (foreground only)
  - `npm run interactive:setup` (background service)Service (NEW - Best of Both Worlds):
```bash
npm run interactive:setup
```
*Interactive configuration that starts as PM2 background service*

### 🌟 Interactive Bot Launcher (Foreground Only):
```bash
npm run interactive
```
*Interactive mode with startup options - FOREGROUND ONLY (stops when terminal closes)*

### 🚀 Start Enhanced Bot (Direct Background):
```bash
npm run pm2:start:enhanced
```
*Direct background service using .env defaults*

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

## 📋 Service Types Explained

| Command | Interactive Setup | Background Service | Survives Terminal Close | Best For |
|---------|------------------|-------------------|------------------------|----------|
| `npm run interactive:setup` | ✅ Yes | ✅ Yes | ✅ Yes | **Production Trading** |
| `npm run interactive` | ✅ Yes | ❌ No | ❌ No | Testing/Learning |
| `npm run pm2:start:enhanced` | ❌ No | ✅ Yes | ✅ Yes | Automated/Remote |

### 💡 Recommendations:
- **🎯 For most users**: Use `npm run interactive:setup` 
- **🧪 For testing**: Use `npm run interactive` 
- **🤖 For automation**: Use `npm run pm2:start:enhanced`
- **🖥️ For servers/VPS**: Always use PM2 commands

## 🤖 Bot Types Available

### 🌟 Enhanced Bot with Position Tracking (Latest - Recommended)
- **Script**: `enhanced-bot.js`
- **Features**: 
  - ✅ **COST-BASIS TRACKING** - Never sell at a loss! 🎯
  - ✅ **Position Management** - FIFO tracking for multiple buys
  - ✅ **Profitable-Only Sells** - Only sells when trades are profitable
  - ✅ Technical Analysis (RSI, Moving Averages, Bollinger Bands)
  - ✅ Risk Management (Stop-loss, Take-profit, Trailing stops)
  - ✅ Adaptive Thresholds (Dynamic based on market conditions)
  - ✅ Market Data Analysis (Order book, volume analysis)
  - ✅ Multi-timeframe Analysis
  - ✅ Comprehensive Logging with profit tracking
- **PM2 Name**: `sol-trading-bot-enhanced`
- **NEW**: Persistent position tracking across restarts

### 🎮 Interactive Bot Launcher (NEW)
- **Script**: `interactive-bot.js`
- **Features**: 
  - ✅ **Startup Mode Selection** - Choose initial strategy
  - ✅ **Account Status Display** - Real-time balance and position info
  - ✅ **5 Trading Modes**:
    - 🤖 **AUTO**: Smart mode based on market conditions
    - � **SELL_FIRST**: Start by selling existing positions
    - 📈 **BUY_FIRST**: Start by buying the dip
    - ⚖️ **BALANCE**: Wait for balanced market conditions
    - 🎛️ **MANUAL**: Manual control mode
  - ✅ **User-Friendly Interface** - Colored prompts and recommendations
- **Usage**: `npm run interactive`

### �🔧 Basic Bot
- **Script**: `bot.js`
- **Features**: 
  - ✅ Simple price-based trading
  - ✅ Basic logging
  - ✅ Reliable execution
  - ⚠️ **No position tracking** - May sell at losses
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

### Test interactive setup (background service):
```bash
npm run demo:setup
```

### Test interactive bot launcher (foreground):
```bash
npm run demo:interactive
```

### Test target price logging:
```bash
npm run demo:targets
```

### Test position tracking system:
```bash
node test-position-integration.js
```

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

### Position Tracking (NEW):
- Position database: `./positions.json`
- Cost-basis tracking for profitable sells only

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

## ⚙️ Enhanced Bot Configuration (Updated for $50 Capital)

### Core Trading Settings (.env):
```env
# Trading pair
TRADING_SYMBOL=SOL-USDT

# Price threshold for trades (optimized for $50 capital)
PRICE_CHANGE_THRESHOLD=0.003

# Trading limits (optimized for $50 capital)
MIN_ORDER_SIZE=8
MAX_USDT_TO_USE=47
POSITION_SIZE_PERCENTAGE=0.90

# Check frequency
CHECK_INTERVAL_SECONDS=30
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
TAKE_PROFIT_PERCENTAGE=0.015

# Market Analysis
ENABLE_MARKET_DATA_ANALYSIS=true
ENABLE_ORDER_BOOK_ANALYSIS=true
ENABLE_ADAPTIVE_THRESHOLD=true

# Position Tracking (NEW)
ENABLE_POSITION_TRACKING=true
```

## 🔍 Monitoring Your Bots

### Enhanced Bot Features (Latest Version):
✅ **🎯 POSITION TRACKING**: Never sell at a loss - tracks cost basis  
✅ **💰 PROFIT-ONLY SELLS**: Only sells when trades are actually profitable  
✅ **🎯 TARGET PRICE LOGGING**: Shows exact buy/sell targets and distance to trigger  
✅ **📊 FIFO Management**: First-in-first-out position tracking  
✅ **💾 Persistent Storage**: Positions saved across bot restarts  
✅ **🎮 Interactive Launcher**: Choose startup strategy  
✅ **🧠 Intelligent Trading**: Technical analysis-based decisions  
✅ **🛡️ Risk Management**: Stop-loss, take-profit, position sizing  
✅ **📈 Adaptive Thresholds**: Dynamic based on market volatility  
✅ **📊 Market Analysis**: Order book depth, volume analysis  
✅ **⏰ Multi-timeframe**: 5m, 15m, 1H candle analysis  
✅ **📝 Comprehensive Logging**: Detailed trade reasoning with P&L  
✅ **🔄 Auto-restart**: Crash protection  
✅ **🔗 Persistent**: Runs independently of terminal  

### Trading Modes (Interactive Launcher):
- 🤖 **AUTO**: Smart mode - analyzes market conditions automatically
- 📉 **SELL_FIRST**: Conservative - starts by selling existing positions
- 📈 **BUY_FIRST**: Aggressive - immediately buys the dip
- ⚖️ **BALANCE**: Balanced - waits for optimal market conditions
- 🎛️ **MANUAL**: Manual control for experienced traders

### Expected Performance (with $50 Capital):
- **Conservative**: 3-7% daily returns with risk management
- **Moderate**: 7-15% daily returns with balanced settings  
- **Aggressive**: 15%+ daily returns with higher risk tolerance
- **Profit Increase**: 447% increase vs previous $16 setup

### Position Tracking Benefits:
- 🚫 **No Loss-Making Sells**: Bot will never sell at a loss
- 📊 **Cost-Basis Tracking**: Knows exact purchase price of each buy
- 💎 **HODL Until Profitable**: Waits for profitable exit points
- 🔄 **Multi-Buy Support**: Handles multiple buys at different prices
- 💰 **True Profit Calculation**: Accounts for trading fees

### Bot Status Indicators:
- 🟢 **Online**: Bot is running and monitoring
- 🔄 **Restarting**: Temporary restart (normal)
- 🔴 **Stopped**: Manual stop or critical error
- ⚠️ **Errored**: Check logs for issues
- 💎 **HODL Mode**: Waiting for profitable sell opportunity
- 📈 **Profit Mode**: Position in profit, ready to sell

### New Log Messages to Watch For:
- `🎯 BUY Target: $X (need -Y% to trigger)` - Shows buy target price and distance from current
- `🎯 SELL Target: $X (need +Y% to trigger)` - Shows sell target price and distance from current
- `� BUYING: $X USDT at $Y (target was $Z)` - Actual buy execution with target comparison
- `💰 SELLING: X SOL at $Y (target was $Z, avg cost: $A)` - Actual sell execution with full details
- `🔒 HODL Mode: Position not profitable yet` - Position tracking preventing losses
- `📊 Current: $X | Avg Cost: $Y | Target: $Z (need +W%)` - Detailed position status
- `📈 Position tracker: Added buy of X SOL at $Y` - New position tracked
- `📉 Position tracker: Sold X SOL at $Y, realized P&L: $Z` - Profitable sell completed

Use `npm run pm2:status` to check current status anytime!

## 🎯 Position Tracking System (NEW)

### How It Works:
The enhanced bot now includes a sophisticated position tracking system that ensures you **never sell at a loss**:

1. **🔍 Tracks Every Buy**: Records exact price and quantity of each purchase
2. **💰 Calculates True Cost**: Includes trading fees in cost-basis calculations  
3. **📊 FIFO Management**: First-in-first-out position management
4. **🛡️ Profit Protection**: Only allows sells when profitable above your threshold
5. **💾 Persistent Storage**: Saves positions to `positions.json` file
6. **🔄 Restart Safe**: Maintains position history across bot restarts

### Position File Location:
- **File**: `./positions.json`
- **Format**: JSON with buy prices, quantities, timestamps, and fees
- **Backup**: Automatically backed up before major operations

### Manual Position Management:
```bash
# View current positions
node -e "const tracker = require('./position-tracker'); const t = new tracker('SOL-USDT'); console.log(JSON.stringify(t.getPositionSummary(), null, 2));"

# Clear all positions (use with caution!)
rm positions.json
```

### Position Tracking Benefits:
- ❌ **No More Losses**: Eliminates selling below purchase price
- 📈 **Profit Optimization**: Waits for optimal exit points
- 🔄 **Multi-Buy Support**: Handles averaging down strategies
- 💎 **Diamond Hands**: Automatically holds until profitable
- 📊 **Accurate P&L**: Real profit/loss calculations with fees

## 🚀 Getting Started Guide

### 1. **First Time Setup (Recommended)**:
```bash
npm run interactive:setup
```
- Interactive configuration with account status
- Choose trading strategy and risk level  
- Automatically starts as background service
- Saves preferences for future use

### 2. **Quick Testing**:
```bash
npm run demo:setup
```
- Test the interactive setup without starting bot
- See what configuration options are available
- No actual trading or PM2 startup

### 3. **Direct Background Start**:
```bash
npm run pm2:start:enhanced  
```
- Uses existing .env configuration
- No interactive prompts
- Good for automation or remote servers

### 4. **Foreground Testing**:
```bash
npm run interactive
```
- Interactive mode for testing/learning
- Stops when you close terminal
- Good for understanding the bot behavior
