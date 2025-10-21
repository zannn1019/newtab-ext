<template>
    <div class="focus-view">
        <!-- Japanese decoration -->
        <div class="japanese-label">今日の焦点</div>

        <div class="focus-container">
            <!-- Animated title with character split -->
            <h2 class="focus-title">
                <span v-for="(char, index) in titleChars" :key="index" class="char" :style="{ '--char-index': index }">
                    {{ char }}
                </span>
            </h2>

            <!-- Elegant textarea with breathing animation -->
            <div class="textarea-wrapper">
                <textarea ref="textareaRef" v-model="focusText" @input="handleInput" @focus="handleFocus"
                    @blur="handleBlur" class="focus-textarea" placeholder="何が一番大切か..."></textarea>

                <!-- Subtle line decoration -->
                <div class="line-decoration"></div>
            </div>

            <!-- Metadata with Japanese labels -->
            <div class="focus-metadata">
                <div class="meta-item">
                    <span class="meta-label">文字数</span>
                    <span class="meta-value">{{ charCount }}</span>
                </div>
                <div class="meta-item" v-if="lastEdited">
                    <span class="meta-label">更新</span>
                    <span class="meta-value">{{ lastEdited }}</span>
                </div>
            </div>
        </div>

        <!-- Ambient decorative elements -->
        <div class="ambient-circle"></div>
        <div class="ambient-line-v"></div>
        <div class="ambient-line-h"></div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import gsap from 'gsap'

const textareaRef = ref(null)
const focusText = ref('')
const lastEdited = ref('')
const isFocused = ref(false)

const titleChars = 'Today\'s Focus'.split('')
const charCount = computed(() => focusText.value.length)

let saveTimeout = null

const handleInput = () => {
    clearTimeout(saveTimeout)
    saveTimeout = setTimeout(() => {
        localStorage.setItem('zan-focus-text', focusText.value)
        localStorage.setItem('zan-focus-edited', new Date().toISOString())
        updateLastEdited()
    }, 500)
}

const handleFocus = () => {
    isFocused.value = true
    gsap.to('.textarea-wrapper', {
        scale: 1.01,
        duration: 0.6,
        ease: 'power2.out'
    })
    gsap.to('.line-decoration', {
        scaleX: 1,
        duration: 0.8,
        ease: 'power3.out'
    })
}

const handleBlur = () => {
    isFocused.value = false
    gsap.to('.textarea-wrapper', {
        scale: 1,
        duration: 0.6,
        ease: 'power2.out'
    })
}

const updateLastEdited = () => {
    const savedTime = localStorage.getItem('zan-focus-edited')
    if (savedTime) {
        const date = new Date(savedTime)
        lastEdited.value = date.toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }
}

onMounted(() => {
    // Load saved data
    const savedText = localStorage.getItem('zan-focus-text')
    if (savedText) {
        focusText.value = savedText
    }
    updateLastEdited()

    nextTick(() => {
        // Animate title characters
        gsap.from('.char', {
            opacity: 0,
            y: 20,
            rotationX: -90,
            duration: 0.8,
            stagger: 0.05,
            ease: 'back.out(1.7)',
            delay: 0.2
        })

        // Animate container
        gsap.from('.focus-container', {
            opacity: 0,
            y: 40,
            duration: 1,
            ease: 'power3.out'
        })

        // Animate decorative elements
        gsap.from('.ambient-circle', {
            scale: 0,
            opacity: 0,
            duration: 2,
            ease: 'power2.out',
            delay: 0.5
        })

        gsap.from(['.ambient-line-v', '.ambient-line-h'], {
            scaleY: 0,
            scaleX: 0,
            duration: 1.5,
            ease: 'power3.out',
            stagger: 0.2,
            delay: 0.8
        })

        // Breathing animation for ambient circle
        gsap.to('.ambient-circle', {
            scale: 1.2,
            opacity: 0.3,
            duration: 4,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true
        })

        // Auto-focus textarea
        setTimeout(() => {
            textareaRef.value?.focus()
        }, 1000)
    })
})
</script>

<style scoped>
.focus-view {
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-16);
    position: relative;
    overflow: hidden;
}

.japanese-label {
    position: absolute;
    top: var(--space-16);
    left: 50%;
    transform: translateX(-50%);
    font-family: var(--font-japanese);
    font-size: 0.75rem;
    letter-spacing: 0.3em;
    color: var(--white-40);
    font-weight: 200;
}

.focus-container {
    width: 100%;
    max-width: 800px;
    display: flex;
    flex-direction: column;
    gap: var(--space-12);
    z-index: 1;
}

.focus-title {
    font-size: 2.5rem;
    font-weight: 100;
    text-align: center;
    letter-spacing: 0.15em;
    color: var(--white);
    margin: 0;
    text-transform: uppercase;
    perspective: 1000px;
}

.char {
    display: inline-block;
    transform-origin: center;
}

.textarea-wrapper {
    position: relative;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.focus-textarea {
    width: 100%;
    min-height: 400px;
    background: transparent;
    border: none;
    border-top: var(--border);
    border-bottom: var(--border);
    color: var(--white-80);
    font-family: var(--font-latin);
    font-size: 1.25rem;
    font-weight: 200;
    line-height: 2.2;
    letter-spacing: 0.02em;
    padding: var(--space-12) var(--space-4);
    outline: none;
    resize: none;
    transition: all 0.4s var(--ease);
}

.focus-textarea::placeholder {
    color: var(--white-40);
    font-family: var(--font-japanese);
    font-weight: 100;
    letter-spacing: 0.1em;
}

.focus-textarea:focus {
    color: var(--white-95);
}

.line-decoration {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--white) 50%, transparent);
    transform: scaleX(0);
    transform-origin: center;
}

.focus-metadata {
    display: flex;
    justify-content: space-between;
    gap: var(--space-8);
}

.meta-item {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

.meta-label {
    font-family: var(--font-japanese);
    font-size: 0.7rem;
    color: var(--white-40);
    letter-spacing: 0.15em;
    font-weight: 200;
}

.meta-value {
    font-family: var(--font-mono);
    font-size: 0.875rem;
    color: var(--white-60);
    letter-spacing: 0.05em;
}

/* Ambient decorative elements */
.ambient-circle {
    position: absolute;
    top: 10%;
    right: 15%;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    border: 1px solid var(--white-05);
    opacity: 0.2;
    pointer-events: none;
}

.ambient-line-v {
    position: absolute;
    left: 20%;
    top: 0;
    width: 1px;
    height: 100%;
    background: linear-gradient(to bottom, transparent, var(--white-05) 50%, transparent);
    pointer-events: none;
}

.ambient-line-h {
    position: absolute;
    top: 30%;
    left: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(to right, transparent, var(--white-05) 50%, transparent);
    pointer-events: none;
}

/* Scrollbar */
.focus-textarea::-webkit-scrollbar {
    width: 4px;
}

.focus-textarea::-webkit-scrollbar-track {
    background: transparent;
}

.focus-textarea::-webkit-scrollbar-thumb {
    background: var(--white-20);
    border-radius: 2px;
}
</style>
