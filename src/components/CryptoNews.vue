<template>
    <div class="news-wrapper">
        <!-- Decorative corner accent -->
        <div class="corner-accent top-left"></div>
        <div class="corner-accent bottom-right"></div>

        <!-- Vertical text decoration -->
        <div class="vertical-text">
            暗号通貨
        </div>

        <!-- Header -->
        <header class="news-header">
            <div class="header-top">
                <div class="title-group">
                    <span class="title-accent">━</span>
                    <h2 class="title">NEWS</h2>
                </div>
                <button @click="refreshNews" class="refresh-button" :disabled="isLoading">
                    <span :class="{ rotating: isLoading }">↻</span>
                </button>
            </div>
            <p class="subtitle">最新情報</p>
        </header>

        <!-- Error state -->
        <div v-if="error" class="state-message error">
            <span class="state-icon">!</span>
            <p>{{ error }}</p>
        </div>

        <!-- Loading state -->
        <div v-else-if="isLoading && news.length === 0" class="state-message loading">
            <span class="loading-spinner"></span>
            <p>読み込み中...</p>
        </div>

        <!-- News content -->
        <div v-else class="news-content">
            <!-- Featured highlight -->
            <section class="featured-section" v-if="news[0]">
                <div class="section-label">
                    <span class="label-dot"></span>
                    <span class="label-text">FEATURED</span>
                    <span class="label-line"></span>
                </div>

                <a :href="news[0].url" target="_blank" class="featured-card">
                    <div class="card-number">01</div>
                    <h3 class="card-title">{{ news[0].title }}</h3>
                    <div class="card-meta">
                        <span class="meta-badge">{{ news[0].source }}</span>
                        <span class="meta-separator">|</span>
                        <span class="meta-time">{{ formatTime(news[0].published_on) }}</span>
                    </div>
                    <div class="card-indicator">
                        <span class="indicator-line"></span>
                        <span class="indicator-arrow">→</span>
                    </div>
                </a>
            </section>

            <!-- Regular news list -->
            <section class="news-list">
                <a v-for="(item, index) in news.slice(1, 6)" :key="item.id" :href="item.url" target="_blank"
                    class="news-card" :style="{ animationDelay: `${index * 0.05}s` }">
                    <div class="card-left">
                        <span class="card-index">{{ String(index + 2).padStart(2, '0') }}</span>
                        <div class="card-divider"></div>
                    </div>
                    <div class="card-body">
                        <h4 class="card-headline">{{ item.title }}</h4>
                        <div class="card-info">
                            <span class="info-source">{{ item.source }}</span>
                            <span class="info-dot">•</span>
                            <span class="info-time">{{ formatTime(item.published_on) }}</span>
                        </div>
                    </div>
                    <div class="card-right">
                        <span class="card-chevron">›</span>
                    </div>
                </a>
            </section>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const news = ref([])
const isLoading = ref(false)
const error = ref('')

const fetchNews = async () => {
    isLoading.value = true
    error.value = ''

    try {
        const response = await fetch(
            'https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=latest'
        )

        if (!response.ok) throw new Error('Failed to fetch news')

        const data = await response.json()

        if (data.Data) {
            news.value = data.Data.slice(0, 8).map(article => ({
                id: article.id,
                title: article.title,
                url: article.url,
                source: article.source,
                published_on: article.published_on
            }))
        }
    } catch (err) {
        console.error('Error fetching crypto news:', err)
        error.value = 'Failed to load news. Please try again.'
    } finally {
        isLoading.value = false
    }
}

const refreshNews = () => {
    fetchNews()
}

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
    fetchNews()
    setInterval(fetchNews, 5 * 60 * 1000)
})
</script>

<style scoped>
.news-wrapper {
    background: linear-gradient(165deg,
            rgba(255, 255, 255, 0.98) 0%,
            rgba(254, 252, 250, 0.95) 50%,
            rgba(252, 249, 246, 0.98) 100%);
    backdrop-filter: blur(30px);
    border: 1px solid rgba(139, 69, 19, 0.08);
    padding: var(--space-6);
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
    box-shadow:
        0 2px 8px rgba(139, 69, 19, 0.03),
        0 8px 24px rgba(139, 69, 19, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

/* Corner accents */
.corner-accent {
    position: absolute;
    width: 32px;
    height: 32px;
    pointer-events: none;
}

.corner-accent::before,
.corner-accent::after {
    content: '';
    position: absolute;
    background: var(--accent);
    opacity: 0.15;
}

.corner-accent::before {
    width: 100%;
    height: 1px;
}

.corner-accent::after {
    width: 1px;
    height: 100%;
}

.top-left {
    top: 0;
    left: 0;
}

.top-left::before {
    top: 0;
    left: 0;
}

.top-left::after {
    top: 0;
    left: 0;
}

.bottom-right {
    bottom: 0;
    right: 0;
}

.bottom-right::before {
    bottom: 0;
    right: 0;
}

.bottom-right::after {
    bottom: 0;
    right: 0;
}

/* Vertical text decoration */
.vertical-text {
    position: absolute;
    right: var(--space-4);
    top: 50%;
    transform: translateY(-50%);
    writing-mode: vertical-rl;
    font-family: var(--font-serif);
    font-size: 0.75rem;
    letter-spacing: 0.5em;
    color: var(--accent);
    opacity: 0.12;
    font-weight: 300;
    pointer-events: none;
    user-select: none;
    transition: opacity 0.3s ease;
}

.news-wrapper:hover .vertical-text {
    opacity: 0.18;
}

/* Header */
.news-header {
    margin-bottom: var(--space-6);
    position: relative;
    z-index: 1;
}

.header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-2);
}

