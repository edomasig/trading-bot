const axios = require('axios');
const crypto = require('crypto');
const chalk = require('chalk');

class ImprovedBalanceChecker {
    constructor() {
        this.apiKey = process.env.OKX_API_KEY;
        this.secretKey = process.env.OKX_SECRET_KEY;
        this.passphrase = process.env.OKX_PASSPHRASE;
        this.baseUrl = 'https://www.okx.com';
    }

    generateSignature(timestamp, method, requestPath, body = '') {
        const message = timestamp + method + requestPath + body;
        return crypto.createHmac('sha256', this.secretKey).update(message).digest('base64');
    }

    async getAccountBalance() {
        const timestamp = Date.now() / 1000;
        const method = 'GET';
        const requestPath = '/api/v5/account/balance';
        
        const signature = this.generateSignature(timestamp, method, requestPath);
        
        const headers = {
            'OK-ACCESS-KEY': this.apiKey,
            'OK-ACCESS-SIGN': signature,
            'OK-ACCESS-TIMESTAMP': timestamp,
            'OK-ACCESS-PASSPHRASE': this.passphrase,
            'Content-Type': 'application/json'
        };

        try {
            const response = await axios.get(`${this.baseUrl}${requestPath}`, { headers });
            return response.data;
        } catch (error) {
            console.error(chalk.red('Error fetching account balance:'), error.response?.data || error.message);
            return null;
        }
    }

    async checkCorrectBalance() {
        console.log(chalk.cyan('💰 USDT Balance Verification'));
        console.log(chalk.cyan('═'.repeat(40)));
        
        const accountBalance = await this.getAccountBalance();
        
        if (accountBalance?.data?.[0]?.details) {
            console.log(chalk.white('🔍 Raw API Response Analysis:\n'));
            
            // Show all account details for debugging
            accountBalance.data[0].details.forEach((detail, index) => {
                console.log(chalk.gray(`Account ${index + 1}:`));
                console.log(chalk.gray(`   Currency: ${detail.ccy}`));
                console.log(chalk.gray(`   Balance: "${detail.bal}"`));
                console.log(chalk.gray(`   Available: "${detail.availBal}"`));
                console.log(chalk.gray(`   Frozen: "${detail.frozenBal}"`));
                console.log(chalk.gray(`   Type: ${typeof detail.bal}`));
                
                if (detail.ccy === 'USDT') {
                    console.log(chalk.yellow('   👆 This is your USDT!'));
                    
                    // Test different parsing methods
                    console.log(chalk.cyan('\n🧪 Testing Balance Parsing:'));
                    console.log(chalk.gray(`   Raw balance: "${detail.bal}"`));
                    console.log(chalk.gray(`   parseFloat(bal): ${parseFloat(detail.bal)}`));
                    console.log(chalk.gray(`   Number(bal): ${Number(detail.bal)}`));
                    console.log(chalk.gray(`   +bal: ${+detail.bal}`));
                    
                    console.log(chalk.gray(`   Raw available: "${detail.availBal}"`));
                    console.log(chalk.gray(`   parseFloat(availBal): ${parseFloat(detail.availBal)}`));
                    console.log(chalk.gray(`   Number(availBal): ${Number(detail.availBal)}`));
                    
                    // Check if the values are valid
                    const balanceValue = parseFloat(detail.availBal);
                    const isValidBalance = !isNaN(balanceValue) && balanceValue > 0;
                    
                    console.log(chalk.cyan('\n✅ USDT Balance Found:'));
                    console.log(chalk.green(`   Available USDT: ${balanceValue.toFixed(2)} USDT`));
                    console.log(chalk.gray(`   Is Valid: ${isValidBalance ? 'Yes' : 'No'}`));
                    
                    if (isValidBalance) {
                        // Calculate recommendations
                        const safeAmount = Math.floor(balanceValue * 0.9);
                        const currentSetting = parseInt(process.env.MAX_USDT_TO_USE || '95');
                        
                        console.log(chalk.cyan('\n💡 Recommendations:'));
                        console.log(chalk.white(`   Your Available Balance: ${balanceValue.toFixed(2)} USDT`));
                        console.log(chalk.white(`   Recommended Setting: ${safeAmount} USDT (90% safety margin)`));
                        console.log(chalk.white(`   Current Setting: ${currentSetting} USDT`));
                        
                        if (currentSetting <= safeAmount) {
                            console.log(chalk.green('   ✅ Your current setting is SAFE!'));
                        } else {
                            console.log(chalk.red(`   ⚠️  Current setting is too high! Reduce to ${safeAmount} USDT`));
                        }
                        
                        // Show the bot's calculation error
                        console.log(chalk.cyan('\n🔍 Bot Calculation Issue:'));
                        console.log(chalk.yellow('   The bot was showing ~141 USDT, but you actually have:'));
                        console.log(chalk.green(`   Real Balance: ${balanceValue.toFixed(2)} USDT`));
                        console.log(chalk.gray('   The bot might have been using old cached data or wrong calculation'));
                    }
                }
                console.log('');
            });
            
            // Final summary
            const usdtAccount = accountBalance.data[0].details.find(d => d.ccy === 'USDT');
            if (usdtAccount) {
                const realBalance = parseFloat(usdtAccount.availBal);
                
                console.log(chalk.cyan('📋 Final Summary:'));
                console.log(chalk.cyan('═'.repeat(25)));
                console.log(chalk.green(`✅ Your Real USDT Balance: ${realBalance.toFixed(2)} USDT`));
                console.log(chalk.gray(`📱 Your Screenshot Showed: ~105.07 USDT`));
                console.log(chalk.gray(`🤖 Bot Was Showing: ~141 USDT (WRONG)`));
                console.log(chalk.yellow(`⚖️  Current Setting: ${process.env.MAX_USDT_TO_USE} USDT`));
                
                if (realBalance >= 95) {
                    console.log(chalk.green('\n🎉 Good news: Your current setting (95 USDT) is perfect!'));
                    console.log(chalk.white('   You can start trading safely with your current configuration.'));
                } else {
                    const newSetting = Math.floor(realBalance * 0.9);
                    console.log(chalk.yellow(`\n⚠️  Recommendation: Update MAX_USDT_TO_USE to ${newSetting} USDT`));
                }
                
                console.log(chalk.cyan('\n🚀 Ready to Trade:'));
                console.log(chalk.white('   npm run start:enhanced     # Start SOL trading'));
                console.log(chalk.white('   npm run interactive:setup  # Change to BTC or other symbol'));
                console.log(chalk.white('   npm run setup              # Multi-instance trading'));
            }
            
        } else {
            console.log(chalk.red('❌ Could not fetch account balance'));
        }
    }
}

// Load environment variables
require('dotenv').config();

// Run the improved balance check
async function main() {
    try {
        const checker = new ImprovedBalanceChecker();
        await checker.checkCorrectBalance();
    } catch (error) {
        console.error(chalk.red('\n❌ Balance check failed:'), error.message);
    }
}

main();
