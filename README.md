# OKX Crypto Trading Bot

A simple automated cryptocurrency trading bot for the OKX exchange that implements a basic buy-low-sell-high strategy for the WLFI/USDT trading pair.

## 🚀 Features

- **Automated Trading**: Monitors WLFI/USDT price and executes trades based on percentage changes
- **Simple Strategy**: 
  - Buy when price drops 1% from last observed price
  - Sell when price rises 1% from last buy price
- **Real-time Monitoring**: Checks prices every 30 seconds (configurable)
- **Error Handling**: Robust error handling to prevent crashes
- **Secure**: Uses environment variables for API credentials
- **Logging**: Comprehensive logging of all actions and decisions
- **Modular Design**: Clean, well-documented code structure

## 📋 Prerequisites

- Node.js (version 14 or higher)
- An OKX exchange account with API access enabled
- Some USDT balance for initial trading

## ⚙️ Installation

1. **Clone or download this project**
   ```bash
   cd trade-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy the example environment file
   copy .env.example .env
   
   # Edit .env file with your actual API credentials
   notepad .env
   ```

## 🔑 OKX API Setup

1. **Login to your OKX account**
2. **Go to Profile → API Management**
3. **Create a new API Key with the following permissions**:
   - Read
   - Trade
   - Withdraw (optional, not used by this bot)
4. **Copy the following credentials to your `.env` file**:
   - API Key
   - Secret Key
   - Passphrase

## 🛠️ Configuration

Edit the `.env` file with your settings:

```env
# Required: Your OKX API credentials
OKX_API_KEY=your_actual_api_key_here
OKX_SECRET_KEY=your_actual_secret_key_here
OKX_PASSPHRASE=your_actual_passphrase_here

# Optional: Trading configuration (defaults shown)
TRADING_SYMBOL=WLFI-USDT
PRICE_CHANGE_THRESHOLD=0.01
CHECK_INTERVAL_SECONDS=30
MIN_ORDER_SIZE=10
```

### Configuration Options

- `TRADING_SYMBOL`: The trading pair to monitor (default: WLFI-USDT)
- `PRICE_CHANGE_THRESHOLD`: Percentage change trigger for trades (default: 0.01 = 1%)
- `CHECK_INTERVAL_SECONDS`: How often to check prices (default: 30 seconds)
- `MIN_ORDER_SIZE`: Minimum order size in USDT (default: 10)

## 🚀 Running the Bot

1. **Start the bot**
   ```bash
   npm start
   ```
   
   Or directly with node:
   ```bash
   node bot.js
   ```

2. **Stop the bot**
   - Press `Ctrl+C` to stop the bot gracefully

## 📊 How It Works

### Trading Strategy

1. **Price Monitoring**: The bot checks WLFI/USDT price every 30 seconds
2. **Buy Trigger**: When price drops 1% from the last observed price
   - Uses available USDT balance to place a market buy order
3. **Sell Trigger**: When price rises 1% from the last buy price
   - Sells all available WLFI with a market sell order

### Safety Features

- **Minimum Order Size**: Won't place orders below the minimum threshold
- **Balance Checks**: Verifies sufficient balance before placing orders
- **Error Recovery**: Continues running even if individual API calls fail
- **Graceful Shutdown**: Properly handles shutdown signals

## 📝 Example Output

```
[2024-01-20T10:30:00.000Z] [SUCCESS] 🚀 Starting OKX Crypto Trading Bot...
[2024-01-20T10:30:00.001Z] [INFO] Trading pair: BTC-USDT
[2024-01-20T10:30:00.002Z] [INFO] Price change threshold: 1.0%
[2024-01-20T10:30:00.003Z] [INFO] Check interval: 30 seconds
[2024-01-20T10:30:01.234Z] [INFO] Current WLFI-USDT price: $42,150.50
[2024-01-20T10:30:01.235Z] [INFO] Balances - WLFI: 0.000000, USDT: $100.00
[2024-01-20T10:30:32.456Z] [INFO] Current WLFI-USDT price: $41,734.75
[2024-01-20T10:30:32.457Z] [INFO] Price change from last: -0.99%
[2024-01-20T10:31:03.678Z] [WARNING] 🔻 Price dropped by 1.02% - Triggering BUY
[2024-01-20T10:31:04.123Z] [SUCCESS] ✅ BUY order placed successfully! Order ID: 12345678
```

## ⚠️ Important Warnings

1. **This is for educational purposes**: Cryptocurrency trading involves significant risk
2. **Test with small amounts**: Start with small balances to test the bot
3. **Monitor regularly**: Keep an eye on the bot's performance and market conditions
4. **API Limits**: Be aware of OKX API rate limits
5. **Market Volatility**: Crypto markets are highly volatile and unpredictable

## 📁 Project Structure

```
trade-bot/
├── bot.js              # Main trading bot logic
├── okx-client.js       # OKX API client wrapper
├── package.json        # Node.js dependencies
├── .env.example        # Environment variables template
├── .env               # Your actual environment variables (create this)
└── README.md          # This file
```

## 🔧 Customization

You can modify the trading strategy by editing the `runTradingCycle()` method in `bot.js`. Some ideas:

- **Different thresholds**: Change buy/sell percentage triggers
- **Multiple pairs**: Monitor multiple trading pairs
- **Technical indicators**: Add moving averages, RSI, etc.
- **Position sizing**: Implement more sophisticated order sizing
- **Stop losses**: Add stop-loss functionality

## 🐛 Troubleshooting

### Common Issues

1. **"Missing required environment variables"**
   - Make sure you've created a `.env` file with your API credentials

2. **"Network error: No response from OKX API"**
   - Check your internet connection
   - Verify OKX API is accessible from your location

3. **"HTTP 401: Unauthorized"**
   - Double-check your API credentials
   - Ensure your API key has trading permissions enabled

4. **"Order failed: Insufficient balance"**
   - Make sure you have enough USDT/BTC balance for trading

## 📜 License

This project is open source and available under the MIT License.

## ⚡ Quick Start Commands

```bash
# Install dependencies
npm install

# Copy environment template
copy .env.example .env

# Edit your API credentials
notepad .env

# Start the bot
npm start
```

---

**Happy Trading! 🚀📈**

*Remember: Only invest what you can afford to lose, and always do your own research!*
