# Zan

> A minimalist Japanese-inspired homepage extension with live market tickers, zen quotes, and fluid GSAP transitions.

**Zan** is a Manifest V3 browser extension that replaces your default homepage with a minimal, keyboard-centric Single Page Application. Navigate seamlessly between Zen and Market views, powered by fluid, GSAP-driven animations.

---

## 🎯 Philosophy

**Japanese Minimalism with Dynamic Motion**. The design follows the principles of Ma (間) - the beauty of negative space - combined with purposeful animation. Every element serves a function.

1. **Light Aesthetic** — Clean white background with ultra-light typography (font-weight: 100-200)
2. **Keyboard-First** — Single-key shortcuts for instant navigation
3. **GSAP Choreography** — Multi-layered, 60fps animations that guide attention

---

## 🏗️ Features

### Zen View (Press `Z`)

- **Ultra-Light Clock** — 8rem display with smooth character transitions
- **Zen Quotes** — Daily wisdom in English + Japanese (禅の言葉)
- **Breathing Circle** — Subtle pulse animation
- **Grid Lines** — 20 vertical ambient lines with staggered reveals

### Market View (Press `K`)

- **Live Cryptocurrency Tickers** — BTC, ETH, SOL, ADA
- **Real-time Prices** — CoinGecko API integration
- **Price Animations** — Smooth "tick" effect on updates (no snap/pop)
- **Auto-refresh** — Every 30 seconds with staggered reveals
- **Color-coded Changes** — Green (↗) / Red (↘) 24h indicators

### Quick Notes Sidebar (Press `M`)

- **Bullet-point Notes** — Fast capture with localStorage persistence
- **Slide-in Animation** — GSAP-powered entrance from right
- **Japanese Headers** — メモ (Memo) with ambient decoration

### Trading Journal (Press `J`) 📊

- **Binance Integration** — Sync your trading history via API
- **Performance Analytics** — Total P&L, Win Rate, Profit Factor, Best Trade
- **FIFO Position Matching** — Accurate closed position calculations
- **Trade History** — Detailed breakdown of every trade with filters
- **GSAP Animations** — Smooth loading progress, staggered stats reveal, slide-in details
- **Detail Panel** — Click any trade for full entry/exit/commission breakdown
- **localStorage Persistence** — Cached data for instant dashboard loading
- **Pro License System** 🎫 — Freemium model with Gumroad integration
  - **Free Tier**: Limited to 3 trading pairs
  - **Pro ($9.99 lifetime)**: Unlimited pairs + advanced features

> **See**: [`JOURNAL_GUIDE.md`](JOURNAL_GUIDE.md) for complete setup & usage guide  
> **See**: [`LICENSE_SYSTEM.md`](LICENSE_SYSTEM.md) for monetization implementation details

### Task Management (Press `T`) ✅ **NEW!**

- **Quick Add Input** — Fast task creation with priority and due dates
- **Smart Filtering** — View All/Active/Completed tasks
- **Priority System** — High/Medium/Low with color-coded indicators
- **Due Date Tracking** — "Today", "Tomorrow", or specific dates
- **Completion Streak** — Track your productivity momentum
- **GSAP Animations** — Smooth task add/complete/delete transitions
- **Archive System** — Bulk archive completed tasks with confirmation
- **localStorage Persistence** — All tasks saved automatically
- **Beautiful Empty States** — Motivational messages when lists are clear

> **Features:**
> - ⚡ Lightning-fast task capture
> - 🎯 Priority-based sorting (High → Medium → Low)
> - 📅 Overdue task highlighting
> - 📊 Daily completion stats & streak counter
> - ✨ Smooth check animations on completion
> - 🗑️ Safe delete with custom alert confirmations

### Command Palette

- **Smart Search** — Type commands or search Google
- **View Commands** — Type "market", "zen", "finance", "crypto", "journal", "trades"
- **Keyboard Shortcuts Display** — Z, K, J, B, M, Esc

---

## ⌨️ Keyboard Shortcuts

| Key   | Action                  |
| ----- | ----------------------- |
| `Z`   | Navigate to Zen View    |
| `K`   | Navigate to Market View |
| `J`   | Navigate to Trading Journal 📊 |
| `T`   | Navigate to Task Management ✅ **NEW!** |
| `B`   | Navigate to Bookmarks   |
| `M`   | Toggle Quick Notes      |
| `Esc` | Close Notes / Clear     |

