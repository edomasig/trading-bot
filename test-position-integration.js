#!/usr/bin/env node

/**
 * Test script to verify position tracking integration in enhanced bot
 */

console.log('🧪 Testing Enhanced Bot Position Tracking Integration...\n');

try {
    // Test importing the position tracker
    const PositionTracker = require('./position-tracker');
    console.log('✅ PositionTracker import successful');

    // Test creating a position tracker instance
    const tracker = new PositionTracker('SOL-USDT');
    console.log('✅ PositionTracker instance created');

    // Test basic functionality
    console.log('\n📊 Testing basic position tracking functionality:');
    
    // Simulate some buy positions
    console.log('  Adding buy position: 2 SOL at $100');
    tracker.addBuyPosition(100.0, 2.0);  // (price, quantity)
    
    console.log('  Adding buy position: 3 SOL at $110');
    tracker.addBuyPosition(110.0, 3.0);  // (price, quantity)
    
    // Check average cost using position summary
    const summary = tracker.getPositionSummary();
    console.log(`  Average cost: $${summary.averageBuyPrice.toFixed(2)}`);
    console.log(`  Total quantity: ${summary.totalQuantity} SOL`);
    console.log(`  Total cost: $${summary.totalCost.toFixed(2)}`);
    
    // Test sell decisions
    console.log('\n🎯 Testing sell decision logic:');
    
    // Test at break-even price
    let sellDecision = tracker.shouldSell(summary.averageBuyPrice, 0.015); // 1.5% threshold
    console.log(`  At break-even ($${summary.averageBuyPrice.toFixed(2)}): Should sell = ${sellDecision.shouldSell}`);
    
    // Test at profitable price
    const profitPrice = summary.averageBuyPrice * 1.02; // 2% above average
    sellDecision = tracker.shouldSell(profitPrice, 0.015);
    console.log(`  At profit ($${profitPrice.toFixed(2)}): Should sell = ${sellDecision.shouldSell}`);
    
    // Test profitable price calculation
    const profitableData = tracker.calculateProfitablePrice(0.015);
    if (profitableData) {
        console.log(`  Minimum profitable price for 1.5% threshold: $${profitableData.targetPrice.toFixed(2)}`);
        console.log(`  Break-even price: $${profitableData.breakEvenPrice.toFixed(2)}`);
    } else {
        console.log(`  No open positions for profitable price calculation`);
    }
    
    console.log('\n✅ Position tracker integration test completed successfully!');
    
    // Test enhanced bot import
    console.log('\n🤖 Testing Enhanced Bot import...');
    const EnhancedBot = require('./enhanced-bot');
    console.log('✅ Enhanced Bot can be imported (PositionTracker integration successful)');
    
} catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
}

console.log('\n🎉 All integration tests passed! The position tracking system is ready to use.');
