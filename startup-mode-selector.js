const inquirer = require('inquirer');
const chalk = require('chalk');

/**
 * Interactive Startup Mode Selector
 * Allows user to choose bot behavior on startup
 */
class StartupModeSelector {
    constructor() {
        this.modes = {
            AUTO: {
                name: 'AUTO - Smart Analysis',
                description: 'Bot analyzes current holdings and market conditions to make optimal decisions',
                icon: '🧠',
                strategy: 'Balanced approach based on technical analysis'
            },
            SELL_FIRST: {
                name: 'SELL FIRST - Liquidate Holdings',
                description: 'Prioritize selling existing SOL before making new purchases',
                icon: '📈',
                strategy: 'Conservative exit strategy, wait for better sell signals'
            },
            BUY_FIRST: {
                name: 'BUY FIRST - Accumulate Position',
                description: 'Focus on buying opportunities, defer selling existing holdings',
                icon: '📉',
                strategy: 'Aggressive accumulation, build larger SOL position'
            },
            BALANCE: {
                name: 'BALANCE - Rebalance Portfolio',
                description: 'Maintain 50/50 USDT/SOL value split for risk management',
                icon: '⚖️',
                strategy: 'Risk-balanced approach, maintain equal exposure'
            },
            MANUAL: {
                name: 'MANUAL - Custom Configuration',
                description: 'Set custom parameters for this trading session',
                icon: '🎛️',
                strategy: 'User-defined thresholds and behavior'
            }
        };
    }

    /**
     * Display welcome banner
     */
    displayBanner() {
        console.log(chalk.cyan('\n' + '='.repeat(60)));
        console.log(chalk.cyan('🤖 OKX ENHANCED TRADING BOT - STARTUP MODE SELECTOR'));
        console.log(chalk.cyan('='.repeat(60)));
        console.log(chalk.yellow('Choose how the bot should behave when it starts trading:\n'));
    }

    /**
     * Display current account status
     */
    async displayAccountStatus(bot) {
        try {
            console.log(chalk.blue('📊 Current Account Status:'));
            console.log(chalk.blue('-'.repeat(30)));
            
            const balances = await bot.getBalances();
            const solBalance = balances[bot.baseCurrency]?.available || 0;
            const usdtBalance = balances[bot.quoteCurrency]?.available || 0;
            
            const currentPrice = await bot.getPrice();
            const solValue = solBalance * currentPrice;
            const totalValue = usdtBalance + solValue;
            
            console.log(`💰 USDT: ${chalk.green('$' + usdtBalance.toFixed(2))}`);
            console.log(`🪙 SOL: ${chalk.green(solBalance.toFixed(6))} (≈ $${solValue.toFixed(2)})`);
            console.log(`📈 Total Portfolio: ${chalk.bold.green('$' + totalValue.toFixed(2))}`);
            console.log(`💲 Current SOL Price: ${chalk.yellow('$' + currentPrice.toFixed(2))}\n`);
            
            return { solBalance, usdtBalance, currentPrice, totalValue };
        } catch (error) {
            console.log(chalk.red('❌ Error fetching account status:', error.message));
            return null;
        }
    }

    /**
     * Get startup mode selection from user
     */
    async selectStartupMode() {
        const choices = Object.keys(this.modes).map(key => ({
            name: `${this.modes[key].icon} ${this.modes[key].name}`,
            value: key,
            short: key
        }));

        const questions = [
            {
                type: 'list',
                name: 'mode',
                message: 'Select startup trading mode:',
                choices: choices,
                pageSize: 10
            },
            {
                type: 'confirm',
                name: 'showDetails',
                message: 'Would you like to see detailed strategy information?',
                default: true,
                when: (answers) => answers.mode !== 'AUTO'
            }
        ];

        const answers = await inquirer.prompt(questions);
        
        if (answers.showDetails) {
            this.displayModeDetails(answers.mode);
        }

        return answers.mode;
    }

    /**
     * Display detailed information about selected mode
     */
    displayModeDetails(mode) {
        const modeInfo = this.modes[mode];
        console.log(chalk.cyan('\n📋 Strategy Details:'));
        console.log(chalk.cyan('-'.repeat(20)));
        console.log(`${modeInfo.icon} ${chalk.bold(modeInfo.name)}`);
        console.log(`📖 ${modeInfo.description}`);
        console.log(`🎯 ${modeInfo.strategy}\n`);
    }

