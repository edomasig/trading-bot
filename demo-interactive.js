#!/usr/bin/env node

/**
 * Demo: Interactive Startup Mode Selector
 * Shows the interactive prompts without actually starting the bot
 */

const StartupModeSelector = require('./startup-mode-selector');
const chalk = require('chalk');

// Mock bot class for demo
class MockBot {
    constructor() {
        this.baseCurrency = 'SOL';
        this.quoteCurrency = 'USDT';
    }

    async getBalances() {
        // Mock balance data for demo
        return {
            SOL: { available: 0.15 },
            USDT: { available: 32.50 }
        };
    }

    async getPrice() {
        // Mock current SOL price
        return 210.50;
    }

    log(message, level = 'INFO') {
        console.log(`[${level}] ${message}`);
    }
}

async function runDemo() {
    try {
        console.log(chalk.magenta('🎭 INTERACTIVE STARTUP MODE SELECTOR - DEMO'));
        console.log(chalk.magenta('=' .repeat(50)));
        console.log(chalk.yellow('This demo shows the interactive prompts without starting the actual bot.\n'));

        // Create mock bot and selector
        const mockBot = new MockBot();
        const selector = new StartupModeSelector();

        // Run the interactive selection
        const result = await selector.run(mockBot);

        console.log(chalk.cyan('\n✅ Demo completed! Selected configuration:'));
        console.log(chalk.cyan('=' .repeat(40)));
        console.log(`Mode: ${result.mode}`);
        if (result.customParams) {
            console.log('Custom Parameters:', result.customParams);
        }
        
        console.log(chalk.green('\n🚀 To use with real bot, run: npm run start:interactive'));
        
    } catch (error) {
        console.error(chalk.red('Demo error:', error.message));
    }
}

// Run demo
runDemo();
