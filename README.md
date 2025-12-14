# Zan (禅)

> A minimalist, Japanese-inspired new tab page designed for focus, flow, and tranquility.
![Zan Web Extension](https://github.com/zannn1019/newtab-ext/blob/main/image.png)

[![Made with Vue.js](https://img.shields.io/badge/Made%20with-Vue.js-4FC08D?style=for-the-badge&logo=vue.js)](https://vuejs.org/)
[![Powered by Vite](https://img.shields.io/badge/Powered%20by-Vite-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Animated with GSAP](https://img.shields.io/badge/Animated%20with-GSAP-88CE02?style=for-the-badge&logo=greensock)](https://greensock.com/gsap/)

**Zan** is a browser extension that transforms your new tab page into a beautiful, keyboard-centric dashboard. It combines elegant design with powerful features, all wrapped in fluid, cinematic animations powered by GSAP.

> The entire experience is designed to be seamless. Views don't just change; they flow into one another. Elements enter and exit with purpose, guiding your attention and creating a user experience that feels less like a webpage and more like a native application.

---

## ✨ Core Features

- **🎨 Multiple Views**: Switch between different focused environments.
  - **`Focus View`**: A clean space for your main goal of the day.
  - **`Zen View`**: A minimalist clock with inspirational quotes.
  - **`Grid View`**: A customizable grid of your favorite links.
  - **`Market View`**: Live cryptocurrency tickers from CoinGecko.

- **🛠️ Productivity Tools**:
  - **✅ `Task Management`**: A robust, priority-driven to-do list with stats and streaks.
  - **📊 `Trading Journal`**: Sync with your Binance account to analyze your trading performance with detailed analytics.
  - **🎵 `Music Player`**: A full-featured Spotify player that runs directly in the extension.
  - **📝 `Quick Notes`**: A slide-in sidebar for jotting down quick thoughts.
  - **🧠 `Ephemeral Scratchpad`**: A transient, full-screen overlay for capturing fleeting ideas without losing context.

- **⌨️ Keyboard-First Navigation**: Control everything from your keyboard. No mouse needed.
- **🎬 Cinematic Animations**: Every interaction is enhanced with smooth, 60fps+ animations.
- **🔒 Privacy-Focused**: All your data is stored locally in your browser. No network requests are made, except for the APIs you connect (Binance, Spotify, CoinGecko).

---

## 🚀 Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Build the Extension**:
    ```bash
    npm run build
    ```
    This will create a `dist/` folder containing the extension files.

3.  **Load in Your Browser**:
    - Open your browser's extensions page (`chrome://extensions` or `brave://extensions`).
    - Enable **Developer Mode**.
    - Click **"Load unpacked"** and select the `dist/` folder.
    - Open a new tab to see Zan!

---

## ⌨️ Keyboard Shortcuts

Navigate Zan like a pro with these shortcuts:

| Key      | Action                        |
| :------- | :---------------------------- |
| `Z`      | Go to **Zen View**            |
| `K`      | Go to **Market View**         |
| `T`      | Open **Task Management**      |
| `J`      | Open **Trading Journal**      |
| `B`      | Go to **Bookmarks (Grid View)` |
| `M`      | Toggle **Quick Notes**        |
| `Tab`/`N`| Toggle **Ephemeral Scratchpad** |
| `Esc`    | Close modals or clear input   |

You can also type commands like `zen`, `tasks`, or `market` into the command palette.

---

## 📊 Feature Spotlight: The Trading Journal

The Trading Journal is a powerful tool for cryptocurrency traders. It connects to your Binance account to provide deep insights into your trading habits.

- **Free Tier**: Analyze up to **3 trading pairs** with all core analytics.
- **Pro Tier**: For a **$9.99 one-time fee**, unlock unlimited trading pairs and support the project's development.

**To get started:**
1.  Press `J` to open the Journal.
2.  Follow the on-screen instructions to get your Binance API keys. See the [**Binance API Setup Guide**](./docs/BINANCE_API_SETUP.md) for a detailed walkthrough.
3.  For a full feature overview, read the [**Trading Journal User Guide**](./docs/JOURNAL_GUIDE.md).

---

## 🛠️ Technology & Philosophy

Zan is built on a modern, performant, and secure foundation.

- **Vue 3 (Composition API)** was chosen for its lightweight nature, performance, and first-class support for transition hooks, which integrate seamlessly with GSAP.
- **GSAP (GreenSock Animation Platform)** is used for all animations. We use complex, multi-layered timelines to create a cinematic and responsive feel. All animations are hardware-accelerated.
- **Vite** provides a fast development experience and an optimized production build.
- **Security** is paramount. The extension uses a strict Content Security Policy (CSP), and all user data is stored locally.

Our design philosophy is inspired by **Japanese Minimalism (侘寂 - Wabi-sabi)** and **Ma (間)**—the beauty of negative space. We believe that a clean, uncluttered interface, combined with purposeful motion, can create a state of focus and flow.

---

## 📚 Documentation

This project is extensively documented. Here are some starting points:

- **[Project Architecture](./docs/ARCHITECTURE.md)**: A deep dive into the technical decisions and patterns.
- **[Project Structure](./docs/PROJECT_STRUCTURE.md)**: An overview of the codebase.
- **[Build & Installation](./docs/BUILD.md)**: A guide for developers.
- **[Spotify Integration](./docs/SPOTIFY_INTEGRATION.md)**: How to set up the music player.

---

**Built with ❤️ by Zan**
