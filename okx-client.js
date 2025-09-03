const crypto = require('crypto');
const axios = require('axios');

/**
 * OKX API Client Class
 * Handles authentication and API requests to OKX exchange
 */
class OKXClient {
    constructor(apiKey, secretKey, passphrase, baseUrl = 'https://www.okx.com') {
        this.apiKey = apiKey;
        this.secretKey = secretKey;
        this.passphrase = passphrase;
        this.baseUrl = baseUrl;
        this.apiVersion = 'api/v5';
    }

    /**
     * Generate signature for OKX API authentication
     * @param {string} timestamp - ISO timestamp
     * @param {string} method - HTTP method (GET, POST, etc.)
     * @param {string} requestPath - API endpoint path
     * @param {string} body - Request body (empty string for GET requests)
     * @returns {string} Base64 encoded signature
     */
    generateSignature(timestamp, method, requestPath, body) {
        const message = timestamp + method + requestPath + body;
        return crypto.createHmac('sha256', this.secretKey).update(message).digest('base64');
    }

    /**
     * Make authenticated request to OKX API
     * @param {string} method - HTTP method
     * @param {string} endpoint - API endpoint (without base URL)
     * @param {object} data - Request data for POST requests
     * @returns {Promise<object>} API response data
     */
    async makeRequest(method, endpoint, data = null) {
        const timestamp = new Date().toISOString();
        const requestPath = `/${this.apiVersion}${endpoint}`;
        const body = data ? JSON.stringify(data) : '';
        
        const signature = this.generateSignature(timestamp, method, requestPath, body);
        
        const headers = {
            'OK-ACCESS-KEY': this.apiKey,
            'OK-ACCESS-SIGN': signature,
            'OK-ACCESS-TIMESTAMP': timestamp,
            'OK-ACCESS-PASSPHRASE': this.passphrase,
            'Content-Type': 'application/json'
        };

        const config = {
            method,
            url: `${this.baseUrl}${requestPath}`,
            headers,
            timeout: 10000, // 10 seconds timeout
        };

        if (data && method !== 'GET') {
            config.data = data;
        }

        try {
            const response = await axios(config);
            
            if (response.data.code === '0') {
                return response.data.data;
            } else {
                throw new Error(`OKX API Error: ${response.data.msg} (Code: ${response.data.code})`);
            }
        } catch (error) {
            if (error.response) {
                throw new Error(`HTTP ${error.response.status}: ${error.response.data?.msg || error.message}`);
            } else if (error.request) {
                throw new Error('Network error: No response from OKX API');
            } else {
                throw error;
            }
        }
    }

    /**
     * Get current market price for a trading pair
     * @param {string} symbol - Trading pair symbol (e.g., 'BTC-USDT')
     * @returns {Promise<number>} Current market price
     */
    async getPrice(symbol) {
        const data = await this.makeRequest('GET', `/market/ticker?instId=${symbol}`);
        if (data && data.length > 0) {
            return parseFloat(data[0].last);
        }
        throw new Error(`No price data found for ${symbol}`);
    }

    /**
     * Get account balances
     * @returns {Promise<object>} Account balances by currency
     */
    async getBalances() {
        const data = await this.makeRequest('GET', '/account/balance');
        const balances = {};
        
        if (data && data.length > 0) {
            data[0].details.forEach(detail => {
                balances[detail.ccy] = {
                    available: parseFloat(detail.availBal),
                    total: parseFloat(detail.bal)
                };
            });
        }
        
        return balances;
    }

    /**
     * Place a market order
     * @param {string} symbol - Trading pair symbol
     * @param {string} side - Order side ('buy' or 'sell')
     * @param {number} size - Order size
     * @param {string} orderType - Order type ('market' or 'limit')
     * @returns {Promise<object>} Order response
     */
    async placeOrder(symbol, side, size, orderType = 'market') {
        const orderData = {
            instId: symbol,
            tdMode: 'cash', // Cash trading mode
            side: side,
            ordType: orderType,
            sz: size.toString()
        };

        // For market buy orders, specify quote currency amount
        if (side === 'buy' && orderType === 'market') {
            orderData.tgtCcy = 'quote_ccy';
        }

        const data = await this.makeRequest('POST', '/trade/order', orderData);
        return data;
    }
}

module.exports = OKXClient;
