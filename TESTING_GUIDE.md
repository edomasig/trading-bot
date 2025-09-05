# 🧪 Multi-Instance Trading Bot - Testing Guide

## Quick Test Commands

### 🚀 Main Test Suite
```bash
npm run test:all
# Interactive test runner with all components
```

### 🔍 Individual Component Tests
```bash
npm run test:checker      # Test instance conflict detection
npm run test:portfolio    # Test portfolio monitoring
npm run demo:multi        # Interactive demos
```

### 🎮 Demo Scripts
```bash
npm run demo:multi        # Full multi-instance demo suite
npm run demo:targets      # Target price logging demo
npm run demo:transactions # Transaction logging demo
```

## 📋 Test Categories

### 1. Component Tests
- **Instance Checker**: Conflict detection, PM2 integration
- **Portfolio Monitor**: Real-time tracking, reporting
- **Multi-Instance Manager**: Configuration, setup process

### 2. Integration Tests
- **PM2 Integration**: Process management, config generation
- **Package Scripts**: All npm commands validation
- **Environment**: Dependencies, file structure

### 3. Demo Simulations
- **Conflict Detection**: Mock trading instances
- **Portfolio Display**: Sample performance data
- **Setup Process**: Dry-run configuration
- **Transaction Logs**: Sample trading activity

## 🔧 Test Features

### Interactive Test Menu
```bash
npm run test:all
```
- Choose specific tests to run
- View real-time results
- Generate test reports
- Environment validation

### Component-Specific Testing
```bash
# Test instance conflict detection
npm run test:checker

# Test portfolio monitoring
npm run test:portfolio

# Run all demos
npm run demo:multi
```

### Test Results & Reporting
- Real-time pass/fail indicators
- Performance timing
- Error details and troubleshooting
- JSON test reports

## 🎯 What Gets Tested

### ✅ Instance Checker
- PM2 process detection
- Symbol conflict resolution
- Process name parsing
- Active instance status

### ✅ Portfolio Monitor
- Performance calculations
- Mock data processing
- Report generation
- Color formatting

### ✅ Multi-Instance Manager
- Symbol configuration
- Risk level settings
- Directory management
- PM2 config generation

### ✅ Integration & Environment
- PM2 installation check
- Node.js version validation
- Required dependencies
- File structure integrity

## 🚨 Troubleshooting Tests

### Common Test Issues

**PM2 Not Found**
```bash
npm install -g pm2
# Then re-run tests
```

**Missing Dependencies**
```bash
npm install
# Ensure all dependencies installed
```

**File Permissions**
```bash
# Windows PowerShell as Administrator might be needed
```

### Test Environment Setup
```bash
# 1. Install dependencies
npm install

# 2. Install PM2 globally
npm install -g pm2

# 3. Run environment check
npm run test:all
# Select "Environment Validation"
```

## 📊 Test Output Examples

### ✅ Successful Test Run
```
🧪 Multi-Instance Trading Bot - Test Suite
═══════════════════════════════════════════

✅ Instance Checker tests passed
✅ Portfolio Monitor tests passed  
✅ Multi-Instance Manager tests passed
✅ PM2 Integration tests passed
✅ Package Scripts tests passed
✅ Environment validation passed

🎉 All tests passed! System is ready for use.
```

### ❌ Failed Test Example
```
❌ PM2 Integration test failed: PM2 is not installed
⚠️  Install PM2: npm install -g pm2
```

## 🎮 Demo Scenarios

### Demo 1: Conflict Detection
- Simulates existing trading instances
- Tests duplicate symbol detection
- Shows conflict resolution options

### Demo 2: Portfolio Monitor
- Displays mock trading performance
- Shows P&L calculations
- Demonstrates real-time updates

### Demo 3: Setup Process
- Walks through multi-instance setup
- Shows budget allocation
- Demonstrates risk configuration

### Demo 4: Symbol Configuration
- Tests all supported symbols
- Shows risk level effects
- Displays threshold calculations

### Demo 5: Transaction Simulation
- Generates sample trading logs
- Shows profit/loss tracking
- Demonstrates stop loss detection

### Demo 6: Full System Test
- Comprehensive component check
- Configuration validation
- Ready-for-production verification

## 🚀 Quick Start Testing

### 1. Basic Validation
```bash
npm run test:all
# Select "Environment Validation"
```

### 2. Component Tests
```bash
npm run test:checker
npm run test:portfolio
```

### 3. Interactive Demos
```bash
npm run demo:multi
# Try different demo scenarios
```

### 4. Full System Test
```bash
npm run test:all
# Select "Run All Tests (Comprehensive)"
```

## 📚 Advanced Testing

### Custom Test Scenarios
- Modify test scripts for specific use cases
- Add custom symbols to test configuration
- Create mock data for edge cases

### Performance Testing
- Monitor memory usage during tests
- Check response times for operations
- Validate scalability with multiple instances

### Error Simulation
- Test behavior with missing files
- Simulate PM2 process failures
- Test recovery mechanisms

---

## 🎯 Next Steps After Testing

1. **All Tests Pass**: Ready for production use with `npm run setup`
2. **Some Tests Fail**: Fix dependencies/environment issues
3. **PM2 Issues**: Install PM2 globally and retry
4. **Custom Testing**: Modify test scripts for your needs

Happy testing! 🧪✨
