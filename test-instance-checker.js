#!/usr/bin/env node

const chalk = require('chalk');
const InstanceChecker = require('./instance-checker');

async function testInstanceChecker() {
    console.log(chalk.cyan('🔍 Testing Instance Checker Component\n'));
    
    const checker = new InstanceChecker();
    
    try {
        // Test 1: Get active PM2 processes
        console.log(chalk.white('Test 1: Checking Active PM2 Processes'));
        console.log(chalk.gray('Running: pm2 jlist...\n'));
        
        const processes = await checker.getActivePM2Processes();
        
        if (processes.length === 0) {
            console.log(chalk.yellow('   ℹ️  No active PM2 processes found'));
            console.log(chalk.gray('   This is normal if no trading bots are running'));
        } else {
            console.log(chalk.green(`   ✅ Found ${processes.length} active PM2 processes:`));
            processes.forEach(proc => {
                console.log(chalk.gray(`      • ${proc.name} (PID: ${proc.pid})`));
            });
        }
        
        // Test 2: Extract symbols from process names
        console.log(chalk.white('\nTest 2: Symbol Extraction from Process Names'));
        const testProcessNames = [
            'trading-bot-sol_usdt',
            'trading-bot-btc_usdt', 
            'trading-bot-eth_usdt',
            'other-app'
        ];
        
        testProcessNames.forEach(name => {
            const symbol = checker.extractSymbolFromProcessName(name);
            if (symbol) {
                console.log(chalk.green(`   ✅ ${name} → ${symbol}`));
            } else {
                console.log(chalk.gray(`   ➖ ${name} → Not a trading bot`));
            }
        });
        
        // Test 3: Active symbols detection
        console.log(chalk.white('\nTest 3: Active Symbols Detection'));
        const activeSymbols = await checker.getActiveSymbols();
        
        if (activeSymbols.length === 0) {
            console.log(chalk.yellow('   ℹ️  No active trading symbols detected'));
        } else {
            console.log(chalk.green(`   ✅ Active trading symbols: ${activeSymbols.join(', ')}`));
        }
        
        // Test 4: Conflict checking simulation
        console.log(chalk.white('\nTest 4: Conflict Detection Simulation'));
        const testSymbols = ['SOL-USDT', 'BTC-USDT', 'ETH-USDT'];
        
        for (const symbol of testSymbols) {
            const hasConflict = await checker.checkSymbolConflict(symbol);
            if (hasConflict) {
                console.log(chalk.red(`   ❌ ${symbol}: Conflict detected (already running)`));
            } else {
                console.log(chalk.green(`   ✅ ${symbol}: Available for trading`));
            }
        }
        
        // Test 5: Instance status overview
        console.log(chalk.white('\nTest 5: Instance Status Overview'));
        try {
            const status = await checker.getInstanceStatus();
            console.log(chalk.cyan('   📊 Status Summary:'));
            console.log(chalk.gray(`      Total processes: ${status.totalProcesses}`));
            console.log(chalk.gray(`      Trading bots: ${status.tradingBots}`));
            console.log(chalk.gray(`      Active symbols: ${status.activeSymbols}`));
            console.log(chalk.gray(`      Memory usage: ${status.totalMemory}MB`));
            
            if (status.conflicts.length > 0) {
                console.log(chalk.red(`      ⚠️  Conflicts: ${status.conflicts.length}`));
            } else {
                console.log(chalk.green(`      ✅ No conflicts`));
            }
        } catch (error) {
            console.log(chalk.yellow(`   ⚠️  Could not get full status: ${error.message}`));
        }
        
        // Test 6: Display method
        console.log(chalk.white('\nTest 6: Display Active Instances'));
        const displayedSymbols = await checker.displayActiveInstances();
        console.log(chalk.cyan(`   Displayed ${displayedSymbols.length} active instances\n`));
        
        console.log(chalk.green('✅ All Instance Checker tests completed successfully!'));
        
    } catch (error) {
        console.error(chalk.red('❌ Test failed:'), error);
        console.log(chalk.yellow('\nThis might be expected if PM2 is not installed or no processes are running.'));
    }
}

// Additional utility test
async function testUtilityMethods() {
    console.log(chalk.cyan('\n🔧 Testing Utility Methods\n'));
    
    const checker = new InstanceChecker();
    
    // Test process name validation
    console.log(chalk.white('Testing Process Name Validation:'));
    const testNames = [
        'trading-bot-sol_usdt',
        'trading-bot-btc_usdt',
        'random-app',
        'pm2-logrotate',
        'trading-bot-invalid_format'
    ];
    
    testNames.forEach(name => {
        const isValid = name.startsWith('trading-bot-') && 
                       name.includes('_') && 
                       name.split('_').length === 2;
        
        console.log(isValid ? 
            chalk.green(`   ✅ ${name}: Valid trading bot process`) :
            chalk.gray(`   ➖ ${name}: Not a trading bot process`)
        );
    });
    
    console.log(chalk.green('\n✅ Utility method tests completed!'));
}

// Main execution
async function runTests() {
    console.clear();
    console.log(chalk.cyan('🧪 Instance Checker Test Suite'));
    console.log(chalk.cyan('═'.repeat(40)));
    console.log(chalk.gray('Testing all instance checking functionality\n'));
    
    await testInstanceChecker();
    await testUtilityMethods();
    
    console.log(chalk.cyan('\n📚 Usage Examples:'));
    console.log(chalk.white('npm run instances:check    # Check current status'));
    console.log(chalk.white('npm run instances:list     # List all instances'));
    console.log(chalk.white('npm run instances:status   # Detailed status'));
    
    console.log(chalk.yellow('\n👋 Test completed! You can now run the actual instance checker.'));
}

if (require.main === module) {
    runTests().catch(console.error);
}
