<template>
    <div class="market-view">
        <!-- Japanese decoration -->
        <div class="japanese-label">市場</div>

        <div class="market-container">
            <!-- Header -->
            <div class="market-header" ref="headerRef">
                <h2 class="market-title">Market Overview</h2>
                <p class="market-subtitle">リアルタイム市場データ</p>
            </div>

            <!-- Loading State -->
            <div v-if="isLoading" class="loading-state" ref="loadingRef">
                <div class="loading-spinner"></div>
                <p class="loading-text">Fetching live data...</p>
            </div>

            <!-- Ticker List -->
            <div v-else class="ticker-list" ref="tickerListRef">
                <div v-for="(ticker, index) in tickers" :key="ticker.id" class="ticker-row"
                    :style="{ '--ticker-index': index }">
                    <!-- Icon + Symbol -->
                    <div class="ticker-symbol">
                        <span class="ticker-icon">{{ ticker.icon }}</span>
                        <div class="symbol-info">
                            <span class="symbol-text">{{ ticker.symbol }}</span>
                            <span class="symbol-name">{{ ticker.name }}</span>
                        </div>
                    </div>

                    <!-- Price with live animation -->
                    <div class="ticker-price" :ref="el => setPriceRef(ticker.id, el)">
                        <div class="price-container">
                            <span class="price-value" :data-ticker-id="ticker.id">
                                ${{ formatPrice(ticker.price) }}
                            </span>
                        </div>
                    </div>

                    <!-- Change Percentage -->
                    <div class="ticker-change" :class="{
                        'positive': ticker.change24h >= 0,
                        'negative': ticker.change24h < 0
                    }">
                        <span class="change-arrow">{{ ticker.change24h >= 0 ? '↗' : '↘' }}</span>
                        <span class="change-value">{{ Math.abs(ticker.change24h).toFixed(2) }}%</span>
                    </div>

                    <!-- Remove button -->
                    <button class="remove-ticker" @click="removeTicker(ticker.id)" title="Remove ticker">
                        ×
                    </button>
                </div>

                <!-- Add Ticker Button -->
                <button class="add-ticker-btn" @click="showAddModal = true">
                    <span class="add-icon">+</span>
                    <span class="add-text">Add Coin</span>
                </button>
            </div>

            <!-- Last Update Time -->
            <div v-if="!isLoading" class="update-time" ref="updateTimeRef">
                <span class="update-text">Last updated: {{ lastUpdateTime }}</span>
            </div>
        </div>

        <!-- Add Coin Modal -->
        <div v-if="showAddModal" class="modal-overlay" @click="showAddModal = false">
            <div class="modal-content" @click.stop>
                <h3 class="modal-title">Add Cryptocurrency</h3>
                <p class="modal-subtitle">コインを追加</p>

                <div class="popular-coins">
                    <h4 class="section-title">Popular Coins</h4>
                    <div class="coin-grid">
                        <button v-for="coin in POPULAR_COINS.filter(c => !tickers.some(t => t.id === c.id))"
                            :key="coin.id" class="coin-option" @click="addTicker(coin)">
                            <span class="coin-icon-large">{{ coin.icon }}</span>
                            <span class="coin-name">{{ coin.name }}</span>
                            <span class="coin-symbol">{{ coin.symbol }}</span>
                        </button>
                    </div>
                </div>

                <button class="close-modal" @click="showAddModal = false">Close</button>
            </div>
        </div>

        <!-- Ambient vertical lines -->
        <div class="market-grid">
            <div class="grid-line" v-for="i in 12" :key="`line-${i}`"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import gsap from 'gsap'

const isLoading = ref(true)
const tickers = ref([])
const lastUpdateTime = ref('')
const showAddModal = ref(false)
const headerRef = ref(null)
const loadingRef = ref(null)
const tickerListRef = ref(null)
const updateTimeRef = ref(null)
const priceRefs = ref({})

// Default tickers configuration (can be moved to localStorage later)
const DEFAULT_TICKERS = [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', icon: '₿' },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', icon: 'Ξ' },
    { id: 'solana', symbol: 'SOL', name: 'Solana', icon: '◎' },
    { id: 'cardano', symbol: 'ADA', name: 'Cardano', icon: '₳' }
]

