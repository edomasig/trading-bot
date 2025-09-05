#!/usr/bin/env node

/**
 * Interactive Setup + Background Service
 * Provides interactive configuration that saves choices and starts as PM2 background service
 */

const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const chalk = require('chalk');

// Import OKX client for account status
const OKXClient = require('./okx-client');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env') });

class InteractiveSetup {
    constructor() {
        this.envPath = path.join(__dirname, '.env');
        this.backupEnvPath = path.join(__dirname, '.env.backup');
    }

    /**
     * Main interactive setup flow
     */
    async run() {
        try {
            console.log(chalk.blue.bold('\n🎯 Interactive Bot Setup + Background Service\n'));
            console.log(chalk.gray('This will configure your bot and start it as a background service with PM2\n'));

            // Check API credentials first
            const hasCredentials = await this.checkCredentials();
            if (!hasCredentials) {
                console.log(chalk.red('❌ Please configure your API credentials in .env file first'));
                process.exit(1);
            }

            // Show current account status
            await this.showAccountStatus();

            // Get user preferences
            const config = await this.getConfiguration();

            // Backup current .env
            await this.backupEnvironment();

            // Save configuration
            await this.saveConfiguration(config);

            // Confirm setup
            const confirmed = await this.confirmSetup(config);
            if (!confirmed) {
                console.log(chalk.yellow('Setup cancelled. Restoring original configuration.'));
                await this.restoreEnvironment();
                process.exit(0);
            }

            // Start bot as background service
            await this.startBackgroundService();

        } catch (error) {
            console.error(chalk.red('❌ Setup failed:'), error.message);
            await this.restoreEnvironment();
            process.exit(1);
        }
    }

    /**
     * Check if API credentials are configured
     */
    async checkCredentials() {
        return process.env.OKX_API_KEY && 
               process.env.OKX_SECRET_KEY && 
               process.env.OKX_PASSPHRASE;
    }

    /**
     * Show current account status
     */
    async showAccountStatus() {
        try {
            console.log(chalk.cyan('📊 Fetching current account status...\n'));
            
            const client = new OKXClient({
                apiKey: process.env.OKX_API_KEY,
                secretKey: process.env.OKX_SECRET_KEY,
                passphrase: process.env.OKX_PASSPHRASE,
                baseURL: process.env.OKX_BASE_URL || 'https://www.okx.com',
                apiVersion: process.env.OKX_API_VERSION || 'api/v5'
            });

            const balances = await client.getAccountBalance();
            const marketData = await client.getMarketData(process.env.TRADING_SYMBOL || 'SOL-USDT');

            console.log(chalk.green.bold('💰 Current Account Status:'));
            
            // Find relevant balances
            const solBalance = balances.find(b => b.currency === 'SOL') || { available: '0' };
            const usdtBalance = balances.find(b => b.currency === 'USDT') || { available: '0' };
            
            console.log(`   SOL: ${parseFloat(solBalance.available).toFixed(6)} SOL`);
            console.log(`   USDT: $${parseFloat(usdtBalance.available).toFixed(2)} USDT`);
            console.log(`   Current SOL Price: $${parseFloat(marketData.price).toFixed(2)}`);
            
            const solValue = parseFloat(solBalance.available) * parseFloat(marketData.price);
            const totalValue = solValue + parseFloat(usdtBalance.available);
            console.log(`   Total Portfolio Value: $${totalValue.toFixed(2)}\n`);

        } catch (error) {
            console.log(chalk.yellow('⚠️ Could not fetch account status (continuing with setup)'));
            console.log(chalk.gray(`   Reason: ${error.message}\n`));
        }
    }

