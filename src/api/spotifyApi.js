/**
 * Spotify Web API Integration
 * Handles authentication, playback control, and data fetching
 */

const SPOTIFY_CLIENT_ID = "bb9db4a7e6db4c07b8ef17efd85e956b"; // User needs to set this

// Auto-detect redirect URI based on environment
const getRedirectUri = () => {
  // Check if running as Chrome extension
  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id) {
    // Chrome extension redirect URI format: https://<extension-id>.chromiumapp.org/
    return `https://${chrome.runtime.id}.chromiumapp.org/`;
  }
  // Fallback to localhost for development
  return "http://localhost:5173/";
};

const REDIRECT_URI = getRedirectUri();

const SCOPES = [
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "streaming",
  "user-read-email",
  "user-read-private",
  "playlist-read-private",
  "playlist-read-collaborative",
].join(" ");

// Token storage keys
const ACCESS_TOKEN_KEY = "kinesis-spotify-access-token";
const REFRESH_TOKEN_KEY = "kinesis-spotify-refresh-token";
const TOKEN_EXPIRY_KEY = "kinesis-spotify-token-expiry";

/**
 * Generate random string for state parameter
 */
function generateRandomString(length) {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

/**
 * Generate code challenge for PKCE
 */
async function generateCodeChallenge(codeVerifier) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(codeVerifier)
  );
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

/**
 * Start Spotify OAuth flow
 */
export async function loginToSpotify() {
  if (!SPOTIFY_CLIENT_ID) {
    throw new Error(
      "Spotify Client ID not configured. Please set SPOTIFY_CLIENT_ID in spotifyApi.js"
    );
  }

  const codeVerifier = generateRandomString(64);
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateRandomString(16);

  // Store code verifier and state for callback handling
  localStorage.setItem("kinesis-spotify-code-verifier", codeVerifier);
  localStorage.setItem("kinesis-spotify-state", state);
  localStorage.setItem("kinesis-spotify-auth-pending", "true");

  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    state: state,
    scope: SCOPES,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
  });

  const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;

  // Use Chrome Identity API for extensions
  if (
    typeof chrome !== "undefined" &&
    chrome.identity &&
    chrome.identity.launchWebAuthFlow
  ) {
    console.log("Using chrome.identity.launchWebAuthFlow");
    console.log("Redirect URI:", REDIRECT_URI);

    return new Promise((resolve, reject) => {
      chrome.identity.launchWebAuthFlow(
        {
          url: authUrl,
          interactive: true,
        },
        async (redirectUrl) => {
          if (chrome.runtime.lastError) {
            console.error("Chrome runtime error:", chrome.runtime.lastError);
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }

          if (!redirectUrl) {
            reject(new Error("No redirect URL received"));
            return;
          }

          console.log("Received redirect URL:", redirectUrl);

          try {
            // Parse the callback URL
            const url = new URL(redirectUrl);
            const code = url.searchParams.get("code");
            const returnedState = url.searchParams.get("state");
            const storedState = localStorage.getItem("kinesis-spotify-state");
            const storedVerifier = localStorage.getItem(
              "kinesis-spotify-code-verifier"
            );

            if (!code) {
              throw new Error("No authorization code received");
            }

            if (returnedState !== storedState) {
              throw new Error("State mismatch - possible CSRF attack");
            }

            console.log(
              "Authorization code received, exchanging for tokens..."
            );

            // Exchange code for tokens
            await exchangeCodeForTokens(code, storedVerifier);

            // Clean up
            localStorage.removeItem("kinesis-spotify-state");
            localStorage.removeItem("kinesis-spotify-code-verifier");

            console.log("Successfully authenticated with Spotify!");
            resolve();
          } catch (error) {
            console.error("Token exchange error:", error);
            reject(error);
          }
        }
      );
    });
  } else {
    // Fallback to regular redirect for non-extension environments
    console.log("Using window redirect for authentication");
    window.location.href = authUrl;
  }
}

