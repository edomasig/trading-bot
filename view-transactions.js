const fs = require('fs');
const path = require('path');

/**
 * Transaction History Viewer
 * This script displays your trading history in a formatted table
 */

function viewTransactions() {
    const logFile = path.join(__dirname, 'transactions.log');
    
    try {
        if (!fs.existsSync(logFile)) {
            console.log('❌ No transaction log file found. Start your bot to begin logging trades.');
            return;
        }

        const data = fs.readFileSync(logFile, 'utf8');
        const lines = data.trim().split('\n');
        
        if (lines.length <= 1) {
            console.log('📊 No transactions recorded yet. Start trading to see your history here!');
            return;
        }

        console.log('\n📊 TRADING HISTORY\n');
        console.log('═'.repeat(120));
        
        // Print header
        const headers = lines[0].split(',');
        const headerFormat = '| %-10s | %-8s | %-12s | %-6s | %-12s | %-12s | %-12s | %-15s | %-8s |';
        console.log(headerFormat, ...headers);
        console.log('═'.repeat(120));
        
        // Print transactions
        let totalBuyValue = 0;
        let totalSellValue = 0;
        let totalTrades = 0;
        
        for (let i = 1; i < lines.length; i++) {
            const transaction = lines[i].split(',');
            if (transaction.length >= 9) {
                const [date, time, symbol, action, amount, price, totalValue, orderId, status] = transaction;
                
                console.log(headerFormat, 
                    date, 
                    time, 
                    symbol, 
                    action, 
                    parseFloat(amount).toFixed(6), 
                    parseFloat(price).toFixed(2), 
                    `$${totalValue}`, 
                    orderId.substring(0, 15) + '...', 
                    status
                );
                
                if (status === 'SUCCESS') {
                    totalTrades++;
                    if (action === 'BUY') {
                        totalBuyValue += parseFloat(totalValue);
                    } else if (action === 'SELL') {
                        totalSellValue += parseFloat(totalValue);
                    }
                }
            }
        }
        
        console.log('═'.repeat(120));
        console.log('\n📈 TRADING SUMMARY');
        console.log(`Total Successful Trades: ${totalTrades}`);
        console.log(`Total Buy Value: $${totalBuyValue.toFixed(2)}`);
        console.log(`Total Sell Value: $${totalSellValue.toFixed(2)}`);
        console.log(`Net P&L: $${(totalSellValue - totalBuyValue).toFixed(2)}`);
        console.log('');
        
    } catch (error) {
        console.error('❌ Error reading transaction log:', error.message);
    }
}

// Auto-refresh every 30 seconds if --watch flag is provided
if (process.argv.includes('--watch')) {
    console.log('👁️  Watching transactions (updates every 30 seconds)...');
    console.log('Press Ctrl+C to stop watching\n');
    
    setInterval(() => {
        console.clear();
        viewTransactions();
    }, 30000);
    
    // Initial display
    viewTransactions();
} else {
    // Single view
    viewTransactions();
}
