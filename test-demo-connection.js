require('dotenv').config();
const OKXClient = require('./okx-client');

async function testDemoConnection() {
    console.log('🧪 Testing Demo API Connection...');
    console.log('================================');
    
    try {
        const client = new OKXClient(
            process.env.OKX_API_KEY,
            process.env.OKX_SECRET_KEY,
            process.env.OKX_PASSPHRASE,
            process.env.OKX_BASE_URL
        );

        console.log('📡 Testing API connection...');
        
        // Test 1: Get market price (public endpoint)
        try {
            const price = await client.getPrice('OKB-USDT');
            console.log(`✅ Market Price Test: OKB-USDT = $${price}`);
        } catch (error) {
            console.log(`❌ Market Price Test Failed: ${error.message}`);
        }

        // Test 2: Get balances (private endpoint)
        try {
            const balances = await client.getBalances();
            console.log('✅ Balance Test: Successfully authenticated');
            
            // Handle balance object structure
            const usdtBalance = balances.USDT?.availBal || balances.USDT || '0';
            const okbBalance = balances.OKB?.availBal || balances.OKB || '0';
            
            console.log(`   USDT Balance: ${usdtBalance}`);
            console.log(`   OKB Balance: ${okbBalance}`);
        } catch (error) {
            console.log(`❌ Balance Test Failed: ${error.message}`);
            if (error.message.includes('401')) {
                console.log('💡 This might be a demo API credential issue');
                console.log('   Please verify your demo API keys are correct');
            }
        }

        console.log('\n🎯 Demo Mode Status:');
        console.log(`   Demo Mode Enabled: ${process.env.OKX_DEMO_MODE}`);
        console.log(`   Trading Symbol: ${process.env.TRADING_SYMBOL}`);
        console.log(`   Max Trade Size: $${process.env.MAX_USDT_TO_USE}`);

    } catch (error) {
        console.log(`❌ Connection Test Failed: ${error.message}`);
    }
}

testDemoConnection();
