const fs = require('fs');

// Read positions file
const positions = JSON.parse(fs.readFileSync('positions.json', 'utf8'));

console.log('=== POSITION ANALYSIS ===');
console.log(`Total Positions: ${positions.positions.length}`);

// Calculate totals
let totalCost = 0;
let totalQuantity = 0;
let totalFees = 0;
let avgBuyPrice = 0;

positions.positions.forEach(pos => {
    totalCost += pos.totalCost;
    totalQuantity += pos.quantity;
    totalFees += pos.fees;
});

avgBuyPrice = (totalCost - totalFees) / totalQuantity;

console.log(`\n=== FINANCIAL SUMMARY ===`);
console.log(`Total Investment: $${totalCost.toFixed(2)}`);
console.log(`Total Quantity: ${totalQuantity.toFixed(3)} OKB`);
console.log(`Total Fees Paid: $${totalFees.toFixed(2)}`);
console.log(`Average Buy Price: $${avgBuyPrice.toFixed(4)}`);

// Current price analysis
const currentPrice = 198.70; // From recent logs
const marketValue = totalQuantity * currentPrice;
const unrealizedPnL = marketValue - totalCost;
const unrealizedPnLPercent = (unrealizedPnL / totalCost) * 100;

console.log(`\n=== CURRENT STATUS (Price: $${currentPrice}) ===`);
console.log(`Market Value: $${marketValue.toFixed(2)}`);
console.log(`Unrealized P&L: $${unrealizedPnL.toFixed(2)} (${unrealizedPnLPercent.toFixed(2)}%)`);

// Break-even analysis
let profitablePositions = 0;
let losingPositions = 0;

positions.positions.forEach(pos => {
    if (currentPrice > pos.breakEvenPrice) {
        profitablePositions++;
    } else {
        losingPositions++;
    }
});

console.log(`\n=== POSITION BREAKDOWN ===`);
console.log(`Profitable positions: ${profitablePositions}`);
console.log(`Losing positions: ${losingPositions}`);

// Time analysis
const timestamps = positions.positions.map(p => new Date(p.timestamp));
const earliestTime = new Date(Math.min(...timestamps));
const latestTime = new Date(Math.max(...timestamps));
const timeSpan = (latestTime - earliestTime) / (1000 * 60 * 60); // hours

console.log(`\n=== TIMING ANALYSIS ===`);
console.log(`First Position: ${earliestTime.toLocaleString()}`);
console.log(`Last Position: ${latestTime.toLocaleString()}`);
console.log(`Time Span: ${timeSpan.toFixed(1)} hours`);
console.log(`Average: ${(positions.positions.length / timeSpan).toFixed(1)} positions per hour`);

// Price range analysis
const prices = positions.positions.map(p => p.buyPrice);
const minPrice = Math.min(...prices);
const maxPrice = Math.max(...prices);

console.log(`\n=== PRICE RANGE ===`);
console.log(`Lowest Buy: $${minPrice.toFixed(2)}`);
console.log(`Highest Buy: $${maxPrice.toFixed(2)}`);
console.log(`Price Range: $${(maxPrice - minPrice).toFixed(2)}`);
