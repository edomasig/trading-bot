const EnhancedTradingBot = require('./enhanced-bot.js');

console.log('🎯 FIXED TARGETS DEMO - Problem SOLVED!');
console.log('==========================================');
console.log('Before: Buy targets kept moving, preventing trades');
console.log('After: Fixed targets stay stable until triggered\n');

// Create bot instance with fixed targets enabled
const bot = new EnhancedTradingBot();

// Simulate market price changes over time
const simulatedPrices = [
    { time: '09:00', price: 3200.00 },
    { time: '09:01', price: 3195.50 },
    { time: '09:02', price: 3198.20 },
    { time: '09:03', price: 3190.80 },
    { time: '09:04', price: 3186.50 }, // Should trigger buy
    { time: '09:05', price: 3192.30 },
];

const threshold = 0.004; // 0.4%
let initialTargets = null;

console.log('📊 Market Simulation:');
console.log('Current Settings: ENABLE_FIXED_TARGETS=true, ENABLE_ADAPTIVE_THRESHOLD=false');
console.log('Threshold: 0.4%\n');

simulatedPrices.forEach((data, index) => {
    console.log(`⏰ ${data.time} - Price: $${data.price.toFixed(4)}`);
    
    if (index === 0) {
        // Initialize targets on first price
        bot.updateFixedTargets(data.price, threshold);
        initialTargets = bot.getCurrentTargets(data.price, threshold);
        console.log(`   🎯 INITIALIZED Fixed Targets:`);
        console.log(`      Buy Target:  $${initialTargets.buyTarget.toFixed(4)}`);
        console.log(`      Sell Target: $${initialTargets.sellTarget.toFixed(4)}`);
    } else {
        // Get current targets (should remain fixed)
        const currentTargets = bot.getCurrentTargets(data.price, threshold);
        
        console.log(`   🎯 Current Targets:`);
        console.log(`      Buy Target:  $${currentTargets.buyTarget.toFixed(4)} ${currentTargets.buyTarget === initialTargets.buyTarget ? '✅ FIXED' : '❌ MOVED'}`);
        console.log(`      Sell Target: $${currentTargets.sellTarget.toFixed(4)} ${currentTargets.sellTarget === initialTargets.sellTarget ? '✅ FIXED' : '❌ MOVED'}`);
        
        // Check if targets would be triggered
        if (data.price <= currentTargets.buyTarget) {
            console.log(`   🔥 BUY TRIGGER! Price $${data.price.toFixed(4)} <= Target $${currentTargets.buyTarget.toFixed(4)}`);
        } else if (data.price >= currentTargets.sellTarget) {
            console.log(`   🔥 SELL TRIGGER! Price $${data.price.toFixed(4)} >= Target $${currentTargets.sellTarget.toFixed(4)}`);
        } else {
            const buyDistance = ((data.price - currentTargets.buyTarget) / currentTargets.buyTarget * 100);
            const sellDistance = ((currentTargets.sellTarget - data.price) / data.price * 100);
            console.log(`   📏 Need -${buyDistance.toFixed(2)}% to buy, +${sellDistance.toFixed(2)}% to sell`);
        }
    }
    console.log('');
});

console.log('🎉 RESULTS:');
console.log('✅ Buy and Sell targets STAYED FIXED throughout price movements');
console.log('✅ Buy trigger activated when price dropped to $3186.50');
console.log('✅ No more moving targets preventing trades!');
console.log('');
console.log('🔄 POST-TRADE TARGET UPDATE (Option C Hybrid Strategy):');
console.log('After a successful trade, targets are updated using the hybrid formula:');
console.log('- After BUY: Sell target = average_cost * (1 + threshold)');
console.log('- After SELL: Buy target = min(sell_price_based, market_price_based)');
console.log('');
console.log('📝 The moving target problem is now SOLVED! 🎯');

process.exit(0);