// Popular coins that users can add
const POPULAR_COINS = [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', icon: '₿' },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', icon: 'Ξ' },
    { id: 'solana', symbol: 'SOL', name: 'Solana', icon: '◎' },
    { id: 'cardano', symbol: 'ADA', name: 'Cardano', icon: '₳' },
    { id: 'ripple', symbol: 'XRP', name: 'Ripple', icon: '✕' },
    { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', icon: '●' },
    { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', icon: 'Ð' },
    { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche', icon: '▲' },
    { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', icon: '⬡' },
    { id: 'polygon', symbol: 'MATIC', name: 'Polygon', icon: '⬢' },
    { id: 'uniswap', symbol: 'UNI', name: 'Uniswap', icon: '🦄' },
    { id: 'litecoin', symbol: 'LTC', name: 'Litecoin', icon: 'Ł' },
    { id: 'stellar', symbol: 'XLM', name: 'Stellar', icon: '*' },
    { id: 'monero', symbol: 'XMR', name: 'Monero', icon: 'ɱ' },
    { id: 'tron', symbol: 'TRX', name: 'Tron', icon: '◬' },
    { id: 'cosmos', symbol: 'ATOM', name: 'Cosmos', icon: '⚛' }
]

const setPriceRef = (tickerId, el) => {
    if (el) {
        priceRefs.value[tickerId] = el
    }
}

const formatPrice = (price) => {
    if (price >= 1000) {
        return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    } else if (price >= 1) {
        return price.toFixed(2)
    } else {
        return price.toFixed(4)
    }
}

const fetchMarketData = async () => {
    console.log('🚀 MarketView: fetchMarketData called')
    try {
        // Get tickers from localStorage or use defaults
        const savedTickers = localStorage.getItem('kinesis-market-tickers')
        const tickerConfig = savedTickers ? JSON.parse(savedTickers) : DEFAULT_TICKERS

        console.log('📊 MarketView: Ticker config:', tickerConfig)

        const ids = tickerConfig.map(t => t.id).join(',')
        console.log('🔗 MarketView: Fetching IDs:', ids)

        const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
        )
        const data = await response.json()

        console.log('💰 MarketView: API Response:', data)

        // Update tickers with live data
        tickers.value = tickerConfig.map(ticker => ({
            ...ticker,
            price: data[ticker.id]?.usd || 0,
            change24h: data[ticker.id]?.usd_24h_change || 0
        }))

        console.log('✅ MarketView: Tickers updated:', tickers.value)

        // Update timestamp
        const now = new Date()
        lastUpdateTime.value = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })

        isLoading.value = false
        console.log('✅ MarketView: Loading complete')
    } catch (error) {
        console.error('❌ MarketView: Failed to fetch market data:', error)
        isLoading.value = false
    }
}