    /**
     * Get custom parameters for manual mode
     */
    async getCustomParameters() {
        const questions = [
            {
                type: 'number',
                name: 'priceThreshold',
                message: 'Price change threshold (%):', 
                default: 0.3,
                validate: (value) => value > 0 && value < 10 ? true : 'Please enter a value between 0 and 10'
            },
            {
                type: 'number',
                name: 'takeProfitThreshold',
                message: 'Take profit threshold (%):', 
                default: 1.5,
                validate: (value) => value > 0 && value < 20 ? true : 'Please enter a value between 0 and 20'
            },
            {
                type: 'number',
                name: 'maxUsdtPerTrade',
                message: 'Maximum USDT per trade:', 
                default: 42,
                validate: (value) => value > 0 ? true : 'Please enter a positive number'
            },
            {
                type: 'number',
                name: 'checkInterval',
                message: 'Check interval (seconds):', 
                default: 30,
                validate: (value) => value >= 5 && value <= 300 ? true : 'Please enter a value between 5 and 300'
            }
        ];

        return await inquirer.prompt(questions);
    }

    /**
     * Confirm startup configuration
     */
    async confirmConfiguration(mode, accountStatus, customParams = null) {
        console.log(chalk.yellow('\n🔍 Startup Configuration Summary:'));
        console.log(chalk.yellow('='.repeat(40)));
        
        const modeInfo = this.modes[mode];
        console.log(`🎯 Mode: ${modeInfo.icon} ${chalk.bold(modeInfo.name)}`);
        console.log(`📖 Strategy: ${modeInfo.strategy}`);
        
        if (accountStatus) {
            console.log(`💰 Starting Capital: $${accountStatus.totalValue.toFixed(2)}`);
            
            // Provide mode-specific recommendations
            this.displayModeRecommendations(mode, accountStatus);
        }

        if (customParams) {
            console.log('\n⚙️ Custom Parameters:');
            console.log(`   Price Threshold: ${customParams.priceThreshold}%`);
            console.log(`   Take Profit: ${customParams.takeProfitThreshold}%`);
            console.log(`   Max USDT/Trade: $${customParams.maxUsdtPerTrade}`);
            console.log(`   Check Interval: ${customParams.checkInterval}s`);
        }

        const { confirmed } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirmed',
                message: chalk.green('\n✅ Start trading bot with this configuration?'),
                default: true
            }
        ]);

        return confirmed;
    }

    /**
     * Display mode-specific recommendations
     */
    displayModeRecommendations(mode, accountStatus) {
        console.log(chalk.blue('\n💡 Recommendations:'));
        
        const { solBalance, usdtBalance } = accountStatus;
        
        switch (mode) {
            case 'SELL_FIRST':
                if (solBalance > 0.01) {
                    console.log(chalk.green(`   ✅ Good choice! You have ${solBalance.toFixed(4)} SOL to sell`));
                    console.log(`   🎯 Will wait for optimal selling opportunities`);
                } else {
                    console.log(chalk.orange(`   ⚠️ Limited SOL (${solBalance.toFixed(6)}) - may switch to buying mode`));
                }
                break;
                
            case 'BUY_FIRST':
                if (usdtBalance >= 8) {
                    console.log(chalk.green(`   ✅ Good choice! You have $${usdtBalance.toFixed(2)} USDT for buying`));
                    console.log(`   🎯 Will look for accumulation opportunities`);
                } else {
                    console.log(chalk.orange(`   ⚠️ Limited USDT ($${usdtBalance.toFixed(2)}) - may need to sell first`));
                }
                break;
                
            case 'BALANCE':
                const totalValue = usdtBalance + (solBalance * 200); // Rough SOL price estimate
                const usdtRatio = (usdtBalance / totalValue) * 100;
                console.log(`   📊 Current USDT ratio: ${usdtRatio.toFixed(1)}%`);
                
                if (usdtRatio > 60) {
                    console.log(`   🎯 Will prioritize buying SOL to rebalance`);
                } else if (usdtRatio < 40) {
                    console.log(`   🎯 Will prioritize selling SOL to rebalance`);
                } else {
                    console.log(`   ✅ Portfolio is well balanced`);
                }
                break;
                
            case 'AUTO':
                console.log(`   🧠 Bot will analyze current conditions and choose optimal strategy`);
                break;
        }
    }

    /**
     * Main interactive startup flow
     */
    async run(bot) {
        try {
            this.displayBanner();
            
            // Show current account status
            const accountStatus = await this.displayAccountStatus(bot);
            
            // Get mode selection
            const selectedMode = await this.selectStartupMode();
            
            // Get custom parameters if manual mode
            let customParams = null;
            if (selectedMode === 'MANUAL') {
                customParams = await this.getCustomParameters();
            }
            
            // Confirm configuration
            const confirmed = await this.confirmConfiguration(selectedMode, accountStatus, customParams);
            
            if (!confirmed) {
                console.log(chalk.yellow('\n🔄 Restarting mode selection...\n'));
                return await this.run(bot); // Restart selection process
            }
            
            console.log(chalk.green('\n🚀 Starting trading bot with selected configuration...\n'));
            
            return {
                mode: selectedMode,
                accountStatus,
                customParams
            };
            
        } catch (error) {
            console.log(chalk.red('\n❌ Error in startup mode selection:', error.message));
            throw error;
        }
    }
}

module.exports = StartupModeSelector;
