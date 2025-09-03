/**
 * Risk Management Module for Crypto Trading Bot
 * Provides comprehensive risk controls and position management
 */

class RiskManager {
    constructor(config = {}) {
        this.stopLossPercentage = config.stopLossPercentage || 0.02; // 2%
        this.takeProfitPercentage = config.takeProfitPercentage || 0.03; // 3%
        this.maxDailyLoss = config.maxDailyLoss || 5; // $5
        this.maxDailyTrades = config.maxDailyTrades || 20;
        this.positionSizePercentage = config.positionSizePercentage || 0.8; // 80%
        this.trailingStopPercentage = config.trailingStopPercentage || 0.015; // 1.5%
        this.minVolumeThreshold = config.minVolumeThreshold || 1000000;
        this.maxSpreadPercentage = config.maxSpreadPercentage || 0.001; // 0.1%
        
        // Daily tracking
        this.dailyStats = {
            trades: 0,
            profit: 0,
            loss: 0,
            startDate: new Date().toDateString()
        };
        
        // Position tracking
        this.currentPositions = {};
        this.trailingStops = {};
    }

    /**
     * Reset daily statistics if new day
     */
    checkDailyReset() {
        const today = new Date().toDateString();
        if (this.dailyStats.startDate !== today) {
            this.dailyStats = {
                trades: 0,
                profit: 0,
                loss: 0,
                startDate: today
            };
            console.log('📅 Daily statistics reset for new trading day');
        }
    }

    /**
     * Check if trading should be stopped due to daily limits
     * @returns {Object} {allowed: boolean, reason: string}
     */
    checkDailyLimits() {
        this.checkDailyReset();
        
        if (this.dailyStats.trades >= this.maxDailyTrades) {
            return {
                allowed: false,
                reason: `Daily trade limit reached (${this.maxDailyTrades})`
            };
        }
        
        if (Math.abs(this.dailyStats.loss) >= this.maxDailyLoss) {
            return {
                allowed: false,
                reason: `Daily loss limit reached ($${this.maxDailyLoss})`
            };
        }
        
        return { allowed: true, reason: 'Within daily limits' };
    }

    /**
     * Calculate optimal position size based on available capital and risk
     * @param {number} availableCapital - Available trading capital
     * @param {number} currentPrice - Current asset price
     * @param {number} stopLossPrice - Stop loss price level
     * @returns {Object} Position size information
     */
    calculatePositionSize(availableCapital, currentPrice, stopLossPrice = null) {
        // Basic position sizing using percentage of capital
        let baseSize = availableCapital * this.positionSizePercentage;
        
        // If stop loss is set, use risk-based position sizing
        if (stopLossPrice && stopLossPrice > 0) {
            const riskPerShare = Math.abs(currentPrice - stopLossPrice);
            const riskAmount = availableCapital * 0.01; // Risk 1% of capital per trade
            const riskBasedSize = riskAmount / riskPerShare;
            
            // Use the smaller of the two sizes
            baseSize = Math.min(baseSize, riskBasedSize * currentPrice);
        }
        
        return {
            recommendedSize: baseSize,
            riskAmount: stopLossPrice ? Math.abs(currentPrice - stopLossPrice) * (baseSize / currentPrice) : 0,
            riskPercentage: stopLossPrice ? (Math.abs(currentPrice - stopLossPrice) / currentPrice) * 100 : 0
        };
    }

    /**
     * Check if stop loss should be triggered
     * @param {string} symbol - Trading symbol
     * @param {number} currentPrice - Current market price
     * @param {number} entryPrice - Position entry price
     * @param {string} side - Position side ('buy' or 'sell')
     * @returns {Object} Stop loss decision
     */
    checkStopLoss(symbol, currentPrice, entryPrice, side = 'buy') {
        if (!entryPrice || entryPrice <= 0) {
            return { triggered: false, reason: 'No entry price set' };
        }
        
        let lossPercentage;
        if (side === 'buy') {
            lossPercentage = (entryPrice - currentPrice) / entryPrice;
        } else {
            lossPercentage = (currentPrice - entryPrice) / entryPrice;
        }
        
        if (lossPercentage >= this.stopLossPercentage) {
            return {
                triggered: true,
                reason: `Stop loss triggered: ${(lossPercentage * 100).toFixed(2)}% loss`,
                lossPercentage: lossPercentage * 100
            };
        }
        
        return {
            triggered: false,
            lossPercentage: lossPercentage * 100,
            reason: `Current loss: ${(lossPercentage * 100).toFixed(2)}%`
        };
    }

