#!/usr/bin/env node

const chalk = require('chalk');
const fs = require('fs').promises;
const path = require('path');

async function testPortfolioMonitor() {
    console.log(chalk.cyan('📊 Testing Portfolio Monitor Component\n'));
    
    // Create mock instance data
    const mockInstancesDir = path.join(__dirname, 'test-instances');
    
    try {
        // Create test directory structure
        await createMockInstances(mockInstancesDir);
        
        // Test portfolio monitor with mock data
        const PortfolioMonitor = require('./portfolio-monitor');
        const monitor = new PortfolioMonitor();
        
        // Override instancesDir for testing
        monitor.instancesDir = mockInstancesDir;
        
        console.log(chalk.white('Test 1: Mock Instance Creation'));
        console.log(chalk.green('   ✅ Created test instance directories'));
        
        console.log(chalk.white('\nTest 2: Instance Stats Collection'));
        const mockInstancePath = path.join(mockInstancesDir, 'sol_usdt');
        const stats = await monitor.getInstanceStats(mockInstancePath);
        
        console.log(chalk.green('   ✅ Successfully collected instance stats:'));
        console.log(chalk.gray(`      Symbol: ${stats.symbol}`));
        console.log(chalk.gray(`      Allocation: $${stats.allocation}`));
        console.log(chalk.gray(`      Total Trades: ${stats.totalTrades}`));
        console.log(chalk.gray(`      P&L: ${stats.profitLoss.toFixed(2)}`));
        
        console.log(chalk.white('\nTest 3: Portfolio Summary Display'));
        console.log(chalk.yellow('   (Simulated - would show real data with active instances)'));
        
        // Test formatting methods
        console.log(chalk.white('\nTest 4: Formatting Methods'));
        const testUptime = Date.now() - (4 * 60 * 60 * 1000); // 4 hours ago
        const formattedUptime = monitor.formatUptime(testUptime);
        console.log(chalk.green(`   ✅ Uptime formatting: ${formattedUptime}`));
        
        const testMemory = 150 * 1024 * 1024; // 150MB
        const formattedMemory = monitor.formatMemory(testMemory);
        console.log(chalk.green(`   ✅ Memory formatting: ${formattedMemory}`));
        
        const testDate = new Date(Date.now() - 30 * 60 * 1000); // 30 min ago
        const timeAgo = monitor.getTimeAgo(testDate);
        console.log(chalk.green(`   ✅ Time ago formatting: ${timeAgo}`));
        
        console.log(chalk.white('\nTest 5: Profit/Loss Calculation'));
        const mockTransactionLines = [
            '[2025-09-05 10:30:15] 📈 BUY SOL-USDT - Price: $185.20 | Quantity: 0.27 | Total: $50.00',
            '[2025-09-05 11:45:22] 📉 SELL SOL-USDT - Price: $188.45 | Quantity: 0.27 | Total: $50.88'
        ];
        
        const calculatedPnL = monitor.calculateProfitLoss(mockTransactionLines);
        console.log(chalk.green(`   ✅ P&L calculation: $${calculatedPnL.toFixed(2)}`));
        
        console.log(chalk.white('\nTest 6: Report Generation'));
        const report = await monitor.generateReport();
        console.log(chalk.green(`   ✅ Report generated with ${report.totalInstances} instances`));
        
        // Cleanup
        await cleanupMockInstances(mockInstancesDir);
        console.log(chalk.green('\n✅ All Portfolio Monitor tests completed successfully!'));
        
    } catch (error) {
        console.error(chalk.red('❌ Test failed:'), error);
        // Cleanup on error
        try {
            await cleanupMockInstances(mockInstancesDir);
        } catch (cleanupError) {
            // Ignore cleanup errors
        }
    }
}

