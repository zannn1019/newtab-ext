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
        <div v-if="isPageLoaded" class="zan-branding" ref="zanBrandingRef">
            <span v-for="(char, index) in brandingChars" :key="index" class="branding-char"
                :style="{ '--char-index': index }">
                {{ char }}
            </span>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import gsap from "gsap";
import CommandPalette from "./components/CommandPalette.vue";
import ZenView from "./components/ZenView.vue";
import MarketView from "./components/MarketView.vue";
import BookmarksView from "./components/BookmarksView.vue";
import JournalView from "./components/JournalView.vue";
import TaskView from "./components/TaskView.vue";
import FundamentalsView from "./components/FundamentalsView.vue";
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

// ZAN Branding
const zanBrandingRef = ref(null);
const brandingChars = ['フ', 'ァ', 'ウ', 'ザ', 'ン'];

/**
 * Page load complete handler
 */
const onPageLoaded = () => {
    isPageLoaded.value = true;

    // Trigger branding animation after page loads
    nextTick(() => {
        animateBranding();
    });
};

/**
 * Animate ZAN Branding with mind-blowing effects
 */
const animateBranding = () => {
    const chars = document.querySelectorAll('.branding-char');
    if (chars.length === 0) return;

    const tl = gsap.timeline();

    // Initial state - characters from left, invisible
    gsap.set(chars, {
        x: -150,
        opacity: 0,
        rotationY: -90,
        scale: 0.5,
        filter: 'blur(20px)',
    });

    // Staggered slide in animation (faster)
    tl.to(chars, {
        x: 0,
        opacity: 0.12,
        rotationY: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: 0.8,
        stagger: {
            each: 0.08,
            ease: 'power4.out',
        },
        ease: 'expo.out',
    });

    // Add floating animation loop (faster) - horizontal movement
    chars.forEach((char, index) => {
        gsap.to(char, {
            x: 10,
            duration: 2 + index * 0.15,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: index * 0.08,
        });
    });

    // Add subtle glow pulse (faster)
    gsap.to(chars, {
        textShadow: '0 0 30px rgba(139, 92, 246, 0.3), 0 0 60px rgba(99, 102, 241, 0.2)',
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: 0.1,
    });
};

/**
 * Mouse parallax effect for branding
 */
let mouseX = 0;
let mouseY = 0;

const handleMouseMove = (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 15;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 15;

    const chars = document.querySelectorAll('.branding-char');
    chars.forEach((char, index) => {
        gsap.to(char, {
            x: mouseX * (1 + index * 0.15),
            y: mouseY * (1 + index * 0.15),
            duration: 0.8,
            ease: 'power2.out',
        });
    });
};

// Legacy refs (kept for compatibility)
const commandPaletteRef = ref(null);
const viewContainerRef = ref(null);

// Map view names to components
const viewComponents = {
    zen: ZenView,
    market: MarketView,
    bookmarks: BookmarksView,
    journal: JournalView,
    tasks: TaskView,
    fundamentals: FundamentalsView,
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
    if (!bgLayer) {
        console.warn('Background layer not found');
        return;
    }

    console.log('Applying background settings:', settings);

    // Reset previous styles
    bgLayer.style.backgroundImage = '';
    bgLayer.style.backgroundColor = '';
    bgLayer.style.backgroundSize = '';
    bgLayer.style.backgroundPosition = '';
    bgLayer.style.backgroundRepeat = '';

    // Apply new background based on type
    if (settings.type === 'solid') {
        bgLayer.style.backgroundColor = settings.solidColor;
        console.log('Applied solid color:', settings.solidColor);
    } else if (settings.type === 'gradient') {
        bgLayer.style.backgroundImage = settings.gradient;
        console.log('Applied gradient:', settings.gradient);
    } else if (settings.type === 'image' && settings.imageUrl) {
        bgLayer.style.backgroundImage = `url(${settings.imageUrl})`;
        bgLayer.style.backgroundSize = 'cover';
        bgLayer.style.backgroundPosition = 'center';
        bgLayer.style.backgroundRepeat = 'no-repeat';
        console.log('Applied image background');
    } else {
        // Default
        bgLayer.style.backgroundColor = '#f5f3f0';
        console.log('Applied default background');
    }

    // Apply opacity
    bgLayer.style.opacity = settings.opacity / 100;
    console.log('Applied opacity:', settings.opacity / 100);
};

/**
 * Global Keyboard Handler
 * Listens for M, K, B, J, Z, T, F and Escape keys
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

    // 'j' key - Navigate to Journal view
    if (e.key.toLowerCase() === 'j' && !isInInput) {
        e.preventDefault();
        handleNavigation('journal');
    }

    // 't' key - Navigate to Tasks view
    if (e.key.toLowerCase() === 't' && !isInInput) {
        e.preventDefault();
        handleNavigation('tasks');
    }

    // 'f' key - Navigate to Fundamentals view
    if (e.key.toLowerCase() === 'f' && !isInInput) {
        e.preventDefault();
        handleNavigation('fundamentals');
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

    // Add global keyboard listener
    document.addEventListener('keydown', handleGlobalKeydown);

    // Add mouse move listener for parallax
    document.addEventListener('mousemove', handleMouseMove);

    // Load and apply saved background after refs are ready
    nextTick(() => {
        const savedBackground = localStorage.getItem('zan-background-settings');
        if (savedBackground) {
            try {
                const settings = JSON.parse(savedBackground);
                setTimeout(() => {
                    applyBackground(settings);
                }, 100);
            } catch (e) {
                console.error('Failed to load background settings');
            }
        }
    });
});

// Cleanup on unmount
onUnmounted(() => {
    document.removeEventListener('keydown', handleGlobalKeydown);
    document.removeEventListener('mousemove', handleMouseMove);
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
    line-height: 1.1;
        letter-spacing: 0;
    color: var(--text-primary);
    pointer-events: none;
    z-index: 1;
    user-select: none;
    display: flex;
    flex-direction: column;
    gap: 0;
    perspective: 1000px;
    transform-style: preserve-3d;
}

.branding-char {
    display: inline-block;
    opacity: 0.08;
    transition: opacity 0.3s ease;
    will-change: transform, opacity, filter;
    transform-origin: center center;
    position: relative;
}

/* Hover effect on branding */
.zan-branding:hover .branding-char {
    opacity: 0.2;
}

/* Gradient text effect */
.branding-char::before {
    content: attr(data-char);
    position: absolute;
    top: 0;
    left: 0;
    background: linear-gradient(180deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.zan-branding:hover .branding-char::before {
    opacity: 0.3;
}

/* Glass morphism backdrop */
.branding-char::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 120%;
    height: 120%;
    background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.5s ease;
    z-index: -1;
}

.zan-branding:hover .branding-char::after {
    opacity: 1;
}

/* Individual character animation delays */
.branding-char:nth-child(1) {
    animation-delay: 0s;
}

.branding-char:nth-child(2) {
    animation-delay: 0.15s;
}

.branding-char:nth-child(3) {
    animation-delay: 0.3s;
}

.branding-char:nth-child(4) {
    animation-delay: 0.45s;
}

.branding-char:nth-child(5) {
    animation-delay: 0.6s;
}

@media (max-width: 768px) {
    .zan-branding {
        font-size: 6rem;
        bottom: var(--space-6);
        left: var(--space-6);
    }
}
</style>
