# 🚀 Quick Setup Guide for OKX Trading Bot

Follow these steps to get your crypto trading bot running in minutes!

## Step 1: Get Your OKX API Credentials

1. **Login** to your OKX account at [okx.com](https://www.okx.com)
2. **Navigate** to Profile → API Management
3. **Create API Key** with these permissions:
   - ✅ Read
   - ✅ Trade
   - ❌ Withdraw (not needed)
4. **Save these three values** (you'll need them in Step 3):
   - API Key
   - Secret Key
   - Passphrase

## Step 2: Install Dependencies

```bash
cd trade-bot
npm install
```

## Step 3: Configure Environment Variables

1. **Copy the template**:
   ```bash
   copy .env.example .env
   ```

2. **Edit the .env file** with your API credentials:
   ```env
   OKX_API_KEY=your_actual_api_key_here
   OKX_SECRET_KEY=your_actual_secret_key_here
   OKX_PASSPHRASE=your_actual_passphrase_here
   
   # Optional settings (you can leave these as default)
   TRADING_SYMBOL=WLFI-USDT
   PRICE_CHANGE_THRESHOLD=0.01
   CHECK_INTERVAL_SECONDS=30
   MIN_ORDER_SIZE=10
   ```

## Step 4: Test Your Connection

```bash
npm test
```

This will verify your API credentials and show your account balances.

## Step 5: Start Trading!

```bash
npm start
```

## ⚠️ Important Safety Tips

1. **Start Small**: Test with a small amount of USDT first
2. **Monitor Closely**: Watch the bot's first few trades
3. **Have an Exit Plan**: Know how to stop the bot (Ctrl+C)
4. **Understand the Risk**: Crypto trading is risky!

## 🛑 How to Stop the Bot

Simply press `Ctrl+C` in the terminal where the bot is running.

## 📊 What the Bot Does

- **Monitors** WLFI/USDT price every 30 seconds
- **Buys** when price drops 1% from last observed price
- **Sells** when price rises 1% from last buy price
- **Logs** all actions to the console

## 🔧 Customization

You can modify these settings in your `.env` file:

| Setting | Description | Default |
|---------|-------------|---------|
| `PRICE_CHANGE_THRESHOLD` | Trigger percentage (0.01 = 1%) | 0.01 |
| `CHECK_INTERVAL_SECONDS` | How often to check prices | 30 |
| `MIN_ORDER_SIZE` | Minimum order in USDT | 10 |

## 🆘 Need Help?

1. **Connection Issues**: Run `npm test` to diagnose
2. **API Errors**: Check your credentials and permissions
3. **Trading Issues**: Ensure you have sufficient balance

---

**Happy Trading! 📈🚀**
