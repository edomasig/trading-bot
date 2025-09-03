require('dotenv').config();
const OKXClient = require('./okx-client');
const fs = require('fs');
const path = require('path');

/**
 * Simple Crypto Trading Bot for OKX Exchange
 * Implements a basic strategy: buy on 1% drop, sell on 1% rise
 */
class CryptoTradingBot {
    constructor() {
        // Initialize OKX client with credentials from environment variables
        this.client = new OKXClient(
            process.env.OKX_API_KEY,
            process.env.OKX_SECRET_KEY,
            process.env.OKX_PASSPHRASE
        );

        // Trading configuration
        this.symbol = process.env.TRADING_SYMBOL || 'BTC-USDT';
        this.priceChangeThreshold = parseFloat(process.env.PRICE_CHANGE_THRESHOLD) || 0.01; // 1%
        this.checkInterval = (parseInt(process.env.CHECK_INTERVAL_SECONDS) || 30) * 1000; // Convert to milliseconds
        this.minOrderSize = parseFloat(process.env.MIN_ORDER_SIZE) || 10; // Minimum order size in USDT
        this.maxUsdtToUse = parseFloat(process.env.MAX_USDT_TO_USE) || null; // Maximum USDT to use for trading

        // Extract base and quote currencies from trading symbol
        const [baseCurrency, quoteCurrency] = this.symbol.split('-');
        this.baseCurrency = baseCurrency; // e.g., BTC, WLFI, ETH
        this.quoteCurrency = quoteCurrency; // e.g., USDT

        // Transaction logging
        this.logFile = path.join(__dirname, 'transactions.log');
        this.initializeTransactionLog();

        // Bot state
        this.lastPrice = null;
        this.lastBuyPrice = null;
        this.isRunning = false;
        this.positions = {
            [this.baseCurrency]: 0,
            [this.quoteCurrency]: 0
        };

        // Bind methods to preserve 'this' context
        this.log = this.log.bind(this);
        this.getPrice = this.getPrice.bind(this);
        this.getBalances = this.getBalances.bind(this);
        this.placeOrder = this.placeOrder.bind(this);
        this.runTradingCycle = this.runTradingCycle.bind(this);
        this.runBot = this.runBot.bind(this);
    }

    /**
     * Log messages with timestamp
     * @param {string} message - Message to log
     * @param {string} level - Log level (INFO, ERROR, SUCCESS)
     */
    log(message, level = 'INFO') {
        const timestamp = new Date().toISOString();
        const logColors = {
            INFO: '\x1b[36m',    // Cyan
            ERROR: '\x1b[31m',   // Red
            SUCCESS: '\x1b[32m', // Green
            WARNING: '\x1b[33m'  // Yellow
        };
        const resetColor = '\x1b[0m';
        
        console.log(`${logColors[level]}[${timestamp}] [${level}] ${message}${resetColor}`);
    }

    /**
     * Initialize transaction log file with headers
     */
    initializeTransactionLog() {
        try {
            // Check if log file exists, if not create it with headers
            if (!fs.existsSync(this.logFile)) {
                const headers = 'Date,Time,Trading_Symbol,Action,Amount,Price,Total_Value,Order_ID,Status\n';
                fs.writeFileSync(this.logFile, headers);
                this.log(`Created transaction log file: ${this.logFile}`, 'INFO');
            }
        } catch (error) {
            this.log(`Error creating transaction log file: ${error.message}`, 'ERROR');
        }
    }

    /**
     * Log transaction to file
     * @param {string} action - 'BUY' or 'SELL'
     * @param {number} amount - Amount traded
     * @param {number} price - Price at time of trade
     * @param {string} orderId - Order ID from exchange
     * @param {string} status - 'SUCCESS' or 'FAILED'
     */
    logTransaction(action, amount, price, orderId = 'N/A', status = 'SUCCESS') {
        try {
            const now = new Date();
            const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
            const time = now.toTimeString().split(' ')[0]; // HH:MM:SS
            const totalValue = (amount * price).toFixed(2);
            
            const logEntry = `${date},${time},${this.symbol},${action},${amount},${price.toFixed(8)},${totalValue},${orderId},${status}\n`;
            
            fs.appendFileSync(this.logFile, logEntry);
            this.log(`📝 Transaction logged: ${action} ${amount} ${this.baseCurrency} at $${price.toFixed(2)}`, 'INFO');
        } catch (error) {
            this.log(`Error logging transaction: ${error.message}`, 'ERROR');
        }
    }

