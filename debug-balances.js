require('dotenv').config();
const OKXClient = require('./okx-client');

/**
 * Debug script to check current account balances and understand the trading bot issues
 */
async function debugBalances() {
    const client = new OKXClient(
        process.env.OKX_API_KEY,
        process.env.OKX_SECRET_KEY,
        process.env.OKX_PASSPHRASE
    );

    try {
        console.log('🔍 Fetching current account balances...');
        const balances = await client.getBalances();
        
        console.log('\n💰 Current Balances:');
        console.log('==================');
        
        // Show all non-zero balances
        for (const [currency, balance] of Object.entries(balances)) {
            if (balance.available > 0 || balance.frozen > 0) {
                console.log(`${currency}:`);
                console.log(`  Available: ${balance.available}`);
                console.log(`  Frozen: ${balance.frozen}`);
                console.log(`  Total: ${balance.available + balance.frozen}`);
                console.log('');
            }
        }
        
        // Check SOL-USDT specific balances
        const solBalance = balances['SOL']?.available || 0;
        const usdtBalance = balances['USDT']?.available || 0;
        
        console.log('🎯 SOL-USDT Trading Analysis:');
        console.log('============================');
        console.log(`SOL Available: ${solBalance.toFixed(6)} SOL`);
        console.log(`USDT Available: $${usdtBalance.toFixed(2)} USDT`);
        
        // Get current SOL price
        const currentPrice = await client.getPrice('SOL-USDT');
        console.log(`Current SOL Price: $${currentPrice.toFixed(2)}`);
        console.log(`SOL Position Value: $${(solBalance * currentPrice).toFixed(2)}`);
        
        // Check against trading limits
        const maxUsdtToUse = parseFloat(process.env.MAX_USDT_TO_USE) || null;
        const minOrderSize = parseFloat(process.env.MIN_ORDER_SIZE) || 10;
        
        console.log('\n⚙️ Trading Configuration:');
        console.log('========================');
        console.log(`Max USDT to use: ${maxUsdtToUse ? '$' + maxUsdtToUse : 'unlimited'}`);
        console.log(`Min order size: $${minOrderSize}`);
        
        if (maxUsdtToUse) {
            const availableForTrading = Math.min(usdtBalance, maxUsdtToUse);
            console.log(`Available for trading: $${availableForTrading.toFixed(2)}`);
            
            if (usdtBalance > maxUsdtToUse) {
                console.log(`⚠️ WARNING: You have $${usdtBalance.toFixed(2)} USDT but limit is set to $${maxUsdtToUse}`);
                console.log('   Consider increasing MAX_USDT_TO_USE if you want larger positions');
            }
        }
        
        // Calculate potential buy/sell amounts
        console.log('\n📊 Potential Trade Analysis:');
        console.log('===========================');
        
        const buyAmount = maxUsdtToUse ? Math.min(usdtBalance, maxUsdtToUse) * 0.99 : usdtBalance * 0.99;
        const buySOL = buyAmount / currentPrice;
        console.log(`Next BUY would be: $${buyAmount.toFixed(2)} (${buySOL.toFixed(4)} SOL)`);
        
        if (solBalance > 0) {
            const sellAmount = Math.floor(solBalance * 0.995 * 100000) / 100000;
            const sellValue = sellAmount * currentPrice;
            console.log(`Next SELL would be: ${sellAmount.toFixed(6)} SOL ($${sellValue.toFixed(2)})`);
            
            if (sellAmount < 0.01) {
                console.log('❌ WARNING: Sell amount below minimum (0.01 SOL)');
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run the debug
debugBalances().then(() => {
    console.log('\n✅ Balance debugging complete');
    process.exit(0);
}).catch(error => {
    console.error('❌ Debug failed:', error.message);
    process.exit(1);
});
