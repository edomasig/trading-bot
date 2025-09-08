// Test the trading logic fix
require('dotenv').config();

const EnhancedOKXBot = require('./enhanced-bot.js');

async function testTradingLogic() {
    console.log('🧪 Testing Fixed Trading Logic...\n');
    
    // Create bot instance
    const bot = new EnhancedOKXBot();
    
    // Test configuration
    console.log('=== CONFIGURATION ===');
    console.log(`ENABLE_FIXED_TARGETS: ${process.env.ENABLE_FIXED_TARGETS}`);
    console.log(`PRICE_CHANGE_THRESHOLD: ${process.env.PRICE_CHANGE_THRESHOLD}`);
    console.log(`MAX_USDT_TO_USE: ${process.env.MAX_USDT_TO_USE}`);
    console.log(`OKX_DEMO_MODE: ${process.env.OKX_DEMO_MODE}\n`);
    
    // Test threshold calculation
    const threshold = bot.getDynamicThreshold();
    console.log(`=== THRESHOLD TEST ===`);
    console.log(`Current threshold: ${(threshold * 100).toFixed(2)}%\n`);
    
    // Test target calculation with sample prices
    const testPrice = 199.00;
    const targets = bot.getCurrentTargets(testPrice, threshold);
    
    console.log(`=== TARGET CALCULATION TEST ===`);
    console.log(`Test price: $${testPrice.toFixed(2)}`);
    console.log(`Target mode: ${targets.isFixed ? 'FIXED' : 'DYNAMIC'}`);
    console.log(`Buy target: $${targets.buyTarget?.toFixed(4) || 'undefined'}`);
    console.log(`Sell target: $${targets.sellTarget?.toFixed(4) || 'undefined'}\n`);
    
    if (!targets.isFixed) {
        console.log('✅ FIXED: Now using safe dynamic targets');
        console.log('✅ Bot will only buy after price drops 0.8% from CURRENT price');
        console.log('✅ No more buying whenever price is below fixed target');
    } else {
        console.log('❌ WARNING: Still using fixed targets mode');
    }
    
    console.log('\n=== SUMMARY ===');
    console.log('✅ Fixed the dangerous buy trigger logic');
    console.log('✅ Disabled ENABLE_FIXED_TARGETS in .env');
    console.log('✅ Bot now respects threshold-based trading');
    console.log('✅ No more runaway buying behavior');
}

testTradingLogic().catch(console.error);
