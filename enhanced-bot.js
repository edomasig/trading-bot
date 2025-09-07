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
const PositionTracker = require('./position-tracker');
const fs = require('fs');
const fsPromises = require('fs').promises;

class MomentumAnalysis {
    constructor() {
        this.priceHistory = [];
        this.momentumPeriod = 5;
    }

    calculateMomentum(prices) {
        if (prices.length < this.momentumPeriod + 1) return 0;
        
        const recent = prices.slice(-this.momentumPeriod);
        const older = prices.slice(-this.momentumPeriod * 2, -this.momentumPeriod);
        
        const recentAvg = recent.reduce((a, b) => a + b) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b) / older.length;
        
        return ((recentAvg - olderAvg) / olderAvg) * 100;
    }

    getMomentumSignal(prices) {
        const momentum = this.calculateMomentum(prices);
        
        if (momentum > 0.5) return 'STRONG_BULLISH';
        if (momentum > 0.2) return 'BULLISH';
        if (momentum < -0.5) return 'STRONG_BEARISH';
        if (momentum < -0.2) return 'BEARISH';
        return 'NEUTRAL';
    }
}

class SentimentAnalysis {
    constructor() {
        this.volumeHistory = [];
        this.priceHistory = [];
    }

    updateData(volume, price) {
        this.volumeHistory.push(volume);
        this.priceHistory.push(price);
        
        if (this.volumeHistory.length > 20) {
            this.volumeHistory.shift();
            this.priceHistory.shift();
        }
    }

    calculateSentiment() {
        if (this.volumeHistory.length < 10) return 'NEUTRAL';
        
        const avgVolume = this.volumeHistory.reduce((a, b) => a + b) / this.volumeHistory.length;
        const currentVolume = this.volumeHistory[this.volumeHistory.length - 1];
        const volumeRatio = currentVolume / avgVolume;
        
        const priceChange = (this.priceHistory[this.priceHistory.length - 1] - this.priceHistory[0]) / this.priceHistory[0];
        
        if (volumeRatio > 1.5 && priceChange > 0.01) return 'VERY_BULLISH';
        if (volumeRatio > 1.2 && priceChange > 0.005) return 'BULLISH';
        if (volumeRatio < 0.7 && priceChange < -0.01) return 'VERY_BEARISH';
        if (volumeRatio < 0.8 && priceChange < -0.005) return 'BEARISH';
        
        return 'NEUTRAL';
    }
}

class PatternRecognition {
    constructor() {
        this.priceHistory = [];
    }

    updatePrice(price) {
        this.priceHistory.push(price);
        if (this.priceHistory.length > 50) {
            this.priceHistory.shift();
        }
    }

    detectDoubleBottom() {
        if (this.priceHistory.length < 20) return false;
        
        const recent = this.priceHistory.slice(-20);
        const min1 = Math.min(...recent.slice(0, 10));
        const min2 = Math.min(...recent.slice(10));
        const max = Math.max(...recent);
        
        return Math.abs(min1 - min2) / min1 < 0.02 && recent[recent.length - 1] > (min1 + min2) / 2;
    }

    detectHeadAndShoulders() {
        if (this.priceHistory.length < 30) return false;
        
        const recent = this.priceHistory.slice(-30);
        const peaks = this.findPeaks(recent);
        
        if (peaks.length >= 3) {
            const [left, head, right] = peaks.slice(-3);
            return head > left && head > right && Math.abs(left - right) / left < 0.05;
        }
        
        return false;
    }

    findPeaks(prices) {
        const peaks = [];
        for (let i = 1; i < prices.length - 1; i++) {
            if (prices[i] > prices[i-1] && prices[i] > prices[i+1]) {
                peaks.push(prices[i]);
            }
        }
        return peaks;
    }

    getPatternSignal() {
        if (this.detectDoubleBottom()) return 'DOUBLE_BOTTOM_BUY';
        if (this.detectHeadAndShoulders()) return 'HEAD_SHOULDERS_SELL';
        return 'NO_PATTERN';
    }
}

class DynamicRiskManager {
    constructor() {
        this.volatilityHistory = [];
        this.basePositionSize = 0.9;
    }

    updateVolatility(returns) {
        this.volatilityHistory.push(returns);
        if (this.volatilityHistory.length > 20) {
            this.volatilityHistory.shift();
        }
    }

    calculateVolatility() {
        if (this.volatilityHistory.length < 10) return 0.02;
        
        const avgReturn = this.volatilityHistory.reduce((a, b) => a + b) / this.volatilityHistory.length;
        const variance = this.volatilityHistory.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / this.volatilityHistory.length;
        return Math.sqrt(variance);
    }

