console.log('🛒 Testing Buy Current Price Mode');
console.log('================================');

// Test if the command line argument is properly detected
const hasBuyCurrentPriceArg = process.argv.includes('--buy-current-price');
console.log(`Command line argument detected: ${hasBuyCurrentPriceArg}`);
console.log(`Process argv: ${process.argv.join(' ')}`);

if (hasBuyCurrentPriceArg) {
    console.log('✅ --buy-current-price argument detected correctly!');
    console.log('');
    console.log('📝 What this mode does:');
    console.log('1. Bot starts normally');
    console.log('2. Checks if you have any position in the target coin');
    console.log('3. If no position exists, executes immediate market buy');
    console.log('4. Uses available USDT budget for the purchase');
    console.log('5. After buy, sets fixed sell target and continues normal trading');
    console.log('');
    console.log('🎯 Usage examples:');
    console.log('npm run start:enhanced:buycurrentprice');
    console.log('node enhanced-bot.js --buy-current-price');
} else {
    console.log('❌ --buy-current-price argument NOT detected');
    console.log('');
    console.log('To test, run:');
    console.log('node test-buy-current-price.js --buy-current-price');
}

console.log('');
console.log('🔧 Configuration from .env:');
console.log(`MAX_USDT_TO_USE: ${process.env.MAX_USDT_TO_USE || 'Not set'}`);
console.log(`MIN_ORDER_SIZE: ${process.env.MIN_ORDER_SIZE || 'Not set'}`);
console.log(`TRADING_SYMBOL: ${process.env.TRADING_SYMBOL || 'Not set'}`);

process.exit(0);
