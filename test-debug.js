/**
 * Debug Test Script for OKX Trading Bot
 * Tests environment variables, OKX client initialization, and API connectivity
 */

const path = require('path');
const fs = require('fs');

console.log('🔧 === OKX Trading Bot Debug Test ===\n');

// Test 1: Environment file existence
console.log('📁 Test 1: Checking .env file...');
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);
console.log(`   .env file exists: ${envExists ? '✅ YES' : '❌ NO'}`);
if (envExists) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log(`   .env file size: ${envContent.length} bytes`);
    console.log(`   Contains OKX_API_KEY: ${envContent.includes('OKX_API_KEY') ? '✅ YES' : '❌ NO'}`);
    console.log(`   Contains OKX_SECRET_KEY: ${envContent.includes('OKX_SECRET_KEY') ? '✅ YES' : '❌ NO'}`);
    console.log(`   Contains OKX_PASSPHRASE: ${envContent.includes('OKX_PASSPHRASE') ? '✅ YES' : '❌ NO'}`);
}

// Test 2: Load dotenv explicitly
console.log('\n🔧 Test 2: Loading environment variables...');
try {
    require('dotenv').config({ path: envPath });
    console.log('   ✅ dotenv.config() successful');
} catch (error) {
    console.log(`   ❌ dotenv.config() failed: ${error.message}`);
}

// Test 3: Check environment variables
console.log('\n🔑 Test 3: Environment variables check...');
const apiKey = process.env.OKX_API_KEY;
const secretKey = process.env.OKX_SECRET_KEY;
const passphrase = process.env.OKX_PASSPHRASE;

console.log(`   OKX_API_KEY: ${apiKey ? `✅ Found (${apiKey.substring(0, 8)}...)` : '❌ Missing'}`);
console.log(`   OKX_SECRET_KEY: ${secretKey ? `✅ Found (${secretKey.substring(0, 8)}...)` : '❌ Missing'}`);
console.log(`   OKX_PASSPHRASE: ${passphrase ? `✅ Found (${passphrase.substring(0, 4)}...)` : '❌ Missing'}`);

// Test 4: OKX Client initialization with different methods
console.log('\n🤖 Test 4: OKX Client initialization...');

try {
    const OKXClient = require('./okx-client');
    
    // Method 1: Positional arguments (original way)
    console.log('   Testing Method 1: Positional arguments...');
    try {
        const client1 = new OKXClient(apiKey, secretKey, passphrase);
        console.log('   ✅ Method 1: Positional args - SUCCESS');
        console.log(`      Client apiKey: ${client1.apiKey ? 'Set' : 'Missing'}`);
        console.log(`      Client secretKey: ${client1.secretKey ? 'Set' : 'Missing'}`);
        console.log(`      Client passphrase: ${client1.passphrase ? 'Set' : 'Missing'}`);
    } catch (error) {
        console.log(`   ❌ Method 1: Positional args - FAILED: ${error.message}`);
    }
    
    // Method 2: Options object (enhanced bot way)
    console.log('\n   Testing Method 2: Options object...');
    try {
        const client2 = new OKXClient({
            apiKey: apiKey,
            secretKey: secretKey,
            passphrase: passphrase,
            baseURL: 'https://www.okx.com'
        });
        console.log('   ✅ Method 2: Options object - SUCCESS');
        console.log(`      Client apiKey: ${client2.apiKey ? 'Set' : 'Missing'}`);
        console.log(`      Client secretKey: ${client2.secretKey ? 'Set' : 'Missing'}`);
        console.log(`      Client passphrase: ${client2.passphrase ? 'Set' : 'Missing'}`);
        
        // Test 5: Signature generation
        console.log('\n🔐 Test 5: Testing signature generation...');
        try {
            const timestamp = new Date().toISOString();
            const method = 'GET';
            const requestPath = '/api/v5/market/ticker?instId=SOL-USDT';
            const body = '';
            
            const signature = client2.generateSignature(timestamp, method, requestPath, body);
            console.log('   ✅ Signature generation - SUCCESS');
            console.log(`      Signature length: ${signature.length}`);
            console.log(`      Signature sample: ${signature.substring(0, 20)}...`);
        } catch (error) {
            console.log(`   ❌ Signature generation - FAILED: ${error.message}`);
            console.log(`      Error type: ${error.constructor.name}`);
            console.log(`      Stack: ${error.stack}`);
        }
        
        // Test 6: Simple API request
        console.log('\n🌐 Test 6: Testing API connectivity...');
        client2.getPrice('SOL-USDT')
            .then(price => {
                console.log(`   ✅ API request - SUCCESS`);
                console.log(`      SOL-USDT price: $${price}`);
            })
            .catch(error => {
                console.log(`   ❌ API request - FAILED: ${error.message}`);
                console.log(`      Error type: ${error.constructor.name}`);
                if (error.message.includes('key')) {
                    console.log('      🚨 This is the same "key" error we\'ve been seeing!');
                }
            });
            
    } catch (error) {
        console.log(`   ❌ Method 2: Options object - FAILED: ${error.message}`);
    }
    
} catch (error) {
    console.log(`   ❌ OKX Client require failed: ${error.message}`);
}

// Test 7: Direct crypto test
console.log('\n🔐 Test 7: Direct crypto module test...');
try {
    const crypto = require('crypto');
    const testSecret = secretKey || 'test-secret-key';
    const testMessage = 'test-message';
    
    console.log(`   Testing with secret: ${testSecret ? 'Available' : 'Missing'}`);
    console.log(`   Secret type: ${typeof testSecret}`);
    console.log(`   Secret length: ${testSecret ? testSecret.length : 'N/A'}`);
    
    const hmac = crypto.createHmac('sha256', testSecret);
    hmac.update(testMessage);
    const signature = hmac.digest('base64');
    
    console.log('   ✅ Direct crypto test - SUCCESS');
    console.log(`      Test signature: ${signature}`);
} catch (error) {
    console.log(`   ❌ Direct crypto test - FAILED: ${error.message}`);
}

console.log('\n🏁 Debug test completed!');
console.log('\n💡 If you see any ❌ errors above, those indicate the source of the problem.');
