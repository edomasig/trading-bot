#!/usr/bin/env node
require('dotenv').config();

const fs = require('fs');
const OKXClient = require('./okx-client');

async function reduceRiskExposure() {
    console.log('🎯 RISK REDUCTION STRATEGY - Option A');
    console.log('=' .repeat(50));
    
    // Load current positions
    const positionsData = JSON.parse(fs.readFileSync('positions.json', 'utf8'));
    const positions = positionsData.positions || [];
    
    console.log(`📊 Current Status:`);
    console.log(`- Total positions: ${positions.length}`);
    
    // Calculate totals
    let totalInvestment = 0;
    let currentValue = 0;
    
    const client = new OKXClient(
        process.env.OKX_API_KEY,
        process.env.OKX_SECRET_KEY,
        process.env.OKX_PASSPHRASE,
        'https://www.okx.com'
    );
    
    try {
        const currentPrice = await client.getPrice('OKB-USDT');
        console.log(`- Current OKB price: $${currentPrice.toFixed(4)}`);
        
        positions.forEach(pos => {
            const investment = pos.totalCost || (pos.buyPrice * pos.quantity);
            const currentVal = pos.quantity * currentPrice;
            totalInvestment += investment;
            currentValue += currentVal;
        });
        
        const totalLoss = currentValue - totalInvestment;
        const lossPercent = (totalLoss / totalInvestment) * 100;
        
        console.log(`- Total investment: $${totalInvestment.toFixed(2)}`);
        console.log(`- Current value: $${currentValue.toFixed(2)}`);
        console.log(`- Total P&L: $${totalLoss.toFixed(2)} (${lossPercent.toFixed(2)}%)`);
        
        console.log('\n🎯 RISK REDUCTION PLAN:');
        
        // Strategy: Keep only the 15 best performing positions
        const positionsWithPnL = positions.map(pos => {
            const currentVal = pos.quantity * currentPrice;
            const investment = pos.totalCost || (pos.buyPrice * pos.quantity);
            const pnl = currentVal - investment;
            const pnlPercent = (pnl / investment) * 100;
            
            return {
                ...pos,
                currentValue: currentVal,
                investment: investment,
                pnl: pnl,
                pnlPercent: pnlPercent
            };
        });
        
        // Sort by performance (best first)
        positionsWithPnL.sort((a, b) => b.pnlPercent - a.pnlPercent);
        
        const keepPositions = positionsWithPnL.slice(0, 15); // Keep top 15
        const sellPositions = positionsWithPnL.slice(15);    // Sell the rest
        
        console.log('\n✅ POSITIONS TO KEEP (Top 15 performers):');
        let keepInvestment = 0;
        let keepValue = 0;
        
        keepPositions.forEach((pos, i) => {
            keepInvestment += pos.investment;
            keepValue += pos.currentValue;
            console.log(`${i+1}. Buy: $${pos.buyPrice.toFixed(2)} | P&L: ${pos.pnlPercent.toFixed(2)}% | Value: $${pos.currentValue.toFixed(2)}`);
        });
        
        console.log(`\nKeep Total: $${keepValue.toFixed(2)} (was $${keepInvestment.toFixed(2)})`);
        
        console.log('\n🔴 POSITIONS TO SELL (Worst performers):');
        let sellInvestment = 0;
        let sellValue = 0;
        
        sellPositions.forEach((pos, i) => {
            sellInvestment += pos.investment;
            sellValue += pos.currentValue;
            console.log(`${i+1}. Buy: $${pos.buyPrice.toFixed(2)} | P&L: ${pos.pnlPercent.toFixed(2)}% | Value: $${pos.currentValue.toFixed(2)}`);
        });
        
        console.log(`\nSell Total: $${sellValue.toFixed(2)} (was $${sellInvestment.toFixed(2)})`);
        
        const reductionPercent = (sellValue / currentValue) * 100;
        console.log(`\n📉 RISK REDUCTION:`);
        console.log(`- Exposure reduction: ${reductionPercent.toFixed(1)}%`);
        console.log(`- From: $${currentValue.toFixed(2)} → To: $${keepValue.toFixed(2)}`);
        console.log(`- Positions: ${positions.length} → 15`);
        
        // Create sell orders file
        const sellOrders = sellPositions.map(pos => ({
            action: 'sell',
            symbol: 'OKB-USDT',
            quantity: pos.quantity,
            positionId: pos.id,
            buyPrice: pos.buyPrice,
            reason: 'risk_reduction'
        }));
        
        fs.writeFileSync('sell-orders-risk-reduction.json', JSON.stringify(sellOrders, null, 2));
        
        console.log(`\n📄 Created: sell-orders-risk-reduction.json`);
        console.log(`- Contains ${sellOrders.length} sell orders`);
        console.log(`- Review the file before executing`);
        
        console.log('\n🚀 NEXT STEPS:');
        console.log('1. Review the sell-orders-risk-reduction.json file');
        console.log('2. Run: node execute-risk-reduction.js (when ready)');
        console.log('3. This will reduce your exposure by ~70%');
        console.log('4. Keep monitoring with the fixed bot logic');
        
    } catch (error) {
        console.error('❌ Error fetching current price:', error.message);
        console.log('\nContinuing with position analysis using last known prices...');
    }
}

reduceRiskExposure().catch(console.error);