// Add a new ticker
const addTicker = async (coin) => {
    // Check if already added
    if (tickers.value.some(t => t.id === coin.id)) {
        showAddModal.value = false
        return
    }

    // Add to tickers
    tickers.value.push({
        ...coin,
        price: 0,
        change24h: 0
    })

    // Save to localStorage
    const tickerConfig = tickers.value.map(t => ({
        id: t.id,
        symbol: t.symbol,
        name: t.name,
        icon: t.icon
    }))
    localStorage.setItem('kinesis-market-tickers', JSON.stringify(tickerConfig))

    // Fetch data for new ticker
    try {
        const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${coin.id}&vs_currencies=usd&include_24hr_change=true`
        )
        const data = await response.json()

        // Update the ticker
        const ticker = tickers.value.find(t => t.id === coin.id)
        if (ticker) {
            ticker.price = data[coin.id]?.usd || 0
            ticker.change24h = data[coin.id]?.usd_24h_change || 0
        }

        // // Animate new row in - DISABLED FOR DEBUGGING
        // await nextTick()
        // const newRow = document.querySelector(`.ticker-row[style*="--ticker-index: ${tickers.value.length - 1}"]`)
        // if (newRow) {
        //     gsap.from(newRow, {
        //         opacity: 0,
        //         x: -30,
        //         duration: 0.5,
        //         ease: 'power3.out'
        //     })
        // }
    } catch (error) {
        console.error('Failed to fetch data for new ticker:', error)
    }

    showAddModal.value = false
}

// Remove a ticker
const removeTicker = (tickerId) => {
    tickers.value = tickers.value.filter(t => t.id !== tickerId)

    // Save to localStorage
    const tickerConfig = tickers.value.map(t => ({
        id: t.id,
        symbol: t.symbol,
        name: t.name,
        icon: t.icon
    }))
    localStorage.setItem('kinesis-market-tickers', JSON.stringify(tickerConfig))
}

// Live price "tick" animation - DISABLED FOR DEBUGGING
const animatePriceChange = (tickerId, oldPrice, newPrice) => {
    const priceElement = priceRefs.value[tickerId]
    if (!priceElement) return

    const priceValue = priceElement.querySelector('.price-value')
    if (!priceValue) return

    // Just update the price directly without animation
    priceValue.textContent = `$${formatPrice(newPrice)}`

    // const tl = gsap.timeline()

    // // Animate old price out
    // tl.to(priceValue, {
    //     opacity: 0,
    //     y: -10,
    //     duration: 0.3,
    //     ease: 'power2.in'
    // })

    // // Update the text content
    // tl.call(() => {
    //     priceValue.textContent = `$${formatPrice(newPrice)}`
    // })

    // // Animate new price in
    // tl.from(priceValue, {
    //     opacity: 0,
    //     y: 10,
    //     duration: 0.4,
    //     ease: 'power2.out'
    // })

    // // Add subtle flash effect
    // tl.to(priceValue, {
    //     scale: 1.05,
    //     duration: 0.2,
    //     ease: 'power2.out',
    //     yoyo: true,
    //     repeat: 1
    // }, '-=0.2')
}

// Refresh market data periodically
const refreshMarketData = async () => {
    try {
        const ids = tickers.value.map(t => t.id).join(',')
        if (!ids) return

        const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
        )
        const data = await response.json()

        // Update each ticker with animation
        tickers.value.forEach((ticker, index) => {
            const newPrice = data[ticker.id]?.usd || 0
            const oldPrice = ticker.price

            if (newPrice !== oldPrice) {
                // Animate price change
                setTimeout(() => {
                    animatePriceChange(ticker.id, oldPrice, newPrice)
                }, index * 100) // Stagger updates
            }

            // Update data
            ticker.price = newPrice
            ticker.change24h = data[ticker.id]?.usd_24h_change || 0
        })

        // Update timestamp with subtle animation
        const now = new Date()
        const newTime = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })

        // Just update directly without animation
        lastUpdateTime.value = newTime

        // gsap.to(updateTimeRef.value, {
        //     opacity: 0.5,
        //     duration: 0.2,
        //     yoyo: true,
        //     repeat: 1,
        //     onComplete: () => {
        //         lastUpdateTime.value = newTime
        //     }
        // })
    } catch (error) {
        console.error('Failed to refresh market data:', error)
    }
}

let refreshInterval
onMounted(async () => {
    console.log('🎬 MarketView: onMounted called')

    // ANIMATIONS DISABLED FOR DEBUGGING
    // // Initial entrance animation for header
    // gsap.from(headerRef.value, {
    //     opacity: 0,
    //     y: -30,
    //     duration: 0.8,
    //     ease: 'power3.out',
    //     delay: 0.2
    // })

    // // Animate loading state
    // gsap.from(loadingRef.value, {
    //     opacity: 0,
    //     scale: 0.9,
    //     duration: 0.6,
    //     ease: 'back.out(1.7)',
    //     delay: 0.5
    // })

    // Fetch initial data
    await fetchMarketData()

    // Wait for next tick to ensure DOM is updated
    await nextTick()

    // // Animate ticker rows in with stagger
    // if (tickerListRef.value) {
    //     gsap.from('.ticker-row', {
    //         opacity: 0,
    //         x: -30,
    //         duration: 0.4,
    //         stagger: 0.1,
    //         ease: 'power3.out',
    //         delay: 0.3
    //     })

    //     // Animate update time
    //     gsap.from(updateTimeRef.value, {
    //         opacity: 0,
    //         y: 10,
    //         duration: 0.5,
    //         ease: 'power2.out',
    //         delay: 0.8
    //     })
    // }

    // // Animate grid lines
    // gsap.from('.grid-line', {
    //     scaleY: 0,
    //     opacity: 0,
    //     stagger: 0.03,
    //     duration: 0.8,
    //     ease: 'power2.out',
    //     delay: 0.4
    // })

    // Set up auto-refresh every 30 seconds
    refreshInterval = setInterval(refreshMarketData, 30000)
})

onUnmounted(() => {
    if (refreshInterval) {
        clearInterval(refreshInterval)
    }
})
</script>

<style scoped>
.market-view {
    width: 100%;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    background: var(--bg-primary);
    padding-top: 120px;
}

.japanese-label {
    position: absolute;
    top: calc(120px + var(--space-8));
    left: var(--space-8);
    font-family: var(--font-japanese);
    font-size: 0.875rem;
    font-weight: 200;
    letter-spacing: 0.3em;
    color: var(--text-muted);
    z-index: 1;
}

.market-container {
    max-width: 800px;
    width: 90%;
    z-index: 2;
    position: relative;
}

.market-header {
    text-align: center;
    margin-bottom: var(--space-12);
}

.market-title {
    font-size: 2.5rem;
    font-weight: 100;
    letter-spacing: 0.05em;
    color: var(--text-primary);
    margin-bottom: var(--space-2);
}

.market-subtitle {
    font-family: var(--font-japanese);
    font-size: 0.875rem;
    font-weight: 200;
    letter-spacing: 0.2em;
    color: var(--text-muted);
    margin: 0;
}

/* Loading State */
.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-16) 0;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 2px solid var(--border-color);
    border-top-color: var(--text-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.loading-text {
    font-size: 0.875rem;
    font-weight: 300;
    color: var(--text-muted);
    letter-spacing: 0.05em;
}

/* Ticker List */
.ticker-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
}

.ticker-row {
    display: grid;
    grid-template-columns: 2fr 1.5fr 1fr auto;
    align-items: center;
    padding: var(--space-6) var(--space-4);
    border-bottom: 1px solid var(--border-color);
    transition: all 0.3s var(--ease);
    position: relative;
}

.ticker-row:hover {
    background: var(--accent-dim);
    transform: translateX(4px);
}

.ticker-row:hover .remove-ticker {
    opacity: 1;
}

.ticker-symbol {
    display: flex;
    align-items: center;
    gap: var(--space-3);
}

.ticker-icon {
    font-size: 2rem;
    font-weight: 300;
    opacity: 0.9;
}

.symbol-info {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
}

.symbol-text {
    font-size: 1.5rem;
    font-weight: 200;
    letter-spacing: 0.1em;
    color: var(--text-primary);
}

.symbol-name {
    font-size: 0.75rem;
    font-weight: 300;
    letter-spacing: 0.05em;
    color: var(--text-muted);
}

/* Price with animation container */
.ticker-price {
    position: relative;
}

.price-container {
    position: relative;
    min-height: 2rem;
    display: flex;
    align-items: center;
}

.price-value {
    font-size: 1.25rem;
    font-weight: 300;
    font-family: var(--font-mono);
    color: var(--text-primary);
    letter-spacing: 0.05em;
}

/* Change Indicator */
.ticker-change {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    justify-content: flex-end;
    font-family: var(--font-mono);
}

.ticker-change.positive {
    color: #22c55e;
}

.ticker-change.negative {
    color: #ef4444;
}

.change-arrow {
    font-size: 1.25rem;
}

.change-value {
    font-size: 0.875rem;
    font-weight: 400;
    letter-spacing: 0.05em;
}

/* Remove Button */
.remove-ticker {
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-muted);
    font-size: 1.5rem;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0;
    transition: all 0.3s var(--ease);
    padding: 0;
    line-height: 1;
}

.remove-ticker:hover {
    background: #ef4444;
    border-color: #ef4444;
    color: white;
    transform: rotate(90deg);
}

/* Add Ticker Button */
.add-ticker-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    width: 100%;
    padding: var(--space-6);
    background: transparent;
    border: 2px dashed var(--border-color);
    color: var(--text-muted);
    font-size: 0.875rem;
    font-weight: 300;
    letter-spacing: 0.1em;
    cursor: pointer;
    transition: all 0.4s var(--ease);
    margin-top: var(--space-4);
}

.add-ticker-btn:hover {
    border-color: var(--text-primary);
    color: var(--text-primary);
    background: var(--accent-dim);
    transform: translateY(-2px);
}

.add-icon {
    font-size: 1.5rem;
    font-weight: 200;
}

.add-text {
    letter-spacing: 0.05em;
}

/* Modal Overlay */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(45, 45, 45, 0.6);
    backdrop-filter: blur(10px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.modal-content {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    padding: var(--space-8);
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    animation: slideUp 0.4s ease;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.modal-title {
    font-size: 2rem;
    font-weight: 100;
    letter-spacing: 0.05em;
    color: var(--text-primary);
    margin-bottom: var(--space-2);
    text-align: center;
}

.modal-subtitle {
    font-family: var(--font-japanese);
    font-size: 0.875rem;
    font-weight: 200;
    letter-spacing: 0.2em;
    color: var(--text-muted);
    margin: 0 0 var(--space-8);
    text-align: center;
}

.popular-coins {
    margin-bottom: var(--space-8);
}

.section-title {
    font-size: 0.875rem;
    font-weight: 300;
    letter-spacing: 0.1em;
    color: var(--text-secondary);
    margin-bottom: var(--space-4);
}

.coin-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: var(--space-3);
}

.coin-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-4);
    background: transparent;
    border: 1px solid var(--border-color);
    cursor: pointer;
    transition: all 0.3s var(--ease);
}

.coin-option:hover {
    border-color: var(--text-primary);
    background: var(--accent-dim);
    transform: translateY(-4px);
}

.coin-icon-large {
    font-size: 2.5rem;
    opacity: 0.9;
}

.coin-name {
    font-size: 0.75rem;
    font-weight: 400;
    color: var(--text-primary);
    letter-spacing: 0.05em;
}

.coin-symbol {
    font-size: 0.65rem;
    font-weight: 300;
    color: var(--text-muted);
    letter-spacing: 0.1em;
}

.close-modal {
    width: 100%;
    padding: var(--space-4);
    background: var(--text-primary);
    color: var(--bg-primary);
    border: none;
    font-size: 0.875rem;
    font-weight: 300;
    letter-spacing: 0.1em;
    cursor: pointer;
    transition: all 0.3s var(--ease);
}

.close-modal:hover {
    background: var(--text-secondary);
    transform: translateY(-2px);
}

/* Update Time */
.update-time {
    margin-top: var(--space-8);
    text-align: center;
    padding-top: var(--space-6);
    border-top: 1px solid var(--border-color);
}

.update-text {
    font-size: 0.75rem;
    font-weight: 300;
    color: var(--text-muted);
    letter-spacing: 0.05em;
    font-family: var(--font-mono);
}

/* Ambient grid background */
.market-grid {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: space-around;
    z-index: 0;
    opacity: 0.2;
}

.grid-line {
    width: 1px;
    height: 100%;
    background: linear-gradient(to bottom,
            transparent 0%,
            var(--border-color) 20%,
            var(--border-color) 80%,
            transparent 100%);
    transform-origin: top;
}

/* Responsive */
@media (max-width: 768px) {
    .market-title {
        font-size: 2rem;
    }

    .ticker-row {
        grid-template-columns: 2fr 1fr 0.8fr auto;
        padding: var(--space-4) var(--space-2);
    }

    .ticker-icon {
        font-size: 1.5rem;
    }

    .symbol-text {
        font-size: 1.25rem;
    }

    .price-value {
        font-size: 1rem;
    }

    .change-arrow {
        font-size: 1rem;
    }

    .change-value {
        font-size: 0.75rem;
    }

    .coin-grid {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    }

    .modal-content {
        padding: var(--space-6);
    }

    .remove-ticker {
        opacity: 1;
        width: 28px;
        height: 28px;
        font-size: 1.25rem;
    }
}
</style>