.title-group {
    display: flex;
    align-items: center;
    gap: var(--space-3);
}

.title-accent {
    color: var(--accent);
    font-size: 0.875rem;
    opacity: 0.6;
}

.title {
    font-family: var(--font-serif);
    font-size: 1.5rem;
    font-weight: 300;
    color: var(--text-primary);
    margin: 0;
    letter-spacing: 0.15em;
    text-transform: uppercase;
}

.subtitle {
    font-family: var(--font-serif);
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin: 0;
    padding-left: calc(var(--space-3) + 0.875rem);
    opacity: 0.6;
    letter-spacing: 0.2em;
}

.refresh-button {
    width: 32px;
    height: 32px;
    border: 1px solid rgba(139, 69, 19, 0.15);
    background: rgba(255, 255, 255, 0.5);
    border-radius: 50%;
    color: var(--accent);
    font-size: 1.125rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.refresh-button:hover:not(:disabled) {
    background: rgba(139, 69, 19, 0.05);
    border-color: var(--accent);
    transform: rotate(90deg);
}

.refresh-button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.rotating {
    display: inline-block;
    animation: smooth-rotate 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
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
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    padding: var(--space-6);
}

.state-message.error {
    background: rgba(239, 68, 68, 0.03);
    border: 1px dashed rgba(239, 68, 68, 0.2);
}

.state-icon {
    width: 32px;
    height: 32px;
    background: #dc2626;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    font-weight: bold;
}

.state-message p {
    margin: 0;
    font-family: var(--font-serif);
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.loading-spinner {
    width: 36px;
    height: 36px;
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
    letter-spacing: 0.3em;
    opacity: 0.6;
}

/* News content */
.news-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    overflow-y: auto;
    padding-right: var(--space-2);
}

.news-content::-webkit-scrollbar {
    width: 3px;
}

.news-content::-webkit-scrollbar-track {
    background: rgba(139, 69, 19, 0.04);
}

.news-content::-webkit-scrollbar-thumb {
    background: rgba(139, 69, 19, 0.15);
    border-radius: 2px;
}

.news-content::-webkit-scrollbar-thumb:hover {
    background: rgba(139, 69, 19, 0.25);
}

/* Featured section */
.featured-section {
    margin-bottom: var(--space-4);
}

.section-label {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-3);
}

.label-dot {
    width: 4px;
    height: 4px;
    background: var(--accent);
    border-radius: 50%;
}

.label-text {
    font-family: var(--font-serif);
    font-size: 0.625rem;
    font-weight: 600;
    color: var(--accent);
    letter-spacing: 0.15em;
    text-transform: uppercase;
}

.label-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg,
            rgba(139, 69, 19, 0.2) 0%,
            transparent 100%);
}

.featured-card {
    display: block;
    padding: var(--space-6);
    background: white;
    border: 1px solid rgba(139, 69, 19, 0.1);
    text-decoration: none;
    position: relative;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
}

.featured-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg,
            var(--accent) 0%,
            transparent 50%);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.featured-card:hover::before {
    transform: scaleX(1);
}

.featured-card:hover {
    background: rgba(255, 255, 255, 0.98);
    border-color: rgba(139, 69, 19, 0.15);
    transform: translateY(-3px);
    box-shadow:
        0 4px 16px rgba(139, 69, 19, 0.08),
        0 8px 32px rgba(139, 69, 19, 0.06);
}

.card-number {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--accent);
    opacity: 0.4;
    margin-bottom: var(--space-2);
    font-weight: 600;
}

.card-title {
    font-family: var(--font-serif);
    font-size: 1.125rem;
    font-weight: 400;
    line-height: 1.6;
    color: var(--text-primary);
    margin: 0 0 var(--space-3) 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.card-meta {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-3);
}

