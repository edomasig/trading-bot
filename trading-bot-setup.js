#!/usr/bin/env node

const chalk = require('chalk');
const inquirer = require('inquirer');
const MultiInstanceManager = require('./multi-instance-manager');
const InstanceChecker = require('./instance-checker');
const PortfolioMonitor = require('./portfolio-monitor');

class TradingBotSetup {
    constructor() {
        this.manager = new MultiInstanceManager();
        this.checker = new InstanceChecker();
        this.monitor = new PortfolioMonitor();
    }

    async showMainMenu() {
        console.clear();
        console.log(chalk.cyan('🤖 OKX Trading Bot - Multi-Instance Manager'));
        console.log(chalk.cyan('═'.repeat(50)));
        console.log(chalk.white('Welcome to the advanced trading bot management system!\n'));

        // Show current status
        const activeSymbols = await this.checker.displayActiveInstances();
        
        if (activeSymbols.length > 0) {
            console.log(chalk.green(`✅ Currently trading: ${activeSymbols.join(', ')}\n`));
        } else {
            console.log(chalk.gray('No active trading instances.\n'));
        }

        const choices = [
            {
                name: '🚀 Setup New Multi-Instance Trading',
                value: 'setup_multi',
                description: 'Create and start multiple trading instances for different symbols'
            },
            {
                name: '📊 Portfolio Monitor (Live)',
                value: 'monitor_live',
                description: 'Real-time monitoring of all active trading instances'
            },
            {
                name: '📈 Portfolio Summary',
                value: 'monitor_summary',
                description: 'Quick overview of current portfolio performance'
            },
            {
                name: '🔍 Check Instance Status',
                value: 'check_instances',
                description: 'View detailed status of all trading instances'
            },
            {
                name: '⚠️  Conflict Resolution',
                value: 'resolve_conflicts',
                description: 'Check and resolve symbol conflicts between instances'
            },
            {
                name: '🛑 Stop All Instances',
                value: 'stop_all',
                description: 'Safely stop all trading instances'
            },
            {
                name: '📋 Generate Report',
                value: 'generate_report',
                description: 'Create detailed portfolio performance report'
            },
            {
                name: '❌ Exit',
                value: 'exit'
            }
        ];

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: chalk.cyan('What would you like to do?'),
                choices: choices,
                pageSize: 10
            }
        ]);

        await this.handleMenuSelection(answer.action);
    }

    async handleMenuSelection(action) {
        try {
            switch (action) {
                case 'setup_multi':
                    await this.setupMultiInstance();
                    break;
                    
                case 'monitor_live':
                    console.log(chalk.cyan('\n🔴 Starting live portfolio monitor...\n'));
                    console.log(chalk.gray('Press Ctrl+C to return to main menu\n'));
                    await this.monitor.startLiveMonitoring();
                    break;
                    
                case 'monitor_summary':
                    await this.monitor.displayPortfolioSummary();
                    await this.waitForKeypress();
                    break;
                    
                case 'check_instances':
                    await this.checker.displayActiveInstances();
                    await this.waitForKeypress();
                    break;
                    
                case 'resolve_conflicts':
                    await this.resolveConflicts();
                    break;
                    
                case 'stop_all':
                    await this.stopAllInstances();
                    break;
                    
                case 'generate_report':
                    await this.monitor.generateReport();
                    await this.waitForKeypress();
                    break;
                    
                case 'exit':
                    console.log(chalk.yellow('Thanks for using OKX Trading Bot! 👋'));
                    process.exit(0);
                    break;
                    
                default:
                    console.log(chalk.red('Invalid selection'));
            }
            
            // Return to main menu (except for exit and live monitor)
            if (action !== 'exit' && action !== 'monitor_live') {
                await this.showMainMenu();
            }
            
        } catch (error) {
            console.error(chalk.red('Error:'), error);
            await this.waitForKeypress();
            await this.showMainMenu();
        }
    }

    async setupMultiInstance() {
        console.log(chalk.cyan('\n🚀 Multi-Instance Setup Wizard\n'));
        
        // Pre-flight safety check
        console.log(chalk.yellow('Running pre-flight safety checks...\n'));
        
        const activeSymbols = await this.checker.getActiveSymbols();
        
        if (activeSymbols.length > 0) {
            console.log(chalk.yellow('⚠️  Active instances detected:'));
            activeSymbols.forEach(symbol => {
                console.log(chalk.gray(`   - ${symbol}`));
            });
            
            const continueAnswer = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'action',
                    message: chalk.cyan('How would you like to proceed?'),
                    choices: [
                        { name: 'Add new symbols (avoid conflicts)', value: 'add' },
                        { name: 'Replace existing instances', value: 'replace' },
                        { name: 'Cancel setup', value: 'cancel' }
                    ]
                }
            ]);
            
            if (continueAnswer.action === 'cancel') {
                console.log(chalk.yellow('Setup cancelled.'));
                return;
            }
            
            if (continueAnswer.action === 'replace') {
                await this.stopAllInstances();
            }
        }
        
        // Proceed with setup
        console.log(chalk.green('✅ Safety checks passed. Starting setup...\n'));
        
        await this.manager.setupMultipleInstances();
        
        console.log(chalk.green('\n🎉 Setup completed! Use the portfolio monitor to track performance.'));
        await this.waitForKeypress();
    }

    async resolveConflicts() {
        console.log(chalk.cyan('\n🔧 Conflict Resolution Tool\n'));
        
        const activeSymbols = await this.checker.getActiveSymbols();
        
        if (activeSymbols.length === 0) {
            console.log(chalk.green('✅ No active instances - no conflicts possible.'));
            await this.waitForKeypress();
            return;
        }
        
        console.log(chalk.yellow('Checking for conflicts...\n'));
        
        // Check for duplicate symbols
        const symbolCounts = {};
        activeSymbols.forEach(symbol => {
            symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
        });
        
        const duplicates = Object.entries(symbolCounts).filter(([symbol, count]) => count > 1);
        
        if (duplicates.length === 0) {
            console.log(chalk.green('✅ No conflicts detected. All symbols are unique.'));
        } else {
            console.log(chalk.red('⚠️  Conflicts detected:'));
            duplicates.forEach(([symbol, count]) => {
                console.log(chalk.red(`   ${symbol}: ${count} instances`));
            });
            
            const resolveAnswer = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'resolve',
                    message: chalk.cyan('Resolve conflicts by stopping duplicate instances?'),
                    default: true
                }
            ]);
            
            if (resolveAnswer.resolve) {
                for (const [symbol, count] of duplicates) {
                    await this.checker.handleSymbolConflict(symbol, 'stop_duplicates');
                }
                console.log(chalk.green('✅ Conflicts resolved.'));
            }
        }
        
        await this.waitForKeypress();
    }

    async stopAllInstances() {
        console.log(chalk.yellow('\n🛑 Stopping All Trading Instances\n'));
        
        const activeSymbols = await this.checker.getActiveSymbols();
        
        if (activeSymbols.length === 0) {
            console.log(chalk.gray('No active instances to stop.'));
            await this.waitForKeypress();
            return;
        }
        
        console.log(chalk.yellow(`Found ${activeSymbols.length} active instances:`));
        activeSymbols.forEach(symbol => {
            console.log(chalk.gray(`   - ${symbol}`));
        });
        
        const confirmAnswer = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirmed',
                message: chalk.red('Are you sure you want to stop ALL trading instances?'),
                default: false
            }
        ]);
        
        if (confirmAnswer.confirmed) {
            try {
                const { execSync } = require('child_process');
                execSync('pm2 stop trading-bot-*', { stdio: 'inherit' });
                console.log(chalk.green('\n✅ All trading instances stopped successfully.'));
            } catch (error) {
                console.error(chalk.red('Error stopping instances:'), error);
            }
        } else {
            console.log(chalk.yellow('Operation cancelled.'));
        }
        
        await this.waitForKeypress();
    }

    async waitForKeypress() {
        console.log(chalk.gray('\nPress any key to continue...'));
        
        return new Promise(resolve => {
            process.stdin.setRawMode(true);
            process.stdin.resume();
            process.stdin.once('data', () => {
                process.stdin.setRawMode(false);
                process.stdin.pause();
                resolve();
            });
        });
    }

    async displayWelcomeInfo() {
        console.log(chalk.cyan('\n📚 Quick Start Guide:'));
        console.log(chalk.white('1. Setup: Choose "Setup New Multi-Instance Trading"'));
        console.log(chalk.white('2. Monitor: Use "Portfolio Monitor (Live)" for real-time tracking'));
        console.log(chalk.white('3. Manage: Check status and resolve conflicts as needed'));
        console.log(chalk.white('4. Scripts: Use npm scripts for quick access:'));
        console.log(chalk.gray('   npm run multi:setup     - Quick setup'));
        console.log(chalk.gray('   npm run portfolio:live  - Live monitoring'));
        console.log(chalk.gray('   npm run instances:check - Status check'));
        console.log(chalk.gray('   npm run multi:stop      - Stop all\n'));
    }

    async start() {
        try {
            await this.displayWelcomeInfo();
            await this.showMainMenu();
        } catch (error) {
            console.error(chalk.red('Fatal error:'), error);
            process.exit(1);
        }
    }
}

// Export for programmatic use
module.exports = TradingBotSetup;

// CLI usage
if (require.main === module) {
    const setup = new TradingBotSetup();
    setup.start().catch(console.error);
}
