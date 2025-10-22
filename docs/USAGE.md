# Zan - Quick Start Guide

## 🎉 Welcome to Zan!

Your minimalist Japanese-inspired homepage is ready. Here's how to use it:

---

## 🔑 Essential Keyboard Shortcuts

### Main Navigation

- **Z** — Zen View (clock + zen quotes)
- **K** — Market View (live crypto tickers)
- **M** — Toggle Quick Notes sidebar

### Other Shortcuts

- **Esc** — Close notes / Clear search
- **Enter** — Google search (when typing in command palette)

---

## 📊 Market View Features

### What You See

- **Live Prices** for BTC, ETH, SOL, ADA
- **24h Change %** with color indicators (green = up, red = down)
- **Auto-refresh** every 30 seconds
- **Last update** timestamp

### How It Works

1. Press **K** to open Market View
2. Wait for data to load (1-2 seconds)
3. Watch prices update automatically
4. Price changes animate smoothly (no sudden jumps)

### Animations

- Ticker rows reveal with 0.1s stagger
- Price updates: old value fades out ↑, new value fades in ↓
- Scale pulse effect on price changes
- Grid lines animate vertically

---

## 🧘 Zen View Features

### What You See

- **Ultra-light clock** (updates every second)
- **Zen quotes** in English + Japanese
- **Breathing circle** with subtle pulse
- **20 vertical grid lines** for aesthetic

### How It Works

1. Press **Z** to open Zen View
2. Clock updates in real-time
3. New quote appears on each visit
4. Breathing circle pulses gently

---

## 📝 Quick Notes

### How to Use

1. Press **M** to open sidebar
2. Type your notes (bullet points work best)
3. Press **M** or **Esc** to close
4. Notes auto-save to localStorage

### Features

- Bullet-point formatting
- Instant save (no manual action needed)
- Slides in from right with animation
- Japanese header メモ (Memo)

---

## 🔍 Command Palette Search

### View Commands

Type these commands and press **Enter**:

- `market` or `finance` or `crypto` → Market View
- `zen` or `home` or `clock` → Zen View

### Web Search

- Type anything else + **Enter** → Google search

---

## 🎨 Design Philosophy

**Japanese Minimalism (侘寂 - Wabi-sabi)**

- White background (#ffffff)
- Ultra-light fonts (weight 100-200)
- Generous spacing (Ma 間)
- Subtle animations
- Functional elegance

---

## 🔄 How to Update the Extension

1. Pull latest changes (if from git)
2. Run `npm run build`
3. Reload extension in `chrome://extensions/`
4. Open new tab to see changes

---

## 🐛 Troubleshooting

### Market data not loading?

- Check internet connection
- CoinGecko API may be rate-limited (free tier)
- Wait 1 minute and reload tab

### Extension not appearing?

- Make sure you loaded the `dist/` folder
- Check `chrome://extensions/` for errors
- Try disabling/re-enabling the extension

### Animations stuttering?

- Close other heavy tabs
- Check GPU acceleration in browser settings
- Restart browser

---

## 💡 Pro Tips

1. **Muscle Memory**: Use Z and K to switch views quickly
2. **Quick Capture**: Press M anywhere to jot down thoughts
3. **Glanceable Data**: Market View is designed for quick glances
4. **Zen Mode**: Use Zen View for meditation/focus sessions
5. **Command Palette**: Type commands instead of using shortcuts

---

## 📊 Market Data Info

**Data Source:** CoinGecko API (free tier)
**Update Frequency:** 30 seconds
**Default Tickers:** BTC, ETH, SOL, ADA
**Currency:** USD

**Note:** Future versions will allow custom ticker configuration.

---

## 🎯 Best Practices

### For Focus

- Start your day with Zen View (clock + quote)
- Use Quick Notes for daily intentions
- Keep notes minimal (bullet points)

### For Market Tracking

- Press K for quick price checks
- Watch for color changes (green/red)
- Don't obsess - check periodically
- Auto-refresh keeps data fresh

---

**Enjoy your minimalist browsing experience! 🌸**

Built with ❤️ by Ahmad Fauzan
