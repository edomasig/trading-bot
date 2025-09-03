const axios = require('axios');

async function testOKXEndpoints() {
    console.log('🌐 Testing OKX API Endpoints...\n');
    
    const endpoints = [
        'https://www.okx.com/api/v5/public/instruments?instType=SPOT',
        'https://aws.okx.com/api/v5/public/instruments?instType=SPOT',
        'https://okx.com/api/v5/public/instruments?instType=SPOT'
    ];
    
    for (const endpoint of endpoints) {
        try {
            console.log(`Testing: ${endpoint}`);
            const response = await axios.get(endpoint, { timeout: 10000 });
            
            if (response.data && response.data.code === '0') {
                console.log(`✅ SUCCESS! Found ${response.data.data.length} instruments`);
                
                // Check for WLFI pairs
                const wlfiPairs = response.data.data.filter(inst => inst.instId.includes('WLFI'));
                if (wlfiPairs.length > 0) {
                    console.log('🎯 WLFI pairs found:');
                    wlfiPairs.forEach(pair => {
                        console.log(`   - ${pair.instId} (Min size: ${pair.minSz})`);
                    });
                } else {
                    console.log('❌ No WLFI pairs found');
                }
                
                // Check for BTC-USDT
                const btcPair = response.data.data.find(inst => inst.instId === 'BTC-USDT');
                if (btcPair) {
                    console.log(`✅ BTC-USDT is available (Min size: ${btcPair.minSz})`);
                }
                
                console.log('\n✅ This endpoint works! Update your .env file:\n');
                const url = new URL(endpoint);
                console.log(`OKX_BASE_URL=${url.origin}`);
                break;
                
            } else {
                console.log(`❌ API returned error: ${response.data?.msg || 'Unknown error'}`);
            }
            
        } catch (error) {
            console.log(`❌ Failed: ${error.message}`);
        }
        console.log('');
    }
}

testOKXEndpoints();
