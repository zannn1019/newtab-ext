import { ref, computed } from "vue";
import * as SpotifyAPI from "../api/spotifyApi";

// Global music state - shared across all components
const isPlaying = ref(false);
const shuffle = ref(false);
const repeat = ref("off");
const connected = ref(false);
const isPremium = ref(false);
const volume = ref(75);
const currentProgress = ref(0);
const deviceName = ref("Web Player");

const currentTrack = ref({
  title: "No track playing",
  artist: "Connect to Spotify",
  album: "",
  albumArt: "",
  duration: 0,
  explicit: false,
  id: null,
});

const queue = ref([]);
const audioAnalysis = ref(null);
const audioFeatures = ref(null);

// Computed
const progressPercentage = computed(() => {
  if (!currentTrack.value.duration) return 0;
  return (currentProgress.value / currentTrack.value.duration) * 100;
});

// Format duration helper
const formatDuration = (ms) => {
  if (!ms) return "0:00";
  const seconds = Math.floor(ms / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// Polling interval
let pollInterval = null;
let progressInterval = null;

// Update current track from Spotify
const updateCurrentTrack = async () => {
  try {
    const playbackState = await SpotifyAPI.getCurrentPlayback();

    if (!playbackState || !playbackState.item) {
      return;
    }

    const track = playbackState.item;
    const trackId = track.id;

    // Check if track changed
    if (trackId !== currentTrack.value.id) {
      currentTrack.value = {
        id: trackId,
        title: track.name,
        artist: track.artists.map((a) => a.name).join(", "),
        album: track.album.name,
        albumArt: track.album.images[0]?.url || "",
        duration: track.duration_ms,
        explicit: track.explicit,
      };

      // Fetch audio analysis for the new track
      try {
        const [analysis, features] = await Promise.all([
          SpotifyAPI.getAudioAnalysis(trackId),
          SpotifyAPI.getAudioFeatures(trackId),
        ]);
        audioAnalysis.value = analysis;
        audioFeatures.value = features;
      } catch (error) {
        console.error("Failed to fetch audio analysis:", error);
        audioAnalysis.value = null;
        audioFeatures.value = null;
      }
    }

    isPlaying.value = playbackState.is_playing;
    shuffle.value = playbackState.shuffle_state;
    repeat.value = playbackState.repeat_state;
    currentProgress.value = playbackState.progress_ms;
    volume.value = playbackState.device.volume_percent;
    deviceName.value = playbackState.device.name;

    // Fetch queue if Premium
    if (isPremium.value) {
      try {
        const queueData = await SpotifyAPI.getQueue();
        if (queueData && queueData.queue && queueData.queue.length > 0) {
          queue.value = queueData.queue.slice(0, 5).map((item) => ({
            title: item.name,
            artist: item.artists.map((a) => a.name).join(", "),
            duration: item.duration_ms,
          }));
        } else {
          queue.value = [];
        }
      } catch (error) {
        queue.value = [];
      }
    }
  } catch (error) {
    console.error("Failed to update track:", error);
    if (error.message === "Not authenticated") {
      connected.value = false;
      SpotifyAPI.logout();
    }
  }
};

// Start polling for playback state
const startPolling = () => {
  if (pollInterval) return;

  pollInterval = setInterval(async () => {
    if (connected.value) {
      await updateCurrentTrack();
    }
  }, 1000);
};

// Stop polling
const stopPolling = () => {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
};

// Start progress update for smooth UI
const startProgressUpdate = () => {
  if (progressInterval) return;

  progressInterval = setInterval(() => {
    if (isPlaying.value && currentTrack.value.duration) {
      currentProgress.value = Math.min(
        currentProgress.value + 100,
        currentTrack.value.duration
      );
    }
  }, 100);
};

// Stop progress update
const stopProgressUpdate = () => {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
};

export function useMusicStore() {
  return {
    // State
    isPlaying,
    shuffle,
    repeat,
    connected,
    isPremium,
    volume,
    currentProgress,
    deviceName,
    currentTrack,
    queue,
    audioAnalysis,
    audioFeatures,

    // Computed
    progressPercentage,

    // Helpers
    formatDuration,

    // Functions
    updateCurrentTrack,
    startPolling,
    stopPolling,
    startProgressUpdate,
    stopProgressUpdate,
  };
}