    getDynamicPositionSize() {
        const volatility = this.calculateVolatility();
        
        if (volatility > 0.03) return this.basePositionSize * 0.6; // High volatility - smaller positions
        if (volatility > 0.02) return this.basePositionSize * 0.8; // Medium volatility
        return this.basePositionSize; // Low volatility - full size
    }

    getDynamicThreshold(baseThreshold) {
        const volatility = this.calculateVolatility();
        
        if (volatility > 0.03) return baseThreshold * 1.5; // High volatility - wider threshold
        if (volatility > 0.02) return baseThreshold * 1.2; // Medium volatility
        return baseThreshold * 0.8; // Low volatility - tighter threshold
    }
}

class EnhancedTradingBot {
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

        // New intelligent components
        this.momentumAnalysis = new MomentumAnalysis();
        this.sentimentAnalysis = new SentimentAnalysis();
        this.patternRecognition = new PatternRecognition();
        this.dynamicRiskManager = new DynamicRiskManager();
        
        // Enhanced configuration
        this.enableMomentumAnalysis = process.env.ENABLE_MOMENTUM_ANALYSIS === 'true';
        this.enableSentimentAnalysis = process.env.ENABLE_SENTIMENT_ANALYSIS === 'true';
        this.enablePatternRecognition = process.env.ENABLE_PATTERN_RECOGNITION === 'true';
        this.enableDynamicRisk = process.env.ENABLE_DYNAMIC_THRESHOLD === 'true';

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

        // Initialize position tracker for cost-basis tracking
        this.positionTracker = new PositionTracker(this.symbol);

        // Transaction logging setup
        this.transactionLogFile = path.join(__dirname, 'logs', 'transactions.log');
        this.tradeLogFile = path.join(__dirname, 'logs', 'trades-only.log');
        this.ensureLogDirectory();

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

        // Add fixed reference points for Option C hybrid strategy
        this.fixedBuyTarget = null;
        this.fixedSellTarget = null;
        this.lastTradePrice = null;
        this.useFixedTargets = process.env.ENABLE_ADAPTIVE_THRESHOLD === 'false';
        this.enableFixedTargets = process.env.ENABLE_FIXED_TARGETS === 'true';

        // Buy current price mode
        this.buyCurrentPriceMode = process.argv.includes('--buy-current-price');
        this.initialMarketBuyExecuted = false;