    /**
     * Check if take profit should be triggered
     * @param {string} symbol - Trading symbol
     * @param {number} currentPrice - Current market price
     * @param {number} entryPrice - Position entry price
     * @param {string} side - Position side ('buy' or 'sell')
     * @returns {Object} Take profit decision
     */
    checkTakeProfit(symbol, currentPrice, entryPrice, side = 'buy') {
        if (!entryPrice || entryPrice <= 0) {
            return { triggered: false, reason: 'No entry price set' };
        }
        
        let profitPercentage;
        if (side === 'buy') {
            profitPercentage = (currentPrice - entryPrice) / entryPrice;
        } else {
            profitPercentage = (entryPrice - currentPrice) / entryPrice;
        }
        
        if (profitPercentage >= this.takeProfitPercentage) {
            return {
                triggered: true,
                reason: `Take profit triggered: ${(profitPercentage * 100).toFixed(2)}% profit`,
                profitPercentage: profitPercentage * 100
            };
        }
        
        return {
            triggered: false,
            profitPercentage: profitPercentage * 100,
            reason: `Current profit: ${(profitPercentage * 100).toFixed(2)}%`
        };
    }

    /**
     * Update trailing stop for a position
     * @param {string} symbol - Trading symbol
     * @param {number} currentPrice - Current market price
     * @param {number} entryPrice - Position entry price
     * @param {string} side - Position side ('buy' or 'sell')
     * @returns {Object} Trailing stop decision
     */
    updateTrailingStop(symbol, currentPrice, entryPrice, side = 'buy') {
        if (!this.trailingStops[symbol]) {
            this.trailingStops[symbol] = {
                highestPrice: side === 'buy' ? currentPrice : entryPrice,
                lowestPrice: side === 'sell' ? currentPrice : entryPrice,
                stopPrice: null
            };
        }
        
        const trailing = this.trailingStops[symbol];
        
        if (side === 'buy') {
            // Update highest price seen
            if (currentPrice > trailing.highestPrice) {
                trailing.highestPrice = currentPrice;
                trailing.stopPrice = currentPrice * (1 - this.trailingStopPercentage);
            }
            
            // Check if current price hits trailing stop
            if (trailing.stopPrice && currentPrice <= trailing.stopPrice) {
                return {
                    triggered: true,
                    reason: `Trailing stop triggered at $${trailing.stopPrice.toFixed(4)}`,
                    stopPrice: trailing.stopPrice
                };
            }
        } else {
            // For sell positions (short)
            if (currentPrice < trailing.lowestPrice) {
                trailing.lowestPrice = currentPrice;
                trailing.stopPrice = currentPrice * (1 + this.trailingStopPercentage);
            }
            
            if (trailing.stopPrice && currentPrice >= trailing.stopPrice) {
                return {
                    triggered: true,
                    reason: `Trailing stop triggered at $${trailing.stopPrice.toFixed(4)}`,
                    stopPrice: trailing.stopPrice
                };
            }
        }
        
        return {
            triggered: false,
            stopPrice: trailing.stopPrice,
            highestPrice: trailing.highestPrice,
            lowestPrice: trailing.lowestPrice
        };
    }

