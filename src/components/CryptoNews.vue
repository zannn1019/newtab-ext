<template>
    <div class="crypto-news" ref="containerRef">
        <!-- Animated particles background -->
        <div class="particles">
            <div v-for="i in 15" :key="i" class="particle" :style="{ '--particle-index': i }"></div>
        </div>

        <!-- Glowing border effect -->
        <div class="glow-border"></div>

        <!-- Japanese decoration with animation -->
        <div class="japanese-decoration" ref="japaneseRef">
            <span v-for="(char, i) in 'ニュース'.split('')" :key="i" class="jp-char">{{ char }}</span>
        </div>

        <div class="widget-header" ref="headerRef">
            <div class="header-content">
                <h2 class="title-glitch" data-text="News">News</h2>
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
            <div class="loading-orb"></div>
            <div class="loading-text">読み込み中</div>
        </div>

        <div v-else class="news-list" ref="newsListRef">
            <a 
                v-for="(article, index) in news" 
                :key="article.id" 
                :href="article.url" 
                target="_blank" 
                class="news-item"
                :style="{ '--item-index': index }"
            >
                <div class="news-marker">
                    <div class="marker-pulse"></div>
                </div>
                <div class="news-content">
                    <h3 class="news-title">{{ article.title }}</h3>
                    <div class="news-meta">
                        <span class="news-source">{{ article.source }}</span>
                        <span class="news-divider">・</span>
                        <span class="news-time">{{ formatTime(article.published_on) }}</span>
                    </div>
                </div>
                <div class="news-arrow">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M7 3L15 10L7 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            </a>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import gsap from 'gsap'

const containerRef = ref(null)
const japaneseRef = ref(null)
const headerRef = ref(null)
const newsListRef = ref(null)
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
            
            // Animate news items on load
            nextTick(() => {
                animateNewsItems()
            })
        }
    } catch (err) {
        console.error('Error fetching crypto news:', err)
        error.value = 'Failed to load news. Please try again.'
    } finally {
        isLoading.value = false
    }
}

const animateNewsItems = () => {
    const items = newsListRef.value?.querySelectorAll('.news-item')
    if (items) {
        gsap.fromTo(items,
            {
                opacity: 0,
                x: -30,
                rotationY: -15
            },
            {
                opacity: 1,
                x: 0,
                rotationY: 0,
                duration: 0.6,
                stagger: 0.08,
                ease: 'power3.out'
            }
        )
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
    
    // Animate Japanese characters
    if (japaneseRef.value) {
        const chars = japaneseRef.value.querySelectorAll('.jp-char')
        gsap.fromTo(chars,
            { opacity: 0, y: -20, rotationX: -90 },
            { 
                opacity: 0.3, 
                y: 0, 
                rotationX: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: 'back.out(1.4)'
            }
        )
    }
})
</script>

<style scoped>
.crypto-news {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 250, 252, 0.9) 100%);
    backdrop-filter: blur(20px) saturate(180%);
    border-radius: 16px;
    border: 1px solid rgba(139, 69, 19, 0.1);
    padding: var(--space-6);
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
    box-shadow: 
        0 8px 32px rgba(139, 69, 19, 0.08),
        0 2px 8px rgba(0, 0, 0, 0.04),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.crypto-news:hover {
    box-shadow: 
        0 12px 48px rgba(139, 69, 19, 0.12),
        0 4px 16px rgba(0, 0, 0, 0.06),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
    transform: translateY(-2px);
}

/* Animated particles */
.particles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none;
}

.particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: radial-gradient(circle, rgba(139, 69, 19, 0.4), transparent);
    border-radius: 50%;
    animation: float calc(8s + var(--particle-index) * 1s) infinite ease-in-out;
    opacity: 0;
    left: calc(var(--particle-index) * 7%);
    top: calc(var(--particle-index) * 6%);
}

@keyframes float {
    0%, 100% {
        transform: translate(0, 0) scale(1);
        opacity: 0;
    }
    10% {
        opacity: 0.6;
    }
    50% {
        transform: translate(20px, -30px) scale(1.5);
        opacity: 0.3;
    }
    90% {
        opacity: 0.6;
    }
}

/* Glowing border effect */
.glow-border {
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(
        45deg,
        rgba(139, 69, 19, 0) 0%,
        rgba(139, 69, 19, 0.3) 50%,
        rgba(139, 69, 19, 0) 100%
    );
    border-radius: 16px;
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
    z-index: -1;
}

.crypto-news:hover .glow-border {
    opacity: 1;
    animation: rotate-glow 8s linear infinite;
}

@keyframes rotate-glow {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Japanese decoration */
.japanese-decoration {
    position: absolute;
    top: var(--space-4);
    right: var(--space-4);
    font-family: var(--font-serif);
    font-size: 0.875rem;
    letter-spacing: 0.4em;
    color: var(--accent);
    writing-mode: vertical-rl;
    text-orientation: upright;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.jp-char {
    display: inline-block;
    opacity: 0.3;
    transition: all 0.3s ease;
    text-shadow: 0 0 20px rgba(139, 69, 19, 0.3);
}

.crypto-news:hover .jp-char {
    opacity: 0.6;
    text-shadow: 0 0 30px rgba(139, 69, 19, 0.5);
}

.widget-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-5);
    padding-bottom: var(--space-4);
    border-bottom: 1px solid rgba(139, 69, 19, 0.15);
    position: relative;
}

.widget-header::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    height: 1px;
    width: 0;
    background: linear-gradient(90deg, var(--accent), transparent);
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.crypto-news:hover .widget-header::after {
    width: 100%;
}

.header-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
}