**Command Palette Search:**

- Type "tasks", "todo", "checklist" → Task Management ✅
- Type "journal", "trades" → Trading Journal 📊
- Type "market", "finance", "crypto" → Market View
- Type "zen", "home", "clock" → Zen View
- Type "bookmarks", "links" → Bookmarks View
- Any other text + Enter → Google search

---

## 🎬 GSAP Animation Choreography

### View Transitions (Multi-layered)

1. **Exit Animation**: Current view fades/blurs out with stagger
2. **Enter Animation**: New view slides in from below with scale
3. **Internal Stagger**: Elements reveal sequentially (0.05s delay)

### Market View Choreography

```javascript
// 7-layer entrance animation
Header → Loading Spinner → Ticker Rows (stagger) → Update Time → Grid Lines
```

### Live Price "Tick" Animation

```javascript
// Smooth value transition (no snap)
Old Price (fade out ↑) → DOM Update → New Price (fade in ↓) → Scale Pulse
```

---

## 🛠️ Development

### Installation

```bash
cd c:/Users/ASUS/Desktop/newtab
npm install
```

### Build

```bash
npm run build
```

### Load in Chrome/Brave

1. Navigate to `chrome://extensions/` or `brave://extensions/`
2. Enable **Developer Mode**
3. Click **Load unpacked**
4. Select the `dist/` folder

---

## 📦 Technology Stack

- **Vue 3** (Composition API with `<script setup>`)
- **GSAP 3.12.5** (Complex timeline choreography)
- **Vite 5.0** (Fast HMR + optimized bundling)
- **CoinGecko API** (Free cryptocurrency market data)
- **localStorage** (Client-side persistence)

---

## 🔒 Security & Permissions

**Content Security Policy:**

```json
"content_security_policy": {
  "extension_pages": "script-src 'self'; object-src 'self'; style-src 'self' 'unsafe-inline'"
}
```

**Host Permissions:**

- `https://api.coingecko.com/*` (for live market data)

**CSP Compliance:**

- GSAP bundled locally (no CDN)
- No `eval()` or inline scripts
- Vue scoped styles use allowed `'unsafe-inline'`

---

## 🗂️ Data Storage

**localStorage Keys:**

- `kinesis-last-view` — Restores last active view
- `kinesis-notes` — Quick Notes content (array)
- `kinesis-market-tickers` — (Future: custom ticker list)
- `kinesis-binance-config` — Trading Journal API credentials 📊 **NEW!**
- `kinesis-trading-journal` — Cached trades and analytics 📊 **NEW!**
- `kinesis-license` — Pro license key (encrypted) 🎫 **NEW!**

---

## 🎨 Design System

**Colors:**

- Background: `#ffffff`
- Text Primary: `#000000`
- Text Muted: `rgba(0,0,0,0.4)`
- Border: `rgba(0,0,0,0.08)`

**Typography:**

- Japanese: `'Noto Sans JP'`, weight 100-200
- Latin: `'Inter'`, weight 100-300
- Mono: `'Fira Code'`, weight 300

**Spacing:**

- Based on Ma (間) concept
- Generous negative space (24px+ gaps)
- Ultra-minimal borders

---

## 🚀 Future Enhancements

- [x] Trading Journal with Binance API integration 📊
- [x] Performance analytics (P&L, Win Rate, Profit Factor)
- [x] FIFO position matching algorithm
- [ ] Custom ticker configuration (localStorage)
- [ ] Settings UI for API preferences
- [ ] More cryptocurrencies support
- [ ] Stock market integration
- [ ] Weather widget
- [ ] Pomodoro timer
- [ ] Export/import settings
- [ ] Trade notes and tags
- [ ] Performance charts and visualizations

---

**Built with ❤️ by Ahmad Fauzan**

---

## 🎯 Philosophy

This extension embodies **digital minimalism with dynamic motion**. Every animation serves a functional purpose: to guide attention, reinforce user actions, and create a seamless, cinematic experience. The interface is built around three core principles:

1. **Strict Monochrome Aesthetic** — Only black and white. Typography and motion are the primary design elements.
2. **Keyboard-First Navigation** — Single-key shortcuts for instant view switching.
3. **Cinematic Transitions** — GSAP-powered, 60fps+ animations that feel purposeful, not decorative.

---

## 🏗️ Architecture

### Technology Stack

