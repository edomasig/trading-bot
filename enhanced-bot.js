/**
 * Enhanced Crypto Trading Bot for OKX Exchange
 * Maximizes OKX API usage with advanced technical analysis and risk management
 */

// Ensure dotenv is loaded first, with explicit path
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const OKXClient = require('./okx-client');
const TechnicalAnalysis = require('./technical-analysis');
const RiskManager = require('./risk-manager');
const fs = require('fs');

class EnhancedCryptoTradingBot {
    constructor() {
        // Debug: Check if environment variables are loaded
        console.log('🔧 Debug: Environment variables check:');
        console.log(`   API Key: ${process.env.OKX_API_KEY ? 'Found' : 'Missing'}`);
        console.log(`   Secret Key: ${process.env.OKX_SECRET_KEY ? 'Found' : 'Missing'}`);
        console.log(`   Passphrase: ${process.env.OKX_PASSPHRASE ? 'Found' : 'Missing'}`);
        
        if (!process.env.OKX_API_KEY || !process.env.OKX_SECRET_KEY || !process.env.OKX_PASSPHRASE) {
            throw new Error('❌ Missing required OKX API credentials in environment variables');
        }

        // Initialize OKX client
        this.client = new OKXClient({
            apiKey: process.env.OKX_API_KEY,
            secretKey: process.env.OKX_SECRET_KEY,
            passphrase: process.env.OKX_PASSPHRASE,
            baseURL: process.env.OKX_BASE_URL || 'https://www.okx.com',
            apiVersion: process.env.OKX_API_VERSION || 'api/v5'
        });

        // Trading configuration
        this.symbol = process.env.TRADING_SYMBOL || 'SOL-USDT';
        this.baseCurrency = this.symbol.split('-')[0];
        this.quoteCurrency = this.symbol.split('-')[1];
        this.priceChangeThreshold = parseFloat(process.env.PRICE_CHANGE_THRESHOLD) || 0.005;
        this.checkInterval = (parseInt(process.env.CHECK_INTERVAL_SECONDS) || 60) * 1000;
        this.minOrderSize = parseFloat(process.env.MIN_ORDER_SIZE) || 5;
        this.maxUsdtToUse = parseFloat(process.env.MAX_USDT_TO_USE) || null;

        // Feature toggles
        this.enableTechnicalAnalysis = process.env.ENABLE_TECHNICAL_ANALYSIS === 'true';
        this.enableRiskManagement = process.env.ENABLE_RISK_MANAGEMENT === 'true';
        this.enableAdaptiveThreshold = process.env.ENABLE_ADAPTIVE_THRESHOLD === 'true';
        this.enableStopLoss = process.env.ENABLE_STOP_LOSS === 'true';
        this.enableMarketDataAnalysis = process.env.ENABLE_MARKET_DATA_ANALYSIS === 'true';
        this.enableOrderBookAnalysis = process.env.ENABLE_ORDER_BOOK_ANALYSIS === 'true';

        // Initialize modules
        this.technicalAnalysis = new TechnicalAnalysis({
            rsiPeriod: parseInt(process.env.RSI_PERIOD) || 14,
            rsiOversold: parseInt(process.env.RSI_OVERSOLD) || 30,
            rsiOverbought: parseInt(process.env.RSI_OVERBOUGHT) || 70,
            maShortPeriod: parseInt(process.env.MA_SHORT_PERIOD) || 10,
            maLongPeriod: parseInt(process.env.MA_LONG_PERIOD) || 21,
            bollingerPeriod: parseInt(process.env.BOLLINGER_PERIOD) || 20,
            bollingerStdDev: parseInt(process.env.BOLLINGER_STDDEV) || 2
        });

        this.riskManager = new RiskManager({
            stopLossPercentage: parseFloat(process.env.STOP_LOSS_PERCENTAGE) || 0.02,
            takeProfitPercentage: parseFloat(process.env.TAKE_PROFIT_PERCENTAGE) || 0.03,
            maxDailyLoss: parseFloat(process.env.MAX_DAILY_LOSS) || 5,
            maxDailyTrades: parseInt(process.env.MAX_DAILY_TRADES) || 20,
            positionSizePercentage: parseFloat(process.env.POSITION_SIZE_PERCENTAGE) || 0.8,
            trailingStopPercentage: parseFloat(process.env.TRAILING_STOP_PERCENTAGE) || 0.015,
            minVolumeThreshold: parseFloat(process.env.MIN_VOLUME_THRESHOLD) || 1000000,
            maxSpreadPercentage: parseFloat(process.env.MAX_SPREAD_PERCENTAGE) || 0.001
        });

        // State variables
        this.lastPrice = null;
        this.lastBuyPrice = null;
        this.positions = {};
        this.isRunning = false;
        this.marketData = null;
        this.candleData = [];
        this.orderBookData = null;
        
        // Multi-timeframe data
        this.timeframes = {
            short: process.env.SHORT_TERM_TIMEFRAME || '5m',
            medium: process.env.MEDIUM_TERM_TIMEFRAME || '15m',
            long: process.env.LONG_TERM_TIMEFRAME || '1H'
        };
        this.candleHistoryLimit = parseInt(process.env.CANDLE_HISTORY_LIMIT) || 100;

        console.log('🤖 Enhanced OKX Trading Bot initialized');
        console.log(`📊 Trading pair: ${this.symbol}`);
        console.log(`🎯 Threshold: ${(this.priceChangeThreshold * 100).toFixed(3)}%`);
        console.log(`⏱️ Check interval: ${this.checkInterval / 1000} seconds`);
        console.log(`🧠 Technical Analysis: ${this.enableTechnicalAnalysis ? 'ON' : 'OFF'}`);
        console.log(`🛡️ Risk Management: ${this.enableRiskManagement ? 'ON' : 'OFF'}`);
        console.log(`📈 Market Data Analysis: ${this.enableMarketDataAnalysis ? 'ON' : 'OFF'}`);
    }

