<template>
    <div class="journal-view">
        <!-- Japanese decoration -->
        <div class="japanese-label">取引記録</div>

        <!-- Sync/Loading Overlay -->
        <div v-if="isSyncing" class="sync-overlay">
            <div class="sync-container">
                <div class="sync-icon">
                    <BarChart3 :size="48" :stroke-width="1.5" />
                </div>
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
                    <div class="panel-actions">
                        <button class="btn-settings" @click="showConfig = true" title="Settings">
                            <Settings :size="18" :stroke-width="2" />
                        </button>
                        <button class="btn-refresh" @click="refreshData" :disabled="isSyncing" title="Refresh">
                            <RefreshCw :size="18" :stroke-width="2" />
                        </button>
                    </div>
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
                <h3 class="modal-title">Trading Journal Settings</h3>
                <p class="modal-subtitle">取引設定 • Manage API & Symbols</p>

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
                        <label>Market Type</label>
                        <select v-model="config.marketType" class="market-select">
                            <option value="spot">Spot Trading (Regular buy/sell)</option>
                            <option value="futures">Futures Trading (Leveraged contracts)</option>
                            <option value="both">Both (Check both markets)</option>
                        </select>
                        <div class="form-hint">Select which market you trade on. Futures is for leveraged trading.</div>
                    </div>

                    <div class="form-group">
                        <label>Trading Pairs to Track</label>
                        <div class="symbols-list">
                            <div v-for="(symbol, index) in symbolsList" :key="index" class="symbol-item">
                                <input v-model="symbolsList[index]" type="text" placeholder="BTCUSDT"
                                    class="symbol-input" @input="validateSymbol(index)" />
                                <button type="button" @click="removeSymbol(index)" class="btn-remove"
                                    :disabled="symbolsList.length === 1">
                                    ×
                                </button>
                            </div>
                        </div>
                        <button type="button" @click="addSymbol" class="btn-add-symbol">
                            + Add Trading Pair
                        </button>
                        <div class="form-hint">Common pairs: BTCUSDT, ETHUSDT, BNBUSDT, SOLUSDT, ADAUSDT</div>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn-secondary" @click="showConfig = false">Cancel</button>
                        <button type="button" class="btn-secondary" @click="saveConfigOnly">Save Settings</button>
                        <button type="submit" class="btn-primary">Save & Sync Now</button>
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
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import gsap from 'gsap'
import { fetchMyTrades, fetchAllTrades, testConnection, validateApiKey, validateApiSecret, parseError } from '../utils/binanceApi'
import { useKinesisAlert } from '../composables/useKinesisAlert'
import { Settings, RefreshCw, BarChart3 } from 'lucide-vue-next'

// Alert composable
const {
    confirm,
    error: showError,
    success: showSuccess
} = useKinesisAlert()

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
    symbols: 'BTCUSDT,ETHUSDT,BNBUSDT',
    marketType: 'futures' // 'spot' or 'futures'
})

// Symbols list for UI
const symbolsList = ref(['BTCUSDT', 'ETHUSDT', 'BNBUSDT'])

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

// Watch trades for debugging
watch(trades, (newTrades) => {
    console.log('🔄 Trades updated:', {
        count: newTrades.length,
        symbols: [...new Set(newTrades.map(t => t.symbol))],
        uniqueSymbolsCount: uniqueSymbols.value.length,
        filteredCount: filteredTrades.value.length,
        currentFilter: filterSymbol.value
    })
}, { deep: true })

// Load saved data
const loadSavedData = () => {
    const savedConfig = localStorage.getItem('kinesis-binance-config')
    if (savedConfig) {
        try {
            config.value = JSON.parse(savedConfig)
            // Populate symbols list from saved config
            if (config.value.symbols) {
                symbolsList.value = config.value.symbols.split(',').map(s => s.trim()).filter(s => s.length > 0)
            }
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

            console.log('📂 Loaded from localStorage:', {
                tradesCount: trades.value.length,
                symbols: [...new Set(trades.value.map(t => t.symbol))],
                lastSync: data.lastSync ? new Date(data.lastSync).toLocaleString() : 'unknown'
            })
        } catch (e) {
            console.error('❌ Failed to load trades:', e)
        }
    } else {
        console.log('📂 No saved data found in localStorage')
    }
}