**Framework: Vue.js 3 (Composition API)**

**Justification:**

- **Built-in `<Transition>` Component**: Vue 3's transition system integrates beautifully with GSAP. The `@before-enter`, `@enter`, and `@leave` hooks provide surgical control over animation choreography, allowing me to orchestrate complex, multi-stage GSAP timelines with ease.
- **Lightweight & Performant**: Vue 3's Composition API produces smaller bundle sizes compared to React (especially when tree-shaking), which is critical for extension performance.
- **Reactive State Management**: Vue's reactivity system is simpler and more intuitive for managing view state and local storage synchronization.
- **Template Syntax**: Vue's template-based approach keeps the markup clean and declarative, which pairs well with the `data-stagger` attribute pattern used for GSAP animations.

**Animation: GSAP 3**

- Installed locally via npm (`npm install gsap`)
- Bundled with Vite to ensure CSP compliance (no CDN usage)
- All animations use modern, object-based syntax (e.g., `gsap.to('.el', { opacity: 0 })`)—no `eval()` or string-based tweens

**Build Tool: Vite**

- Fast HMR for rapid development
- Optimized bundling with Terser minification
- Configured to output extension-friendly assets

---

## � Project Structure

```
zan/
├── manifest.json              # Manifest V3 configuration
├── package.json               # Dependencies and scripts
├── vite.config.js             # Vite build configuration
├── index.html                 # Entry HTML file
├── icons/                     # Extension icons (16px, 48px, 128px)
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── src/
│   ├── main.js                # Vue app initialization
│   ├── App.vue                # Root component with view-switching logic
│   ├── components/
│   │   ├── CommandPalette.vue        # Persistent search/navigation bar
│   │   ├── EphemeralScratchpad.vue   # Transient brain-dump overlay
│   │   ├── FocusView.vue             # Editable "Today's Focus" scratchpad
│   │   ├── GridView.vue              # Customizable quick-access links grid
│   │   └── ZenView.vue               # Full-screen text clock
│   └── styles/
│       └── main.css           # Global monochrome styles
└── dist/                      # Build output (generated by Vite)
```

---

## 🎨 The Three Views

### 1. **FocusView** — Today's Focus

A large, central, editable text area for capturing your most important task of the day.

**Features:**

- Auto-resizing textarea
- localStorage persistence
- Character count and "last edited" timestamp
- Subtle blur-in/blur-out transitions

**GSAP Choreography:**

- **Out**: Title and textarea fade out with upward motion and blur (`y: -30`, `filter: blur(8px)`)
- **In**: Elements stagger in from below (`y: 30 → 0`, `opacity: 0 → 1`, `stagger: 0.05s`)

---

### 2. **GridView** — Quick Access Links

A responsive grid of customizable links with emoji icons.

**Features:**

- Add, edit, and delete links via simple prompts
- Persistent storage of user links
- Hover animations (translate up, border glow)
- Edit mode for managing links

**GSAP Choreography:**

- **Out**: Grid items stagger out upward (`y: -15`, `stagger: 0.03s`)
- **In**: Grid items stagger in from below (`y: 30 → 0`, `stagger: 0.05s`)

---

### 3. **ZenView** — Minimalist Clock

An ultra-minimal, full-screen text clock with a daily inspirational quote.

**Features:**

- Real-time clock (updates every second)
- Current date display
- Rotating minimalist quotes
- Subtle pulse animation every minute
- Crosshair grid overlay for zen aesthetic

**GSAP Choreography:**

- **Out**: Time and quote fade and blur out (`filter: blur(8px)`)
- **In**: Time and quote fade in with subtle scale (`scale: 0.98 → 1`)

---

## ⚡ The Ephemeral Scratchpad

### The High-Utility Transient Overlay

Beyond the main views, **Zan** features an innovative **Ephemeral Scratchpad**—a transient overlay designed for rapid "brain dumping." This is the extension's secret weapon for capturing fleeting thoughts without derailing your focus.

**Trigger & Behavior:**

- **Activation**: Press `Tab` or `n` from anywhere
- **Function**: Auto-focused textarea with instant localStorage persistence (no debouncing)
- **Dismissal**: Press `Esc` or the trigger key again to close

**The "Context Swap" Animation (GSAP Magic):**

This feature showcases the power of **reversible GSAP timelines**. When activated:

