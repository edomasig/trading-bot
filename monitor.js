const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

function formatTime(date) {
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

function monitorBot() {
    console.log('\n🤖 OKX Trading Bot Monitor');
    console.log('===========================');
    console.log(`📅 Check Time: ${formatTime(new Date())}\n`);
    
    // Check PM2 status
    exec('pm2 jlist', (error, stdout, stderr) => {
        if (error) {
            console.log('❌ PM2 Status: Not running or not installed');
            console.log('💡 Run "npm run pm2:start" to start the bot');
            return;
        }
        
        try {
            const processes = JSON.parse(stdout);
            const tradingBot = processes.find(p => p.name === 'sol-trading-bot');
            
            if (tradingBot) {
                const status = tradingBot.pm2_env.status;
                const uptime = Math.floor((Date.now() - tradingBot.pm2_env.pm_uptime) / 1000);
                const memory = Math.round(tradingBot.monit.memory / 1024 / 1024);
                const cpu = tradingBot.monit.cpu;
                const restarts = tradingBot.pm2_env.restart_time;
                
                console.log(`✅ Bot Status: ${status.toUpperCase()}`);
                console.log(`⏰ Uptime: ${formatUptime(uptime)}`);
                console.log(`💾 Memory: ${memory} MB`);
                console.log(`🔄 CPU: ${cpu}%`);
                console.log(`🔃 Restarts: ${restarts}`);
                
                if (status !== 'online') {
                    console.log('⚠️  Bot is not running! Use "npm run pm2:restart" to restart');
                }
            } else {
                console.log('❌ Bot Status: NOT FOUND');
                console.log('💡 Run "npm run pm2:start" to start the bot');
            }
        } catch (parseError) {
            console.log('❌ Error parsing PM2 status');
        }
    });
    
    // Check recent transactions
    setTimeout(() => {
        console.log('\n📊 Recent Trading Activity:');
        console.log('============================');
        
        const logFile = path.join(__dirname, 'transactions.log');
        if (fs.existsSync(logFile)) {
            const stats = fs.statSync(logFile);
            const lastModified = new Date(stats.mtime);
            const timeDiff = Date.now() - lastModified.getTime();
            const minutesSinceLastActivity = Math.round(timeDiff / (1000 * 60));
            
            console.log(`📈 Last Activity: ${minutesSinceLastActivity} minutes ago`);
            
            // Show last few lines of transaction log
            const content = fs.readFileSync(logFile, 'utf8');
            const lines = content.trim().split('\n');
            if (lines.length > 1) {
                console.log('\n📋 Last 3 Transactions:');
                const recentLines = lines.slice(-4, -1); // Skip header, get last 3
                recentLines.forEach(line => {
                    if (line.trim()) {
                        const parts = line.split(',');
                        if (parts.length >= 5) {
                            const [date, time, symbol, action, amount, price, , , status] = parts;
                            const statusIcon = status === 'SUCCESS' ? '✅' : '❌';
                            console.log(`${statusIcon} ${date} ${time} - ${action} ${amount} ${symbol.replace('-USDT', '')} @ $${price} [${status}]`);
                        }
                    }
                });
            } else {
                console.log('📋 No transactions found yet');
            }
        } else {
            console.log('📋 No transaction log found');
        }
        
        // Check current configuration
        const envFile = path.join(__dirname, '.env');
        if (fs.existsSync(envFile)) {
            const envContent = fs.readFileSync(envFile, 'utf8');
            const symbolMatch = envContent.match(/TRADING_SYMBOL=(.+)/);
            const thresholdMatch = envContent.match(/PRICE_CHANGE_THRESHOLD=(.+)/);
            const maxUsdtMatch = envContent.match(/MAX_USDT_TO_USE=(.+)/);
            
            console.log('\n⚙️  Current Configuration:');
            console.log('===========================');
            if (symbolMatch) console.log(`🎯 Trading Pair: ${symbolMatch[1]}`);
            if (thresholdMatch) console.log(`📊 Threshold: ${(parseFloat(thresholdMatch[1]) * 100).toFixed(2)}%`);
            if (maxUsdtMatch) {
                const maxUsdt = maxUsdtMatch[1].trim();
                console.log(`💰 Max USDT: ${maxUsdt || 'No limit (use all available)'}`);
            }
        }
        
        console.log('\n🔧 Quick Commands:');
        console.log('===================');
        console.log('📊 Status:    npm run pm2:status');
        console.log('📋 Logs:      npm run pm2:logs');
        console.log('🔄 Restart:   npm run pm2:restart');
        console.log('⏹️  Stop:      npm run pm2:stop');
        console.log('📈 History:   npm run history');
        console.log('👀 Monitor:   npm run pm2:monitor');
        console.log('');
    }, 500);
}

function formatUptime(seconds) {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
}

monitorBot();
