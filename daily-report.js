const fs = require('fs');
const path = require('path');

/**
 * Enhanced Trading Report Generator
 * Generate detailed trading reports with date range filtering
 */

class TradingReportGenerator {
    constructor() {
        this.transactionFile = path.join(__dirname, 'transactions.log');
        this.logFile = path.join(__dirname, 'logs', 'live-trading-combined.log');
    }

    /**
     * Generate daily report for a specific date
     * @param {string} date - Date in YYYY-MM-DD format
     */
    generateDailyReport(date) {
        console.log(`\n📊 DAILY TRADING REPORT - ${date}`);
        console.log('═'.repeat(80));
        
        const transactions = this.getTransactionsByDate(date);
        const activities = this.getActivitiesByDate(date);
        
        this.printDailyStats(transactions, date);
        this.printTransactionDetails(transactions);
        this.printTradingActivity(activities, date);
    }

    /**
     * Generate report for date range
     * @param {string} startDate - Start date in YYYY-MM-DD format
     * @param {string} endDate - End date in YYYY-MM-DD format
     */
    generateRangeReport(startDate, endDate) {
        console.log(`\n📊 TRADING REPORT - ${startDate} to ${endDate}`);
        console.log('═'.repeat(80));
        
        const transactions = this.getTransactionsByDateRange(startDate, endDate);
        
        // Group by date for daily breakdown
        const dailyStats = this.groupTransactionsByDate(transactions);
        
        this.printRangeStats(transactions, startDate, endDate);
        this.printDailyBreakdown(dailyStats);
        this.printDetailedTransactions(transactions);
    }

    /**
     * Get transactions for a specific date
     */
    getTransactionsByDate(targetDate) {
        if (!fs.existsSync(this.transactionFile)) {
            return [];
        }

        const data = fs.readFileSync(this.transactionFile, 'utf8');
        const lines = data.trim().split('\n');
        
        if (lines.length <= 1) return [];

        const transactions = [];
        for (let i = 1; i < lines.length; i++) {
            const transaction = lines[i].split(',');
            if (transaction.length >= 9) {
                const [date, time, symbol, action, amount, price, totalValue, orderId, status] = transaction;
                if (date === targetDate) {
                    transactions.push({
                        date, time, symbol, action,
                        amount: parseFloat(amount),
                        price: parseFloat(price),
                        totalValue: parseFloat(totalValue),
                        orderId, status
                    });
                }
            }
        }
        return transactions;
    }

    /**
     * Get transactions for date range
     */
    getTransactionsByDateRange(startDate, endDate) {
        if (!fs.existsSync(this.transactionFile)) {
            return [];
        }

        const data = fs.readFileSync(this.transactionFile, 'utf8');
        const lines = data.trim().split('\n');
        
        if (lines.length <= 1) return [];

        const transactions = [];
        const start = new Date(startDate);
        const end = new Date(endDate);

        for (let i = 1; i < lines.length; i++) {
            const transaction = lines[i].split(',');
            if (transaction.length >= 9) {
                const [date, time, symbol, action, amount, price, totalValue, orderId, status] = transaction;
                const transactionDate = new Date(date);
                
                if (transactionDate >= start && transactionDate <= end) {
                    transactions.push({
                        date, time, symbol, action,
                        amount: parseFloat(amount),
                        price: parseFloat(price),
                        totalValue: parseFloat(totalValue),
                        orderId, status
                    });
                }
            }
        }
        return transactions;
    }

    /**
     * Get trading activities for a specific date
     */
    getActivitiesByDate(targetDate) {
        if (!fs.existsSync(this.logFile)) {
            return [];
        }

        const data = fs.readFileSync(this.logFile, 'utf8');
        const lines = data.trim().split('\n');
        
        const activities = [];
        for (const line of lines) {
            if (line.includes(targetDate) && line.includes('BTC-USDT:')) {
                activities.push(line);
            }
        }
        return activities;
    }

