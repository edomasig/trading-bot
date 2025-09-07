# OKX Demo Trading Setup Guide

## 1. Create Demo API Keys
1. Go to OKX website → Account → API Management
2. Click "Create API Key" 
3. Select **"Demo Trading"** environment
4. Set permissions: Read + Trade
5. Save your Demo API credentials

## 2. Update .env for Demo Trading
Replace your API credentials with demo ones:

```env
# OKX DEMO API Credentials
OKX_API_KEY=your-demo-api-key
OKX_SECRET_KEY=your-demo-secret-key  
OKX_PASSPHRASE=your-demo-passphrase

# Change base URL to demo environment
OKX_BASE_URL=https://www.okx.com
```

## 3. Demo Trading Benefits
✅ Virtual $100,000 USDT balance
✅ Real market data and prices
✅ Same trading mechanics as live
✅ No risk of losing real money
✅ Perfect for strategy testing

## 4. Demo vs Live Differences
- Demo: Uses simulated balance
- Demo: No real money at risk
- Demo: Same API endpoints with demo flag
- Demo: Reset balance periodically

## 5. Testing Your Bot
1. Start with demo environment
2. Run 50-100 trades to validate strategy
3. Monitor win rate and profitability
4. Only switch to live trading when consistently profitable

## Demo Environment URL
- Demo API: https://www.okx.com (with demo API keys)
- Demo Web Interface: Available in your OKX account
