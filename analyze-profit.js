require('dotenv').config();
const fs = require('fs');
const path = require('path');

/**
 * Profit Analysis Script - Analyze trading bot profitability
 */
function analyzeProfitability() {
    console.log('📊 Trading Bot Profitability Analysis');
    console.log('=====================================\n');

    try {
        // Read transaction log
        const logFile = path.join(__dirname, 'transactions.log');
        if (!fs.existsSync(logFile)) {
            console.log('❌ No transactions.log file found');
            return;
        }

        const logData = fs.readFileSync(logFile, 'utf8');
        const lines = logData.split('\n').filter(line => line.trim() && !line.startsWith('Date'));

        console.log(`📝 Total transactions found: ${lines.length}\n`);

        let totalBuys = 0;
        let totalSells = 0;
        let totalBuyValue = 0;
        let totalSellValue = 0;
        let buyCount = 0;
        let sellCount = 0;
        let trades = [];

        // Parse transactions
        lines.forEach(line => {
            const [date, time, symbol, action, amount, price, totalValue, orderId, status] = line.split(',');
            
            if (status === 'SUCCESS') {
                const value = parseFloat(totalValue);
                const amountNum = parseFloat(amount);
                const priceNum = parseFloat(price);

                if (action === 'BUY') {
                    totalBuyValue += value;
                    buyCount++;
                    totalBuys += amountNum;
                } else if (action === 'SELL') {
                    totalSellValue += value;
                    sellCount++;
                    totalSells += amountNum;
                }

                trades.push({
                    date: date,
                    time: time,
                    action: action,
                    amount: amountNum,
                    price: priceNum,
                    value: value
                });
            }
        });

        // Calculate basic stats
        console.log('💰 Trading Summary:');
        console.log('==================');
        console.log(`Total Buys: ${buyCount} orders, ${totalBuys.toFixed(6)} SOL, $${totalBuyValue.toFixed(2)}`);
        console.log(`Total Sells: ${sellCount} orders, ${totalSells.toFixed(6)} SOL, $${totalSellValue.toFixed(2)}`);
        console.log(`Average Buy: $${(totalBuyValue / buyCount).toFixed(2)} per order`);
        console.log(`Average Sell: $${(totalSellValue / sellCount).toFixed(2)} per order`);

        // Calculate gross profit (before fees)
        const grossProfit = totalSellValue - totalBuyValue;
        console.log(`\n📈 Gross Profit: $${grossProfit.toFixed(4)}`);

        // Estimate trading fees (0.1% per trade)
        const totalTrades = buyCount + sellCount;
        const estimatedFees = (totalBuyValue + totalSellValue) * 0.001; // 0.1% fee
        const netProfit = grossProfit - estimatedFees;

        console.log(`💸 Estimated Fees: $${estimatedFees.toFixed(4)} (${totalTrades} trades @ 0.1%)`);
        console.log(`💎 Net Profit: $${netProfit.toFixed(4)}`);

        // ROI calculation
        if (totalBuyValue > 0) {
            const roi = (netProfit / totalBuyValue) * 100;
            console.log(`📊 ROI: ${roi.toFixed(2)}%`);
        }

        // Recent performance (last 10 trades)
        console.log('\n🔥 Recent Trading Activity:');
        console.log('===========================');
        const recentTrades = trades.slice(-10);
        recentTrades.forEach(trade => {
            console.log(`${trade.date} ${trade.time}: ${trade.action} ${trade.amount.toFixed(6)} SOL @ $${trade.price.toFixed(2)} = $${trade.value.toFixed(2)}`);
        });

        // Trading frequency analysis
        if (trades.length > 1) {
            const firstTrade = new Date(`${trades[0].date}T${trades[0].time}`);
            const lastTrade = new Date(`${trades[trades.length-1].date}T${trades[trades.length-1].time}`);
            const tradingDays = (lastTrade - firstTrade) / (1000 * 60 * 60 * 24);
            
            console.log(`\n⏰ Trading Period: ${tradingDays.toFixed(1)} days`);
            console.log(`📈 Average trades per day: ${(trades.length / tradingDays).toFixed(1)}`);
            
            if (netProfit > 0 && tradingDays > 0) {
                const dailyProfit = netProfit / tradingDays;
                const monthlyProfit = dailyProfit * 30;
                const yearlyProfit = dailyProfit * 365;
                
                console.log(`💰 Projected daily profit: $${dailyProfit.toFixed(4)}`);
                console.log(`💰 Projected monthly profit: $${monthlyProfit.toFixed(2)}`);
                console.log(`💰 Projected yearly profit: $${yearlyProfit.toFixed(2)}`);
            }
        }

        // Recommendations
        console.log('\n💡 Recommendations:');
        console.log('==================');
        
        if (netProfit > 0) {
            console.log('✅ Your bot is profitable!');
            if (netProfit < 1) {
                console.log('⚠️ However, profits are very small due to low capital');
                console.log('💡 Consider increasing your USDT balance for larger profits');
            }
        } else {
            console.log('❌ Your bot is currently losing money');
            console.log('💡 This might be due to trading fees exceeding small profits');
        }

        const currentBalance = totalBuyValue - totalSellValue; // Net USDT spent
        console.log(`\n🏦 Current estimated USDT invested: $${Math.abs(currentBalance).toFixed(2)}`);
        
        if (totalBuyValue < 50) {
            console.log('💡 With current capital (~$16), consider:');
            console.log('   • Adding more USDT for larger position sizes');
            console.log('   • Using wider price thresholds to reduce fee impact');
            console.log('   • Or treating this as a learning experience');
        }

    } catch (error) {
        console.error('❌ Error analyzing profitability:', error.message);
    }
}

// Run analysis
analyzeProfitability();