    /**
     * Print daily statistics
     */
    printDailyStats(transactions, date) {
        const successful = transactions.filter(t => t.status === 'SUCCESS');
        const buys = successful.filter(t => t.action === 'BUY');
        const sells = successful.filter(t => t.action === 'SELL');
        
        const totalBuyValue = buys.reduce((sum, t) => sum + t.totalValue, 0);
        const totalSellValue = sells.reduce((sum, t) => sum + t.totalValue, 0);
        const totalVolume = totalBuyValue + totalSellValue;
        const netPnL = totalSellValue - totalBuyValue;

        console.log(`\n📈 DAILY STATISTICS (${date})`);
        console.log('─'.repeat(50));
        console.log(`📊 Total Trades: ${successful.length}`);
        console.log(`🟢 Buy Orders: ${buys.length} ($${totalBuyValue.toFixed(2)})`);
        console.log(`🔴 Sell Orders: ${sells.length} ($${totalSellValue.toFixed(2)})`);
        console.log(`💰 Total Volume: $${totalVolume.toFixed(2)}`);
        console.log(`💵 Net P&L: ${netPnL >= 0 ? '🟢' : '🔴'} $${netPnL.toFixed(2)}`);
        
        if (buys.length > 0) {
            const avgBuyPrice = buys.reduce((sum, t) => sum + t.price, 0) / buys.length;
            console.log(`📊 Average Buy Price: $${avgBuyPrice.toFixed(2)}`);
        }
        
        if (sells.length > 0) {
            const avgSellPrice = sells.reduce((sum, t) => sum + t.price, 0) / sells.length;
            console.log(`📊 Average Sell Price: $${avgSellPrice.toFixed(2)}`);
        }
    }

    /**
     * Print transaction details
     */
    printTransactionDetails(transactions) {
        if (transactions.length === 0) {
            console.log('\n❌ No transactions found for this date');
            return;
        }

        console.log('\n💳 TRANSACTION DETAILS');
        console.log('─'.repeat(80));
        
        const headerFormat = '| %-8s | %-6s | %-12s | %-8s | %-12s | %-8s |';
        console.log(headerFormat, 'Time', 'Action', 'Amount', 'Price', 'Value', 'Status');
        console.log('─'.repeat(80));
        
        for (const tx of transactions) {
            console.log(headerFormat,
                tx.time,
                tx.action,
                tx.amount.toFixed(6),
                `$${tx.price.toFixed(2)}`,
                `$${tx.totalValue.toFixed(2)}`,
                tx.status
            );
        }
    }

    /**
     * Print trading activity summary
     */
    printTradingActivity(activities, date) {
        if (activities.length === 0) {
            console.log('\n📊 No trading activity logs found for this date');
            return;
        }

        console.log(`\n🔍 TRADING ACTIVITY SUMMARY (${date})`);
        console.log('─'.repeat(60));
        console.log(`📊 Total Activity Logs: ${activities.length}`);
        
        // Extract price information
        const priceMatches = activities.map(line => {
            const match = line.match(/BTC-USDT:\s*\$?([\d,]+\.?\d*)/);
            return match ? parseFloat(match[1].replace(',', '')) : null;
        }).filter(price => price !== null);

        if (priceMatches.length > 0) {
            const minPrice = Math.min(...priceMatches);
            const maxPrice = Math.max(...priceMatches);
            const avgPrice = priceMatches.reduce((sum, p) => sum + p, 0) / priceMatches.length;
            
            console.log(`📊 Price Range: $${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`);
            console.log(`📊 Average Price: $${avgPrice.toFixed(2)}`);
            console.log(`📊 Price Volatility: ${((maxPrice - minPrice) / avgPrice * 100).toFixed(2)}%`);
        }
    }

    /**
     * Group transactions by date
     */
    groupTransactionsByDate(transactions) {
        const grouped = {};
        for (const tx of transactions) {
            if (!grouped[tx.date]) {
                grouped[tx.date] = [];
            }
            grouped[tx.date].push(tx);
        }
        return grouped;
    }

