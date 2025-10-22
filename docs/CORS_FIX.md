# CORS Fix for Binance API Integration

## Problem

Browser extensions cannot directly call the Binance API due to CORS (Cross-Origin Resource Sharing) restrictions. Binance's API doesn't allow the `X-MBX-APIKEY` header in browser requests for security reasons.

## Solution Implemented

We've implemented a **background service worker** that acts as a proxy for API calls. This bypasses CORS because:

1. Browser extension background scripts are not subject to CORS policies
2. The background worker makes the API call on behalf of the frontend
3. The frontend communicates with the background worker via Chrome's message passing API

## What Changed

### 1. **manifest.json**

- Added `"https://api.binance.com/*"` to `host_permissions`
- Added `background.service_worker` pointing to `background.js`

### 2. **public/background.js** (NEW)

- Service worker that listens for messages from the frontend
- Makes fetch calls to Binance API without CORS issues
- Returns results back to the frontend

### 3. **src/utils/binanceApi.js**

- Updated `fetchMyTrades()` to use `chrome.runtime.sendMessage` instead of direct fetch
- Updated `testConnection()` to use background service worker
- Added `callViaBackground()` helper function

### 4. **vite.config.js**

- Added logic to copy `background.js` to `dist/` during build

## How It Works

```
┌─────────────────┐
│  JournalView    │  1. User initiates sync
│   (Frontend)    │  ────────────────────────┐
└─────────────────┘                          │
                                              ▼
┌─────────────────┐                    ┌──────────────────┐
│  binanceApi.js  │  2. Send message   │   background.js  │
│   (Utility)     │  ───────────────►  │ (Service Worker) │
└─────────────────┘                    └──────────────────┘
                                              │
                    4. Return data            │ 3. Fetch from API
         ◄──────────────────────────          ▼
                                        ┌──────────────────┐
                                        │  Binance API     │
                                        │  (No CORS!)      │
                                        └──────────────────┘
```

## Testing the Fix

1. **Reload the extension**:

   - Go to `chrome://extensions/`
   - Click "Reload" on your extension
   - Or remove and re-add from `dist/` folder

2. **Open the journal**:

   - Open a new tab
   - Press `J` to open the trading journal

3. **Configure API keys**:

   - Click "Configure API Keys"
   - Enter your Binance API key and secret
   - Add symbols: `BTCUSDT`, `ETHUSDT`, etc.
   - Click "Save & Sync"

4. **Verify it works**:
   - You should see "Testing connection..."
   - Then "Connection successful!"
   - Then "Fetching [SYMBOL] trades..."
   - No CORS errors in console ✅

## Common Issues

### "chrome is not defined" in development

- The extension APIs only work when running as a browser extension
- Not available in `npm run dev` mode
- **Solution**: Always test in production (`npm run build` → load in Chrome)

### Background service worker not loading

- Check `chrome://extensions/` → Your extension → "Inspect views: service worker"
- Click "service worker" to see background console
- Look for any errors

### Still getting CORS errors

1. Make sure you reloaded the extension
2. Check that `manifest.json` has `"https://api.binance.com/*"` in `host_permissions`
3. Verify `background.js` exists in `dist/` folder
4. Check background service worker console for errors

## Development vs Production

| Feature     | Dev Mode (`npm run dev`)       | Production (`npm run build`) |
| ----------- | ------------------------------ | ---------------------------- |
| Hot reload  | ✅ Yes                         | ❌ No                        |
| Binance API | ❌ Won't work (no chrome APIs) | ✅ Works                     |
| Mock data   | ✅ Use for testing UI          | ❌ Real data only            |

**Recommendation**: Use dev mode for UI changes, rebuild and reload extension for API testing.

## Security Notes

- ✅ API keys stored locally in browser (localStorage)
- ✅ API calls only go to Binance (not third-party servers)
- ✅ Background worker only accepts messages from same extension
- ✅ Read-only API permissions recommended
- ⚠️ Never share your API secret with anyone

## Next Steps

1. Rebuild: `npm run build`
2. Reload extension in Chrome
3. Test with real Binance credentials
4. Enjoy your trading journal! 📊

---

**Need help?** Check the browser console and background service worker console for errors.