// Symbol management
const addSymbol = async () => {
    symbolsList.value.push('')
}

const removeSymbol = async (index) => {
    if (symbolsList.value.length > 1) {
        const symbol = symbolsList.value[index] || 'this trading pair'
        const confirmed = await confirm(
            `Remove ${symbol} from your tracked symbols?`,
            'Remove Trading Pair',
            'シンボル削除'
        )

        if (confirmed) {
            symbolsList.value.splice(index, 1)
            await showSuccess(`${symbol} removed successfully!`, 'Removed', '削除完了')
        }
    }
}

const validateSymbol = (index) => {
    // Convert to uppercase and remove spaces
    symbolsList.value[index] = symbolsList.value[index].toUpperCase().trim()
}

// Save configuration
const saveConfig = async () => {
    // Convert symbols list to comma-separated string
    const validSymbols = symbolsList.value.filter(s => s.trim().length > 0)

    if (validSymbols.length === 0) {
        await showError('Please add at least one trading pair', 'No Trading Pairs', 'シンボルなし')
        return
    }

    config.value.symbols = validSymbols.join(',')

    localStorage.setItem('kinesis-binance-config', JSON.stringify(config.value))
    showConfig.value = false
    startInitialSync()
}

// Save configuration without syncing (just update settings)
const saveConfigOnly = async () => {
    // Convert symbols list to comma-separated string
    const validSymbols = symbolsList.value.filter(s => s.trim().length > 0)

    if (validSymbols.length === 0) {
        await showError('Please add at least one trading pair', 'No Trading Pairs', 'シンボルなし')
        return
    }

    config.value.symbols = validSymbols.join(',')

    localStorage.setItem('kinesis-binance-config', JSON.stringify(config.value))
    showConfig.value = false

    // Show success confirmation
    await showSuccess(
        `Settings saved! Tracking ${validSymbols.length} trading pair${validSymbols.length > 1 ? 's' : ''}. Click "Refresh" to fetch new data.`,
        'Settings Saved',
        '設定保存完了'
    )
}