    /**
     * Fetch current market price for the trading symbol
     * @returns {Promise<number|null>} Current price or null if error
     */
    async getPrice() {
        try {
            const price = await this.client.getPrice(this.symbol);
            this.log(`Current ${this.symbol} price: $${price.toFixed(2)}`);
            return price;
        } catch (error) {
            this.log(`Error fetching price: ${error.message}`, 'ERROR');
            return null;
        }
    }

    /**
     * Get current account balances
     * @returns {Promise<object|null>} Balances object or null if error
     */
    async getBalances() {
        try {
            const balances = await this.client.getBalances();
            
            // Update positions dynamically based on trading pair
            this.positions[this.baseCurrency] = balances[this.baseCurrency]?.available || 0;
            this.positions[this.quoteCurrency] = balances[this.quoteCurrency]?.available || 0;
            
            this.log(`Balances - ${this.baseCurrency}: ${this.positions[this.baseCurrency].toFixed(6)}, ${this.quoteCurrency}: $${this.positions[this.quoteCurrency].toFixed(2)}`);
            return balances;
        } catch (error) {
            this.log(`Error fetching balances: ${error.message}`, 'ERROR');
            return null;
        }
    }

    /**
     * Place a trading order
     * @param {string} side - Order side ('buy' or 'sell')
     * @param {number} amount - Order amount
     * @returns {Promise<boolean>} Success status
     */
    async placeOrder(side, amount) {
        try {
            // Add safety checks for minimum order amounts
            if (side === 'sell') {
                let minimumAmount;
                if (this.baseCurrency === 'ETH') {
                    minimumAmount = 0.001;
                } else if (this.baseCurrency === 'BTC') {
                    minimumAmount = 0.00001;
                } else if (this.baseCurrency === 'SOL') {
                    minimumAmount = 0.01;
                } else {
                    minimumAmount = 0.1;
                }
                
                if (amount < minimumAmount) {
                    this.log(`Order rejected: Amount ${amount} ${this.baseCurrency} is below minimum ${minimumAmount}`, 'ERROR');
                    
                    // Log failed transaction
                    this.logTransaction(
                        side.toUpperCase(),
                        amount,
                        this.lastPrice || 0,
                        'N/A',
                        'FAILED_MIN_SIZE'
                    );
                    
                    return false;
                }
            }
            
            this.log(`Attempting to place ${side} order for ${amount} ${side === 'buy' ? this.quoteCurrency : this.baseCurrency}`, 'WARNING');
            
            const orderResponse = await this.client.placeOrder(this.symbol, side, amount);
            
            if (orderResponse && orderResponse.length > 0) {
                const order = orderResponse[0];
                if (order.sCode === '0') {
                    this.log(`✅ ${side.toUpperCase()} order placed successfully! Order ID: ${order.ordId}`, 'SUCCESS');
                    
                    // Log transaction to file
                    this.logTransaction(
                        side.toUpperCase(),
                        amount,
                        this.lastPrice || 0,
                        order.ordId,
                        'SUCCESS'
                    );
                    
                    // Update last buy price if this was a buy order
                    if (side === 'buy' && this.lastPrice) {
                        this.lastBuyPrice = this.lastPrice;
                        this.log(`Updated last buy price to: $${this.lastBuyPrice.toFixed(2)}`, 'INFO');
                    }
                    
                    return true;
                } else {
                    this.log(`Order failed: ${order.sMsg} (Code: ${order.sCode})`, 'ERROR');
                    
                    // Log failed transaction
                    this.logTransaction(
                        side.toUpperCase(),
                        amount,
                        this.lastPrice || 0,
                        order.ordId || 'N/A',
                        'FAILED'
                    );
                    
                    return false;
                }
            } else {
                this.log('No order response received', 'ERROR');
                
                // Log failed transaction
                this.logTransaction(
                    side.toUpperCase(),
                    amount,
                    this.lastPrice || 0,
                    'N/A',
                    'FAILED'
                );
                
                return false;
            }
        } catch (error) {
            this.log(`Error placing ${side} order: ${error.message}`, 'ERROR');
            
            // Log failed transaction
            this.logTransaction(
                side.toUpperCase(),
                amount,
                this.lastPrice || 0,
                'N/A',
                'FAILED'
            );
            
            return false;
        }
    }

