#!/usr/bin/env node

/**
 * Demo of Interactive Setup (without actually starting bot)
 */

const inquirer = require('inquirer');
const chalk = require('chalk');

async function demoInteractiveSetup() {
    console.log(chalk.blue.bold('\n🎯 Interactive Setup Demo\n'));
    console.log(chalk.gray('This demo shows the interactive setup process without starting the bot\n'));

    console.log(chalk.green.bold('💰 Demo Account Status:'));
    console.log('   SOL: 0.205 SOL');
    console.log('   USDT: $36.72 USDT');
    console.log('   Current SOL Price: $203.50');
    console.log('   Total Portfolio Value: $78.44\n');

    // Get user preferences
    const config = await inquirer.prompt([
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

    console.log(chalk.cyan.bold('\n📋 Configuration Summary:'));
    console.log(`   Strategy: ${chalk.yellow(config.startupMode)}`);
    console.log(`   Risk Level: ${chalk.yellow(config.riskLevel)}`);
    console.log(`   Notifications: ${chalk.yellow(config.enableNotifications ? 'Enabled' : 'Disabled')}`);
    console.log(`   Auto-restart: ${chalk.yellow(config.autoRestart ? 'Enabled' : 'Disabled')}`);

    const { confirmed } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirmed',
            message: 'Would you start the bot with this configuration?',
            default: true
        }
    ]);

    if (confirmed) {
        console.log(chalk.green.bold('\n🎉 Perfect! In the real setup, the bot would now:'));
        console.log(chalk.gray('   1. Save this configuration to .env'));
        console.log(chalk.gray('   2. Start as PM2 background service'));
        console.log(chalk.gray('   3. Apply your chosen risk settings'));
        console.log(chalk.gray('   4. Begin trading with position tracking'));
        console.log(chalk.blue('\n📝 To use the real setup: npm run interactive:setup'));
    } else {
        console.log(chalk.yellow('\n📝 No problem! You can run this anytime with: npm run interactive:setup'));
    }
}

demoInteractiveSetup().catch(console.error);
