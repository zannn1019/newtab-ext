<template>
    <div class="command-palette" :class="{ 'palette-expanded': isExpanded }">
        <!-- Vertical Japanese Label -->
        <div class="tategaki-label">ファウザン</div>

        <div class="palette-content">
            <!-- Search Container with Japanese Styling -->
            <div class="search-container">
                <input ref="inputRef" v-model="searchQuery" @keydown="handleKeydown" @focus="isExpanded = true"
                    @blur="handleBlur" @input="handleInput" class="command-input" placeholder="Type a command or search..."
                    spellcheck="false" />
                <!-- Autocomplete suggestion -->
                <div v-if="autocompleteSuggestion" class="autocomplete-suggestion">
                    {{ searchQuery }}<span class="suggestion-text">{{ autocompleteSuggestion }}</span>
                </div>
                <div class="input-underline"></div>
                <span v-if="!searchQuery" class="search-hint">
                    <kbd>TAB</kbd> to focus • <kbd>→</kbd> to autocomplete
                </span>
            </div>

            <!-- Quick Access Shortcuts (when not searching) -->
            <div v-if="!isExpanded" class="shortcuts">
                <div v-for="(command, index) in quickAccessCommands" :key="index" class="shortcut-group"
                    @click="executeCommand(command)">
                    <span class="kbd">{{ command.key }}</span>
                    <div class="shortcut-label">
                        <span class="label-en">{{ command.name }}</span>
                        <span class="label-jp">{{ command.nameJP }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Command Results Dropdown (when searching) -->
        <div v-if="isExpanded && filteredCommands.length > 0" class="command-results">
            <div v-for="(group, category) in groupedCommands" :key="category" class="command-category">
                <div class="category-title">{{ category }}</div>
                <div v-for="(command, index) in group" :key="command.id" class="command-item"
                    :class="{ 'selected': selectedIndex === getCommandGlobalIndex(command) }"
                    @click="executeCommand(command)" @mouseenter="selectedIndex = getCommandGlobalIndex(command)">
                    <div class="command-icon">
                        <component :is="iconComponents[command.icon] || Search" :size="20" :stroke-width="2" />
                    </div>
                    <div class="command-info">
                        <div class="command-name">
                            {{ command.name }}
                            <span class="command-name-jp">{{ command.nameJP }}</span>
                        </div>
                        <div class="command-desc">{{ command.description }}</div>
                    </div>
                    <kbd v-if="command.key" class="command-kbd">{{ command.key }}</kbd>
                </div>
            </div>
        </div>

        <!-- History Suggestions Dropdown (Chrome-like) -->
        <div v-if="isExpanded && filteredCommands.length === 0 && historySuggestions.length > 0" class="history-results">
            <div class="history-category">
                <div class="category-title">History & Suggestions</div>
                <div v-for="(suggestion, index) in historySuggestions" :key="suggestion.id" 
                    class="history-item"
                    :class="{ 'selected': selectedHistoryIndex === index }"
                    @click="selectHistorySuggestion(suggestion)" 
                    @mouseenter="selectedHistoryIndex = index">
                    <div class="history-icon">
                        <component :is="suggestion.icon" :size="18" :stroke-width="2" />
                    </div>
                    <div class="history-info">
                        <div class="history-title">{{ suggestion.title }}</div>
                        <div class="history-url">{{ suggestion.subtitle }}</div>
                    </div>
                    <div class="history-meta">{{ suggestion.meta }}</div>
                </div>
            </div>
        </div>

        <!-- Empty State -->
        <div v-if="isExpanded && filteredCommands.length === 0 && historySuggestions.length === 0 && searchQuery" class="empty-state">
            <div class="empty-icon">🔍</div>
            <div class="empty-text">No commands found</div>
            <div class="empty-hint">Press Enter to {{ isURL(searchQuery) ? 'visit website' : 'search on Google' }}</div>
        </div>

        <!-- Sumi ink brush decoration -->
        <div class="sumi-brush"></div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import gsap from 'gsap'
import {
    Flower2, TrendingUp, Bookmark, BarChart3, FileText,
    Image, RefreshCw, Trash2, Sun, Moon, Search, CheckSquare,
    Globe, Clock, Star, Newspaper
} from 'lucide-vue-next'
import { useKinesisAlert } from '../composables/useKinesisAlert'

const { confirm, success: showSuccess } = useKinesisAlert()

// Icon mapping
const iconComponents = {
    '🧘': Flower2,
    '📈': TrendingUp,
    '🔖': Bookmark,
    '📊': BarChart3,
    '✅': CheckSquare,
    '📝': FileText,
    '�': Newspaper,
    '�🖼️': Image,
    '🔄': RefreshCw,
    '🗑️': Trash2,
    '☀️': Sun,
    '🌙': Moon,
    '🔍': Search
}

const props = defineProps({
    currentView: String
})

const inputRef = ref(null)
const searchQuery = ref('')
const isExpanded = ref(false)
const selectedIndex = ref(0)
const selectedHistoryIndex = ref(0)
const autocompleteSuggestion = ref('')
const urlHistory = ref([])
const searchHistory = ref([])
const browserHistory = ref([])
const historySuggestions = ref([])

const emit = defineEmits(['navigate', 'search'])

// Load search and URL history from localStorage
const loadHistory = () => {
    // Load URL history
    const savedUrls = localStorage.getItem('kinesis-url-history')
    if (savedUrls) {
        try {
            urlHistory.value = JSON.parse(savedUrls)
        } catch (e) {
            urlHistory.value = []
        }
    }

    // Load search history
    const savedSearches = localStorage.getItem('kinesis-search-history')
    if (savedSearches) {
        try {
            searchHistory.value = JSON.parse(savedSearches)
        } catch (e) {
            searchHistory.value = []
        }
    }
}

// Save URL to history
const saveUrlToHistory = (url) => {
    // Remove if exists (to move to front)
    urlHistory.value = urlHistory.value.filter(u => u !== url)
    urlHistory.value.unshift(url)
    
    if (urlHistory.value.length > 50) {
        urlHistory.value = urlHistory.value.slice(0, 50)
    }
    localStorage.setItem('kinesis-url-history', JSON.stringify(urlHistory.value))
}

// Save search to history
const saveSearchToHistory = (search) => {
    // Remove if exists (to move to front)
    searchHistory.value = searchHistory.value.filter(s => s !== search)
    searchHistory.value.unshift(search)
    
    if (searchHistory.value.length > 50) {
        searchHistory.value = searchHistory.value.slice(0, 50)
    }
    localStorage.setItem('kinesis-search-history', JSON.stringify(searchHistory.value))
}

// Get browser history (Chrome extension API if available)
const loadBrowserHistory = async () => {
    if (typeof chrome !== 'undefined' && chrome.history) {
        try {
            const results = await chrome.history.search({
                text: '',
                maxResults: 100,
                startTime: Date.now() - (7 * 24 * 60 * 60 * 1000) // Last 7 days
            })
            browserHistory.value = results.map(item => ({
                url: item.url,
                title: item.title,
                visitCount: item.visitCount,
                lastVisitTime: item.lastVisitTime
            }))
        } catch (error) {
            console.log('Browser history not available')
        }
    }
}

// Command Registry - Easy to extend!
const commands = ref([
    {
        id: 'nav-zen',
        name: 'Zen View',
        nameJP: '禅',
        description: 'Minimalist clock and quotes',
        icon: '🧘',
        category: 'Navigation',
        key: 'Z',
        keywords: ['zen', 'clock', 'home', 'time'],
        action: () => emit('navigate', 'zen')
    },
    {
        id: 'nav-market',
        name: 'Market View',
        nameJP: '市場',
        description: 'Cryptocurrency prices',
        icon: '📈',
        category: 'Trading',
        key: 'K',
        keywords: ['market', 'crypto', 'finance', 'ticker', 'bitcoin'],
        action: () => emit('navigate', 'market')
    },
    {
        id: 'nav-bookmarks',
        name: 'Bookmarks',
        nameJP: 'ブックマーク',
        description: 'Quick links and favorites',
        icon: '🔖',
        category: 'Navigation',
        key: 'B',
        keywords: ['bookmarks', 'links', 'favorites', 'sites'],
        action: () => emit('navigate', 'bookmarks')
    },
    {
        id: 'nav-journal',
        name: 'Trading Journal',
        nameJP: '取引記録',
        description: 'Trading analytics and history',
        icon: '📊',
        category: 'Trading',
        key: 'J',
        keywords: ['journal', 'trading', 'trades', 'analytics', 'binance', 'pnl'],
        action: () => emit('navigate', 'journal')
    },
    {
        id: 'nav-tasks',
        name: 'Task Management',
        nameJP: 'タスク管理',
        description: 'Manage your tasks and todos',
        icon: '✅',
        category: 'Productivity',
        key: 'T',
        keywords: ['tasks', 'todo', 'checklist', 'productivity', 'manage'],
        action: () => emit('navigate', 'tasks')
    },
    {
        id: 'nav-fundamentals',
        name: 'Fundamentals',
        nameJP: '基本分析',
        description: 'Crypto news, events, and sentiment',
        icon: '📰',
        category: 'Trading',
        key: 'F',
        keywords: ['fundamentals', 'news', 'events', 'calendar', 'fear', 'greed', 'analysis'],
        action: () => emit('navigate', 'fundamentals')
    },
    {
        id: 'nav-notes',
        name: 'Quick Notes',
        nameJP: 'メモ',
        description: 'Toggle notes sidebar',
        icon: '📝',
        category: 'Navigation',
        key: 'M',
        keywords: ['notes', 'memo', 'write'],
        action: () => emit('navigate', 'notes')
    },
    {
        id: 'settings-background',
        name: 'Background Settings',
        nameJP: '背景設定',
        description: 'Customize background appearance',
        icon: '🖼️',
        category: 'Settings',
        key: '',
        keywords: ['background', 'wallpaper', 'theme', 'customize'],
        action: () => emit('navigate', 'background-settings')
    },
    // Utility Commands
    {
        id: 'util-refresh',
        name: 'Refresh Data',
        nameJP: '更新',
        description: 'Reload market data',
        icon: '🔄',
        category: 'Utilities',
        key: '',
        keywords: ['refresh', 'reload', 'update'],
        action: () => window.location.reload()
    },
    {
        id: 'util-clear',
        name: 'Clear Cache',
        nameJP: 'クリア',
        description: 'Clear local storage',
        icon: '🗑️',
        category: 'Utilities',
        key: '',
        keywords: ['clear', 'cache', 'reset', 'delete'],
        action: async () => {
            const confirmed = await confirm(
                'This will delete all saved data including settings, links, notes, and trading journal. This action cannot be undone.',
                'Clear All Data',
                'データ削除'
            )

            if (confirmed) {
                localStorage.clear()
                await showSuccess('All data cleared successfully. Reloading...', 'Data Cleared', 'データ削除完了')
                setTimeout(() => {
                    window.location.reload()
                }, 1500)
            }
        }
    }
])

// Quick access commands (shown when not searching)
const quickAccessCommands = computed(() => {
    return commands.value.filter(cmd => cmd.key && cmd.category === 'Navigation')
})

// Filtered commands based on search
const filteredCommands = computed(() => {
    if (!searchQuery.value.trim()) {
        return commands.value
    }

    const query = searchQuery.value.toLowerCase().trim()
    return commands.value.filter(cmd => {
        return cmd.name.toLowerCase().includes(query) ||
            cmd.description.toLowerCase().includes(query) ||
            cmd.keywords.some(k => k.includes(query))
    })
})

// Group commands by category
const groupedCommands = computed(() => {
    const groups = {}
    filteredCommands.value.forEach(cmd => {
        if (!groups[cmd.category]) {
            groups[cmd.category] = []
        }
        groups[cmd.category].push(cmd)
    })
    return groups
})

// Get global index for a command (for keyboard navigation)
const getCommandGlobalIndex = (command) => {
    return filteredCommands.value.findIndex(cmd => cmd.id === command.id)
}

// Check if input is a URL
const isURL = (text) => {
    const query = text.trim()
    return /^(https?:\/\/)/.test(query) || 
           /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(query) ||
           query.includes('.com') || query.includes('.org') || 
           query.includes('.net') || query.includes('.io') ||
           query.includes('.co') || query.includes('.dev')
}

// Chrome-like autocomplete with history integration
const calculateAutocomplete = () => {
    if (!searchQuery.value || searchQuery.value.length < 1) {
        autocompleteSuggestion.value = ''
        return
    }

    const query = searchQuery.value.toLowerCase()

    // Priority 1: Command names (instant, highest priority)
    const matchingCommand = filteredCommands.value[0]
    if (matchingCommand && filteredCommands.value.length > 0) {
        const commandName = matchingCommand.name.toLowerCase()
        if (commandName.startsWith(query)) {
            autocompleteSuggestion.value = matchingCommand.name.substring(query.length)
            return
        }
    }

    // Priority 2: Browser history (most relevant - actual visited sites)
    if (browserHistory.value.length > 0) {
        // Sort by visit count and recency
        const sortedHistory = [...browserHistory.value].sort((a, b) => {
            return (b.visitCount * 10 + b.lastVisitTime / 1000000) - 
                   (a.visitCount * 10 + a.lastVisitTime / 1000000)
        })

        for (const item of sortedHistory) {
            try {
                const url = new URL(item.url)
                const domain = url.hostname.replace('www.', '')
                const fullUrl = url.hostname + url.pathname
                
                // Match against domain or full URL
                if (domain.startsWith(query) || fullUrl.startsWith(query)) {
                    autocompleteSuggestion.value = domain.substring(query.length)
                    return
                }

                // Match against title
                if (item.title && item.title.toLowerCase().includes(query)) {
                    autocompleteSuggestion.value = ' - ' + item.title.substring(0, 30)
                    return
                }
            } catch (e) {
                // Skip invalid URLs
            }
        }
    }

    // Priority 3: Local URL history
    const matchingUrl = urlHistory.value.find(url => 
        url.toLowerCase().startsWith(query)
    )
    if (matchingUrl) {
        autocompleteSuggestion.value = matchingUrl.substring(query.length)
        return
    }

    // Priority 4: Search history
    const matchingSearch = searchHistory.value.find(search =>
        search.toLowerCase().startsWith(query)
    )
    if (matchingSearch) {
        autocompleteSuggestion.value = matchingSearch.substring(query.length)
        return
    }

    // Priority 5: Common domains
    const commonDomains = [
        'google.com', 'youtube.com', 'github.com', 'twitter.com',
        'facebook.com', 'reddit.com', 'stackoverflow.com', 'medium.com',
        'linkedin.com', 'instagram.com', 'amazon.com', 'netflix.com',
        'wikipedia.org', 'gmail.com', 'drive.google.com', 'docs.google.com'
    ]
    
    const matchingDomain = commonDomains.find(domain => 
        domain.startsWith(query)
    )
    if (matchingDomain) {
        autocompleteSuggestion.value = matchingDomain.substring(query.length)
        return
    }

    autocompleteSuggestion.value = ''
}

// Generate history suggestions for dropdown
const generateHistorySuggestions = () => {
    if (!searchQuery.value) {
        historySuggestions.value = []
        return
    }

    const query = searchQuery.value.toLowerCase()
    const suggestions = []
    let id = 0

    // Browser history suggestions (top 5)
    if (browserHistory.value.length > 0) {
        const sortedHistory = [...browserHistory.value]
            .sort((a, b) => (b.visitCount * 10 + b.lastVisitTime / 1000000) - 
                           (a.visitCount * 10 + a.lastVisitTime / 1000000))
            .slice(0, 5)

        for (const item of sortedHistory) {
            try {
                const url = new URL(item.url)
                const domain = url.hostname.replace('www.', '')
                const fullUrl = url.hostname + url.pathname
                
                if (domain.includes(query) || fullUrl.includes(query) || 
                    (item.title && item.title.toLowerCase().includes(query))) {
                    suggestions.push({
                        id: id++,
                        type: 'browser-history',
                        title: item.title || domain,
                        subtitle: domain,
                        url: item.url,
                        meta: `${item.visitCount} visits`,
                        icon: Globe
                    })
                    if (suggestions.length >= 5) break
                }
            } catch (e) {
                // Skip invalid URLs
            }
        }
    }

    // URL history suggestions (top 3)
    urlHistory.value.slice(0, 5).forEach(url => {
        if (url.toLowerCase().includes(query)) {
            suggestions.push({
                id: id++,
                type: 'url-history',
                title: url,
                subtitle: 'Recent visit',
                url: url,
                meta: '',
                icon: Clock
            })
        }
    })

    // Search history suggestions (top 3)
    searchHistory.value.slice(0, 5).forEach(search => {
        if (search.toLowerCase().includes(query)) {
            suggestions.push({
                id: id++,
                type: 'search-history',
                title: search,
                subtitle: 'Google search',
                url: null,
                meta: '',
                icon: Search
            })
        }
    })

    // Limit to 8 total suggestions
    historySuggestions.value = suggestions.slice(0, 8)
}

// Select a history suggestion
const selectHistorySuggestion = (suggestion) => {
    if (suggestion.type === 'search-history') {
        // Perform Google search
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(suggestion.title)}`
    } else {
        // Navigate to URL
        let url = suggestion.url || suggestion.title
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url
        }
        window.location.href = url
    }
}

// Handle input change
const handleInput = () => {
    calculateAutocomplete()
    generateHistorySuggestions()
    selectedHistoryIndex.value = 0
}

// Execute command
const executeCommand = (command) => {
    command.action()
    searchQuery.value = ''
    isExpanded.value = false
    inputRef.value?.blur()

    // Animate feedback
    gsap.to('.command-palette', {
        scale: 0.99,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
    })
}

// Handle blur
const handleBlur = () => {
    setTimeout(() => {
        if (!searchQuery.value) {
            isExpanded.value = false
        }
    }, 200)
}

// Keyboard handling
const handleKeydown = (e) => {
    // Right Arrow or Tab - accept autocomplete
    if ((e.key === 'ArrowRight' || e.key === 'Tab') && autocompleteSuggestion.value) {
        e.preventDefault()
        searchQuery.value = searchQuery.value + autocompleteSuggestion.value
        autocompleteSuggestion.value = ''
        calculateAutocomplete()
        generateHistorySuggestions()
        return
    }

    // Escape - close
    if (e.key === 'Escape') {
        searchQuery.value = ''
        autocompleteSuggestion.value = ''
        historySuggestions.value = []
        isExpanded.value = false
        inputRef.value?.blur()
        return
    }

    // Arrow Down - navigate down
    if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (filteredCommands.value.length > 0) {
            selectedIndex.value = Math.min(selectedIndex.value + 1, filteredCommands.value.length - 1)
        } else if (historySuggestions.value.length > 0) {
            selectedHistoryIndex.value = Math.min(selectedHistoryIndex.value + 1, historySuggestions.value.length - 1)
        }
        return
    }

    // Arrow Up - navigate up
    if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (filteredCommands.value.length > 0) {
            selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
        } else if (historySuggestions.value.length > 0) {
            selectedHistoryIndex.value = Math.max(selectedHistoryIndex.value - 1, 0)
        }
        return
    }

    // Enter - execute selected command or search
    if (e.key === 'Enter') {
        if (filteredCommands.value.length > 0) {
            executeCommand(filteredCommands.value[selectedIndex.value])
        } else if (historySuggestions.value.length > 0 && selectedHistoryIndex.value < historySuggestions.value.length) {
            selectHistorySuggestion(historySuggestions.value[selectedHistoryIndex.value])
        } else if (searchQuery.value) {
            const query = searchQuery.value.trim()
            
            // Check if it's a URL or domain
            const isURLQuery = /^(https?:\/\/)/.test(query) || 
                         /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(query) ||
                         query.includes('.com') || query.includes('.org') || 
                         query.includes('.net') || query.includes('.io') ||
                         query.includes('.co') || query.includes('.dev')
            
            if (isURLQuery) {
                // Save to URL history
                saveUrlToHistory(query)
                
                // Navigate to the URL
                let url = query
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    url = 'https://' + url
                }
                window.location.href = url
            } else {
                // Save to search history
                saveSearchToHistory(query)
                
                // Search on Google
                window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`
            }
        }
        return
    }
}

