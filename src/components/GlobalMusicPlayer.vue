<template>
    <div v-if="connected && currentTrack.id" class="global-music-player">
        <!-- Left: Track Info -->
        <div class="player-track-info">
            <img v-if="currentTrack.albumArt" :src="currentTrack.albumArt" :alt="currentTrack.album"
                class="track-thumbnail" />
            <div class="track-details">
                <div class="track-name">{{ currentTrack.title }}</div>
                <div class="track-artist">{{ currentTrack.artist }}</div>
            </div>
        </div>

        <!-- Center: Playback Controls -->
        <div class="player-controls-center">
            <div class="control-buttons">
                <button class="control-btn-mini" @click="toggleShuffle" :class="{ active: shuffle }">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
                    </svg>
                </button>

                <button class="control-btn-mini" @click="previousTrack">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="19 20 9 12 19 4 19 20"></polygon>
                        <line x1="5" y1="19" x2="5" y2="5"></line>
                    </svg>
                </button>

                <button class="control-btn-play" @click="togglePlay">
                    <svg v-if="!isPlaying" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16"></rect>
                        <rect x="14" y="4" width="4" height="16"></rect>
                    </svg>
                </button>

                <button class="control-btn-mini" @click="nextTrack">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="5 4 15 12 5 20 5 4"></polygon>
                        <line x1="19" y1="5" x2="19" y2="19"></line>
                    </svg>
                </button>

                <button class="control-btn-mini" @click="toggleRepeat" :class="{ active: repeat !== 'off' }">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="17 1 21 5 17 9"></polyline>
                        <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                        <polyline points="7 23 3 19 7 15"></polyline>
                        <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                    </svg>
                </button>
            </div>

            <!-- Progress Bar -->
            <div class="progress-container">
                <span class="time-current">{{ formatDuration(currentProgress) }}</span>
                <div class="progress-bar-mini" @click="seekTrack">
                    <div class="progress-fill-mini" :style="{ width: progressPercentage + '%' }"></div>
                </div>
                <span class="time-total">{{ formatDuration(currentTrack.duration) }}</span>
            </div>
        </div>

        <!-- Right: Volume & Extra Controls -->
        <div class="player-right-controls">
            <button class="control-btn-mini" @click="navigateToPlayer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
            </button>

            <div class="volume-control-mini">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                </svg>
                <div class="volume-bar-mini" @click="setVolume">
                    <div class="volume-fill-mini" :style="{ width: volume + '%' }"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useMusicStore } from '../composables/useMusicStore'
import { useSpotifyPlayer } from '../composables/useSpotifyPlayer'
import * as SpotifyAPI from '../api/spotifyApi'

const emit = defineEmits(['navigate'])

// Get global music state
const {
    isPlaying,
    shuffle,
    repeat,
    connected,
    isPremium,
    volume,
    currentProgress,
    currentTrack,
    progressPercentage,
    formatDuration
} = useMusicStore()

// Get player SDK
const {
    isPlayerReady,
    getDeviceId,
    setPlayerVolume
} = useSpotifyPlayer()

// Playback controls
const togglePlay = async () => {
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
    }
}

const previousTrack = async () => {
    try {
        await SpotifyAPI.skipToPrevious()
    } catch (error) {
        console.error('Previous track error:', error)
    }
}

const nextTrack = async () => {
    try {
        await SpotifyAPI.skipToNext()
    } catch (error) {
        console.error('Next track error:', error)
    }
}

const toggleShuffle = async () => {
    try {
        const newState = !shuffle.value
        await SpotifyAPI.setShuffle(newState)
        shuffle.value = newState
    } catch (error) {
        console.error('Toggle shuffle error:', error)
    }
}

const toggleRepeat = async () => {
    try {
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
    try {
        const bar = event.currentTarget
        const clickX = event.clientX - bar.getBoundingClientRect().left
        const percentage = clickX / bar.offsetWidth
        const newPosition = Math.floor(currentTrack.value.duration * percentage)

        await SpotifyAPI.seek(newPosition)
        currentProgress.value = newPosition
    } catch (error) {
        console.error('Seek error:', error)
    }
}

const setVolume = async (event) => {
    try {
        const bar = event.currentTarget
        const clickX = event.clientX - bar.getBoundingClientRect().left
        const newVolume = Math.max(0, Math.min(100, Math.round((clickX / bar.offsetWidth) * 100)))

        if (isPremium.value && isPlayerReady.value) {
            await setPlayerVolume(newVolume / 100)
        } else {
            await SpotifyAPI.setVolume(newVolume, getDeviceId())
        }
        volume.value = newVolume
    } catch (error) {
        console.error('Set volume error:', error)
    }
}

const navigateToPlayer = () => {
    emit('navigate', 'music')
}
</script>

<style scoped>
.global-music-player {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 80px;
    background: linear-gradient(135deg, #fef7f0 0%, #fff5eb 100%);
    border-top: 1px solid rgba(139, 69, 19, 0.1);
    box-shadow: 0 -4px 16px rgba(139, 69, 19, 0.08);
    backdrop-filter: blur(20px);
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    align-items: center;
    padding: 0 20px;
    gap: 20px;
    z-index: 1000;
}

/* Left: Track Info */
.player-track-info {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
}

.track-thumbnail {
    width: 56px;
    height: 56px;
    border-radius: 4px;
    object-fit: cover;
    box-shadow: 0 2px 8px rgba(139, 69, 19, 0.15);
}

.track-details {
    min-width: 0;
    flex: 1;
}

.track-name {
    font-size: 14px;
    font-weight: 600;
    color: #8b4513;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.track-artist {
    font-size: 12px;
    color: rgba(139, 69, 19, 0.7);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Center: Controls */
.player-controls-center {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-width: 600px;
    margin: 0 auto;
}

.control-buttons {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
}

.control-btn-mini {
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    color: rgba(139, 69, 19, 0.7);
    cursor: pointer;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.control-btn-mini:hover {
    color: #8b4513;
    background: rgba(139, 69, 19, 0.1);
}

.control-btn-mini.active {
    color: #8b4513;
}

.control-btn-play {
    width: 36px;
    height: 36px;
    border: none;
    background: #8b4513;
    color: white;
    cursor: pointer;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.control-btn-play:hover {
    background: #6d3710;
    transform: scale(1.05);
}

.progress-container {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
}

.time-current,
.time-total {
    font-size: 11px;
    color: rgba(139, 69, 19, 0.6);
    min-width: 40px;
}

.progress-bar-mini {
    flex: 1;
    height: 4px;
    background: rgba(139, 69, 19, 0.15);
    border-radius: 2px;
    cursor: pointer;
    position: relative;
}

.progress-fill-mini {
    height: 100%;
    background: #8b4513;
    border-radius: 2px;
    transition: width 0.1s linear;
}

/* Right: Volume */
.player-right-controls {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
}

.volume-control-mini {
    display: flex;
    align-items: center;
    gap: 8px;
}

.volume-bar-mini {
    width: 80px;
    height: 4px;
    background: rgba(139, 69, 19, 0.15);
    border-radius: 2px;
    cursor: pointer;
    position: relative;
}

.volume-fill-mini {
    height: 100%;
    background: #8b4513;
    border-radius: 2px;
}
</style>
