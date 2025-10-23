<template>
    <div class="economic-calendar">
        <!-- Japanese decoration -->
        <div class="japanese-decoration">カレンダー</div>

        <div class="widget-header">
            <div class="header-content">
                <h2>Calendar</h2>
                <span class="subtitle">経済イベント</span>
            </div>
            <button @click="refreshEvents" class="btn-refresh" :disabled="isLoading">
                <span :class="{ spinning: isLoading }">↻</span>
            </button>
        </div>

        <div v-if="error" class="error-message">
            {{ error }}
        </div>

        <div v-else-if="isLoading && events.length === 0" class="loading">
            <div class="loading-text">読み込み中</div>
        </div>

        <div v-else-if="events.length === 0" class="no-events">
            <div class="empty-icon">○</div>
            <div class="empty-text">今日のイベントなし</div>
        </div>

        <div v-else class="events-list">
            <div v-for="event in events" :key="event.id" class="event-item" :class="`impact-${event.impact}`">
                <div class="event-time">{{ formatEventTime(event.date) }}</div>
                <div class="event-content">
                    <div class="event-title">{{ event.title }}</div>
                    <div class="event-meta">
                        <span class="event-country">{{ event.country }}</span>
                        <span class="event-divider">・</span>
                        <span class="event-impact" :class="`impact-${event.impact}`">
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
.economic-calendar {
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(10px);
    border-radius: 0;
    border: 1px solid rgba(0, 0, 0, 0.06);
    padding: var(--space-6);
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
}

.japanese-decoration {
    position: absolute;
    top: var(--space-3);
    right: var(--space-4);
    font-family: var(--font-serif);
    font-size: 0.75rem;
    letter-spacing: 0.3em;
    color: var(--text-secondary);
    opacity: 0.3;
    writing-mode: vertical-rl;
    text-orientation: upright;
}

.widget-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-5);
    padding-bottom: var(--space-4);
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.header-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
}

.header-content h2 {
    font-family: var(--font-serif);
    font-size: 1.25rem;
    font-weight: 400;
    color: var(--text-primary);
    margin: 0;
    letter-spacing: 0.02em;
}

.subtitle {
    font-family: var(--font-serif);
    font-size: 0.75rem;
    color: var(--text-secondary);
    opacity: 0.6;
    letter-spacing: 0.15em;
}

.btn-refresh {
    width: 28px;
    height: 28px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    background: transparent;
    color: var(--text-secondary);
    font-size: 1rem;
    cursor: pointer;
    border-radius: 0;
    transition: all 0.3s var(--ease);
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-refresh:hover:not(:disabled) {
    background: rgba(139, 69, 19, 0.05);
    border-color: var(--accent);
    color: var(--accent);
}

.btn-refresh:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.spinning {
    display: inline-block;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.error-message {
    padding: var(--space-4);
    background: rgba(239, 68, 68, 0.05);
    border: 1px solid rgba(239, 68, 68, 0.2);
    color: #dc2626;
    font-size: 0.8125rem;
    text-align: center;
    font-family: var(--font-serif);
}

.loading {
    padding: var(--space-6);
    text-align: center;
}

.loading-text {
    color: var(--text-secondary);
    font-size: 0.875rem;
    font-family: var(--font-serif);
    letter-spacing: 0.15em;
    opacity: 0.6;
}

.no-events {
    padding: var(--space-6);
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
}

.empty-icon {
    font-size: 2rem;
    color: var(--text-secondary);
    opacity: 0.2;
}

.empty-text {
    color: var(--text-secondary);
    font-size: 0.875rem;
    font-family: var(--font-serif);
    letter-spacing: 0.15em;
    opacity: 0.5;
}

.events-list {
    display: flex;
    flex-direction: column;
    gap: 0;
    overflow-y: auto;
    flex: 1;
    padding-right: var(--space-2);
}

.events-list::-webkit-scrollbar {
    width: 4px;
}

.events-list::-webkit-scrollbar-track {
    background: transparent;
}

.events-list::-webkit-scrollbar-thumb {
    background: rgba(139, 69, 19, 0.2);
    border-radius: 2px;
}

.events-list::-webkit-scrollbar-thumb:hover {
    background: rgba(139, 69, 19, 0.4);
}

.event-item {
    display: flex;
    gap: var(--space-4);
    padding: var(--space-4) 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
    border-left: 2px solid transparent;
    padding-left: var(--space-3);
    transition: all 0.3s var(--ease);
}

.event-item:last-child {
    border-bottom: none;
}

.event-item.impact-high {
    border-left-color: #ef4444;
}

.event-item.impact-medium {
    border-left-color: #f97316;
}

.event-item.impact-low {
    border-left-color: #eab308;
}

.event-item:hover {
    padding-left: var(--space-4);
    background: rgba(139, 69, 19, 0.02);
}

.event-time {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--text-primary);
    min-width: 50px;
    font-family: var(--font-mono);
    opacity: 0.7;
}

.event-content {
    flex: 1;
    min-width: 0;
}

.event-title {
    font-size: 0.875rem;
    font-weight: 400;
    color: var(--text-primary);
    margin-bottom: var(--space-2);
    line-height: 1.5;
    letter-spacing: 0.01em;
}

.event-meta {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: 0.75rem;
    font-family: var(--font-serif);
}

.event-country {
    color: var(--text-secondary);
    font-weight: 500;
    opacity: 0.7;
}

.event-divider {
    color: var(--text-secondary);
    opacity: 0.3;
}

.event-impact {
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 0.6875rem;
}

.event-impact.impact-high {
    color: #ef4444;
}

.event-impact.impact-medium {
    color: #f97316;
}

.event-impact.impact-low {
    color: #eab308;
}
</style>
