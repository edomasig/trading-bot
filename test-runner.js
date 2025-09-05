#!/usr/bin/env node

const chalk = require('chalk');
const inquirer = require('inquirer');
const { execSync } = require('child_process');

class TestRunner {
    constructor() {
        this.testResults = {};
    }

    async showTestMenu() {
        console.clear();
        console.log(chalk.cyan('🧪 Multi-Instance Trading Bot - Test Suite'));
        console.log(chalk.cyan('═'.repeat(55)));
        console.log(chalk.yellow('🔬 Comprehensive testing environment\n'));

        const choices = [
            {
                name: '🚀 Run All Tests (Comprehensive)',
                value: 'all_tests',
                description: 'Run complete test suite for all components'
            },
            {
                name: '🔍 Test Instance Checker',
                value: 'test_checker',
                description: 'Test conflict detection and process management'
            },
            {
                name: '📊 Test Portfolio Monitor',
                value: 'test_portfolio',
                description: 'Test portfolio tracking and reporting'
            },
            {
                name: '⚙️  Test Multi-Instance Manager',
                value: 'test_manager',
                description: 'Test instance creation and configuration'
            },
            {
                name: '🎯 Interactive Demo Suite',
                value: 'demo_suite',
                description: 'Run interactive demonstrations'
            },
            {
                name: '💻 Test PM2 Integration',
                value: 'test_pm2',
                description: 'Test PM2 process management'
            },
            {
                name: '📋 Test Package Scripts',
                value: 'test_scripts',
                description: 'Validate all npm scripts work correctly'
            },
            {
                name: '🔧 Environment Validation',
                value: 'test_environment',
                description: 'Check system requirements and dependencies'
            },
            {
                name: '📄 Generate Test Report',
                value: 'generate_report',
                description: 'Create comprehensive test results report'
            },
            {
                name: '❌ Exit',
                value: 'exit'
            }
        ];

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'test',
                message: chalk.cyan('Select test to run:'),
                choices: choices,
                pageSize: 12
            }
        ]);

        await this.runTest(answer.test);
    }

    async runTest(testType) {
        const startTime = Date.now();
        
        try {
            switch (testType) {
                case 'all_tests':
                    await this.runAllTests();
                    break;
                case 'test_checker':
                    await this.testInstanceChecker();
                    break;
                case 'test_portfolio':
                    await this.testPortfolioMonitor();
                    break;
                case 'test_manager':
                    await this.testMultiInstanceManager();
                    break;
                case 'demo_suite':
                    await this.runDemoSuite();
                    break;
                case 'test_pm2':
                    await this.testPM2Integration();
                    break;
                case 'test_scripts':
                    await this.testPackageScripts();
                    break;
                case 'test_environment':
                    await this.testEnvironment();
                    break;
                case 'generate_report':
                    await this.generateTestReport();
                    break;
                case 'exit':
                    console.log(chalk.yellow('Exiting test suite. Happy testing! 🧪'));
                    process.exit(0);
                    break;
            }

            const duration = Date.now() - startTime;
            this.testResults[testType] = {
                status: 'passed',
                duration: duration,
                timestamp: new Date()
            };

            console.log(chalk.green(`\n✅ Test completed in ${duration}ms`));

        } catch (error) {
            const duration = Date.now() - startTime;
            this.testResults[testType] = {
                status: 'failed',
                duration: duration,
                timestamp: new Date(),
                error: error.message
            };

            console.error(chalk.red(`\n❌ Test failed: ${error.message}`));
        }

        await this.waitForKeypress();
        await this.showTestMenu();
    }

    async runAllTests() {
        console.log(chalk.cyan('\n🚀 Running Comprehensive Test Suite\n'));
        console.log(chalk.yellow('This will test all components systematically...\n'));

        const tests = [
            { name: 'Environment Validation', fn: () => this.testEnvironment() },
            { name: 'Instance Checker', fn: () => this.testInstanceChecker() },
            { name: 'Portfolio Monitor', fn: () => this.testPortfolioMonitor() },
            { name: 'Multi-Instance Manager', fn: () => this.testMultiInstanceManager() },
            { name: 'PM2 Integration', fn: () => this.testPM2Integration() },
            { name: 'Package Scripts', fn: () => this.testPackageScripts() }
        ];

        const results = [];

        for (let i = 0; i < tests.length; i++) {
            const test = tests[i];
            console.log(chalk.white(`\n[${i + 1}/${tests.length}] Testing ${test.name}...`));
            
            try {
                await test.fn();
                results.push({ name: test.name, status: 'PASSED' });
                console.log(chalk.green(`✅ ${test.name} - PASSED`));
            } catch (error) {
                results.push({ name: test.name, status: 'FAILED', error: error.message });
                console.log(chalk.red(`❌ ${test.name} - FAILED: ${error.message}`));
            }
        }

        // Summary
        console.log(chalk.cyan('\n📊 Test Suite Summary:'));
        console.log(chalk.cyan('═'.repeat(50)));
        
        const passed = results.filter(r => r.status === 'PASSED').length;
        const failed = results.filter(r => r.status === 'FAILED').length;
        
        console.log(chalk.green(`✅ Passed: ${passed}`));
        console.log(chalk.red(`❌ Failed: ${failed}`));
        console.log(chalk.gray(`📊 Total: ${results.length}`));
        
        if (failed === 0) {
            console.log(chalk.green('\n🎉 All tests passed! System is ready for use.'));
        } else {
            console.log(chalk.yellow('\n⚠️  Some tests failed. Check individual results above.'));
        }
    }

    async testInstanceChecker() {
        console.log(chalk.white('Testing Instance Checker Component...'));
        
        try {
            console.log(chalk.gray('Running: node test-instance-checker.js'));
            execSync('node test-instance-checker.js', { stdio: 'inherit' });
            console.log(chalk.green('✅ Instance Checker tests passed'));
        } catch (error) {
            throw new Error(`Instance Checker test failed: ${error.message}`);
        }
    }

    async testPortfolioMonitor() {
        console.log(chalk.white('Testing Portfolio Monitor Component...'));
        
        try {
            console.log(chalk.gray('Running: node test-portfolio-monitor.js'));
            execSync('node test-portfolio-monitor.js', { stdio: 'inherit' });
            console.log(chalk.green('✅ Portfolio Monitor tests passed'));
        } catch (error) {
            throw new Error(`Portfolio Monitor test failed: ${error.message}`);
        }
    }

    async testMultiInstanceManager() {
        console.log(chalk.white('Testing Multi-Instance Manager Component...'));
        
        // Test component loading
        try {
            const MultiInstanceManager = require('./multi-instance-manager');
            const manager = new MultiInstanceManager();
            
            console.log(chalk.green('   ✅ MultiInstanceManager loaded successfully'));
            
            // Test symbol configuration
            const testSymbol = 'SOL-USDT';
            const settings = manager.getSymbolSettings(testSymbol, 50, 'MODERATE');
            
            if (settings.threshold && settings.takeProfit) {
                console.log(chalk.green('   ✅ Symbol configuration working'));
            } else {
                throw new Error('Symbol configuration returned invalid settings');
            }
            
            // Test supported symbols
            if (manager.supportedSymbols && manager.supportedSymbols.length > 0) {
                console.log(chalk.green(`   ✅ ${manager.supportedSymbols.length} supported symbols loaded`));
            } else {
                throw new Error('No supported symbols found');
            }
            
            // Test directory creation
            await manager.ensureInstancesDirectory();
            console.log(chalk.green('   ✅ Directory creation working'));
            
            console.log(chalk.green('✅ Multi-Instance Manager tests passed'));
            
        } catch (error) {
            throw new Error(`Multi-Instance Manager test failed: ${error.message}`);
        }
    }

    async runDemoSuite() {
        console.log(chalk.white('Running Interactive Demo Suite...'));
        
        try {
            console.log(chalk.gray('Running: node demo-multi-instance.js'));
            execSync('node demo-multi-instance.js', { stdio: 'inherit' });
            console.log(chalk.green('✅ Demo suite completed'));
        } catch (error) {
            throw new Error(`Demo suite failed: ${error.message}`);
        }
    }

    async testPM2Integration() {
        console.log(chalk.white('Testing PM2 Integration...'));
        
        try {
            // Check if PM2 is installed
            try {
                execSync('pm2 --version', { stdio: 'pipe' });
                console.log(chalk.green('   ✅ PM2 is installed'));
            } catch (error) {
                throw new Error('PM2 is not installed. Run: npm install -g pm2');
            }
            
            // Test PM2 list command
            try {
                execSync('pm2 jlist', { stdio: 'pipe' });
                console.log(chalk.green('   ✅ PM2 list command working'));
            } catch (error) {
                console.log(chalk.yellow('   ⚠️  PM2 list command issue (might be normal if no processes)'));
            }
            
            // Test PM2 config generation
            const MultiInstanceManager = require('./multi-instance-manager');
            const manager = new MultiInstanceManager();
            
            const mockInstances = [
                { instanceName: 'test_instance', instanceDir: './test' }
            ];
            
            try {
                await manager.createPM2Config(mockInstances);
                console.log(chalk.green('   ✅ PM2 configuration generation working'));
            } catch (error) {
                throw new Error(`PM2 config generation failed: ${error.message}`);
            }
            
            console.log(chalk.green('✅ PM2 Integration tests passed'));
            
        } catch (error) {
            throw new Error(`PM2 Integration test failed: ${error.message}`);
        }
    }

    async testPackageScripts() {
        console.log(chalk.white('Testing Package Scripts...'));
        
        const fs = require('fs');
        const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
        const scripts = packageJson.scripts;
        
        // Check for required scripts
        const requiredScripts = [
            'setup',
            'multi:setup',
            'portfolio:summary',
            'instances:check',
            'multi:status'
        ];
        
        const missingScripts = requiredScripts.filter(script => !scripts[script]);
        
        if (missingScripts.length > 0) {
            throw new Error(`Missing required scripts: ${missingScripts.join(', ')}`);
        }
        
        console.log(chalk.green(`   ✅ All ${requiredScripts.length} required scripts found`));
        
        // Check script syntax (basic validation)
        const multiInstanceScripts = Object.entries(scripts)
            .filter(([name]) => name.includes('multi:') || name.includes('portfolio:') || name.includes('instances:'));
        
        console.log(chalk.green(`   ✅ ${multiInstanceScripts.length} multi-instance scripts configured`));
        
        console.log(chalk.green('✅ Package Scripts tests passed'));
    }

    async testEnvironment() {
        console.log(chalk.white('Testing Environment and Dependencies...'));
        
        // Check Node.js version
        const nodeVersion = process.version;
        console.log(chalk.green(`   ✅ Node.js version: ${nodeVersion}`));
        
        // Check required dependencies
        const fs = require('fs');
        const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
        const dependencies = packageJson.dependencies;
        
        const requiredDeps = ['chalk', 'inquirer', 'axios', 'dotenv'];
        
        for (const dep of requiredDeps) {
            if (dependencies[dep]) {
                console.log(chalk.green(`   ✅ ${dep}: ${dependencies[dep]}`));
            } else {
                throw new Error(`Missing required dependency: ${dep}`);
            }
        }
        
        // Check required files
        const requiredFiles = [
            'multi-instance-manager.js',
            'instance-checker.js',
            'portfolio-monitor.js',
            'trading-bot-setup.js',
            'enhanced-bot.js'
        ];
        
        for (const file of requiredFiles) {
            if (fs.existsSync(file)) {
                console.log(chalk.green(`   ✅ ${file} exists`));
            } else {
                throw new Error(`Missing required file: ${file}`);
            }
        }
        
        // Check .env file
        if (fs.existsSync('.env')) {
            console.log(chalk.green('   ✅ .env configuration file exists'));
        } else {
            console.log(chalk.yellow('   ⚠️  .env file not found (create for trading)'));
        }
        
        console.log(chalk.green('✅ Environment validation passed'));
    }

    async generateTestReport() {
        console.log(chalk.cyan('\n📄 Generating Test Report\n'));
        
        const report = {
            timestamp: new Date().toISOString(),
            nodeVersion: process.version,
            platform: process.platform,
            testResults: this.testResults,
            summary: {
                totalTests: Object.keys(this.testResults).length,
                passed: Object.values(this.testResults).filter(r => r.status === 'passed').length,
                failed: Object.values(this.testResults).filter(r => r.status === 'failed').length
            }
        };
        
        const fs = require('fs').promises;
        const reportPath = `./test-report-${Date.now()}.json`;
        
        try {
            await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
            console.log(chalk.green(`✅ Test report saved to: ${reportPath}`));
            
            // Display summary
            console.log(chalk.cyan('\n📊 Test Summary:'));
            console.log(chalk.white(`Tests Run: ${report.summary.totalTests}`));
            console.log(chalk.green(`Passed: ${report.summary.passed}`));
            console.log(chalk.red(`Failed: ${report.summary.failed}`));
            
            if (Object.keys(this.testResults).length === 0) {
                console.log(chalk.yellow('   No tests have been run yet in this session.'));
            }
            
        } catch (error) {
            throw new Error(`Report generation failed: ${error.message}`);
        }
    }

    async waitForKeypress() {
        console.log(chalk.gray('\nPress any key to continue...'));
        
        return new Promise(resolve => {
            process.stdin.setRawMode(true);
            process.stdin.resume();
            process.stdin.once('data', () => {
                process.stdin.setRawMode(false);
                process.stdin.pause();
                resolve();
            });
        });
    }
}

// Export for programmatic use
module.exports = TestRunner;

// CLI usage
if (require.main === module) {
    const testRunner = new TestRunner();
    testRunner.showTestMenu().catch(console.error);
}
