# 🔧 Binance API Integration Guide

## Overview

This guide explains how to integrate the real Binance API into the Journal view to replace the mock data with actual trading history.

---

## 📦 Required Dependencies

Already installed:

```bash
npm install crypto-js
```

This provides HMAC SHA256 hashing for API request signing.

---

## 🔌 Integration Steps

### Step 1: Update JournalView.vue

Replace the mock `fetchBinanceTrades` function with the real API call.

**Current (Mock) Code** (lines ~215-240 in JournalView.vue):

```javascript
const fetchBinanceTrades = async (symbol) => {
  // This should call real Binance API with crypto-js for signing
  // For now, return mock data
  const mockTrades = [];
  const count = Math.floor(Math.random() * 20) + 10;
  // ... mock data generation
  return mockTrades;
};
```

**Replace With** (Real API):

```javascript
import { fetchMyTrades } from "@/utils/binanceApi";

const fetchBinanceTrades = async (symbol) => {
  try {
    return await fetchMyTrades(
      symbol,
      config.value.apiKey,
      config.value.apiSecret,
      1000 // max trades per symbol
    );
  } catch (error) {
    console.error(`Failed to fetch ${symbol}:`, error);
    throw new Error(`Could not fetch trades for ${symbol}: ${error.message}`);
  }
};
```

### Step 2: Update startInitialSync Function

Add better error handling and validation.

**Add at the beginning of `startInitialSync`**:

```javascript
import {
  testConnection,
  validateApiKey,
  validateApiSecret,
  parseError,
} from "@/utils/binanceApi";

const startInitialSync = async () => {
  // Validate config
  if (!config.value.apiKey || !config.value.apiSecret) {
    showConfig.value = true;
    return;
  }

  // Validate format
  if (!validateApiKey(config.value.apiKey)) {
    syncMessage.value = "Invalid API key format";
    syncDetail.value = "API keys should be 64 characters";
    await new Promise((resolve) => setTimeout(resolve, 2000));
    showConfig.value = true;
    return;
  }

  if (!validateApiSecret(config.value.apiSecret)) {
    syncMessage.value = "Invalid API secret format";
    syncDetail.value = "API secrets should be 64 characters";
    await new Promise((resolve) => setTimeout(resolve, 2000));
    showConfig.value = true;
    return;
  }

  isSyncing.value = true;
  syncMessage.value = "Testing connection...";
  syncDetail.value = "";

  // Test connection first
  try {
    const isValid = await testConnection(
      config.value.apiKey,
      config.value.apiSecret
    );
    if (!isValid) {
      throw new Error("Invalid credentials or insufficient permissions");
    }
  } catch (error) {
    syncMessage.value = "Connection failed";
    syncDetail.value = parseError(error);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    isSyncing.value = false;
    showConfig.value = true;
    return;
  }

  // Continue with existing sync logic...
  syncMessage.value = "Connecting to Binance...";
  // ... rest of function
};
```

### Step 3: Enhanced Error Handling

Wrap the fetch loop in better error handling:

```javascript
try {
  const symbols = config.value.symbols.split(",").map((s) => s.trim());
  let allTrades = [];

  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i];
    syncMessage.value = `Fetching ${symbol} trades...`;
    syncDetail.value = `${i + 1} of ${symbols.length} symbols`;

    if (progressBarRef.value) {
      gsap.to(progressBarRef.value, {
        width: `${30 + (i / symbols.length) * 40}%`,
        duration: 0.3,
      });
    }

    try {
      const symbolTrades = await fetchBinanceTrades(symbol);
      allTrades = [...allTrades, ...symbolTrades];
    } catch (error) {
      // Log error but continue with other symbols
      console.warn(`Skipping ${symbol}:`, error.message);
      syncDetail.value = `Skipped ${symbol} - ${error.message}`;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  if (allTrades.length === 0) {
    throw new Error("No trades found for any symbol");
  }

  // Continue with processing...
} catch (error) {
  console.error("Sync error:", error);
  syncMessage.value = "Sync failed";
  syncDetail.value = parseError(error);
  await new Promise((resolve) => setTimeout(resolve, 3000));
  isSyncing.value = false;
}
```

---

## 🔐 Security Enhancements

### Add API Key Masking in UI

Update the config form to mask API keys:

```vue
<!-- In BackgroundSettings.vue config modal -->
<div class="form-group">
    <label>API Key</label>
    <div class="input-with-toggle">
        <input
            v-model="config.apiKey"
            :type="showApiKey ? 'text' : 'password'"
            placeholder="Your Binance API Key"
            required
        />
        <button type="button" @click="showApiKey = !showApiKey" class="toggle-visibility">
            {{ showApiKey ? '👁️' : '👁️‍🗨️' }}
        </button>
    </div>
</div>

<div class="form-group">
    <label>API Secret</label>
    <div class="input-with-toggle">
        <input
            v-model="config.apiSecret"
            :type="showApiSecret ? 'text' : 'password'"
            placeholder="Your Binance API Secret"
            required
        />
        <button type="button" @click="showApiSecret = !showApiSecret" class="toggle-visibility">
            {{ showApiSecret ? '👁️' : '👁️‍🗨️' }}
        </button>
    </div>
</div>
```

Add state:

```javascript
const showApiKey = ref(false);
const showApiSecret = ref(false);
```

### Encrypt localStorage (Optional)

For extra security, encrypt API keys before storing:

