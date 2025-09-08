const fs = require('fs');
const path = require('path');

/**
 * Quick Trading Summary
 * Fast overview of your trading performance
 */

function quickSummary() {
    const transactionFile = path.join(__dirname, 'transactions.log');
    
    if (!fs.existsSync(transactionFile)) {
        console.log('❌ No transaction log found. Start trading to see your summary!');
        return;
    }

    const data = fs.readFileSync(transactionFile, 'utf8');
    const lines = data.trim().split('\n');
    
    if (lines.length <= 1) {
        console.log('📊 No transactions recorded yet.');
        return;
    }

    const transactions = [];
    for (let i = 1; i < lines.length; i++) {
        const transaction = lines[i].split(',');
        if (transaction.length >= 9) {
            const [date, time, symbol, action, amount, price, totalValue, orderId, status] = transaction;
            transactions.push({
                date, time, symbol, action,
                amount: parseFloat(amount),
                price: parseFloat(price),
                totalValue: parseFloat(totalValue),
                orderId, status
            });
        }
    }

    // Filter successful transactions
    const successful = transactions.filter(t => t.status === 'SUCCESS');
    const buys = successful.filter(t => t.action === 'BUY');
    const sells = successful.filter(t => t.action === 'SELL');
    
    // Calculate statistics
    const totalBuyValue = buys.reduce((sum, t) => sum + t.totalValue, 0);
    const totalSellValue = sells.reduce((sum, t) => sum + t.totalValue, 0);
    const netPnL = totalSellValue - totalBuyValue;
    const totalVolume = totalBuyValue + totalSellValue;
    
    // Date range
    const dates = successful.map(t => t.date).sort();
    const firstTrade = dates[0];
    const lastTrade = dates[dates.length - 1];
    const tradingDays = new Set(dates).size;
    
    // Today's activity
    const today = new Date().toISOString().split('T')[0];
    const todayTrades = successful.filter(t => t.date === today);
    
    // Last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const last7Days = successful.filter(t => new Date(t.date) >= sevenDaysAgo);

    console.log('\n🚀 TRADING BOT QUICK SUMMARY');
    console.log('═'.repeat(50));
    
    console.log('\n📊 OVERALL PERFORMANCE');
    console.log(`📅 Trading Period: ${firstTrade || 'N/A'} to ${lastTrade || 'N/A'}`);
    console.log(`📅 Active Trading Days: ${tradingDays}`);
    console.log(`📊 Total Successful Trades: ${successful.length}`);
    console.log(`💰 Total Volume Traded: $${totalVolume.toFixed(2)}`);
    console.log(`💵 Net Profit/Loss: ${netPnL >= 0 ? '🟢' : '🔴'} $${netPnL.toFixed(2)}`);
    
    if (tradingDays > 0) {
        console.log(`📊 Average Trades/Day: ${(successful.length / tradingDays).toFixed(1)}`);
        console.log(`📊 Average P&L/Day: $${(netPnL / tradingDays).toFixed(2)}`);
    }

    console.log('\n📈 TRADING BREAKDOWN');
    console.log(`🟢 Buy Orders: ${buys.length} (Total: $${totalBuyValue.toFixed(2)})`);
    console.log(`🔴 Sell Orders: ${sells.length} (Total: $${totalSellValue.toFixed(2)})`);
    
    if (buys.length > 0 && sells.length > 0) {
        const avgBuyPrice = buys.reduce((sum, t) => sum + t.price, 0) / buys.length;
        const avgSellPrice = sells.reduce((sum, t) => sum + t.price, 0) / sells.length;
        const priceImprovement = ((avgSellPrice - avgBuyPrice) / avgBuyPrice * 100);
        
        console.log(`📊 Average Buy Price: $${avgBuyPrice.toFixed(2)}`);
        console.log(`📊 Average Sell Price: $${avgSellPrice.toFixed(2)}`);
        console.log(`📊 Price Improvement: ${priceImprovement >= 0 ? '🟢' : '🔴'} ${priceImprovement.toFixed(2)}%`);
    }

    console.log('\n📅 RECENT ACTIVITY');
    console.log(`🔥 Today (${today}): ${todayTrades.length} trades`);
    console.log(`📊 Last 7 Days: ${last7Days.length} trades`);
    
    if (todayTrades.length > 0) {
        const todayBuys = todayTrades.filter(t => t.action === 'BUY');
        const todaySells = todayTrades.filter(t => t.action === 'SELL');
        const todayBuyValue = todayBuys.reduce((sum, t) => sum + t.totalValue, 0);
        const todaySellValue = todaySells.reduce((sum, t) => sum + t.totalValue, 0);
        const todayPnL = todaySellValue - todayBuyValue;
        
        console.log(`💰 Today's P&L: ${todayPnL >= 0 ? '🟢' : '🔴'} $${todayPnL.toFixed(2)}`);
    }

    // Recent transactions
    if (successful.length > 0) {
        console.log('\n🕒 LAST 5 TRANSACTIONS');
        console.log('─'.repeat(60));
        
        const recent = successful.slice(-5).reverse();
        for (const tx of recent) {
            const pnlIndicator = tx.action === 'BUY' ? '🟢' : '🔴';
            console.log(`${pnlIndicator} ${tx.date} ${tx.time} | ${tx.action} ${tx.amount.toFixed(6)} BTC @ $${tx.price.toFixed(2)} = $${tx.totalValue.toFixed(2)}`);
        }
    }

    console.log('\n═'.repeat(50));
    console.log('🎯 Use these commands for detailed reports:');
    console.log('   node daily-report.js                    # Today\'s detailed report');
    console.log('   node daily-report.js 2025-09-08         # Specific date report');
    console.log('   node daily-report.js 2025-09-01 2025-09-08  # Date range report');
    console.log('   node view-transactions.js --watch       # Live transaction viewer');
    console.log('');
}

quickSummary();
