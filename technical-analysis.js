/**
 * Technical Analysis Module for Crypto Trading Bot
 * Maximizes OKX API data for intelligent trading decisions
 */

class TechnicalAnalysis {
    constructor(config = {}) {
        this.rsiPeriod = config.rsiPeriod || 14;
        this.rsiOversold = config.rsiOversold || 30;
        this.rsiOverbought = config.rsiOverbought || 70;
        this.maShortPeriod = config.maShortPeriod || 10;
        this.maLongPeriod = config.maLongPeriod || 21;
        this.bollingerPeriod = config.bollingerPeriod || 20;
        this.bollingerStdDev = config.bollingerStdDev || 2;
        
        // Data storage
        this.priceHistory = [];
        this.volumeHistory = [];
        this.indicators = {};
    }

    /**
     * Calculate Simple Moving Average
     * @param {Array} data - Array of numbers
     * @param {number} period - Period for MA calculation
     * @returns {number} Moving average value
     */
    calculateSMA(data, period) {
        if (data.length < period) return null;
        const slice = data.slice(-period);
        return slice.reduce((sum, value) => sum + value, 0) / period;
    }

    /**
     * Calculate Exponential Moving Average
     * @param {Array} data - Array of numbers
     * @param {number} period - Period for EMA calculation
     * @returns {number} EMA value
     */
    calculateEMA(data, period) {
        if (data.length < period) return null;
        
        const multiplier = 2 / (period + 1);
        let ema = this.calculateSMA(data.slice(0, period), period);
        
        for (let i = period; i < data.length; i++) {
            ema = (data[i] * multiplier) + (ema * (1 - multiplier));
        }
        
        return ema;
    }

    /**
     * Calculate RSI (Relative Strength Index)
     * @param {Array} prices - Array of closing prices
     * @returns {number} RSI value (0-100)
     */
    calculateRSI(prices) {
        if (prices.length < this.rsiPeriod + 1) return 50; // Neutral if insufficient data
        
        const changes = [];
        for (let i = 1; i < prices.length; i++) {
            changes.push(prices[i] - prices[i - 1]);
        }
        
        const gains = changes.map(change => change > 0 ? change : 0);
        const losses = changes.map(change => change < 0 ? Math.abs(change) : 0);
        
        const avgGain = this.calculateSMA(gains.slice(-this.rsiPeriod), this.rsiPeriod);
        const avgLoss = this.calculateSMA(losses.slice(-this.rsiPeriod), this.rsiPeriod);
        
        if (avgLoss === 0) return 100;
        
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }

    /**
     * Calculate Bollinger Bands
     * @param {Array} prices - Array of closing prices
     * @returns {Object} {upper, middle, lower} band values
     */
    calculateBollingerBands(prices) {
        if (prices.length < this.bollingerPeriod) return null;
        
        const sma = this.calculateSMA(prices, this.bollingerPeriod);
        const slice = prices.slice(-this.bollingerPeriod);
        
        // Calculate standard deviation
        const variance = slice.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / this.bollingerPeriod;
        const stdDev = Math.sqrt(variance);
        
        return {
            upper: sma + (stdDev * this.bollingerStdDev),
            middle: sma,
            lower: sma - (stdDev * this.bollingerStdDev)
        };
    }

    /**
     * Calculate MACD (Moving Average Convergence Divergence)
     * @param {Array} prices - Array of closing prices
     * @returns {Object} MACD line, signal line, and histogram
     */
    calculateMACD(prices) {
        const ema12 = this.calculateEMA(prices, 12);
        const ema26 = this.calculateEMA(prices, 26);
        
        if (!ema12 || !ema26) return null;
        
        const macdLine = ema12 - ema26;
        
        // For simplicity, using SMA for signal line (normally EMA)
        return {
            macd: macdLine,
            signal: this.calculateSMA([macdLine], 9), // Simplified
            histogram: macdLine - this.calculateSMA([macdLine], 9)
        };
    }

    /**
     * Calculate volatility using standard deviation
     * @param {Array} prices - Array of closing prices
     * @param {number} period - Period for volatility calculation
     * @returns {number} Volatility percentage
     */
    calculateVolatility(prices, period = 20) {
        if (prices.length < period) return 0;
        
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            returns.push((prices[i] - prices[i-1]) / prices[i-1]);
        }
        