// Global keyboard shortcut (Ctrl+K to focus)
const handleGlobalKeydown = (e) => {
    if (e.key === 'tab') {
        e.preventDefault()
        inputRef.value?.focus()
        isExpanded.value = true
    }
}

onMounted(() => {
    loadHistory()
    loadBrowserHistory()
    document.addEventListener('keydown', handleGlobalKeydown)

    nextTick(() => {
        // Animate palette in
        gsap.fromTo('.command-palette',
            {
                height: 0,
                opacity: 0,
                duration: 0.2,
                ease: 'power3.out',
                delay: 0.5
            },
            {
                height: "auto",
                opacity: 1,
                duration: 0.2,
                ease: 'power3.out',
                delay: 0.5
            })
        gsap.fromTo('.shortcut-group', {
            opacity: 0,
            y: -10,
            duration: 0.2,
            stagger: 0.1,
            ease: 'back.out(1.7)',
            delay: 1
        }, {
            opacity: 1,
            y: 0,
            duration: 0.2,
            stagger: 0.1,
            ease: 'back.out(1.7)',
            delay: 1
        })
    })
})

onUnmounted(() => {
    document.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<style scoped>
.command-palette {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    opacity: 1;
    background: rgba(245, 243, 240, 0.98);
    backdrop-filter: blur(20px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border-bottom: 1px solid rgba(45, 45, 45, 0.08);
    transition: all 0.3s var(--ease);
}

.command-palette.palette-expanded {
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
    background-color: white;
}

/* Vertical Japanese Label - 縦書き */
.tategaki-label {
    position: absolute;
    right: var(--space-8);
    top: 50%;
    transform: translateY(-50%);
    writing-mode: vertical-rl;
    text-orientation: upright;
    font-family: var(--font-serif);
    font-size: 0.75rem;
    font-weight: 400;
    letter-spacing: 0.3em;
    color: var(--accent);
    opacity: 0.6;
}

.palette-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: var(--space-6) var(--space-8);
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: var(--space-8);
}

/* Search Container */
.search-container {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--space-3);
}

.command-input {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--text-primary);
    font-family: var(--font-sans);
    font-size: 1.1rem;
    font-weight: 400;
    letter-spacing: 0.03em;
    padding: var(--space-3) 0;
    outline: none;
    transition: all 0.4s var(--ease);
    position: relative;
    z-index: 2;
}

