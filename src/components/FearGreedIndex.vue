<template>
    <div class="fear-greed">
        <!-- Japanese decoration -->
        <div class="japanese-decoration">センチメント</div>
        
        <div class="widget-header">
            <div class="header-content">
                <h2>Market Sentiment</h2>
                <span class="subtitle">恐怖と貪欲指数</span>
            </div>
        </div>

        <div v-if="error" class="error-message">
            {{ error }}
        </div>

        <div v-else-if="isLoading" class="loading">
            <div class="loading-text">読み込み中</div>
        </div>

        <div v-else class="index-content">
            <div class="gauge-container">
                <!-- Minimalist gauge with Japanese aesthetic -->
                <div class="gauge-value">
                    <div class="value">{{ indexData.value }}</div>
                    <div class="classification" :style="{ color: indexColor }">
                        {{ indexData.value_classification }}
                    </div>
                </div>
                
                <!-- Horizontal bar indicator -->
                <div class="gauge-bar">
                    <div class="gauge-fill" :style="{ width: indexData.value + '%', background: indexColor }"></div>
                    <div class="gauge-markers">
                        <span>0</span>
                        <span>25</span>
                        <span>50</span>
                        <span>75</span>
                        <span>100</span>
                    </div>
                </div>

                <!-- Labels -->
                <div class="gauge-labels">
                    <span class="label-left">Extreme Fear</span>
                    <span class="label-right">Extreme Greed</span>
                </div>
            </div>

            <div class="index-meta">
                <span class="meta-label">更新</span>
                <span class="meta-divider">・</span>
                <span>{{ formatTime(indexData.timestamp) }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const indexData = ref({
    value: 50,
    value_classification: 'Neutral',
    timestamp: Date.now() / 1000
})
const isLoading = ref(false)
const error = ref('')

const fetchIndex = async () => {
    isLoading.value = true
    error.value = ''

    try {
        // Using Alternative.me API (free, no key required)
        const response = await fetch('https://api.alternative.me/fng/')

        if (!response.ok) throw new Error('Failed to fetch index')

        const data = await response.json()

        if (data.data && data.data[0]) {
            indexData.value = {
                value: parseInt(data.data[0].value),
                value_classification: data.data[0].value_classification,
                timestamp: parseInt(data.data[0].timestamp)
            }
        }
    } catch (err) {
        console.error('Error fetching fear & greed index:', err)
        error.value = 'Failed to load index'
    } finally {
        isLoading.value = false
    }
}

const indexColor = computed(() => {
    const value = indexData.value.value
    if (value <= 25) return '#ef4444' // Extreme Fear - Red
    if (value <= 45) return '#f97316' // Fear - Orange
    if (value <= 55) return '#eab308' // Neutral - Yellow
    if (value <= 75) return '#84cc16' // Greed - Light Green
    return '#22c55e' // Extreme Greed - Green
})

const formatTime = (timestamp) => {
    const now = Date.now() / 1000
    const diff = now - timestamp

    if (diff < 3600) {
        const minutes = Math.floor(diff / 60)
        return `${minutes}m ago`
    } else if (diff < 86400) {
        const hours = Math.floor(diff / 3600)
        return `${hours}h ago`
    } else {
        const days = Math.floor(diff / 86400)
        return `${days}d ago`
    }
}

onMounted(() => {
    fetchIndex()
    // Refresh every 30 minutes
    setInterval(fetchIndex, 30 * 60 * 1000)
})
</script>

<style scoped>
.fear-greed {
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
    margin-bottom: var(--space-6);
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

.index-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-6);
}

.gauge-container {
    width: 100%;
    max-width: 600px;
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
}

.gauge-value {
    text-align: center;
}

.value {
    font-size: 4rem;
    font-weight: 300;
    color: var(--text-primary);
    line-height: 1;
    margin-bottom: var(--space-2);
    font-family: var(--font-serif);
    letter-spacing: -0.02em;
}

.classification {
    font-size: 1rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-family: var(--font-serif);
}

.gauge-bar {
    position: relative;
    width: 100%;
    height: 8px;
    background: rgba(0, 0, 0, 0.06);
    border-radius: 0;
    overflow: hidden;
}

.gauge-fill {
    height: 100%;
    transition: width 1s var(--ease), background 0.5s var(--ease);
    border-radius: 0;
}

.gauge-markers {
    display: flex;
    justify-content: space-between;
    margin-top: var(--space-2);
    font-size: 0.6875rem;
    color: var(--text-secondary);
    opacity: 0.5;
    font-family: var(--font-mono);
}

.gauge-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: var(--text-secondary);
    opacity: 0.6;
    font-family: var(--font-serif);
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

.label-left,
.label-right {
    font-size: 0.6875rem;
}

.index-meta {
    text-align: center;
    font-size: 0.75rem;
    color: var(--text-secondary);
    font-family: var(--font-serif);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
}

.meta-label {
    opacity: 0.5;
    letter-spacing: 0.1em;
}

.meta-divider {
    opacity: 0.3;
}
</style>
