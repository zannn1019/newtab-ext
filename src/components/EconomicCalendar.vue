<template>
    <div class="calendar-wrapper">
        <!-- Decorative elements -->
        <div class="corner-accent top-right"></div>
        <div class="vertical-text">イベント</div>

        <!-- Header -->
        <header class="calendar-header">
            <div class="header-top">
                <div class="title-group">
                    <span class="title-accent">━</span>
                    <h2 class="title">CALENDAR</h2>
                </div>
                <button @click="refreshEvents" class="refresh-button" :disabled="isLoading">
                    <span :class="{ rotating: isLoading }">↻</span>
                </button>
            </div>
            <p class="subtitle">経済カレンダー</p>
        </header>

        <!-- Error state -->
        <div v-if="error" class="state-message error">
            <span class="state-icon">!</span>
            <p>{{ error }}</p>
        </div>

        <!-- Loading state -->
        <div v-else-if="isLoading && events.length === 0" class="state-message loading">
            <span class="loading-spinner"></span>
            <p>読み込み中...</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="events.length === 0" class="state-message empty">
            <span class="empty-circle">○</span>
            <p>今日のイベントなし</p>
        </div>

        <!-- Events list -->
        <div v-else class="events-container">
            <div v-for="(event, index) in events" :key="event.id" class="event-card" :class="`impact-${event.impact}`"
                :style="{ animationDelay: `${index * 0.05}s` }">
                <div class="event-indicator"></div>
                <div class="event-time">
                    <span class="time-value">{{ formatEventTime(event.date) }}</span>
                </div>
                <div class="event-details">
                    <h4 class="event-title">{{ event.title }}</h4>
                    <div class="event-meta">
                        <span class="meta-country">{{ event.country }}</span>
                        <span class="meta-dot">•</span>
                        <span class="meta-impact" :class="`impact-${event.impact}`">
                            {{ event.impact }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const events = ref([])
const isLoading = ref(false)
const error = ref('')

const fetchEvents = async () => {
    isLoading.value = true
    error.value = ''

    try {
        // Fallback to creating mock important crypto-related events
        const cryptoEvents = generateCryptoEvents()
        events.value = cryptoEvents.slice(0, 6)
    } catch (err) {
        console.error('Error fetching economic events:', err)
        error.value = 'Failed to load events'
    } finally {
        isLoading.value = false
    }
}

const generateCryptoEvents = () => {
    const today = new Date()
    const events = []

    // Sample events (in production, these would come from an API)
    const sampleEvents = [
        {
            id: 1,
            title: 'US CPI Data Release',
            country: 'US',
            impact: 'high',
            date: new Date(today.setHours(13, 30, 0, 0))
        },
        {
            id: 2,
            title: 'Fed Interest Rate Decision',
            country: 'US',
            impact: 'high',
            date: new Date(today.setHours(19, 0, 0, 0))
        },
        {
            id: 3,
            title: 'Ethereum Network Upgrade',
            country: 'Crypto',
            impact: 'medium',
            date: new Date(today.setHours(12, 0, 0, 0))
        },
        {
            id: 4,
            title: 'BTC Options Expiry',
            country: 'Crypto',
            impact: 'medium',
            date: new Date(today.setHours(8, 0, 0, 0))
        }
    ]

    // Filter to show only upcoming events
    const now = new Date()
    return sampleEvents
        .filter(e => e.date > now)
        .sort((a, b) => a.date - b.date)
}

const refreshEvents = () => {
    fetchEvents()
}

const formatEventTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
}

onMounted(() => {
    fetchEvents()
    // Refresh every 10 minutes
    setInterval(fetchEvents, 10 * 60 * 1000)
})
</script>

<style scoped>
.calendar-wrapper {
    position: relative;
    background: linear-gradient(165deg,
            rgba(255, 255, 255, 0.98) 0%,
            rgba(250, 247, 245, 0.96) 50%,
            rgba(255, 252, 248, 0.95) 100%);
    backdrop-filter: blur(30px);
    border: 1px solid rgba(139, 69, 19, 0.08);
    padding: var(--space-6);
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02),
        0 8px 24px rgba(139, 69, 19, 0.04),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

