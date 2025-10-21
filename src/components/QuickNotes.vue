<template>
    <transition name="slide">
        <div v-if="isVisible" class="quick-notes-sidebar">
            <div class="notes-panel">
                <!-- Header -->
                <div class="notes-header">
                    <div class="header-content">
                        <h3 class="notes-title">Quick Notes</h3>
                        <p class="notes-subtitle">クイックメモ</p>
                    </div>
                    <button class="close-btn" @click="handleClose">
                        <span class="close-icon">×</span>
                    </button>
                </div>

                <!-- Notes List -->
                <div class="notes-list">
                    <div v-for="(note, index) in notes" :key="note.id" class="note-item"
                        :style="{ '--note-index': index }">
                        <div class="note-bullet">•</div>
                        <input v-model="note.text" @input="saveNotes" @keydown.enter="addNote" class="note-input"
                            placeholder="Write a note..." />
                        <button class="delete-btn" @click="deleteNote(note.id)">×</button>
                    </div>
                </div>

                <!-- Add Note Button -->
                <button class="add-note-btn" @click="addNote">
                    <span class="add-icon">+</span>
                    <span>Add New Note</span>
                </button>

                <!-- Hint -->
                <div class="notes-hint">
                    <kbd>M</kbd>
                    <span>to toggle</span>
                    <span class="divider">·</span>
                    <kbd>Enter</kbd>
                    <span>new note</span>
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import gsap from 'gsap'

const props = defineProps({
    isVisible: Boolean
})

const notes = ref([])
let nextId = 1

const emit = defineEmits(['close'])

const handleClose = () => {
    emit('close')
}

const addNote = () => {
    notes.value.push({
        id: nextId++,
        text: '',
        timestamp: Date.now()
    })
    saveNotes()

    nextTick(() => {
        // Focus the new note
        const inputs = document.querySelectorAll('.note-input')
        inputs[inputs.length - 1]?.focus()

        // Animate new note
        gsap.from('.note-item:last-child', {
            x: 50,
            opacity: 0,
            duration: 0.4,
            ease: 'back.out(1.7)'
        })
    })
}

const deleteNote = (id) => {
    const index = notes.value.findIndex(n => n.id === id)
    if (index > -1) {
        const noteElement = document.querySelectorAll('.note-item')[index]
        gsap.to(noteElement, {
            x: 50,
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
                notes.value = notes.value.filter(n => n.id !== id)
                saveNotes()
            }
        })
    }
}

const saveNotes = () => {
    localStorage.setItem('zan-quick-notes', JSON.stringify(notes.value))
}

const loadNotes = () => {
    const saved = localStorage.getItem('zan-quick-notes')
    if (saved) {
        try {
            const parsed = JSON.parse(saved)
            notes.value = parsed
            nextId = Math.max(...parsed.map(n => n.id), 0) + 1
        } catch (e) {
            notes.value = []
        }
    }

    // Add default note if empty
    if (notes.value.length === 0) {
        addNote()
    }
}

// Animate when visible
watch(() => props.isVisible, (newVal) => {
    if (newVal) {
        nextTick(() => {
            gsap.from('.notes-panel', {
                x: 400,
                duration: 0.5,
                ease: 'power3.out'
            })

            gsap.from('.note-item', {
                x: 50,
                opacity: 0,
                duration: 0.4,
                stagger: 0.05,
                ease: 'back.out(1.7)',
                delay: 0.2
            })
        })
    }
})

onMounted(() => {
    loadNotes()
})
</script>

<style scoped>
.quick-notes-sidebar {
    position: fixed;
    top: 0;
    right: 0;
    width: 400px;
    height: 100vh;
    background: rgba(255, 255, 255, 0.98);
    border-left: 1px solid var(--border-color);
    z-index: 150;
    backdrop-filter: blur(20px);
    box-shadow: -4px 0 24px rgba(0, 0, 0, 0.05);
}

.notes-panel {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: var(--space-8);
}

.notes-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-8);
    padding-bottom: var(--space-6);
    border-bottom: 1px solid var(--border-color);
}

.header-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

.notes-title {
    font-size: 1.5rem;
    font-weight: 200;
    letter-spacing: 0.05em;
    color: var(--text-primary);
    margin: 0;
}

.notes-subtitle {
    font-family: var(--font-japanese);
    font-size: 0.75rem;
    font-weight: 200;
    letter-spacing: 0.15em;
    color: var(--text-muted);
    margin: 0;
}

.close-btn {
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
    padding: 0;
}

.close-btn:hover {
    border-color: var(--border-color-hover);
    transform: rotate(90deg);
}

.close-icon {
    font-size: 1.5rem;
    color: var(--text-secondary);
    line-height: 1;
}

.notes-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    margin-bottom: var(--space-6);
}

.note-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3);
    border-bottom: 1px solid var(--border-color);
    transition: background 0.2s var(--ease);
}

.note-item:hover {
    background: var(--accent-dim);
}

.note-item:hover .delete-btn {
    opacity: 1;
}

.note-bullet {
    font-size: 1.5rem;
    color: var(--text-muted);
    line-height: 1;
}

.note-input {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--text-primary);
    font-family: var(--font-latin);
    font-size: 0.95rem;
    font-weight: 300;
    line-height: 1.6;
    padding: var(--space-2) 0;
    outline: none;
}

.note-input::placeholder {
    color: var(--text-muted);
    font-family: var(--font-latin);
    font-weight: 300;
}

.delete-btn {
    width: 24px;
    height: 24px;
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-size: 1.25rem;
    cursor: pointer;
    opacity: 0;
    transition: all 0.2s var(--ease);
    padding: 0;
    line-height: 1;
}

.delete-btn:hover {
    color: var(--text-primary);
    transform: scale(1.2);
}

.add-note-btn {
    width: 100%;
    background: transparent;
    border: 1px dashed var(--border-color);
    color: var(--text-secondary);
    padding: var(--space-4);
    font-family: var(--font-latin);
    font-size: 0.875rem;
    font-weight: 300;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    transition: all 0.3s var(--ease);
}

.add-note-btn:hover {
    border-color: var(--border-color-hover);
    background: var(--accent-dim);
}

.add-icon {
    font-size: 1.25rem;
    transition: transform 0.3s var(--ease);
}

.add-note-btn:hover .add-icon {
    transform: rotate(90deg);
}

.notes-hint {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-top: var(--space-6);
    padding-top: var(--space-6);
    border-top: 1px solid var(--border-color);
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: var(--text-muted);
}

.notes-hint kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 var(--space-2);
    background: transparent;
    border: 1px solid var(--border-color);
    border-radius: 2px;
    font-size: 0.65rem;
    color: var(--text-secondary);
}

.divider {
    color: var(--text-muted);
}

/* Scrollbar */
.notes-list::-webkit-scrollbar {
    width: 4px;
}

.notes-list::-webkit-scrollbar-track {
    background: transparent;
}

.notes-list::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 2px;
}

/* Slide transition */
.slide-enter-active,
.slide-leave-active {
    transition: transform 0.4s var(--ease);
}

.slide-enter-from {
    transform: translateX(100%);
}

.slide-leave-to {
    transform: translateX(100%);
}

@media (max-width: 768px) {
    .quick-notes-sidebar {
        width: 100%;
    }
}
</style>
