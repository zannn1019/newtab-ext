<template>
    <div class="music-player">
        <!-- Decorative elements -->
        <div class="corner-accent top-left"></div>
        <div class="corner-accent top-right"></div>
        <div class="corner-accent bottom-left"></div>
        <div class="corner-accent bottom-right"></div>
        <div class="vertical-text left">音楽</div>
        <div class="vertical-text right">プレーヤー</div>

        <!-- Page header -->
        <header class="player-header">
            <div class="header-content">
                <h1 class="page-title">MUSIC PLAYER</h1>
                <p class="page-subtitle">音楽 • Spotify Integration</p>
            </div>
            <div class="header-decoration">
                <span class="deco-circle"></span>
                <span class="deco-line"></span>
            </div>
        </header>

        <!-- Main content -->
        <div class="player-content">
            <!-- Left: Album Art & Vinyl -->
            <div class="album-section">
                <!-- Vinyl record effect -->
                <div class="vinyl-container" :class="{ spinning: isPlaying }">
                    <div class="vinyl-record">
                        <div class="vinyl-grooves"></div>
                        <div class="vinyl-label">
                            <div class="label-content" v-if="currentTrack.albumArt">
                                <img :src="currentTrack.albumArt" alt="Album" class="label-image" />
                            </div>
                        </div>
                        <div class="vinyl-center"></div>
                    </div>
                </div>

                <!-- Album art display -->
                <!-- <div class="album-art-display">
                    <div class="art-frame">
                        <img v-if="currentTrack.albumArt" :src="currentTrack.albumArt" :alt="currentTrack.album"
                            class="album-image" />
                        <div v-else class="album-placeholder">
                            <span class="placeholder-icon">♫</span>
                        </div>
                    </div>
                    <div class="art-reflection"></div>
                </div> -->

                <!-- Waveform visualizer -->
                <div class="waveform-container">
                    <div class="waveform">
                        <div v-for="(value, i) in frequencyData" :key="i" class="wave-bar" :style="{
                            height: `${Math.max(8, value)}%`,
                            opacity: isPlaying ? (0.5 + (value / 200)) : 0.3
                        }">
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right: Track Info & Controls -->
            <div class="controls-section">
                <!-- Now Playing Info -->
                <div class="track-info">
                    <div class="info-label">
                        <span class="label-dot"></span>
                        <span class="label-text">NOW PLAYING</span>
                        <span class="label-line"></span>
                    </div>

                    <h2 class="track-title">{{ currentTrack.title || 'No track playing' }}</h2>
                    <p class="track-artist">{{ currentTrack.artist || 'Connect to Spotify' }}</p>
                    <p class="track-album">{{ currentTrack.album }}</p>

                    <div class="track-meta">
                        <span class="meta-badge">{{ currentTrack.explicit ? 'EXPLICIT' : 'CLEAN' }}</span>
                        <span class="meta-separator">|</span>
                        <span class="meta-time">{{ formatDuration(currentTrack.duration) }}</span>
                    </div>
                </div>

                <!-- Progress Bar -->
                <div class="progress-section">
                    <div class="progress-time">
                        <span class="time-current">{{ formatDuration(currentProgress) }}</span>
                        <span class="time-total">{{ formatDuration(currentTrack.duration) }}</span>
                    </div>
                    <div class="progress-bar" @click="seekTrack">
                        <div class="progress-fill" :style="{ width: progressPercentage + '%' }">
                            <span class="progress-indicator"></span>
                        </div>
                    </div>
                </div>

                <!-- Playback Controls -->
                <div class="playback-controls">
                    <button class="control-btn secondary" @click="toggleShuffle" :class="{ active: shuffle }">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
                        </svg>
                    </button>

                    <button class="control-btn secondary" @click="previousTrack">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <polygon points="19 20 9 12 19 4 19 20"></polygon>
                            <line x1="5" y1="19" x2="5" y2="5"></line>
                        </svg>
                    </button>

                    <button class="control-btn primary" @click="togglePlay">
                        <svg v-if="!isPlaying" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        <svg v-else width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="4" width="4" height="16"></rect>
                            <rect x="14" y="4" width="4" height="16"></rect>
                        </svg>
                    </button>

                    <button class="control-btn secondary" @click="nextTrack">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <polygon points="5 4 15 12 5 20 5 4"></polygon>
                            <line x1="19" y1="5" x2="19" y2="19"></line>
                        </svg>
                    </button>

                    <button class="control-btn secondary" @click="toggleRepeat" :class="{ active: repeat }">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <polyline points="17 1 21 5 17 9"></polyline>
                            <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                            <polyline points="7 23 3 19 7 15"></polyline>
                            <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                        </svg>
                    </button>
                </div>

                <!-- Volume Control -->
                <div class="volume-section">
                    <svg class="volume-icon" width="20" height="20" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    </svg>
                    <div class="volume-bar" @click="setVolume">
                        <div class="volume-fill" :style="{ width: volume + '%' }"></div>
                    </div>
                    <span class="volume-value">{{ volume }}</span>
                </div>

                <!-- Spotify Connection Status -->
                <div class="connection-status">
                    <div v-if="!connected" class="status-disconnected">
                        <span class="status-icon">○</span>
                        <span class="status-text">Not connected to Spotify</span>
                        <button class="btn-connect" @click="connectSpotify">
                            <span>Connect Spotify</span>
                        </button>
                    </div>
                    <div v-else class="status-connected">
                        <span class="status-icon active">●</span>
                        <span class="status-text">Connected to Spotify</span>
                        <span class="status-device">{{ deviceName }}</span>
                        <span v-if="!isPremium" class="status-badge free">FREE</span>
                        <span v-else class="status-badge premium">PREMIUM</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Queue/Playlist Section -->
        <div class="queue-section">
            <div class="queue-header">
                <div class="queue-tabs">
                    <button class="tab-btn" :class="{ active: activeTab === 'queue' }" @click="activeTab = 'queue'">
                        QUEUE
                    </button>
                    <button class="tab-btn" :class="{ active: activeTab === 'search' }" @click="activeTab = 'search'"
                        v-if="isPremium">
                        SEARCH
                    </button>
                    <button class="tab-btn" :class="{ active: activeTab === 'playlists' }" @click="loadPlaylists"
                        v-if="isPremium">
                        PLAYLISTS
                    </button>
                </div>

                <!-- Transfer Playback Button -->
                <button v-if="isPremium && isPlayerReady" @click="handleTransferPlayback" class="tab-btn">
                    ⚡ Play Here
                </button>
            </div>

            <!-- Search Tab -->
            <div v-if="activeTab === 'search' && isPremium" class="search-tab">
                <div class="search-input-container">
                    <input type="text" v-model="searchQuery" @input="searchTracks" placeholder="Search for tracks..."
                        class="search-input" />
                </div>
                <div class="search-results">
                    <div v-if="searchResults.length === 0 && !searchQuery" class="empty-state">
                        Search for tracks to play
                    </div>
                    <div v-for="track in searchResults" :key="track.id" class="queue-item clickable"
                        @click="playSearchedTrack(track)">
                        <img :src="track.album.images[2]?.url || track.album.images[0]?.url" class="track-thumbnail" />
                        <div class="queue-info">
                            <p class="queue-track-title">{{ track.name }}</p>
                            <p class="queue-track-artist">{{track.artists.map(a => a.name).join(', ')}}</p>
                        </div>
                        <span class="queue-duration">{{ formatDuration(track.duration_ms) }}</span>
                    </div>
                </div>
            </div>

            <!-- Playlists Tab -->
            <div v-if="activeTab === 'playlists' && isPremium" class="playlists-tab">
                <div class="queue-list">
                    <div v-if="playlists.length === 0" class="empty-state">
                        Loading playlists...
                    </div>
                    <div v-for="playlist in playlists" :key="playlist.id" class="queue-item clickable"
                        @click="playPlaylist(playlist)">
                        <img v-if="playlist.images[0]" :src="playlist.images[0]?.url" class="track-thumbnail" />
                        <div class="queue-info">
                            <p class="queue-track-title">{{ playlist.name }}</p>
                            <p class="queue-track-artist">{{ playlist.tracks.total }} tracks</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Queue Tab -->
            <div v-if="activeTab === 'queue'" class="queue-list">
                <div v-if="queue.length === 0" class="empty-state">
                    <p v-if="!connected">Connect to Spotify to see your queue</p>
                    <p v-else-if="!isPremium">Queue viewing requires Spotify Premium</p>
                    <p v-else>No tracks in queue</p>
                </div>
                <div v-for="(track, index) in queue" :key="index" class="queue-item" :class="{ active: index === 0 }">
                    <span class="queue-index">{{ String(index + 1).padStart(2, '0') }}</span>
                    <div class="queue-info">
                        <p class="queue-track-title">{{ track.title }}</p>
                        <p class="queue-track-artist">{{ track.artist }}</p>
                    </div>
                    <span class="queue-duration">{{ formatDuration(track.duration) }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import * as SpotifyAPI from '../api/spotifyApi'
import { useSpotifyPlayer } from '../composables/useSpotifyPlayer'
import { useMusicStore } from '../composables/useMusicStore'

// Global music store
const globalStore = useMusicStore()

// Spotify Player SDK
const {
    isPlayerReady,
    initializePlayer,
    playTrack,
    playPlaylist: sdkPlayPlaylist,
    transferPlayback,
    getCurrentState,
    getPlayer,
    getDeviceId,
    setPlayerVolume,
    audioAnalyser,
    initializeAudioAnalyser,
    getFrequencyData
} = useSpotifyPlayer()

// State
const isPlaying = ref(false)
const shuffle = ref(false)
const repeat = ref('off') // 'off', 'context', 'track'
const connected = ref(false)
const isPremium = ref(false) // Track if user has Premium
const volume = ref(75)
const currentProgress = ref(0)
const deviceName = ref('Web Player')
const loading = ref(false)

// UI state
const activeTab = ref('queue')
const searchQuery = ref('')
const searchResults = ref([])
const playlists = ref([])

// Audio visualizer - 40 bars showing loudness over time
const frequencyData = ref(new Array(40).fill(20))
let animationFrameId = null

// Audio analysis data
const audioAnalysis = ref(null)
const audioFeatures = ref(null)
const currentTrackId = ref(null)
const trackStartTime = ref(0)

// Current track
const currentTrack = ref({
    title: 'Connect to Spotify',
    artist: 'Start listening to your music',
    album: '',
    albumArt: '',
    duration: 0,
    explicit: false
})

// Queue
const queue = ref([])

// Computed
const progressPercentage = computed(() => {
    if (!currentTrack.value.duration) return 0
    return (currentProgress.value / currentTrack.value.duration) * 100
})

// Initialize Spotify connection
const initSpotify = async () => {
    try {
        // Check if user is already authenticated
        if (SpotifyAPI.isAuthenticated()) {
            connected.value = true
            globalStore.connected.value = true

            // Check Premium status
            try {
                const profile = await SpotifyAPI.getUserProfile()
                isPremium.value = profile.product === 'premium'
                globalStore.isPremium.value = isPremium.value
                console.log('User subscription:', profile.product)

                // Initialize Web Playback SDK for Premium users
                if (isPremium.value) {
                    try {
                        await initializePlayer()
                        deviceName.value = 'Zan Music Player'
                        globalStore.deviceName.value = 'Zan Music Player'
                        console.log('Spotify Web Playback SDK initialized')

                        // Initialize audio analyser for visualizer
                        initializeAudioAnalyser()
                    } catch (error) {
                        console.error('Failed to initialize player SDK:', error)
                    }
                }
            } catch (error) {
                console.error('Failed to get premium status:', error)
                isPremium.value = false // Assume free on error
                globalStore.isPremium.value = false
            }

            await updateCurrentTrack()
            startPolling()

            // Start global polling for persistent music state
            globalStore.startPolling()
            globalStore.startProgressUpdate()
        }
    } catch (error) {
        console.error('Spotify init error:', error)
        connected.value = false
        globalStore.connected.value = false
    } finally {
        loading.value = false
    }
}

// Update current track from Spotify
const updateCurrentTrack = async () => {
    try {
        const playbackState = await SpotifyAPI.getCurrentPlayback()

        if (!playbackState || !playbackState.item) {
            return
        }

        const track = playbackState.item
        const trackId = track.id

        // Check if track changed
        if (trackId !== currentTrackId.value) {
            currentTrackId.value = trackId
            trackStartTime.value = Date.now() - playbackState.progress_ms

            // Fetch audio analysis for the new track
            try {
                console.log('Fetching audio analysis for track:', trackId)
                const [analysis, features] = await Promise.all([
                    SpotifyAPI.getAudioAnalysis(trackId),
                    SpotifyAPI.getAudioFeatures(trackId)
                ])
                audioAnalysis.value = analysis
                audioFeatures.value = features
                console.log('Audio analysis loaded:', {
                    beats: analysis.beats?.length,
                    segments: analysis.segments?.length,
                    tempo: features.tempo,
                    energy: features.energy
                })
            } catch (error) {
                console.error('Failed to fetch audio analysis:', error)
                audioAnalysis.value = null
                audioFeatures.value = null
            }
        }

        currentTrack.value = {
            title: track.name,
            artist: track.artists.map(a => a.name).join(', '),
            album: track.album.name,
            albumArt: track.album.images[0]?.url || '',
            duration: track.duration_ms,
            explicit: track.explicit
        }

        isPlaying.value = playbackState.is_playing
        shuffle.value = playbackState.shuffle_state
        repeat.value = playbackState.repeat_state
        currentProgress.value = playbackState.progress_ms
        volume.value = playbackState.device.volume_percent
        deviceName.value = playbackState.device.name

        // Fetch queue separately if Premium
        if (isPremium.value) {
            await updateQueue()
        }
    } catch (error) {
        console.error('Failed to update track:', error)
        if (error.message === 'Not authenticated') {
            connected.value = false
            SpotifyAPI.logout()
        }
    }
}

// Update queue from Spotify
const updateQueue = async () => {
    if (!isPremium.value) {
        queue.value = []
        return
    }

    try {
        const queueData = await SpotifyAPI.getQueue()

        if (queueData && queueData.queue && queueData.queue.length > 0) {
            // Show next 5 tracks in queue
            queue.value = queueData.queue.slice(0, 5).map(item => ({
                title: item.name,
                artist: item.artists.map(a => a.name).join(', '),
                duration: item.duration_ms
            }))
        } else {
            queue.value = []
        }
    } catch (error) {
        console.error('Failed to update queue:', error)
        // Queue endpoint may fail, don't show error to user
        queue.value = []
    }
}

// Playback controls
const togglePlay = async () => {
    if (!connected.value) {
        connectSpotify()
        return
    }

    try {
        if (isPlaying.value) {
            await SpotifyAPI.pause()
            isPlaying.value = false
        } else {
            await SpotifyAPI.play()
            isPlaying.value = true
        }
    } catch (error) {
        console.error('Toggle play error:', error)
        if (error.message.includes('Premium')) {
            alert('⚠️ Spotify Premium Required\n\nPlayback control requires Spotify Premium. With a free account, you can:\n• View currently playing tracks\n• See album artwork\n• View the queue\n\nUpgrade to Premium to control playback!')
        }
    }
}

const previousTrack = async () => {
    if (!connected.value) return

    try {
        await SpotifyAPI.skipToPrevious()
        // Wait a bit for Spotify to update
        setTimeout(updateCurrentTrack, 500)
    } catch (error) {
        console.error('Previous track error:', error)
        if (error.message.includes('Premium') || error.message.includes('PREMIUM_REQUIRED')) {
            alert('⚠️ Spotify Premium Required\n\nSkipping tracks requires Spotify Premium.')
        }
    }
}

const nextTrack = async () => {
    if (!connected.value) return

    try {
        await SpotifyAPI.skipToNext()
        // Wait a bit for Spotify to update
        setTimeout(updateCurrentTrack, 500)
    } catch (error) {
        console.error('Next track error:', error)
        if (error.message.includes('Premium') || error.message.includes('PREMIUM_REQUIRED')) {
            alert('⚠️ Spotify Premium Required\n\nSkipping tracks requires Spotify Premium.')
        }
    }
}

const toggleShuffle = async () => {
    if (!connected.value) return

    try {
        const newState = !shuffle.value
        await SpotifyAPI.setShuffle(newState)
        shuffle.value = newState
    } catch (error) {
        console.error('Toggle shuffle error:', error)
    }
}

const toggleRepeat = async () => {
    if (!connected.value) return

    try {
        // Cycle through: off -> context -> track -> off
        const states = ['off', 'context', 'track']
        const currentIndex = states.indexOf(repeat.value)
        const newState = states[(currentIndex + 1) % states.length]
        await SpotifyAPI.setRepeat(newState)
        repeat.value = newState
    } catch (error) {
        console.error('Toggle repeat error:', error)
    }
}

const seekTrack = async (event) => {
    if (!connected.value || !currentTrack.value.duration) return

    try {
        const bar = event.currentTarget
        const clickX = event.clientX - bar.getBoundingClientRect().left
        const percentage = clickX / bar.offsetWidth
        const positionMs = Math.floor(percentage * currentTrack.value.duration)

        await SpotifyAPI.seek(positionMs)
        currentProgress.value = positionMs
    } catch (error) {
        console.error('Seek error:', error)
    }
}

const setVolume = async (event) => {
    if (!connected.value) return

    try {
        const bar = event.currentTarget
        const clickX = event.clientX - bar.getBoundingClientRect().left
        const newVolume = Math.max(0, Math.min(100, Math.round((clickX / bar.offsetWidth) * 100)))

        // Try to set volume on the Web Playback SDK player first (if Premium)
        if (isPremium.value && isPlayerReady.value) {
            try {
                await setPlayerVolume(newVolume / 100) // SDK uses 0.0 to 1.0
                volume.value = newVolume
                console.log('Volume set via SDK:', newVolume)
                return
            } catch (sdkError) {
                console.warn('SDK volume control failed, trying API:', sdkError)
            }
        }

        // Fallback to Spotify API
        const currentDeviceId = getDeviceId()
        await SpotifyAPI.setVolume(newVolume, currentDeviceId)
        volume.value = newVolume
        console.log('Volume set via API:', newVolume)
    } catch (error) {
        console.error('Set volume error:', error)
        if (error.message.includes('Premium') || error.message.includes('PREMIUM_REQUIRED')) {
            alert('⚠️ Spotify Premium Required\n\nVolume control requires Spotify Premium.')
        }
    }
}

// Spotify connection
const connectSpotify = async () => {
    try {
        if (!SpotifyAPI.SPOTIFY_CLIENT_ID) {
            // Show extension-specific instructions
            const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
            const redirectUri = isExtension
                ? `https://${chrome.runtime.id}.chromiumapp.org/`
                : 'http://localhost:5173/';

            let message = 'Please configure Spotify Client ID in src/api/spotifyApi.js\n\n';
            message += '1. Go to https://developer.spotify.com/dashboard\n';
            message += '2. Create a new app\n';
            message += '3. Copy the Client ID\n';
            message += `4. Add this Redirect URI: ${redirectUri}\n`;
            message += '5. Paste the Client ID in spotifyApi.js\n\n';

            if (isExtension) {
                message += `Your Extension ID: ${chrome.runtime.id}\n`;
                message += 'The redirect URI has been copied to your clipboard!';

                // Copy to clipboard
                try {
                    await navigator.clipboard.writeText(redirectUri);
                } catch (e) {
                    console.error('Failed to copy to clipboard:', e);
                }
            }

            alert(message);
            return;
        }

        // Start OAuth flow
        await SpotifyAPI.loginToSpotify()

        // After successful authentication, update the UI
        connected.value = true

        // Check Premium status
        try {
            const profile = await SpotifyAPI.getUserProfile()
            isPremium.value = profile.product === 'premium'
            console.log('User subscription:', profile.product)

            // Initialize Web Playback SDK for Premium users
            if (isPremium.value) {
                try {
                    await initializePlayer()
                    deviceName.value = 'Zan Music Player'
                    console.log('Spotify Web Playback SDK initialized')

                    // Initialize audio analyser for visualizer
                    initializeAudioAnalyser()
                } catch (error) {
                    console.error('Failed to initialize player SDK:', error)
                }
            }
        } catch (error) {
            console.error('Failed to get premium status:', error)
            isPremium.value = false // Assume free on error
        }

        await updateCurrentTrack()
        startPolling()
    } catch (error) {
        console.error('Connect error:', error)
        alert(`Failed to connect to Spotify: ${error.message}`)
    }
}

// Search for tracks
let searchTimeout = null
const searchTracks = async () => {
    if (searchTimeout) clearTimeout(searchTimeout)

    if (!searchQuery.value || searchQuery.value.length < 2) {
        searchResults.value = []
        return
    }

    searchTimeout = setTimeout(async () => {
        try {
            const results = await SpotifyAPI.search(searchQuery.value, ['track'], 20)
            searchResults.value = results.tracks?.items || []
        } catch (error) {
            console.error('Search failed:', error)
        }
    }, 300) // Debounce 300ms
}

// Play a searched track
const playSearchedTrack = async (track) => {
    try {
        if (!isPlayerReady.value) {
            // Initialize player first
            console.log('Initializing Spotify Web Player...')
            const devId = await initializePlayer()
            console.log('Player ready with device ID:', devId)

            // Transfer playback to this device
            console.log('Transferring playback to extension...')
            await transferPlayback()

            // Wait a moment for transfer to complete
            await new Promise(resolve => setTimeout(resolve, 1000))
        }

        console.log('Playing track:', track.name)
        await playTrack(track.uri)

        // Update UI immediately
        currentTrack.value = {
            title: track.name,
            artist: track.artists.map(a => a.name).join(', '),
            album: track.album.name,
            albumArt: track.album.images[0]?.url || '',
            duration: track.duration_ms,
            explicit: track.explicit
        }
        isPlaying.value = true
    } catch (error) {
        console.error('Failed to play track:', error)
        alert(`Failed to play track: ${error.message}\n\nMake sure:\n1. You have Spotify Premium\n2. No other Spotify app is playing\n3. The extension has proper permissions`)
    }
}

// Load user playlists
const loadPlaylists = async () => {
    if (activeTab.value === 'playlists' && playlists.value.length > 0) {
        return // Already loaded
    }

    activeTab.value = 'playlists'

    try {
        const response = await SpotifyAPI.getUserPlaylists()
        playlists.value = response.items || []
    } catch (error) {
        console.error('Failed to load playlists:', error)
    }
}

// Play a playlist
const playPlaylist = async (playlist) => {
    try {
        if (!isPlayerReady.value) {
            await initializePlayer()
            await transferPlayback()
        }

        await sdkPlayPlaylist(playlist.uri, 0)
        isPlaying.value = true
    } catch (error) {
        console.error('Failed to play playlist:', error)
        alert('Failed to play playlist. Make sure Spotify is not playing on another device.')
    }
}

// Transfer playback to extension
const handleTransferPlayback = async () => {
    try {
        console.log('Transferring playback to extension...')
        await transferPlayback()
        // Refresh current track info
        await updateCurrentTrack()
    } catch (error) {
        console.error('Failed to transfer playback:', error)
        alert('Failed to transfer playback. Make sure music is playing on another device.')
    }
}

// Format helpers
const formatDuration = (ms) => {
    if (!ms) return '0:00'
    const seconds = Math.floor(ms / 1000)
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Polling for playback state
let pollInterval = null

const startPolling = () => {
    if (pollInterval) return

    // Update every 1 second
    pollInterval = setInterval(async () => {
        if (connected.value) {
            await updateCurrentTrack()
        }
    }, 1000)
}

const stopPolling = () => {
    if (pollInterval) {
        clearInterval(pollInterval)
        pollInterval = null
    }
}

// Progress update for smooth UI (between API polls)
let progressInterval = null

const startProgressUpdate = () => {
    if (progressInterval) return

    progressInterval = setInterval(() => {
        if (isPlaying.value && currentTrack.value.duration) {
            currentProgress.value = Math.min(
                currentProgress.value + 100, // Update every 100ms
                currentTrack.value.duration
            )
        }
    }, 100)
}

const stopProgressUpdate = () => {
    if (progressInterval) {
        clearInterval(progressInterval)
        progressInterval = null
    }
}

// Audio visualizer using Spotify Audio Analysis API
const animateVisualizer = () => {
    if (isPlaying.value && audioAnalysis.value) {
        // Get current playback position in seconds
        const currentTimeSec = currentProgress.value / 1000
        const { segments } = audioAnalysis.value

        if (segments && segments.length > 0) {
            // Each bar represents a time slice of the song
            const duration = currentTrack.value.duration / 1000 // total duration in seconds
            const timePerBar = duration / 40 // time each bar represents

            for (let i = 0; i < 40; i++) {
                // Calculate the time this bar represents
                const barTime = i * timePerBar

                // Find the segment for this time
                const segment = segments.find((seg, idx) => {
                    const nextSeg = segments[idx + 1]
                    return seg.start <= barTime && (!nextSeg || nextSeg.start > barTime)
                })

                if (segment) {
                    // Get loudness from segment (dB, typically -60 to 0)
                    const loudness = segment.loudness_max || -30

                    // Normalize to 0-100 range for bar height
                    const normalized = Math.max(5, Math.min(100, ((loudness + 60) / 60) * 100))

                    // Highlight current position
                    const isCurrentPosition = Math.abs(barTime - currentTimeSec) < timePerBar
                    const boost = isCurrentPosition ? 20 : 0

                    frequencyData.value[i] = normalized + boost
                } else {
                    frequencyData.value[i] = 20
                }
            }
        } else {
            // Fallback animation
            const time = performance.now() * 0.001
            for (let i = 0; i < 40; i++) {
                const wave = Math.sin(time * 3 + i * 0.2) * 30 + 50
                frequencyData.value[i] = wave
            }
        }
    } else if (isPlaying.value) {
        // No analysis data yet - simple animation
        const time = performance.now() * 0.001
        for (let i = 0; i < 40; i++) {
            const wave = Math.sin(time * 3 + i * 0.2) * 30 + 50
            frequencyData.value[i] = wave
        }
    } else {
        // Fade out when paused
        for (let i = 0; i < 40; i++) {
            frequencyData.value[i] = Math.max(10, frequencyData.value[i] * 0.95)
        }
    }

    animationFrameId = requestAnimationFrame(animateVisualizer)
}

const startVisualizer = () => {
    if (!animationFrameId) {
        animateVisualizer()
    }
}

const stopVisualizer = () => {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
    }
}

// Watch for progress updates
watch(currentProgress, () => {
    // Progress updated, visualizer will use it
})

// Sync local state from global store
watch(() => globalStore.currentTrack.value, (newTrack) => {
    if (newTrack.id) {
        currentTrack.value = { ...newTrack }
    }
}, { deep: true })

watch(() => globalStore.isPlaying.value, (val) => {
    isPlaying.value = val
})

watch(() => globalStore.volume.value, (val) => {
    volume.value = val
})

watch(() => globalStore.currentProgress.value, (val) => {
    currentProgress.value = val
})

watch(() => globalStore.shuffle.value, (val) => {
    shuffle.value = val
})

watch(() => globalStore.repeat.value, (val) => {
    repeat.value = val
})

watch(() => globalStore.queue.value, (val) => {
    queue.value = val
}, { deep: true })

watch(() => globalStore.audioAnalysis.value, (val) => {
    audioAnalysis.value = val
})

watch(() => globalStore.audioFeatures.value, (val) => {
    audioFeatures.value = val
})

onMounted(async () => {
    // Sync from global store first (in case already connected from another session)
    if (globalStore.connected.value) {
        connected.value = true
        isPremium.value = globalStore.isPremium.value
        currentTrack.value = { ...globalStore.currentTrack.value }
        isPlaying.value = globalStore.isPlaying.value
        volume.value = globalStore.volume.value
        currentProgress.value = globalStore.currentProgress.value
        shuffle.value = globalStore.shuffle.value
        repeat.value = globalStore.repeat.value
        queue.value = [...globalStore.queue.value]
        audioAnalysis.value = globalStore.audioAnalysis.value
        audioFeatures.value = globalStore.audioFeatures.value
    }

    await initSpotify()
    startProgressUpdate()
    startVisualizer()
})

onUnmounted(() => {
    stopPolling()
    stopProgressUpdate()
    stopVisualizer()

    // DON'T stop global polling - keep music state synced across all pages
    // globalStore.stopPolling() and globalStore.stopProgressUpdate() should keep running
})
</script>

<style scoped>
@import '../styles/music-player.css';
</style>
