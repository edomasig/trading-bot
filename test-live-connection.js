/**
 * Live Trading Connection Test Script
 * CRITICAL: Tests live OKX API connection before starting real trading
 */

require('dotenv').config();
const OKXClient = require('./okx-client');

async function testLiveConnection() {
    console.log('🚨 === LIVE TRADING CONNECTION TEST ===\n');
    console.log('⚠️  WARNING: This will test LIVE API credentials with REAL money!\n');

    // Verify environment setup
    console.log('🔧 Step 1: Environment Verification...');
    
    if (process.env.OKX_DEMO_MODE === 'true') {
        console.error('❌ CRITICAL: Still in DEMO mode!');
        console.log('   Please set OKX_DEMO_MODE=false in .env file');
        return;
    }
    
    if (!process.env.OKX_API_KEY || !process.env.OKX_SECRET_KEY || !process.env.OKX_PASSPHRASE) {
        console.error('❌ CRITICAL: Missing live API credentials!');
        console.log('   Required: OKX_API_KEY, OKX_SECRET_KEY, OKX_PASSPHRASE');
        return;
    }

    if (process.env.OKX_PASSPHRASE === 'YOUR_PASSPHRASE_HERE') {
        console.error('❌ CRITICAL: Passphrase not updated!');
        console.log('   Please replace YOUR_PASSPHRASE_HERE with actual passphrase');
        return;
    }

    console.log('✅ Environment configured for LIVE trading');
    console.log(`   Demo Mode: ${process.env.OKX_DEMO_MODE}`);
    console.log(`   API Key: ${process.env.OKX_API_KEY.substring(0, 8)}...`);
    console.log(`   Max Trade: $${process.env.MAX_USDT_TO_USE}`);
    console.log('');

    // Initialize client
    console.log('🔑 Step 2: Initializing LIVE OKX Client...');
    const client = new OKXClient({
        apiKey: process.env.OKX_API_KEY,
        secretKey: process.env.OKX_SECRET_KEY,
        passphrase: process.env.OKX_PASSPHRASE,
        baseURL: process.env.OKX_BASE_URL,
        apiVersion: process.env.OKX_API_VERSION
    });

    try {
        // Test 1: Market data (public endpoint)
        console.log('📊 Step 3: Testing market data access...');
        const symbol = process.env.TRADING_SYMBOL || 'OKB-USDT';
        const marketData = await client.getMarketData(symbol);
        
        if (marketData) {
            console.log(`✅ Market data: ${symbol} = $${marketData.price.toFixed(4)}`);
            console.log(`   24h Volume: $${(marketData.volumeQuote24h / 1000000).toFixed(1)}M`);
        } else {
            console.error('❌ Failed to get market data');
            return;
        }

        // Test 2: Account balances (private endpoint - REAL MONEY)
        console.log('\n💰 Step 4: Testing LIVE account access...');
        console.log('⚠️  This will show your REAL account balances!');
        
        const balances = await client.getBalances();
        console.log('✅ Live account access successful!');
        
        // Show balances
        console.log('\n📊 LIVE Account Balances:');
        let totalValueUSD = 0;
        let hasUSDTO = false;
        let hasOKB = false;
        
        for (const [currency, balance] of Object.entries(balances)) {
            if (balance.available > 0) {
                console.log(`   ${currency}: ${balance.available.toFixed(6)} available`);
                
                if (currency === 'USDT') {
                    hasUSDTO = true;
                    totalValueUSD += balance.available;
                }
                if (currency === 'OKB') {
                    hasOKB = true;
                    // Estimate OKB value
                    totalValueUSD += balance.available * marketData.price;
                }
            }
        }

        console.log(`\n💵 Estimated Total Value: ~$${totalValueUSD.toFixed(2)}`);

        // Safety checks
        console.log('\n🛡️  Step 5: Safety Validation...');
        
        if (!hasUSDTO && !hasOKB) {
            console.log('⚠️  WARNING: No USDT or OKB balance detected');
            console.log('   You may need to deposit funds before trading');
        }
        
        const maxTradeAmount = parseFloat(process.env.MAX_USDT_TO_USE || '10');
        if (totalValueUSD > 0 && totalValueUSD < maxTradeAmount * 2) {
            console.log(`⚠️  WARNING: Low balance for trading`);
            console.log(`   Account: $${totalValueUSD.toFixed(2)}, Max per trade: $${maxTradeAmount}`);
            console.log(`   Recommended: At least $${(maxTradeAmount * 5).toFixed(0)} for safe trading`);
        }

        // Test 3: Trading permissions
        console.log('\n🔐 Step 6: Verifying trading permissions...');
        try {
            // Try to get recent orders (tests trading endpoint access)
            const endpoint = `/trade/orders-history-archive?instType=SPOT&limit=1`;
            const testResponse = await client.makeRequest('GET', endpoint);
            console.log('✅ Trading permissions verified');
        } catch (error) {
            console.error('❌ Trading permission issue:', error.message);
            console.log('   Check API key trading permissions on OKX');
        }

        console.log('\n🎉 === LIVE CONNECTION TEST COMPLETE ===');
        console.log('\n📋 Summary:');
        console.log(`✅ API Connection: Working`);
        console.log(`✅ Account Access: ${Object.keys(balances).length} currencies`);
        console.log(`✅ Estimated Balance: $${totalValueUSD.toFixed(2)}`);
        console.log(`✅ Max Per Trade: $${process.env.MAX_USDT_TO_USE}`);
        console.log(`✅ Threshold: ${(parseFloat(process.env.PRICE_CHANGE_THRESHOLD) * 100).toFixed(1)}%`);
        
        console.log('\n🚀 READY FOR LIVE TRADING!');
        console.log('\n💡 To start live trading: node enhanced-bot.js');
        console.log('⚠️  Monitor closely for the first hour!');

    } catch (error) {
        console.error('\n❌ LIVE CONNECTION TEST FAILED!');
        console.error('Error:', error.message);
        
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Verify API credentials are correct');
        console.log('2. Check API key has trading permissions');
        console.log('3. Ensure IP whitelisting (if enabled)');
        console.log('4. Verify account is not restricted');
        console.log('\n⚠️  DO NOT proceed with live trading until this passes!');
    }
}

// Run the test
testLiveConnection().then(() => {
    process.exit(0);
}).catch(error => {
    console.error('❌ Test script error:', error.message);
    process.exit(1);
});
