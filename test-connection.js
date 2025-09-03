require('dotenv').config();
const OKXClient = require('./okx-client');

/**
 * Test script to verify OKX API connection and basic functionality
 * Run this before starting the actual trading bot
 */
async function testConnection() {
    console.log('🧪 Testing OKX API Connection...\n');

    // Check environment variables
    if (!process.env.OKX_API_KEY || !process.env.OKX_SECRET_KEY || !process.env.OKX_PASSPHRASE) {
        console.error('❌ Missing required environment variables!');
        console.log('Please create a .env file with:');
        console.log('- OKX_API_KEY');
        console.log('- OKX_SECRET_KEY');
        console.log('- OKX_PASSPHRASE\n');
        return;
    }

    const client = new OKXClient(
        process.env.OKX_API_KEY,
        process.env.OKX_SECRET_KEY,
        process.env.OKX_PASSPHRASE
    );

    try {
        // Test 1: Get current trading pair price
        const symbol = process.env.TRADING_SYMBOL || 'BTC-USDT';
        console.log(`📊 Test 1: Fetching ${symbol} price...`);
        const price = await client.getPrice(symbol);
        console.log(`✅ Current ${symbol} price: $${price.toFixed(2)}\n`);

        // Test 2: Get account balances
        console.log('💰 Test 2: Fetching account balances...');
        const balances = await client.getBalances();
        
        console.log('✅ Account balances:');
        Object.entries(balances).forEach(([currency, balance]) => {
            if (balance.available > 0) {
                console.log(`   ${currency}: ${balance.available} (Total: ${balance.total})`);
            }
        });

        if (Object.keys(balances).length === 0) {
            console.log('   No balances found or all balances are zero');
        }

        console.log('\n🎉 All tests passed! Your bot is ready to run.');
        console.log('\n📝 To start the trading bot, run: npm start');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\n🔧 Troubleshooting tips:');
        console.log('1. Verify your API credentials in .env file');
        console.log('2. Ensure your API key has trading permissions');
        console.log('3. Check if your IP is whitelisted (if IP restriction is enabled)');
        console.log('4. Verify your internet connection');
    }
}

// Run the test
testConnection();
