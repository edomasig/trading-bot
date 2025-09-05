const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

class InstanceChecker {
    constructor() {
        this.instancesDir = path.join(__dirname, 'instances');
    }

    async getActivePM2Processes() {
        try {
            // Get PM2 list in JSON format
            const pm2List = execSync('pm2 jlist', { encoding: 'utf8' });
            const processes = JSON.parse(pm2List);
            
            // Filter trading bot processes
            const tradingBots = processes.filter(proc => 
                proc.name && proc.name.includes('trading-bot')
            );
            
            return tradingBots.map(proc => ({
                name: proc.name,
                pid: proc.pid,
                status: proc.pm2_env.status,
                symbol: this.extractSymbolFromProcessName(proc.name),
                uptime: proc.pm2_env.pm_uptime,
                restarts: proc.pm2_env.restart_time,
                memory: proc.monit.memory,
                cpu: proc.monit.cpu
            }));
        } catch (error) {
            console.log(chalk.yellow('No PM2 processes found or PM2 not installed'));
            return [];
        }
    }

    extractSymbolFromProcessName(processName) {
        // Extract symbol from process names like 'trading-bot-sol_usdt' or 'sol-trading-bot-enhanced'
        const patterns = [
            /trading-bot-(.+)/,           // trading-bot-sol_usdt
            /sol-trading-bot-enhanced/,   // existing enhanced bot (SOL)
            /(.+)-trading-bot/            // sol-trading-bot
        ];
        
        for (const pattern of patterns) {
            const match = processName.match(pattern);
            if (match) {
                if (processName.includes('sol-trading-bot-enhanced')) {
                    return 'SOL-USDT'; // Default for existing enhanced bot
                }
                if (match[1]) {
                    return match[1].replace('_', '-').toUpperCase();
                }
            }
        }
        return null;
    }

    async getActiveSymbols() {
        const processes = await this.getActivePM2Processes();
        return processes
            .filter(proc => proc.status === 'online' && proc.symbol)
            .map(proc => proc.symbol);
    }

    async checkSymbolConflict(newSymbol) {
        const activeSymbols = await this.getActiveSymbols();
        return activeSymbols.includes(newSymbol.toUpperCase());
    }

    async getInstanceStatus(symbol) {
        const processes = await this.getActivePM2Processes();
        const symbolProcess = processes.find(proc => 
            proc.symbol === symbol.toUpperCase()
        );
        
        if (!symbolProcess) {
            return { exists: false, status: 'not_found' };
        }
        
        return {
            exists: true,
            status: symbolProcess.status,
            name: symbolProcess.name,
            pid: symbolProcess.pid,
            uptime: symbolProcess.uptime,
            restarts: symbolProcess.restarts,
            memory: this.formatMemory(symbolProcess.memory),
            cpu: symbolProcess.cpu
        };
    }

    formatMemory(bytes) {
        const mb = bytes / 1024 / 1024;
        return `${mb.toFixed(1)}MB`;
    }

    async displayActiveInstances() {
        console.log(chalk.cyan('📊 Active Trading Instances'));
        console.log(chalk.cyan('═'.repeat(70)));
        
        const processes = await this.getActivePM2Processes();
        const activeProcesses = processes.filter(proc => proc.status === 'online');
        
        if (activeProcesses.length === 0) {
            console.log(chalk.yellow('No active trading instances found.'));
            console.log(chalk.gray('Use: npm run multi:setup to create instances'));
            return [];
        }
        
        activeProcesses.forEach(proc => {
            const statusColor = proc.status === 'online' ? chalk.green : chalk.red;
            const uptimeHours = Math.floor((Date.now() - proc.uptime) / (1000 * 60 * 60));
            
            console.log(chalk.white(`📈 ${proc.symbol}:`));
            console.log(chalk.gray(`   Status: ${statusColor(proc.status.toUpperCase())}`));
            console.log(chalk.gray(`   Process: ${proc.name} (PID: ${proc.pid})`));
            console.log(chalk.gray(`   Uptime: ${uptimeHours}h | Restarts: ${proc.restarts}`));
            console.log(chalk.gray(`   Memory: ${proc.memory} | CPU: ${proc.cpu}%`));
            console.log('');
        });
        
        return activeProcesses.map(proc => proc.symbol);
    }

