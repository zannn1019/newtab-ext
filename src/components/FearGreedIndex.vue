<template>
    <div class="sentiment-wrapper">
        <!-- Decorative elements -->
        <div class="corner-accent top-left"></div>
        <div class="corner-accent bottom-right"></div>
        <div class="vertical-text">市場心理</div>

        <!-- Header -->
        <header class="sentiment-header">
            <div class="title-group">
                <span class="title-accent">━</span>
                <h2 class="title">SENTIMENT</h2>
            </div>
            <p class="subtitle">恐怖と貪欲指数</p>
        </header>

        <!-- Error state -->
        <div v-if="error" class="state-message error">
            <span class="state-icon">!</span>
            <p>{{ error }}</p>
        </div>

        <!-- Loading state -->
        <div v-else-if="isLoading" class="state-message loading">
            <span class="loading-spinner"></span>
            <p>読み込み中...</p>
        </div>

        <!-- Sentiment content -->
        <div v-else class="sentiment-content">
            <div class="gauge-section">
                <!-- Value display -->
                <div class="value-display">
                    <div class="value-number" :style="{ color: indexColor }">
                        {{ indexData.value }}
                    </div>
                    <div class="value-label" :style="{ color: indexColor }">
                        {{ indexData.value_classification }}
                    </div>
                </div>

                <!-- Bar gauge -->
                <div class="bar-container">
                    <div class="bar-track">
                        <div class="bar-fill" :style="{
                            width: indexData.value + '%',
                            background: indexColor
                        }">
                            <span class="bar-indicator"></span>
                        </div>
                    </div>
                    <div class="bar-markers">
                        <span class="marker">0</span>
                        <span class="marker">25</span>
                        <span class="marker">50</span>
                        <span class="marker">75</span>
                        <span class="marker">100</span>
                    </div>
                </div>

                <!-- Range labels -->
                <div class="range-labels">
                    <span class="label-start">EXTREME FEAR</span>
                    <span class="label-center">NEUTRAL</span>
                    <span class="label-end">EXTREME GREED</span>
                </div>
            </div>

            <!-- Metadata -->
            <div class="sentiment-meta">
                <span class="meta-dot">●</span>
                <span class="meta-text">更新 {{ formatTime(indexData.timestamp) }}</span>
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
.sentiment-wrapper {
    position: relative;
    background: linear-gradient(165deg,
            rgba(255, 255, 255, 0.98) 0%,
            rgba(250, 247, 245, 0.96) 50%,
            rgba(255, 252, 248, 0.95) 100%);
    backdrop-filter: blur(30px);
    border: 1px solid rgba(139, 69, 19, 0.08);
    padding: var(--space-4);
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02),
        0 8px 24px rgba(139, 69, 19, 0.04),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

/* Corner accents */
.corner-accent {
    position: absolute;
    width: 32px;
    height: 32px;
    pointer-events: none;
}

.corner-accent.top-left {
    top: 0;
    left: 0;
}

.corner-accent.top-left::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 32px;
    height: 1px;
    background: linear-gradient(to right, var(--accent), transparent);
    opacity: 0.3;
}

.corner-accent.top-left::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 1px;
    height: 32px;
    background: linear-gradient(to bottom, var(--accent), transparent);
    opacity: 0.3;
}

.corner-accent.bottom-right {
    bottom: 0;
    right: 0;
}

.corner-accent.bottom-right::before {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 32px;
    height: 1px;
    background: linear-gradient(to left, var(--accent), transparent);
    opacity: 0.3;
}

.corner-accent.bottom-right::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 1px;
    height: 32px;
    background: linear-gradient(to top, var(--accent), transparent);
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
.sentiment-header {
    margin-bottom: var(--space-5);
    padding-bottom: var(--space-4);
    border-bottom: 1px solid rgba(139, 69, 19, 0.08);
}

.title-group {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-2);
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

.state-message.loading p {
    color: var(--text-secondary);
    font-size: 0.875rem;
    font-family: var(--font-serif);
    letter-spacing: 0.1em;
    opacity: 0.6;
    margin: 0;
}

/* Sentiment content */
.sentiment-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--space-4);
}

.gauge-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
}

/* Value display */
.value-display {
    text-align: center;
}

.value-number {
    font-size: 4rem;
    font-weight: 300;
    line-height: 1;
    margin-bottom: var(--space-2);
    font-family: var(--font-serif);
    letter-spacing: -0.02em;
    transition: color 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.value-label {
    font-size: 1rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-family: var(--font-serif);
    transition: color 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Bar container */
.bar-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

.bar-track {
    position: relative;
    width: 100%;
    height: 6px;
    background: rgba(139, 69, 19, 0.08);
    overflow: visible;
}

.bar-fill {
    height: 100%;
    position: relative;
    transition: width 1s cubic-bezier(0.4, 0, 0.2, 1),
        background 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.bar-indicator {
    position: absolute;
    right: -6px;
    top: 50%;
    transform: translateY(-50%);
    width: 12px;
    height: 12px;
    background: currentColor;
    border: 2px solid rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.bar-markers {
    display: flex;
    justify-content: space-between;
    padding: 0 2px;
}

.marker {
    font-size: 0.6875rem;
    color: var(--text-secondary);
    opacity: 0.4;
    font-family: var(--font-mono);
}

/* Range labels */
.range-labels {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: var(--space-4);
    font-size: 0.6875rem;
    color: var(--text-secondary);
    opacity: 0.6;
    font-family: var(--font-serif);
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.label-start {
    text-align: left;
}

.label-center {
    text-align: center;
}

.label-end {
    text-align: right;
}

/* Metadata */
.sentiment-meta {
    text-align: center;
    font-size: 0.75rem;
    color: var(--text-secondary);
    font-family: var(--font-serif);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    opacity: 0.6;
    margin-top: auto;
    padding-top: var(--space-4);
}

.meta-dot {
    font-size: 0.5rem;
    color: var(--accent);
}

.meta-text {
    letter-spacing: 0.08em;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
    .sentiment-wrapper {
        padding: var(--space-4);
    }

    .value-number {
        font-size: 3.5rem;
    }

    .value-label {
        font-size: 0.9375rem;
    }
}

@media (max-width: 768px) {
    .sentiment-wrapper {
        padding: var(--space-4);
    }

    .value-number {
        font-size: 3rem;
    }

    .value-label {
        font-size: 0.875rem;
    }

    .title {
        font-size: 1.1rem;
    }
}

@media (max-width: 640px) {
    .sentiment-wrapper {
        padding: var(--space-3);
    }

    .vertical-text {
        display: none;
    }

    .value-number {
        font-size: 2.5rem;
    }

    .value-label {
        font-size: 0.8125rem;
    }

    .range-labels {
        font-size: 0.625rem;
    }
}

@media (max-width: 480px) {
    .sentiment-wrapper {
        padding: var(--space-2);
    }

    .value-number {
        font-size: 2rem;
    }

    .value-label {
        font-size: 0.75rem;
    }

    .title {
        font-size: 1rem;
    }

    .subtitle {
        font-size: 0.625rem;
    }

    .range-labels {
        font-size: 0.5625rem;
        gap: var(--space-2);
    }
}
</style>
