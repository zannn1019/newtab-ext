/**
 * Binance API Helper for Trading Journal
 * 
 * This module handles secure communication with Binance REST API
 * to fetch historical trading data for the Journal view.
 * 
 * Security: Uses HMAC SHA256 signing for authenticated requests.
 * All API keys are stored locally and never transmitted except to Binance.
 */

import CryptoJS from 'crypto-js'

const BINANCE_API_BASE = 'https://api.binance.com'

/**
 * Create HMAC SHA256 signature for Binance API request
 * @param {string} queryString - Query parameters to sign
 * @param {string} apiSecret - Binance API secret key
 * @returns {string} - Hex signature
 */
const createSignature = (queryString, apiSecret) => {
    return CryptoJS.HmacSHA256(queryString, apiSecret).toString(CryptoJS.enc.Hex)
}

/**
 * Build signed query string with timestamp
 * @param {Object} params - Query parameters
 * @param {string} apiSecret - API secret for signing
 * @returns {string} - Signed query string
 */
const buildSignedQuery = (params, apiSecret) => {
    const timestamp = Date.now()
    const queryString = new URLSearchParams({
        ...params,
        recvWindow: 5000,
        timestamp
    }).toString()

    const signature = createSignature(queryString, apiSecret)
    return `${queryString}&signature=${signature}`
}

/**
 * Fetch account trading history for a symbol
 * @param {string} symbol - Trading pair (e.g., 'BTCUSDT')
 * @param {string} apiKey - Binance API key
 * @param {string} apiSecret - Binance API secret
 * @param {number} limit - Max trades to fetch (default: 1000)
 * @returns {Promise<Array>} - Array of trade objects
 */
export const fetchMyTrades = async (symbol, apiKey, apiSecret, limit = 1000) => {
    try {
        const params = {
            symbol: symbol.toUpperCase(),
            limit: Math.min(limit, 1000) // Binance max is 1000
        }

        const signedQuery = buildSignedQuery(params, apiSecret)
        const url = `${BINANCE_API_BASE}/api/v3/myTrades?${signedQuery}`

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-MBX-APIKEY': apiKey
            }
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.msg || `HTTP ${response.status}`)
        }

        const trades = await response.json()
        return trades.map(trade => ({
            symbol: trade.symbol,
            orderId: trade.orderId,
            side: trade.isBuyer ? 'BUY' : 'SELL',
            price: trade.price,
            qty: trade.qty,
            commission: trade.commission,
            commissionAsset: trade.commissionAsset,
            time: trade.time,
            isMaker: trade.isMaker
        }))

    } catch (error) {
        console.error(`Failed to fetch trades for ${symbol}:`, error)
        throw error
    }
}

/**
 * Fetch trades for multiple symbols with progress callback
 * @param {Array<string>} symbols - Array of trading pairs
 * @param {string} apiKey - Binance API key
 * @param {string} apiSecret - Binance API secret
 * @param {Function} onProgress - Progress callback (currentIndex, total, symbol)
 * @returns {Promise<Array>} - Combined array of all trades
 */
export const fetchMultipleSymbols = async (symbols, apiKey, apiSecret, onProgress) => {
    const allTrades = []

    for (let i = 0; i < symbols.length; i++) {
        const symbol = symbols[i].trim()
        
        if (onProgress) {
            onProgress(i, symbols.length, symbol)
        }

        try {
            const trades = await fetchMyTrades(symbol, apiKey, apiSecret)
            allTrades.push(...trades)
            
            // Respect Binance rate limits (1200 requests per minute)
            // Add small delay between requests
            if (i < symbols.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100))
            }
        } catch (error) {
            console.warn(`Skipping ${symbol} due to error:`, error.message)
            // Continue with other symbols even if one fails
        }
    }

    return allTrades
}

/**
 * Test API connection with minimal request
 * @param {string} apiKey - Binance API key
 * @param {string} apiSecret - Binance API secret
 * @returns {Promise<boolean>} - True if connection successful
 */
export const testConnection = async (apiKey, apiSecret) => {
    try {
        const signedQuery = buildSignedQuery({}, apiSecret)
        const url = `${BINANCE_API_BASE}/api/v3/account?${signedQuery}`

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-MBX-APIKEY': apiKey
            }
        })

        return response.ok
    } catch (error) {
        console.error('Connection test failed:', error)
        return false
    }
}

/**
 * Validate API key format
 * @param {string} apiKey - API key to validate
 * @returns {boolean} - True if format is valid
 */
export const validateApiKey = (apiKey) => {
    // Binance API keys are 64 character alphanumeric strings
    return typeof apiKey === 'string' && 
           apiKey.length === 64 && 
           /^[A-Za-z0-9]+$/.test(apiKey)
}

/**
 * Validate API secret format
 * @param {string} apiSecret - API secret to validate
 * @returns {boolean} - True if format is valid
 */
export const validateApiSecret = (apiSecret) => {
    // Binance API secrets are 64 character alphanumeric strings
    return typeof apiSecret === 'string' && 
           apiSecret.length === 64 && 
           /^[A-Za-z0-9]+$/.test(apiSecret)
}

/**
 * Error codes and messages
 */
export const BinanceErrors = {
    INVALID_API_KEY: 'Invalid API key format',
    INVALID_API_SECRET: 'Invalid API secret format',
    UNAUTHORIZED: 'API key does not have permission',
    RATE_LIMIT: 'Rate limit exceeded, please wait',
    INVALID_SYMBOL: 'Invalid trading pair symbol',
    CONNECTION_FAILED: 'Failed to connect to Binance API'
}

/**
 * Parse Binance error response
 * @param {Error} error - Error object
 * @returns {string} - User-friendly error message
 */
export const parseError = (error) => {
    const message = error.message.toLowerCase()

    if (message.includes('api-key')) {
        return BinanceErrors.UNAUTHORIZED
    }
    if (message.includes('rate limit')) {
        return BinanceErrors.RATE_LIMIT
    }
    if (message.includes('invalid symbol')) {
        return BinanceErrors.INVALID_SYMBOL
    }
    if (message.includes('network') || message.includes('fetch')) {
        return BinanceErrors.CONNECTION_FAILED
    }

    return error.message
}

/**
 * Example usage:
 * 
 * import { fetchMultipleSymbols, testConnection } from '@/utils/binanceApi'
 * 
 * // Test connection first
 * const isValid = await testConnection(apiKey, apiSecret)
 * if (!isValid) {
 *   console.error('Invalid credentials')
 *   return
 * }
 * 
 * // Fetch trades with progress
 * const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT']
 * const trades = await fetchMultipleSymbols(
 *   symbols,
 *   apiKey,
 *   apiSecret,
 *   (current, total, symbol) => {
 *     console.log(`Fetching ${symbol}... (${current + 1}/${total})`)
 *   }
 * )
 * 
 * console.log(`Fetched ${trades.length} total trades`)
 */
