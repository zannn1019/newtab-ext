/**
 * Binance API Helper for Trading Journal
 *
 * This module handles secure communication with Binance REST API
 * to fetch historical trading data for the Journal view.
 *
 * Security: Uses HMAC SHA256 signing for authenticated requests.
 * All API keys are stored locally and never transmitted except to Binance.
 */

import CryptoJS from "crypto-js";

const BINANCE_API_BASE = "https://api.binance.com";
const BINANCE_FUTURES_BASE = "https://fapi.binance.com";

// Time offset to sync with Binance server time
let timeOffset = 0;
let timeOffsetInitialized = false;

/**
 * Sync time with Binance server to avoid timestamp errors
 * @returns {Promise<void>}
 */
const syncServerTime = async () => {
  try {
    const response = await fetch(`${BINANCE_API_BASE}/api/v3/time`);
    const data = await response.json();
    const serverTime = data.serverTime;
    const localTime = Date.now();
    timeOffset = serverTime - localTime;
    timeOffsetInitialized = true;
    console.log(`Time synced with Binance. Offset: ${timeOffset}ms`);
  } catch (error) {
    console.warn("Failed to sync time with Binance, using local time:", error);
    timeOffset = 0;
    timeOffsetInitialized = true;
  }
};

/**
 * Get current timestamp adjusted for Binance server time
 * @returns {number} - Adjusted timestamp
 */
const getTimestamp = async () => {
  if (!timeOffsetInitialized) {
    await syncServerTime();
  }
  return Date.now() + timeOffset;
};

/**
 * Create HMAC SHA256 signature for Binance API request
 * @param {string} queryString - Query parameters to sign
 * @param {string} apiSecret - Binance API secret key
 * @returns {string} - Hex signature
 */
const createSignature = (queryString, apiSecret) => {
  return CryptoJS.HmacSHA256(queryString, apiSecret).toString(CryptoJS.enc.Hex);
};

/**
 * Build signed query string with timestamp
 * @param {Object} params - Query parameters
 * @param {string} apiSecret - API secret for signing
 * @returns {Promise<string>} - Signed query string
 */
const buildSignedQuery = async (params, apiSecret) => {
  const timestamp = await getTimestamp();
  const queryString = new URLSearchParams({
    ...params,
    recvWindow: 60000, // Increased to 60 seconds for better tolerance
    timestamp,
  }).toString();

  const signature = createSignature(queryString, apiSecret);
  return `${queryString}&signature=${signature}`;
};

/**
 * Make API call via background service worker (bypasses CORS)
 * @param {string} url - Full API URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - API response data
 */
const callViaBackground = (url, options) => {
  return new Promise((resolve, reject) => {
    // Check if chrome.runtime is available
    if (typeof chrome === "undefined" || !chrome.runtime) {
      reject(
        new Error(
          "Chrome extension APIs not available. Make sure you are running as a browser extension."
        )
      );
      return;
    }

    console.log("📡 Sending message to background script:", {
      url: url.substring(0, 50) + "...",
    });

    chrome.runtime.sendMessage(
      { action: "binanceApiCall", url, options },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error(
            "❌ Chrome runtime error:",
            chrome.runtime.lastError.message
          );
          reject(new Error(chrome.runtime.lastError.message));
        } else if (!response) {
          console.error("❌ No response from background script");
          reject(
            new Error(
              "No response from background service worker. Make sure background.js is loaded."
            )
          );
        } else if (response.success) {
          console.log("✅ Background script returned data");
          resolve(response.data);
        } else {
          console.error("❌ Background script error:", response.error);
          reject(new Error(response.error));
        }
      }
    );
  });
};

/**
 * Fetch account trading history for a symbol (supports both SPOT and FUTURES)
 * @param {string} symbol - Trading pair (e.g., 'BTCUSDT')
 * @param {string} apiKey - Binance API key
 * @param {string} apiSecret - Binance API secret
 * @param {number} limit - Max trades to fetch (default: 1000)
 * @param {string} market - 'spot' or 'futures' (default: 'spot')
 * @returns {Promise<Array>} - Array of trade objects
 */