/* Corner accent - top right */
.corner-accent {
    position: absolute;
    width: 32px;
    height: 32px;
    pointer-events: none;
}

.corner-accent.top-right {
    top: 0;
    right: 0;
}

.corner-accent.top-right::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 32px;
    height: 1px;
    background: linear-gradient(to left, var(--accent), transparent);
    opacity: 0.3;
}

.corner-accent.top-right::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 1px;
    height: 32px;
    background: linear-gradient(to bottom, var(--accent), transparent);
    opacity: 0.3;
}

/* Vertical decoration text */
.vertical-text {
    position: absolute;
    top: 50%;
    right: var(--space-4);
    transform: translateY(-50%);
    writing-mode: vertical-rl;
    text-orientation: upright;
    font-family: var(--font-serif);
    font-size: 0.8rem;
    letter-spacing: 0.4em;
    color: var(--accent);
    opacity: 0.12;
    font-weight: 500;
    pointer-events: none;
}

/* Header */
.calendar-header {
    margin-bottom: var(--space-5);
    padding-bottom: var(--space-4);
    border-bottom: 1px solid rgba(139, 69, 19, 0.08);
}

.header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-2);
}

.title-group {
    display: flex;
    align-items: center;
    gap: var(--space-3);
}

.title-accent {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--accent);
    opacity: 0.6;
    letter-spacing: 0;
}

.title {
    font-family: var(--font-serif);
    font-size: 1.25rem;
    font-weight: 400;
    color: var(--text-primary);
    margin: 0;
    letter-spacing: 0.1em;
    text-transform: uppercase;
}

.subtitle {
    font-family: var(--font-serif);
    font-size: 0.75rem;
    color: var(--text-secondary);
    opacity: 0.6;
    letter-spacing: 0.15em;
    margin: 0;
}

.refresh-button {
    width: 32px;
    height: 32px;
    border: 1px solid rgba(139, 69, 19, 0.12);
    background: transparent;
    color: var(--text-secondary);
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
}

.refresh-button:hover:not(:disabled) {
    background: rgba(139, 69, 19, 0.04);
    border-color: var(--accent);
    color: var(--accent);
    transform: translateY(-2px);
}

.refresh-button:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.rotating {
    display: inline-block;
    animation: smooth-rotate 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes smooth-rotate {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

/* State messages */
.state-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    padding: var(--space-6);
    flex: 1;
}

.state-message.error {
    background: linear-gradient(135deg,
            rgba(239, 68, 68, 0.02),
            rgba(239, 68, 68, 0.04));
    border: 1px solid rgba(239, 68, 68, 0.12);
    color: #dc2626;
    font-family: var(--font-serif);
    font-size: 0.8125rem;
    letter-spacing: 0.05em;
}

.state-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(239, 68, 68, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    font-weight: 600;
}

.loading-spinner {
    width: 32px;
    height: 32px;
    border: 2px solid rgba(139, 69, 19, 0.1);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin-loader 0.8s linear infinite;
}

@keyframes spin-loader {
    to {
        transform: rotate(360deg);
    }
}

.state-message.loading p,
.state-message.empty p {
    color: var(--text-secondary);
    font-size: 0.875rem;
    font-family: var(--font-serif);
    letter-spacing: 0.1em;
    opacity: 0.6;
    margin: 0;
}

.empty-circle {
    font-size: 2.5rem;
    color: var(--accent);
    opacity: 0.15;
    font-weight: 300;
}

/* Events container */
.events-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    overflow-y: auto;
    flex: 1;
    padding-right: var(--space-2);
}

.events-container::-webkit-scrollbar {
    width: 4px;
}

.events-container::-webkit-scrollbar-track {
    background: transparent;
}

.events-container::-webkit-scrollbar-thumb {
    background: rgba(139, 69, 19, 0.15);
    border-radius: 2px;
}

.events-container::-webkit-scrollbar-thumb:hover {
    background: rgba(139, 69, 19, 0.3);
}