/**
 * Exchange authorization code for access tokens
 */
async function exchangeCodeForTokens(code, codeVerifier) {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      grant_type: "authorization_code",
      code: code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Token exchange failed: ${error.error_description || error.error}`
    );
  }

  const data = await response.json();
  storeTokens(data);

  // Clean up temporary storage
  localStorage.removeItem("kinesis-spotify-state");
  localStorage.removeItem("kinesis-spotify-code-verifier");

  return data;
}

/**
 * Store tokens in localStorage
 */
function storeTokens(data) {
  const expiryTime = Date.now() + data.expires_in * 1000;
  localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
  if (data.refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
  }
}

/**
 * Get stored access token
 */
export function getAccessToken() {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

  if (!token || !expiry) {
    return null;
  }

  // Check if token is expired
  if (Date.now() >= parseInt(expiry)) {
    return null;
  }

  return token;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  return !!getAccessToken();
}

/**
 * Refresh access token
 */
export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh token");
  }

  const data = await response.json();
  storeTokens(data);
  return data.access_token;
}

/**
 * Logout and clear tokens
 */
export function logout() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
}

/**
 * Make authenticated request to Spotify API
 */
async function spotifyRequest(endpoint, options = {}) {
  let token = getAccessToken();

  if (!token) {
    // Try to refresh token
    try {
      token = await refreshAccessToken();
    } catch (error) {
      throw new Error("Not authenticated");
    }
  }

  const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  // Handle rate limiting (429 Too Many Requests)
  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After") || 5;
    console.warn(`Rate limited! Retry after ${retryAfter} seconds`);
    throw new Error(`Rate limited. Please wait ${retryAfter} seconds.`);
  }

  if (response.status === 401) {
    // Token expired, try to refresh
    try {
      token = await refreshAccessToken();
      // Retry request
      return await fetch(`https://api.spotify.com/v1${endpoint}`, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      throw new Error("Authentication failed");
    }
  }

  return response;
}

/**
 * Get current playback state
 */
export async function getCurrentPlayback() {
  const response = await spotifyRequest("/me/player");

  if (response.status === 204) {
    // No active playback
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to get playback state");
  }

  return await response.json();
}

/**
 * Get user profile (includes subscription type)
 */
export async function getUserProfile() {
  const response = await spotifyRequest("/me");

  if (!response.ok) {
    throw new Error("Failed to get user profile");
  }

  return await response.json();
}

/**
 * Get currently playing track
 */
export async function getCurrentlyPlaying() {
  const response = await spotifyRequest("/me/player/currently-playing");

  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to get currently playing track");
  }

  return await response.json();
}

/**
 * Get user's queue
 */
export async function getQueue() {
  const response = await spotifyRequest("/me/player/queue");

  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to get queue");
  }

  return await response.json();
}

/**
 * Search for tracks, albums, artists, or playlists
 */
export async function search(query, types = ["track"], limit = 20) {
  const typeParam = Array.isArray(types) ? types.join(",") : types;
  const response = await spotifyRequest(
    `/search?q=${encodeURIComponent(query)}&type=${typeParam}&limit=${limit}`
  );

  if (!response.ok) {
    throw new Error("Failed to search");
  }

  return await response.json();
}

/**
 * Play/Resume playback
 */
export async function play(deviceId = null, body = null) {
  const endpoint = deviceId
    ? `/me/player/play?device_id=${deviceId}`
    : "/me/player/play";

  const options = {
    method: "PUT",
  };

  if (body) {
    options.headers = {
      "Content-Type": "application/json",
    };
    options.body = JSON.stringify(body);
  }

  const response = await spotifyRequest(endpoint, options);

  if (!response.ok && response.status !== 204) {
    throw new Error("Failed to play");
  }
}

/**
 * Pause playback
 */