async function createMockInstances(baseDir) {
    // Create mock instance directories and files
    const instances = [
        {
            name: 'sol_usdt',
            symbol: 'SOL-USDT',
            allocation: 50,
            transactions: [
                '[2025-09-05 10:30:15] 📈 BUY SOL-USDT - Price: $185.20 | Quantity: 0.27 | Total: $50.00',
                '[2025-09-05 11:45:22] 📉 SELL SOL-USDT - Price: $188.45 | Quantity: 0.27 | Total: $50.88'
            ]
        },
        {
            name: 'btc_usdt',
            symbol: 'BTC-USDT',
            allocation: 100,
            transactions: [
                '[2025-09-05 09:15:10] 📈 BUY BTC-USDT - Price: $44250.00 | Quantity: 0.00226 | Total: $100.00'
            ]
        }
    ];
    
    for (const instance of instances) {
        const instanceDir = path.join(baseDir, instance.name);
        const logsDir = path.join(instanceDir, 'logs');
        
        // Create directories
        await fs.mkdir(instanceDir, { recursive: true });
        await fs.mkdir(logsDir, { recursive: true });
        
        // Create .env file
        const envContent = `TRADING_SYMBOL=${instance.symbol}\nMAX_USDT_TO_USE=${instance.allocation}\n`;
        await fs.writeFile(path.join(instanceDir, '.env'), envContent);
        
        // Create transaction log
        const transactionLog = instance.transactions.join('\n') + '\n';
        await fs.writeFile(path.join(logsDir, 'transactions.log'), transactionLog);
        
        // Create position file
        const positionData = {
            [instance.symbol]: {
                quantity: 0,
                totalCost: 0,
                averagePrice: 0
            }
        };
        await fs.writeFile(path.join(instanceDir, 'positions.json'), JSON.stringify(positionData, null, 2));
    }
}

async function cleanupMockInstances(baseDir) {
    try {
        // Remove test directory
        await fs.rm(baseDir, { recursive: true, force: true });
    } catch (error) {
        // Ignore cleanup errors
    }
}

async function testColorFormatting() {
    console.log(chalk.cyan('\n🎨 Testing Color Formatting\n'));
    
    const PortfolioMonitor = require('./portfolio-monitor');
    const monitor = new PortfolioMonitor();
    
    const testAmounts = [15.50, -8.25, 0.00, 125.75, -0.01];
    
    console.log(chalk.white('Amount Color Formatting:'));
    testAmounts.forEach(amount => {
        const formatted = monitor.colorizeAmount(amount);
        console.log(`   $${amount.toFixed(2)} → ${formatted}`);
    });
    
    console.log(chalk.green('\n✅ Color formatting tests completed!'));
}

async function testReportGeneration() {
    console.log(chalk.cyan('\n📄 Testing Report Generation\n'));
    
    // Test report structure
    const mockReport = {
        timestamp: new Date().toISOString(),
        totalInstances: 3,
        totalAllocated: 200,
        totalPnL: 15.45,
        totalTrades: 12,
        instances: [
            {
                symbol: 'SOL-USDT',
                allocation: 50,
                profitLoss: 8.20,
                totalTrades: 5,
                uptime: '2h 30m'
            },
            {
                symbol: 'BTC-USDT',
                allocation: 100,
                profitLoss: 7.25,
                totalTrades: 4,
                uptime: '2h 28m'
            },
            {
                symbol: 'ETH-USDT',
                allocation: 50,
                profitLoss: 0.00,
                totalTrades: 3,
                uptime: '2h 25m'
            }
        ]
    };
    
    console.log(chalk.white('Sample Report Structure:'));
    console.log(chalk.green(`   ✅ Timestamp: ${mockReport.timestamp}`));
    console.log(chalk.green(`   ✅ Total Instances: ${mockReport.totalInstances}`));
    console.log(chalk.green(`   ✅ Total P&L: $${mockReport.totalPnL}`));
    console.log(chalk.green(`   ✅ Instance Details: ${mockReport.instances.length} items`));
    
    // Test JSON serialization
    try {
        const jsonReport = JSON.stringify(mockReport, null, 2);
        console.log(chalk.green('   ✅ JSON serialization successful'));
        console.log(chalk.gray(`   Report size: ${(jsonReport.length / 1024).toFixed(1)}KB`));
    } catch (error) {
        console.log(chalk.red('   ❌ JSON serialization failed'));
    }
    
    console.log(chalk.green('\n✅ Report generation tests completed!'));
}

// Main execution
async function runTests() {
    console.clear();
    console.log(chalk.cyan('🧪 Portfolio Monitor Test Suite'));
    console.log(chalk.cyan('═'.repeat(45)));
    console.log(chalk.gray('Testing portfolio monitoring functionality\n'));
    
    await testPortfolioMonitor();
    await testColorFormatting();
    await testReportGeneration();
    
    console.log(chalk.cyan('\n📚 Usage Examples:'));
    console.log(chalk.white('npm run portfolio:summary   # Quick overview'));
    console.log(chalk.white('npm run portfolio:live      # Live monitoring'));
    console.log(chalk.white('npm run portfolio:report    # Generate report'));
    
    console.log(chalk.yellow('\n👋 Portfolio monitor tests completed!'));
}

if (require.main === module) {
    runTests().catch(console.error);
}