```javascript
import CryptoJS from "crypto-js";

const STORAGE_KEY = "kinesis-binance-config";
const ENCRYPTION_KEY = "your-unique-key-here"; // Generate unique key per user

const saveConfig = () => {
  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(config.value),
    ENCRYPTION_KEY
  ).toString();

  localStorage.setItem(STORAGE_KEY, encrypted);
  showConfig.value = false;
  startInitialSync();
};

const loadSavedData = () => {
  const encrypted = localStorage.getItem(STORAGE_KEY);
  if (encrypted) {
    try {
      const decrypted = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
      const configStr = decrypted.toString(CryptoJS.enc.Utf8);
      config.value = JSON.parse(configStr);
    } catch (e) {
      console.error("Failed to decrypt config");
      localStorage.removeItem(STORAGE_KEY);
    }
  }
  // ... rest of function
};
```

---

## 🧪 Testing

### Test Connection

Add a "Test Connection" button in the config modal:

```vue
<button
  type="button"
  class="btn-test"
  @click="handleTestConnection"
  :disabled="isTesting"
>
    {{ isTesting ? 'Testing...' : 'Test Connection' }}
</button>
```

Handler:

```javascript
import { testConnection } from "@/utils/binanceApi";

const isTesting = ref(false);
const testResult = ref("");

const handleTestConnection = async () => {
  if (!config.value.apiKey || !config.value.apiSecret) {
    testResult.value = "❌ Please enter API credentials";
    return;
  }

  isTesting.value = true;
  testResult.value = "🔄 Testing...";

  try {
    const isValid = await testConnection(
      config.value.apiKey,
      config.value.apiSecret
    );
    if (isValid) {
      testResult.value = "✅ Connection successful!";
    } else {
      testResult.value = "❌ Invalid credentials";
    }
  } catch (error) {
    testResult.value = `❌ ${error.message}`;
  } finally {
    isTesting.value = false;
    setTimeout(() => {
      testResult.value = "";
    }, 3000);
  }
};
```

Display result:

```vue
<div
  v-if="testResult"
  class="test-result"
  :class="testResult.includes('✅') ? 'success' : 'error'"
>
    {{ testResult }}
</div>
```

---

## 📊 Rate Limiting

Binance has strict rate limits:

- **1200 requests per minute** (per IP)
- **10 requests per second** (per API key)

The `binanceApi.js` helper includes a 100ms delay between symbol requests. For more symbols, consider:

```javascript
// In fetchMultipleSymbols, adjust delay based on symbol count
const delay = symbols.length > 10 ? 200 : 100;
await new Promise((resolve) => setTimeout(resolve, delay));
```

---

## 🚨 Error Scenarios

### 1. Invalid API Key

**Error**: `{"code":-2014,"msg":"API-key format invalid."}`

**Solution**: Verify key is exactly 64 characters, alphanumeric only

### 2. Permission Denied

**Error**: `{"code":-2015,"msg":"Invalid API-key, IP, or permissions for action."}`

**Solution**: Enable "Enable Reading" permission in Binance API settings

### 3. IP Restriction

**Error**: `{"code":-2015,"msg":"Invalid API-key, IP, or permissions for action."}`

**Solution**: Add your IP to whitelist or disable IP restriction

### 4. Rate Limit

**Error**: `{"code":-1003,"msg":"Too much request weight used."}`

**Solution**: Wait 1 minute, reduce number of symbols, or increase delays

### 5. Timestamp Error

**Error**: `{"code":-1021,"msg":"Timestamp for this request is outside of the recvWindow."}`

**Solution**: Check system time is synchronized (NTP)

---

## 🔄 Migration Checklist

- [ ] Install `crypto-js` dependency
- [ ] Import `binanceApi.js` utilities in JournalView.vue
- [ ] Replace `fetchBinanceTrades` with real API call
- [ ] Add `testConnection` validation before sync
- [ ] Add API key format validation
- [ ] Implement masked input fields
- [ ] Add "Test Connection" button
- [ ] Update error handling with `parseError`
- [ ] Test with real Binance account
- [ ] Verify FIFO calculations match Binance
- [ ] Test rate limiting with many symbols
- [ ] Document any Binance-specific quirks

---

## 📈 Performance Tips

1. **Limit Symbols**: Only track actively traded pairs
2. **Batch Requests**: Group related symbols
3. **Cache Results**: Store in localStorage, refresh periodically
4. **Lazy Load**: Fetch details on-demand when detail panel opens
5. **Pagination**: If >1000 trades, implement `fromId` pagination

---

## 🎯 Next Steps

1. **Replace mock data** with real API calls
2. **Test with demo account** first (Binance Testnet)
3. **Add error boundaries** for graceful failures
4. **Implement retry logic** for transient errors
5. **Add sync timestamp** display to show data freshness
6. **Optimize for mobile** (touch-friendly detail panel)

---

## 🌐 Binance Testnet

Before using real account, test with Binance Testnet:

1. Go to [testnet.binance.vision](https://testnet.binance.vision)
2. Create test API keys
3. Change `BINANCE_API_BASE` in `binanceApi.js`:
   ```javascript
   const BINANCE_API_BASE = "https://testnet.binance.vision";
   ```
4. Test all functionality with fake funds
5. Switch back to production URL when ready

---

## 📚 References

- [Binance API Docs](https://binance-docs.github.io/apidocs/spot/en/)
- [MyTrades Endpoint](https://binance-docs.github.io/apidocs/spot/en/#account-trade-list-user_data)
- [Error Codes](https://binance-docs.github.io/apidocs/spot/en/#error-codes)
- [Rate Limits](https://binance-docs.github.io/apidocs/spot/en/#limits)

---

**Happy Trading! 📊✨**
