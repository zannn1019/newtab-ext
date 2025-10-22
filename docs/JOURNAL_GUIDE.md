# 📊 Kinesis Trading Journal Guide

## Overview

The **Trading Journal** is a powerful analytics view that transforms your Binance trading data into a personalized, minimalist trading journal. It provides actionable insights including P&L, win/loss rates, and detailed trade history.

---

## 🚀 Quick Start

### Activation

Press **`J`** key or type `journal` or `trades` in the Command Palette (Ctrl+K) to activate the Journal view.

### First-Time Setup

On your first visit, you'll see a "Sync with Binance" prompt:

1. Click **"Configure API Keys"** button
2. Enter your Binance API credentials:
   - **API Key**: Your Binance API public key
   - **API Secret**: Your Binance API secret key
   - **Symbols**: Comma-separated list of trading pairs (e.g., `BTCUSDT,ETHUSDT,BNBUSDT`)
3. Click **"Save & Sync"**

The system will begin fetching your historical trades with a beautiful GSAP-animated loading state.

---

## 🔐 Getting Binance API Keys

### Step 1: Login to Binance

1. Go to [Binance.com](https://www.binance.com) and log in
2. Navigate to **Profile** → **API Management**

### Step 2: Create New API Key

1. Click **"Create API"**
2. Name it (e.g., "Kinesis Journal")
3. Complete security verification
4. **Save your API Key and Secret Key immediately** (secret is shown only once)

### Step 3: Configure Permissions

**IMPORTANT**: For the Journal feature, you only need **READ permissions**:

- ✅ Enable **"Enable Reading"** (Required)
- ❌ Disable **"Enable Spot & Margin Trading"** (Not needed)
- ❌ Disable **"Enable Withdrawals"** (Not needed)

### Step 4: IP Whitelist (Recommended)

For security, consider restricting API access to your IP address:

- Click **"Restrict access to trusted IPs"**
- Add your current IP address

> **🔒 Security Note**: Your API keys are stored **locally** in your browser's localStorage and are **never sent to external servers** except Binance API endpoints.

---

## 📈 Dashboard Layout

### Left Panel: Performance Summary

Displays 6 key statistics:

1. **Total P&L** - Your cumulative profit/loss across all trades
   - Color animates from gray to green (profit) or red (loss)
2. **Win Rate** - Percentage of winning trades
3. **Avg Win** - Average profit per winning trade
4. **Avg Loss** - Average loss per losing trade
5. **Profit Factor** - Ratio of gross profit to gross loss
6. **Best Trade** - Your highest single trade profit

**Interactions**:

- Stats animate in with staggered entrance
- Hover over any stat card for subtle highlight effect
- Click refresh button (top-right) to sync latest data

### Right Panel: Trade History

Displays scrollable list of closed positions:

- **Symbol** - Trading pair (e.g., BTCUSDT)
- **Side** - BUY or SELL badge
- **P&L** - Profit/Loss with color coding
- **Date** - Exit date
- **Duration** - How long the position was held

**Filters**:

- Dropdown to filter by specific symbol
- "All Symbols" shows everything

**Interactions**:

- Click any trade to view detailed breakdown
- Arrow appears on hover indicating clickability
- List items animate in with vertical stagger

---

## 🔍 Trade Detail Panel

Click any trade in the history to open the detail overlay:

### Features

1. **Slide-in Animation** - Panel smoothly enters from the right
2. **Background Blur** - Main dashboard dims and blurs behind
3. **Three Sections**:
   - **Entry**: Price, quantity, timestamp
   - **Exit**: Price, exit time, duration
   - **Costs & Fees**: Commission breakdown, net P&L

### Navigation

- **Close**: Click `×` button (top-right)
- **Dismiss**: Press `Escape` key
- **Outside Click**: Click anywhere outside the panel

---

## 🎨 GSAP Animations

### 1. Sync Loading Animation

When fetching trades from Binance:

- **Progress Bar**: Smoothly animates from 0% to 100%
- **Icon Pulse**: Trading chart icon pulses with opacity changes
- **Status Updates**: Real-time messages update as data loads
- **Phase Breakdown**:
  1. "Connecting to Binance..." (10%)
  2. "Fetching [SYMBOL] trades..." (30-70%, per symbol)
  3. "Processing trades..." (80%)
  4. "Saving data..." (100%)

### 2. Dashboard Entrance

After sync completes:

- **Stat Cards**: Animate from bottom with back easing, 0.1s stagger
- **P&L Color**: Transitions from neutral gray to profit/loss color
- **Trade Items**: Slide in from left with 0.05s stagger
- **Total Duration**: ~1.5 seconds for complete choreography

### 3. Detail Panel

- **Slide In**: Enters from right (100% to 0%) with power3.out easing
- **Background Dim**: Dashboard blurs (8px) and fades (30% opacity)
- **Slide Out**: Reverses animation with power3.in easing
- **Duration**: 0.5s in, 0.4s out

### 4. Trade List Hover

- **Transform**: Subtle translateX(4px) on hover
- **Border**: Color changes to accent
- **Arrow Reveal**: Opacity animates from 0 to 1
- **Duration**: 0.3s with custom ease

---

## 🔧 Technical Details

### Data Processing (FIFO)

The system uses **First-In-First-Out (FIFO)** matching to calculate P&L:

1. **Raw Trades**: Fetches all BUY/SELL orders from Binance
2. **Position Tracking**: Maintains open positions per symbol
3. **FIFO Matching**: When SELL occurs, closes earliest BUY position
4. **Commission Handling**: Proportionally allocates commissions
5. **P&L Calculation**: `(exitPrice - entryPrice) × quantity - commissions`

### localStorage Storage

Two keys are used:

1. **`kinesis-binance-config`**

   ```json
   {
     "apiKey": "...",
     "apiSecret": "...",
     "symbols": "BTCUSDT,ETHUSDT,BNBUSDT"
   }
   ```

2. **`kinesis-trading-journal`**
   ```json
   {
     "trades": [...],
     "analytics": {...},
     "lastSync": 1234567890
   }
   ```

### Performance

- **Initial Fetch**: ~1-3 seconds per symbol
- **Processing**: Instant for <1000 trades
- **Rendering**: 60fps animations via GSAP
- **Storage Size**: ~50KB per 100 trades

---

## 🎯 Keyboard Shortcuts

| Key      | Action                                |
| -------- | ------------------------------------- |
| `J`      | Open Trading Journal                  |
| `Escape` | Close detail panel                    |
| `Ctrl+K` | Open Command Palette → type "journal" |
| `Z`      | Return to Zen View                    |
| `K`      | Go to Market View                     |
| `M`      | Toggle Notes                          |

---

## 🛠 Troubleshooting

### Issue: "Sync Failed"

**Possible Causes**:

1. Invalid API keys
2. API keys don't have "Enable Reading" permission
3. IP address not whitelisted (if restriction enabled)
4. Network connectivity issues

**Solution**:

- Verify API keys in Binance dashboard
- Check permissions are set correctly
- Disable IP restriction temporarily to test
- Check browser console for specific error messages

### Issue: "No trades found"

**Possible Causes**:

1. Selected symbol has no trading history
2. Account is new with no closed positions
3. Only open positions exist (not yet closed)

**Solution**:

- Select "All Symbols" filter
- Make some trades on Binance first
- Close open positions to generate history

### Issue: Slow Loading

**Possible Causes**:

1. Many symbols configured
2. Extensive trading history (>1000 trades)
3. Slow internet connection

**Solution**:

- Reduce number of symbols to track
- Clear old data and re-sync: Delete `kinesis-trading-journal` from localStorage
- Use faster connection

### Issue: P&L Seems Wrong

**Possible Causes**:

1. Multiple asset commissions (BNB, USDT, etc.)
2. Partial fills not properly matched
3. Transfer trades included

**Note**: The system uses strict FIFO matching. If you had transfers or external deposits, the calculations may appear off.

**Solution**:

- Verify trades on Binance directly
- Only sync symbols you actively trade (not transfer)
- Check commission asset in detail panel

---

## 🎨 Customization

### Changing Default Symbols

Edit the symbols list in Configuration modal:

```
BTCUSDT,ETHUSDT,BNBUSDT,ADAUSDT,DOGEUSDT
```

### Future Enhancements (Coming Soon)

- [ ] Date range filtering
- [ ] Export to CSV
- [ ] Performance charts
- [ ] Trade notes/tags
- [ ] Multiple timeframe analytics
- [ ] Max drawdown tracking
- [ ] Sharpe ratio calculation

---

## 🔒 Security Best Practices

1. **Never share your API keys**
2. **Use read-only permissions** (never enable trading/withdrawal)
3. **Enable IP whitelisting** if possible
4. **Rotate keys periodically** (every 3-6 months)
5. **Monitor API usage** in Binance dashboard
6. **Delete keys** if you stop using the feature

---

## 📚 API Reference

### Binance Endpoints Used

- `GET /api/v3/myTrades` - Fetch historical trades
- Parameters:
  - `symbol` - Trading pair (required)
  - `limit` - Max 1000 trades per request
  - `recvWindow` - Request validity window
  - `timestamp` - Current timestamp
  - `signature` - HMAC SHA256 signature

### Response Format

```json
[
  {
    "symbol": "BTCUSDT",
    "id": 123456,
    "orderId": 789012,
    "price": "40000.50",
    "qty": "0.001",
    "commission": "0.04",
    "commissionAsset": "USDT",
    "time": 1634567890000,
    "isBuyer": true,
    "isMaker": false,
    "isBestMatch": true
  }
]
```

---

## 💡 Tips & Tricks

1. **Regular Syncs**: Refresh daily to keep analytics current
2. **Symbol Focus**: Track only your most-traded pairs for faster loading
3. **Detail Analysis**: Use detail panel to study your best/worst trades
4. **Win Rate Goal**: Professional traders aim for >60% win rate
5. **Profit Factor Target**: Aim for 2.0+ (making 2x on wins vs losses)

---

## 🙏 Credits

- **Design**: Classic Japanese aesthetic with monochrome typography
- **Animation**: GSAP 3.12.5 for buttery-smooth transitions
- **API**: Binance REST API v3
- **Framework**: Vue 3 Composition API

---

## 📧 Support

For issues or feature requests:

1. Check this guide first
2. Open browser DevTools Console for errors
3. Verify Binance API status
4. Create an issue on GitHub

---

**Made with 禅 (zen) by Kinesis Team**
