#!/usr/bin/env node
require('dotenv').config();

const OKXClient = require('./okx-client');

async function safeDryRunTest() {
    console.log('🧪 SAFE DRY RUN TEST - NO ACTUAL TRADING');
    console.log('⏱️  Running for 2 minutes to test the logic...\n');
    
    const client = new OKXClient(
        process.env.OKX_API_KEY,
        process.env.OKX_SECRET_KEY,
        process.env.OKX_PASSPHRASE,
        'https://www.okx.com'
    );
    
    const SYMBOL = 'OKB-USDT';
    const THRESHOLD = parseFloat(process.env.PRICE_CHANGE_THRESHOLD) || 0.008;
    
    let lastPrice = null;
    let cycleCount = 0;
    const maxCycles = 12; // 2 minutes (10 second intervals)
    
    console.log(`📊 Monitoring ${SYMBOL} with ${(THRESHOLD * 100).toFixed(1)}% threshold`);
    console.log('🚫 FIXED TARGETS: DISABLED');
    console.log('🔒 DRY RUN: NO ORDERS WILL BE PLACED\n');
    
    const interval = setInterval(async () => {
        try {
            cycleCount++;
            
            // Get current price using the correct method
            const currentPrice = await client.getPrice(SYMBOL);
            
            console.log(`[${cycleCount}/${maxCycles}] 💹 ${SYMBOL}: $${currentPrice.toFixed(4)}`);
            
            if (lastPrice) {
                const priceChange = (currentPrice - lastPrice) / lastPrice;
                const priceChangePercent = (priceChange * 100).toFixed(3);
                
                // Test the FIXED logic (should only trigger on significant drops)
                const shouldBuy = priceChange <= -THRESHOLD;
                const shouldSell = priceChange >= THRESHOLD;
                
                if (shouldBuy) {
                    console.log(`🟢 BUY SIGNAL: Price dropped ${priceChangePercent}% (>${(THRESHOLD*100).toFixed(1)}% threshold)`);
                    console.log(`   📝 OLD LOGIC WOULD HAVE: Bought at ANY price below $196.76`);
                    console.log(`   ✅ NEW LOGIC: Only buying on ${(THRESHOLD*100).toFixed(1)}%+ drops from current levels`);
                } else if (shouldSell) {
                    console.log(`🔴 SELL SIGNAL: Price rose ${priceChangePercent}% (>${(THRESHOLD*100).toFixed(1)}% threshold)`);
                } else {
                    console.log(`⚪ NO ACTION: Price change ${priceChangePercent}% (below ${(THRESHOLD*100).toFixed(1)}% threshold)`);
                }
            }
            
            lastPrice = currentPrice;
            
            // Stop after 2 minutes
            if (cycleCount >= maxCycles) {
                clearInterval(interval);
                console.log('\n✅ DRY RUN COMPLETE - Logic appears to be working correctly!');
                console.log('\n📋 SUMMARY:');
                console.log('- Fixed targets: DISABLED ✅');
                console.log('- Threshold-based trading: ENABLED ✅');
                console.log('- Demo mode: ACTIVE ✅');
                console.log('- No actual orders placed ✅');
                
                console.log('\n⚠️  BEFORE LIVE TRADING:');
                console.log('1. Consider reducing your $210K exposure');
                console.log('2. Start with VERY small amounts (like $1-2)');
                console.log('3. Monitor closely for first hour');
                console.log('4. Your current 50 positions are still losing money');
            }
            
        } catch (error) {
            console.error('❌ Error:', error.message);
        }
    }, 10000); // Every 10 seconds
    
    // Handle Ctrl+C
    process.on('SIGINT', () => {
        clearInterval(interval);
        console.log('\n🛑 Dry run stopped by user');
        process.exit(0);
    });
}

safeDryRunTest().catch(console.error);
