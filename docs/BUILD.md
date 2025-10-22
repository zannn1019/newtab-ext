# Build & Installation Guide

## Prerequisites

- **Node.js** 18+ (recommended: 20 LTS)
- **npm** (comes with Node.js)
- **Brave Browser** or any Chromium-based browser (Chrome, Edge, etc.)

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This installs:

- Vue 3
- GSAP 3
- Vite (build tool)
- @vitejs/plugin-vue

### 2. Development Mode

```bash
npm run dev
```

This starts Vite's dev server with Hot Module Replacement (HMR). However, since this is a browser extension, you'll need to:

1. Build the extension (see below)
2. Load it in your browser
3. Open a new tab to see changes

**Note:** Vite's dev server doesn't work directly with extensions—you must rebuild after changes.

### 3. Build for Production

```bash
npm run build
```

This creates a `dist/` folder with:

- `index.html`
- `assets/index.js` (bundled Vue + GSAP)
- `assets/index.css` (compiled styles)
- `manifest.json` (copied from root)

**Important:** The `manifest.json` in the root directory is automatically copied to `dist/` during the build.

---

## Loading the Extension

### Brave / Chrome / Edge

1. Build the extension:

   ```bash
   npm run build
   ```

2. Open your browser's extensions page:

   - **Brave**: `brave://extensions/`
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`

3. Enable **Developer Mode** (toggle in top-right corner)

4. Click **Load unpacked**

5. Select the `dist/` folder from your project directory

6. Open a new tab—you should see **Zan**!

---

## Troubleshooting

### Issue: "Manifest file is missing or unreadable"

**Solution:** Make sure you built the project first:

```bash
npm run build
```

The `dist/` folder must contain `manifest.json`.

---

### Issue: Icons are missing

**Solution:** Add placeholder icons to the `icons/` folder:

- `icon16.png` (16x16px)
- `icon48.png` (48x48px)
- `icon128.png` (128x128px)

Or, temporarily remove the `"icons"` field from `manifest.json`.

---

### Issue: GSAP animations don't work

**Checklist:**

1. Ensure GSAP is installed: `npm install gsap`
2. Check the browser console for CSP errors
3. Verify that `manifest.json` has the correct CSP:
   ```json
   "content_security_policy": {
     "extension_pages": "script-src 'self'; object-src 'self'; style-src 'self' 'unsafe-inline'"
   }
   ```

---

### Issue: localStorage data is lost

**Reason:** Browser extensions have isolated storage contexts. If you uninstall and reinstall, localStorage is cleared.

**Solution:** This is expected behavior. In the future, we can migrate to `chrome.storage.sync` for persistent, cross-device storage.

---

## Development Workflow

### 1. Make Changes

Edit files in `src/`:

- `App.vue` — Main controller
- `components/` — View components
- `styles/main.css` — Global styles

### 2. Rebuild

```bash
npm run build
```

### 3. Reload Extension

In your browser's extensions page:

1. Click the **Reload** icon (circular arrow) under the extension card
2. Or, disable and re-enable the extension
3. Open a new tab to see changes

### 4. Debugging

Open the browser's DevTools (F12) while on a new tab to see:

- Console logs
- Network requests
- Vue DevTools (if installed)

---

## Building for Distribution

### Create a .zip file

```bash
# Build first
npm run build

# Create a zip of the dist/ folder
cd dist
zip -r brave-kinesis.zip .
```

Or on Windows:

```powershell
Compress-Archive -Path dist\* -DestinationPath brave-kinesis.zip
```

### Submit to Chrome Web Store

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Create a new item
3. Upload `brave-kinesis.zip`
4. Fill in store listing details
5. Submit for review

---

## Performance Tips

### Minification

The build process automatically minifies:

- JavaScript (via Terser)
- CSS (via Vite's built-in minifier)

### Bundle Analysis

To see what's in your bundle:

```bash
npm install --save-dev rollup-plugin-visualizer
```

Then add to `vite.config.js`:

```javascript
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [vue(), visualizer({ open: true })],
});
```

Run `npm run build` and a visual report will open in your browser.

---

## Environment Variables

To use environment-specific configs, create:

- `.env.development`
- `.env.production`

Example:

```
VITE_API_URL=https://api.example.com
```

Access in code:

```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

**Note:** All `VITE_*` variables are embedded into the build and visible to users—don't store secrets!

---

## File Structure After Build

```
dist/
├── manifest.json          # Extension manifest
├── index.html             # Entry HTML
├── assets/
│   ├── index.js           # Bundled Vue + GSAP (~80KB)
│   └── index.css          # Compiled styles (~10KB)
└── icons/                 # Extension icons (if present)
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

**Total Size:** ~100KB (gzipped)

---

## Next Steps

- Read [README.md](README.md) for usage instructions
- Read [ARCHITECTURE.md](ARCHITECTURE.md) for technical deep-dive
- Customize the default view in `src/App.vue`
- Add your own quotes in `src/components/ZenView.vue`
- Style tweaks in `src/styles/main.css`

---

**Happy Hacking!** 🚀
