const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { execSync } = require('child_process');
const InstanceChecker = require('./instance-checker');

class MultiInstanceManager {
    constructor() {
        this.instancesDir = path.join(__dirname, 'instances');
        this.configTemplate = path.join(__dirname, '.env');
        this.checker = new InstanceChecker();
        this.supportedSymbols = [
            'SOL-USDT', 'BTC-USDT', 'ETH-USDT', 'BNB-USDT', 
            'ADA-USDT', 'DOT-USDT', 'AVAX-USDT', 'MATIC-USDT',
            'LINK-USDT', 'UNI-USDT'
        ];
    }

    async ensureInstancesDirectory() {
        try {
            await fs.mkdir(this.instancesDir, { recursive: true });
            await fs.mkdir(path.join(this.instancesDir, 'logs'), { recursive: true });
            await fs.mkdir(path.join(this.instancesDir, 'positions'), { recursive: true });
        } catch (error) {
            console.error('Error creating directories:', error);
        }
    }

    async createInstanceConfig(symbol, allocation, riskLevel = 'MODERATE') {
        const instanceName = symbol.toLowerCase().replace('-', '_');
        const instanceDir = path.join(this.instancesDir, instanceName);
        
        await fs.mkdir(instanceDir, { recursive: true });
        await fs.mkdir(path.join(instanceDir, 'logs'), { recursive: true });
        
        // Read template config
        const templateConfig = await fs.readFile(this.configTemplate, 'utf8');
        
        // Symbol-specific settings
        const symbolSettings = this.getSymbolSettings(symbol, allocation, riskLevel);
        
        // Create instance-specific config
        let instanceConfig = templateConfig;
        
        // Replace key settings
        instanceConfig = instanceConfig.replace(
            /TRADING_SYMBOL=.*/,
            `TRADING_SYMBOL=${symbol}`
        );
        instanceConfig = instanceConfig.replace(
            /MAX_USDT_TO_USE=.*/,
            `MAX_USDT_TO_USE=${allocation}`
        );
        instanceConfig = instanceConfig.replace(
            /PRICE_CHANGE_THRESHOLD=.*/,
            `PRICE_CHANGE_THRESHOLD=${symbolSettings.threshold}`
        );
        instanceConfig = instanceConfig.replace(
            /TAKE_PROFIT_PERCENTAGE=.*/,
            `TAKE_PROFIT_PERCENTAGE=${symbolSettings.takeProfit}`
        );
        
        // Add instance-specific settings
        instanceConfig += `\n# Instance Specific Settings\n`;
        instanceConfig += `INSTANCE_NAME=${instanceName}\n`;
        instanceConfig += `POSITION_FILE=./positions.json\n`;
        instanceConfig += `TRANSACTION_LOG=./logs/transactions.log\n`;
        instanceConfig += `TRADES_LOG=./logs/trades-only.log\n`;
        
        // Write instance config
        const configPath = path.join(instanceDir, '.env');
        await fs.writeFile(configPath, instanceConfig);
        
        // Copy enhanced-bot.js to instance directory
        const botSource = path.join(__dirname, 'enhanced-bot.js');
        const botDest = path.join(instanceDir, 'enhanced-bot.js');
        await fs.copyFile(botSource, botDest);
        
        // Copy required modules
        const requiredFiles = [
            'okx-client.js',
            'technical-analysis.js', 
            'risk-manager.js',
            'position-tracker.js'
        ];
        
        for (const file of requiredFiles) {
            try {
                const source = path.join(__dirname, file);
                const dest = path.join(instanceDir, file);
                await fs.copyFile(source, dest);
            } catch (error) {
                console.warn(`Warning: Could not copy ${file}:`, error.message);
            }
        }
        
        return { instanceName, configPath, instanceDir };
    }