1. **Command Palette (OUT)**: Fades and slides upward (`opacity: 0`, `y: -20`, `duration: 0.2s`)
2. **Active View (FADE)**: Blurs and fades to background (`opacity: 0.5`, `filter: 'blur(5px)'`, `duration: 0.3s`)
3. **Scratchpad (IN)**: Slides in from above, replacing the command palette position (`y: 20 → 0`, `opacity: 0 → 1`, `duration: 0.3s`)

When dismissed, the entire timeline **reverses**, seamlessly restoring your exact previous state. This creates a fluid, state-aware transition that feels native and intentional.

**Why It's Powerful:**

- **Zero Context Loss**: The background view remains visible but de-emphasized
- **Instant Access**: No navigation required—available from any view
- **Truly Ephemeral**: Designed for quick captures, not long-form writing
- **Auto-Save**: Every keystroke is saved to localStorage (no "save" button needed)

---

## 🎨 The Three Views (Continued)

- Edit mode for managing links

**GSAP Choreography:**

- **Out**: Grid items stagger out upward (`y: -15`, `stagger: 0.03s`)
- **In**: Grid items stagger in from below (`y: 30 → 0`, `stagger: 0.05s`)

---

### 3. **ZenView** — Minimalist Clock

An ultra-minimal, full-screen text clock with a daily inspirational quote.

**Features:**

- Real-time clock (updates every second)
- Current date display
- Rotating minimalist quotes
- Subtle pulse animation every minute
- Crosshair grid overlay for zen aesthetic

**GSAP Choreography:**

- **Out**: Time and quote fade and blur out (`filter: blur(8px)`)
- **In**: Time and quote fade in with subtle scale (`scale: 0.98 → 1`)

---

## 🎬 GSAP Transition Choreography

### How It Works

The core animation logic lives in **`App.vue`**. Vue's `<Transition>` component provides three lifecycle hooks that I use to orchestrate GSAP timelines:

```javascript
// Before entering view is inserted into DOM
onBeforeEnter(el) {
  gsap.set(el, { opacity: 0, y: 30, scale: 0.98, filter: 'blur(8px)' })
}

// Animate entering view in
onEnter(el, done) {
  const tl = gsap.timeline({ onComplete: done })

  // Animate container
  tl.to(el, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out' })

  // Stagger internal elements
  const staggerElements = el.querySelectorAll('[data-stagger]')
  tl.to(staggerElements, { opacity: 1, y: 0, duration: 0.4, stagger: 0.05 }, '-=0.3')
}

// Animate leaving view out
onLeave(el, done) {
  const tl = gsap.timeline({ onComplete: done })

  // Stagger internal elements out first
  const staggerElements = el.querySelectorAll('[data-stagger]')
  tl.to(staggerElements, { opacity: 0, y: -15, duration: 0.25, stagger: 0.03 })

  // Then animate container out
  tl.to(el, { opacity: 0, y: -30, scale: 0.98, filter: 'blur(8px)', duration: 0.4 }, '-=0.15')
}
```

### Key Techniques

1. **Stagger Pattern**: Elements marked with `data-stagger` are automatically detected and animated sequentially.
2. **Timeline Overlapping**: The `-=` offset creates seamless transitions by overlapping animations.
3. **Two-Stage Motion**: Views animate as a whole first, then internal elements follow—creating a sense of depth.
4. **Blur + Motion**: Combining `y` translation with `filter: blur()` creates a cinematic "focus pull" effect.

### State Management

View state is managed with Vue's `ref()` and persisted to `localStorage`:

```javascript
const currentView = ref("focus"); // Default: Focus view

// Switch views
const handleNavigation = (newView) => {
  currentView.value = newView;
  localStorage.setItem("kinesis-last-view", newView);
};

// Restore on mount
onMounted(() => {
  const lastView = localStorage.getItem("kinesis-last-view");
  if (lastView) currentView.value = lastView;
});
```

---

## 🔒 CSP Compliance & Security

### Content Security Policy

The extension uses a **strict CSP** defined in `manifest.json`:

```json
"content_security_policy": {
  "extension_pages": "script-src 'self'; object-src 'self'; style-src 'self' 'unsafe-inline'"
}
```

### How GSAP is CSP-Safe

1. **Local Installation**: GSAP is installed as an npm module and bundled with Vite—no CDN usage.
2. **No `eval()`**: All GSAP animations use object-based syntax (e.g., `gsap.to('.el', { opacity: 0 })`), which is fully CSP-compliant.
3. **No Inline Scripts**: All JavaScript is bundled into a single file by Vite.

