const axios = require('axios');
const crypto = require('crypto');
const chalk = require('chalk');

class BalanceChecker {
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

    async getFundingBalance() {
        const timestamp = Date.now() / 1000;
        const method = 'GET';
        const requestPath = '/api/v5/asset/balances';
        
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
            console.error(chalk.red('Error fetching funding balance:'), error.response?.data || error.message);
            return null;
        }
    }

    async getSpotBalance() {
        const timestamp = Date.now() / 1000;
        const method = 'GET';
        const requestPath = '/api/v5/account/balance?ccy=USDT';
        
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
            console.error(chalk.red('Error fetching spot balance:'), error.response?.data || error.message);
            return null;
        }
    }

    async checkAllBalances() {
        console.log(chalk.cyan('🔍 OKX Balance Investigation'));
        console.log(chalk.cyan('═'.repeat(50)));
        console.log(chalk.yellow('Checking where the bot gets its USDT balance from...\n'));
        
        let totalUSDTFound = 0;
        let availableUSDTFound = 0;

        // 1. Check Trading Account Balance
        console.log(chalk.white('1️⃣  Trading Account (Spot Trading):'));
        const accountBalance = await this.getAccountBalance();
        if (accountBalance?.data?.[0]?.details) {
            let foundUSDT = false;
            accountBalance.data[0].details.forEach(detail => {
                if (detail.ccy === 'USDT' && parseFloat(detail.bal) > 0) {
                    foundUSDT = true;
                    const balance = parseFloat(detail.bal);
                    const available = parseFloat(detail.availBal);
                    const frozen = parseFloat(detail.frozenBal);
                    
                    console.log(chalk.green(`   ✅ USDT Found: ${balance.toFixed(2)} USDT`));
                    console.log(chalk.gray(`      Available: ${available.toFixed(2)} USDT`));
                    console.log(chalk.gray(`      Frozen: ${frozen.toFixed(2)} USDT`));
                    
                    totalUSDTFound += balance;
                    availableUSDTFound += available;
                }
            });
            if (!foundUSDT) {
                console.log(chalk.yellow('   ⚠️  No USDT found in trading account'));
            }
        } else {
            console.log(chalk.red('   ❌ Could not fetch trading account balance'));
        }

        // 2. Check Funding Account Balance
        console.log(chalk.white('\n2️⃣  Funding Account:'));
        const fundingBalance = await this.getFundingBalance();
        if (fundingBalance?.data) {
            const usdtFunding = fundingBalance.data.find(item => item.ccy === 'USDT');
            if (usdtFunding && parseFloat(usdtFunding.bal) > 0) {
                const balance = parseFloat(usdtFunding.bal);
                const available = parseFloat(usdtFunding.availBal);
                const frozen = parseFloat(usdtFunding.frozenBal);
                
                console.log(chalk.green(`   ✅ USDT Found: ${balance.toFixed(2)} USDT`));
                console.log(chalk.gray(`      Available: ${available.toFixed(2)} USDT`));
                console.log(chalk.gray(`      Frozen: ${frozen.toFixed(2)} USDT`));
                
                totalUSDTFound += balance;
                availableUSDTFound += available;
            } else {
                console.log(chalk.yellow('   ⚠️  No USDT found in funding account'));
            }
        } else {
            console.log(chalk.red('   ❌ Could not fetch funding account balance'));
        }

        // 3. Check specific USDT balance
        console.log(chalk.white('\n3️⃣  Spot USDT Balance:'));
        const spotBalance = await this.getSpotBalance();
        if (spotBalance?.data?.[0]?.details) {
            const usdtDetail = spotBalance.data[0].details.find(d => d.ccy === 'USDT');
            if (usdtDetail) {
                const balance = parseFloat(usdtDetail.bal);
                const available = parseFloat(usdtDetail.availBal);
                
                console.log(chalk.green(`   ✅ Spot USDT: ${balance.toFixed(2)} USDT`));
                console.log(chalk.gray(`      Available: ${available.toFixed(2)} USDT`));
            }
        } else {
            console.log(chalk.red('   ❌ Could not fetch spot USDT balance'));
        }

        // Summary
        console.log(chalk.cyan('\n📊 Balance Summary:'));
        console.log(chalk.cyan('═'.repeat(30)));
        console.log(chalk.white(`Total USDT Found: ${totalUSDTFound.toFixed(2)} USDT`));
        console.log(chalk.white(`Available USDT: ${availableUSDTFound.toFixed(2)} USDT`));
        console.log(chalk.gray(`Your Screenshot Shows: ~105.07 USDT`));
        console.log(chalk.gray(`Bot Was Showing: ~141 USDT`));

        // Analysis
        console.log(chalk.cyan('\n🔍 Analysis:'));
        if (totalUSDTFound > 140) {
            console.log(chalk.yellow('   📝 The bot might be reading from multiple accounts'));
            console.log(chalk.yellow('   📝 Or including funding + trading account balances'));
        } else if (Math.abs(totalUSDTFound - 105.07) < 5) {
            console.log(chalk.green('   ✅ API balance matches your screenshot!'));
        } else {
            console.log(chalk.red('   ❌ There\'s still a discrepancy to investigate'));
        }

        // Recommendations
        console.log(chalk.cyan('\n💡 Recommendations:'));
        const recommended = Math.floor(availableUSDTFound * 0.9);
        console.log(chalk.white(`   Recommended MAX_USDT_TO_USE: ${recommended} USDT`));
        console.log(chalk.gray(`   Current setting: ${process.env.MAX_USDT_TO_USE || 'Not set'} USDT`));
        
        if (availableUSDTFound >= 95) {
            console.log(chalk.green('   ✅ Your current setting (95 USDT) looks good!'));
        } else {
            console.log(chalk.yellow(`   ⚠️  Consider lowering to ${recommended} USDT for safety`));
        }

        console.log(chalk.cyan('\n🔧 Next Steps:'));
        console.log(chalk.white('   1. Update MAX_USDT_TO_USE based on available balance'));
        console.log(chalk.white('   2. Consider transferring funds between accounts if needed'));
        console.log(chalk.white('   3. Start trading with the corrected balance'));
    }
}

// Load environment variables
require('dotenv').config();

// Run the balance check
async function main() {
    try {
        const checker = new BalanceChecker();
        await checker.checkAllBalances();
    } catch (error) {
        console.error(chalk.red('\n❌ Balance check failed:'), error.message);
        console.log(chalk.yellow('\nPossible issues:'));
        console.log(chalk.gray('   • Check your API credentials in .env file'));
        console.log(chalk.gray('   • Ensure your API key has trading permissions'));
        console.log(chalk.gray('   • Verify your internet connection'));
    }
}

main();