    /**
     * Get configuration from user
     */
    async getConfiguration() {
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'startupMode',
                message: 'Choose your initial trading strategy:',
                choices: [
                    { 
                        name: '🤖 AUTO - Smart mode (analyzes market conditions automatically)', 
                        value: 'AUTO',
                        short: 'AUTO'
                    },
                    { 
                        name: '📉 SELL_FIRST - Conservative (starts by selling existing positions)', 
                        value: 'SELL_FIRST',
                        short: 'SELL_FIRST'
                    },
                    { 
                        name: '📈 BUY_FIRST - Aggressive (immediately buys opportunities)', 
                        value: 'BUY_FIRST',
                        short: 'BUY_FIRST'
                    },
                    { 
                        name: '⚖️ BALANCE - Balanced (waits for optimal conditions)', 
                        value: 'BALANCE',
                        short: 'BALANCE'
                    },
                    { 
                        name: '🎛️ MANUAL - Custom configuration mode', 
                        value: 'MANUAL',
                        short: 'MANUAL'
                    }
                ],
                default: 'AUTO'
            },
            {
                type: 'list',
                name: 'riskLevel',
                message: 'Select your risk tolerance:',
                choices: [
                    { name: '🛡️ Conservative - Lower risk, steady gains', value: 'CONSERVATIVE' },
                    { name: '⚖️ Moderate - Balanced risk/reward', value: 'MODERATE' },
                    { name: '🚀 Aggressive - Higher risk, higher potential', value: 'AGGRESSIVE' }
                ],
                default: 'MODERATE'
            },
            {
                type: 'confirm',
                name: 'enableNotifications',
                message: 'Enable detailed trade notifications in logs?',
                default: true
            },
            {
                type: 'confirm',
                name: 'autoRestart',
                message: 'Auto-restart bot on system reboot?',
                default: true
            }
        ]);

        return answers;
    }

    /**
     * Backup current environment
     */
    async backupEnvironment() {
        try {
            if (fs.existsSync(this.envPath)) {
                fs.copyFileSync(this.envPath, this.backupEnvPath);
                console.log(chalk.gray('📄 Environment backup created'));
            }
        } catch (error) {
            console.log(chalk.yellow('⚠️ Could not create environment backup'));
        }
    }

    /**
     * Restore environment from backup
     */
    async restoreEnvironment() {
        try {
            if (fs.existsSync(this.backupEnvPath)) {
                fs.copyFileSync(this.backupEnvPath, this.envPath);
                fs.unlinkSync(this.backupEnvPath);
                console.log(chalk.gray('🔄 Environment restored from backup'));
            }
        } catch (error) {
            console.log(chalk.yellow('⚠️ Could not restore environment'));
        }
    }

    /**
     * Save configuration to environment
     */
    async saveConfiguration(config) {
        const timestamp = new Date().toISOString();
        
        // Risk level configurations
        const riskConfigs = {
            CONSERVATIVE: {
                PRICE_CHANGE_THRESHOLD: '0.005',
                TAKE_PROFIT_PERCENTAGE: '0.02',
                STOP_LOSS_PERCENTAGE: '0.015',
                POSITION_SIZE_PERCENTAGE: '0.7'
            },
            MODERATE: {
                PRICE_CHANGE_THRESHOLD: '0.003',
                TAKE_PROFIT_PERCENTAGE: '0.015',
                STOP_LOSS_PERCENTAGE: '0.02',
                POSITION_SIZE_PERCENTAGE: '0.9'
            },
            AGGRESSIVE: {
                PRICE_CHANGE_THRESHOLD: '0.002',
                TAKE_PROFIT_PERCENTAGE: '0.01',
                STOP_LOSS_PERCENTAGE: '0.025',
                POSITION_SIZE_PERCENTAGE: '0.95'
            }
        };

        const riskConfig = riskConfigs[config.riskLevel];
        
        const configLines = [
            '\n# Interactive Setup Configuration',
            `# Generated: ${timestamp}`,
            `STARTUP_MODE=${config.startupMode}`,
            `RISK_LEVEL=${config.riskLevel}`,
            `ENABLE_NOTIFICATIONS=${config.enableNotifications}`,
            `AUTO_RESTART=${config.autoRestart}`,
            '',
            '# Risk-based settings',
            `PRICE_CHANGE_THRESHOLD=${riskConfig.PRICE_CHANGE_THRESHOLD}`,
            `TAKE_PROFIT_PERCENTAGE=${riskConfig.TAKE_PROFIT_PERCENTAGE}`,
            `STOP_LOSS_PERCENTAGE=${riskConfig.STOP_LOSS_PERCENTAGE}`,
            `POSITION_SIZE_PERCENTAGE=${riskConfig.POSITION_SIZE_PERCENTAGE}`,
            ''
        ];

        fs.appendFileSync(this.envPath, configLines.join('\n'));
        console.log(chalk.green('✅ Configuration saved to .env'));
    }

    /**
     * Confirm setup with user
     */
    async confirmSetup(config) {
        console.log(chalk.cyan.bold('\n📋 Configuration Summary:'));
        console.log(`   Strategy: ${chalk.yellow(config.startupMode)}`);
        console.log(`   Risk Level: ${chalk.yellow(config.riskLevel)}`);
        console.log(`   Notifications: ${chalk.yellow(config.enableNotifications ? 'Enabled' : 'Disabled')}`);
        console.log(`   Auto-restart: ${chalk.yellow(config.autoRestart ? 'Enabled' : 'Disabled')}`);

        const { confirmed } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirmed',
                message: 'Start bot with this configuration?',
                default: true
            }
        ]);

        return confirmed;
    }

    /**
     * Start bot as PM2 background service
     */
    async startBackgroundService() {
        console.log(chalk.yellow.bold('\n🚀 Starting bot as background service...\n'));

        return new Promise((resolve, reject) => {
            // First stop any existing instance
            const stopProcess = spawn('pm2', ['stop', 'sol-trading-bot-enhanced'], { 
                stdio: 'pipe',
                shell: true 
            });

            stopProcess.on('close', () => {
                // Now start the enhanced bot
                const startProcess = spawn('npm', ['run', 'pm2:start:enhanced'], { 
                    stdio: 'inherit',
                    shell: true 
                });
                
                startProcess.on('close', (code) => {
                    if (code === 0) {
                        console.log(chalk.green.bold('\n🎉 Bot started successfully as background service!'));
                        console.log(chalk.blue('\n📊 Monitoring Commands:'));
                        console.log(chalk.gray('   npm run pm2:status      - Check bot status'));
                        console.log(chalk.gray('   npm run pm2:logs:live   - View live logs'));
                        console.log(chalk.gray('   npm run pm2:stop        - Stop bot'));
                        console.log(chalk.gray('   npm run pm2:restart     - Restart bot'));
                        
                        // Clean up backup
                        if (fs.existsSync(this.backupEnvPath)) {
                            fs.unlinkSync(this.backupEnvPath);
                        }
                        
                        resolve();
                    } else {
                        reject(new Error('Failed to start bot'));
                    }
                });

                startProcess.on('error', (error) => {
                    reject(error);
                });
            });
        });
    }
}

// Run the interactive setup
const setup = new InteractiveSetup();
setup.run().catch((error) => {
    console.error(chalk.red('\n❌ Setup failed:'), error.message);
    process.exit(1);
});