    /**
     * Get available USDT for trading (respects MAX_USDT_TO_USE limit)
     * @returns {number} Available USDT amount for trading
     */
    getAvailableUsdtForTrading() {
        const actualBalance = this.positions[this.quoteCurrency];
        
        if (this.maxUsdtToUse === null) {
            // No limit set, use all available USDT
            return actualBalance;
        }
        
        // Use the smaller of: actual balance or max limit
        const availableAmount = Math.min(actualBalance, this.maxUsdtToUse);
        
        this.log(`USDT Balance: $${actualBalance.toFixed(2)}, Max allowed: $${this.maxUsdtToUse}, Available for trading: $${availableAmount.toFixed(2)}`, 'INFO');
        
        return availableAmount;
    }

    /**
     * Execute one trading cycle - check price and make trading decisions
     * @returns {Promise<void>}
     */
    async runTradingCycle() {
        try {
            // Get current price and balances
            const currentPrice = await this.getPrice();
            if (!currentPrice) return;

            const balances = await this.getBalances();
            if (!balances) return;

            // Get available USDT for trading (respects limit)
            const availableUsdt = this.getAvailableUsdtForTrading();

            // Calculate price change from last observed price
            let priceChangeFromLast = 0;
            if (this.lastPrice) {
                priceChangeFromLast = (currentPrice - this.lastPrice) / this.lastPrice;
            }

            this.log(`${this.symbol}: $${currentPrice.toFixed(this.symbol === 'BTC-USDT' ? 2 : 4)} | ${this.baseCurrency}: ${this.positions[this.baseCurrency].toFixed(6)} | Available USDT: $${availableUsdt.toFixed(2)} | Price change: ${(priceChangeFromLast * 100).toFixed(4)}% | Threshold: ±${(this.priceChangeThreshold * 100).toFixed(4)}%`);

            // Buy condition: Price dropped AND we have enough available USDT
            if (priceChangeFromLast <= -this.priceChangeThreshold && availableUsdt >= this.minOrderSize) {
                const buyAmount = Math.floor(availableUsdt * 0.99); // Use 99% of available USDT
                
                if (buyAmount >= this.minOrderSize) {
                    this.log(`🔻 Price dropped ${(Math.abs(priceChangeFromLast) * 100).toFixed(4)}% (threshold: ${(this.priceChangeThreshold * 100).toFixed(4)}%) - Executing BUY order`, 'WARNING');
                    await this.placeOrder('buy', buyAmount);
                } else {
                    this.log(`Buy amount $${buyAmount} is below minimum order size $${this.minOrderSize}`, 'WARNING');
                }
            }
            // Sell condition: Price rose from last buy price AND we have the base currency
            else if (this.lastBuyPrice && this.positions[this.baseCurrency] > 0) {
                const priceChangeFromBuy = (currentPrice - this.lastBuyPrice) / this.lastBuyPrice;
                
                if (priceChangeFromBuy >= this.priceChangeThreshold) {
                    this.log(`📈 Price rose ${(priceChangeFromBuy * 100).toFixed(4)}% (threshold: ${(this.priceChangeThreshold * 100).toFixed(4)}%) from buy price - Executing SELL order`, 'WARNING');
                    
                    // Fix: Better calculation for small balances with proper minimums
                    const availableBalance = this.positions[this.baseCurrency];
                    let sellAmount;
                    let minimumOrderAmount;
                    
                    if (this.baseCurrency === 'ETH') {
                        // For ETH, use more precision and minimum viable amount
                        minimumOrderAmount = 0.001; // Minimum 0.001 ETH
                        sellAmount = Math.floor(availableBalance * 0.99 * 100000) / 100000; // 5 decimal precision
                    } else if (this.baseCurrency === 'BTC') {
                        // For BTC, use 8 decimal precision
                        minimumOrderAmount = 0.00001; // Minimum 0.00001 BTC
                        sellAmount = Math.floor(availableBalance * 0.99 * 100000000) / 100000000;
                    } else if (this.baseCurrency === 'SOL') {
                        // For SOL, use appropriate precision and minimum
                        minimumOrderAmount = 0.01; // Minimum 0.01 SOL (about $2-3)
                        sellAmount = Math.floor(availableBalance * 0.99 * 10000) / 10000; // 4 decimal precision
                    } else {
                        // For other tokens like WLFI, use appropriate precision
                        minimumOrderAmount = 0.1; // Minimum 0.1 tokens
                        sellAmount = Math.floor(availableBalance * 0.99 * 1000) / 1000;
                    }
                    
                    // Ensure we don't try to sell more than available
                    sellAmount = Math.min(sellAmount, availableBalance);
                    
                    // Check if sell amount meets minimum requirements before attempting order
                    if (sellAmount >= minimumOrderAmount && sellAmount <= availableBalance) {
                        this.log(`Calculated sell amount: ${sellAmount} ${this.baseCurrency} (from balance: ${availableBalance})`, 'INFO');
                        await this.placeOrder('sell', sellAmount);
                    } else {
                        this.log(`Cannot sell: calculated amount ${sellAmount} ${this.baseCurrency} is below minimum ${minimumOrderAmount} or invalid (available: ${availableBalance})`, 'WARNING');
                    }
                }
            }

            // Update last price for next comparison
            this.lastPrice = currentPrice;

        } catch (error) {
            this.log(`Error in trading cycle: ${error.message}`, 'ERROR');
        }
    }

