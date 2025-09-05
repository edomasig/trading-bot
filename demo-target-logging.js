#!/usr/bin/env node

/**
 * Demo of Enhanced Target Price Logging
 */

console.log('🎯 Enhanced Target Price Logging Demo\n');

// Simulate current market conditions from your logs
const currentPrice = 200.2200;
const threshold = 0.003; // 0.3%
const solBalance = 0.205;
const usdtBalance = 36.72;

// Calculate targets like the bot does
const buyTargetPrice = currentPrice * (1 - threshold);
const sellTargetPriceBasic = currentPrice * (1 + threshold);

// Simulate position tracking data
const avgCost = 198.50;
const sellTargetPricePosition = avgCost * (1 + threshold + 0.001); // Include fees

console.log('📊 Market Status:');
console.log(`   Current Price: $${currentPrice.toFixed(4)}`);
console.log(`   SOL Balance: ${solBalance} SOL`);
console.log(`   USDT Balance: $${usdtBalance.toFixed(2)}`);
console.log(`   Threshold: ±${(threshold * 100).toFixed(1)}%\n`);

console.log('🎯 Target Price Analysis:');

// BUY Target Analysis
const buyDistance = ((currentPrice - buyTargetPrice) / buyTargetPrice * 100);
console.log(`🎯 BUY Target: $${buyTargetPrice.toFixed(4)} (need -${buyDistance.toFixed(2)}% to trigger)`);

// SELL Target Analysis (with position)
const sellDistance = ((sellTargetPricePosition - currentPrice) / currentPrice * 100);
const currentProfit = ((currentPrice - avgCost) / avgCost * 100);
console.log(`🎯 SELL Target: $${sellTargetPricePosition.toFixed(4)} (need +${sellDistance.toFixed(2)}% to trigger) | Current profit: +${currentProfit.toFixed(2)}%`);

console.log('\n💡 Action Indicators:');
if (buyDistance <= 5) {
    console.log(`🟡 BUY Alert: Close to buy target (${buyDistance.toFixed(2)}% away)`);
} else {
    console.log(`🟢 BUY Status: Monitoring (${buyDistance.toFixed(2)}% away from target)`);
}

if (sellDistance <= 2) {
    console.log(`🟡 SELL Alert: Close to sell target (${sellDistance.toFixed(2)}% away)`);
} else if (currentProfit > 0) {
    console.log(`🟢 SELL Status: In profit but waiting for target (${sellDistance.toFixed(2)}% away)`);
} else {
    console.log(`🔒 HODL Mode: Not profitable yet (need +${((sellTargetPricePosition - currentPrice) / currentPrice * 100).toFixed(2)}%)`);
}

console.log('\n📈 Actual Trading Examples:');
console.log('When BUY triggers:');
console.log(`💵 BUYING: $42.30 USDT at $${buyTargetPrice.toFixed(4)} (target was $${buyTargetPrice.toFixed(4)})`);

console.log('\nWhen SELL triggers:');
console.log(`💰 SELLING: ${solBalance.toFixed(4)} SOL at $${sellTargetPricePosition.toFixed(4)} (target was $${sellTargetPricePosition.toFixed(4)}, avg cost: $${avgCost.toFixed(4)})`);

console.log('\n🎉 This is what your bot will now show in real-time!');