    /**
     * Enhanced logging with levels and timestamps
     */
    log(message, level = 'INFO') {
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const colors = {
            'INFO': '\\033[36m',      // Cyan
            'SUCCESS': '\\033[32m',   // Green
            'WARNING': '\\033[33m',   // Yellow
            'ERROR': '\\033[31m',     // Red
            'SIGNAL': '\\033[35m',    // Magenta
            'RESET': '\\033[0m'       // Reset
        };
        
        const color = colors[level] || colors['INFO'];
        console.log(`${color}[${timestamp}] [${level}] ${message}${colors['RESET']}`);
    }

    /**
     * Get comprehensive market data from OKX API
     */
    async getEnhancedMarketData() {
        try {
            // Get basic market data
            this.marketData = await this.client.getMarketData(this.symbol);
            if (!this.marketData) {
                throw new Error('Failed to fetch market data');
            }

            // Get candlestick data for technical analysis
            if (this.enableTechnicalAnalysis) {
                this.candleData = await this.client.getCandlesticks(
                    this.symbol, 
                    this.timeframes.short, 
                    this.candleHistoryLimit
                );
            }

            // Get order book data if enabled
            if (this.enableOrderBookAnalysis) {
                this.orderBookData = await this.client.getOrderBook(
                    this.symbol, 
                    parseInt(process.env.ORDER_BOOK_DEPTH) || 20
                );
            }

            return true;
        } catch (error) {
            this.log(`Error fetching enhanced market data: ${error.message}`, 'ERROR');
            return false;
        }
    }

    /**
     * Get current account balances
     */
    async getBalances() {
        try {
            const balances = await this.client.getBalances();
            
            this.positions = {
                [this.baseCurrency]: balances[this.baseCurrency]?.available || 0,
                [this.quoteCurrency]: balances[this.quoteCurrency]?.available || 0
            };
            
            return this.positions;
        } catch (error) {
            this.log(`Error fetching balances: ${error.message}`, 'ERROR');
            return null;
        }
    }

