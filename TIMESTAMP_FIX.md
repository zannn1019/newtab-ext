# Timestamp Error Fix (-1021)

## Error

```json
{
  "code": -1021,
  "msg": "Timestamp for this request is outside of the recvWindow."
}
```

## Root Cause

This error occurs when:

1. **Clock drift** - Your computer's time doesn't match Binance's server time
2. **Network latency** - Request takes too long to reach Binance
3. **Small recvWindow** - Not enough tolerance for timing differences

## Solution Implemented

### 1. **Server Time Synchronization**

Before making any API calls, we now sync with Binance's server time:

```javascript
// Fetch Binance server time
const serverTime = await fetch("https://api.binance.com/api/v3/time");
const offset = serverTime - localTime;

// Use offset for all future requests
const timestamp = Date.now() + offset;
```

### 2. **Increased recvWindow**

Changed from 5 seconds to 60 seconds:

```javascript
recvWindow: 60000; // 60 seconds (was 5000)
```

### 3. **Automatic Sync on First Request**

Time sync happens automatically on the first API call, no manual intervention needed.

## What Changed

**File: `src/utils/binanceApi.js`**

- Added `syncServerTime()` function
- Added `getTimestamp()` to get adjusted timestamps
- Made `buildSignedQuery()` async to support time sync
- Updated `testConnection()` to sync time before testing
- Increased `recvWindow` from 5000 to 60000ms
- Exported `syncServerTime` for manual syncing if needed

## Testing

1. **Reload your extension**:

   ```
   chrome://extensions/ → Click "Reload"
   ```

2. **Try syncing again**:
   - Open journal (press `J`)
   - Configure API keys
   - Click "Save & Sync"
   - ✅ Should work now!

## Console Output

You should see in the console:

```
Time synced with Binance. Offset: -123ms
```

(The offset will vary based on your system clock)

## Troubleshooting

### Still getting timestamp errors?

1. **Check your system time**:

   - Make sure your computer's date/time is correct
   - Enable automatic time sync in Windows/Mac settings

2. **Check your timezone**:

   - Binance uses UTC timestamps
   - Your timezone doesn't matter as long as your clock is correct

3. **Network issues**:

   - If you have high latency (>1 second), increase `recvWindow` even more:

   ```javascript
   recvWindow: 120000; // 2 minutes
   ```

4. **Manual time sync**:
   ```javascript
   import { syncServerTime } from "@/utils/binanceApi";
   await syncServerTime(); // Force re-sync
   ```

## Technical Details

### How Binance validates timestamps:

```
serverTime - recvWindow < timestamp < serverTime + 1000
```

- Request must arrive within `recvWindow` of when it was signed
- Default `recvWindow` = 5000ms (5 seconds)
- We increased it to 60000ms (60 seconds) for better tolerance

### Why time sync matters:

If your clock is 10 seconds behind:

- Your timestamp: `1640000000000`
- Binance time: `1640000010000`
- Difference: `10000ms`

Without sync, if `recvWindow=5000`, this fails because `10000 > 5000`.

With our fix:

1. We detect the offset: `10000ms`
2. We adjust all timestamps: `timestamp + 10000`
3. Requests arrive with correct time ✅

## Performance Impact

- Time sync happens once (first API call)
- Adds ~200ms to first request only
- Subsequent requests use cached offset
- Negligible performance impact

---

**Status**: ✅ Fixed - Rebuild and reload extension to apply changes
