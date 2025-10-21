<template>
    <div class="journal-view">
        <!-- Japanese decoration -->
        <div class="japanese-label">取引記録</div>

        <!-- Sync/Loading Overlay -->
        <div v-if="isSyncing" class="sync-overlay">
            <div class="sync-container">
                <div class="sync-icon">📊</div>
                <div class="sync-text">{{ syncMessage }}</div>
                <div class="sync-progress">
                    <div class="progress-bar" ref="progressBarRef"></div>
                </div>
                <div class="sync-detail">{{ syncDetail }}</div>
            </div>
        </div>

        <!-- Initial Sync Prompt -->
        <div v-else-if="!hasSyncedBefore" class="initial-sync-prompt">
            <div class="prompt-content">
                <div class="prompt-icon"></div>
                <h2 class="prompt-title">Sync Trading History</h2>
                <p class="prompt-subtitle">取引履歴を同期</p>
                <p class="prompt-description">
                    Connect to Binance to fetch your trading history and generate detailed analytics.
                </p>
                <button class="btn-sync" @click="startInitialSync">
                    <span class="sync-btn-icon">⚡</span>
                    <span>Sync with Binance</span>
                </button>
                <button class="btn-configure" @click="showConfig = true">
                    <span>Configure API Keys</span>
                </button>
            </div>
        </div>

        <!-- Main Journal Dashboard -->
        <div v-else class="journal-dashboard">
            <!-- Summary Panel (Left) -->
            <div class="summary-panel" ref="summaryPanelRef">
                <div class="panel-header">
                    <h3 class="panel-title">Performance Summary</h3>
                    <p class="panel-subtitle">パフォーマンス概要</p>
                    <button class="btn-refresh" @click="refreshData" :disabled="isSyncing">
                        <span class="refresh-icon">🔄</span>
                    </button>
                </div>

                <div class="stats-grid">
                    <div class="stat-card" data-stat="total-pnl">
                        <div class="stat-label">Total P&L</div>
                        <div class="stat-value" :class="getTotalPnLClass()" ref="totalPnlRef">
                            {{ formatCurrency(analytics.totalPnL) }}
                        </div>
                        <div class="stat-sublabel">{{ analytics.totalTrades }} trades</div>
                    </div>

                    <div class="stat-card" data-stat="win-rate">
                        <div class="stat-label">Win Rate</div>
                        <div class="stat-value" ref="winRateRef">{{ analytics.winRate }}%</div>
                        <div class="stat-sublabel">{{ analytics.wins }}W / {{ analytics.losses }}L</div>
                    </div>

                    <div class="stat-card" data-stat="avg-win">
                        <div class="stat-label">Avg Win</div>
                        <div class="stat-value positive">{{ formatCurrency(analytics.avgWin) }}</div>
                        <div class="stat-sublabel">per winning trade</div>
                    </div>

                    <div class="stat-card" data-stat="avg-loss">
                        <div class="stat-label">Avg Loss</div>
                        <div class="stat-value negative">{{ formatCurrency(analytics.avgLoss) }}</div>
                        <div class="stat-sublabel">per losing trade</div>
                    </div>

                    <div class="stat-card" data-stat="profit-factor">
                        <div class="stat-label">Profit Factor</div>
                        <div class="stat-value">{{ analytics.profitFactor }}</div>
                        <div class="stat-sublabel">gross profit / loss</div>
                    </div>

                    <div class="stat-card" data-stat="best-trade">
                        <div class="stat-label">Best Trade</div>
                        <div class="stat-value positive">{{ formatCurrency(analytics.bestTrade) }}</div>
                        <div class="stat-sublabel">highest single gain</div>
                    </div>
                </div>
            </div>

            <!-- History Panel (Right) -->
            <div class="history-panel" ref="historyPanelRef">
                <div class="panel-header">
                    <h3 class="panel-title">Trade History</h3>
                    <p class="panel-subtitle">取引履歴</p>
                    <div class="filter-controls">
                        <select v-model="filterSymbol" class="filter-select">
                            <option value="all">All Symbols</option>
                            <option v-for="symbol in uniqueSymbols" :key="symbol" :value="symbol">
                                {{ symbol }}
                            </option>
                        </select>
                    </div>
                </div>

                <div class="trades-list" ref="tradesListRef">
                    <div v-for="(trade, index) in filteredTrades" :key="trade.id" class="trade-item"
                        :data-trade-index="index" @click="openTradeDetail(trade)">
                        <div class="trade-symbol">
                            <span class="symbol-text">{{ trade.symbol }}</span>
                            <span class="trade-side" :class="trade.side.toLowerCase()">{{ trade.side }}</span>
                        </div>
                        <div class="trade-info">
                            <div class="trade-pnl" :class="getPnLClass(trade.pnl)">
                                {{ formatCurrency(trade.pnl) }}
                            </div>
                            <div class="trade-meta">
                                <span class="trade-date">{{ formatDate(trade.exitTime) }}</span>
                                <span class="trade-duration">{{ formatDuration(trade.duration) }}</span>
                            </div>
                        </div>
                        <div class="trade-arrow">→</div>
                    </div>
                </div>

                <div v-if="filteredTrades.length === 0" class="empty-state">
                    <div class="empty-icon">📭</div>
                    <div class="empty-text">No trades found</div>
                </div>
            </div>
        </div>

        <!-- Trade Detail Panel (Overlay) -->
        <div v-if="selectedTrade" class="detail-overlay" @click="closeTradeDetail">
            <div class="detail-panel" ref="detailPanelRef" @click.stop>
                <button class="detail-close" @click="closeTradeDetail">×</button>

                <div class="detail-header">
                    <div class="detail-symbol">{{ selectedTrade.symbol }}</div>
                    <div class="detail-pnl" :class="getPnLClass(selectedTrade.pnl)">
                        {{ formatCurrency(selectedTrade.pnl) }}
                    </div>
                </div>

                <div class="detail-content">
                    <div class="detail-section">
                        <div class="section-title">Entry</div>
                        <div class="detail-row">
                            <span class="row-label">Price</span>
                            <span class="row-value">{{ selectedTrade.entryPrice }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="row-label">Quantity</span>
                            <span class="row-value">{{ selectedTrade.quantity }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="row-label">Time</span>
                            <span class="row-value">{{ formatFullDate(selectedTrade.entryTime) }}</span>
                        </div>
                    </div>

                    <div class="detail-section">
                        <div class="section-title">Exit</div>
                        <div class="detail-row">
                            <span class="row-label">Price</span>
                            <span class="row-value">{{ selectedTrade.exitPrice }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="row-label">Time</span>
                            <span class="row-value">{{ formatFullDate(selectedTrade.exitTime) }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="row-label">Duration</span>
                            <span class="row-value">{{ formatDuration(selectedTrade.duration) }}</span>
                        </div>
                    </div>

                    <div class="detail-section">
                        <div class="section-title">Costs & Fees</div>
                        <div class="detail-row">
                            <span class="row-label">Commission</span>
                            <span class="row-value">{{ formatCurrency(selectedTrade.commission) }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="row-label">Net P&L</span>
                            <span class="row-value" :class="getPnLClass(selectedTrade.pnl)">
                                {{ formatCurrency(selectedTrade.pnl) }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Configuration Modal -->
        <div v-if="showConfig" class="modal-overlay" @click="showConfig = false">
            <div class="modal-content config-modal" @click.stop>
                <h3 class="modal-title">Binance API Configuration</h3>
                <p class="modal-subtitle">API設定</p>

                <form @submit.prevent="saveConfig" class="config-form">
                    <div class="form-group">
                        <label>API Key</label>
                        <input v-model="config.apiKey" type="password" placeholder="Your Binance API Key" required />
                    </div>

                    <div class="form-group">
                        <label>API Secret</label>
                        <input v-model="config.apiSecret" type="password" placeholder="Your Binance API Secret"
                            required />
                    </div>

                    <div class="form-group">
                        <label>Symbols to Track</label>
                        <input v-model="config.symbols" type="text" placeholder="BTCUSDT,ETHUSDT,BNBUSDT" />
                        <div class="form-hint">Comma-separated list of trading pairs</div>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn-secondary" @click="showConfig = false">Cancel</button>
                        <button type="submit" class="btn-primary">Save & Sync</button>
                    </div>
                </form>

                <div class="config-warning">
                    <strong>⚠️ Security Note:</strong> Your API keys are stored locally in your browser and never sent
                    to
                    external servers except Binance API.
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import gsap from 'gsap'

// State
const isSyncing = ref(false)
const hasSyncedBefore = ref(false)
const syncMessage = ref('Connecting to Binance...')
const syncDetail = ref('')
const showConfig = ref(false)
const selectedTrade = ref(null)
const filterSymbol = ref('all')

// Refs for GSAP
const progressBarRef = ref(null)
const summaryPanelRef = ref(null)
const historyPanelRef = ref(null)
const totalPnlRef = ref(null)
const winRateRef = ref(null)
const tradesListRef = ref(null)
const detailPanelRef = ref(null)

// Configuration
const config = ref({
    apiKey: '',
    apiSecret: '',
    symbols: 'BTCUSDT,ETHUSDT,BNBUSDT'
})

// Data
const trades = ref([])
const analytics = ref({
    totalPnL: 0,
    totalTrades: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    avgWin: 0,
    avgLoss: 0,
    profitFactor: 0,
    bestTrade: 0
})

// Computed
const uniqueSymbols = computed(() => {
    const symbols = new Set(trades.value.map(t => t.symbol))
    return Array.from(symbols).sort()
})

const filteredTrades = computed(() => {
    if (filterSymbol.value === 'all') {
        return trades.value
    }
    return trades.value.filter(t => t.symbol === filterSymbol.value)
})

// Load saved data
const loadSavedData = () => {
    const savedConfig = localStorage.getItem('kinesis-binance-config')
    if (savedConfig) {
        try {
            config.value = JSON.parse(savedConfig)
        } catch (e) {
            console.error('Failed to load config')
        }
    }

    const savedTrades = localStorage.getItem('kinesis-trading-journal')
    if (savedTrades) {
        try {
            const data = JSON.parse(savedTrades)
            trades.value = data.trades || []
            analytics.value = data.analytics || analytics.value
            hasSyncedBefore.value = true
        } catch (e) {
            console.error('Failed to load trades')
        }
    }
}

// Save configuration
const saveConfig = () => {
    localStorage.setItem('kinesis-binance-config', JSON.stringify(config.value))
    showConfig.value = false
    startInitialSync()
}

// Initial sync
const startInitialSync = async () => {
    if (!config.value.apiKey || !config.value.apiSecret) {
        showConfig.value = true
        return
    }

    isSyncing.value = true
    syncMessage.value = 'Connecting to Binance...'
    syncDetail.value = ''

    // Animate progress bar
    if (progressBarRef.value) {
        gsap.to(progressBarRef.value, {
            width: '10%',
            duration: 0.5,
            ease: 'power2.out'
        })
    }

    try {
        // Fetch trades from Binance
        const symbols = config.value.symbols.split(',').map(s => s.trim())
        let allTrades = []

        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i]
            syncMessage.value = `Fetching ${symbol} trades...`
            syncDetail.value = `${i + 1} of ${symbols.length} symbols`

            if (progressBarRef.value) {
                gsap.to(progressBarRef.value, {
                    width: `${30 + (i / symbols.length) * 40}%`,
                    duration: 0.3
                })
            }

            // Mock API call (replace with real Binance API)
            await new Promise(resolve => setTimeout(resolve, 1000))
            const symbolTrades = await fetchBinanceTrades(symbol)
            allTrades = [...allTrades, ...symbolTrades]
        }

        syncMessage.value = 'Processing trades...'
        syncDetail.value = 'Calculating P&L and analytics'

        if (progressBarRef.value) {
            gsap.to(progressBarRef.value, {
                width: '80%',
                duration: 0.5
            })
        }

        // Process trades (FIFO matching)
        const processedTrades = processTrades(allTrades)
        const calculatedAnalytics = calculateAnalytics(processedTrades)

        syncMessage.value = 'Saving data...'
        if (progressBarRef.value) {
            gsap.to(progressBarRef.value, {
                width: '100%',
                duration: 0.3
            })
        }

        // Save to localStorage
        localStorage.setItem('kinesis-trading-journal', JSON.stringify({
            trades: processedTrades,
            analytics: calculatedAnalytics,
            lastSync: Date.now()
        }))

        trades.value = processedTrades
        analytics.value = calculatedAnalytics
        hasSyncedBefore.value = true

        await new Promise(resolve => setTimeout(resolve, 500))

        isSyncing.value = false

        // Animate dashboard entrance
        nextTick(() => {
            animateDashboardEntrance()
        })
    } catch (error) {
        console.error('Sync error:', error)
        syncMessage.value = 'Sync failed'
        syncDetail.value = error.message
        await new Promise(resolve => setTimeout(resolve, 2000))
        isSyncing.value = false
    }
}

// Refresh data
const refreshData = () => {
    startInitialSync()
}

// Mock Binance API fetch (replace with real implementation)
const fetchBinanceTrades = async (symbol) => {
    // This should call real Binance API with crypto-js for signing
    // For now, return mock data
    const mockTrades = []
    const count = Math.floor(Math.random() * 20) + 10

    for (let i = 0; i < count; i++) {
        const isBuy = Math.random() > 0.5
        mockTrades.push({
            symbol,
            orderId: Date.now() + i,
            side: isBuy ? 'BUY' : 'SELL',
            price: (40000 + Math.random() * 10000).toFixed(2),
            qty: (Math.random() * 0.1).toFixed(6),
            commission: (Math.random() * 5).toFixed(4),
            commissionAsset: 'USDT',
            time: Date.now() - (i * 86400000) - Math.random() * 86400000
        })
    }

    return mockTrades
}

// Process trades using FIFO
const processTrades = (rawTrades) => {
    const closedPositions = []
    const openPositions = {}

    // Sort by time
    rawTrades.sort((a, b) => a.time - b.time)

    rawTrades.forEach(trade => {
        const { symbol, side, price, qty, commission, time } = trade

        if (!openPositions[symbol]) {
            openPositions[symbol] = []
        }

        const numPrice = parseFloat(price)
        const numQty = parseFloat(qty)
        const numCommission = parseFloat(commission)

        if (side === 'BUY') {
            openPositions[symbol].push({
                entryPrice: numPrice,
                quantity: numQty,
                entryTime: time,
                entryCommission: numCommission
            })
        } else {
            // SELL - close positions FIFO
            let remainingQty = numQty
            let exitCommission = numCommission

            while (remainingQty > 0 && openPositions[symbol].length > 0) {
                const position = openPositions[symbol][0]
                const closeQty = Math.min(remainingQty, position.quantity)

                const pnl = (numPrice - position.entryPrice) * closeQty -
                    (position.entryCommission * (closeQty / position.quantity)) -
                    (exitCommission * (closeQty / numQty))

                closedPositions.push({
                    id: `${symbol}-${time}-${Math.random()}`,
                    symbol,
                    side: 'LONG',
                    entryPrice: position.entryPrice.toFixed(2),
                    exitPrice: numPrice.toFixed(2),
                    quantity: closeQty.toFixed(6),
                    entryTime: position.entryTime,
                    exitTime: time,
                    duration: time - position.entryTime,
                    pnl,
                    commission: position.entryCommission + exitCommission,
                })

                remainingQty -= closeQty
                position.quantity -= closeQty

                if (position.quantity <= 0) {
                    openPositions[symbol].shift()
                }
            }
        }
    })

    return closedPositions.reverse() // Most recent first
}

// Calculate analytics
const calculateAnalytics = (closedTrades) => {
    if (closedTrades.length === 0) {
        return {
            totalPnL: 0,
            totalTrades: 0,
            wins: 0,
            losses: 0,
            winRate: 0,
            avgWin: 0,
            avgLoss: 0,
            profitFactor: 0,
            bestTrade: 0
        }
    }

    const wins = closedTrades.filter(t => t.pnl > 0)
    const losses = closedTrades.filter(t => t.pnl < 0)

    const totalPnL = closedTrades.reduce((sum, t) => sum + t.pnl, 0)
    const totalWins = wins.reduce((sum, t) => sum + t.pnl, 0)
    const totalLosses = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0))

    const avgWin = wins.length > 0 ? totalWins / wins.length : 0
    const avgLoss = losses.length > 0 ? totalLosses / losses.length : 0
    const profitFactor = totalLosses > 0 ? (totalWins / totalLosses).toFixed(2) : '∞'
    const bestTrade = Math.max(...closedTrades.map(t => t.pnl))

    return {
        totalPnL,
        totalTrades: closedTrades.length,
        wins: wins.length,
        losses: losses.length,
        winRate: ((wins.length / closedTrades.length) * 100).toFixed(1),
        avgWin,
        avgLoss,
        profitFactor,
        bestTrade
    }
}

// Trade detail
const openTradeDetail = (trade) => {
    selectedTrade.value = trade

    nextTick(() => {
        // Dim background
        gsap.to('.journal-dashboard', {
            filter: 'blur(8px)',
            opacity: 0.3,
            duration: 0.3,
            ease: 'power2.out'
        })

        // Slide in detail panel
        gsap.fromTo(detailPanelRef.value,
            {
                x: '100%',
                opacity: 0
            },
            {
                x: '0%',
                opacity: 1,
                duration: 0.5,
                ease: 'power3.out'
            }
        )
    })
}

const closeTradeDetail = () => {
    // Slide out detail panel
    gsap.to(detailPanelRef.value, {
        x: '100%',
        opacity: 0,
        duration: 0.4,
        ease: 'power3.in',
        onComplete: () => {
            selectedTrade.value = null
        }
    })

    // Restore background
    gsap.to('.journal-dashboard', {
        filter: 'blur(0px)',
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out'
    })
}

// Animate dashboard entrance
const animateDashboardEntrance = () => {
    // Animate summary stats
    const statCards = summaryPanelRef.value?.querySelectorAll('.stat-card')
    if (statCards) {
        gsap.from(statCards, {
            opacity: 0,
            y: 20,
            duration: 0.5,
            stagger: 0.1,
            ease: 'back.out(1.7)'
        })
    }

    // Animate P&L color
    if (totalPnlRef.value) {
        gsap.from(totalPnlRef.value, {
            color: 'var(--text-secondary)',
            duration: 0.8,
            delay: 0.5,
            ease: 'power2.out'
        })
    }

    // Animate trade list
    const tradeItems = tradesListRef.value?.querySelectorAll('.trade-item')
    if (tradeItems) {
        gsap.from(tradeItems, {
            opacity: 0,
            x: -20,
            duration: 0.4,
            stagger: 0.05,
            ease: 'power2.out',
            delay: 0.3
        })
    }
}

// Formatting helpers
const formatCurrency = (value) => {
    const num = typeof value === 'number' ? value : parseFloat(value) || 0
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num)
}

const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })
}

const formatFullDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const formatDuration = (ms) => {
    const hours = Math.floor(ms / 3600000)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h`
    return `${Math.floor(ms / 60000)}m`
}

const getTotalPnLClass = () => {
    return analytics.value.totalPnL >= 0 ? 'positive' : 'negative'
}

const getPnLClass = (pnl) => {
    return pnl >= 0 ? 'positive' : 'negative'
}

onMounted(() => {
    loadSavedData()
})
</script>

<style scoped>
.journal-view {
    width: 100%;
    min-height: 100vh;
    position: relative;
    overflow: hidden;
    background: transparent;
    padding-top: 120px;
    padding-bottom: var(--space-16);
}

.japanese-label {
    position: absolute;
    top: calc(120px + var(--space-8));
    left: var(--space-8);
    font-family: var(--font-serif);
    font-size: 0.875rem;
    font-weight: 300;
    letter-spacing: 0.3em;
    color: var(--text-muted);
    z-index: 1;
}

/* Sync Overlay */
.sync-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(245, 243, 240, 0.98);
    backdrop-filter: blur(20px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.sync-container {
    text-align: center;
    max-width: 400px;
}

.sync-icon {
    font-size: 4rem;
    margin-bottom: var(--space-6);
    animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
        transform: scale(1);
    }

    50% {
        opacity: 0.6;
        transform: scale(1.1);
    }
}

.sync-text {
    font-family: var(--font-sans);
    font-size: 1.25rem;
    font-weight: 400;
    color: var(--text-primary);
    margin-bottom: var(--space-4);
}

.sync-progress {
    width: 100%;
    height: 2px;
    background: var(--border-color);
    margin: var(--space-6) 0;
    overflow: hidden;
}

.progress-bar {
    height: 100%;
    background: var(--accent);
    width: 0%;
    transition: width 0.3s ease;
}

.sync-detail {
    font-size: 0.875rem;
    color: var(--text-muted);
    font-weight: 300;
}

/* Initial Sync Prompt */
.initial-sync-prompt {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
}

.prompt-content {
    text-align: center;
    max-width: 500px;
}

.prompt-icon {
    font-size: 5rem;
    margin-bottom: var(--space-6);
}

.prompt-title {
    font-size: 2.5rem;
    font-weight: 200;
    letter-spacing: 0.05em;
    color: var(--text-primary);
    margin-bottom: var(--space-2);
}

.prompt-subtitle {
    font-family: var(--font-serif);
    font-size: 0.875rem;
    font-weight: 300;
    letter-spacing: 0.2em;
    color: var(--text-muted);
    margin-bottom: var(--space-6);
}

.prompt-description {
    font-size: 1rem;
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: var(--space-8);
}

.btn-sync,
.btn-configure {
    padding: var(--space-4) var(--space-8);
    border-radius: 6px;
    font-family: var(--font-sans);
    font-size: 1rem;
    font-weight: 500;
    letter-spacing: 0.05em;
    cursor: pointer;
    transition: all 0.3s var(--ease);
    border: none;
    display: inline-flex;
    align-items: center;
    gap: var(--space-3);
    margin: var(--space-2);
}

.btn-sync {
    background: var(--accent);
    color: white;
}

.btn-sync:hover {
    background: var(--text-primary);
    transform: translateY(-2px);
}

.btn-configure {
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
}

.btn-configure:hover {
    border-color: var(--text-primary);
    color: var(--text-primary);
}

.sync-btn-icon {
    font-size: 1.25rem;
}

/* Dashboard */
.journal-dashboard {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 var(--space-8);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-8);
    transition: filter 0.3s ease, opacity 0.3s ease;
}

.summary-panel,
.history-panel {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: var(--space-6);
}

.panel-header {
    position: relative;
    margin-bottom: var(--space-6);
    padding-bottom: var(--space-4);
    border-bottom: 1px solid var(--border-color);
}

.panel-title {
    font-size: 1.5rem;
    font-weight: 300;
    letter-spacing: 0.05em;
    color: var(--text-primary);
    margin-bottom: var(--space-1);
}

.panel-subtitle {
    font-family: var(--font-serif);
    font-size: 0.75rem;
    font-weight: 300;
    letter-spacing: 0.2em;
    color: var(--text-muted);
}

.btn-refresh {
    position: absolute;
    top: 0;
    right: 0;
    width: 36px;
    height: 36px;
    background: transparent;
    border: 1px solid var(--border-color);
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s var(--ease);
}

.btn-refresh:hover:not(:disabled) {
    border-color: var(--accent);
    transform: rotate(180deg);
}

.btn-refresh:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.refresh-icon {
    font-size: 1rem;
}

/* Stats Grid */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
}

.stat-card {
    padding: var(--space-4);
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    transition: all 0.3s var(--ease);
}

.stat-card:hover {
    border-color: var(--accent);
    transform: translateY(-2px);
}

.stat-label {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--text-muted);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: var(--space-2);
}

.stat-value {
    font-family: var(--font-mono);
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--space-2);
}

.stat-value.positive {
    color: #22c55e;
}

.stat-value.negative {
    color: #ef4444;
}

.stat-sublabel {
    font-size: 0.7rem;
    color: var(--text-tertiary);
    font-weight: 300;
}

/* Trade List */
.filter-controls {
    position: absolute;
    top: 0;
    right: 0;
}

.filter-select {
    padding: var(--space-2) var(--space-3);
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-family: var(--font-sans);
    font-size: 0.875rem;
    color: var(--text-primary);
    cursor: pointer;
}

.trades-list {
    max-height: 600px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
}

.trade-item {
    display: grid;
    grid-template-columns: 1fr 2fr auto;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-4);
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s var(--ease);
}

.trade-item:hover {
    border-color: var(--accent);
    transform: translateX(4px);
}

.trade-symbol {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
}

.symbol-text {
    font-family: var(--font-mono);
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text-primary);
}

.trade-side {
    font-size: 0.7rem;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 3px;
    display: inline-block;
    width: fit-content;
}

.trade-side.buy {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
}

.trade-side.sell {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
}

.trade-info {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

.trade-pnl {
    font-family: var(--font-mono);
    font-size: 1.1rem;
    font-weight: 600;
}

.trade-meta {
    display: flex;
    gap: var(--space-4);
    font-size: 0.75rem;
    color: var(--text-tertiary);
}

.trade-arrow {
    font-size: 1.25rem;
    color: var(--text-muted);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.trade-item:hover .trade-arrow {
    opacity: 1;
}

/* Detail Panel */
.detail-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(45, 45, 45, 0.6);
    backdrop-filter: blur(10px);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: flex-end;
}

.detail-panel {
    width: 500px;
    height: 100%;
    background: var(--bg-primary);
    border-left: 1px solid var(--border-color);
    padding: var(--space-8);
    overflow-y: auto;
    position: relative;
}

.detail-close {
    position: absolute;
    top: var(--space-6);
    right: var(--space-6);
    width: 36px;
    height: 36px;
    background: transparent;
    border: 1px solid var(--border-color);
    border-radius: 50%;
    font-size: 1.5rem;
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s var(--ease);
}

.detail-close:hover {
    border-color: var(--text-primary);
    transform: rotate(90deg);
}

.detail-header {
    margin-bottom: var(--space-8);
}

.detail-symbol {
    font-family: var(--font-mono);
    font-size: 2rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--space-3);
}

.detail-pnl {
    font-family: var(--font-mono);
    font-size: 1.75rem;
    font-weight: 600;
}

.detail-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
}

.detail-section {
    border-bottom: 1px solid var(--border-color);
    padding-bottom: var(--space-6);
}

.section-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-secondary);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: var(--space-4);
}

.detail-row {
    display: flex;
    justify-content: space-between;
    padding: var(--space-3) 0;
    font-size: 0.95rem;
}

.row-label {
    color: var(--text-muted);
    font-weight: 400;
}

.row-value {
    color: var(--text-primary);
    font-weight: 500;
    font-family: var(--font-mono);
}

/* Config Modal */
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
}

.modal-content {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: var(--space-8);
    max-width: 500px;
    width: 90%;
}

.config-modal {
    max-width: 600px;
}

.modal-title {
    font-size: 1.75rem;
    font-weight: 300;
    letter-spacing: 0.05em;
    color: var(--text-primary);
    margin-bottom: var(--space-2);
}

.modal-subtitle {
    font-family: var(--font-serif);
    font-size: 0.875rem;
    font-weight: 300;
    letter-spacing: 0.2em;
    color: var(--text-muted);
    margin: 0 0 var(--space-8);
}

.config-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    margin-bottom: var(--space-6);
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

.form-group label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-secondary);
    letter-spacing: 0.05em;
}

.form-group input {
    padding: var(--space-3) var(--space-4);
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-family: var(--font-sans);
    font-size: 1rem;
    color: var(--text-primary);
    transition: all 0.3s var(--ease);
}

.form-group input:focus {
    outline: none;
    border-color: var(--accent);
    background: var(--bg-primary);
}

.form-hint {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-top: var(--space-1);
}

.form-actions {
    display: flex;
    gap: var(--space-3);
    justify-content: flex-end;
    margin-top: var(--space-4);
}

.btn-primary,
.btn-secondary {
    padding: var(--space-3) var(--space-6);
    border-radius: 4px;
    font-family: var(--font-sans);
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: 0.05em;
    cursor: pointer;
    transition: all 0.3s var(--ease);
    border: none;
}

.btn-primary {
    background: var(--accent);
    color: white;
}

.btn-primary:hover {
    background: var(--text-primary);
    transform: translateY(-2px);
}

.btn-secondary {
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
}

.btn-secondary:hover {
    border-color: var(--text-primary);
    color: var(--text-primary);
}

.config-warning {
    padding: var(--space-4);
    background: rgba(251, 191, 36, 0.1);
    border: 1px solid rgba(251, 191, 36, 0.3);
    border-radius: 6px;
    font-size: 0.85rem;
    color: var(--text-secondary);
    line-height: 1.6;
}

.empty-state {
    text-align: center;
    padding: var(--space-16) 0;
}

.empty-icon {
    font-size: 4rem;
    margin-bottom: var(--space-4);
    opacity: 0.5;
}

.empty-text {
    font-size: 1rem;
    color: var(--text-muted);
}

/* Scrollbar */
.trades-list::-webkit-scrollbar,
.detail-panel::-webkit-scrollbar {
    width: 6px;
}

.trades-list::-webkit-scrollbar-track,
.detail-panel::-webkit-scrollbar-track {
    background: transparent;
}

.trades-list::-webkit-scrollbar-thumb,
.detail-panel::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 3px;
}

/* Responsive */
@media (max-width: 1200px) {
    .journal-dashboard {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .stats-grid {
        grid-template-columns: 1fr;
    }

    .trade-item {
        grid-template-columns: 1fr;
        gap: var(--space-2);
    }

    .detail-panel {
        width: 100%;
    }
}
</style>