    /**
     * Print range statistics
     */
    printRangeStats(transactions, startDate, endDate) {
        const successful = transactions.filter(t => t.status === 'SUCCESS');
        const buys = successful.filter(t => t.action === 'BUY');
        const sells = successful.filter(t => t.action === 'SELL');
        
        const totalBuyValue = buys.reduce((sum, t) => sum + t.totalValue, 0);
        const totalSellValue = sells.reduce((sum, t) => sum + t.totalValue, 0);
        const netPnL = totalSellValue - totalBuyValue;
        
        const tradingDays = new Set(successful.map(t => t.date)).size;

        console.log(`\n📈 RANGE STATISTICS (${startDate} to ${endDate})`);
        console.log('─'.repeat(60));
        console.log(`📅 Trading Days: ${tradingDays}`);
        console.log(`📊 Total Trades: ${successful.length}`);
        console.log(`🟢 Buy Orders: ${buys.length} ($${totalBuyValue.toFixed(2)})`);
        console.log(`🔴 Sell Orders: ${sells.length} ($${totalSellValue.toFixed(2)})`);
        console.log(`💵 Net P&L: ${netPnL >= 0 ? '🟢' : '🔴'} $${netPnL.toFixed(2)}`);
        
        if (tradingDays > 0) {
            console.log(`📊 Average Trades/Day: ${(successful.length / tradingDays).toFixed(1)}`);
            console.log(`📊 Average P&L/Day: $${(netPnL / tradingDays).toFixed(2)}`);
        }
    }

    /**
     * Print daily breakdown
     */
    printDailyBreakdown(dailyStats) {
        console.log('\n📅 DAILY BREAKDOWN');
        console.log('─'.repeat(60));
        
        const headerFormat = '| %-12s | %-6s | %-10s | %-10s |';
        console.log(headerFormat, 'Date', 'Trades', 'Buy Value', 'Sell Value');
        console.log('─'.repeat(60));
        
        for (const [date, transactions] of Object.entries(dailyStats)) {
            const successful = transactions.filter(t => t.status === 'SUCCESS');
            const buys = successful.filter(t => t.action === 'BUY');
            const sells = successful.filter(t => t.action === 'SELL');
            
            const buyValue = buys.reduce((sum, t) => sum + t.totalValue, 0);
            const sellValue = sells.reduce((sum, t) => sum + t.totalValue, 0);
            
            console.log(headerFormat,
                date,
                successful.length,
                `$${buyValue.toFixed(2)}`,
                `$${sellValue.toFixed(2)}`
            );
        }
    }

    /**
     * Print detailed transactions for range
     */
    printDetailedTransactions(transactions) {
        if (transactions.length === 0) {
            console.log('\n❌ No transactions found for this date range');
            return;
        }

        console.log('\n💳 DETAILED TRANSACTIONS');
        console.log('─'.repeat(90));
        
        const headerFormat = '| %-12s | %-8s | %-6s | %-10s | %-8s | %-12s | %-8s |';
        console.log(headerFormat, 'Date', 'Time', 'Action', 'Amount', 'Price', 'Value', 'Status');
        console.log('─'.repeat(90));
        
        for (const tx of transactions) {
            console.log(headerFormat,
                tx.date,
                tx.time,
                tx.action,
                tx.amount.toFixed(6),
                `$${tx.price.toFixed(2)}`,
                `$${tx.totalValue.toFixed(2)}`,
                tx.status
            );
        }
    }
}

// CLI Interface
function main() {
    const args = process.argv.slice(2);
    const generator = new TradingReportGenerator();

    if (args.length === 0) {
        // Default: today's report
        const today = new Date().toISOString().split('T')[0];
        generator.generateDailyReport(today);
    } else if (args.length === 1) {
        // Single date report
        const date = args[0];
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            console.error('❌ Invalid date format. Use YYYY-MM-DD');
            process.exit(1);
        }
        generator.generateDailyReport(date);
    } else if (args.length === 2) {
        // Date range report
        const [startDate, endDate] = args;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
            console.error('❌ Invalid date format. Use YYYY-MM-DD for both dates');
            process.exit(1);
        }
        generator.generateRangeReport(startDate, endDate);
    } else {
        console.log('📊 Trading Report Generator');
        console.log('');
        console.log('Usage:');
        console.log('  node daily-report.js                    # Today\'s report');
        console.log('  node daily-report.js 2025-09-08         # Specific date');
        console.log('  node daily-report.js 2025-09-01 2025-09-08  # Date range');
        console.log('');
        console.log('Date format: YYYY-MM-DD');
    }
}

if (require.main === module) {
    main();
}

module.exports = TradingReportGenerator;
