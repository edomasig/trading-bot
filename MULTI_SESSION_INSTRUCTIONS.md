# 🤖 Multi-Session Trading Bot Instructions

This guide explains how to run multiple instances of your OKX trading bot simultaneously for different trading symbols.

## 📋 Quick Setup Steps

### 1. Create Environment Files for Each Trading Pair

Create separate `.env` files for each cryptocurrency you want to trade:

**For BTC Trading (.env.btc):**
```properties
# BTC Trading Bot Configuration
OKX_API_KEY=df566209-fa51-459d-a3f1-4e09e2971996
OKX_SECRET_KEY=EC4DC1D73139EFF3F7E9BF5F50F462B9
OKX_PASSPHRASE=trade-Manage-0320

TRADING_SYMBOL=BTC-USDT
PRICE_CHANGE_THRESHOLD=0.01
CHECK_INTERVAL_SECONDS=30
MIN_ORDER_SIZE=10
MAX_USDT_TO_USE=50

OKX_BASE_URL=https://www.okx.com
OKX_API_VERSION=api/v5
```

**For ETH Trading (.env.eth):**
```properties
# ETH Trading Bot Configuration
OKX_API_KEY=df566209-fa51-459d-a3f1-4e09e2971996
OKX_SECRET_KEY=EC4DC1D73139EFF3F7E9BF5F50F462B9
OKX_PASSPHRASE=trade-Manage-0320

TRADING_SYMBOL=ETH-USDT
PRICE_CHANGE_THRESHOLD=0.01
CHECK_INTERVAL_SECONDS=45
MIN_ORDER_SIZE=5
MAX_USDT_TO_USE=30

OKX_BASE_URL=https://www.okx.com
OKX_API_VERSION=api/v5
```

**For WLFI Trading (.env.wlfi):**
```properties
# WLFI Trading Bot Configuration
OKX_API_KEY=df566209-fa51-459d-a3f1-4e09e2971996
OKX_SECRET_KEY=EC4DC1D73139EFF3F7E9BF5F50F462B9
OKX_PASSPHRASE=trade-Manage-0320

TRADING_SYMBOL=WLFI-USDT
PRICE_CHANGE_THRESHOLD=0.01
CHECK_INTERVAL_SECONDS=60
MIN_ORDER_SIZE=5
MAX_USDT_TO_USE=20

OKX_BASE_URL=https://www.okx.com
OKX_API_VERSION=api/v5
```

### 2. Update Package.json Scripts

Add these scripts to your `package.json` for easy multi-session management:

```json
{
  "scripts": {
    "start": "node bot.js",
    "start:btc": "node -r dotenv/config bot.js dotenv_config_path=.env.btc",
    "start:eth": "node -r dotenv/config bot.js dotenv_config_path=.env.eth",
    "start:wlfi": "node -r dotenv/config bot.js dotenv_config_path=.env.wlfi",
    "test:btc": "node -r dotenv/config test-connection.js dotenv_config_path=.env.btc",
    "test:eth": "node -r dotenv/config test-connection.js dotenv_config_path=.env.eth",
    "test:wlfi": "node -r dotenv/config test-connection.js dotenv_config_path=.env.wlfi"
  }
}
```

## 🚀 Running Multiple Sessions

### Option 1: Using NPM Scripts (Recommended)

Open separate terminal windows/tabs for each trading pair:

**Terminal 1 - BTC Bot:**
```bash
cd d:\Drawer\Projects\trade-bot
npm run start:btc
```

**Terminal 2 - ETH Bot:**
```bash
cd d:\Drawer\Projects\trade-bot
npm run start:eth
```

**Terminal 3 - WLFI Bot:**
```bash
cd d:\Drawer\Projects\trade-bot
npm run start:wlfi
```

### Option 2: Using Direct Commands

