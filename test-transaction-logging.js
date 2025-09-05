/**
 * Test script to verify enhanced transaction logging functionality
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const fsPromises = require('fs').promises;

class TestTransactionLogging {
    constructor() {
        this.transactionLogFile = path.join(__dirname, 'logs', 'transactions.log');
        this.tradeLogFile = path.join(__dirname, 'logs', 'trades-only.log');
    }

    async ensureLogDirectory() {
        try {
            await fsPromises.mkdir(path.join(__dirname, 'logs'), { recursive: true });
        } catch (error) {
            // Directory already exists
        }
    }

    async logTransaction(type, data, isStopLoss = false) {
        const timestamp = new Date().toISOString();
        
        // Determine transaction type with stop loss indicator
        const transactionType = isStopLoss ? `${type}_STOP_LOSS` : type;
        const emoji = type === 'BUY' ? '📈' : (isStopLoss ? '🛑' : '📉');
        const typeLabel = isStopLoss ? `${emoji} ${type} (STOP LOSS)` : `${emoji} ${type}`;
        
        const logEntry = {
            timestamp,
            type: transactionType,
            isStopLoss,
            ...data
        };
        
        // JSON format for data analysis
        const jsonLogLine = `${timestamp} | ${transactionType} | ${JSON.stringify(data)}\n`;
        
        // Human readable format
        const humanReadable = `${timestamp} | ${typeLabel} | Price: $${data.price} | Amount: ${data.amount} | Value: $${data.value}${data.profit ? ` | Profit: ${data.profit}` : ''}${isStopLoss ? ' | ⚠️ TRIGGERED BY STOP LOSS' : ''}\n`;
        
        try {
            // Write to both JSON format and human-readable format
            await fsPromises.appendFile(this.transactionLogFile, jsonLogLine);
            await fsPromises.appendFile(this.tradeLogFile, humanReadable);
            
            console.log(`📝 Transaction logged: ${typeLabel} at $${data.price}`);
        } catch (error) {
            console.error('❌ Failed to write transaction log:', error);
        }
    }

    async runTest() {
        console.log('🧪 Testing Enhanced Transaction Logging...\n');
        
        await this.ensureLogDirectory();

        // Test BUY transaction
        console.log('Testing BUY transaction...');
        await this.logTransaction('BUY', {
            price: '205.50',
            amount: '0.228610 SOL',
            value: '$47.00',
            orderId: 'test-buy-001',
            usdtSpent: 47.00,
            solReceived: 0.228610
        });

        // Test regular SELL transaction
        console.log('Testing regular SELL transaction...');
        await this.logTransaction('SELL', {
            price: '207.75',
            amount: '0.228610 SOL',
            value: '$47.53',
            orderId: 'test-sell-001',
            profit: '1.10%',
            profitUSD: '$0.53',
            avgCost: '$205.50',
            solSold: 0.228610,
            usdtReceived: 47.53
        });

        // Test STOP LOSS SELL transaction
        console.log('Testing STOP LOSS SELL transaction...');
        await this.logTransaction('SELL', {
            price: '200.25',
            amount: '0.228610 SOL',
            value: '$45.78',
            orderId: 'test-sell-002',
            profit: '-2.56%',
            profitUSD: '-$1.22',
            avgCost: '$205.50',
            solSold: 0.228610,
            usdtReceived: 45.78
        }, true); // isStopLoss = true

        console.log('\n✅ Test completed! Check the log files:');
        console.log(`📄 JSON logs: ${this.transactionLogFile}`);
        console.log(`📖 Human readable: ${this.tradeLogFile}`);
        console.log('\n📊 Use these commands to view logs:');
        console.log('npm run logs:transactions');
        console.log('npm run logs:transactions:json');
        console.log('npm run logs:transactions:all');
    }
}

const test = new TestTransactionLogging();
test.runTest().catch(console.error);