    getSymbolSettings(symbol, allocation, riskLevel) {
        const symbolDefaults = {
            'SOL-USDT': { threshold: '0.003', takeProfit: '0.015', volatility: 'moderate' },
            'BTC-USDT': { threshold: '0.005', takeProfit: '0.01', volatility: 'low' },
            'ETH-USDT': { threshold: '0.004', takeProfit: '0.012', volatility: 'moderate' },
            'BNB-USDT': { threshold: '0.004', takeProfit: '0.013', volatility: 'moderate' },
            'ADA-USDT': { threshold: '0.003', takeProfit: '0.018', volatility: 'high' },
            'DOT-USDT': { threshold: '0.003', takeProfit: '0.017', volatility: 'high' },
            'AVAX-USDT': { threshold: '0.003', takeProfit: '0.016', volatility: 'high' },
            'MATIC-USDT': { threshold: '0.004', takeProfit: '0.014', volatility: 'moderate' },
            'LINK-USDT': { threshold: '0.004', takeProfit: '0.013', volatility: 'moderate' },
            'UNI-USDT': { threshold: '0.003', takeProfit: '0.017', volatility: 'high' }
        };

        const defaults = symbolDefaults[symbol] || symbolDefaults['SOL-USDT'];
        
        // Adjust based on risk level
        const riskMultipliers = {
            'CONSERVATIVE': { threshold: 1.5, takeProfit: 1.3 },
            'MODERATE': { threshold: 1.0, takeProfit: 1.0 },
            'AGGRESSIVE': { threshold: 0.7, takeProfit: 0.8 }
        };
        
        const multiplier = riskMultipliers[riskLevel];
        
        return {
            threshold: (parseFloat(defaults.threshold) * multiplier.threshold).toFixed(4),
            takeProfit: (parseFloat(defaults.takeProfit) * multiplier.takeProfit).toFixed(4),
            volatility: defaults.volatility
        };
    }

    async createPM2Config(instances) {
        const pm2Config = {
            apps: instances.map(instance => ({
                name: `trading-bot-${instance.instanceName}`,
                script: './enhanced-bot.js',
                cwd: instance.instanceDir,
                env_file: `./.env`,
                instances: 1,
                autorestart: true,
                watch: false,
                max_memory_restart: '200M',
                log_file: `./logs/${instance.instanceName}-combined.log`,
                out_file: `./logs/${instance.instanceName}-out.log`,
                error_file: `./logs/${instance.instanceName}-error.log`,
                time: true,
                env: {
                    NODE_ENV: 'production',
                    INSTANCE_NAME: instance.instanceName
                }
            }))
        };

        const configPath = path.join(this.instancesDir, 'pm2.config.js');
        const configContent = `module.exports = ${JSON.stringify(pm2Config, null, 2)};`;
        
        await fs.writeFile(configPath, configContent);
        return configPath;
    }