/* Event card */
.event-card {
    position: relative;
    display: grid;
    grid-template-columns: 3px 80px 1fr;
    gap: var(--space-4);
    background: rgba(255, 255, 255, 0.6);
    border: 1px solid rgba(139, 69, 19, 0.06);
    padding: var(--space-4);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 0;
    animation: fade-in 0.4s ease-out forwards;
}

@keyframes fade-in {
    from {
        opacity: 0;
        transform: translateY(8px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.event-card:hover {
    background: rgba(255, 255, 255, 0.9);
    border-color: rgba(139, 69, 19, 0.12);
    box-shadow: 0 4px 12px rgba(139, 69, 19, 0.06),
        0 2px 4px rgba(0, 0, 0, 0.02);
    transform: translateX(4px);
}

/* Impact indicator */
.event-indicator {
    width: 3px;
    height: 100%;
    background: rgba(139, 69, 19, 0.2);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.event-card.impact-high .event-indicator {
    background: linear-gradient(to bottom, #ef4444, #dc2626);
}

.event-card.impact-medium .event-indicator {
    background: linear-gradient(to bottom, #f97316, #ea580c);
}

.event-card.impact-low .event-indicator {
    background: linear-gradient(to bottom, #eab308, #ca8a04);
}

.event-card:hover .event-indicator {
    width: 4px;
}

/* Time section */
.event-time {
    display: flex;
    align-items: center;
    justify-content: center;
}

.time-value {
    font-family: var(--font-mono);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-primary);
    opacity: 0.8;
    letter-spacing: 0.05em;
}

/* Event details */
.event-details {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    min-width: 0;
}

.event-title {
    font-family: var(--font-sans);
    font-size: 0.9375rem;
    font-weight: 500;
    color: var(--text-primary);
    margin: 0;
    line-height: 1.5;
    letter-spacing: 0.01em;
}

.event-meta {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-serif);
    font-size: 0.75rem;
}

.meta-country {
    color: var(--text-secondary);
    font-weight: 500;
    opacity: 0.7;
    letter-spacing: 0.05em;
}

.meta-dot {
    color: var(--text-secondary);
    opacity: 0.3;
}

.meta-impact {
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.6875rem;
}

.meta-impact.impact-high {
    color: #ef4444;
}

.meta-impact.impact-medium {
    color: #f97316;
}

.meta-impact.impact-low {
    color: #eab308;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
    .calendar-wrapper {
        padding: var(--space-4);
    }

    .title {
        font-size: 1.15rem;
    }

    .event-card {
        grid-template-columns: 3px 70px 1fr;
        gap: var(--space-3);
    }
}

@media (max-width: 768px) {
    .calendar-wrapper {
        padding: var(--space-4);
    }

    .vertical-text {
        right: var(--space-3);
        font-size: 0.75rem;
    }

    .title {
        font-size: 1.1rem;
    }

    .subtitle {
        font-size: 0.6875rem;
    }

    .event-card {
        padding: var(--space-3);
    }

    .time-value {
        font-size: 0.8125rem;
    }

    .event-title {
        font-size: 0.875rem;
    }

    .event-meta {
        font-size: 0.6875rem;
    }
}

@media (max-width: 640px) {
    .calendar-wrapper {
        padding: var(--space-3);
    }

    .vertical-text {
        display: none;
    }

    .calendar-header {
        margin-bottom: var(--space-4);
        padding-bottom: var(--space-3);
    }

    .refresh-button {
        width: 28px;
        height: 28px;
        font-size: 0.9rem;
    }

    .event-card {
        grid-template-columns: 3px 60px 1fr;
        gap: var(--space-3);
        padding: var(--space-3);
    }

    .empty-circle {
        font-size: 2rem;
    }
}

@media (max-width: 480px) {
    .calendar-wrapper {
        padding: var(--space-2);
    }

    .title {
        font-size: 1rem;
    }

    .subtitle {
        font-size: 0.625rem;
    }

    .event-card {
        grid-template-columns: 3px 1fr;
        gap: var(--space-2);
        padding: var(--space-2);
    }

    .event-time {
        display: none;
    }

    .event-title {
        font-size: 0.8125rem;
    }

    .event-meta {
        font-size: 0.625rem;
    }
}
</style>
