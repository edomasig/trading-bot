#!/usr/bin/env node
require('dotenv').config();

// Test the fix to ensure proper threshold-based logic
async function testTradingLogic() {
    console.log('🧪 Testing Fixed Trading Logic...\n');
    
    // Read the current .env to verify the fix
    const fs = require('fs');
    const envContent = fs.readFileSync('.env', 'utf8');
    
    console.log('📋 Current Environment Variables:');
    console.log('ENABLE_FIXED_TARGETS:', process.env.ENABLE_FIXED_TARGETS);
    console.log('PRICE_CHANGE_THRESHOLD:', process.env.PRICE_CHANGE_THRESHOLD);
    console.log('ENABLE_TECHNICAL_ANALYSIS:', process.env.ENABLE_TECHNICAL_ANALYSIS);
    console.log('OKX_DEMO_MODE:', process.env.OKX_DEMO_MODE);
    
    // Simulate the fixed logic (without the broken fixed targets)
    const PRICE_CHANGE_THRESHOLD = parseFloat(process.env.PRICE_CHANGE_THRESHOLD) || 0.008;
    
    console.log('\n🎯 Testing Threshold-Based Logic:');
    console.log(`Threshold: ${(PRICE_CHANGE_THRESHOLD * 100).toFixed(1)}%`);
    
    // Test scenarios
    const scenarios = [
        { current: 200, last: 198, desc: 'Price up +1%' },
        { current: 198, last: 200, desc: 'Price down -1%' },
        { current: 196, last: 200, desc: 'Price down -2%' },
        { current: 198.4, last: 200, desc: 'Price down -0.8% (threshold)' },
        { current: 198.5, last: 200, desc: 'Price down -0.75% (below threshold)' }
    ];
    
    scenarios.forEach(scenario => {
        const priceChange = (scenario.current - scenario.last) / scenario.last;
        const shouldBuy = priceChange <= -PRICE_CHANGE_THRESHOLD;
        
        console.log(`${scenario.desc}: ${(priceChange * 100).toFixed(2)}% - ${shouldBuy ? '🟢 BUY' : '🔴 WAIT'}`);
    });
    
    // Check if fixed targets are disabled
    if (process.env.ENABLE_FIXED_TARGETS === 'false') {
        console.log('\n✅ FIXED TARGETS DISABLED - GOOD!');
    } else {
        console.log('\n❌ FIXED TARGETS STILL ENABLED - DANGEROUS!');
    }
    
    console.log('\n📊 Your Current Exposure:');
    console.log('- 50+ positions worth $210K+');
    console.log('- Current loss: ~$474');
    console.log('- Status: BOT STOPPED (GOOD!)');
    
    console.log('\n⚠️  NEXT STEPS:');
    console.log('1. DO NOT restart bot until fix is verified');
    console.log('2. Consider selling some positions to reduce exposure');
    console.log('3. Test with tiny amounts first');
}

testTradingLogic().catch(console.error);
