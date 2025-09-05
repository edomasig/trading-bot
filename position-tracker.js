const fs = require('fs');
const path = require('path');

/**
 * Position Tracker - Tracks buy orders and calculates profitable sell prices
 * Implements true "buy low, sell high" with cost basis tracking
 */
class PositionTracker {
    constructor(symbol = 'SOL-USDT', dataFile = 'positions.json') {
        this.symbol = symbol;
        this.dataFile = path.join(__dirname, dataFile);
        this.positions = [];
        this.tradingFeeRate = 0.001; // 0.1% trading fee
        
        // Load existing positions
        this.loadPositions();
        
        // Bind methods
        this.addBuyPosition = this.addBuyPosition.bind(this);
        this.removeSoldPosition = this.removeSoldPosition.bind(this);
        this.calculateProfitablePrice = this.calculateProfitablePrice.bind(this);
        this.shouldSell = this.shouldSell.bind(this);
        this.getPositionSummary = this.getPositionSummary.bind(this);
    }

    /**
     * Load positions from file
     */
    loadPositions() {
        try {
            if (fs.existsSync(this.dataFile)) {
                const data = fs.readFileSync(this.dataFile, 'utf8');
                const parsed = JSON.parse(data);
                
                if (parsed.symbol === this.symbol && Array.isArray(parsed.positions)) {
                    this.positions = parsed.positions;
                    this.log(`📁 Loaded ${this.positions.length} existing positions from ${this.dataFile}`, 'INFO');
                } else {
                    this.log(`⚠️ Position file exists but for different symbol or format. Starting fresh.`, 'WARNING');
                    this.positions = [];
                }
            } else {
                this.log(`📄 No existing position file found. Starting with empty positions.`, 'INFO');
                this.positions = [];
            }
        } catch (error) {
            this.log(`❌ Error loading positions: ${error.message}. Starting fresh.`, 'ERROR');
            this.positions = [];
        }
    }

