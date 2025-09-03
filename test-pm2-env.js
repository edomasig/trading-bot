/**
 * Simple PM2 Environment Test
 * Tests if environment variables are available in PM2 context
 */

const path = require('path');

// Force load .env file
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('=== PM2 Environment Test ===');
console.log(`Process PID: ${process.pid}`);
console.log(`Node version: ${process.version}`);
console.log(`Working directory: ${process.cwd()}`);

console.log('\n=== Environment Variables ===');
console.log(`OKX_API_KEY: ${process.env.OKX_API_KEY ? 'FOUND' : 'MISSING'}`);
console.log(`OKX_SECRET_KEY: ${process.env.OKX_SECRET_KEY ? 'FOUND' : 'MISSING'}`);
console.log(`OKX_PASSPHRASE: ${process.env.OKX_PASSPHRASE ? 'FOUND' : 'MISSING'}`);

if (process.env.OKX_API_KEY) {
    console.log(`API Key sample: ${process.env.OKX_API_KEY.substring(0, 8)}...`);
}
if (process.env.OKX_SECRET_KEY) {
    console.log(`Secret Key sample: ${process.env.OKX_SECRET_KEY.substring(0, 8)}...`);
    console.log(`Secret Key type: ${typeof process.env.OKX_SECRET_KEY}`);
    console.log(`Secret Key length: ${process.env.OKX_SECRET_KEY.length}`);
}

// Test OKX Client
console.log('\n=== Testing OKX Client ===');
try {
    const OKXClient = require('./okx-client');
    const client = new OKXClient({
        apiKey: process.env.OKX_API_KEY,
        secretKey: process.env.OKX_SECRET_KEY,
        passphrase: process.env.OKX_PASSPHRASE
    });
    console.log('✅ OKX Client created successfully');
    
    // Test signature
    const timestamp = new Date().toISOString();
    const signature = client.generateSignature(timestamp, 'GET', '/api/v5/market/ticker?instId=SOL-USDT', '');
    console.log('✅ Signature generated successfully');
    console.log(`Signature: ${signature.substring(0, 20)}...`);
    
} catch (error) {
    console.log(`❌ OKX Client error: ${error.message}`);
}

console.log('\n=== Test completed ===');

// Keep running for PM2
setInterval(() => {
    console.log(`[${new Date().toISOString()}] PM2 test still running...`);
}, 30000);
