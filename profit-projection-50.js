/**
 * Profit Projection Calculator for $50 USDT Capital
 */

function calculateProfitProjection() {
    console.log('💰 Profit Projection for $50 USDT Capital');
    console.log('==========================================\n');

    // Configuration
    const capital = 50;
    const priceChangeThreshold = 0.003; // 0.3%
    const minOrderSize = 8;
    const maxUsdtToUse = 45;
    const positionSizePercentage = 0.85;
    const takeProfitPercentage = 0.015; // 1.5%
    const tradingFeePercentage = 0.001; // 0.1% per trade

    console.log('📊 Trading Configuration:');
    console.log(`   • Capital: $${capital}`);
    console.log(`   • Max USDT per trade: $${maxUsdtToUse}`);
    console.log(`   • Position size: ${(positionSizePercentage * 100)}%`);
    console.log(`   • Price threshold: ${(priceChangeThreshold * 100)}%`);
    console.log(`   • Take profit: ${(takeProfitPercentage * 100)}%`);
    console.log(`   • Trading fee: ${(tradingFeePercentage * 100)}% per trade\n`);

    // Calculate trade size
    const tradeSize = maxUsdtToUse * positionSizePercentage; // $38.25
    console.log(`🎯 Calculated trade size: $${tradeSize.toFixed(2)}\n`);

    // Profit calculations
    const grossProfitPerTrade = tradeSize * takeProfitPercentage;
    const feesPerRoundTrip = tradeSize * tradingFeePercentage * 2; // Buy + Sell
    const netProfitPerTrade = grossProfitPerTrade - feesPerRoundTrip;

    console.log('💹 Per Trade Analysis:');
    console.log(`   • Gross profit: $${grossProfitPerTrade.toFixed(4)}`);
    console.log(`   • Trading fees: $${feesPerRoundTrip.toFixed(4)}`);
    console.log(`   • Net profit: $${netProfitPerTrade.toFixed(4)}`);
    console.log(`   • ROI per trade: ${((netProfitPerTrade / tradeSize) * 100).toFixed(3)}%\n`);

    // Daily/Monthly projections
    const scenarios = [
        { trades: 2, period: 'day' },
        { trades: 10, period: 'week' },
        { trades: 40, period: 'month' }
    ];

    console.log('📈 Profit Projections:');
    console.log('======================');
    
    scenarios.forEach(scenario => {
        const totalProfit = netProfitPerTrade * scenario.trades;
        const roi = (totalProfit / capital) * 100;
        console.log(`${scenario.trades} trades per ${scenario.period}:`);
        console.log(`   • Profit: $${totalProfit.toFixed(2)}`);
        console.log(`   • ROI: ${roi.toFixed(2)}%`);
        console.log('');
    });

    // Conservative vs Aggressive scenarios
    console.log('🎲 Different Scenarios:');
    console.log('=======================');
    
    const conservativeTradesPerDay = 1;
    const moderateTradesPerDay = 2;
    const aggressiveTradesPerDay = 4;
    
    const monthlyProfits = {
        conservative: conservativeTradesPerDay * 30 * netProfitPerTrade,
        moderate: moderateTradesPerDay * 30 * netProfitPerTrade,
        aggressive: aggressiveTradesPerDay * 30 * netProfitPerTrade
    };

    console.log(`Conservative (1 trade/day): $${monthlyProfits.conservative.toFixed(2)}/month`);
    console.log(`Moderate (2 trades/day): $${monthlyProfits.moderate.toFixed(2)}/month`);
    console.log(`Aggressive (4 trades/day): $${monthlyProfits.aggressive.toFixed(2)}/month\n`);

    // Risk analysis
    const maxDailyLoss = 10; // From settings
    const worstCaseScenario = capital * 0.02; // 2% stop loss
    
    console.log('⚠️ Risk Analysis:');
    console.log('=================');
    console.log(`Max daily loss limit: $${maxDailyLoss}`);
    console.log(`Worst case per trade: $${worstCaseScenario.toFixed(2)} (2% stop loss)`);
    console.log(`Risk-to-reward ratio: 1:${(netProfitPerTrade / worstCaseScenario).toFixed(2)}\n`);

    // Comparison with current $16 capital
    const currentCapital = 16;
    const currentTradeSize = 7;
    const currentNetProfit = currentTradeSize * takeProfitPercentage - (currentTradeSize * tradingFeePercentage * 2);
    
    console.log('📊 $50 vs Current $16 Comparison:');
    console.log('=================================');
    console.log(`Current ($16): $${currentNetProfit.toFixed(4)} per trade`);
    console.log(`With $50: $${netProfitPerTrade.toFixed(4)} per trade`);
    console.log(`Improvement: ${((netProfitPerTrade / currentNetProfit) - 1) * 100}% more profit per trade\n`);

    // Break-even analysis
    const breakEvenTrades = Math.ceil(capital / netProfitPerTrade);
    console.log('🎯 Break-even Analysis:');
    console.log('=======================');
    console.log(`Trades needed to double capital: ${breakEvenTrades} trades`);
    console.log(`Time to double (at 2 trades/day): ${Math.ceil(breakEvenTrades / 2)} days\n`);

    // Recommendations
    console.log('💡 Recommendations for $50 Capital:');
    console.log('===================================');
    console.log('✅ PROS of upgrading to $50:');
    console.log('   • 5.5x more profit per trade');
    console.log('   • Better fee-to-profit ratio');
    console.log('   • More stable trading patterns');
    console.log('   • Room for position sizing');
    console.log('');
    console.log('⚙️ Optimal settings (already configured):');
    console.log('   • 0.3% price threshold (less noise)');
    console.log('   • $38.25 trade size (good size)');
    console.log('   • 1.5% take profit (quick gains)');
    console.log('   • 2% stop loss (reasonable risk)');
    console.log('');
    console.log('🎯 Expected Results:');
    console.log(`   • Monthly profit: $${monthlyProfits.moderate.toFixed(2)} (moderate trading)`);
    console.log('   • Much better than current ~$0.30/month!');
}

// Run the calculation
calculateProfitProjection();
