/**
 * Updated Trade Size Calculator
 */

function calculateNewTradeSize() {
    console.log('🔄 Updated Trade Size Calculation');
    console.log('=================================\n');

    const capital = 50;
    const maxUsdtToUse = 47; // Updated
    const positionSizePercentage = 0.90; // Updated

    console.log(`💰 Capital: $${capital}`);
    console.log(`⚙️ MAX_USDT_TO_USE: $${maxUsdtToUse}`);
    console.log(`📊 POSITION_SIZE_PERCENTAGE: ${(positionSizePercentage * 100)}%`);
    console.log('');

    const newTradeSize = maxUsdtToUse * positionSizePercentage;
    const oldTradeSize = 45 * 0.85;

    console.log('📈 Trade Size Comparison:');
    console.log(`   Previous: $${oldTradeSize.toFixed(2)}`);
    console.log(`   New: $${newTradeSize.toFixed(2)}`);
    console.log(`   Increase: $${(newTradeSize - oldTradeSize).toFixed(2)} (+${(((newTradeSize / oldTradeSize) - 1) * 100).toFixed(1)}%)`);
    console.log('');

    // Updated profit calculation
    const takeProfitPercentage = 0.015; // 1.5%
    const tradingFeePercentage = 0.001; // 0.1% per trade

    const grossProfitPerTrade = newTradeSize * takeProfitPercentage;
    const feesPerRoundTrip = newTradeSize * tradingFeePercentage * 2;
    const netProfitPerTrade = grossProfitPerTrade - feesPerRoundTrip;

    console.log('💹 Updated Profit Per Trade:');
    console.log(`   Gross profit: $${grossProfitPerTrade.toFixed(4)}`);
    console.log(`   Trading fees: $${feesPerRoundTrip.toFixed(4)}`);
    console.log(`   Net profit: $${netProfitPerTrade.toFixed(4)}`);
    console.log('');

    // Risk analysis
    const buffer = capital - maxUsdtToUse;
    const utilization = (newTradeSize / capital) * 100;

    console.log('⚠️ Risk Analysis:');
    console.log(`   Reserve buffer: $${buffer} (${((buffer/capital)*100).toFixed(1)}%)`);
    console.log(`   Capital utilization: ${utilization.toFixed(1)}%`);
    console.log('');

    console.log('💡 Recommendations:');
    if (utilization > 90) {
        console.log('   ⚠️ HIGH RISK: Using >90% of capital');
        console.log('   🛡️ Consider keeping more buffer for safety');
    } else if (utilization > 80) {
        console.log('   ⚖️ MODERATE RISK: Good balance of profit vs safety');
    } else {
        console.log('   🛡️ CONSERVATIVE: Safe but potentially lower profits');
    }
}

calculateNewTradeSize();
