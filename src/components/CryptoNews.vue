<template>
    <div class="crypto-news">
        <!-- Japanese decoration -->
        <div class="japanese-decoration">ニュース</div>

        <div class="widget-header">
            <div class="header-content">
                <h2>News</h2>
                <span class="subtitle">暗号通貨</span>
            </div>
            <button @click="refreshNews" class="btn-refresh" :disabled="isLoading">
                <span :class="{ spinning: isLoading }">↻</span>
            </button>
        </div>

        <div v-if="error" class="error-message">
            {{ error }}
        </div>

        <div v-else-if="isLoading && news.length === 0" class="loading">
            <div class="loading-text">読み込み中</div>
        </div>

        <div v-else class="news-list">
            <a v-for="article in news" :key="article.id" :href="article.url" target="_blank" class="news-item">
                <div class="news-marker">●</div>
                <div class="news-content">
                    <h3 class="news-title">{{ article.title }}</h3>
                    <div class="news-meta">
                        <span class="news-source">{{ article.source }}</span>
                        <span class="news-divider">・</span>
                        <span class="news-time">{{ formatTime(article.published_on) }}</span>
                    </div>
                </div>
                <div class="news-arrow">→</div>
            </a>
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
        // Using CryptoCompare API (free, no key required for news)
        const response = await fetch(
            'https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=latest'
        )

        if (!response.ok) throw new Error('Failed to fetch news')

        const data = await response.json()

        if (data.Data) {
            // Get top 8 articles
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
    // Refresh every 5 minutes
    setInterval(fetchNews, 5 * 60 * 1000)
})
</script>

<style scoped>
.crypto-news {
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

.news-list {
    display: flex;
    flex-direction: column;
    gap: 0;
    overflow-y: auto;
    flex: 1;
    padding-right: var(--space-2);
}

.news-list::-webkit-scrollbar {
    width: 4px;
}

.news-list::-webkit-scrollbar-track {
    background: transparent;
}

.news-list::-webkit-scrollbar-thumb {
    background: rgba(139, 69, 19, 0.2);
    border-radius: 2px;
}

.news-list::-webkit-scrollbar-thumb:hover {
    background: rgba(139, 69, 19, 0.4);
}

.news-item {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    padding: var(--space-4) 0;
    text-decoration: none;
    transition: all 0.3s var(--ease);
    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.news-item:last-child {
    border-bottom: none;
}

.news-item:hover {
    padding-left: var(--space-2);
}

.news-item:hover .news-marker {
    color: var(--accent);
    transform: scale(1.2);
}

.news-marker {
    color: var(--text-secondary);
    opacity: 0.3;
    font-size: 0.5rem;
    margin-top: 6px;
    transition: all 0.3s var(--ease);
}

.news-content {
    flex: 1;
    min-width: 0;
}

.news-title {
    font-size: 0.875rem;
    font-weight: 400;
    color: var(--text-primary);
    margin: 0 0 var(--space-2) 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.5;
    letter-spacing: 0.01em;
}

.news-meta {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: 0.75rem;
    color: var(--text-secondary);
    font-family: var(--font-serif);
}

.news-source {
    font-weight: 500;
    opacity: 0.7;
}

.news-divider {
    opacity: 0.3;
}

.news-time {
    opacity: 0.5;
}

.news-arrow {
    color: var(--text-secondary);
    opacity: 0;
    font-size: 1rem;
    margin-top: 4px;
    transition: all 0.3s var(--ease);
}

.news-item:hover .news-arrow {
    opacity: 0.5;
    transform: translateX(4px);
}
</style>
