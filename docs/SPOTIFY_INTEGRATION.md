# Spotify Integration Guide

Complete guide for setting up Spotify integration with the Zan Music Player.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Configuration](#configuration)
- [Usage](#usage)
- [Troubleshooting](#troubleshooting)
- [API Reference](#api-reference)

---

## Features

### 🎵 Spotify Web Playback SDK

- **Standalone Music Player** - Play music directly in the extension without opening Spotify
- **Search & Play** - Search for any track and play it instantly
- **Playlist Management** - Browse and play your Spotify playlists
- **Full Playback Control** - Play, pause, skip, volume, seek, shuffle, repeat
- **Real-time Sync** - Track info, album art, and progress updates
- **Queue Management** - View upcoming tracks (Premium only)

### 🎨 Beautiful UI

- Minimalist Japanese light theme
- Animated vinyl record with album art
- Waveform visualizer
- Smooth GSAP animations
- Responsive design

### 🔐 Secure Authentication

- OAuth 2.0 with PKCE flow
- Chrome Identity API integration
- Automatic token refresh
- Secure token storage

---

## Prerequisites

1. **Spotify Account** - Premium required for playback features
2. **Spotify Developer Account** - Free at [developer.spotify.com](https://developer.spotify.com/)
3. **Chrome Browser** - For extension deployment

---

## Setup Instructions

### Step 1: Create Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click **"Create app"**
3. Fill in the app details:
   - **App name**: `Zan Music Player` (or any name)
   - **App description**: `Chrome extension music player`
   - **Redirect URI**: See Step 2
   - **APIs**: Check **Web API** and **Web Playback SDK**
4. Click **Save**

### Step 2: Get Extension ID

Your Chrome extension has a unique ID that determines the OAuth redirect URI.

**To find your Extension ID:**

1. Go to `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `dist` folder from the project
5. Copy the **Extension ID** (looks like: `gamodmfjpfpoejjielhceapmeaammeil`)

### Step 3: Configure Redirect URI

1. In Spotify Dashboard, edit your app
2. Click **Edit Settings**
3. Add this Redirect URI:

   ```
   https://YOUR_EXTENSION_ID.chromiumapp.org/
   ```

   Replace `YOUR_EXTENSION_ID` with your actual extension ID

   Example:

   ```
   https://gamodmfjpfpoejjielhceapmeaammeil.chromiumapp.org/
   ```

4. Click **Add** then **Save**

### Step 4: Add Client ID to Code

1. Copy your **Client ID** from the Spotify Dashboard
2. Open `src/api/spotifyApi.js`
3. Find line 18:
   ```javascript
   const SPOTIFY_CLIENT_ID = "";
   ```
4. Paste your Client ID:
   ```javascript
   const SPOTIFY_CLIENT_ID = "bb9db4a7e6db4c07b8ef17efd85e956b";
   ```
5. Save the file

### Step 5: Build and Load

1. Build the extension:

   ```bash
   npm run build
   ```

2. Load in Chrome:

   - Go to `chrome://extensions/`
   - Remove old version if exists
   - Click **Load unpacked**
   - Select the `dist` folder

3. Open a new tab - you should see the Zan homepage!

---

## Configuration

### Required Scopes

The extension requests these Spotify scopes:

- `user-read-playback-state` - Read current playback
- `user-modify-playback-state` - Control playback
- `user-read-currently-playing` - Get current track
- `streaming` - Web Playback SDK
- `user-read-email` - User profile
- `user-read-private` - Subscription type
- `playlist-read-private` - Access playlists
- `playlist-read-collaborative` - Collaborative playlists

### Content Security Policy

The extension uses a local copy of the Spotify Web Playback SDK to comply with Chrome's CSP:

```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'; style-src 'self' 'unsafe-inline'"
  }
}
```

---

## Usage

### First Time Setup

1. Open a new tab
2. Click **Music Player** in navigation
3. Click **Connect Spotify**
4. Authorize the app in the popup
5. You're connected! 🎵

### Playing Music

#### Option 1: Search and Play

1. Click the **SEARCH** tab
2. Type a song name
3. Click any result to play

#### Option 2: Play from Playlist

1. Click the **PLAYLISTS** tab
2. Click any playlist to start playing

#### Option 3: Transfer from Spotify

1. Play music in Spotify app/web
2. Open the Music Player
3. Click **⚡ Play Here** button
4. Music transfers to extension

### Controls

- **Play/Pause**: Click the main play button
- **Skip**: Previous/Next buttons
- **Volume**: Drag the volume slider
- **Seek**: Click on progress bar
- **Shuffle**: Toggle shuffle button
- **Repeat**: Cycle through off/context/track

---

## Troubleshooting

### "Not authenticated" error

**Solution**: Click "Connect Spotify" and re-authorize

### "Premium Required" alert

**Cause**: Spotify Free accounts can only view playback, not control it

**Solution**: Upgrade to Spotify Premium

### No search results appear

1. Check console for errors (F12)
2. Verify internet connection
3. Check if Client ID is correct
4. Ensure you're authenticated

### Playback doesn't work

1. **Check Premium status**: Look for "PREMIUM" badge
2. **Close other Spotify apps**: Only one device can play at a time
3. **Click "Play Here"**: Transfers playback to extension
4. **Check permissions**: Verify all scopes are granted

### "Failed to initialize player" error

1. Check console for detailed error
2. Verify Spotify Web Playback SDK is loaded (`/spotify-player.js`)
3. Clear cache and reload extension
4. Check if Premium account is active

### Extension not loading after update

1. Remove the extension completely
2. Rebuild: `npm run build`
3. Load unpacked from `dist` folder
4. Hard refresh (Ctrl+Shift+R) on new tab

---

## API Reference

### Spotify API Module (`src/api/spotifyApi.js`)

#### Authentication

```javascript
// Login with OAuth
await loginToSpotify();

// Check if authenticated
const isAuth = isAuthenticated();

// Get access token
const token = getAccessToken();

// Logout
logout();
```

#### Playback Control

```javascript
// Play track(s)
await play(deviceId, { uris: ["spotify:track:..."] });

// Pause
await pause();

// Skip
await skipToNext();
await skipToPrevious();

// Volume (0-100)
await setVolume(75);

// Seek (milliseconds)
await seek(30000);

// Shuffle
await setShuffle(true);

// Repeat ('off', 'context', 'track')
await setRepeat("context");
```

#### Data Fetching

```javascript
// Get current playback
const state = await getCurrentPlayback();

// Search tracks
const results = await search("query", ["track"], 20);

// Get playlists
const playlists = await getUserPlaylists();

// Get user profile
const profile = await getUserProfile();

// Get queue
const queue = await getQueue();
```

#### Device Management

```javascript
// Transfer playback to device
await transferPlayback(deviceId);
```

### Web Playback SDK (`src/composables/useSpotifyPlayer.js`)

```javascript
import { useSpotifyPlayer } from "@/composables/useSpotifyPlayer";

const {
  isPlayerReady,
  initializePlayer,
  playTrack,
  playPlaylist,
  transferPlayback,
  disconnectPlayer,
} = useSpotifyPlayer();

// Initialize player
await initializePlayer();

// Play specific track
await playTrack("spotify:track:...");

// Play playlist
await playPlaylist("spotify:playlist:...", 0);

// Transfer to this device
await transferPlayback();

// Cleanup
disconnectPlayer();
```

---

## File Structure

```
src/
├── api/
│   └── spotifyApi.js           # Spotify Web API wrapper
├── components/
│   └── MusicPlayer.vue         # Main music player component
├── composables/
│   └── useSpotifyPlayer.js     # Web Playback SDK wrapper
└── styles/
    └── music-player.css        # Music player styles

public/
└── spotify-player.js           # Local copy of Spotify SDK

manifest.json                   # Extension manifest with permissions
```

---

## Premium vs Free Features

### ✅ Free Account Can:

- Connect to Spotify
- View currently playing track (if playing on another device)
- See album artwork
- View track progress
- See queue (read-only)

### 🔒 Premium Required For:

- Play/pause control
- Skip tracks
- Volume control
- Seek position
- Search and play tracks
- Play from playlists
- Standalone playback in extension

---

## Support

For issues or questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review browser console for errors (F12)
3. Verify Spotify Dashboard settings
4. Ensure Premium account is active

---

## License

This integration follows Spotify's Developer Terms of Service and Design Guidelines.

---

**Last Updated**: October 28, 2025