        const avgReturn = this.calculateSMA(returns.slice(-period), period);
        const slice = returns.slice(-period);
        
        const variance = slice.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / period;
        return Math.sqrt(variance) * Math.sqrt(252); // Annualized volatility
    }

    /**
     * Analyze order book for support/resistance levels
     * @param {Object} orderBook - Order book data from OKX API
     * @param {number} currentPrice - Current market price
     * @returns {Object} Support and resistance analysis
     */
    analyzeOrderBook(orderBook, currentPrice) {
        if (!orderBook || !orderBook.bids || !orderBook.asks) return null;
        
        // Find significant support (bid) levels
        const supportLevels = [];
        let bidVolume = 0;
        for (const bid of orderBook.bids) {
            bidVolume += bid.size;
            if (bid.size > orderBook.bids[0].size * 0.5) { // Significant order
                supportLevels.push({
                    price: bid.price,
                    volume: bid.size,
                    distance: ((currentPrice - bid.price) / currentPrice) * 100
                });
            }
        }
        
        // Find significant resistance (ask) levels
        const resistanceLevels = [];
        let askVolume = 0;
        for (const ask of orderBook.asks) {
            askVolume += ask.size;
            if (ask.size > orderBook.asks[0].size * 0.5) { // Significant order
                resistanceLevels.push({
                    price: ask.price,
                    volume: ask.size,
                    distance: ((ask.price - currentPrice) / currentPrice) * 100
                });
            }
        }
        
        return {
            support: supportLevels.slice(0, 3), // Top 3 support levels
            resistance: resistanceLevels.slice(0, 3), // Top 3 resistance levels
            bidVolume,
            askVolume,
            volumeRatio: bidVolume / (askVolume + bidVolume), // Buying pressure
            spread: orderBook.asks[0].price - orderBook.bids[0].price,
            spreadPercent: ((orderBook.asks[0].price - orderBook.bids[0].price) / currentPrice) * 100
        };
    }

    /**
     * Analyze volume patterns
     * @param {Array} volumeData - Array of volume data
     * @param {Array} priceData - Array of price data
     * @returns {Object} Volume analysis
     */
    analyzeVolume(volumeData, priceData) {
        if (!volumeData || volumeData.length < 10) return null;
        
        const avgVolume = this.calculateSMA(volumeData, 20);
        const currentVolume = volumeData[volumeData.length - 1];
        const volumeRatio = currentVolume / avgVolume;
        
        // Price-Volume correlation
        let correlation = 0;
        if (priceData && priceData.length === volumeData.length) {
            const priceChanges = [];
            const volumeChanges = [];
            
            for (let i = 1; i < priceData.length; i++) {
                priceChanges.push((priceData[i] - priceData[i-1]) / priceData[i-1]);
                volumeChanges.push((volumeData[i] - volumeData[i-1]) / volumeData[i-1]);
            }
            
            // Simple correlation calculation
            const avgPriceChange = this.calculateSMA(priceChanges, priceChanges.length);
            const avgVolumeChange = this.calculateSMA(volumeChanges, volumeChanges.length);
            
            let numerator = 0;
            let denomPriceSum = 0;
            let denomVolumeSum = 0;
            
            for (let i = 0; i < priceChanges.length; i++) {
                const priceDeviation = priceChanges[i] - avgPriceChange;
                const volumeDeviation = volumeChanges[i] - avgVolumeChange;
                
                numerator += priceDeviation * volumeDeviation;
                denomPriceSum += priceDeviation * priceDeviation;
                denomVolumeSum += volumeDeviation * volumeDeviation;
            }
            
            if (denomPriceSum > 0 && denomVolumeSum > 0) {
                correlation = numerator / Math.sqrt(denomPriceSum * denomVolumeSum);
            }
        }
        
        return {
            currentVolume,
            avgVolume,
            volumeRatio,
            isHighVolume: volumeRatio > 1.5,
            priceVolumeCorrelation: correlation,
            trend: volumeRatio > 1.2 ? 'increasing' : volumeRatio < 0.8 ? 'decreasing' : 'stable'
        };
    }

    /**
     * Generate comprehensive trading signal
     * @param {Object} marketData - Market data from OKX API
     * @param {Array} candleData - Historical candle data
     * @param {Object} orderBook - Order book data
     * @returns {Object} Trading signal with confidence score
     */
    generateTradingSignal(marketData, candleData, orderBook) {
        if (!marketData || !candleData || candleData.length < 30) {
            return { signal: 'HOLD', confidence: 0, reason: 'Insufficient data' };
        }
        
        const prices = candleData.map(candle => candle.close);
        const volumes = candleData.map(candle => candle.volume);
        const currentPrice = marketData.price;
        
        // Calculate technical indicators
        const rsi = this.calculateRSI(prices);
        const smaShort = this.calculateSMA(prices, this.maShortPeriod);
        const smaLong = this.calculateSMA(prices, this.maLongPeriod);
        const bollinger = this.calculateBollingerBands(prices);
        const volatility = this.calculateVolatility(prices);
        const volumeAnalysis = this.analyzeVolume(volumes, prices);
        const orderBookAnalysis = this.analyzeOrderBook(orderBook, currentPrice);
        
        // Signal scoring system
        let bullishScore = 0;
        let bearishScore = 0;
        const signals = [];
        
        // RSI signals
        if (rsi < this.rsiOversold) {
            bullishScore += 2;
            signals.push(`RSI oversold (${rsi.toFixed(1)})`);
        } else if (rsi > this.rsiOverbought) {
            bearishScore += 2;
            signals.push(`RSI overbought (${rsi.toFixed(1)})`);
        }
        
        // Moving average signals
        if (smaShort && smaLong) {
            if (smaShort > smaLong && currentPrice > smaShort) {
                bullishScore += 1;
                signals.push('Price above short MA, uptrend');
            } else if (smaShort < smaLong && currentPrice < smaShort) {
                bearishScore += 1;
                signals.push('Price below short MA, downtrend');
            }
        }
        
        // Bollinger Bands signals
        if (bollinger) {
            if (currentPrice < bollinger.lower) {
                bullishScore += 1;
                signals.push('Price below lower Bollinger Band');
            } else if (currentPrice > bollinger.upper) {
                bearishScore += 1;
                signals.push('Price above upper Bollinger Band');
            }
        }
        
        // Volume signals
        if (volumeAnalysis) {
            if (volumeAnalysis.isHighVolume && volumeAnalysis.priceVolumeCorrelation > 0.3) {
                if (marketData.priceChangePercent24h > 0) {
                    bullishScore += 1;
                    signals.push('High volume with positive price correlation');
                } else {
                    bearishScore += 1;
                    signals.push('High volume with negative price correlation');
                }
            }
        }
        
        // Order book signals
        if (orderBookAnalysis) {
            if (orderBookAnalysis.volumeRatio > 0.6) {
                bullishScore += 1;
                signals.push('Strong buying pressure in order book');
            } else if (orderBookAnalysis.volumeRatio < 0.4) {
                bearishScore += 1;
                signals.push('Strong selling pressure in order book');
            }
            
            // Spread analysis
            if (orderBookAnalysis.spreadPercent < 0.1) {
                bullishScore += 0.5; // Tight spread is generally good for trading
            }
        }
        
        // Market sentiment (24h change)
        if (marketData.priceChangePercent24h > 2) {
            bullishScore += 0.5;
            signals.push('Strong 24h positive momentum');
        } else if (marketData.priceChangePercent24h < -2) {
            bearishScore += 0.5;
            signals.push('Strong 24h negative momentum');
        }
        
        // Determine final signal
        const totalScore = bullishScore + bearishScore;
        const confidence = Math.min(totalScore / 6, 1); // Normalize to 0-1
        
        let signal = 'HOLD';
        if (bullishScore > bearishScore + 1) {
            signal = bullishScore > bearishScore + 2 ? 'STRONG_BUY' : 'BUY';
        } else if (bearishScore > bullishScore + 1) {
            signal = bearishScore > bullishScore + 2 ? 'STRONG_SELL' : 'SELL';
        }
        
        return {
            signal,
            confidence: confidence * 100,
            bullishScore,
            bearishScore,
            signals,
            indicators: {
                rsi: rsi.toFixed(1),
                smaShort: smaShort?.toFixed(4),
                smaLong: smaLong?.toFixed(4),
                bollinger,
                volatility: (volatility * 100).toFixed(2) + '%',
                volumeAnalysis,
                orderBookAnalysis
            }
        };
    }
}

module.exports = TechnicalAnalysis;