    /**
     * Calculate dynamic threshold based on market volatility
     */
    getDynamicThreshold() {
        if (!this.enableAdaptiveThreshold || !this.candleData || this.candleData.length < 20) {
            return this.priceChangeThreshold;
        }

        const prices = this.candleData.map(candle => candle.close);
        const volatility = this.technicalAnalysis.calculateVolatility(
            prices, 
            parseInt(process.env.VOLATILITY_WINDOW) || 50
        );

        // Adjust threshold based on volatility
        const baseThreshold = this.priceChangeThreshold;
        let adjustedThreshold = baseThreshold;

        if (volatility > 0.3) {
            adjustedThreshold = baseThreshold * 1.5; // Increase threshold in high volatility
        } else if (volatility < 0.1) {
            adjustedThreshold = baseThreshold * 0.7; // Decrease threshold in low volatility
        }

        return Math.max(adjustedThreshold, baseThreshold * 0.5); // Minimum 50% of base threshold
    }

    /**
     * Enhanced order placement with intelligent features
     */
    async placeIntelligentOrder(side, amount, reason = '') {
        try {
            // Pre-order risk checks
            if (this.enableRiskManagement) {
                const dailyLimits = this.riskManager.checkDailyLimits();
                if (!dailyLimits.allowed) {
                    this.log(`Order blocked: ${dailyLimits.reason}`, 'WARNING');
                    return false;
                }
            }

            // Safety checks for minimum order amounts
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
                    return false;
                }
            }

            this.log(`🚀 Placing ${side} order for ${amount} ${side === 'buy' ? this.quoteCurrency : this.baseCurrency}`, 'WARNING');
            this.log(`📝 Reason: ${reason}`, 'INFO');
            
            const orderResponse = await this.client.placeOrder(this.symbol, side, amount);
            