    /**
     * Validate market conditions for trading
     * @param {Object} marketData - Market data from OKX API
     * @param {Object} orderBookAnalysis - Order book analysis
     * @returns {Object} Market validation result
     */
    validateMarketConditions(marketData, orderBookAnalysis = null) {
        const issues = [];
        let score = 100;
        
        // Check volume threshold
        if (marketData.volume24h < this.minVolumeThreshold) {
            issues.push(`Low 24h volume: $${marketData.volume24h.toLocaleString()}`);
            score -= 30;
        }
        
        // Check spread
        if (marketData.spreadPercent > this.maxSpreadPercentage * 100) {
            issues.push(`High spread: ${marketData.spreadPercent.toFixed(3)}%`);
            score -= 20;
        }
        
        // Check order book depth if available
        if (orderBookAnalysis) {
            if (orderBookAnalysis.spreadPercent > this.maxSpreadPercentage * 100) {
                issues.push(`Order book spread too high: ${orderBookAnalysis.spreadPercent.toFixed(3)}%`);
                score -= 15;
            }
            
            // Check for balanced order book
            if (orderBookAnalysis.volumeRatio > 0.8 || orderBookAnalysis.volumeRatio < 0.2) {
                issues.push(`Unbalanced order book: ${(orderBookAnalysis.volumeRatio * 100).toFixed(1)}% buy pressure`);
                score -= 10;
            }
        }
        
        // Check for extreme volatility
        const priceChangeAbs = Math.abs(marketData.priceChangePercent24h);
        if (priceChangeAbs > 15) {
            issues.push(`Extreme volatility: ${priceChangeAbs.toFixed(2)}% in 24h`);
            score -= 25;
        }
        
        return {
            valid: score >= 50,
            score,
            issues,
            recommendation: score >= 80 ? 'Excellent conditions' : 
                          score >= 60 ? 'Good conditions' : 
                          score >= 40 ? 'Acceptable conditions' : 'Poor conditions'
        };
    }

    /**
     * Record trade result for daily tracking
     * @param {string} symbol - Trading symbol
     * @param {string} side - Trade side
     * @param {number} amount - Trade amount
     * @param {number} pnl - Profit/Loss amount
     */
    recordTrade(symbol, side, amount, pnl) {
        this.checkDailyReset();
        
        this.dailyStats.trades++;
        
        if (pnl > 0) {
            this.dailyStats.profit += pnl;
        } else {
            this.dailyStats.loss += Math.abs(pnl);
        }
        
        console.log(`📊 Trade recorded: ${side} ${amount} ${symbol}, P&L: $${pnl.toFixed(2)}`);
        console.log(`📈 Daily stats: ${this.dailyStats.trades} trades, $${this.dailyStats.profit.toFixed(2)} profit, $${this.dailyStats.loss.toFixed(2)} loss`);
    }

    /**
     * Get comprehensive risk assessment
     * @param {Object} params - Assessment parameters
     * @returns {Object} Risk assessment
     */
    assessRisk(params) {
        const {
            marketData,
            orderBookAnalysis,
            technicalSignal,
            availableCapital,
            currentPositions = 0
        } = params;
        
        const dailyLimits = this.checkDailyLimits();
        const marketValidation = this.validateMarketConditions(marketData, orderBookAnalysis);
        
        let riskScore = 0;
        const factors = [];
        
        // Daily limits factor
        if (!dailyLimits.allowed) {
            riskScore += 100; // Maximum risk if daily limits hit
            factors.push(dailyLimits.reason);
        }
        
        // Market conditions factor
        riskScore += (100 - marketValidation.score) * 0.3;
        if (marketValidation.issues.length > 0) {
            factors.push(...marketValidation.issues);
        }
        
        // Technical signal confidence factor
        if (technicalSignal && technicalSignal.confidence < 60) {
            riskScore += (60 - technicalSignal.confidence) * 0.5;
            factors.push(`Low signal confidence: ${technicalSignal.confidence.toFixed(1)}%`);
        }
        
        // Position concentration factor
        const positionRisk = (currentPositions / availableCapital) * 100;
        if (positionRisk > 80) {
            riskScore += (positionRisk - 80) * 2;
            factors.push(`High position concentration: ${positionRisk.toFixed(1)}%`);
        }
        
        return {
            riskScore: Math.min(riskScore, 100),
            riskLevel: riskScore < 20 ? 'LOW' : riskScore < 50 ? 'MEDIUM' : riskScore < 80 ? 'HIGH' : 'EXTREME',
            recommendedAction: riskScore < 30 ? 'PROCEED' : riskScore < 70 ? 'PROCEED_WITH_CAUTION' : 'AVOID',
            factors,
            dailyStats: this.dailyStats,
            marketValidation
        };
    }
}

module.exports = RiskManager;