    /**
     * Start the trading bot
     * @returns {Promise<void>}
     */
    async runBot() {
        // Validate environment variables
        if (!process.env.OKX_API_KEY || !process.env.OKX_SECRET_KEY || !process.env.OKX_PASSPHRASE) {
            this.log('❌ Missing required environment variables. Please check your .env file.', 'ERROR');
            this.log('Required: OKX_API_KEY, OKX_SECRET_KEY, OKX_PASSPHRASE', 'ERROR');
            return;
        }

        this.log('🚀 Starting OKX Crypto Trading Bot...', 'SUCCESS');
        this.log(`Trading pair: ${this.symbol}`, 'INFO');
        this.log(`Price change threshold: ${(this.priceChangeThreshold * 100).toFixed(4)}% (${this.priceChangeThreshold})`, 'INFO');
        this.log(`Check interval: ${this.checkInterval / 1000} seconds`, 'INFO');
        this.log(`Minimum order size: $${this.minOrderSize}`, 'INFO');
        if (this.maxUsdtToUse) {
            this.log(`Maximum USDT to use: $${this.maxUsdtToUse}`, 'INFO');
        }
        this.log('───────────────────────────────────────', 'INFO');

        this.isRunning = true;

        // Initial balance check
        await this.getBalances();

        // Main trading loop
        while (this.isRunning) {
            await this.runTradingCycle();
            
            // Wait for next cycle
            this.log(`💤 Waiting ${this.checkInterval / 1000} seconds until next check...`);
            await new Promise(resolve => setTimeout(resolve, this.checkInterval));
        }
    }

    /**
     * Stop the trading bot
     */
    stopBot() {
        this.log('🛑 Stopping trading bot...', 'WARNING');
        this.isRunning = false;
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM. Shutting down gracefully...');
    process.exit(0);
});

// Start the bot if this file is run directly
if (require.main === module) {
    const bot = new CryptoTradingBot();
    bot.runBot().catch(error => {
        console.error('❌ Fatal error:', error.message);
        process.exit(1);
    });
}

module.exports = CryptoTradingBot;