            if (orderResponse && orderResponse.length > 0) {
                const order = orderResponse[0];
                if (order.sCode === '0') {
                    this.log(`✅ ${side.toUpperCase()} order placed successfully! Order ID: ${order.ordId}`, 'SUCCESS');
                    
                    // Log transaction to file
                    this.logTransaction(
                        side.toUpperCase(),
                        amount,
                        this.marketData.price,
                        order.ordId,
                        'SUCCESS'
                    );
                    
                    // Update last buy price if this was a buy order
                    if (side === 'buy' && this.marketData.price) {
                        this.lastBuyPrice = this.marketData.price;
                        this.log(`📌 Updated last buy price to: $${this.lastBuyPrice.toFixed(4)}`, 'INFO');
                    }

                    // Record trade for risk management
                    if (this.enableRiskManagement) {
                        this.riskManager.recordTrade(this.symbol, side, amount, 0); // P&L calculated later
                    }
                    
                    return true;
                } else {
                    this.log(`❌ Order failed: ${order.sMsg} (Code: ${order.sCode})`, 'ERROR');
                    return false;
                }
            } else {
                this.log('❌ No order response received', 'ERROR');
                return false;
            }
        } catch (error) {
            this.log(`❌ Error placing ${side} order: ${error.message}`, 'ERROR');
            return false;
        }
    }

    /**
     * Enhanced trading cycle with intelligent decision making
     */
    async runEnhancedTradingCycle() {
        try {
            // Fetch all market data
            const dataFetched = await this.getEnhancedMarketData();
            if (!dataFetched) return;

            const balances = await this.getBalances();
            if (!balances) return;

            const currentPrice = this.marketData.price;
            const availableUsdt = this.getAvailableUsdtForTrading();

            // Generate technical analysis signal if enabled
            let technicalSignal = null;
            if (this.enableTechnicalAnalysis && this.candleData && this.candleData.length >= 30) {
                technicalSignal = this.technicalAnalysis.generateTradingSignal(
                    this.marketData,
                    this.candleData,
                    this.orderBookData
                );
                
                this.log(`🧠 Technical Signal: ${technicalSignal.signal} (${technicalSignal.confidence.toFixed(1)}% confidence)`, 'SIGNAL');
                if (technicalSignal.signals.length > 0) {
                    this.log(`📊 Factors: ${technicalSignal.signals.join(', ')}`, 'INFO');
                }
            }

            // Assess overall risk if enabled
            let riskAssessment = null;
            if (this.enableRiskManagement) {
                riskAssessment = this.riskManager.assessRisk({
                    marketData: this.marketData,
                    orderBookAnalysis: this.orderBookData ? this.technicalAnalysis.analyzeOrderBook(this.orderBookData, currentPrice) : null,
                    technicalSignal,
                    availableCapital: availableUsdt,
                    currentPositions: this.positions[this.baseCurrency] * currentPrice
                });

                this.log(`🛡️ Risk Level: ${riskAssessment.riskLevel} (${riskAssessment.riskScore.toFixed(1)}%)`, 'INFO');
                
                if (riskAssessment.recommendedAction === 'AVOID') {
                    this.log(`⛔ Trading blocked due to high risk: ${riskAssessment.factors.join(', ')}`, 'WARNING');
                    return;
                }
            }

            // Get dynamic threshold
            const currentThreshold = this.getDynamicThreshold();

            // Calculate price change from last observed price
            let priceChangeFromLast = 0;
            if (this.lastPrice) {
                priceChangeFromLast = (currentPrice - this.lastPrice) / this.lastPrice;
            }

            // Enhanced logging with market data
            this.log(`💹 ${this.symbol}: $${currentPrice.toFixed(4)} | 24h: ${this.marketData.priceChangePercent24h.toFixed(2)}% | Vol: $${(this.marketData.volume24h / 1000000).toFixed(1)}M`, 'INFO');
            this.log(`💰 Balance: ${this.positions[this.baseCurrency].toFixed(6)} ${this.baseCurrency} | $${availableUsdt.toFixed(2)} USDT available`, 'INFO');
            this.log(`📊 Price change: ${(priceChangeFromLast * 100).toFixed(4)}% | Threshold: ±${(currentThreshold * 100).toFixed(4)}%`, 'INFO');

            // Check for stop loss/take profit on existing positions
            if (this.enableStopLoss && this.lastBuyPrice && this.positions[this.baseCurrency] > 0) {
                const stopLoss = this.riskManager.checkStopLoss(this.symbol, currentPrice, this.lastBuyPrice, 'buy');
                const takeProfit = this.riskManager.checkTakeProfit(this.symbol, currentPrice, this.lastBuyPrice, 'buy');
                const trailingStop = this.riskManager.updateTrailingStop(this.symbol, currentPrice, this.lastBuyPrice, 'buy');

                if (stopLoss.triggered) {
                    this.log(`🛑 ${stopLoss.reason}`, 'WARNING');
                    await this.sellAllPosition('Stop Loss Triggered');
                    return;
                }

                if (takeProfit.triggered) {
                    this.log(`🎯 ${takeProfit.reason}`, 'SUCCESS');
                    await this.sellAllPosition('Take Profit Triggered');
                    return;
                }

                if (trailingStop.triggered) {
                    this.log(`📉 ${trailingStop.reason}`, 'WARNING');
                    await this.sellAllPosition('Trailing Stop Triggered');
                    return;
                }
            }

            // Buy logic with enhanced intelligence
            const shouldBuyBasic = priceChangeFromLast <= -currentThreshold && availableUsdt >= this.minOrderSize;
            const shouldBuyTechnical = technicalSignal && (technicalSignal.signal === 'BUY' || technicalSignal.signal === 'STRONG_BUY') && technicalSignal.confidence > 60;
            
            if (shouldBuyBasic || shouldBuyTechnical) {
                let buyReason = [];
                if (shouldBuyBasic) {
                    buyReason.push(`Price drop: ${(Math.abs(priceChangeFromLast) * 100).toFixed(4)}%`);
                }
                if (shouldBuyTechnical) {
                    buyReason.push(`Technical signal: ${technicalSignal.signal} (${technicalSignal.confidence.toFixed(1)}%)`);
                }

                // Calculate intelligent position size
                let buyAmount = Math.floor(availableUsdt * 0.99);
                if (this.enableRiskManagement) {
                    const positionInfo = this.riskManager.calculatePositionSize(
                        availableUsdt,
                        currentPrice,
                        currentPrice * (1 - this.riskManager.stopLossPercentage)
                    );
                    buyAmount = Math.floor(positionInfo.recommendedSize);
                }
                
                if (buyAmount >= this.minOrderSize) {
                    this.log(`🔻 BUY SIGNAL: ${buyReason.join(' + ')}`, 'WARNING');
                    await this.placeIntelligentOrder('buy', buyAmount, buyReason.join(' + '));
                } else {
                    this.log(`💸 Buy amount $${buyAmount} is below minimum order size $${this.minOrderSize}`, 'WARNING');
                }
            }
            // Sell logic with enhanced intelligence
            else if (this.lastBuyPrice && this.positions[this.baseCurrency] > 0) {
                const priceChangeFromBuy = (currentPrice - this.lastBuyPrice) / this.lastBuyPrice;
                
                const shouldSellBasic = priceChangeFromBuy >= currentThreshold;
                const shouldSellTechnical = technicalSignal && (technicalSignal.signal === 'SELL' || technicalSignal.signal === 'STRONG_SELL') && technicalSignal.confidence > 60;
                
                if (shouldSellBasic || shouldSellTechnical) {
                    let sellReason = [];
                    if (shouldSellBasic) {
                        sellReason.push(`Price rise: ${(priceChangeFromBuy * 100).toFixed(4)}%`);
                    }
                    if (shouldSellTechnical) {
                        sellReason.push(`Technical signal: ${technicalSignal.signal} (${technicalSignal.confidence.toFixed(1)}%)`);
                    }

                    await this.sellAllPosition(sellReason.join(' + '));
                }
            }

            // Update last price for next cycle
            this.lastPrice = currentPrice;

        } catch (error) {
            this.log(`Error in enhanced trading cycle: ${error.message}`, 'ERROR');
        }
    }

    /**
     * Sell all available position with intelligent sizing
     */
    async sellAllPosition(reason) {
        const availableBalance = this.positions[this.baseCurrency];
        let sellAmount;
        let minimumOrderAmount;
        
        if (this.baseCurrency === 'ETH') {
            minimumOrderAmount = 0.001;
            sellAmount = Math.floor(availableBalance * 0.99 * 100000) / 100000;
        } else if (this.baseCurrency === 'BTC') {
            minimumOrderAmount = 0.00001;
            sellAmount = Math.floor(availableBalance * 0.99 * 100000000) / 100000000;
        } else if (this.baseCurrency === 'SOL') {
            minimumOrderAmount = 0.01;
            sellAmount = Math.floor(availableBalance * 0.99 * 10000) / 10000;
        } else {
            minimumOrderAmount = 0.1;
            sellAmount = Math.floor(availableBalance * 0.99 * 1000) / 1000;
        }
        
        sellAmount = Math.min(sellAmount, availableBalance);
        
        if (sellAmount >= minimumOrderAmount && sellAmount <= availableBalance) {
            this.log(`📈 SELL SIGNAL: ${reason}`, 'WARNING');
            await this.placeIntelligentOrder('sell', sellAmount, reason);
        } else {
            this.log(`⚠️ Cannot sell: calculated amount ${sellAmount} ${this.baseCurrency} is below minimum ${minimumOrderAmount}`, 'WARNING');
        }
    }

    /**
     * Get available USDT for trading (respects MAX_USDT_TO_USE limit)
     */
    getAvailableUsdtForTrading() {
        const actualBalance = this.positions[this.quoteCurrency];
        
        if (this.maxUsdtToUse === null || this.maxUsdtToUse === 0) {
            return actualBalance;
        }
        
        const availableAmount = Math.min(actualBalance, this.maxUsdtToUse);
        return availableAmount;
    }

    /**
     * Log transaction to CSV file
     */
    logTransaction(action, amount, price, orderId, status) {
        const timestamp = new Date();
        const date = timestamp.toISOString().split('T')[0];
        const time = timestamp.toTimeString().split(' ')[0];
        
        const logEntry = `${date},${time},${this.symbol},${action},${amount},${price.toFixed(8)},${(amount * (action === 'BUY' ? 1 : price)).toFixed(2)},${orderId},${status}\\n`;
        
        const logFile = path.join(__dirname, 'transactions.log');
        
        if (!fs.existsSync(logFile)) {
            const header = 'Date,Time,Trading_Symbol,Action,Amount,Price,Total_Value,Order_ID,Status\\n';
            fs.writeFileSync(logFile, header);
        }
        
        fs.appendFileSync(logFile, logEntry);
    }

    /**
     * Start the enhanced trading bot
     */
    async start() {
        if (this.isRunning) {
            this.log('Bot is already running!', 'WARNING');
            return;
        }

        this.isRunning = true;
        this.log('🚀 Starting Enhanced OKX Crypto Trading Bot...', 'SUCCESS');
        
        // Test connection first
        try {
            await this.getEnhancedMarketData();
            await this.getBalances();
            this.log('✅ Connection to OKX API successful!', 'SUCCESS');
        } catch (error) {
            this.log(`❌ Failed to connect to OKX API: ${error.message}`, 'ERROR');
            this.isRunning = false;
            return;
        }

        // Display startup information
        this.log(`🎯 Enhanced Trading Configuration:`, 'INFO');
        this.log(`   • Symbol: ${this.symbol}`, 'INFO');
        this.log(`   • Base threshold: ${(this.priceChangeThreshold * 100).toFixed(3)}%`, 'INFO');
        this.log(`   • Check interval: ${this.checkInterval / 1000}s`, 'INFO');
        this.log(`   • Min order size: $${this.minOrderSize}`, 'INFO');
        this.log(`   • Max USDT per trade: ${this.maxUsdtToUse ? '$' + this.maxUsdtToUse : 'No limit'}`, 'INFO');
        this.log(`   • Technical Analysis: ${this.enableTechnicalAnalysis}`, 'INFO');
        this.log(`   • Risk Management: ${this.enableRiskManagement}`, 'INFO');
        this.log(`   • Adaptive Threshold: ${this.enableAdaptiveThreshold}`, 'INFO');
        this.log(`   • Stop Loss: ${this.enableStopLoss}`, 'INFO');

        // Start trading loop
        const tradingLoop = setInterval(async () => {
            if (!this.isRunning) {
                clearInterval(tradingLoop);
                return;
            }
            
            await this.runEnhancedTradingCycle();
        }, this.checkInterval);

        this.log('🔄 Enhanced trading bot is now running!', 'SUCCESS');
        this.log('📊 Monitoring market with intelligent analysis...', 'INFO');
    }

    /**
     * Stop the trading bot
     */
    stop() {
        this.isRunning = false;
        this.log('🛑 Enhanced trading bot stopped!', 'WARNING');
    }
}

// Create and start the enhanced bot
const bot = new EnhancedCryptoTradingBot();

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\\n🛑 Received SIGINT, shutting down gracefully...');
    bot.stop();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\\n🛑 Received SIGTERM, shutting down gracefully...');
    bot.stop();
    process.exit(0);
});

// Start the bot
bot.start().catch(console.error);

module.exports = EnhancedCryptoTradingBot;
