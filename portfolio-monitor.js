const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class PortfolioMonitor {
    constructor() {
        this.instancesDir = path.join(__dirname, 'instances');
        this.refreshInterval = 30; // seconds
        this.monitoringActive = false;
    }

    async getActiveInstances() {
        try {
            const { stdout } = await execAsync('pm2 jlist');
            const processes = JSON.parse(stdout);
            
            return processes
                .filter(proc => 
                    proc.name && 
                    proc.name.startsWith('trading-bot-') && 
                    proc.pm2_env.status === 'online'
                )
                .map(proc => ({
                    name: proc.name,
                    symbol: this.extractSymbolFromProcessName(proc.name),
                    pid: proc.pid,
                    uptime: this.formatUptime(proc.pm2_env.pm_uptime),
                    restarts: proc.pm2_env.restart_time,
                    memory: this.formatMemory(proc.monit.memory),
                    cpu: `${proc.monit.cpu}%`,
                    cwd: proc.pm2_env.pm_cwd
                }));
        } catch (error) {
            console.error('Error getting PM2 processes:', error);
            return [];
        }
    }

    extractSymbolFromProcessName(processName) {
        const match = processName.match(/trading-bot-(.+)/);
        if (match) {
            return match[1].replace('_', '-').toUpperCase();
        }
        return 'UNKNOWN';
    }

    async getInstanceStats(instancePath) {
        const stats = {
            symbol: 'UNKNOWN',
            allocation: 0,
            currentPosition: null,
            totalTrades: 0,
            profitLoss: 0,
            lastActivity: null,
            errors: 0
        };

        try {
            // Get symbol from config
            const envPath = path.join(instancePath, '.env');
            const envContent = await fs.readFile(envPath, 'utf8');
            
            const symbolMatch = envContent.match(/TRADING_SYMBOL=([^\n\r]+)/);
            const allocationMatch = envContent.match(/MAX_USDT_TO_USE=([^\n\r]+)/);
            
            if (symbolMatch) stats.symbol = symbolMatch[1];
            if (allocationMatch) stats.allocation = parseFloat(allocationMatch[1]);

            // Get position data
            const positionPath = path.join(instancePath, 'positions.json');
            try {
                const positionData = await fs.readFile(positionPath, 'utf8');
                const positions = JSON.parse(positionData);
                
                if (positions[stats.symbol] && positions[stats.symbol].quantity > 0) {
                    stats.currentPosition = positions[stats.symbol];
                }
            } catch (error) {
                // Position file might not exist yet
            }

            // Get transaction logs for profit calculation
            const transactionPath = path.join(instancePath, 'logs', 'transactions.log');
            try {
                const logContent = await fs.readFile(transactionPath, 'utf8');
                const lines = logContent.trim().split('\n').filter(line => line.trim());
                
                stats.totalTrades = lines.length;
                stats.profitLoss = this.calculateProfitLoss(lines);
                
                if (lines.length > 0) {
                    const lastLine = lines[lines.length - 1];
                    const timestampMatch = lastLine.match(/^\[([\d-]+\s[\d:]+)\]/);
                    if (timestampMatch) {
                        stats.lastActivity = new Date(timestampMatch[1]);
                    }
                }
            } catch (error) {
                // Transaction log might not exist yet
            }

            // Count errors from error log
            const errorLogPath = path.join(instancePath, 'logs', 'error.log');
            try {
                const errorContent = await fs.readFile(errorLogPath, 'utf8');
                const errorLines = errorContent.trim().split('\n').filter(line => line.trim());
                stats.errors = errorLines.length;
            } catch (error) {
                // Error log might not exist
            }

        } catch (error) {
            console.error(`Error reading instance stats for ${instancePath}:`, error);
        }

        return stats;
    }

    calculateProfitLoss(transactionLines) {
        let totalPnL = 0;
        let buyPrice = null;
        let buyQuantity = null;

        for (const line of transactionLines) {
            if (line.includes('BUY')) {
                const priceMatch = line.match(/Price: \$?([\d.]+)/);
                const quantityMatch = line.match(/Quantity: ([\d.]+)/);
                
                if (priceMatch && quantityMatch) {
                    buyPrice = parseFloat(priceMatch[1]);
                    buyQuantity = parseFloat(quantityMatch[1]);
                }
            } else if (line.includes('SELL') && buyPrice && buyQuantity) {
                const priceMatch = line.match(/Price: \$?([\d.]+)/);
                const quantityMatch = line.match(/Quantity: ([\d.]+)/);
                
                if (priceMatch && quantityMatch) {
                    const sellPrice = parseFloat(priceMatch[1]);
                    const sellQuantity = parseFloat(quantityMatch[1]);
                    
                    // Calculate profit/loss for this trade
                    const buyValue = buyPrice * buyQuantity;
                    const sellValue = sellPrice * sellQuantity;
                    const pnl = sellValue - buyValue;
                    
                    totalPnL += pnl;
                    
                    // Reset for next trade cycle
                    buyPrice = null;
                    buyQuantity = null;
                }
            }
        }

        return totalPnL;
    }

    async displayPortfolioSummary() {
        console.clear();
        console.log(chalk.cyan('🚀 Trading Bot Portfolio Monitor'));
        console.log(chalk.cyan('═'.repeat(60)));
        console.log(chalk.gray(`Updated: ${new Date().toLocaleString()}\n`));

        const activeInstances = await this.getActiveInstances();
        
        if (activeInstances.length === 0) {
            console.log(chalk.yellow('No active trading instances found.'));
            console.log(chalk.gray('Start instances with: npm run multi:setup'));
            return;
        }

        let totalAllocated = 0;
        let totalPnL = 0;
        let totalTrades = 0;
        let totalErrors = 0;
        const instanceStats = [];

        // Collect stats for each instance
        for (const instance of activeInstances) {
            const stats = await this.getInstanceStats(instance.cwd);
            stats.processInfo = instance;
            instanceStats.push(stats);
            
            totalAllocated += stats.allocation;
            totalPnL += stats.profitLoss;
            totalTrades += stats.totalTrades;
            totalErrors += stats.errors;
        }

        // Display overview
        console.log(chalk.white('📊 Portfolio Overview:'));
        console.log(chalk.gray(`Active Instances: ${activeInstances.length}`));
        console.log(chalk.gray(`Total Allocated: $${totalAllocated.toFixed(2)} USDT`));
        console.log(chalk.gray(`Total P&L: ${this.colorizeAmount(totalPnL)}`));
        console.log(chalk.gray(`Total Trades: ${totalTrades}`));
        console.log(chalk.gray(`Total Errors: ${totalErrors > 0 ? chalk.red(totalErrors) : chalk.green('0')}\n`));

        // Display individual instances
        console.log(chalk.white('📈 Individual Performance:'));
        console.log(chalk.cyan('─'.repeat(80)));
        
        const headers = ['Symbol', 'Status', 'Allocation', 'Position', 'P&L', 'Trades', 'Uptime'];
        console.log(chalk.white(headers.map((h, i) => h.padEnd([8, 8, 12, 12, 12, 8, 10][i])).join(' ')));
        console.log(chalk.gray('─'.repeat(80)));

        instanceStats.forEach(stats => {
            const symbol = stats.symbol.padEnd(8);
            const status = stats.processInfo ? chalk.green('ONLINE'.padEnd(8)) : chalk.red('OFFLINE'.padEnd(8));
            const allocation = `$${stats.allocation.toFixed(0)}`.padEnd(12);
            const position = stats.currentPosition ? 
                chalk.yellow(`${stats.currentPosition.quantity.toFixed(2)}`.padEnd(12)) : 
                chalk.gray('None'.padEnd(12));
            const pnl = this.colorizeAmount(stats.profitLoss).padEnd(12);
            const trades = stats.totalTrades.toString().padEnd(8);
            const uptime = stats.processInfo ? stats.processInfo.uptime.padEnd(10) : 'N/A'.padEnd(10);
            
            console.log(`${symbol} ${status} ${allocation} ${position} ${pnl} ${trades} ${uptime}`);
        });

        // Performance indicators
        console.log(chalk.cyan('\n📊 Performance Indicators:'));
        if (totalTrades > 0) {
            const avgPnLPerTrade = totalPnL / totalTrades;
            const winRate = this.calculateWinRate(instanceStats);
            const bestPerformer = instanceStats.reduce((best, current) => 
                current.profitLoss > best.profitLoss ? current : best
            );
            
            console.log(chalk.gray(`Average P&L per trade: ${this.colorizeAmount(avgPnLPerTrade)}`));
            console.log(chalk.gray(`Estimated win rate: ${winRate.toFixed(1)}%`));
            console.log(chalk.gray(`Best performer: ${bestPerformer.symbol} (${this.colorizeAmount(bestPerformer.profitLoss)})`));
        } else {
            console.log(chalk.gray('No trades completed yet.'));
        }

        // Recent activity
        console.log(chalk.cyan('\n🕒 Recent Activity:'));
        const recentActivity = instanceStats
            .filter(stats => stats.lastActivity)
            .sort((a, b) => b.lastActivity - a.lastActivity)
            .slice(0, 3);
            
        if (recentActivity.length > 0) {
            recentActivity.forEach(stats => {
                const timeAgo = this.getTimeAgo(stats.lastActivity);
                console.log(chalk.gray(`${stats.symbol}: Last trade ${timeAgo}`));
            });
        } else {
            console.log(chalk.gray('No recent activity.'));
        }

        // Quick actions
        console.log(chalk.cyan('\n🎮 Quick Actions:'));
        console.log(chalk.white('Press [R] to refresh, [L] for logs, [S] to stop monitoring, [Q] to quit'));
    }

    calculateWinRate(instanceStats) {
        // This is a simplified calculation - in practice you'd need more detailed trade data
        const profitable = instanceStats.filter(s => s.profitLoss > 0).length;
        return instanceStats.length > 0 ? (profitable / instanceStats.length) * 100 : 0;
    }

    colorizeAmount(amount) {
        const formatted = `$${amount.toFixed(2)}`;
        if (amount > 0) return chalk.green(`+${formatted}`);
        if (amount < 0) return chalk.red(formatted);
        return chalk.gray(formatted);
    }

    formatUptime(startTime) {
        const uptime = Date.now() - startTime;
        const hours = Math.floor(uptime / (1000 * 60 * 60));
        const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    }

    formatMemory(bytes) {
        return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        
        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    }

    async startLiveMonitoring() {
        this.monitoringActive = true;
        
        console.log(chalk.cyan('🔴 Starting live portfolio monitoring...\n'));
        
        // Set up stdin for interactive commands
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        
        process.stdin.on('data', async (key) => {
            if (!this.monitoringActive) return;
            
            switch (key.toLowerCase()) {
                case 'r':
                    await this.displayPortfolioSummary();
                    break;
                case 'l':
                    await this.showLogs();
                    break;
                case 's':
                    this.monitoringActive = false;
                    console.log(chalk.yellow('\nMonitoring stopped. Press any key to exit.'));
                    break;
                case 'q':
                case '\u0003': // Ctrl+C
                    this.monitoringActive = false;
                    console.log(chalk.yellow('\nExiting portfolio monitor...'));
                    process.exit(0);
                    break;
            }
        });

        // Initial display
        await this.displayPortfolioSummary();
        
        // Auto-refresh loop
        const refreshLoop = setInterval(async () => {
            if (!this.monitoringActive) {
                clearInterval(refreshLoop);
                return;
            }
            await this.displayPortfolioSummary();
        }, this.refreshInterval * 1000);
    }

    async showLogs() {
        console.clear();
        console.log(chalk.cyan('📋 Recent Trading Logs\n'));
        
        const activeInstances = await this.getActiveInstances();
        
        for (const instance of activeInstances.slice(0, 3)) { // Show logs for first 3 instances
            console.log(chalk.white(`🤖 ${instance.symbol}:`));
            
            try {
                const logPath = path.join(instance.cwd, 'logs', 'transactions.log');
                const logContent = await fs.readFile(logPath, 'utf8');
                const recentLines = logContent.trim().split('\n').slice(-5); // Last 5 transactions
                
                recentLines.forEach(line => {
                    if (line.includes('BUY')) {
                        console.log(chalk.green(`  📈 ${line}`));
                    } else if (line.includes('SELL')) {
                        console.log(chalk.red(`  📉 ${line}`));
                    } else {
                        console.log(chalk.gray(`  📝 ${line}`));
                    }
                });
            } catch (error) {
                console.log(chalk.gray('  No transaction logs yet.'));
            }
            console.log('');
        }
        
        console.log(chalk.cyan('Press any key to return to portfolio view...'));
        
        // Wait for keypress
        await new Promise(resolve => {
            const handler = () => {
                process.stdin.removeListener('data', handler);
                resolve();
            };
            process.stdin.on('data', handler);
        });
        
        await this.displayPortfolioSummary();
    }

    async generateReport() {
        console.log(chalk.cyan('📊 Generating portfolio report...\n'));
        
        const activeInstances = await this.getActiveInstances();
        const instanceStats = [];
        
        for (const instance of activeInstances) {
            const stats = await this.getInstanceStats(instance.cwd);
            stats.processInfo = instance;
            instanceStats.push(stats);
        }
        
        const report = {
            timestamp: new Date().toISOString(),
            totalInstances: activeInstances.length,
            totalAllocated: instanceStats.reduce((sum, s) => sum + s.allocation, 0),
            totalPnL: instanceStats.reduce((sum, s) => sum + s.profitLoss, 0),
            totalTrades: instanceStats.reduce((sum, s) => sum + s.totalTrades, 0),
            instances: instanceStats.map(stats => ({
                symbol: stats.symbol,
                allocation: stats.allocation,
                profitLoss: stats.profitLoss,
                totalTrades: stats.totalTrades,
                currentPosition: stats.currentPosition,
                uptime: stats.processInfo ? stats.processInfo.uptime : 'N/A',
                errors: stats.errors
            }))
        };
        
        const reportPath = path.join(__dirname, 'logs', `portfolio-report-${Date.now()}.json`);
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
        
        console.log(chalk.green(`Report saved to: ${reportPath}`));
        return report;
    }
}

// Export for use in other modules
module.exports = PortfolioMonitor;

// CLI usage
if (require.main === module) {
    const monitor = new PortfolioMonitor();
    
    const args = process.argv.slice(2);
    
    if (args.includes('--live') || args.includes('-l')) {
        monitor.startLiveMonitoring().catch(console.error);
    } else if (args.includes('--report') || args.includes('-r')) {
        monitor.generateReport().catch(console.error);
    } else {
        // Single snapshot
        monitor.displayPortfolioSummary().catch(console.error);
    }
}
