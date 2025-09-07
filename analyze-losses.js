const fs = require('fs');

const logs = fs.readFileSync('logs/transactions.log', 'utf8');
const lines = logs.trim().split('\n').filter(line => line.includes('|'));

let totalProfit = 0;
let totalTrades = 0;
let wins = 0;
let losses = 0;

console.log('📊 TRADING ANALYSIS');
console.log('==================');

lines.forEach(line => {
  if (line.includes('SELL') && !line.includes('SELL_STOP_LOSS')) {
    const data = JSON.parse(line.split(' | ')[2]);
    // Handle both positive and negative values correctly
    const profitStr = data.profitUSD.replace('$', '');
    const profit = parseFloat(profitStr);
    totalProfit += profit;
    totalTrades++;
    
    if (profit > 0) wins++;
    else losses++;
    
    console.log(`Trade: ${data.profitUSD} (${data.profit})`);
  }
});

console.log('==================');
console.log(`Total Trades: ${totalTrades}`);
console.log(`Wins: ${wins} | Losses: ${losses}`);
console.log(`Win Rate: ${(wins/totalTrades*100).toFixed(1)}%`);
console.log(`Total P&L: $${totalProfit.toFixed(2)}`);
console.log(`Avg per trade: $${(totalProfit/totalTrades).toFixed(2)}`);

// Analyze the trading pattern
console.log('\n🔍 TRADING PATTERN ANALYSIS');
console.log('============================');

let buyPrices = [];
let sellPrices = [];

lines.forEach(line => {
  if (line.includes('BUY')) {
    const data = JSON.parse(line.split(' | ')[2]);
    buyPrices.push(parseFloat(data.price));
  }
  if (line.includes('SELL') && !line.includes('SELL_STOP_LOSS')) {
    const data = JSON.parse(line.split(' | ')[2]);
    sellPrices.push(parseFloat(data.price));
  }
});

const avgBuyPrice = buyPrices.reduce((a, b) => a + b, 0) / buyPrices.length;
const avgSellPrice = sellPrices.reduce((a, b) => a + b, 0) / sellPrices.length;

console.log(`Average Buy Price: $${avgBuyPrice.toFixed(4)}`);
console.log(`Average Sell Price: $${avgSellPrice.toFixed(4)}`);
console.log(`Price Difference: $${(avgSellPrice - avgBuyPrice).toFixed(4)}`);

// Check trading fees impact
console.log('\n💰 FEES ANALYSIS');
console.log('================');
const totalVolume = totalTrades * 29; // $29 per trade
const estimatedFees = totalVolume * 0.001; // Assuming 0.1% fees
console.log(`Total Trading Volume: $${totalVolume}`);
console.log(`Estimated Trading Fees: $${estimatedFees.toFixed(2)}`);
console.log(`Net P&L after fees: $${(totalProfit - estimatedFees).toFixed(2)}`);