    async handleSymbolConflict(symbol, conflictAction = 'ask') {
        const instanceStatus = await this.getInstanceStatus(symbol);
        
        if (!instanceStatus.exists) {
            return { allowed: true, action: 'create_new' };
        }
        
        console.log(chalk.yellow(`⚠️  Conflict Detected!`));
        console.log(chalk.white(`Symbol ${symbol} is already being traded:`));
        console.log(chalk.gray(`   Process: ${instanceStatus.name}`));
        console.log(chalk.gray(`   Status: ${instanceStatus.status}`));
        console.log(chalk.gray(`   PID: ${instanceStatus.pid}`));
        console.log(chalk.gray(`   Memory: ${instanceStatus.memory}`));
        
        if (conflictAction === 'block') {
            return { allowed: false, action: 'blocked', reason: 'Symbol already active' };
        }
        
        if (conflictAction === 'replace') {
            console.log(chalk.cyan('🔄 Stopping existing instance...'));
            await this.stopInstance(symbol);
            return { allowed: true, action: 'replaced_existing' };
        }
        
        // Ask user what to do
        const inquirer = require('inquirer');
        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: chalk.cyan(`How do you want to handle the conflict for ${symbol}?`),
                choices: [
                    {
                        name: '🚫 Cancel - Keep existing instance running',
                        value: 'cancel'
                    },
                    {
                        name: '🔄 Replace - Stop existing and start new',
                        value: 'replace'
                    },
                    {
                        name: '📊 View Status - Show detailed info',
                        value: 'status'
                    }
                ]
            }
        ]);
        
        switch (answer.action) {
            case 'cancel':
                return { allowed: false, action: 'cancelled', reason: 'User cancelled' };
                
            case 'replace':
                console.log(chalk.cyan('🔄 Stopping existing instance...'));
                await this.stopInstance(symbol);
                return { allowed: true, action: 'replaced_existing' };
                
            case 'status':
                await this.showDetailedStatus(symbol);
                return await this.handleSymbolConflict(symbol, 'ask'); // Ask again
                
            default:
                return { allowed: false, action: 'cancelled' };
        }
    }

    async stopInstance(symbol) {
        try {
            const instanceStatus = await this.getInstanceStatus(symbol);
            if (instanceStatus.exists) {
                execSync(`pm2 stop ${instanceStatus.name}`, { stdio: 'pipe' });
                console.log(chalk.green(`✅ Stopped ${instanceStatus.name}`));
                
                // Wait a moment for clean shutdown
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        } catch (error) {
            console.error(chalk.red('Error stopping instance:'), error.message);
        }
    }

    async showDetailedStatus(symbol) {
        const instanceStatus = await this.getInstanceStatus(symbol);
        
        if (!instanceStatus.exists) {
            console.log(chalk.yellow(`No instance found for ${symbol}`));
            return;
        }
        
        console.log(chalk.cyan(`\n📊 Detailed Status for ${symbol}:`));
        console.log(chalk.cyan('═'.repeat(50)));
        console.log(chalk.white(`Status: ${instanceStatus.status}`));
        console.log(chalk.white(`Process Name: ${instanceStatus.name}`));
        console.log(chalk.white(`PID: ${instanceStatus.pid}`));
        console.log(chalk.white(`Uptime: ${new Date(instanceStatus.uptime).toLocaleString()}`));
        console.log(chalk.white(`Restarts: ${instanceStatus.restarts}`));
        console.log(chalk.white(`Memory Usage: ${instanceStatus.memory}`));
        console.log(chalk.white(`CPU Usage: ${instanceStatus.cpu}%`));
        
        // Try to get recent logs
        try {
            const recentLogs = execSync(`pm2 logs ${instanceStatus.name} --lines 5`, { encoding: 'utf8' });
            console.log(chalk.cyan('\n📝 Recent Activity:'));
            console.log(chalk.gray(recentLogs));
        } catch (error) {
            console.log(chalk.gray('Could not retrieve recent logs'));
        }
    }

    async validateNewInstance(symbol, allocation) {
        const validation = {
            valid: true,
            errors: [],
            warnings: []
        };
        
        // Check symbol conflict
        const hasConflict = await this.checkSymbolConflict(symbol);
        if (hasConflict) {
            validation.errors.push(`Symbol ${symbol} is already being traded`);
            validation.valid = false;
        }
        
        // Check allocation
        if (allocation < 10) {
            validation.errors.push('Minimum allocation is $10 USDT');
            validation.valid = false;
        }
        
        // Check if symbol format is valid
        if (!symbol.includes('-') || !symbol.endsWith('-USDT')) {
            validation.warnings.push('Symbol should be in format XXX-USDT');
        }
        
        // Check total memory usage
        const processes = await this.getActivePM2Processes();
        const activeCount = processes.filter(p => p.status === 'online').length;
        
        if (activeCount >= 5) {
            validation.warnings.push('You already have 5+ instances running. Consider system resources.');
        }
        
        return validation;
    }

    async preFlightCheck(symbols, allocations) {
        console.log(chalk.cyan('🔍 Pre-flight Instance Check'));
        console.log(chalk.cyan('═'.repeat(50)));
        
        const results = {
            conflicts: [],
            warnings: [],
            totalAllowed: 0,
            totalBlocked: 0
        };
        
        for (const symbol of symbols) {
            const allocation = allocations[symbol];
            const validation = await this.validateNewInstance(symbol, allocation);
            
            if (!validation.valid) {
                results.conflicts.push({ symbol, errors: validation.errors });
                results.totalBlocked++;
                console.log(chalk.red(`❌ ${symbol}: ${validation.errors.join(', ')}`));
            } else {
                results.totalAllowed++;
                console.log(chalk.green(`✅ ${symbol}: Ready to start`));
                
                if (validation.warnings.length > 0) {
                    results.warnings.push({ symbol, warnings: validation.warnings });
                    validation.warnings.forEach(warning => {
                        console.log(chalk.yellow(`   ⚠️  ${warning}`));
                    });
                }
            }
        }
        
        console.log(chalk.cyan('\n📊 Summary:'));
        console.log(chalk.green(`✅ Ready: ${results.totalAllowed}`));
        console.log(chalk.red(`❌ Blocked: ${results.totalBlocked}`));
        console.log(chalk.yellow(`⚠️  Warnings: ${results.warnings.length}`));
        
        return results;
    }
}

module.exports = InstanceChecker;

// CLI usage
if (require.main === module) {
    const checker = new InstanceChecker();
    checker.displayActiveInstances().catch(console.error);
}