        console.log('🤖 Enhanced OKX Trading Bot initialized');
        console.log(`📊 Trading pair: ${this.symbol}`);
        console.log(`🎯 Threshold: ${(this.priceChangeThreshold * 100).toFixed(3)}%`);
        console.log(`⏱️ Check interval: ${this.checkInterval / 1000} seconds`);
        console.log(`🧠 Technical Analysis: ${this.enableTechnicalAnalysis ? 'ON' : 'OFF'}`);
        console.log(`🛡️ Risk Management: ${this.enableRiskManagement ? 'ON' : 'OFF'}`);
        console.log(`📈 Market Data Analysis: ${this.enableMarketDataAnalysis ? 'ON' : 'OFF'}`);
    }

    /**
     * Get the minimum tradable amount for the base currency
     * Used as an epsilon to decide if we "have a position" or it's just dust
     */
    getMinimumBaseAmount() {
        if (this.baseCurrency === 'ETH') return 0.001;
        if (this.baseCurrency === 'BTC') return 0.00001;
        if (this.baseCurrency === 'SOL') return 0.01;
        return 0.1; // sensible default for many alts
    }

    /**
     * Ensure logs directory exists
     */
    async ensureLogDirectory() {
        try {
            await fsPromises.mkdir(path.join(__dirname, 'logs'), { recursive: true });
        } catch (error) {
            // Directory already exists or other error, continue silently
        }
    }

    /**
     * Log successful transactions to dedicated files
     */
    async logTransaction(type, data, isStopLoss = false) {
        const timestamp = new Date().toISOString();
        
        // Determine transaction type with stop loss indicator
        const transactionType = isStopLoss ? `${type}_STOP_LOSS` : type;
        const emoji = type === 'BUY' ? '📈' : (isStopLoss ? '🛑' : '📉');
        const typeLabel = isStopLoss ? `${emoji} ${type} (STOP LOSS)` : `${emoji} ${type}`;
        
        const logEntry = {
            timestamp,
            type: transactionType,
            isStopLoss,
            ...data
        };
        
        // JSON format for data analysis
        const jsonLogLine = `${timestamp} | ${transactionType} | ${JSON.stringify(data)}\n`;
        
        // Human readable format
        const humanReadable = `${timestamp} | ${typeLabel} | Price: $${data.price} | Amount: ${data.amount} | Value: $${data.value}${data.profit ? ` | Profit: ${data.profit}` : ''}${isStopLoss ? ' | ⚠️ TRIGGERED BY STOP LOSS' : ''}\n`;
        
        try {
            // Write to both JSON format and human-readable format
            await fsPromises.appendFile(this.transactionLogFile, jsonLogLine);
            await fsPromises.appendFile(this.tradeLogFile, humanReadable);
            
            console.log(`📝 Transaction logged: ${typeLabel} at $${data.price}`);
        } catch (error) {
            console.error('❌ Failed to write transaction log:', error);
        }
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
            // Use the OKXClient methods that exist in okx-client.js
            const [marketData, candlesticks, orderBook] = await Promise.all([
                this.client.getMarketData(this.symbol),
                this.client.getCandlesticks(this.symbol, '1m', 100),
                this.client.getOrderBook(this.symbol, 20)
            ]);

            // Populate bot state so other methods can read latest data
            this.marketData = marketData || null;
            this.candleData = candlesticks || [];
            this.orderBookData = orderBook || null;

            // Update analysis components using the marketData shape returned by getMarketData()
            if (marketData && marketData.price) {
                this.sentimentAnalysis.updateData(parseFloat(marketData.volume24h || 0), parseFloat(marketData.price));
                this.patternRecognition.updatePrice(parseFloat(marketData.price));

                // Calculate returns for volatility
                if (this.lastPrice) {
                    const return_pct = (parseFloat(marketData.price) - this.lastPrice) / this.lastPrice;
                    this.dynamicRiskManager.updateVolatility(return_pct);
                }
            }

            const momentumInput = this.candleData.map(c => (typeof c.close === 'number' ? c.close : parseFloat(c.close)));

            return {
                ticker: marketData,
                candles: this.candleData,
                orderBook: this.orderBookData,
                momentum: this.enableMomentumAnalysis ? this.momentumAnalysis.getMomentumSignal(momentumInput || []) : 'DISABLED',
                sentiment: this.enableSentimentAnalysis ? this.sentimentAnalysis.calculateSentiment() : 'DISABLED',
                pattern: this.enablePatternRecognition ? this.patternRecognition.getPatternSignal() : 'DISABLED'
            };
        } catch (error) {
            this.log(`Error fetching enhanced market data: ${error.message}`, 'ERROR');
            return null;
        }
    }

    getIntelligentSignal(marketData) {
        const signals = {
            technical: this.getTechnicalSignal(),
            momentum: marketData.momentum,
            sentiment: marketData.sentiment,
            pattern: marketData.pattern
        };

        // Combine signals with weights
        const weights = {
            technical: 0.4,
            momentum: 0.2,
            sentiment: 0.2,
            pattern: 0.2
        };

        let bullishScore = 0;
        let bearishScore = 0;

        // Technical signal
        if (signals.technical === 'BUY') bullishScore += weights.technical;
        else if (signals.technical === 'SELL') bearishScore += weights.technical;

        // Momentum signal
        if (signals.momentum === 'STRONG_BULLISH') bullishScore += weights.momentum;
        else if (signals.momentum === 'STRONG_BEARISH') bearishScore += weights.momentum;
        else if (signals.momentum === 'BULLISH') bullishScore += weights.momentum * 0.7;
        else if (signals.momentum === 'BEARISH') bearishScore += weights.momentum * 0.7;

        // Sentiment signal
        if (signals.sentiment === 'VERY_BULLISH') bullishScore += weights.sentiment;
        else if (signals.sentiment === 'VERY_BEARISH') bearishScore += weights.sentiment;
        else if (signals.sentiment === 'BULLISH') bullishScore += weights.sentiment * 0.8;
        else if (signals.sentiment === 'BEARISH') bearishScore += weights.sentiment * 0.8;

        // Pattern signal
        if (signals.pattern === 'DOUBLE_BOTTOM_BUY') bullishScore += weights.pattern;
        else if (signals.pattern === 'HEAD_SHOULDERS_SELL') bearishScore += weights.pattern;

        const confidence = Math.max(bullishScore, bearishScore);
        
        if (bullishScore > bearishScore && confidence > 0.6) return { signal: 'BUY', confidence };
        if (bearishScore > bullishScore && confidence > 0.6) return { signal: 'SELL', confidence };
        
        return { signal: 'HOLD', confidence };
    }

    /**
     * Execute initial market buy at current price (for buy-current-price mode)
     */
    async executeInitialMarketBuy() {
        try {
            const balances = await this.getBalances();
            if (!balances) return false;

            const availableUsdt = this.getAvailableUsdtForTrading();
            const currentPrice = this.marketData.price;

            // Check if we already have a position
            const rawPos = Number(this.positions[this.baseCurrency]) || 0;
            const epsilon = this.getMinimumBaseAmount();
            if (rawPos > epsilon) {
                this.log(`💰 Already have ${rawPos.toFixed(6)} ${this.baseCurrency} (>= min tradable ${epsilon}), skipping initial buy`, 'INFO');
                return false;
            }
            if (rawPos > 0 && rawPos <= epsilon) {
                this.log(`🧹 Detected tiny dust balance ${rawPos.toFixed(8)} ${this.baseCurrency} (<= ${epsilon}). Treating as no position for initial buy.`, 'INFO');
            }

            // Check if we have enough USDT
            if (availableUsdt < this.minOrderSize) {
                this.log(`❌ Insufficient USDT: $${availableUsdt.toFixed(2)} < $${this.minOrderSize} minimum`, 'ERROR');
                return false;
            }

            // Calculate buy amount (use 99% to avoid rounding issues)
            const buyAmount = Math.floor(availableUsdt * 0.99);

            this.log(`🚀 INITIAL MARKET BUY MODE ACTIVATED`, 'SUCCESS');
            this.log(`💵 Buying $${buyAmount} USDT worth of ${this.baseCurrency} at market price $${currentPrice.toFixed(4)}`, 'SUCCESS');
            
            const orderSuccess = await this.placeIntelligentOrder('buy', buyAmount, 'Initial market buy at current price');
            
            if (orderSuccess) {
                this.initialMarketBuyExecuted = true;
                
                // Update targets after the initial buy
                if (this.enableFixedTargets || this.useFixedTargets) {
                    this.updateTargetsAfterTrade('buy', currentPrice, currentPrice, this.getDynamicThreshold());
                }
                
                this.log(`✅ Initial market buy completed! Now monitoring for sell opportunities...`, 'SUCCESS');
                return true;
            } else {
                this.log(`❌ Initial market buy failed`, 'ERROR');
                return false;
            }
        } catch (error) {
            this.log(`❌ Error in initial market buy: ${error.message}`, 'ERROR');
            return false;
        }
    }

    /**
     * Initialize or update fixed targets based on current market price
     * Implements Option C: Hybrid strategy for post-sell buy target calculation
     */
    updateFixedTargets(currentPrice, threshold) {
        // If no fixed targets exist or we're starting fresh, set them based on current price
        if (!this.fixedBuyTarget || !this.fixedSellTarget) {
            this.fixedBuyTarget = currentPrice * (1 - threshold);
            this.fixedSellTarget = currentPrice * (1 + threshold);
            this.log(`🎯 Fixed targets initialized - BUY: $${this.fixedBuyTarget.toFixed(4)}, SELL: $${this.fixedSellTarget.toFixed(4)}`, 'INFO');
        }
    }

    /**
     * Calculate next buy target after a sell using Option C hybrid strategy
     * Uses the lower of: sell-price-based target OR current-market-based target
     */
    calculateHybridBuyTarget(sellPrice, currentMarketPrice, threshold) {
        // Option 1: Base next buy on the sell price
        const sellBasedTarget = sellPrice * (1 - threshold);
        
        // Option 2: Base next buy on current market price
        const marketBasedTarget = currentMarketPrice * (1 - threshold);
        
        // Option C: Use the lower of the two (more conservative/profitable)
        const hybridTarget = Math.min(sellBasedTarget, marketBasedTarget);
        
        this.log(`🧮 Hybrid calculation - Sell-based: $${sellBasedTarget.toFixed(4)}, Market-based: $${marketBasedTarget.toFixed(4)}, Selected: $${hybridTarget.toFixed(4)}`, 'INFO');
        
        return hybridTarget;
    }

    /**
     * Update targets after a successful trade
     */
    updateTargetsAfterTrade(tradeType, tradePrice, currentMarketPrice, threshold) {
        if (tradeType === 'buy') {
            // After a buy, update sell target based on average cost
            const summary = this.positionTracker.getPositionSummary();
            if (summary && summary.averageBuyPrice && summary.averageBuyPrice > 0) {
                // Use average cost for sell target calculation
                this.fixedSellTarget = summary.averageBuyPrice * (1 + threshold);
            } else {
                // Fallback to trade price
                this.fixedSellTarget = tradePrice * (1 + threshold);
            }
            this.log(`🎯 Updated SELL target after buy: $${this.fixedSellTarget.toFixed(4)}`, 'SUCCESS');
        } else if (tradeType === 'sell') {
            // After a sell, use hybrid strategy for next buy target
            this.fixedBuyTarget = this.calculateHybridBuyTarget(tradePrice, currentMarketPrice, threshold);
            this.fixedSellTarget = null; // Will be set after next buy
            this.log(`🎯 Updated BUY target after sell using hybrid strategy: $${this.fixedBuyTarget.toFixed(4)}`, 'SUCCESS');
        }
    }

    /**
     * Get current buy/sell targets (fixed or dynamic based on configuration)
     */
    getCurrentTargets(currentPrice, threshold) {
        if (this.enableFixedTargets || this.useFixedTargets) {
            // Initialize targets if they don't exist
            this.updateFixedTargets(currentPrice, threshold);
            
            return {
                buyTarget: this.fixedBuyTarget,
                sellTarget: this.fixedSellTarget,
                isFixed: true
            };
        } else {
            // Dynamic targets (original behavior)
            return {
                buyTarget: currentPrice * (1 - threshold),
                sellTarget: currentPrice * (1 + threshold),
                isFixed: false
            };
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
                    
                    // Determine if this is a stop loss transaction
                    const isStopLoss = reason && (reason.toLowerCase().includes('stop loss') || reason.toLowerCase().includes('stop-loss'));
                    
                    // Update position tracker first to get profit calculations
                    let transactionData = {
                        price: this.marketData.price.toFixed(4),
                        orderId: order.ordId
                    };
                    
                    if (side === 'buy') {
                        // Add buy position for cost-basis tracking
                        this.positionTracker.addBuyPosition(this.marketData.price, amount);
                        this.log(`📈 Position tracker: Added buy of ${amount} ${this.baseCurrency} at $${this.marketData.price.toFixed(4)}`, 'INFO');
                        
                        // Calculate buy transaction data
                        const usdtValue = amount; // For buy orders, amount is in USDT
                        const solReceived = usdtValue / this.marketData.price;
                        
                        transactionData = {
                            ...transactionData,
                            amount: `${solReceived.toFixed(6)} SOL`,
                            value: `$${usdtValue.toFixed(2)}`,
                            usdtSpent: usdtValue,
                            solReceived: solReceived
                        };
                        
                        // Enhanced transaction logging for BUY
                        await this.logTransaction('BUY', transactionData, isStopLoss);
                        
                        // Update last buy price (for backward compatibility)
                        this.lastBuyPrice = this.marketData.price;
                        this.log(`📌 Updated last buy price to: $${this.lastBuyPrice.toFixed(4)}`, 'INFO');
                    } else if (side === 'sell') {
                        // Remove sold position from tracking
                        const soldValue = this.positionTracker.removeSoldPosition(amount, this.marketData.price);
                        
                        // Get position summary for profit calculation
                        const summary = this.positionTracker.getPositionSummary();
                        const totalValue = amount * this.marketData.price;
                        
                        let profitData = {};
                        if (soldValue && soldValue.realized_pnl !== undefined) {
                            profitData = {
                                profit: `${soldValue.profit_percentage ? soldValue.profit_percentage.toFixed(2) : 'N/A'}%`,
                                profitUSD: `$${soldValue.realized_pnl.toFixed(2)}`,
                                avgCost: `$${soldValue.avg_buy_price ? soldValue.avg_buy_price.toFixed(4) : 'N/A'}`
                            };
                            this.log(`📉 Position tracker: Sold ${amount} ${this.baseCurrency} at $${this.marketData.price.toFixed(4)}, realized P&L: $${soldValue.realized_pnl.toFixed(4)}`, 'SUCCESS');
                        } else if (summary && summary.averageBuyPrice && summary.averageBuyPrice > 0) {
                            const profit = ((this.marketData.price - summary.averageBuyPrice) / summary.averageBuyPrice) * 100;
                            const profitUSD = (this.marketData.price - summary.averageBuyPrice) * amount;
                            profitData = {
                                profit: `${profit.toFixed(2)}%`,
                                profitUSD: `$${profitUSD.toFixed(2)}`,
                                avgCost: `$${summary.averageBuyPrice.toFixed(4)}`
                            };
                        }
                        
                        transactionData = {
                            ...transactionData,
                            amount: `${amount.toFixed(6)} SOL`,
                            value: `$${totalValue.toFixed(2)}`,
                            solSold: amount,
                            usdtReceived: totalValue,
                            ...profitData
                        };
                        
                        // Enhanced transaction logging for SELL
                        await this.logTransaction('SELL', transactionData, isStopLoss);
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

            // Check for initial market buy (only once at startup)
            if (this.buyCurrentPriceMode && !this.initialMarketBuyExecuted) {
                const buyExecuted = await this.executeInitialMarketBuy();
                if (buyExecuted) {
                    // After initial buy, continue to regular trading cycle
                    return;
                }
                // If buy failed, mark as executed to prevent repeated attempts
                this.initialMarketBuyExecuted = true;
            }

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

            // Get current targets (fixed or dynamic based on configuration)
            const targets = this.getCurrentTargets(currentPrice, currentThreshold);
            const buyTargetPrice = targets.buyTarget;
            const sellTargetPriceBasic = targets.sellTarget;

            // Calculate price change from appropriate reference point
            let priceChangeFromLast = 0;
            let shouldCheckBuyTrigger = false;
            let shouldCheckSellTrigger = false;

            if (targets.isFixed) {
                // For fixed targets, check if current price has crossed the target thresholds
                if (buyTargetPrice && currentPrice <= buyTargetPrice) {
                    shouldCheckBuyTrigger = true;
                    priceChangeFromLast = (currentPrice - buyTargetPrice) / buyTargetPrice; // Will be negative
                }
                
                if (sellTargetPriceBasic && this.positions[this.baseCurrency] > 0) {
                    // For sells, use position tracker if available, otherwise use basic target
                    const profitableData = this.positionTracker.calculateProfitablePrice(currentThreshold);
                    const actualSellTarget = profitableData?.minProfitablePrice || sellTargetPriceBasic;
                    
                    if (currentPrice >= actualSellTarget) {
                        shouldCheckSellTrigger = true;
                    }
                }
            } else {
                // Dynamic targets (original behavior)
                if (this.lastPrice) {
                    priceChangeFromLast = (currentPrice - this.lastPrice) / this.lastPrice;
                }
                shouldCheckBuyTrigger = priceChangeFromLast <= -currentThreshold && availableUsdt >= this.minOrderSize;
                shouldCheckSellTrigger = this.positions[this.baseCurrency] > 0;
            }

            // Enhanced logging with market data
            this.log(`💹 ${this.symbol}: $${currentPrice.toFixed(4)} | 24h: ${this.marketData.priceChangePercent24h.toFixed(2)}% | Vol: $${(this.marketData.volume24h / 1000000).toFixed(1)}M`, 'INFO');
            const debugEps = this.getMinimumBaseAmount();
            this.log(`💰 Balance: ${this.positions[this.baseCurrency].toFixed(6)} ${this.baseCurrency} | $${availableUsdt.toFixed(2)} USDT available`, 'INFO');
            this.log(`🧪 Debug: base=${(Number(this.positions[this.baseCurrency])||0).toFixed(8)} ${this.baseCurrency}, epsilon=${debugEps}`, 'INFO');
            
            if (targets.isFixed) {
                this.log(`📊 FIXED TARGETS MODE | Current: $${currentPrice.toFixed(4)}`, 'INFO');
            } else {
                this.log(`📊 Price change: ${(priceChangeFromLast * 100).toFixed(4)}% | Threshold: ±${(currentThreshold * 100).toFixed(4)}%`, 'INFO');
            }

            // Calculate and log target prices
            
            // Get position tracker target price for sells (if we have positions)
            let sellTargetPricePosition = null;
            if (this.positions[this.baseCurrency] > 0) {
                const profitableData = this.positionTracker.calculateProfitablePrice(currentThreshold);
                if (profitableData && profitableData.minProfitablePrice) {
                    sellTargetPricePosition = profitableData.minProfitablePrice;
                }
            }

            // Log target prices with color coding and distance indicators
            if (buyTargetPrice) {
                if (targets.isFixed) {
                    const priceStatus = currentPrice <= buyTargetPrice ? '✅ TRIGGERED' : '⏳ WAITING';
                    const distance = ((currentPrice - buyTargetPrice) / buyTargetPrice * 100);
                    this.log(`🎯 BUY Target: $${buyTargetPrice.toFixed(4)} | ${priceStatus} | Distance: ${distance >= 0 ? '+' : ''}${distance.toFixed(2)}%`, 
                             currentPrice <= buyTargetPrice ? 'SUCCESS' : (Math.abs(distance) <= 2 ? 'WARNING' : 'INFO'));
                } else {
                    const buyDistance = ((currentPrice - buyTargetPrice) / buyTargetPrice * 100);
                    this.log(`🎯 BUY Target: $${buyTargetPrice.toFixed(4)} (need -${buyDistance.toFixed(2)}% to trigger)`, buyDistance <= 5 ? 'WARNING' : 'INFO');
                }
            }
            
            // Log sell targets
            if (this.positions[this.baseCurrency] > 0) {
                const actualSellTarget = sellTargetPricePosition || sellTargetPriceBasic;
                const summary = this.positionTracker.getPositionSummary();
                
                if (targets.isFixed && sellTargetPriceBasic) {
                    const priceStatus = currentPrice >= actualSellTarget ? '✅ TRIGGERED' : '⏳ WAITING';
                    const distance = ((actualSellTarget - currentPrice) / currentPrice * 100);
                    
                    if (summary && summary.averageBuyPrice && summary.averageBuyPrice > 0) {
                        const currentProfit = ((currentPrice - summary.averageBuyPrice) / summary.averageBuyPrice * 100);
                        this.log(`🎯 SELL Target: $${actualSellTarget.toFixed(4)} | ${priceStatus} | Distance: +${distance.toFixed(2)}% | Profit: ${currentProfit >= 0 ? '+' : ''}${currentProfit.toFixed(2)}%`, 
                                 currentPrice >= actualSellTarget ? 'SUCCESS' : (distance <= 2 ? 'WARNING' : 'INFO'));
                    } else {
                        this.log(`🎯 SELL Target: $${actualSellTarget.toFixed(4)} | ${priceStatus} | Distance: +${distance.toFixed(2)}%`, 
                                 currentPrice >= actualSellTarget ? 'SUCCESS' : (distance <= 2 ? 'WARNING' : 'INFO'));
                    }
                } else {
                    // Dynamic mode logging
                    const sellDistance = ((actualSellTarget - currentPrice) / currentPrice * 100);
                    if (summary && summary.averageBuyPrice && summary.averageBuyPrice > 0) {
                        const currentProfit = ((currentPrice - summary.averageBuyPrice) / summary.averageBuyPrice * 100);
                        this.log(`🎯 SELL Target: $${actualSellTarget.toFixed(4)} (need +${sellDistance.toFixed(2)}% to trigger) | Current profit: ${currentProfit >= 0 ? '+' : ''}${currentProfit.toFixed(2)}%`, sellDistance <= 2 ? 'WARNING' : 'INFO');
                    } else {
                        this.log(`🎯 SELL Target: $${actualSellTarget.toFixed(4)} (need +${sellDistance.toFixed(2)}% to trigger)`, sellDistance <= 2 ? 'WARNING' : 'INFO');
                    }
                }
            } else {
                if (sellTargetPriceBasic) {
                    this.log(`🎯 SELL Target: $${sellTargetPriceBasic.toFixed(4)} (no position to sell)`, 'INFO');
                }
            }

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
            const shouldBuyTechnical = technicalSignal && (technicalSignal.signal === 'BUY' || technicalSignal.signal === 'STRONG_BUY') && technicalSignal.confidence > 60;
            
            if (shouldCheckBuyTrigger || shouldBuyTechnical) {
                let buyReason = [];
                if (shouldCheckBuyTrigger) {
                    if (targets.isFixed) {
                        buyReason.push(`Fixed target reached: $${buyTargetPrice.toFixed(4)}`);
                    } else {
                        buyReason.push(`Price drop: ${(Math.abs(priceChangeFromLast) * 100).toFixed(4)}%`);
                    }
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
                    this.log(`💵 BUYING: $${buyAmount} USDT at $${currentPrice.toFixed(4)} (target was $${buyTargetPrice.toFixed(4)})`, 'SUCCESS');
                    const orderSuccess = await this.placeIntelligentOrder('buy', buyAmount, buyReason.join(' + '));
                    
                    // Update targets after successful buy
                    if (orderSuccess && (this.enableFixedTargets || this.useFixedTargets)) {
                        this.updateTargetsAfterTrade('buy', currentPrice, currentPrice, currentThreshold);
                    }
                } else {
                    this.log(`💸 Buy amount $${buyAmount} is below minimum order size $${this.minOrderSize}`, 'WARNING');
                }
            }
            // Sell logic with enhanced intelligence using position tracking
            else if (shouldCheckSellTrigger) {
                // Use position tracker to determine if we should sell
                const sellDecision = this.positionTracker.shouldSell(currentPrice, currentThreshold);
                const shouldSellTechnical = technicalSignal && (technicalSignal.signal === 'SELL' || technicalSignal.signal === 'STRONG_SELL') && technicalSignal.confidence > 60;
                
                // For fixed targets, check if price has reached the target
                let shouldSellFixed = false;
                if (targets.isFixed && sellTargetPricePosition) {
                    shouldSellFixed = currentPrice >= sellTargetPricePosition;
                }
                
                if (sellDecision.shouldSell || shouldSellTechnical || shouldSellFixed) {
                    let sellReason = [];
                    if (sellDecision.shouldSell) {
                        const summary = this.positionTracker.getPositionSummary(currentPrice);
                        if (summary && summary.averageBuyPrice && summary.averageBuyPrice > 0) {
                            const profitPct = ((currentPrice - summary.averageBuyPrice) / summary.averageBuyPrice * 100);
                            sellReason.push(`Profitable sale: avg cost $${summary.averageBuyPrice.toFixed(4)}, profit ${profitPct.toFixed(2)}%`);
                        } else {
                            sellReason.push(`Profitable sale opportunity detected`);
                        }
                    }
                    if (shouldSellFixed) {
                        sellReason.push(`Fixed target reached: $${sellTargetPricePosition.toFixed(4)}`);
                    }
                    if (shouldSellTechnical) {
                        sellReason.push(`Technical signal: ${technicalSignal.signal} (${technicalSignal.confidence.toFixed(1)}%)`);
                    }

                    // Only sell if position tracker confirms it's profitable OR strong technical signal OR fixed target reached
                    if (sellDecision.shouldSell || shouldSellFixed || (shouldSellTechnical && technicalSignal.confidence > 80)) {
                        const summary = this.positionTracker.getPositionSummary();
                        const profitableData = this.positionTracker.calculateProfitablePrice(currentThreshold);
                        const targetPrice = profitableData ? profitableData.minProfitablePrice : sellTargetPriceBasic;
                        
                        this.log(`📈 SELL SIGNAL: ${sellReason.join(' + ')}`, 'WARNING');
                        
                        if (summary && summary.totalQuantity && summary.averageBuyPrice && summary.averageBuyPrice > 0) {
                            this.log(`💰 SELLING: ${summary.totalQuantity.toFixed(4)} ${this.baseCurrency} at $${currentPrice.toFixed(4)} (target was $${targetPrice.toFixed(4)}, avg cost: $${summary.averageBuyPrice.toFixed(4)})`, 'SUCCESS');
                        } else {
                            this.log(`💰 SELLING: ${this.positions[this.baseCurrency].toFixed(4)} ${this.baseCurrency} at $${currentPrice.toFixed(4)} (target was $${targetPrice.toFixed(4)})`, 'SUCCESS');
                        }
                        
                        const sellSuccess = await this.sellAllPosition(sellReason.join(' + '));
                        
                        // Update targets after successful sell using hybrid strategy
                        if (sellSuccess && (this.enableFixedTargets || this.useFixedTargets)) {
                            this.updateTargetsAfterTrade('sell', currentPrice, currentPrice, currentThreshold);
                        }
                    } else {
                        const summary = this.positionTracker.getPositionSummary();
                        const profitableData = this.positionTracker.calculateProfitablePrice(currentThreshold);
                        const nextTargetPrice = profitableData ? profitableData.minProfitablePrice : sellTargetPriceBasic;
                        
                        this.log(`🔒 HODL Mode: Position not profitable yet`, 'INFO');
                        
                        if (summary && summary.averageBuyPrice && summary.averageBuyPrice > 0) {
                            this.log(`📊 Current: $${currentPrice.toFixed(4)} | Avg Cost: $${summary.averageBuyPrice.toFixed(4)} | Target: $${nextTargetPrice.toFixed(4)} (need +${((nextTargetPrice - currentPrice) / currentPrice * 100).toFixed(2)}%)`, 'INFO');
                        } else {
                            this.log(`📊 Current: $${currentPrice.toFixed(4)} | Target: $${nextTargetPrice.toFixed(4)} (need +${((nextTargetPrice - currentPrice) / currentPrice * 100).toFixed(2)}%)`, 'INFO');
                        }
                    }
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
            // Don't log "SELL SIGNAL" here as it's already logged in the calling method
            return await this.placeIntelligentOrder('sell', sellAmount, reason);
        } else {
            this.log(`⚠️ Cannot sell: calculated amount ${sellAmount} ${this.baseCurrency} is below minimum ${minimumOrderAmount}`, 'WARNING');
            return false;
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
     * Legacy CSV transaction logger (kept for compatibility)
     * NOTE: Renamed to avoid clashing with the structured JSON logger above.
     */
    logTransactionCSV(action, amount, price, orderId, status) {
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
        this.log(`   • Fixed Targets: ${this.enableFixedTargets || this.useFixedTargets}`, 'INFO');
        this.log(`   • Stop Loss: ${this.enableStopLoss}`, 'INFO');
        this.log(`   • Buy Current Price Mode: ${this.buyCurrentPriceMode}`, 'INFO');

        // Start trading loop
        const tradingLoop = setInterval(async () => {
            if (!this.isRunning) {
                clearInterval(tradingLoop);
                return;
            }
            
            await this.runEnhancedTradingCycle();
        }, this.checkInterval);

        this.log('🔄 Enhanced trading bot is now running!', 'SUCCESS');
        
        if (this.buyCurrentPriceMode) {
            this.log('🛒 BUY CURRENT PRICE MODE: Will execute market buy if no position exists', 'WARNING');
        }
        
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
const bot = new EnhancedTradingBot();

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

module.exports = EnhancedTradingBot;
