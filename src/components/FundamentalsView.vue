<template>
    <div class="fundamentals-container">
        <!-- Header with Japanese influence -->
        <header class="page-header">
            <div class="header-accent"></div>
            <div class="header-content">
                <h1 class="page-title">FUNDAMENTALS</h1>
                <p class="page-subtitle">基本分析 • Market Intelligence</p>
            </div>
            <div class="header-decoration">
                <span class="deco-circle"></span>
                <span class="deco-line"></span>
            </div>
        </header>

        <section class="sentiment-section">
            <FearGreedIndex />
        </section>
        <!-- Main content grid -->
        <div class="content-grid">
            <!-- Sentiment widget (full width) -->

            <!-- News and Calendar grid -->
            <section class="news-section">
                <CryptoNews />
            </section>

            <section class="calendar-section">
                <EconomicCalendar />
            </section>
        </div>

        <!-- Bottom accent -->
        <div class="bottom-accent"></div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue'
import CryptoNews from './CryptoNews.vue'
import EconomicCalendar from './EconomicCalendar.vue'
import FearGreedIndex from './FearGreedIndex.vue'

onMounted(() => {
    // Optional: Add any initialization logic here
})
</script>

<style scoped>
.fundamentals-container {
    width: 100%;
    height: 100%;
    margin: 0 auto;
    padding: var(--space-8) 150px;
    padding-top: 120px;
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    overflow-y: auto;
    position: relative;
    background: linear-gradient(180deg,
            rgba(252, 250, 248, 0.3) 0%,
            transparent 100%);
    justify-content: center;
    align-items: center;
}

.fundamentals-container::-webkit-scrollbar {
    width: 4px;
}

.fundamentals-container::-webkit-scrollbar-track {
    background: transparent;
}

.fundamentals-container::-webkit-scrollbar-thumb {
    background: rgba(139, 69, 19, 0.15);
    border-radius: 2px;
}

/* Page Header */
.page-header {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding-bottom: var(--space-4);
    border-bottom: 1px solid rgba(139, 69, 19, 0.1);
    position: relative;
    width: 100%;
}

.header-accent {
    width: 3px;
    height: 48px;
    background: linear-gradient(180deg,
            var(--accent) 0%,
            rgba(139, 69, 19, 0.3) 100%);
}

.header-content {
    flex: 1;
}

.page-title {
    font-family: var(--font-serif);
    font-size: 2rem;
    font-weight: 300;
    color: var(--text-primary);
    margin: 0 0 var(--space-1) 0;
    letter-spacing: 0.15em;
    text-transform: uppercase;
}

.page-subtitle {
    font-family: var(--font-serif);
    font-size: 0.8125rem;
    color: var(--text-secondary);
    margin: 0;
    opacity: 0.6;
    letter-spacing: 0.1em;
}

.header-decoration {
    display: flex;
    align-items: center;
    gap: var(--space-2);
}

.deco-circle {
    width: 8px;
    height: 8px;
    border: 1px solid var(--accent);
    border-radius: 50%;
    opacity: 0.4;
}

.deco-line {
    width: 48px;
    height: 1px;
    background: linear-gradient(90deg,
            var(--accent) 0%,
            transparent 100%);
    opacity: 0.3;
}

/* Content Grid */
.content-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-5);
    flex: 1;
    max-width: 1600px;
    gap: var(--space-1);
}

.sentiment-section {
    height: 350px;
    position: fixed;
    z-index: 99;
    right: 0;
    bottom: 0;
    margin: 10px;
}

.news-section,
.calendar-section {
    min-height: 500px;
    max-height: 600px;
}

/* Bottom accent */
.bottom-accent {
    height: 1px;
    background: linear-gradient(90deg,
            transparent 0%,
            rgba(139, 69, 19, 0.1) 20%,
            rgba(139, 69, 19, 0.1) 80%,
            transparent 100%);
    margin-top: auto;
}

/* Responsive */
@media (max-width: 1280px) {
    .fundamentals-container {
        padding: var(--space-6) var(--space-5);
        padding-top: 85px;
        gap: var(--space-5);
    }

    .page-title {
        font-size: 1.75rem;
    }

    .sentiment-section {
        height: 220px;
    }

    .news-section,
    .calendar-section {
        min-height: 450px;
        max-height: 550px;
    }
}

@media (max-width: 1024px) {
    .fundamentals-container {
        padding: var(--space-5) var(--space-4);
        padding-top: 80px;
        gap: var(--space-4);
    }

    .page-title {
        font-size: 1.5rem;
    }

    .page-subtitle {
        font-size: 0.75rem;
    }

    .content-grid {
        grid-template-columns: 1fr;
        gap: var(--space-4);
    }

    .sentiment-section {
        height: 200px;
    }

    .news-section,
    .calendar-section {
        min-height: 400px;
        max-height: 500px;
    }
}

@media (max-width: 768px) {
    .fundamentals-container {
        padding: var(--space-4) var(--space-3);
        padding-top: 75px;
        gap: var(--space-3);
    }

    .header-accent {
        width: 2px;
        height: 40px;
    }

    .page-title {
        font-size: 1.25rem;
    }

    .page-subtitle {
        font-size: 0.6875rem;
    }

    .sentiment-section {
        height: 180px;
    }

    .news-section,
    .calendar-section {
        min-height: 380px;
        max-height: 450px;
    }
}

@media (max-width: 640px) {
    .fundamentals-container {
        padding: var(--space-3) var(--space-2);
        padding-top: 70px;
    }

    .page-header {
        padding-bottom: var(--space-3);
        gap: var(--space-3);
    }

    .page-title {
        font-size: 1.125rem;
        letter-spacing: 0.1em;
    }

    .header-decoration {
        display: none;
    }

    .sentiment-section {
        height: 160px;
    }

    .news-section,
    .calendar-section {
        min-height: 350px;
        max-height: 400px;
    }
}

@media (max-width: 480px) {
    .fundamentals-container {
        padding: var(--space-2);
        padding-top: 65px;
        gap: var(--space-2);
    }

    .page-title {
        font-size: 1rem;
    }

    .page-subtitle {
        font-size: 0.625rem;
    }

    .sentiment-section {
        height: 140px;
    }

    .news-section,
    .calendar-section {
        min-height: 320px;
        max-height: 380px;
    }
}
</style>