export async function pause() {
  const response = await spotifyRequest("/me/player/pause", { method: "PUT" });

  if (!response.ok && response.status !== 204) {
    throw new Error("Failed to pause");
  }
}

/**
 * Skip to next track
 */
export async function skipToNext() {
  const response = await spotifyRequest("/me/player/next", { method: "POST" });

  if (!response.ok && response.status !== 204) {
    throw new Error("Failed to skip to next");
  }
}

/**
 * Skip to previous track
 */
export async function skipToPrevious() {
  const response = await spotifyRequest("/me/player/previous", {
    method: "POST",
  });

  if (!response.ok && response.status !== 204) {
    throw new Error("Failed to skip to previous");
  }
}

/**
 * Set volume (0-100)
 */
export async function setVolume(volumePercent, deviceId = null) {
  let url = `/me/player/volume?volume_percent=${volumePercent}`;
  if (deviceId) {
    url += `&device_id=${deviceId}`;
  }

  const response = await spotifyRequest(url, {
    method: "PUT",
  });

  if (!response.ok && response.status !== 204) {
    throw new Error("Failed to set volume");
  }
}

/**
 * Seek to position (milliseconds)
 */
export async function seek(positionMs) {
  const response = await spotifyRequest(
    `/me/player/seek?position_ms=${positionMs}`,
    {
      method: "PUT",
    }
  );

  if (!response.ok && response.status !== 204) {
    throw new Error("Failed to seek");
  }
}

/**
 * Get user's playlists
 */
export async function getUserPlaylists(limit = 20) {
  const response = await spotifyRequest(`/me/playlists?limit=${limit}`);

  if (!response.ok) {
    throw new Error("Failed to get playlists");
  }

  return await response.json();
}

/**
 * Get playlist tracks
 */
export async function getPlaylistTracks(playlistId, limit = 50) {
  const response = await spotifyRequest(
    `/playlists/${playlistId}/tracks?limit=${limit}`
  );

  if (!response.ok) {
    throw new Error("Failed to get playlist tracks");
  }

  return await response.json();
}

/**
 * Get available devices
 */
export async function getDevices() {
  const response = await spotifyRequest("/me/player/devices");

  if (!response.ok) {
    throw new Error("Failed to get devices");
  }

  return await response.json();
}

/**
 * Transfer playback to device
 */
export async function transferPlayback(deviceId, play = true) {
  const response = await spotifyRequest("/me/player", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      device_ids: [deviceId],
      play: play,
    }),
  });

  if (!response.ok && response.status !== 204) {
    throw new Error("Failed to transfer playback");
  }
}

/**
 * Set shuffle mode
 */
export async function setShuffle(state) {
  const response = await spotifyRequest(`/me/player/shuffle?state=${state}`, {
    method: "PUT",
  });

  if (!response.ok && response.status !== 204) {
    throw new Error("Failed to set shuffle");
  }
}

/**
 * Set repeat mode (track, context, off)
 */
export async function setRepeat(state) {
  const response = await spotifyRequest(`/me/player/repeat?state=${state}`, {
    method: "PUT",
  });

  if (!response.ok && response.status !== 204) {
    throw new Error("Failed to set repeat");
  }
}

/**
 * Get audio analysis for a track
 * Returns detailed audio analysis including beats, bars, segments with pitch and timbre data
 */
export async function getAudioAnalysis(trackId) {
  const response = await spotifyRequest(`/audio-analysis/${trackId}`);

  if (!response.ok) {
    throw new Error("Failed to get audio analysis");
  }

  return await response.json();
}

/**
 * Get audio features for a track
 * Returns high-level features like energy, danceability, tempo, etc.
 */
export async function getAudioFeatures(trackId) {
  const response = await spotifyRequest(`/audio-features/${trackId}`);

  if (!response.ok) {
    throw new Error("Failed to get audio features");
  }

  return await response.json();
}

export { SPOTIFY_CLIENT_ID };