    /**
     * Save positions to file
     */
    savePositions() {
        try {
            const data = {
                symbol: this.symbol,
                lastUpdated: new Date().toISOString(),
                positions: this.positions
            };
            
            fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2));
            this.log(`💾 Saved ${this.positions.length} positions to ${this.dataFile}`, 'INFO');
        } catch (error) {
            this.log(`❌ Error saving positions: ${error.message}`, 'ERROR');
        }
    }

    /**
     * Add a new buy position
     */
    addBuyPosition(price, quantity, orderId = null, timestamp = null) {
        const position = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            buyPrice: parseFloat(price),
            quantity: parseFloat(quantity),
            orderId: orderId,
            timestamp: timestamp || new Date().toISOString(),
            fees: parseFloat(price) * parseFloat(quantity) * this.tradingFeeRate,
            status: 'open'
        };

        // Calculate break-even and target prices
        position.breakEvenPrice = position.buyPrice * (1 + this.tradingFeeRate * 2); // Buy fee + sell fee
        position.totalCost = position.buyPrice * position.quantity + position.fees;

        this.positions.push(position);
        this.savePositions();

        this.log(`🟢 NEW POSITION: Bought ${quantity} at $${price} (Break-even: $${position.breakEvenPrice.toFixed(4)})`, 'SUCCESS');
        
        return position;
    }

    /**
     * Remove position when sold (FIFO - First In, First Out)
     */
    removeSoldPosition(quantity, sellPrice, orderId = null) {
        const soldQuantity = parseFloat(quantity);
        let remainingToSell = soldQuantity;
        const soldPositions = [];
        let totalProfit = 0;

        // FIFO: Sell oldest positions first
        for (let i = 0; i < this.positions.length && remainingToSell > 0; i++) {
            const position = this.positions[i];
            
            if (position.status === 'open') {
                const quantityFromThisPosition = Math.min(remainingToSell, position.quantity);
                const profit = this.calculatePositionProfit(position, sellPrice, quantityFromThisPosition);
                
                totalProfit += profit;
                
                // Record the sold portion
                soldPositions.push({
                    ...position,
                    soldQuantity: quantityFromThisPosition,
                    sellPrice: sellPrice,
                    profit: profit,
                    sellOrderId: orderId,
                    sellTimestamp: new Date().toISOString()
                });

                // Update remaining quantity in position
                position.quantity -= quantityFromThisPosition;
                remainingToSell -= quantityFromThisPosition;

                // Mark as closed if fully sold
                if (position.quantity <= 0.000001) { // Account for floating point precision
                    position.status = 'closed';
                    position.sellPrice = sellPrice;
                    position.sellTimestamp = new Date().toISOString();
                }
            }
        }

        // Remove closed positions
        this.positions = this.positions.filter(pos => pos.status === 'open');
        this.savePositions();

        this.log(`🔴 POSITION SOLD: ${soldQuantity} at $${sellPrice} | Profit: ${totalProfit >= 0 ? '+' : ''}$${totalProfit.toFixed(4)}`, totalProfit >= 0 ? 'SUCCESS' : 'WARNING');
        
        return {
            soldPositions,
            totalProfit,
            remainingPositions: this.positions.length
        };
    }

    /**
     * Calculate profit for a specific position
     */
    calculatePositionProfit(position, sellPrice, quantity = null) {
        const qty = quantity || position.quantity;
        const sellFees = sellPrice * qty * this.tradingFeeRate;
        const sellProceeds = (sellPrice * qty) - sellFees;
        const costBasis = position.buyPrice * qty + (position.fees * qty / position.quantity);
        
        return sellProceeds - costBasis;
    }

    /**
     * Calculate the minimum profitable sell price
     */
    calculateProfitablePrice(targetProfitPercentage = 0.015) {
        if (this.positions.length === 0) {
            return null;
        }

        // Get the oldest position (FIFO)
        const oldestPosition = this.positions.find(pos => pos.status === 'open');
        if (!oldestPosition) {
            return null;
        }

        // Calculate minimum profitable price
        const breakEvenPrice = oldestPosition.breakEvenPrice;
        const targetPrice = breakEvenPrice * (1 + targetProfitPercentage);

        return {
            breakEvenPrice: breakEvenPrice,
            targetPrice: targetPrice,
            position: oldestPosition,
            potentialProfit: (targetPrice - oldestPosition.buyPrice) * oldestPosition.quantity - (oldestPosition.fees + targetPrice * oldestPosition.quantity * this.tradingFeeRate)
        };
    }

    /**
     * Determine if current price is profitable for selling
     */
    shouldSell(currentPrice, targetProfitPercentage = 0.015) {
        const profitableData = this.calculateProfitablePrice(targetProfitPercentage);
        
        if (!profitableData) {
            return {
                shouldSell: false,
                reason: 'No open positions to sell'
            };
        }

        const { breakEvenPrice, targetPrice, position, potentialProfit } = profitableData;
        const currentProfit = this.calculatePositionProfit(position, currentPrice);

        if (currentPrice >= targetPrice) {
            return {
                shouldSell: true,
                reason: `Price $${currentPrice.toFixed(4)} exceeds target $${targetPrice.toFixed(4)}`,
                profitableData,
                estimatedProfit: currentProfit
            };
        } else if (currentPrice >= breakEvenPrice) {
            return {
                shouldSell: false,
                reason: `Price $${currentPrice.toFixed(4)} above break-even but below target $${targetPrice.toFixed(4)}`,
                profitableData,
                estimatedProfit: currentProfit,
                waitForBetter: true
            };
        } else {
            return {
                shouldSell: false,
                reason: `Price $${currentPrice.toFixed(4)} below break-even $${breakEvenPrice.toFixed(4)}`,
                profitableData,
                estimatedProfit: currentProfit,
                atLoss: true
            };
        }
    }

    /**
     * Get summary of all positions
     */
    getPositionSummary(currentPrice = null) {
        const openPositions = this.positions.filter(pos => pos.status === 'open');
        
        if (openPositions.length === 0) {
            return {
                totalPositions: 0,
                totalQuantity: 0,
                totalCost: 0,
                averageBuyPrice: 0,
                currentValue: 0,
                unrealizedPL: 0
            };
        }

        const totalQuantity = openPositions.reduce((sum, pos) => sum + pos.quantity, 0);
        const totalCost = openPositions.reduce((sum, pos) => sum + pos.totalCost, 0);
        const averageBuyPrice = totalCost / totalQuantity;
        
        const summary = {
            totalPositions: openPositions.length,
            totalQuantity: totalQuantity,
            totalCost: totalCost,
            averageBuyPrice: averageBuyPrice,
            positions: openPositions
        };

        if (currentPrice) {
            summary.currentValue = totalQuantity * currentPrice;
            summary.unrealizedPL = summary.currentValue - totalCost;
            summary.unrealizedPLPercent = (summary.unrealizedPL / totalCost) * 100;
        }

        return summary;
    }

    /**
     * Get sellable quantity (total open position quantity)
     */
    getSellableQuantity() {
        return this.positions
            .filter(pos => pos.status === 'open')
            .reduce((sum, pos) => sum + pos.quantity, 0);
    }

    /**
     * Clear all positions (use with caution)
     */
    clearAllPositions() {
        this.positions = [];
        this.savePositions();
        this.log(`🗑️ All positions cleared`, 'WARNING');
    }

    /**
     * Log messages (can be overridden by parent class)
     */
    log(message, level = 'INFO') {
        const timestamp = new Date().toISOString();
        const colors = {
            INFO: '\x1b[36m',
            SUCCESS: '\x1b[32m',
            WARNING: '\x1b[33m',
            ERROR: '\x1b[31m'
        };
        const resetColor = '\x1b[0m';
        
        console.log(`${colors[level]}[${timestamp}] [POSITION] ${message}${resetColor}`);
    }

    /**
     * Export positions for backup
     */
    exportPositions() {
        return {
            symbol: this.symbol,
            exportTimestamp: new Date().toISOString(),
            positions: this.positions,
            summary: this.getPositionSummary()
        };
    }
}

module.exports = PositionTracker;
