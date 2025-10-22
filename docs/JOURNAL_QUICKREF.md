# 📊 Trading Journal - Quick Reference

## 🚀 Quick Start

```bash
# Press 'J' key or type 'journal' in Command Palette
```

## ⌨️ Keyboard Shortcuts

| Key      | Action              |
| -------- | ------------------- |
| `J`      | Open Journal        |
| `Z`      | Zen View            |
| `K`      | Market View         |
| `B`      | Bookmarks           |
| `M`      | Notes Sidebar       |
| `ESC`    | Close Detail/Modals |
| `Ctrl+K` | Command Palette     |

## 📊 Dashboard Panels

### Left: Performance Summary

- **Total P&L** - Cumulative profit/loss
- **Win Rate** - % of winning trades
- **Avg Win** - Mean profit per win
- **Avg Loss** - Mean loss per loss
- **Profit Factor** - Gross profit ÷ loss
- **Best Trade** - Highest single gain

### Right: Trade History

- Scrollable list of closed positions
- Click any trade for detailed breakdown
- Filter by symbol dropdown
- Refresh button for latest data

## 🔧 Configuration

```javascript
{
  apiKey: "your_64_char_binance_api_key",
  apiSecret: "your_64_char_binance_api_secret",
  symbols: "BTCUSDT,ETHUSDT,BNBUSDT"
}
```

## 🎬 Animations

- **Sync**: 4-6s progress bar animation
- **Dashboard**: 1.5s staggered entrance
- **Detail Panel**: 0.5s slide from right
- **P&L Color**: 0.8s transition to green/red

## 💾 localStorage Keys

- `kinesis-binance-config` - API credentials
- `kinesis-trading-journal` - Trades + analytics

## 🔐 Security Checklist

- [ ] Read-only API permissions
- [ ] Enable "Enable Reading" only
- [ ] Disable trading/withdrawal permissions
- [ ] Consider IP whitelist
- [ ] Rotate keys every 3-6 months

## 🐛 Troubleshooting

### Sync Failed

```
1. Check API key format (64 chars)
2. Verify "Enable Reading" permission
3. Test with Binance Testnet first
4. Check browser console for errors
```

### No Trades Found

```
1. Select "All Symbols" filter
2. Verify you have closed positions
3. Check symbol spelling (BTCUSDT not BTC-USDT)
```

### Rate Limit Error

```
1. Wait 60 seconds
2. Reduce number of symbols
3. Increase delays in API calls
```

## 📚 Documentation

- **Users**: `JOURNAL_GUIDE.md` (560 lines)
- **Developers**: `BINANCE_INTEGRATION.md` (430 lines)
- **Summary**: `JOURNAL_SUMMARY.md` (350 lines)

## 🔗 Binance API Setup

1. [Binance.com](https://binance.com) → Profile → API Management
2. Create API → Name: "Kinesis Journal"
3. Enable: ✅ Reading, ❌ Trading, ❌ Withdrawals
4. Optional: Whitelist your IP
5. Save keys securely

## 📈 Analytics Formula

```javascript
// FIFO Position Matching
PnL = (exitPrice - entryPrice) × quantity - commission

// Metrics
winRate = (wins / totalTrades) × 100
profitFactor = totalWins / totalLosses
avgWin = totalWins / numberOfWins
avgLoss = totalLosses / numberOfLosses
```

## 🎯 Pro Tips

1. Sync daily for accurate analytics
2. Track only active trading pairs
3. Study detail panel for insights
4. Aim for >60% win rate
5. Target 2.0+ profit factor

## 🚨 Important Notes

⚠️ **Keys stored locally** - Never shared with third parties  
⚠️ **Read-only API** - Cannot execute trades  
⚠️ **Test first** - Use Binance Testnet before production  
⚠️ **Rate limits** - Max 1200 requests/minute

## 📦 Files Created

```
src/
  components/
    JournalView.vue          (710 lines)
  utils/
    binanceApi.js            (280 lines)

docs/
  JOURNAL_GUIDE.md           (560 lines)
  BINANCE_INTEGRATION.md     (430 lines)
  JOURNAL_SUMMARY.md         (350 lines)
  JOURNAL_QUICKREF.md        (this file)
```

## 🎨 Color Reference

```css
--bg-primary: #f5f3f0       /* Washi paper */
--accent: #8b4513           /* Subtle brown */
--text-primary: #2d2d2d     /* Deep gray */
--accent-green: #22c55e     /* Profit */
--accent-red: #ef4444       /* Loss */
```

## 🔄 Status

✅ **Fully Implemented** with mock data  
⏭️ **Ready for Binance API** integration  
📝 **Documentation Complete**  
🎨 **Animations Polished**  
🔐 **Security Reviewed**

---

**Made with 禅 (zen)** | Press `J` to start trading journal! 📊✨
