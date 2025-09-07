console.log('🛒 BUY CURRENT PRICE MODE - DEMO');
console.log('===============================');
console.log('');
console.log('🎯 PURPOSE:');
console.log('This mode allows you to instantly buy at market price when starting the bot,');
console.log('giving you immediate market entry instead of waiting for price drops.');
console.log('');

console.log('📋 HOW IT WORKS:');
console.log('1. Bot starts and checks your current position');
console.log('2. If you have NO coins in the target symbol (ETH), executes market buy');
console.log('3. Uses your available USDT budget for the purchase');
console.log('4. Sets sell target based on your average cost + threshold');
console.log('5. Continues normal trading with position-based targets');
console.log('');

console.log('💰 EXAMPLE SCENARIO:');
console.log('Current ETH Price: $3,200');
console.log('Your USDT Balance: $105.08');
console.log('Max USDT to Use: $30 (from .env)');
console.log('Threshold: 0.4%');
console.log('');

console.log('🚀 EXECUTION SEQUENCE:');
console.log('1. Bot starts: "No ETH position detected"');
console.log('2. Market buy: Purchases $30 worth of ETH at $3,200');
console.log('3. Amount bought: 0.009375 ETH (30 ÷ 3200)');
console.log('4. Sell target set: $3,212.80 ($3,200 × 1.004)');
console.log('5. Bot monitors: Waits for price to reach $3,212.80 to sell');
console.log('');

console.log('🎯 BENEFITS:');
console.log('✅ Immediate market entry - no waiting for dips');
console.log('✅ Perfect for trending markets');
console.log('✅ Gets position established quickly');
console.log('✅ Fixed sell target ensures profit target');
console.log('✅ Continues normal trading after initial buy');
console.log('');

console.log('⚙️ USAGE:');
console.log('npm run start:enhanced:buycurrentprice');
console.log('');

console.log('🔧 CONFIGURATION CHECK:');
require('dotenv').config();
console.log(`• Symbol: ${process.env.TRADING_SYMBOL}`);
console.log(`• Max USDT: $${process.env.MAX_USDT_TO_USE}`);
console.log(`• Min Order: $${process.env.MIN_ORDER_SIZE}`);
console.log(`• Threshold: ${(parseFloat(process.env.PRICE_CHANGE_THRESHOLD) * 100).toFixed(1)}%`);
console.log('');

console.log('🚨 IMPORTANT NOTES:');
console.log('• Only executes ONCE when bot starts');
console.log('• Only if you have NO position in the target coin');
console.log('• Uses your MAX_USDT_TO_USE limit for safety');
console.log('• After buy, switches to normal trading mode');
console.log('• Fixed targets prevent moving target issues');
console.log('');

console.log('📊 COMPARISON:');
console.log('Normal Mode: Wait for 0.4% drop → Buy → Wait for 0.4% rise → Sell');
console.log('Buy Current: Buy immediately → Wait for 0.4% rise → Sell');
console.log('');

console.log('✅ Ready to test! Run: npm run start:enhanced:buycurrentprice');

process.exit(0);