### Why `'unsafe-inline'` for Styles?

Vue's scoped styles inject inline `<style>` tags at runtime. This is safe because:

- Styles cannot execute scripts
- All style content originates from our own components
- Manifest V3 explicitly allows `'unsafe-inline'` for `style-src`

---

## ⚡ Performance Optimizations

### 60fps+ Guarantee

1. **Transform & Opacity Only**: GSAP animations exclusively use `transform` and `opacity`, which are GPU-accelerated and don't trigger layout reflows.
2. **`will-change`**: Animated elements use `will-change: transform, opacity` to hint the browser to optimize rendering.
3. **`backface-visibility: hidden`**: Forces GPU compositing for smoother animations.
4. **No Layout Thrashing**: All measurements (e.g., `querySelectorAll`) happen before animations start.

### Bundle Size

- **Vue 3 (Composition API)**: ~40KB (minified + gzipped)
- **GSAP 3 Core**: ~38KB (minified + gzipped)
- **Total JS Bundle**: ~80KB (acceptable for an extension)

### Lazy Loading

- Views are dynamically imported using Vue's `<component :is>`, but since all views are small, they're bundled together for simplicity.

---

## 🛠️ Development

### Prerequisites

- Node.js 18+ (for Vite)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/brave-kinesis.git
cd brave-kinesis

# Install dependencies
npm install
```

### Development Mode

```bash
npm run dev
```

This starts Vite's dev server with HMR. However, for extension testing, you'll need to build and load the extension:

### Build for Production

```bash
npm run build
```

This generates a `dist/` folder with all assets.

### Load in Brave/Chrome

1. Open `brave://extensions/` (or `chrome://extensions/`)
2. Enable **Developer Mode** (top right)
3. Click **Load unpacked**
4. Select the `dist/` folder
5. Open a new tab to see **Zan**

---

## ⌨️ Keyboard Shortcuts

### View Navigation

| Key     | Action                                         |
| ------- | ---------------------------------------------- |
| `f`     | Switch to **FocusView**                        |
| `g`     | Switch to **GridView**                         |
| `z`     | Switch to **ZenView**                          |
| `Enter` | Search with Brave Search (when input has text) |
| `Esc`   | Clear input / Blur input                       |

You can also type full commands: `focus`, `grid`, `zen`, `links`, `clock`.

### Ephemeral Scratchpad

| Key   | Action                                   |
| ----- | ---------------------------------------- |
| `Tab` | Toggle Ephemeral Scratchpad (open/close) |
| `n`   | Toggle Ephemeral Scratchpad (open/close) |
| `Esc` | Close Scratchpad (when active)           |

The scratchpad is **globally accessible**—trigger it from any view for instant brain dumping.

---

## 🗂️ Data Persistence

All user data is stored in **`localStorage`**:

- **Last View**: `kinesis-last-view` (restores view on new tab)
- **Focus Text**: `kinesis-focus-text` (Today's Focus content)
- **Focus Edited**: `kinesis-focus-edited` (timestamp of last edit)
- **Links**: `kinesis-links` (array of custom links in GridView)
- **Scratchpad**: `kinesis-ephemeral-scratchpad` (quick capture notes)

**Why localStorage instead of `chrome.storage`?**

- Simpler API for this use case
- Synchronous access (no async overhead)
- All data is per-device (no need for sync across devices)

---

## 🎨 Customization

### Changing the Default View

Edit `src/App.vue`:

```javascript
const currentView = ref("zen"); // Change to 'focus', 'grid', or 'zen'
```

### Adding More Links

Open the extension, switch to **GridView**, and click **Add Link**.

### Modifying Quotes

Edit the `quotes` array in `src/components/ZenView.vue`.

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- **GSAP** by GreenSock for making web animations feel native
- **Vue.js** for a delightful developer experience
- **Dieter Rams** for the "Less, but better" philosophy

---

## 🚀 Future Enhancements

- [ ] Custom keyboard shortcuts
- [ ] Pomodoro timer integration in FocusView
- [ ] Weather widget in ZenView
- [ ] Sync links via `chrome.storage.sync`
- [ ] Export/import configuration
- [ ] More view templates (Kanban, Calendar, etc.)

---

**Built with ❤️ and GSAP by a principal software architect who believes motion is function.**
