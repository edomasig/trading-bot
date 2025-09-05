# Multi-Instance Trading Bot - Complete Features Guide

## 🚀 New Multi-Instance Features

Your trading bot now supports running multiple instances simultaneously for different trading symbols with comprehensive conflict management and portfolio monitoring.

### ✨ Key Features

1. **Multi-Symbol Trading**: Trade multiple cryptocurrencies simultaneously
2. **Smart Conflict Detection**: Prevents duplicate symbol trading
3. **Portfolio Monitoring**: Real-time tracking of all instances
4. **Automated Setup**: Interactive wizard for easy configuration
5. **Risk Management**: Symbol-specific risk levels and thresholds
6. **Transaction Logging**: Dedicated logs with stop loss detection

## 🎮 Quick Start Commands

### Main Setup Tool
```bash
npm run setup
# Interactive setup wizard with all features
```

### Multi-Instance Management
```bash
npm run multi:setup         # Create multiple trading instances
npm run multi:setup:safe     # Setup with conflict checking
npm run multi:status         # Check all instance status
npm run multi:logs           # View logs from all instances
npm run multi:stop           # Stop all trading instances
npm run multi:restart        # Restart all instances
```

### Portfolio Monitoring
```bash
npm run portfolio:live       # Real-time portfolio monitor
npm run portfolio:summary    # Quick portfolio overview
npm run portfolio:report     # Generate detailed report
```

### Instance Management
```bash
npm run instances:check      # Check for conflicts
npm run instances:list       # List all active instances
npm run instances:status     # Detailed instance status
npm run instance:stop        # Interactive instance stopping
```

## 🔧 Setup Workflow

### 1. Initial Setup
```bash
npm run setup
```
- Choose "Setup New Multi-Instance Trading"
- Select trading symbols (up to 5 recommended)
- Allocate budget for each symbol
- Configure risk levels
- Start instances automatically

### 2. Monitor Portfolio
```bash
npm run portfolio:live
```
- Real-time profit/loss tracking
- Individual instance performance
- Quick action commands (R-refresh, L-logs, Q-quit)

### 3. Check for Issues
```bash
npm run instances:check
```
- Detect symbol conflicts
- View instance health
- Resolve duplicate trading

## 📊 Supported Trading Symbols

- **BTC-USDT** (Low volatility, conservative)
- **ETH-USDT** (Moderate volatility, balanced)
- **SOL-USDT** (Moderate volatility, popular)
- **BNB-USDT** (Exchange token, stable)
- **ADA-USDT** (High volatility, growth potential)
- **DOT-USDT** (High volatility, interoperability)
- **AVAX-USDT** (High volatility, fast blockchain)
- **MATIC-USDT** (Moderate volatility, scaling)
- **LINK-USDT** (Moderate volatility, oracle)
- **UNI-USDT** (High volatility, DeFi)

## ⚖️ Risk Levels

### Conservative
- Higher thresholds (1.5x default)
- Lower take profit targets
- Suitable for: BTC, ETH, stable coins

### Moderate (Default)
- Balanced approach
- Standard thresholds (1.0x)
- Suitable for: Most altcoins

### Aggressive
- Lower thresholds (0.7x default)
- Higher profit targets
- Suitable for: High volatility coins

## 📁 File Structure

### Multi-Instance Files
```
instances/                  # Instance configurations
  sol_usdt/                # SOL trading instance
    .env                   # Instance-specific config
    enhanced-bot.js        # Trading bot copy
    positions.json         # Position tracking
    logs/                  # Instance logs
  btc_usdt/                # BTC trading instance
    ...
  pm2.config.js           # PM2 configuration
```

### Core System Files
```
trading-bot-setup.js       # Main setup wizard
multi-instance-manager.js  # Instance creation & management
instance-checker.js       # Conflict detection & resolution
portfolio-monitor.js      # Portfolio tracking & reporting
```

## 🚨 Safety Features

### 1. Conflict Prevention
- Automatic detection of duplicate symbols
- Resolution options (stop duplicates, allow override)
- Pre-flight checks before starting new instances

### 2. Position Protection
- Cost-basis tracking prevents selling at loss
- Individual position files per instance
- Automatic stop-loss detection in logs

### 3. Error Handling
- Comprehensive error catching and logging
- Automatic restarts with PM2
- Memory usage monitoring

## 📈 Portfolio Monitoring Features

### Real-Time Dashboard
- Live profit/loss tracking
- Individual instance performance
- Memory and CPU usage
- Uptime tracking
- Recent activity feed

### Performance Metrics
- Total allocated capital
- Aggregate P&L across all instances
- Win rate estimation
- Best/worst performers
- Trade frequency analysis

### Reporting
- JSON reports with detailed metrics
- Historical performance tracking
- Instance-specific breakdowns
- Export capabilities

## 🔧 Advanced Configuration

### Custom Symbol Configuration
Edit `multi-instance-manager.js` to add new symbols:
```javascript
getSymbolSettings(symbol, allocation, riskLevel) {
    const symbolDefaults = {
        'NEW-USDT': { 
            threshold: '0.004', 
            takeProfit: '0.015', 
            volatility: 'moderate' 
        }
    };
}
```

### PM2 Configuration
Each instance gets its own PM2 process:
```javascript
{
    name: 'trading-bot-sol_usdt',
    script: './enhanced-bot.js',
    cwd: './instances/sol_usdt',
    env_file: './.env'
}
```

## 🚀 Usage Examples

### Example 1: Conservative Portfolio
```bash
# Setup with BTC, ETH, BNB
# Allocate $50 each, Conservative risk
# Monitor with portfolio:live
```

### Example 2: Aggressive Trading
```bash
# Setup with SOL, ADA, AVAX
# Allocate $30 each, Aggressive risk
# Monitor individual logs with multi:logs
```

### Example 3: Balanced Approach
```bash
# Mix of 5 symbols
# Different risk levels per symbol
# Use portfolio:report for analysis
```

## 🐛 Troubleshooting

### Common Issues

1. **"Symbol already trading" error**
   ```bash
   npm run instances:check
   # Resolve conflicts or stop duplicates
   ```

2. **PM2 processes not starting**
   ```bash
   pm2 status
   pm2 logs trading-bot-*
   ```

3. **Memory usage high**
   ```bash
   npm run portfolio:summary
   # Check individual instance memory usage
   ```

### Log Locations
- **Instance logs**: `instances/{symbol}/logs/`
- **Transaction logs**: `instances/{symbol}/logs/transactions.log`
- **PM2 logs**: Use `pm2 logs trading-bot-{symbol}`

## 📚 Integration with Existing Features

### Single Instance (Still Supported)
```bash
npm run interactive:setup    # Single symbol setup
npm run start:enhanced      # Start enhanced bot
npm run logs:transactions   # View transaction logs
```

### All previous features work with multi-instance:
- Target price logging ✅
- Transaction logging with stop loss detection ✅
- Position tracking ✅
- 1% buy/sell thresholds ✅
- Interactive configuration ✅

## 🎯 Next Steps

1. **Start with 2-3 symbols** for testing
2. **Use Conservative risk** initially
3. **Monitor daily** with portfolio tools
4. **Scale up** based on performance
5. **Generate reports** weekly for analysis

---

## 🔗 Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run setup` | Main interactive setup |
| `npm run portfolio:live` | Real-time monitoring |
| `npm run multi:stop` | Emergency stop all |
| `npm run instances:check` | Health check |
| `npm run portfolio:report` | Generate report |

Happy trading! 🚀📈
