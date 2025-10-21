<template>
    <div id="kinesis-app" :class="['app-container', currentView]">
        <!-- Custom Background Layer -->
        <div class="custom-background" ref="customBackgroundRef"></div>

        <!-- Page Loader -->
        <PageLoader @loaded="onPageLoaded" />

        <!-- Animated Background Layer -->
        <AnimatedBackground v-if="isPageLoaded" />

        <!-- Custom Cursor -->
        <CustomCursor v-if="isPageLoaded" />

        <!-- Persistent Command Palette -->
        <CommandPalette v-if="isPageLoaded" ref="commandPaletteRef" @navigate="handleNavigation" @search="handleSearch"
            :current-view="currentView" />

        <!-- View Container - GSAP controls all transitions here -->
        <div v-if="isPageLoaded" class="view-container" ref="viewContainerRef">
            <Transition :css="false" @before-enter="onBeforeEnter" @enter="onEnter" @leave="onLeave" mode="out-in">
                <component :is="currentViewComponent" :key="currentView" ref="viewRef" />
            </Transition>
        </div>

        <!-- Quick Notes Sidebar - Triggered by 'm' key -->
        <QuickNotes :is-visible="isNotesActive" @close="toggleNotes" />

        <!-- Background Settings Panel -->
        <BackgroundSettings :is-visible="isBackgroundSettingsActive" @close="toggleBackgroundSettings"
            @apply="applyBackground" />

        <!-- Large Vertical ZAN Branding -->
        <div v-if="isPageLoaded" class="zan-branding">ファウザン</div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import gsap from "gsap";
import CommandPalette from "./components/CommandPalette.vue";
import ZenView from "./components/ZenView.vue";
import MarketView from "./components/MarketView.vue";
import BookmarksView from "./components/BookmarksView.vue";
import QuickNotes from "./components/QuickNotes.vue";
import BackgroundSettings from "./components/BackgroundSettings.vue";
import AnimatedBackground from "./components/AnimatedBackground.vue";
import CustomCursor from "./components/CustomCursor.vue";
import PageLoader from "./components/PageLoader.vue";

// Page load state
const isPageLoaded = ref(false);

// View state management
const currentView = ref("zen"); // Default view: 'zen'
const viewRef = ref(null);

// Quick Notes state
const isNotesActive = ref(false);

// Background Settings state
const isBackgroundSettingsActive = ref(false);
const customBackgroundRef = ref(null);

/**
 * Page load complete handler
 */
const onPageLoaded = () => {
    isPageLoaded.value = true;
};

// Legacy refs (kept for compatibility)
const commandPaletteRef = ref(null);
const viewContainerRef = ref(null);

// Map view names to components
const viewComponents = {
    zen: ZenView,
    market: MarketView,
    bookmarks: BookmarksView,
};

const currentViewComponent = computed(() => viewComponents[currentView.value]);

// GSAP Timeline for orchestrated transitions
let transitionTimeline = null;

/**
 * Navigation Handler
 * Switches between views and triggers GSAP transition choreography
 */
const handleNavigation = (newView) => {
    // Handle special actions
    if (newView === 'notes') {
        toggleNotes();
        return;
    }

    if (newView === 'background-settings') {
        toggleBackgroundSettings();
        return;
    }

    if (newView === currentView.value) return;
    currentView.value = newView;

    // Save last view to localStorage
    localStorage.setItem("kinesis-last-view", newView);
};

/**
 * Search Handler
 * Pass-through to Brave Search
 */
const handleSearch = (query) => {
    window.location.href = `https://search.brave.com/search?q=${encodeURIComponent(
        query
    )}`;
};

/**
 * GSAP Transition Hooks
 * These are called by Vue's <Transition> component
 */

// Before the entering view is inserted into the DOM
const onBeforeEnter = (el) => {
    // Set initial state for entering view
    gsap.set(el, {
        opacity: 0,
        y: 30,
        scale: 0.98,
        filter: "blur(8px)",
    });
};

// Animate the entering view in
const onEnter = (el, done) => {
    // Create a GSAP timeline for the entering animation
    const tl = gsap.timeline({
        onComplete: done,
    });

    // Animate the entire view container first
    tl.to(el, {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.6,
        ease: "power3.out",
    });

    // Then animate internal elements with stagger (if they exist)
    // Each view component exposes elements via data attributes
    const staggerElements = el.querySelectorAll("[data-stagger]");
    if (staggerElements.length > 0) {
        gsap.set(staggerElements, { opacity: 0, y: 20 });
        tl.to(
            staggerElements,
            {
                opacity: 1,
                y: 0,
                duration: 0.4,
                stagger: 0.05,
                ease: "power2.out",
            },
            "-=0.3"
        ); // Overlap with previous animation
    }
};

// Animate the leaving view out
const onLeave = (el, done) => {
    // Create a GSAP timeline for the leaving animation
    const tl = gsap.timeline({
        onComplete: done,
    });

    // Animate internal elements out first (if they exist)
    const staggerElements = el.querySelectorAll("[data-stagger]");
    if (staggerElements.length > 0) {
        tl.to(staggerElements, {
            opacity: 0,
            y: -15,
            duration: 0.25,
            stagger: 0.03,
            ease: "power2.in",
        });
    }

    // Then animate the entire view container out
    tl.to(
        el,
        {
            opacity: 0,
            y: -30,
            scale: 0.98,
            filter: "blur(8px)",
            duration: 0.4,
            ease: "power3.in",
        },
        staggerElements.length > 0 ? "-=0.15" : "0"
    );
};