export const fetchMyTrades = async (
  symbol,
  apiKey,
  apiSecret,
  limit = 1000,
  market = "spot"
) => {
  try {
    const params = {
      symbol: symbol.toUpperCase(),
      limit: Math.min(limit, 1000), // Binance max is 1000
    };

    const signedQuery = await buildSignedQuery(params, apiSecret);
    
    // Use different base URL based on market type
    const baseUrl = market === "futures" ? BINANCE_FUTURES_BASE : BINANCE_API_BASE;
    const endpoint = market === "futures" ? "/fapi/v1/userTrades" : "/api/v3/myTrades";
    const url = `${baseUrl}${endpoint}?${signedQuery}`;

    console.log(`Fetching ${market.toUpperCase()} trades for ${symbol}...`);

    const options = {
      method: "GET",
      headers: {
        "X-MBX-APIKEY": apiKey,
      },
    };

    const trades = await callViaBackground(url, options);

    console.log(`✅ ${symbol} (${market.toUpperCase()}) returned ${trades.length} trades`);

    return trades.map((trade) => ({
      symbol: trade.symbol,
      orderId: trade.orderId,
      side: market === "futures" ? trade.side : (trade.isBuyer ? "BUY" : "SELL"),
      price: trade.price,
      qty: trade.qty,
      commission: trade.commission,
      commissionAsset: trade.commissionAsset,
      time: trade.time,
      isMaker: trade.isMaker,
    }));
  } catch (error) {
    console.error(`❌ Failed to fetch ${market} trades for ${symbol}:`, error);
    throw error;
  }
};

/**
 * Fetch trades for multiple symbols with progress callback
 * @param {Array<string>} symbols - Array of trading pairs
 * @param {string} apiKey - Binance API key
 * @param {string} apiSecret - Binance API secret
 * @param {Function} onProgress - Progress callback (currentIndex, total, symbol)
 * @returns {Promise<Array>} - Combined array of all trades
 */
export const fetchMultipleSymbols = async (
  symbols,
  apiKey,
  apiSecret,
  onProgress
) => {
  const allTrades = [];

  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i].trim();

    if (onProgress) {
      onProgress(i, symbols.length, symbol);
    }

    try {
      const trades = await fetchMyTrades(symbol, apiKey, apiSecret);
      allTrades.push(...trades);

      // Respect Binance rate limits (1200 requests per minute)
      // Add small delay between requests
      if (i < symbols.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.warn(`Skipping ${symbol} due to error:`, error.message);
      // Continue with other symbols even if one fails
    }
  }

  return allTrades;
};

/**
 * Fetch all trades from account across discovered symbols
 * Since /api/v3/myTrades requires a symbol, we:
 * 1. Check account balances to find assets
 * 2. Generate possible trading pairs
 * 3. Fetch trades for each pair (skip if empty)
 *
 * @param {string} apiKey - Binance API key
 * @param {string} apiSecret - Binance API secret
 * @param {Array<string>} userSymbols - Optional: User-specified symbols to check first
 * @param {string} marketType - 'spot', 'futures', or 'both' (default: 'spot')
 * @param {Function} onProgress - Progress callback (message)
 * @returns {Promise<Object>} - { trades: Array, symbols: Array }
 */
