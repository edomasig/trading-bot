# 🚨 LIVE TRADING SAFETY CHECKLIST

## ⚠️ CRITICAL: Complete ALL steps before live trading!

### ✅ Step 1: API Credentials Setup
- [x] Live API Key configured: `df566209-fa51-459d-a3f1-4e09e2971996`
- [x] Live Secret Key configured: `EC4DC1D73139EFF3F7E9BF5F50F462B9`
- [ ] **❌ MISSING: OKX_PASSPHRASE** - **MUST BE PROVIDED**
- [x] OKX_DEMO_MODE set to `false`

### ✅ Step 2: Safety Configuration Applied
- [x] Conservative threshold: 0.5% (was 0.8% in demo)
- [x] Reduced trade size: $10 max per trade (was $20)
- [x] Stop loss enabled: 1% (tight control)
- [x] Take profit: 1.5% (conservative)
- [x] Risk management: ENABLED
- [x] Daily trade limit: 10 trades max
- [x] Auto-restart: DISABLED (manual control)

### ✅ Step 3: Pre-Flight Tests Required

#### 🔧 3.1: Connection Test
```bash
node test-live-connection.js
```
**Status**: ⚠️ PENDING - Need passphrase first

#### 🔧 3.2: Balance Verification
- [ ] Confirm live account balance
- [ ] Verify sufficient USDT for trading
- [ ] Check account restrictions/limits

#### 🔧 3.3: Small Test Trade
- [ ] Manual test with $5-10 amount
- [ ] Verify order execution
- [ ] Test stop loss/take profit

### ✅ Step 4: Launch Configuration

#### 🚀 Conservative Start Settings:
```env
MAX_USDT_TO_USE=5              # Start with $5 per trade
PRICE_CHANGE_THRESHOLD=0.003   # 0.3% - extra conservative
MAX_DAILY_TRADES=5             # Limit initial exposure
```

#### 📊 Monitoring Requirements:
- [ ] Watch first 3 trades manually
- [ ] Monitor for 1 hour minimum
- [ ] Check position tracking accuracy
- [ ] Verify profit/loss calculations

### ✅ Step 5: Emergency Procedures

#### 🛑 Emergency Stop:
```bash
Ctrl+C  # Graceful shutdown
```

#### 📞 Emergency Contacts:
- OKX Support: [Contact info]
- Trading logs: `logs/` directory
- Position backup: `positions.json`

### ✅ Step 6: Risk Limits

#### 💰 Account Protection:
- **Daily Loss Limit**: 5% of account
- **Maximum Position**: 10% of account per trade
- **Total Exposure**: Max 50% of account

#### ⏰ Time Limits:
- **First Day**: Maximum 4 hours
- **First Week**: Maximum 8 hours/day
- **Gradual Increase**: Only after proven stability

## 🚨 CURRENT STATUS

### ❌ BLOCKING ISSUES:
1. **OKX_PASSPHRASE missing** - Cannot proceed without this
2. **Connection test not completed**
3. **Live balance not verified**

### ✅ READY WHEN:
1. Passphrase provided and configured
2. `node test-live-connection.js` passes
3. Manual verification of first small trade

## 🎯 NEXT STEPS

1. **IMMEDIATE**: Provide OKX_PASSPHRASE
2. **AFTER PASSPHRASE**: Run connection test
3. **IF TEST PASSES**: Start with $5 test trades
4. **GRADUAL SCALE**: Increase only after stability proven

## ⚠️ WARNINGS

- **NEVER** leave bot unattended in first week
- **ALWAYS** monitor positions manually
- **IMMEDIATELY** stop if unexpected behavior
- **DOCUMENT** all trades for analysis

---
*Last Updated: September 7, 2025*
*Status: WAITING FOR PASSPHRASE*