// Initial sync
const startInitialSync = async () => {
    if (!config.value.apiKey || !config.value.apiSecret) {
        showConfig.value = true
        return
    }

    // Validate API key format
    if (!validateApiKey(config.value.apiKey)) {
        await showError('Invalid API key format. API keys should be 64 characters.', 'Invalid API Key', '無効なAPIキー')
        showConfig.value = true
        return
    }

    if (!validateApiSecret(config.value.apiSecret)) {
        await showError('Invalid API secret format. API secrets should be 64 characters.', 'Invalid API Secret', '無効なAPIシークレット')
        showConfig.value = true
        return
    }

    isSyncing.value = true
    syncMessage.value = 'Testing connection...'
    syncDetail.value = 'Verifying API credentials'

    // Animate progress bar
    if (progressBarRef.value) {
        gsap.to(progressBarRef.value, {
            width: '5%',
            duration: 0.5,
            ease: 'power2.out'
        })
    }

    try {
        // Test connection first
        const isValid = await testConnection(config.value.apiKey, config.value.apiSecret)
        if (!isValid) {
            throw new Error('Invalid credentials or insufficient permissions. Please check your API keys and ensure "Enable Reading" is enabled.')
        }

        if (progressBarRef.value) {
            gsap.to(progressBarRef.value, {
                width: '15%',
                duration: 0.3
            })
        }

        syncMessage.value = 'Connection successful!'
        syncDetail.value = 'Scanning your trading history...'
        await new Promise(resolve => setTimeout(resolve, 500))

        if (progressBarRef.value) {
            gsap.to(progressBarRef.value, {
                width: '20%',
                duration: 0.3
            })
        }

        // Fetch ALL trades and discover symbols automatically
        syncMessage.value = 'Discovering trading pairs...'

        // Parse user-specified symbols (optional)
        const userSymbols = config.value.symbols
            ? config.value.symbols.split(',').map(s => s.trim()).filter(s => s.length > 0)
            : []

        const result = await fetchAllTrades(
            config.value.apiKey,
            config.value.apiSecret,
            userSymbols,
            config.value.marketType || 'futures', // Use configured market type
            (message) => {
                syncDetail.value = message

                // Update progress bar smoothly
                if (progressBarRef.value) {
                    const currentWidth = parseInt(progressBarRef.value.style.width) || 20
                    if (currentWidth < 70) {
                        gsap.to(progressBarRef.value, {
                            width: `${Math.min(currentWidth + 5, 70)}%`,
                            duration: 0.3
                        })
                    }
                }
            }
        )

        const allTrades = result.trades
        const discoveredSymbols = result.symbols

        if (allTrades.length === 0) {
            throw new Error('No trades found on your Binance account. Make sure you have completed some trades.')
        }

        console.log(`✅ Fetched ${allTrades.length} RAW trades from ${discoveredSymbols.length} symbols:`, discoveredSymbols.join(', '))

        // Debug: Show trade count per symbol
        const tradesBySymbol = {}
        allTrades.forEach(trade => {
            tradesBySymbol[trade.symbol] = (tradesBySymbol[trade.symbol] || 0) + 1
        })
        console.log('📊 Trades per symbol (RAW):', tradesBySymbol)

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

        console.log(`📈 Processed ${processedTrades.length} closed positions from ${allTrades.length} raw trades`)

        // Debug: Show closed positions per symbol
        const closedBySymbol = {}
        processedTrades.forEach(trade => {
            closedBySymbol[trade.symbol] = (closedBySymbol[trade.symbol] || 0) + 1
        })
        console.log('📊 Closed positions per symbol:', closedBySymbol)

        const calculatedAnalytics = calculateAnalytics(processedTrades)

        syncMessage.value = 'Saving data...'
        if (progressBarRef.value) {
            gsap.to(progressBarRef.value, {
                width: '100%',
                duration: 0.3
            })
        }

        // Save to localStorage
        const dataToSave = {
            trades: processedTrades,
            analytics: calculatedAnalytics,
            lastSync: Date.now()
        }

        localStorage.setItem('kinesis-trading-journal', JSON.stringify(dataToSave))
        console.log('💾 Saved to localStorage:', {
            tradesCount: processedTrades.length,
            symbols: [...new Set(processedTrades.map(t => t.symbol))],
            analytics: calculatedAnalytics
        })

        trades.value = processedTrades
        analytics.value = calculatedAnalytics
        hasSyncedBefore.value = true

        console.log('✅ Updated Vue state:', {
            tradesCount: trades.value.length,
            analyticsTotal: analytics.value.totalTrades,
            hasSynced: hasSyncedBefore.value
        })

        await new Promise(resolve => setTimeout(resolve, 500))

        isSyncing.value = false

        // Show success notification
        await showSuccess(
            `Successfully synced ${trades.value.length} trades across ${symbolsList.value.length} trading pairs!`,
            'Sync Complete',
            '同期完了'
        )

        // Animate dashboard entrance
        nextTick(() => {
            console.log('🎬 Animating dashboard entrance')
            animateDashboardEntrance()
        })
    } catch (error) {
        console.error('Sync error:', error)
        syncMessage.value = 'Sync failed'
        syncDetail.value = parseError(error)
        await new Promise(resolve => setTimeout(resolve, 1000))
        isSyncing.value = false

        // Show error notification
        await showError(
            parseError(error),
            'Sync Failed',
            '同期失敗'
        )

        showConfig.value = true // Show config again so user can fix
    }
}

// Refresh data
const refreshData = async () => {
    const confirmed = await confirm(
        'This will re-fetch all trades from Binance. Continue?',
        'Refresh Trade Data',
        'データ更新'
    )

    if (confirmed) {
        startInitialSync()
    }
}

