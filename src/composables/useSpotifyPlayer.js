import { ref } from "vue";
import * as SpotifyAPI from "../api/spotifyApi";

// Global player state
let player = null;
let deviceId = null;
const isPlayerReady = ref(false);
const audioContext = ref(null);
const audioAnalyser = ref(null);

/**
 * Initialize Spotify Web Playback SDK
 */
export function useSpotifyPlayer() {
  const initializePlayer = async () => {
    return new Promise((resolve, reject) => {
      // Wait for Spotify SDK to be loaded
      window.onSpotifyWebPlaybackSDKReady = () => {
        const token = SpotifyAPI.getAccessToken();

        if (!token) {
          reject(new Error("No access token available"));
          return;
        }

        player = new window.Spotify.Player({
          name: "Zan Music Player",
          getOAuthToken: (cb) => {
            cb(token);
          },
          volume: 0.75,
        });

        // Ready
        player.addListener("ready", ({ device_id }) => {
          console.log("Ready with Device ID", device_id);
          deviceId = device_id;
          isPlayerReady.value = true;
          resolve(device_id);
        });

        // Not Ready
        player.addListener("not_ready", ({ device_id }) => {
          console.log("Device ID has gone offline", device_id);
          isPlayerReady.value = false;
        });

        // Player State Changed
        player.addListener("player_state_changed", (state) => {
          if (!state) return;
          console.log("Player state changed", state);
        });

        // Error handling
        player.addListener("initialization_error", ({ message }) => {
          console.error("Initialization Error:", message);
          reject(new Error(message));
        });

        player.addListener("authentication_error", ({ message }) => {
          console.error("Authentication Error:", message);
          reject(new Error(message));
        });

        player.addListener("account_error", ({ message }) => {
          console.error("Account Error:", message);
          reject(new Error(message));
        });

        player.addListener("playback_error", ({ message }) => {
          console.error("Playback Error:", message);
        });

        // Connect to the player
        player.connect();
      };

      // SDK is already loaded via script tag in index.html
      // Just trigger the ready callback if SDK is available
      if (window.Spotify && window.Spotify.Player) {
        window.onSpotifyWebPlaybackSDKReady();
      } else {
        // Wait a bit for the SDK to load
        const checkSDK = setInterval(() => {
          if (window.Spotify && window.Spotify.Player) {
            clearInterval(checkSDK);
            window.onSpotifyWebPlaybackSDKReady();
          }
        }, 100);

        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkSDK);
          if (!window.Spotify) {
            reject(new Error("Spotify SDK failed to load"));
          }
        }, 10000);
      }
    });
  };

  /**
   * Play a specific track or playlist
   */
  const playTrack = async (uris) => {
    if (!deviceId) {
      throw new Error("Player not initialized");
    }

    const uriArray = Array.isArray(uris) ? uris : [uris];

    await SpotifyAPI.play(deviceId, { uris: uriArray });
  };

  /**
   * Play a playlist
   */
  const playPlaylist = async (playlistUri, offset = 0) => {
    if (!deviceId) {
      throw new Error("Player not initialized");
    }

    await SpotifyAPI.play(deviceId, {
      context_uri: playlistUri,
      offset: { position: offset },
    });
  };

  /**
   * Transfer playback to this device
   */
  const transferPlayback = async () => {
    if (!deviceId) {
      throw new Error("Player not initialized");
    }

    await SpotifyAPI.transferPlayback(deviceId);
  };

  /**
   * Get current player state
   */
  const getCurrentState = async () => {
    if (!player) return null;
    return await player.getCurrentState();
  };

  /**
   * Get the player instance
   */
  const getPlayer = () => {
    return player;
  };

  /**
   * Get the device ID
   */
  const getDeviceId = () => {
    return deviceId;
  };

  /**
   * Set volume (0.0 to 1.0)
   */
  const setPlayerVolume = async (volume) => {
    if (!player) {
      throw new Error("Player not initialized");
    }
    await player.setVolume(volume);
  };

  /**
   * Initialize audio analyser for visualizer
   */
  const initializeAudioAnalyser = async () => {
    try {
      if (!audioContext.value) {
        audioContext.value = new (window.AudioContext ||
          window.webkitAudioContext)();
        audioAnalyser.value = audioContext.value.createAnalyser();
        audioAnalyser.value.fftSize = 256; // 128 frequency bars
        audioAnalyser.value.smoothingTimeConstant = 0.8;
      }

      // Connect to the audio output
      if (player && audioContext.value.state === "suspended") {
        await audioContext.value.resume();
      }

      return audioAnalyser.value;
    } catch (error) {
      console.error("Failed to initialize audio analyser:", error);
      return null;
    }
  };

  /**
   * Get frequency data for visualizer
   */
  const getFrequencyData = () => {
    if (!audioAnalyser.value) return new Uint8Array(0);

    const bufferLength = audioAnalyser.value.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    audioAnalyser.value.getByteFrequencyData(dataArray);

    return dataArray;
  };

  /**
   * Disconnect player
   */
  const disconnectPlayer = () => {
    if (player) {
      player.disconnect();
      player = null;
      deviceId = null;
      isPlayerReady.value = false;
    }
  };

  return {
    player,
    deviceId,
    isPlayerReady,
    audioAnalyser,
    audioContext,
    initializePlayer,
    playTrack,
    playPlaylist,
    transferPlayback,
    getCurrentState,
    getPlayer,
    getDeviceId,
    setPlayerVolume,
    initializeAudioAnalyser,
    getFrequencyData,
    disconnectPlayer,
  };
}