/* Autocomplete Suggestion */
.autocomplete-suggestion {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.1rem;
    font-weight: 400;
    letter-spacing: 0.03em;
    padding: var(--space-3) 0;
    color: transparent;
    pointer-events: none;
    z-index: 1;
}

.suggestion-text {
    color: var(--text-muted);
    opacity: 0.4;
}

.command-input::placeholder {
    color: var(--text-muted);
    font-weight: 300;
    letter-spacing: 0.05em;
}

.command-input:focus {
    color: var(--text-primary);
}

.command-input:focus~.input-underline {
    transform: scaleX(1);
}

.search-hint {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    gap: var(--space-1);
    font-size: 0.75rem;
    color: var(--text-muted);
    opacity: 0.6;
}

.search-hint kbd {
    padding: 2px 6px;
    font-size: 0.7rem;
}

/* Animated Underline */
.input-underline {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg,
            transparent 0%,
            var(--accent) 20%,
            var(--accent) 80%,
            transparent 100%);
    transform: scaleX(0);
    transition: transform 0.4s var(--ease);
}

/* Quick Access Shortcuts */
.shortcuts {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    flex-wrap: nowrap;
    flex-shrink: 0;
}

.shortcut-group {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    cursor: pointer;
    transition: all 0.3s var(--ease);
}

