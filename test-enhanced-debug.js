/**
 * Enhanced Bot Debug Test
 * Mimics the exact same initialization and API calls as enhanced-bot.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const OKXClient = require('./okx-client');

console.log('🔧 === Enhanced Bot Debug Test ===\n');

// Step 1: Environment check (same as enhanced-bot.js)
console.log('🔧 Debug: Environment variables check:');
console.log(`   API Key: ${process.env.OKX_API_KEY ? 'Found' : 'Missing'}`);
console.log(`   Secret Key: ${process.env.OKX_SECRET_KEY ? 'Found' : 'Missing'}`);
console.log(`   Passphrase: ${process.env.OKX_PASSPHRASE ? 'Found' : 'Missing'}`);

if (!process.env.OKX_API_KEY || !process.env.OKX_SECRET_KEY || !process.env.OKX_PASSPHRASE) {
    throw new Error('❌ Missing required OKX API credentials in environment variables');
}

// Step 2: Initialize OKX client (exact same way as enhanced-bot.js)
console.log('\n🤖 Initializing OKX client...');
const client = new OKXClient({
    apiKey: process.env.OKX_API_KEY,
    secretKey: process.env.OKX_SECRET_KEY,
    passphrase: process.env.OKX_PASSPHRASE,
    baseURL: process.env.OKX_BASE_URL || 'https://www.okx.com',
    apiVersion: process.env.OKX_API_VERSION || 'api/v5'
});

console.log('✅ OKX Client initialized');
console.log(`   Client apiKey: ${client.apiKey ? 'Set' : 'Missing'}`);
console.log(`   Client secretKey: ${client.secretKey ? 'Set' : 'Missing'}`);
console.log(`   Client passphrase: ${client.passphrase ? 'Set' : 'Missing'}`);
console.log(`   Client baseUrl: ${client.baseUrl}`);

// Step 3: Test the exact same methods that enhanced-bot.js calls
console.log('\n📊 Testing getMarketData (same as enhanced-bot.js)...');
async function testGetMarketData() {
    try {
        const marketData = await client.getMarketData('SOL-USDT');
        if (!marketData) {
            throw new Error('Failed to fetch market data');
        }
        console.log('✅ getMarketData successful');
        console.log(`   Price: $${marketData.price}`);
        console.log(`   Volume: $${marketData.volume24h}`);
        return true;
    } catch (error) {
        console.log(`❌ getMarketData failed: ${error.message}`);
        console.log(`   Error type: ${error.constructor.name}`);
        console.log(`   Stack: ${error.stack}`);
        return false;
    }
}

// Step 4: Test getCandlesticks
console.log('\n📈 Testing getCandlesticks...');
async function testGetCandlesticks() {
    try {
        const candleData = await client.getCandlesticks('SOL-USDT', '5m', 100);
        console.log('✅ getCandlesticks successful');
        console.log(`   Candles returned: ${candleData ? candleData.length : 0}`);
        return true;
    } catch (error) {
        console.log(`❌ getCandlesticks failed: ${error.message}`);
        return false;
    }
}

// Step 5: Test getBalances
console.log('\n💰 Testing getBalances...');
async function testGetBalances() {
    try {
        const balances = await client.getBalances();
        console.log('✅ getBalances successful');
        console.log(`   USDT: ${balances.USDT ? balances.USDT.available : 'N/A'}`);
        console.log(`   SOL: ${balances.SOL ? balances.SOL.available : 'N/A'}`);
        return true;
    } catch (error) {
        console.log(`❌ getBalances failed: ${error.message}`);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('\n🚀 Running all API tests...');
    
    const results = {
        marketData: await testGetMarketData(),
        candlesticks: await testGetCandlesticks(),
        balances: await testGetBalances()
    };
    
    console.log('\n📋 Test Results Summary:');
    console.log(`   Market Data: ${results.marketData ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Candlesticks: ${results.candlesticks ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Balances: ${results.balances ? '✅ PASS' : '❌ FAIL'}`);
    
    const allPassed = Object.values(results).every(r => r);
    console.log(`\n🏁 Overall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    if (allPassed) {
        console.log('\n💡 Enhanced bot should work! The issue might be elsewhere.');
    } else {
        console.log('\n💡 Found the issue! Check the failed tests above.');
    }
}

runAllTests().catch(error => {
    console.log(`\n💥 Unexpected error: ${error.message}`);
    console.log(error.stack);
});
