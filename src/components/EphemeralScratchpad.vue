<template>
    <div class="ephemeral-scratchpad" @click.self="handleClose">
        <div class="scratchpad-panel">
            <!-- Header with close button -->
            <div class="scratchpad-header">
                <div class="header-content">
                    <h3 class="scratchpad-title">Ephemeral Scratchpad</h3>
                    <p class="scratchpad-subtitle">一時的なメモ</p>
                </div>
                <button class="close-btn" @click="handleClose">
                    <span class="close-line"></span>
                    <span class="close-line"></span>
                </button>
            </div>

            <!-- Textarea -->
            <textarea ref="textareaRef" v-model="scratchpadText" @input="handleInput" class="scratchpad-textarea"
                placeholder="思考を素早く記録する..." spellcheck="false"></textarea>

            <!-- Metadata -->
            <div class="scratchpad-metadata">
                <div class="meta-group">
                    <span class="meta-label">文字</span>
                    <span class="meta-value">{{ charCount }}</span>
                </div>
                <div class="meta-group">
                    <span class="meta-label">行</span>
                    <span class="meta-value">{{ lineCount }}</span>
                </div>
                <div class="meta-hint">
                    <kbd>Tab</kbd>
                    <span>or</span>
                    <kbd>N</kbd>
                    <span>to close</span>
                </div>
            </div>

            <!-- Decorative elements -->
            <div class="panel-corner panel-corner-tl"></div>
            <div class="panel-corner panel-corner-tr"></div>
            <div class="panel-corner panel-corner-bl"></div>
            <div class="panel-corner panel-corner-br"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import gsap from 'gsap'

const textareaRef = ref(null)
const scratchpadText = ref('')

const charCount = computed(() => scratchpadText.value.length)
const lineCount = computed(() => scratchpadText.value.split('\n').length)

const emit = defineEmits(['close'])

const handleClose = () => {
    emit('close')
}

const handleInput = () => {
    // Instant save
    localStorage.setItem('zan-scratchpad', scratchpadText.value)
}

// Expose focus method for parent
const focusTextarea = () => {
    nextTick(() => {
        textareaRef.value?.focus()
    })
}

defineExpose({ focusTextarea })

// Load saved text on mount
onMounted(() => {
    const saved = localStorage.getItem('zan-scratchpad')
    if (saved) {
        scratchpadText.value = saved
    }

    nextTick(() => {
        // Animate panel in
        gsap.from('.scratchpad-panel', {
            scale: 0.9,
            opacity: 0,
            y: 50,
            duration: 0.5,
            ease: 'back.out(1.7)'
        })

        // Animate corners
        gsap.from('.panel-corner', {
            scale: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'back.out(2)',
            delay: 0.3
        })

        // Pulse corners
        gsap.to('.panel-corner', {
            opacity: 0.6,
            duration: 1.5,
            stagger: 0.1,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true
        })
    })
})
</script>

<style scoped>
.ephemeral-scratchpad {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(40px);
    padding: var(--space-8);
}

.scratchpad-panel {
    width: 100%;
    max-width: 800px;
    max-height: 80vh;
    background: rgba(0, 0, 0, 0.95);
    border: var(--border);
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
}

.scratchpad-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: var(--space-8);
    border-bottom: var(--border);
}

.header-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

.scratchpad-title {
    font-size: 1.25rem;
    font-weight: 200;
    letter-spacing: 0.05em;
    color: var(--white);
    margin: 0;
}

.scratchpad-subtitle {
    font-family: var(--font-japanese);
    font-size: 0.75rem;
    font-weight: 200;
    letter-spacing: 0.15em;
    color: var(--white-40);
    margin: 0;
}

.close-btn {
    width: 40px;
    height: 40px;
    background: transparent;
    border: var(--border);
    cursor: pointer;
    position: relative;
    transition: all 0.3s var(--ease);
    padding: 0;
}

.close-btn:hover {
    border-color: var(--white-40);
    transform: rotate(90deg);
}

.close-line {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 16px;
    height: 1px;
    background: var(--white-60);
    transition: background 0.3s var(--ease);
}

.close-line:nth-child(1) {
    transform: translate(-50%, -50%) rotate(45deg);
}

.close-line:nth-child(2) {
    transform: translate(-50%, -50%) rotate(-45deg);
}

.close-btn:hover .close-line {
    background: var(--white);
}

.scratchpad-textarea {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--white-80);
    font-family: var(--font-latin);
    font-size: 1.125rem;
    font-weight: 200;
    line-height: 2;
    letter-spacing: 0.01em;
    padding: var(--space-8);
    outline: none;
    resize: none;
}

.scratchpad-textarea::placeholder {
    color: var(--white-40);
    font-family: var(--font-japanese);
    font-weight: 100;
    letter-spacing: 0.1em;
}

.scratchpad-metadata {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-6) var(--space-8);
    border-top: var(--border);
}

.meta-group {
    display: flex;
    align-items: center;
    gap: var(--space-3);
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
    font-size: 0.75rem;
    color: var(--white-60);
    letter-spacing: 0.05em;
}

.meta-hint {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: var(--white-40);
}

.meta-hint kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 var(--space-2);
    background: transparent;
    border: var(--border);
    border-radius: 2px;
    font-size: 0.65rem;
    color: var(--white-60);
}

/* Decorative corners */
.panel-corner {
    position: absolute;
    width: 20px;
    height: 20px;
    pointer-events: none;
    opacity: 0.3;
}

.panel-corner::before,
.panel-corner::after {
    content: '';
    position: absolute;
    background: var(--white);
}

.panel-corner::before {
    width: 100%;
    height: 1px;
}

.panel-corner::after {
    width: 1px;
    height: 100%;
}

.panel-corner-tl {
    top: var(--space-4);
    left: var(--space-4);
}

.panel-corner-tl::before {
    top: 0;
    left: 0;
}

.panel-corner-tl::after {
    top: 0;
    left: 0;
}

.panel-corner-tr {
    top: var(--space-4);
    right: var(--space-4);
}

.panel-corner-tr::before {
    top: 0;
    right: 0;
}

.panel-corner-tr::after {
    top: 0;
    right: 0;
}

.panel-corner-bl {
    bottom: var(--space-4);
    left: var(--space-4);
}

.panel-corner-bl::before {
    bottom: 0;
    left: 0;
}

.panel-corner-bl::after {
    bottom: 0;
    left: 0;
}

.panel-corner-br {
    bottom: var(--space-4);
    right: var(--space-4);
}

.panel-corner-br::before {
    bottom: 0;
    right: 0;
}

.panel-corner-br::after {
    bottom: 0;
    right: 0;
}

/* Scrollbar */
.scratchpad-textarea::-webkit-scrollbar {
    width: 4px;
}

.scratchpad-textarea::-webkit-scrollbar-track {
    background: transparent;
}

.scratchpad-textarea::-webkit-scrollbar-thumb {
    background: var(--white-20);
    border-radius: 2px;
}
</style>