.title-glitch {
    font-family: var(--font-serif);
    font-size: 1.5rem;
    font-weight: 400;
    color: var(--text-primary);
    margin: 0;
    letter-spacing: 0.05em;
    position: relative;
    animation: title-glow 3s ease-in-out infinite;
}

@keyframes title-glow {
    0%, 100% {
        text-shadow: 0 0 20px rgba(139, 69, 19, 0.2);
    }
    50% {
        text-shadow: 0 0 30px rgba(139, 69, 19, 0.4);
    }
}

.subtitle {
    font-family: var(--font-serif);
    font-size: 0.75rem;
    color: var(--text-secondary);
    opacity: 0.6;
    letter-spacing: 0.2em;
    animation: fade-in-up 0.8s ease-out 0.2s both;
}

@keyframes fade-in-up {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 0.6;
        transform: translateY(0);
    }
}

.btn-refresh {
    width: 36px;
    height: 36px;
    border: 2px solid rgba(139, 69, 19, 0.2);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(250, 250, 252, 0.6));
    color: var(--accent);
    font-size: 1.1rem;
    cursor: pointer;
    border-radius: 50%;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(139, 69, 19, 0.1);
}

.btn-refresh:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(139, 69, 19, 0.1), rgba(139, 69, 19, 0.05));
    border-color: var(--accent);
    transform: scale(1.1) rotate(15deg);
    box-shadow: 0 4px 16px rgba(139, 69, 19, 0.2);
}

.btn-refresh:active {
    transform: scale(0.95);
}

.btn-refresh:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.spinning {
    display: inline-block;
    animation: spin 0.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.error-message {
    padding: var(--space-4);
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(239, 68, 68, 0.04));
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    color: #dc2626;
    font-size: 0.8125rem;
    text-align: center;
    font-family: var(--font-serif);
}

/* Loading state */
.loading {
    padding: var(--space-8);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
}

.loading-orb {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, rgba(139, 69, 19, 0.3), rgba(139, 69, 19, 0.1));
    position: relative;
    animation: pulse-orb 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.loading-orb::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    height: 80%;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.6), transparent);
    animation: rotate 3s linear infinite;
}

@keyframes pulse-orb {
    0%, 100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(139, 69, 19, 0.4);
    }
    50% {
        transform: scale(1.05);
        box-shadow: 0 0 0 15px rgba(139, 69, 19, 0);
    }
}

@keyframes rotate {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to { transform: translate(-50%, -50%) rotate(360deg); }
}

.loading-text {
    color: var(--text-secondary);
    font-size: 0.875rem;
    font-family: var(--font-serif);
    letter-spacing: 0.2em;
    opacity: 0.6;
    animation: fade-pulse 2s ease-in-out infinite;
}

@keyframes fade-pulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.8; }
}

/* News list */
.news-list {
    display: flex;
    flex-direction: column;
    gap: 0;
    overflow-y: auto;
    flex: 1;
    padding-right: var(--space-2);
}

.news-list::-webkit-scrollbar {
    width: 6px;
}

.news-list::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.02);
    border-radius: 3px;
}

.news-list::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, rgba(139, 69, 19, 0.3), rgba(139, 69, 19, 0.2));
    border-radius: 3px;
    transition: background 0.3s ease;
}

.news-list::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, rgba(139, 69, 19, 0.5), rgba(139, 69, 19, 0.4));
}

.news-item {
    display: flex;
    align-items: flex-start;
    gap: var(--space-4);
    padding: var(--space-4) var(--space-3);
    text-decoration: none;
    border-bottom: 1px solid rgba(139, 69, 19, 0.08);
    position: relative;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform-style: preserve-3d;
    perspective: 1000px;
}

.news-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 3px;
    height: 100%;
    background: linear-gradient(180deg, var(--accent), rgba(139, 69, 19, 0.3));
    transform: scaleY(0);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.6, 1);
    transform-origin: top;
}

.news-item:hover::before {
    transform: scaleY(1);
}

.news-item:hover {
    padding-left: var(--space-5);
    background: linear-gradient(90deg, rgba(139, 69, 19, 0.03), transparent);
    transform: translateZ(10px);
}

.news-item:last-child {
    border-bottom: none;
}

.news-marker {
    position: relative;
    width: 12px;
    height: 12px;
    margin-top: 6px;
    flex-shrink: 0;
}

.marker-pulse {
    position: absolute;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, var(--accent), rgba(139, 69, 19, 0.3));
    border-radius: 50%;
    animation: pulse-marker 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    animation-delay: calc(var(--item-index) * 0.1s);
}

.marker-pulse::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 50%;
    height: 50%;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 50%;
}

@keyframes pulse-marker {
    0%, 100% {
        transform: scale(1);
        opacity: 0.6;
    }
    50% {
        transform: scale(1.3);
        opacity: 1;
    }
}

.news-content {
    flex: 1;
    min-width: 0;
}

.news-title {
    font-size: 0.9375rem;
    font-weight: 500;
    color: var(--text-primary);
    margin: 0 0 var(--space-2) 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.5;
    letter-spacing: 0.01em;
    transition: color 0.3s ease;
}

.news-item:hover .news-title {
    color: var(--accent);
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
    position: relative;
}

.news-source::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 1px;
    background: var(--accent);
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.news-item:hover .news-source::after {
    width: 100%;
}

.news-divider {
    opacity: 0.3;
}

.news-time {
    opacity: 0.5;
    font-family: var(--font-mono);
}

.news-arrow {
    color: var(--text-secondary);
    opacity: 0;
    margin-top: 4px;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateX(-10px);
}

.news-arrow svg {
    display: block;
}

.news-item:hover .news-arrow {
    opacity: 0.8;
    transform: translateX(0);
    color: var(--accent);
}
</style>
