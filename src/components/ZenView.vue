<template>
    <div class="zen-view">
        <!-- Japanese decoration -->
        <div class="japanese-label">禅の時間</div>

        <div class="zen-container">
            <!-- Animated clock -->
            <div class="clock-display">
                <div class="time-wrapper">
                    <span v-for="(char, index) in timeChars" :key="`time-${index}`" class="time-char"
                        :style="{ '--char-index': index }">
                        {{ char }}
                    </span>
                </div>
                <div class="date-display">{{ currentDate }}</div>
                <div class="date-japanese">{{ japaneseDate }}</div>
            </div>

            <!-- Zen quote with reveal animation -->
            <div class="quote-container" v-if="currentQuote">
                <p class="quote-text">{{ currentQuote.text }}</p>
                <p class="quote-japanese">{{ currentQuote.japanese }}</p>
            </div>
        </div>

        <!-- Ambient decorative grid -->
        <div class="zen-grid">
            <div class="grid-line" v-for="i in 20" :key="`line-${i}`" :style="{ '--line-index': i }"></div>
        </div>

        <!-- Breathing circle decoration -->
        <div class="breathing-circle"></div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import gsap from 'gsap'

const currentTime = ref('')
const currentDate = ref('')
const japaneseDate = ref('')
const currentQuote = ref(null)

const timeChars = computed(() => currentTime.value.split(''))

const zenQuotes = [
    {
        text: 'The quieter you become, the more you can hear.',
        japanese: '静かになればなるほど、もっと聞こえる'
    },
    {
        text: 'Be present in all things and thankful for all things.',
        japanese: 'すべてのことに存在し、すべてのことに感謝する'
    },
    {
        text: 'In the midst of movement and chaos, keep stillness inside of you.',
        japanese: '動きと混沌の中で、内なる静けさを保つ'
    },
    {
        text: 'Simplicity is the ultimate sophistication.',
        japanese: 'シンプルさは究極の洗練である'
    },
    {
        text: 'The obstacle is the path.',
        japanese: '障害こそが道である'
    }
]

const updateTime = () => {
    const now = new Date()

    // Format time
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    currentTime.value = `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`

    // Format date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    currentDate.value = now.toLocaleDateString('en-US', options)

    // Japanese date
    const jpOptions = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }
    japaneseDate.value = now.toLocaleDateString('ja-JP', jpOptions)
}

const selectRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * zenQuotes.length)
    currentQuote.value = zenQuotes[randomIndex]
}

let timeInterval
onMounted(() => {
    updateTime()
    selectRandomQuote()

    // Update time every second
    timeInterval = setInterval(updateTime, 1000)

    // Change quote every 15 seconds
    setInterval(selectRandomQuote, 15000)

    nextTick(() => {
        // Animate time characters individually
        gsap.from('.time-char', {
            y: 50,
            opacity: 0,
            stagger: 0.05,
            duration: 1,
            ease: 'power3.out',
            delay: 0.3
        })

        // Animate dates
        gsap.from('.date-display, .date-japanese', {
            y: 20,
            opacity: 0,
            stagger: 0.2,
            duration: 0.8,
            ease: 'power2.out',
            delay: 0.8
        })

        // Animate quote
        gsap.from('.quote-container', {
            y: 30,
            opacity: 0,
            duration: 1,
            ease: 'power2.out',
            delay: 1.2
        })

        // Animate grid lines
        gsap.from('.grid-line', {
            scaleY: 0,
            opacity: 0,
            stagger: 0.02,
            duration: 0.8,
            ease: 'power2.out',
            delay: 0.5
        })

        // Breathing circle animation
        gsap.to('.breathing-circle', {
            scale: 1.2,
            opacity: 0.15,
            duration: 4,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true
        })
    })
})

onUnmounted(() => {
    clearInterval(timeInterval)
})
</script>

<style scoped>
.zen-view {
    width: 100%;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    background: transparent;
    padding-top: 120px;
}

.japanese-label {
    position: absolute;
    top: calc(120px + var(--space-8));
    left: var(--space-8);
    font-family: var(--font-serif);
    font-size: 0.875rem;
    font-weight: 400;
    letter-spacing: 0.3em;
    color: var(--accent);
    z-index: 1;
    opacity: 0.6;
}

.zen-container {
    max-width: 1000px;
    width: 90%;
    text-align: center;
    z-index: 2;
    position: relative;
}

.clock-display {
    margin-bottom: var(--space-16);
}

.time-wrapper {
    display: inline-flex;
    gap: var(--space-2);
    margin-bottom: var(--space-6);
}

.time-char {
    font-family: var(--font-serif);
    font-size: 8rem;
    font-weight: 300;
    letter-spacing: 0.02em;
    color: var(--text-primary);
    line-height: 1;
    opacity: 1;
}

.date-display {
    font-family: var(--font-sans);
    font-size: 1.25rem;
    font-weight: 400;
    letter-spacing: 0.08em;
    color: var(--text-secondary);
    margin-bottom: var(--space-3);
}

.date-japanese {
    font-family: var(--font-serif);
    font-size: 0.875rem;
    font-weight: 300;
    letter-spacing: 0.2em;
    color: var(--text-tertiary);
}

.quote-container {
    max-width: 700px;
    margin: 0 auto;
    padding: var(--space-8) var(--space-4);
    border-top: 1px solid var(--border-color);
    border-bottom: 1px solid var(--border-color);
}

.quote-text {
    font-family: var(--font-sans);
    font-size: 1.5rem;
    font-weight: 400;
    line-height: 1.9;
    color: var(--text-secondary);
    margin-bottom: var(--space-4);
    letter-spacing: 0.02em;
}

.quote-japanese {
    font-family: var(--font-serif);
    font-size: 0.875rem;
    font-weight: 300;
    letter-spacing: 0.15em;
    color: var(--text-tertiary);
    margin: 0;
}

/* Ambient grid background */
.zen-grid {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: space-around;
    z-index: 0;
    opacity: 0.08;
}

.grid-line {
    width: 1px;
    height: 100%;
    background: linear-gradient(to bottom,
            transparent 0%,
            var(--accent) 20%,
            var(--accent) 80%,
            transparent 100%);
    transform-origin: top;
}

/* Breathing circle */
.breathing-circle {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 800px;
    height: 800px;
    margin-left: -400px;
    margin-top: -400px;
    border: 1px solid var(--accent);
    border-radius: 50%;
    z-index: 1;
    opacity: 0.06;
}

/* Responsive */
@media (max-width: 768px) {
    .time-char {
        font-size: 6rem;
    }

    .date-display {
        font-size: 1.1rem;
    }

    .date-japanese {
        font-size: 0.8rem;
    }

    .quote-text {
        font-size: 1.25rem;
    }

    .quote-japanese {
        font-size: 0.8rem;
    }
}
</style>
