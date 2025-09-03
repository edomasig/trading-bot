require('dotenv').config();
const OKXClient = require('./okx-client');

/**
 * Enhanced test script to diagnose OKX API issues
 * This will test multiple scenarios to identify the problem
 */
async function enhancedTest() {
    console.log('🔍 Enhanced OKX API Diagnostic Test...\n');

    // Check environment variables
    if (!process.env.OKX_API_KEY || !process.env.OKX_SECRET_KEY || !process.env.OKX_PASSPHRASE) {
        console.error('❌ Missing required environment variables!');
        console.log('Please create a .env file with:');
        console.log('- OKX_API_KEY');
        console.log('- OKX_SECRET_KEY');
        console.log('- OKX_PASSPHRASE\n');
        return;
    }

    console.log('✅ Environment variables found');
    console.log('API Key:', process.env.OKX_API_KEY.substring(0, 8) + '...');
    console.log('Secret Key:', '***hidden***');
    console.log('Passphrase:', '***hidden***\n');

    const client = new OKXClient(
        process.env.OKX_API_KEY,
        process.env.OKX_SECRET_KEY,
        process.env.OKX_PASSPHRASE
    );

    try {
        // Test 1: Check if we can get instruments (trading pairs)
        console.log('📋 Test 1: Fetching available trading instruments...');
        try {
            const instruments = await client.makeRequest('GET', '/public/instruments?instType=SPOT');
            console.log(`✅ Found ${instruments.length} spot trading pairs available`);
            
            // Check if WLFI-USDT exists
            const wlfiPair = instruments.find(inst => inst.instId === 'WLFI-USDT');
            if (wlfiPair) {
                console.log('✅ WLFI-USDT pair is available!');
                console.log(`   Minimum order size: ${wlfiPair.minSz}`);
                console.log(`   Tick size: ${wlfiPair.tickSz}`);
            } else {
                console.log('❌ WLFI-USDT pair is NOT available on OKX');
                
                // Look for similar pairs
                const wlfiPairs = instruments.filter(inst => inst.instId.includes('WLFI'));
                if (wlfiPairs.length > 0) {
                    console.log('🔍 Found similar WLFI pairs:');
                    wlfiPairs.forEach(pair => {
                        console.log(`   - ${pair.instId}`);
                    });
                } else {
                    console.log('❌ No WLFI pairs found at all');
                }
            }
            console.log('');
        } catch (error) {
            console.error('❌ Failed to fetch instruments:', error.message);
            console.log('');
        }

        // Test 2: Try with a known working pair (BTC-USDT)
        console.log('📊 Test 2: Testing with BTC-USDT (known working pair)...');
        try {
            const btcPrice = await client.getPrice('BTC-USDT');
            console.log(`✅ BTC-USDT price: $${btcPrice.toFixed(2)}`);
            console.log('✅ API connection is working!\n');
        } catch (error) {
            console.error('❌ BTC-USDT test failed:', error.message);
            console.log('This suggests an API authentication issue\n');
        }

        // Test 3: Try WLFI-USDT specifically
        console.log('📊 Test 3: Testing WLFI-USDT specifically...');
        try {
            const wlfiPrice = await client.getPrice('WLFI-USDT');
            console.log(`✅ WLFI-USDT price: $${wlfiPrice.toFixed(2)}\n`);
        } catch (error) {
            console.error('❌ WLFI-USDT test failed:', error.message);
            console.log('This confirms WLFI-USDT is not available\n');
        }

        // Test 4: Get account balances (requires authentication)
        console.log('💰 Test 4: Testing account balance access...');
        try {
            const balances = await client.getBalances();
            console.log('✅ Account balance access successful');
            
            const nonZeroBalances = Object.entries(balances).filter(([_, balance]) => balance.available > 0);
            if (nonZeroBalances.length > 0) {
                console.log('💰 Non-zero balances:');
                nonZeroBalances.forEach(([currency, balance]) => {
                    console.log(`   ${currency}: ${balance.available} (Total: ${balance.total})`);
                });
            } else {
                console.log('📝 All balances are zero or no balances found');
            }
            console.log('');
        } catch (error) {
            console.error('❌ Balance test failed:', error.message);
            console.log('This suggests API permission issues\n');
        }

        // Recommendations
        console.log('🎯 Recommendations:');
        console.log('1. If WLFI-USDT is not available, consider using BTC-USDT or ETH-USDT');
        console.log('2. Check OKX for the correct WLFI trading pair symbol');
        console.log('3. Verify your API key has the correct permissions (Read + Trade)');
        console.log('4. Make sure your IP is whitelisted if you have IP restrictions enabled');
        
    } catch (error) {
        console.error('❌ Fatal error:', error.message);
    }
}

// Run the enhanced test
enhancedTest();