.shortcut-group:hover {
    transform: translateY(-2px);
}

.shortcut-group:hover kbd {
    background: var(--accent);
    color: #ffffff;
    border-color: var(--accent);
}

.shortcut-group:hover .label-en {
    color: var(--accent);
}

.shortcut-label {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.label-en {
    font-family: var(--font-sans);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-secondary);
    letter-spacing: 0.03em;
    transition: all 0.3s var(--ease);
}

.label-jp {
    font-family: var(--font-serif);
    font-size: 0.65rem;
    font-weight: 400;
    color: var(--text-tertiary);
    letter-spacing: 0.1em;
}

/* Command Results Dropdown */
.command-results {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 var(--space-8) var(--space-6) var(--space-8);
    max-height: 400px;
    overflow-y: auto;
    animation: slideDown 0.3s var(--ease);
    background-color: white;
}

/* History Results Dropdown */
.history-results {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 var(--space-8) var(--space-6) var(--space-8);
    max-height: 400px;
    overflow-y: auto;
    animation: slideDown 0.3s var(--ease);
    background-color: white;
}

.history-category {
    margin-bottom: var(--space-4);
}

.history-item {
    display: grid;
    grid-template-columns: 36px 1fr auto;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s var(--ease);
    border: 1px solid transparent;
}