/**
 * Toggle Quick Notes Sidebar
 * Triggered by 'm' key
 */
const toggleNotes = () => {
    isNotesActive.value = !isNotesActive.value;
};

/**
 * Toggle Background Settings
 */
const toggleBackgroundSettings = () => {
    isBackgroundSettingsActive.value = !isBackgroundSettingsActive.value;
};

/**
 * Apply background settings
 */
const applyBackground = (settings) => {
    const bgLayer = customBackgroundRef.value;
    if (!bgLayer) return;

    // Reset previous styles
    bgLayer.style.backgroundImage = '';
    bgLayer.style.backgroundColor = '';
    bgLayer.style.backgroundSize = '';
    bgLayer.style.backgroundPosition = '';

    // Apply new background based on type
    if (settings.type === 'solid') {
        bgLayer.style.backgroundColor = settings.solidColor;
    } else if (settings.type === 'gradient') {
        bgLayer.style.backgroundImage = settings.gradient;
    } else if (settings.type === 'image' && settings.imageUrl) {
        bgLayer.style.backgroundImage = `url(${settings.imageUrl})`;
        bgLayer.style.backgroundSize = 'cover';
        bgLayer.style.backgroundPosition = 'center';
        bgLayer.style.backgroundRepeat = 'no-repeat';
    } else {
        // Default
        bgLayer.style.backgroundColor = '#f5f3f0';
    }

    // Apply opacity
    bgLayer.style.opacity = settings.opacity / 100;
};

/**
 * Global Keyboard Handler
 * Listens for M, K, B, Z and Escape keys
 */
const handleGlobalKeydown = (e) => {
    // Don't trigger if user is typing in an input/textarea
    const isInInput = ['INPUT', 'TEXTAREA'].includes(e.target.tagName);

    // 'm' key - Toggle notes sidebar
    if (e.key.toLowerCase() === 'm' && !isInInput) {
        e.preventDefault();
        toggleNotes();
    }

    // 'k' key - Navigate to Market view
    if (e.key.toLowerCase() === 'k' && !isInInput) {
        e.preventDefault();
        handleNavigation('market');
    }

    // 'b' key - Navigate to Bookmarks view
    if (e.key.toLowerCase() === 'b' && !isInInput) {
        e.preventDefault();
        handleNavigation('bookmarks');
    }

    // 'z' key - Navigate to Zen view
    if (e.key.toLowerCase() === 'z' && !isInInput) {
        e.preventDefault();
        handleNavigation('zen');
    }

    // Escape key - Close notes if active
    if (e.key === 'Escape' && isNotesActive.value) {
        e.preventDefault();
        toggleNotes();
    }

    // Escape key - Close background settings if active
    if (e.key === 'Escape' && isBackgroundSettingsActive.value) {
        e.preventDefault();
        toggleBackgroundSettings();
    }
};

// Restore last view and background on mount
onMounted(() => {
    const lastView = localStorage.getItem("kinesis-last-view");
    if (lastView && viewComponents[lastView]) {
        currentView.value = lastView;
    } else {
        // Default to zen if no valid saved view
        currentView.value = 'zen';
    }

    // Load and apply saved background
    const savedBackground = localStorage.getItem('zan-background-settings');
    if (savedBackground) {
        try {
            const settings = JSON.parse(savedBackground);
            nextTick(() => {
                applyBackground(settings);
            });
        } catch (e) {
            console.error('Failed to load background settings');
        }
    }

    // Add global keyboard listener
    document.addEventListener('keydown', handleGlobalKeydown);
});

// Cleanup on unmount
onUnmounted(() => {
    document.removeEventListener('keydown', handleGlobalKeydown);
});
</script>

<style scoped>
.app-container {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: transparent;
    color: var(--text-primary);
    position: relative;
}

/* Custom Background Layer - behind everything */
.custom-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #f5f3f0;
    z-index: -1;
    transition: all 0.5s ease;
}

.view-container {
    flex: 1;
    position: relative;
    overflow: hidden;
    /* Ensure proper layering for GSAP transitions */
    isolation: isolate;
}

/* Force GPU acceleration for smooth transitions */
.view-container>* {
    will-change: transform, opacity, filter;
    transform: translateZ(0);
    backface-visibility: hidden;
    perspective: 1000px;
}

/* Large Vertical ZAN Branding */
.zan-branding {
    position: fixed;
    bottom: var(--space-8);
    left: var(--space-8);
    font-family: var(--font-serif);
    font-size: 8rem;
    font-weight: 300;
    line-height: 0.85;
    letter-spacing: 0.1em;
    color: var(--text-primary);
    opacity: 0.08;
    writing-mode: vertical-rl;
    text-orientation: upright;
    pointer-events: none;
    z-index: 1;
    user-select: none;
}

@media (max-width: 768px) {
    .zan-branding {
        font-size: 8rem;
        bottom: var(--space-6);
        left: var(--space-6);
    }
}
</style>