    async setupMultipleInstances() {
        console.log(chalk.cyan('🚀 Multi-Instance Trading Bot Setup\n'));
        
        await this.ensureInstancesDirectory();
        
        // Show current active instances first
        const activeSymbols = await this.checker.displayActiveInstances();
        
        if (activeSymbols.length > 0) {
            console.log(chalk.cyan('Current active symbols: ') + chalk.yellow(activeSymbols.join(', ')));
            
            const continueAnswer = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'continue',
                    message: chalk.cyan('Continue with setup? (Will check for conflicts)'),
                    default: true
                }
            ]);
            
            if (!continueAnswer.continue) {
                console.log(chalk.yellow('Setup cancelled.'));
                return;
            }
        }
        
        // Get total available USDT
        const totalUSDT = await this.getTotalUSDT();
        console.log(chalk.green(`💰 Available USDT: $${totalUSDT}\n`));
        
        // Select symbols (filter out active ones by default)
        const selectedSymbols = await this.selectMultipleSymbols(activeSymbols);
        
        if (selectedSymbols.length === 0) {
            console.log(chalk.yellow('No symbols selected.'));
            return;
        }
        
        // Allocate budget
        const allocations = await this.allocateBudget(selectedSymbols, totalUSDT);
        
        // Pre-flight check for conflicts
        const preFlightResults = await this.checker.preFlightCheck(selectedSymbols, allocations);
        
        // Handle conflicts
        const resolvedSymbols = await this.resolveConflicts(selectedSymbols, preFlightResults);
        
        if (resolvedSymbols.length === 0) {
            console.log(chalk.yellow('No instances to create after conflict resolution.'));
            return;
        }
        
        // Select risk levels for remaining symbols
        const riskSettings = await this.selectRiskLevels(resolvedSymbols);
        
        // Create instances
        console.log(chalk.cyan('\n🔧 Creating trading instances...\n'));
        
        const instances = [];
        for (const symbol of resolvedSymbols) {
            const allocation = allocations[symbol];
            const riskLevel = riskSettings[symbol];
            
            console.log(chalk.yellow(`Creating instance for ${symbol}...`));
            
            const instance = await this.createInstanceConfig(symbol, allocation, riskLevel);
            instances.push(instance);
            
            console.log(chalk.green(`✅ ${symbol}: $${allocation} USDT allocated`));
        }
        
        // Create PM2 configuration
        const pm2ConfigPath = await this.createPM2Config(instances);
        
        // Display summary
        await this.displaySetupSummary(instances, allocations, riskSettings);
        
        // Ask for final confirmation
        const confirmed = await this.confirmSetup();
        
        if (confirmed) {
            await this.startInstances(pm2ConfigPath);
        }
        
        return instances;
    }

    async selectMultipleSymbols(activeSymbols = []) {
        const availableSymbols = this.supportedSymbols.filter(symbol => 
            !activeSymbols.includes(symbol)
        );
        
        if (availableSymbols.length === 0) {
            console.log(chalk.yellow('All supported symbols are already active.'));
            
            const overrideAnswer = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'override',
                    message: chalk.cyan('Do you want to replace existing instances?'),
                    default: false
                }
            ]);
            
            if (overrideAnswer.override) {
                // Allow selection of all symbols for replacement
                availableSymbols.push(...this.supportedSymbols);
            } else {
                return [];
            }
        }
        
        console.log(chalk.cyan('\n📊 Available Symbols:'));
        if (activeSymbols.length > 0) {
            console.log(chalk.gray(`Active: ${activeSymbols.join(', ')}`));
        }
        
        const answers = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'symbols',
                message: chalk.cyan('Select trading symbols (use spacebar to select, enter to confirm):'),
                choices: this.supportedSymbols.map(symbol => {
                    const isActive = activeSymbols.includes(symbol);
                    return {
                        name: isActive ? `${symbol} (⚠️ Currently Active)` : symbol,
                        value: symbol,
                        checked: false
                    };
                }),
                validate: (input) => {
                    if (input.length === 0) {
                        return 'Please select at least one symbol';
                    }
                    if (input.length > 5) {
                        return 'Maximum 5 symbols recommended for stability';
                    }
                    return true;
                }
            }
        ]);
        
        return answers.symbols;
    }

    async resolveConflicts(selectedSymbols, preFlightResults) {
        if (preFlightResults.conflicts.length === 0) {
            return selectedSymbols; // No conflicts
        }
        
        console.log(chalk.cyan('\n🔧 Resolving Conflicts...\n'));
        
        const resolvedSymbols = [];
        
        for (const symbol of selectedSymbols) {
            const conflict = preFlightResults.conflicts.find(c => c.symbol === symbol);
            
            if (!conflict) {
                resolvedSymbols.push(symbol);
                continue;
            }
            
            // Handle conflict for this symbol
            const resolution = await this.checker.handleSymbolConflict(symbol, 'ask');
            
            if (resolution.allowed) {
                resolvedSymbols.push(symbol);
                console.log(chalk.green(`✅ ${symbol}: ${resolution.action}`));
            } else {
                console.log(chalk.red(`❌ ${symbol}: ${resolution.reason}`));
            }
        }
        
        return resolvedSymbols;
    }

    async allocateBudget(symbols, totalUSDT) {
        console.log(chalk.cyan('\n💰 Budget Allocation:'));
        console.log(chalk.gray(`Total available: $${totalUSDT} USDT\n`));
        
        const allocations = {};
        const minPerSymbol = 10; // Minimum $10 per symbol
        const maxRecommended = totalUSDT * 0.8; // Use max 80% of available
        
        for (const symbol of symbols) {
            const remaining = totalUSDT - Object.values(allocations).reduce((sum, val) => sum + val, 0);
            const defaultAllocation = Math.min(Math.floor(remaining / (symbols.length - Object.keys(allocations).length)), maxRecommended / symbols.length);
            
            const answer = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'allocation',
                    message: chalk.cyan(`Allocate USDT for ${symbol}:`),
                    default: defaultAllocation.toString(),
                    validate: (input) => {
                        const amount = parseFloat(input);
                        if (isNaN(amount) || amount < minPerSymbol) {
                            return `Minimum allocation is $${minPerSymbol}`;
                        }
                        if (amount > remaining) {
                            return `Maximum available: $${remaining.toFixed(2)}`;
                        }
                        return true;
                    }
                }
            ]);
            
            allocations[symbol] = parseFloat(answer.allocation);
        }
        
        return allocations;
    }

    async selectRiskLevels(symbols) {
        const riskSettings = {};
        
        console.log(chalk.cyan('\n⚖️ Risk Level Configuration:'));
        
        for (const symbol of symbols) {
            const symbolInfo = this.getSymbolInfo(symbol);
            console.log(chalk.gray(`${symbol}: ${symbolInfo.description}`));
            
            const answer = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'riskLevel',
                    message: chalk.cyan(`Risk level for ${symbol}:`),
                    choices: [
                        { name: 'Conservative (Lower risk, steady gains)', value: 'CONSERVATIVE' },
                        { name: 'Moderate (Balanced approach)', value: 'MODERATE' },
                        { name: 'Aggressive (Higher risk, higher potential)', value: 'AGGRESSIVE' }
                    ],
                    default: 'MODERATE'
                }
            ]);
            
            riskSettings[symbol] = answer.riskLevel;
        }
        
        return riskSettings;
    }

    getSymbolInfo(symbol) {
        const symbolInfo = {
            'SOL-USDT': { description: 'Popular L1 blockchain, good volatility' },
            'BTC-USDT': { description: 'Most stable crypto, lower volatility' },
            'ETH-USDT': { description: 'Second largest crypto, moderate volatility' },
            'BNB-USDT': { description: 'Exchange token, moderate volatility' },
            'ADA-USDT': { description: 'Smart contract platform, high volatility' },
            'DOT-USDT': { description: 'Interoperability protocol, high volatility' },
            'AVAX-USDT': { description: 'Fast blockchain, high volatility' },
            'MATIC-USDT': { description: 'Ethereum scaling, moderate volatility' },
            'LINK-USDT': { description: 'Oracle network, moderate volatility' },
            'UNI-USDT': { description: 'DEX token, high volatility' }
        };
        
        return symbolInfo[symbol] || { description: 'Custom trading pair' };
    }

    async getTotalUSDT() {
        try {
            // This would normally fetch from your account
            // For now, return the current MAX_USDT_TO_USE value
            const envContent = await fs.readFile(this.configTemplate, 'utf8');
            const match = envContent.match(/MAX_USDT_TO_USE=(\d+)/);
            return match ? parseInt(match[1]) * 3 : 150; // Multiply by 3 for multi-instance demo
        } catch (error) {
            return 150; // Default fallback
        }
    }

    async displaySetupSummary(instances, allocations, riskSettings) {
        console.log(chalk.cyan('\n📋 Multi-Instance Setup Summary:'));
        console.log(chalk.cyan('═'.repeat(50)));
        
        instances.forEach(instance => {
            const symbol = instance.instanceName.replace('_', '-').toUpperCase();
            const allocation = allocations[symbol];
            const risk = riskSettings[symbol];
            const settings = this.getSymbolSettings(symbol, allocation, risk);
            
            console.log(chalk.white(`📊 ${symbol}:`));
            console.log(chalk.gray(`   💰 Allocation: $${allocation} USDT`));
            console.log(chalk.gray(`   ⚖️  Risk Level: ${risk}`));
            console.log(chalk.gray(`   🎯 Threshold: ${(parseFloat(settings.threshold) * 100).toFixed(1)}%`));
            console.log(chalk.gray(`   📈 Take Profit: ${(parseFloat(settings.takeProfit) * 100).toFixed(1)}%`));
            console.log(chalk.gray(`   📁 Instance: ${instance.instanceName}`));
            console.log('');
        });
        
        const totalAllocated = Object.values(allocations).reduce((sum, val) => sum + val, 0);
        console.log(chalk.yellow(`💰 Total Allocated: $${totalAllocated} USDT`));
    }

    async confirmSetup() {
        const answer = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirmed',
                message: chalk.cyan('Start all trading instances?'),
                default: true
            }
        ]);
        
        return answer.confirmed;
    }

    async startInstances(pm2ConfigPath) {
        console.log(chalk.cyan('\n🚀 Starting trading instances...\n'));
        
        try {
            // Start with PM2
            execSync(`pm2 start ${pm2ConfigPath}`, { stdio: 'inherit' });
            
            console.log(chalk.green('\n✅ All instances started successfully!'));
            console.log(chalk.cyan('\n📊 Monitor your instances:'));
            console.log(chalk.white('npm run multi:status'));
            console.log(chalk.white('npm run multi:logs'));
            console.log(chalk.white('npm run portfolio:monitor'));
            
        } catch (error) {
            console.error(chalk.red('Error starting instances:'), error);
        }
    }
}

// Export for use in scripts
module.exports = MultiInstanceManager;

// CLI usage
if (require.main === module) {
    const manager = new MultiInstanceManager();
    manager.setupMultipleInstances().catch(console.error);
}
