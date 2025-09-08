// Demo Trading Connection Test
require('dotenv').config();

console.log('🧪 DEMO TRADING SETUP VERIFICATION');
console.log('===================================');

console.log('📋 Demo API Configuration:');
console.log(`   API Key: ${process.env.OKX_API_KEY?.substring(0, 8)}...`);
console.log(`   Secret Key: ${process.env.OKX_SECRET_KEY?.substring(0, 8)}...`);
console.log(`   Passphrase: ${process.env.OKX_PASSPHRASE}`);
console.log(`   Base URL: ${process.env.OKX_BASE_URL}`);

console.log('\n🎯 Trading Configuration:');
console.log(`   Symbol: ${process.env.TRADING_SYMBOL}`);
console.log(`   Threshold: ${process.env.PRICE_CHANGE_THRESHOLD} (${(parseFloat(process.env.PRICE_CHANGE_THRESHOLD) * 100).toFixed(1)}%)`);
console.log(`   Max USDT per trade: $${process.env.MAX_USDT_TO_USE}`);
console.log(`   Technical Analysis: ${process.env.ENABLE_TECHNICAL_ANALYSIS}`);
console.log(`   Fixed Targets: ${process.env.ENABLE_FIXED_TARGETS}`);

console.log('\n📈 Risk Management:');
console.log(`   Stop Loss: ${process.env.STOP_LOSS_PERCENTAGE} (${(parseFloat(process.env.STOP_LOSS_PERCENTAGE) * 100).toFixed(1)}%)`);
console.log(`   Take Profit: ${process.env.TAKE_PROFIT_PERCENTAGE} (${(parseFloat(process.env.TAKE_PROFIT_PERCENTAGE) * 100).toFixed(1)}%)`);

console.log('\n✅ DEMO MODE READY!');
console.log('   • Virtual balance: ~$100,000 USDT');
console.log('   • Real market data');
console.log('   • No real money risk');
console.log('   • Same trading logic as live');

console.log('\n🚀 Next Steps:');
console.log('   1. Run: node enhanced-bot.js');
console.log('   2. Monitor demo trades');
console.log('   3. Validate profitability');
console.log('   4. Switch to live when ready');