export const fetchAllTrades = async (
  apiKey,
  apiSecret,
  userSymbols = [],
  marketType = 'spot',
  onProgress
) => {
  try {
    const allTrades = [];
    const foundSymbols = new Set();

    console.log("🔍 Starting trade fetch...");
    console.log("User symbols:", userSymbols);
    console.log("Market type:", marketType.toUpperCase());

    // Step 1: Try user-specified symbols first (if provided)
    if (userSymbols && userSymbols.length > 0) {
      if (onProgress)
        onProgress(`Checking ${userSymbols.length} specified symbols...`);
      console.log(`📋 Checking ${userSymbols.length} user-specified symbols`);

      for (let i = 0; i < userSymbols.length; i++) {
        const symbol = userSymbols[i].trim().toUpperCase();
        console.log(`   Checking ${symbol}...`);

        try {
          // Check which markets to try based on marketType setting
          if (marketType === 'spot' || marketType === 'both') {
            const trades = await fetchMyTrades(symbol, apiKey, apiSecret, 1000, 'spot');

            if (trades.length > 0) {
              allTrades.push(...trades);
              foundSymbols.add(symbol);
              console.log(`   ✅ ${symbol}: Found ${trades.length} trades (SPOT)`);
              if (onProgress) onProgress(`✓ ${symbol}: ${trades.length} spot trades`);
            } else {
              console.log(`   ⚠️ ${symbol}: No SPOT trades found`);
            }
          }

          // Try FUTURES if it's futures or both
          if (marketType === 'futures' || (marketType === 'both' && allTrades.length === 0)) {
            console.log(`   🔄 Checking FUTURES for ${symbol}...`);
            
            try {
              const futuresTrades = await fetchMyTrades(symbol, apiKey, apiSecret, 1000, 'futures');
              
              if (futuresTrades.length > 0) {
                allTrades.push(...futuresTrades);
                foundSymbols.add(symbol);
                console.log(`   ✅ ${symbol}: Found ${futuresTrades.length} trades (FUTURES)`);
                if (onProgress) onProgress(`✓ ${symbol}: ${futuresTrades.length} futures trades`);
              } else {
                console.log(`   ⚠️ ${symbol}: No FUTURES trades found`);
              }
            } catch (futuresError) {
              console.log(`   ℹ️ FUTURES not available for ${symbol}:`, futuresError.message);
            }
          }

          await new Promise((resolve) => setTimeout(resolve, 150));
        } catch (error) {
          console.error(`   ❌ ${symbol}: Error -`, error.message);
        }
      }
    }

    console.log(
      `📊 After user symbols check: ${allTrades.length} trades from ${foundSymbols.size} symbols`
    );

    // Step 2: Get account info to discover more symbols
    if (onProgress)
      onProgress("Scanning account for additional trading pairs...");
    console.log("🔍 Fetching account info...");

    const signedQuery = await buildSignedQuery({}, apiSecret);
    const accountUrl = `${BINANCE_API_BASE}/api/v3/account?${signedQuery}`;

    const options = {
      method: "GET",
      headers: {
        "X-MBX-APIKEY": apiKey,
      },
    };

    const accountData = await callViaBackground(accountUrl, options);
    console.log("✅ Account data received");
    console.log("📊 Account details:", {
      canTrade: accountData.canTrade,
      canWithdraw: accountData.canWithdraw,
      canDeposit: accountData.canDeposit,
      updateTime: new Date(accountData.updateTime).toLocaleString(),
      accountType: accountData.accountType,
      permissions: accountData.permissions,
    });

    // Get assets with non-zero balance
    const assets = accountData.balances
      .filter((b) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
      .map((b) => b.asset);

    console.log(
      `💰 Found ${assets.length} assets with balance:`,
      assets.slice(0, 10).join(", "),
      "..."
    );

    // Show actual balances for debugging
    const nonZeroBalances = accountData.balances
      .filter((b) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
      .slice(0, 5);
    console.log(
      "💵 Top balances:",
      nonZeroBalances.map((b) => `${b.asset}: ${b.free}`)
    );

    if (onProgress) onProgress(`Found ${assets.length} assets in account`);

    // Generate possible trading pairs (prioritize USDT, then others)
    const quoteAssets = ["USDT", "BUSD", "BTC", "ETH", "BNB", "USDC"];
    const possibleSymbols = [];

    // Prioritize USDT pairs (most common)
    assets.forEach((asset) => {
      if (asset !== "USDT") {
        possibleSymbols.push(`${asset}USDT`);
      }
    });

    // Then add other quote assets
    assets.forEach((asset) => {
      quoteAssets.slice(1).forEach((quote) => {
        if (asset !== quote) {
          possibleSymbols.push(`${asset}${quote}`);
        }
      });
    });

    // Remove duplicates and already-checked symbols
    const symbolsToCheck = [...new Set(possibleSymbols)].filter(
      (s) => !foundSymbols.has(s)
    );

    if (symbolsToCheck.length === 0) {
      if (onProgress)
        onProgress(
          `Total: ${allTrades.length} trades from ${foundSymbols.size} symbols`
        );
      return {
        trades: allTrades,
        symbols: Array.from(foundSymbols).sort(),
      };
    }

    if (onProgress)
      onProgress(`Checking ${symbolsToCheck.length} additional pairs...`);

    // Step 3: Check additional symbols
    for (let i = 0; i < symbolsToCheck.length; i++) {
      const symbol = symbolsToCheck[i];

      if (i % 5 === 0 && onProgress) {
        onProgress(`Progress: ${i}/${symbolsToCheck.length} checked...`);
      }

      try {
        const trades = await fetchMyTrades(symbol, apiKey, apiSecret, 1000);

        if (trades.length > 0) {
          allTrades.push(...trades);
          foundSymbols.add(symbol);
          console.log(`✓ ${symbol}: ${trades.length} trades`);
        }

        // Rate limiting - 150ms between requests
        await new Promise((resolve) => setTimeout(resolve, 150));
      } catch (error) {
        // Silently skip invalid symbols or symbols with no trades
        // Most generated pairs won't have trades, this is expected
      }
    }

    if (onProgress)
      onProgress(
        `Complete! ${allTrades.length} trades from ${foundSymbols.size} symbols`
      );

    return {
      trades: allTrades,
      symbols: Array.from(foundSymbols).sort(),
    };
  } catch (error) {
    console.error("Failed to fetch trades:", error);
    throw error;
  }
};

/**
 * Test API connection with minimal request
 * @param {string} apiKey - Binance API key
 * @param {string} apiSecret - Binance API secret
 * @returns {Promise<boolean>} - True if connection successful
 */
export const testConnection = async (apiKey, apiSecret) => {
  try {
    // Sync time first to avoid timestamp errors
    await syncServerTime();

    const signedQuery = await buildSignedQuery({}, apiSecret);
    const url = `${BINANCE_API_BASE}/api/v3/account?${signedQuery}`;

    const options = {
      method: "GET",
      headers: {
        "X-MBX-APIKEY": apiKey,
      },
    };

    await callViaBackground(url, options);
    return true;
  } catch (error) {
    console.error("Connection test failed:", error);
    return false;
  }
};

/**
 * Validate API key format
 * @param {string} apiKey - API key to validate
 * @returns {boolean} - True if format is valid
 */
export const validateApiKey = (apiKey) => {
  // Binance API keys are 64 character alphanumeric strings
  return (
    typeof apiKey === "string" &&
    apiKey.length === 64 &&
    /^[A-Za-z0-9]+$/.test(apiKey)
  );
};

/**
 * Validate API secret format
 * @param {string} apiSecret - API secret to validate
 * @returns {boolean} - True if format is valid
 */
export const validateApiSecret = (apiSecret) => {
  // Binance API secrets are 64 character alphanumeric strings
  return (
    typeof apiSecret === "string" &&
    apiSecret.length === 64 &&
    /^[A-Za-z0-9]+$/.test(apiSecret)
  );
};

/**
 * Sync time with Binance server (public export for manual sync)
 * @returns {Promise<void>}
 */
export { syncServerTime };

/**
 * Error codes and messages
 */
export const BinanceErrors = {
  INVALID_API_KEY: "Invalid API key format",
  INVALID_API_SECRET: "Invalid API secret format",
  UNAUTHORIZED: "API key does not have permission",
  RATE_LIMIT: "Rate limit exceeded, please wait",
  INVALID_SYMBOL: "Invalid trading pair symbol",
  CONNECTION_FAILED: "Failed to connect to Binance API",
};

/**
 * Parse Binance error response
 * @param {Error} error - Error object
 * @returns {string} - User-friendly error message
 */
export const parseError = (error) => {
  const message = error.message.toLowerCase();

  if (message.includes("api-key")) {
    return BinanceErrors.UNAUTHORIZED;
  }
  if (message.includes("rate limit")) {
    return BinanceErrors.RATE_LIMIT;
  }
  if (message.includes("invalid symbol")) {
    return BinanceErrors.INVALID_SYMBOL;
  }
  if (message.includes("network") || message.includes("fetch")) {
    return BinanceErrors.CONNECTION_FAILED;
  }

  return error.message;
};

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
