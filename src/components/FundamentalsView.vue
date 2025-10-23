<template>
    <div class="fundamentals-view">
        <!-- Japanese decoration -->
        <div class="japanese-label">基本分析</div>

        <div class="fundamentals-container">
            <!-- Top section: Fear & Greed Index (full width) -->
            <div class="top-section" data-stagger>
                <FearGreedIndex />
            </div>

            <!-- Bottom section: News and Calendar side by side -->
            <div class="bottom-section">
                <div class="widget-column" data-stagger>
                    <CryptoNews />
                </div>
                <div class="widget-column" data-stagger>
                    <EconomicCalendar />
                </div>
            </div>
        </div>
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
.fundamentals-view {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: var(--space-8);
    position: relative;
    overflow: hidden;
}

.japanese-label {
    position: absolute;
    top: var(--space-6);
    right: var(--space-8);
    font-family: var(--font-serif);
    font-size: 0.875rem;
    letter-spacing: 0.3em;
    color: var(--text-secondary);
    opacity: 0.5;
    z-index: 1;
}

.fundamentals-container {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    height: 100%;
    overflow-y: auto;
    padding-right: var(--space-2);
}

.fundamentals-container::-webkit-scrollbar {
    width: 8px;
}

.fundamentals-container::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
}

.fundamentals-container::-webkit-scrollbar-thumb {
    background: rgba(139, 69, 19, 0.3);
    border-radius: 4px;
}

.fundamentals-container::-webkit-scrollbar-thumb:hover {
    background: rgba(139, 69, 19, 0.5);
}

.top-section {
    width: 100%;
    height: 300px;
    min-height: 300px;
}

.bottom-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-5);
    flex: 1;
    min-height: 500px;
}

.widget-column {
    display: flex;
    flex-direction: column;
    min-height: 0;
}

/* Responsive design */
@media (max-width: 1024px) {
    .fundamentals-view {
        padding: var(--space-6);
    }

    .bottom-section {
        grid-template-columns: 1fr;
    }

    .top-section {
        height: 250px;
        min-height: 250px;
    }
}

@media (max-width: 768px) {
    .fundamentals-view {
        padding: var(--space-4);
    }

    .japanese-label {
        top: var(--space-4);
        right: var(--space-4);
        font-size: 0.75rem;
    }

    .top-section {
        height: 200px;
        min-height: 200px;
    }

    .bottom-section {
        gap: var(--space-4);
    }
}
</style>