```bash
# Terminal 1 - BTC
node -r dotenv/config bot.js dotenv_config_path=.env.btc

# Terminal 2 - ETH  
node -r dotenv/config bot.js dotenv_config_path=.env.eth

# Terminal 3 - WLFI
node -r dotenv/config bot.js dotenv_config_path=.env.wlfi
```

## 📊 Testing Before Trading

Always test each configuration before starting live trading:

```bash
npm run test:btc    # Test BTC connection
npm run test:eth    # Test ETH connection  
npm run test:wlfi   # Test WLFI connection
```

## 📁 File Structure After Setup

```
trade-bot/
├── .env                           # Default config
├── .env.btc                       # BTC bot config
├── .env.eth                       # ETH bot config
├── .env.wlfi                      # WLFI bot config
├── bot.js                         # Main bot code
├── transactions_btc_usdt.log      # BTC trade history
├── transactions_eth_usdt.log      # ETH trade history
├── transactions_wlfi_usdt.log     # WLFI trade history
├── package.json                   # Updated scripts
└── MULTI_SESSION_INSTRUCTIONS.md  # This file
```

## ⚠️ Important Risk Management

### 1. Balance Allocation Strategy

**Total USDT: $100 Example Distribution:**
- BTC Bot: $50 (50% - stable, high liquidity)
- ETH Bot: $30 (30% - moderate risk)
- WLFI Bot: $20 (20% - higher risk, lower liquidity)

### 2. Timing Configuration

**Stagger check intervals to avoid API rate limits:**
- BTC: Every 30 seconds
- ETH: Every 45 seconds  
- WLFI: Every 60 seconds

### 3. Order Size Management

**Adjust minimum order sizes based on asset:**
- BTC: $10 minimum (higher price asset)
- ETH: $5 minimum (medium price asset)
- WLFI: $5 minimum (lower price asset)

## 🔍 Monitoring Multiple Bots

### View Transaction Histories

```bash
# View specific bot history
node view-transactions.js transactions_btc_usdt.log
node view-transactions.js transactions_eth_usdt.log
node view-transactions.js transactions_wlfi_usdt.log

# Or use default history viewer
npm run history
```

### Live Monitoring

```bash
# Watch transactions live (refreshes every 30 seconds)
npm run watch
```

## 🛑 Stopping Bots

To stop any bot safely:
1. Go to the terminal running the bot
2. Press `Ctrl+C`
3. Bot will log shutdown message and exit gracefully

## 📈 Performance Tracking

Each bot maintains separate transaction logs:
- `transactions_btc_usdt.log` - BTC trading history
- `transactions_eth_usdt.log` - ETH trading history  
- `transactions_wlfi_usdt.log` - WLFI trading history

## 🚨 Safety Reminders

1. **Start Small**: Begin with small amounts ($10-20 per bot)
2. **Monitor Closely**: Watch bot performance for first few hours
3. **Check Balances**: Ensure total allocation doesn't exceed your risk tolerance
4. **API Limits**: Don't run too many bots simultaneously (max 3-4 recommended)
5. **Correlation Risk**: Remember that crypto prices often move together

## 🔧 Troubleshooting

**Bot Won't Start:**
- Check if `.env.{symbol}` file exists
- Verify API credentials are correct
- Test connection first: `npm run test:{symbol}`

**API Rate Limit Errors:**
- Increase `CHECK_INTERVAL_SECONDS` for each bot
- Reduce number of simultaneous bots

**Insufficient Balance Errors:**
- Check `MAX_USDT_TO_USE` settings
- Verify total allocation doesn't exceed account balance
- Ensure `MIN_ORDER_SIZE` is appropriate

## 📞 Support

If you encounter issues:
1. Check bot logs for error messages
2. Verify API credentials and permissions
3. Test with single bot first before running multiple sessions
4. Ensure sufficient balance for all configured bots

---

**Happy Trading! 🚀📈**

*Remember: Cryptocurrency trading involves significant risk. Only trade with funds you can afford to lose.*