// Mock Binance API fetch (replace with real implementation)
const fetchBinanceTrades = async (symbol) => {
    try {
        // Call real Binance API
        const trades = await fetchMyTrades(
            symbol,
            config.value.apiKey,
            config.value.apiSecret,
            1000 // max trades per symbol
        )
        return trades
    } catch (error) {
        console.error(`Failed to fetch ${symbol}:`, error)
        throw new Error(`Could not fetch trades for ${symbol}: ${error.message}`)
    }
}

// Process trades using FIFO
const processTrades = (rawTrades) => {
    const closedPositions = []
    const openLongPositions = {}  // BUY positions waiting for SELL
    const openShortPositions = {} // SELL positions waiting for BUY

    // Sort by time (chronological order)
    rawTrades.sort((a, b) => a.time - b.time)

    rawTrades.forEach(trade => {
        const { symbol, side, price, qty, commission, time } = trade

        // Initialize position tracking for this symbol
        if (!openLongPositions[symbol]) {
            openLongPositions[symbol] = []
        }
        if (!openShortPositions[symbol]) {
            openShortPositions[symbol] = []
        }

        const numPrice = parseFloat(price)
        const numQty = parseFloat(qty)
        const numCommission = parseFloat(commission)

        if (side === 'BUY') {
            // First, check if this BUY closes any SHORT positions (FIFO)
            let remainingQty = numQty
            let buyCommission = numCommission

            while (remainingQty > 0 && openShortPositions[symbol].length > 0) {
                const position = openShortPositions[symbol][0]
                const closeQty = Math.min(remainingQty, position.quantity)

                // For SHORT: profit when buy price < sell price
                const pnl = (position.entryPrice - numPrice) * closeQty -
                    (position.entryCommission * (closeQty / position.quantity)) -
                    (buyCommission * (closeQty / numQty))

                closedPositions.push({
                    id: `${symbol}-${time}-${Math.random()}`,
                    symbol,
                    side: 'SHORT',
                    entryPrice: position.entryPrice.toFixed(2),
                    exitPrice: numPrice.toFixed(2),
                    quantity: closeQty.toFixed(6),
                    entryTime: position.entryTime,
                    exitTime: time,
                    duration: time - position.entryTime,
                    pnl,
                    commission: (position.entryCommission * (closeQty / position.quantity)) +
                        (buyCommission * (closeQty / numQty)),
                })

                remainingQty -= closeQty
                position.quantity -= closeQty

                if (position.quantity <= 0.000001) { // Handle floating point
                    openShortPositions[symbol].shift()
                }
            }

            // If there's remaining quantity, open a new LONG position
            if (remainingQty > 0.000001) {
                openLongPositions[symbol].push({
                    entryPrice: numPrice,
                    quantity: remainingQty,
                    entryTime: time,
                    entryCommission: buyCommission * (remainingQty / numQty)
                })
            }

        } else if (side === 'SELL') {
            // First, check if this SELL closes any LONG positions (FIFO)
            let remainingQty = numQty
            let sellCommission = numCommission

            while (remainingQty > 0 && openLongPositions[symbol].length > 0) {
                const position = openLongPositions[symbol][0]
                const closeQty = Math.min(remainingQty, position.quantity)

                // For LONG: profit when sell price > buy price
                const pnl = (numPrice - position.entryPrice) * closeQty -
                    (position.entryCommission * (closeQty / position.quantity)) -
                    (sellCommission * (closeQty / numQty))

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
                    commission: (position.entryCommission * (closeQty / position.quantity)) +
                        (sellCommission * (closeQty / numQty)),
                })

                remainingQty -= closeQty
                position.quantity -= closeQty

                if (position.quantity <= 0.000001) { // Handle floating point
                    openLongPositions[symbol].shift()
                }
            }

            // If there's remaining quantity, open a new SHORT position
            if (remainingQty > 0.000001) {
                openShortPositions[symbol].push({
                    entryPrice: numPrice,
                    quantity: remainingQty,
                    entryTime: time,
                    entryCommission: sellCommission * (remainingQty / numQty)
                })
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

<style src="../styles/journal-view.css" scoped></style>