.meta-badge {
    font-size: 0.6875rem;
    font-weight: 600;
    color: var(--accent);
    background: rgba(139, 69, 19, 0.08);
    padding: var(--space-1) var(--space-2);
    border-radius: 2px;
}

.meta-separator {
    color: var(--text-secondary);
    opacity: 0.3;
}

.meta-time {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--text-secondary);
    opacity: 0.6;
}

.card-indicator {
    display: flex;
    align-items: center;
    gap: var(--space-2);
}

.indicator-line {
    flex: 1;
    height: 1px;
    background: rgba(139, 69, 19, 0.1);
    transition: all 0.3s ease;
}

.featured-card:hover .indicator-line {
    background: rgba(139, 69, 19, 0.2);
}

.indicator-arrow {
    font-size: 0.875rem;
    color: var(--accent);
    opacity: 0;
    transform: translateX(-8px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.featured-card:hover .indicator-arrow {
    opacity: 1;
    transform: translateX(0);
}

/* News list */
.news-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

.news-card {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: var(--space-3);
    padding: var(--space-3);
    background: rgba(255, 255, 255, 0.4);
    border: 1px solid rgba(139, 69, 19, 0.06);
    text-decoration: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    animation: slide-up 0.4s ease-out both;
}

@keyframes slide-up {
    from {
        opacity: 0;
        transform: translateY(16px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.news-card:hover {
    background: white;
    border-color: rgba(139, 69, 19, 0.12);
    transform: translateX(4px);
    box-shadow: 0 2px 12px rgba(139, 69, 19, 0.06);
}

.card-left {
    display: flex;
    align-items: center;
    gap: var(--space-2);
}

.card-index {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    font-weight: 600;
    color: var(--accent);
    opacity: 0.3;
    transition: opacity 0.3s ease;
}

.news-card:hover .card-index {
    opacity: 0.7;
}

.card-divider {
    width: 1px;
    height: 20px;
    background: rgba(139, 69, 19, 0.1);
}

.card-body {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    min-width: 0;
}

.card-headline {
    font-family: var(--font-serif);
    font-size: 0.875rem;
    font-weight: 400;
    line-height: 1.5;
    color: var(--text-primary);
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    transition: color 0.3s ease;
}

.news-card:hover .card-headline {
    color: var(--accent);
}

.card-info {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: 0.6875rem;
    color: var(--text-secondary);
}

.info-source {
    font-weight: 500;
    opacity: 0.7;
}

.info-dot {
    opacity: 0.3;
}

.info-time {
    font-family: var(--font-mono);
    opacity: 0.5;
}

.card-right {
    display: flex;
    align-items: center;
}

.card-chevron {
    font-size: 1.25rem;
    color: var(--accent);
    opacity: 0;
    transform: translateX(-4px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.news-card:hover .card-chevron {
    opacity: 0.5;
    transform: translateX(0);
}

/* Responsive */
@media (max-width: 1024px) {
    .news-wrapper {
        padding: var(--space-6);
    }

    .title {
        font-size: 1.375rem;
    }

    .card-title {
        font-size: 1rem;
    }
}

@media (max-width: 768px) {
    .news-wrapper {
        padding: var(--space-4);
    }

    .vertical-text {
        font-size: 0.6875rem;
        right: var(--space-3);
    }

    .title {
        font-size: 1.25rem;
    }

    .news-header {
        margin-bottom: var(--space-4);
    }

    .featured-card {
        padding: var(--space-4);
    }

    .card-title {
        font-size: 0.9375rem;
    }

    .card-headline {
        font-size: 0.8125rem;
    }
}

@media (max-width: 640px) {
    .news-wrapper {
        padding: var(--space-3);
    }

    .corner-accent {
        width: 24px;
        height: 24px;
    }

    .vertical-text {
        display: none;
    }

    .title {
        font-size: 1.125rem;
        letter-spacing: 0.1em;
    }

    .subtitle {
        font-size: 0.6875rem;
    }

    .refresh-button {
        width: 28px;
        height: 28px;
    }

    .news-content {
        gap: var(--space-4);
    }

    .featured-card {
        padding: var(--space-3);
    }

    .card-title {
        font-size: 0.875rem;
    }

    .news-card {
        padding: var(--space-2);
    }

    .card-headline {
        font-size: 0.8125rem;
    }

    .card-chevron {
        display: none;
    }
}

@media (max-width: 480px) {
    .news-wrapper {
        padding: var(--space-2);
    }

    .title {
        font-size: 1rem;
    }

    .title-accent {
        font-size: 0.75rem;
    }

    .card-title {
        font-size: 0.8125rem;
    }

    .card-headline {
        font-size: 0.75rem;
    }

    .card-meta,
    .card-info {
        font-size: 0.625rem;
    }

    .card-divider {
        display: none;
    }
}
</style>