.history-item:hover,
.history-item.selected {
    background: rgba(99, 102, 241, 0.05);
    border-color: rgba(99, 102, 241, 0.2);
    transform: translateX(4px);
}

.history-icon {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    background: rgba(99, 102, 241, 0.08);
    color: var(--accent);
    flex-shrink: 0;
}

.history-item.selected .history-icon {
    background: var(--accent);
    color: white;
}

.history-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.history-title {
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.history-url {
    font-size: 0.8rem;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.history-meta {
    font-size: 0.75rem;
    color: var(--text-tertiary);
    flex-shrink: 0;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.command-category {
    margin-bottom: var(--space-6);
}

.category-title {
    font-family: var(--font-serif);
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.15em;
    color: var(--text-tertiary);
    margin-bottom: var(--space-3);
    padding: var(--space-2) 0;
    border-bottom: 1px solid var(--border-color);
}

.command-item {
    display: grid;
    grid-template-columns: 40px 1fr auto;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-4);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s var(--ease);
}

.command-item:hover,
.command-item.selected {
    background: var(--accent-dim);
    transform: translateX(4px);
}

.command-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    min-width: 32px;
}

.command-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.command-name {
    font-family: var(--font-sans);
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: var(--space-3);
}

.command-name-jp {
    font-family: var(--font-serif);
    font-size: 0.75rem;
    font-weight: 400;
    color: var(--text-tertiary);
}

.command-desc {
    font-size: 0.8rem;
    font-weight: 300;
    color: var(--text-muted);
}

.command-kbd {
    opacity: 0.7;
}

/* Empty State */
.empty-state {
    max-width: 1400px;
    margin: 0 auto;
    padding: var(--space-8);
    text-align: center;
    animation: fadeIn 0.3s var(--ease);
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.empty-icon {
    font-size: 3rem;
    margin-bottom: var(--space-4);
    opacity: 0.5;
}

.empty-text {
    font-family: var(--font-sans);
    font-size: 1rem;
    font-weight: 400;
    color: var(--text-secondary);
    margin-bottom: var(--space-2);
}

.empty-hint {
    font-size: 0.85rem;
    color: var(--text-muted);
}

/* kbd styling */
.kbd {
    --kbd-bg: #ede9e3;
    --kbd-text: #2d2d2d;
    --kbd-border: rgba(45, 45, 45, 0.15);
    --kbd-shadow: rgba(45, 45, 45, 0.1);

    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
    padding: 0 var(--space-3);
    font-family: var(--font-sans);
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1;
    text-align: center;
    letter-spacing: 0.05em;
    background: var(--kbd-bg);
    color: var(--kbd-text);
    border: 1px solid var(--kbd-border);
    border-radius: 3px;
    box-shadow: 0 2px 0 var(--kbd-shadow);
    transition: all 0.2s var(--ease);
}

/* Brush decoration */
.sumi-brush {
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg,
            transparent 0%,
            var(--accent) 10%,
            var(--text-primary) 50%,
            var(--accent) 90%,
            transparent 100%);
    opacity: 0.15;
    transform-origin: center;
    animation: brushStroke 4s ease-in-out infinite;
}

@keyframes brushStroke {

    0%,
    100% {
        opacity: 0.15;
        transform: scaleX(1);
    }

    50% {
        opacity: 0.25;
        transform: scaleX(0.99);
    }
}

/* Scrollbar */
.command-results::-webkit-scrollbar {
    width: 6px;
}

.command-results::-webkit-scrollbar-track {
    background: transparent;
}

.command-results::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 3px;
}

/* Responsive */
@media (max-width: 768px) {
    .palette-content {
        grid-template-columns: 1fr;
        padding: var(--space-6);
        gap: var(--space-4);
    }

    .shortcuts {
        display: none;
    }

    .command-results {
        padding: 0 var(--space-6) var(--space-6) var(--space-6);
    }

    .tategaki-label {
        right: var(--space-4);
    }
}
</style>
