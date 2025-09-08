# 📊 Trading Bot Reporting System

This document outlines all the reporting and analysis tools available for your live trading bot.

## 🚀 Quick Commands

### **Quick Overview**
```bash
# Get instant trading summary
node quick-summary.js
```

### **Daily Reports**
```bash
# Today's detailed report
node daily-report.js

# Specific date report
node daily-report.js 2025-09-08

# Date range report
node daily-report.js 2025-09-01 2025-09-08
```

### **Transaction Viewing**
```bash
# View all transactions
node view-transactions.js

# Live transaction viewer (auto-refresh)
node view-transactions.js --watch
```

### **PM2 Bot Monitoring**
```bash
# Check bot status
pm2 status

# View live logs
pm2 logs okx-live-trading-bot

# Monitor resources
pm2 monit
```

## 📋 Available Reports

### 1. **Quick Summary Report** (`quick-summary.js`)
**Purpose**: Fast overview of your entire trading performance

**What it shows**:
- Overall performance metrics
- Total profit/loss
- Trading breakdown (buys vs sells)
- Recent activity (today and last 7 days)
- Last 5 transactions
- Average performance per day

**Example Output**:
```
🚀 TRADING BOT QUICK SUMMARY
📊 Total Successful Trades: 13
💰 Total Volume Traded: $80,943.59
💵 Net Profit/Loss: 🔴 $-80,834.05
📊 Average Trades/Day: 13.0
🔥 Today (2025-09-08): 0 trades
```

### 2. **Daily Report** (`daily-report.js`)
**Purpose**: Detailed analysis for specific dates or date ranges

**Single Date Features**:
- Daily statistics (trades, volume, P&L)
- Transaction details table
- Trading activity summary
- Price volatility analysis

**Date Range Features**:
- Range statistics with averages
- Daily breakdown table
- Detailed transaction list
- Performance trends

**Example Commands**:
```bash
# Today's report
node daily-report.js

# Specific date
node daily-report.js 2025-09-08

# Week range
node daily-report.js 2025-09-01 2025-09-08

# Month range
node daily-report.js 2025-09-01 2025-09-30
```

### 3. **Transaction Viewer** (`view-transactions.js`)
**Purpose**: Tabular view of all trading transactions

**Features**:
- Formatted transaction table
- Trading summary with totals
- Net P&L calculation
- Live watching mode

**Example Commands**:
```bash
# Static view
node view-transactions.js

# Live updating view
node view-transactions.js --watch
```

## 📁 Log Files Location

Your trading data is stored in these files:

### **Primary Data Files**:
- `transactions.log` - All completed transactions
- `positions.json` - Current position tracking

### **Activity Logs** (in `logs/` folder):
- `live-trading-combined.log` - Live trading bot activity (PM2)
- `live-trading-out.log` - Standard output logs
- `live-trading-error.log` - Error logs
- `trades-only.log` - Trade-specific events

## 🎯 Common Use Cases

### **1. Daily Check-in**
```bash
# Quick morning overview
node quick-summary.js

# Today's detailed activity
node daily-report.js
```

### **2. Weekly Review**
```bash
# Last 7 days performance
node daily-report.js 2025-09-01 2025-09-08
```

### **3. Live Monitoring**
```bash
# Watch transactions in real-time
node view-transactions.js --watch

# Monitor bot activity
pm2 logs okx-live-trading-bot
```

### **4. Historical Analysis**
```bash
# Specific date analysis
node daily-report.js 2025-09-03

# Month performance
node daily-report.js 2025-09-01 2025-09-30
```

### **5. Bot Health Check**
```bash
# Check if bot is running
pm2 status

# Check recent activity
pm2 logs okx-live-trading-bot --lines 50
```

## 📊 Understanding the Metrics

### **Key Performance Indicators**:

- **Net P&L**: Total profit/loss (Sell Value - Buy Value)
- **Total Volume**: Combined value of all trades
- **Price Improvement**: Average sell price vs buy price percentage
- **Trading Days**: Number of days with successful trades
- **Trades/Day**: Average number of trades per active day

### **Status Indicators**:
- 🟢 **Positive/Success** - Profits, successful trades
- 🔴 **Negative/Failed** - Losses, failed trades
- 📊 **Neutral** - Statistics and metrics
- 🎯 **Action** - Recommendations or commands

### **Trading Activity Levels**:
- **Low Activity**: 0-5 trades/day
- **Moderate Activity**: 6-15 trades/day  
- **High Activity**: 16+ trades/day

## ⚡ Pro Tips

### **1. Daily Monitoring**
- Run `quick-summary.js` every morning
- Check `pm2 status` to ensure bot is running
- Use `pm2 logs` to spot any issues

### **2. Performance Analysis**
- Use date range reports for weekly/monthly reviews
- Compare different time periods for performance trends
- Monitor price improvement percentages

### **3. Risk Management**
- Watch for excessive trading frequency
- Monitor daily P&L limits
- Check price volatility in daily reports

### **4. Troubleshooting**
- Check `live-trading-error.log` for issues
- Use `pm2 restart okx-live-trading-bot` if needed
- Monitor memory usage with `pm2 monit`

## 🛡️ Safety Features

### **Data Backup**:
- All transactions logged to `transactions.log`
- PM2 maintains separate log files
- Position tracking in `positions.json`

### **Monitoring**:
- PM2 auto-restart on crashes
- Memory usage monitoring
- Error logging and tracking

### **Recovery**:
- Historical data preserved in logs
- Transaction history always available
- Position recovery from backup files

---

## 🆘 Support Commands

If you need help or encounter issues:

```bash
# Check all available reports
ls -la *.js | grep -E "(report|summary|view)"

# Check log files
ls -la logs/

# Verify bot is running
pm2 status && pm2 logs okx-live-trading-bot --lines 5

# Emergency stop
pm2 stop okx-live-trading-bot
```

**Remember**: Your bot runs 24/7 with PM2, so you can generate reports anytime without affecting trading operations! 🚀
