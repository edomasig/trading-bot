const crypto = require('crypto');
const axios = require('axios');

/**
 * OKX API Client Class
 * Handles authentication and API requests to OKX exchange
 */
class OKXClient {
    constructor(apiKey, secretKey, passphrase, baseUrl = 'https://www.okx.com') {
        // Support both positional args and an options object
        if (typeof apiKey === 'object' && apiKey !== null) {
            const opts = apiKey;
            this.apiKey = opts.apiKey || opts.key;
            this.secretKey = opts.secretKey || opts.secret || opts.secret_key;
            this.passphrase = opts.passphrase || opts.pass || opts.password;
            this.baseUrl = opts.baseURL || opts.baseUrl || 'https://www.okx.com';
            this.apiVersion = opts.apiVersion || 'api/v5';
        } else {
            this.apiKey = apiKey;
            this.secretKey = secretKey;
            this.passphrase = passphrase;
            this.baseUrl = baseUrl;
            this.apiVersion = 'api/v5';
        }

        // Basic validation to surface clearer errors early
        if (!this.apiKey) {
            throw new Error('OKXClient initialization error: apiKey is missing');
        }
        if (!this.secretKey) {
            throw new Error('OKXClient initialization error: secretKey is missing');
        }
        if (!this.passphrase) {
            throw new Error('OKXClient initialization error: passphrase is missing');
        }
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

        // Add demo trading header if in demo mode
        if (process.env.OKX_DEMO_MODE === 'true') {
            headers['x-simulated-trading'] = '1';
        }

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

    /**
     * Get comprehensive market data including volume, 24h change, etc.
     * @param {string} symbol - Trading pair
     * @returns {Promise<Object|null>} Market data object
     */
    async getMarketData(symbol) {
        try {
            const data = await this.makeRequest('GET', `/market/ticker?instId=${symbol}`);
            if (data && data.length > 0) {
                const ticker = data[0];
                return {
                    symbol: ticker.instId,
                    price: parseFloat(ticker.last),
                    high24h: parseFloat(ticker.high24h),
                    low24h: parseFloat(ticker.low24h),
                    open24h: parseFloat(ticker.open24h),
                    priceChange24h: parseFloat(ticker.last) - parseFloat(ticker.open24h),
                    priceChangePercent24h: ((parseFloat(ticker.last) - parseFloat(ticker.open24h)) / parseFloat(ticker.open24h)) * 100,
                    volume24h: parseFloat(ticker.vol24h),
                    volumeQuote24h: parseFloat(ticker.volCcy24h),
                    bid: parseFloat(ticker.bidPx),
                    ask: parseFloat(ticker.askPx),
                    spread: parseFloat(ticker.askPx) - parseFloat(ticker.bidPx),
                    spreadPercent: ((parseFloat(ticker.askPx) - parseFloat(ticker.bidPx)) / parseFloat(ticker.last)) * 100,
                    timestamp: parseInt(ticker.ts)
                };
            }
            return null;
        } catch (error) {
            console.error('Error fetching market data:', error.message);
            return null;
        }
    }

    /**
     * Get historical candlestick data for technical analysis
     * @param {string} symbol - Trading pair
     * @param {string} timeframe - '1m', '5m', '15m', '1H', '4H', '1D'
     * @param {number} limit - Number of candles (max 300)
     * @returns {Promise<Array|null>} Array of OHLCV data
     */
    async getCandlesticks(symbol, timeframe = '5m', limit = 100) {
        try {
            const data = await this.makeRequest('GET', `/market/candles?instId=${symbol}&bar=${timeframe}&limit=${limit}`);
            if (data) {
                return data.map(candle => ({
                    timestamp: parseInt(candle[0]),
                    open: parseFloat(candle[1]),
                    high: parseFloat(candle[2]),
                    low: parseFloat(candle[3]),
                    close: parseFloat(candle[4]),
                    volume: parseFloat(candle[5]),
                    volumeQuote: parseFloat(candle[6])
                }));
            }
            return null;
        } catch (error) {
            console.error('Error fetching candlesticks:', error.message);
            return null;
        }
    }

    /**
     * Get order book depth
     * @param {string} symbol - Trading pair
     * @param {number} depth - Depth of order book (5, 10, 20, 50, 100, 400)
     * @returns {Promise<Object|null>} Order book data
     */
    async getOrderBook(symbol, depth = 20) {
        try {
            const data = await this.makeRequest('GET', `/market/books?instId=${symbol}&sz=${depth}`);
            if (data && data.length > 0) {
                const book = data[0];
                return {
                    symbol: symbol,
                    bids: book.bids.map(bid => ({
                        price: parseFloat(bid[0]),
                        size: parseFloat(bid[1])
                    })),
                    asks: book.asks.map(ask => ({
                        price: parseFloat(ask[0]),
                        size: parseFloat(ask[1])
                    })),
                    timestamp: parseInt(book.ts)
                };
            }
            return null;
        } catch (error) {
            console.error('Error fetching order book:', error.message);
            return null;
        }
    }

    /**
     * Get recent trades data
     * @param {string} symbol - Trading pair
     * @param {number} limit - Number of recent trades (max 500)
     * @returns {Promise<Array|null>} Array of recent trades
     */
    async getRecentTrades(symbol, limit = 100) {
        try {
            const data = await this.makeRequest('GET', `/market/trades?instId=${symbol}&limit=${limit}`);
            if (data) {
                return data.map(trade => ({
                    tradeId: trade.tradeId,
                    price: parseFloat(trade.px),
                    size: parseFloat(trade.sz),
                    side: trade.side,
                    timestamp: parseInt(trade.ts)
                }));
            }
            return null;
        } catch (error) {
            console.error('Error fetching recent trades:', error.message);
            return null;
        }
    }

    /**
     * Get instrument information including tick size, lot size, etc.
     * @param {string} symbol - Trading pair
     * @returns {Promise<Object|null>} Instrument details
     */
    async getInstrumentInfo(symbol) {
        try {
            const data = await this.makeRequest('GET', `/public/instruments?instType=SPOT&instId=${symbol}`);
            if (data && data.length > 0) {
                const instrument = data[0];
                return {
                    symbol: instrument.instId,
                    baseCurrency: instrument.baseCcy,
                    quoteCurrency: instrument.quoteCcy,
                    tickSize: parseFloat(instrument.tickSz),
                    lotSize: parseFloat(instrument.lotSz),
                    minSize: parseFloat(instrument.minSz),
                    state: instrument.state
                };
            }
            return null;
        } catch (error) {
            console.error('Error fetching instrument info:', error.message);
            return null;
        }
    }
}

module.exports = OKXClient;
