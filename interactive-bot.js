#!/usr/bin/env node

/**
 * Interactive Enhanced Trading Bot Launcher
 * Provides startup mode selection and configuration
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const CryptoTradingBot = require('./enhanced-bot');
const StartupModeSelector = require('./startup-mode-selector');
const chalk = require('chalk');

class InteractiveBotLauncher {
    constructor() {
        this.bot = null;
        this.startupConfig = null;
    }

    /**
     * Apply startup mode configuration to bot
     */
    applyStartupMode(mode, customParams = null) {
        console.log(chalk.blue(`🔧 Configuring bot for ${mode} mode...`));
        
        switch (mode) {
            case 'SELL_FIRST':
                this.configureSellFirstMode();
                break;
                
            case 'BUY_FIRST':
                this.configureBuyFirstMode();
                break;
                
            case 'BALANCE':
                this.configureBalanceMode();
                break;
                
            case 'MANUAL':
                this.configureManualMode(customParams);
                break;
                
            case 'AUTO':
            default:
                this.configureAutoMode();
                break;
        }
    }

    /**
     * Configure sell-first mode
     */
    configureSellFirstMode() {
        console.log(chalk.yellow('📈 SELL FIRST MODE: Prioritizing existing position liquidation'));
        
        // Store original settings
        this.originalSettings = {
            priceChangeThreshold: process.env.PRICE_CHANGE_THRESHOLD,
            takeProfitPercentage: process.env.TAKE_PROFIT_PERCENTAGE
        };
        
        // Modify behavior for sell-first
        process.env.STARTUP_MODE = 'SELL_FIRST';
        process.env.SELL_FIRST_PATIENCE = '300'; // Wait 5 minutes for better sell price
        process.env.TAKE_PROFIT_PERCENTAGE = '0.012'; // Slightly lower take profit for quicker sells
        
        console.log('   ✅ Configured for patient selling strategy');
        console.log('   ⏳ Will wait up to 5 minutes for better sell prices');
        console.log('   🎯 Take profit lowered to 1.2% for quicker exits');
    }

    /**
     * Configure buy-first mode
     */
    configureBuyFirstMode() {
        console.log(chalk.green('📉 BUY FIRST MODE: Prioritizing position accumulation'));
        
        process.env.STARTUP_MODE = 'BUY_FIRST';
        process.env.BUY_FIRST_AGGRESSION = '1.3'; // 30% more aggressive buying
        process.env.PRICE_CHANGE_THRESHOLD = '0.0025'; // More sensitive to buying opportunities
        
        console.log('   ✅ Configured for aggressive accumulation');
        console.log('   📉 More sensitive to buying opportunities (0.25% threshold)');
        console.log('   🎯 Will defer selling until accumulation targets met');
    }

    /**
     * Configure balance mode
     */
    configureBalanceMode() {
        console.log(chalk.blue('⚖️ BALANCE MODE: Maintaining 50/50 portfolio split'));
        
        process.env.STARTUP_MODE = 'BALANCE';
        process.env.BALANCE_TARGET_RATIO = '0.5'; // 50% target
        process.env.BALANCE_TOLERANCE = '0.1'; // 10% tolerance
        process.env.REBALANCE_CHECK_INTERVAL = '180'; // Check every 3 minutes
        
        console.log('   ✅ Configured for balanced risk management');
        console.log('   ⚖️ Target: 50% USDT / 50% SOL value');
        console.log('   📊 Rebalance when deviation > 10%');
    }

    /**
     * Configure manual mode
     */
    configureManualMode(customParams) {
        console.log(chalk.magenta('🎛️ MANUAL MODE: Using custom parameters'));
        
        process.env.STARTUP_MODE = 'MANUAL';
        process.env.PRICE_CHANGE_THRESHOLD = (customParams.priceThreshold / 100).toString();
        process.env.TAKE_PROFIT_PERCENTAGE = (customParams.takeProfitThreshold / 100).toString();
        process.env.MAX_USDT_TO_USE = customParams.maxUsdtPerTrade.toString();
        process.env.CHECK_INTERVAL_SECONDS = customParams.checkInterval.toString();
        
        console.log('   ✅ Applied custom configuration:');
        console.log(`   📊 Price threshold: ${customParams.priceThreshold}%`);
        console.log(`   🎯 Take profit: ${customParams.takeProfitThreshold}%`);
        console.log(`   💰 Max USDT/trade: $${customParams.maxUsdtPerTrade}`);
        console.log(`   ⏰ Check interval: ${customParams.checkInterval}s`);
    }

    /**
     * Configure auto mode (default behavior)
     */
    configureAutoMode() {
        console.log(chalk.cyan('🧠 AUTO MODE: Smart analysis-based trading'));
        
        process.env.STARTUP_MODE = 'AUTO';
        console.log('   ✅ Using optimal settings from .env file');
        console.log('   🧠 Bot will analyze market conditions automatically');
    }

    /**
     * Display startup summary
     */
    displayStartupSummary(config) {
        console.log(chalk.cyan('\n' + '='.repeat(50)));
        console.log(chalk.cyan('🚀 TRADING BOT STARTUP SUMMARY'));
        console.log(chalk.cyan('='.repeat(50)));
        
        if (config.accountStatus) {
            const { solBalance, usdtBalance, currentPrice, totalValue } = config.accountStatus;
            console.log(`💰 Starting Capital: ${chalk.bold.green('$' + totalValue.toFixed(2))}`);
            console.log(`🪙 SOL Holdings: ${chalk.yellow(solBalance.toFixed(6))} SOL`);
            console.log(`💵 USDT Balance: ${chalk.green('$' + usdtBalance.toFixed(2))}`);
            console.log(`📈 SOL Price: ${chalk.blue('$' + currentPrice.toFixed(2))}`);
        }
        
        console.log(`🎯 Trading Mode: ${chalk.bold(config.mode)}`);
        console.log(`⏰ Started: ${chalk.gray(new Date().toLocaleString())}`);
        console.log(chalk.cyan('='.repeat(50) + '\n'));
    }

    /**
     * Handle graceful shutdown
     */
    setupGracefulShutdown() {
        const shutdown = (signal) => {
            console.log(chalk.yellow(`\n🛑 Received ${signal}. Shutting down gracefully...`));
            
            if (this.bot && this.bot.stopBot) {
                this.bot.stopBot();
            }
            
            console.log(chalk.green('✅ Trading bot stopped safely.'));
            process.exit(0);
        };

        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));
    }

    /**
     * Main launch sequence
     */
    async launch() {
        try {
            console.clear();
            
            // Create bot instance
            const EnhancedBot = require('./enhanced-bot');
            this.bot = new EnhancedBot();
            
            // Run interactive startup mode selection
            const selector = new StartupModeSelector();
            this.startupConfig = await selector.run(this.bot);
            
            // Apply selected startup mode
            this.applyStartupMode(this.startupConfig.mode, this.startupConfig.customParams);
            
            // Display startup summary
            this.displayStartupSummary(this.startupConfig);
            
            // Setup graceful shutdown
            this.setupGracefulShutdown();
            
            // Start the trading bot
            console.log(chalk.green('🎯 Initializing trading engine...\n'));
            await this.bot.runBot();
            
        } catch (error) {
            console.error(chalk.red('❌ Fatal error during bot launch:'), error.message);
            process.exit(1);
        }
    }
}

// Only run if this file is executed directly
if (require.main === module) {
    const launcher = new InteractiveBotLauncher();
    launcher.launch();
}

module.exports = InteractiveBotLauncher;
