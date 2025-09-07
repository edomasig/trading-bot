// Quick test to verify the bot initializes correctly with --buy-current-price argument
console.log('🧪 Testing Enhanced Bot Initialization with --buy-current-price');
console.log('=============================================================');

const EnhancedTradingBot = require('./enhanced-bot.js');

// Create bot instance
console.log('1. Creating bot instance...');
const bot = new EnhancedTradingBot();

// Check if buy current price mode is properly detected
console.log(`2. Buy Current Price Mode: ${bot.buyCurrentPriceMode ? '✅ ENABLED' : '❌ DISABLED'}`);
console.log(`3. Initial Market Buy Executed: ${bot.initialMarketBuyExecuted ? '✅ YES' : '❌ NO'}`);
console.log(`4. Fixed Targets Enabled: ${bot.enableFixedTargets || bot.useFixedTargets ? '✅ YES' : '❌ NO'}`);

console.log('');
console.log('📊 Configuration Summary:');
console.log(`• Trading Symbol: ${bot.symbol}`);
console.log(`• Price Threshold: ${(bot.priceChangeThreshold * 100).toFixed(1)}%`);
console.log(`• Max USDT per Trade: $${bot.maxUsdtToUse || 'No limit'}`);
console.log(`• Min Order Size: $${bot.minOrderSize}`);

console.log('');
if (bot.buyCurrentPriceMode) {
    console.log('✅ SUCCESS: Bot is configured for buy-current-price mode!');
    console.log('When started, it will:');
    console.log('1. Check current ETH position');
    console.log('2. If no position, execute market buy');
    console.log('3. Set fixed sell target');
    console.log('4. Continue normal trading');
} else {
    console.log('ℹ️  INFO: Bot is in normal mode');
    console.log('To enable buy-current-price mode, run:');
    console.log('npm run start:enhanced:buycurrentprice');
}

process.exit(0);
