<template>
    <div v-if="isVisible" class="settings-overlay" @click="$emit('close')">
        <div class="settings-panel" @click.stop>
            <div class="settings-header">
                <h3 class="settings-title">Background</h3>
                <p class="settings-subtitle">背景カスタマイズ</p>
                <button class="close-btn" @click="$emit('close')">×</button>
            </div>

            <div class="settings-content">
                <!-- Background Type Selector -->
                <div class="setting-group">
                    <label class="setting-label">Background Type</label>
                    <div class="type-selector">
                        <button v-for="type in backgroundTypes" :key="type.id" class="type-btn"
                            :class="{ active: currentSettings.type === type.id }" @click="selectType(type.id)">
                            <span class="type-icon">{{ type.icon }}</span>
                            <span class="type-name">{{ type.name }}</span>
                        </button>
                    </div>
                </div>

                <!-- Solid Color -->
                <div v-if="currentSettings.type === 'solid'" class="setting-group">
                    <label class="setting-label">Preset Colors</label>
                    <div class="color-presets">
                        <button v-for="preset in colorPresets" :key="preset.name" class="color-preset"
                            :style="{ background: preset.color }"
                            :class="{ active: currentSettings.solidColor === preset.color }"
                            @click="currentSettings.solidColor = preset.color" :title="preset.name">
                        </button>
                    </div>
                    <div class="custom-color-input">
                        <label>Custom Color</label>
                        <input type="color" v-model="currentSettings.solidColor" />
                    </div>
                </div>

                <!-- Gradient -->
                <div v-if="currentSettings.type === 'gradient'" class="setting-group">
                    <label class="setting-label">Gradient Presets</label>
                    <div class="gradient-presets">
                        <button v-for="preset in gradientPresets" :key="preset.name" class="gradient-preset"
                            :style="{ background: preset.gradient }"
                            :class="{ active: currentSettings.gradient === preset.gradient }"
                            @click="currentSettings.gradient = preset.gradient" :title="preset.name">
                        </button>
                    </div>
                </div>

                <!-- Image Upload -->
                <div v-if="currentSettings.type === 'image'" class="setting-group">
                    <label class="setting-label">Upload Image</label>
                    <div class="image-upload">
                        <input type="file" ref="fileInput" accept="image/*" @change="handleImageUpload"
                            style="display: none" />
                        <button class="upload-btn" @click="$refs.fileInput.click()">
                            <span class="upload-icon">📷</span>
                            <span>Choose Image</span>
                        </button>
                        <button v-if="currentSettings.imageUrl" class="remove-btn" @click="removeImage">
                            Remove Image
                        </button>
                    </div>
                    <div v-if="currentSettings.imageUrl" class="image-preview">
                        <img :src="currentSettings.imageUrl" alt="Background preview" />
                    </div>
                </div>

                <!-- Opacity Control -->
                <div class="setting-group">
                    <label class="setting-label">Opacity: {{ currentSettings.opacity }}%</label>
                    <input type="range" v-model="currentSettings.opacity" min="0" max="100" class="opacity-slider" />
                </div>

                <!-- Particle Effects -->
                <div class="setting-group">
                    <label class="setting-label">Effects</label>
                    <div class="toggle-group">
                        <label class="toggle-item">
                            <input type="checkbox" v-model="currentSettings.particles" />
                            <span>Floating Particles</span>
                        </label>
                        <label class="toggle-item">
                            <input type="checkbox" v-model="currentSettings.vignette" />
                            <span>Vignette Effect</span>
                        </label>
                    </div>
                </div>
            </div>

            <div class="settings-footer">
                <button class="btn-reset" @click="resetToDefault">Reset to Default</button>
                <button class="btn-apply" @click="applySettings">Apply</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    isVisible: Boolean
})

const emit = defineEmits(['close', 'apply'])

const fileInput = ref(null)

const backgroundTypes = [
    { id: 'default', icon: '📄', name: 'Default' },
    { id: 'solid', icon: '🎨', name: 'Solid Color' },
    { id: 'gradient', icon: '🌈', name: 'Gradient' },
    { id: 'image', icon: '🖼️', name: 'Image' }
]

const colorPresets = [
    { name: 'Washi Paper', color: '#f5f3f0' },
    { name: 'Sakura Pink', color: '#fef0f0' },
    { name: 'Matcha Green', color: '#f0f5ed' },
    { name: 'Sky Blue', color: '#eff6ff' },
    { name: 'Lavender', color: '#f5f3ff' },
    { name: 'Peach', color: '#fff5f0' },
    { name: 'Mint', color: '#f0fdf4' },
    { name: 'Ivory', color: '#fffff0' },
]

const gradientPresets = [
    { name: 'Sakura Dawn', gradient: 'linear-gradient(135deg, #fef0f0 0%, #fff5f0 100%)' },
    { name: 'Ocean Mist', gradient: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%)' },
    { name: 'Forest Whisper', gradient: 'linear-gradient(135deg, #f0f5ed 0%, #f0fdf4 100%)' },
    { name: 'Sunset Glow', gradient: 'linear-gradient(135deg, #fff5f0 0%, #fef0f0 100%)' },
    { name: 'Lavender Dream', gradient: 'linear-gradient(135deg, #f5f3ff 0%, #fef0ff 100%)' },
    { name: 'Golden Hour', gradient: 'linear-gradient(135deg, #fffff0 0%, #fff5f0 100%)' },
]

const currentSettings = ref({
    type: 'default',
    solidColor: '#f5f3f0',
    gradient: gradientPresets[0].gradient,
    imageUrl: '',
    opacity: 100,
    particles: true,
    vignette: true
})

// Load saved settings
const loadSettings = () => {
    const saved = localStorage.getItem('zan-background-settings')
    if (saved) {
        try {
            currentSettings.value = JSON.parse(saved)
        } catch (e) {
            console.error('Failed to load background settings')
        }
    }
}

const selectType = (type) => {
    currentSettings.value.type = type
}

const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
            currentSettings.value.imageUrl = e.target.result
        }
        reader.readAsDataURL(file)
    }
}

const removeImage = () => {
    currentSettings.value.imageUrl = ''
    if (fileInput.value) {
        fileInput.value.value = ''
    }
}

const resetToDefault = () => {
    currentSettings.value = {
        type: 'default',
        solidColor: '#f5f3f0',
        gradient: gradientPresets[0].gradient,
        imageUrl: '',
        opacity: 100,
        particles: true,
        vignette: true
    }
    applySettings()
}

const applySettings = () => {
    localStorage.setItem('zan-background-settings', JSON.stringify(currentSettings.value))
    emit('apply', currentSettings.value)
    emit('close')
}

// Load settings when component mounts
watch(() => props.isVisible, (visible) => {
    if (visible) {
        loadSettings()
    }
})
</script>

<style scoped>
.settings-overlay {
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

.settings-panel {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
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

.settings-header {
    padding: var(--space-6);
    border-bottom: 1px solid var(--border-color);
    position: relative;
}

.settings-title {
    font-size: 1.75rem;
    font-weight: 300;
    letter-spacing: 0.05em;
    color: var(--text-primary);
    margin-bottom: var(--space-2);
}

.settings-subtitle {
    font-family: var(--font-serif);
    font-size: 0.875rem;
    font-weight: 300;
    letter-spacing: 0.2em;
    color: var(--text-muted);
    margin: 0;
}

.close-btn {
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

.close-btn:hover {
    border-color: var(--text-primary);
    transform: rotate(90deg);
}

.settings-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
}

.setting-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
}

.setting-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-secondary);
    letter-spacing: 0.05em;
}

.type-selector {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-3);
}

.type-btn {
    padding: var(--space-4);
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    cursor: pointer;
    transition: all 0.3s var(--ease);
}

.type-btn:hover {
    border-color: var(--accent);
    background: var(--accent-dim);
}

.type-btn.active {
    border-color: var(--accent);
    background: var(--accent-dim);
}

.type-icon {
    font-size: 1.5rem;
}

.type-name {
    font-size: 0.875rem;
    font-weight: 400;
    color: var(--text-secondary);
}

.color-presets {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-3);
}

.color-preset {
    aspect-ratio: 1;
    border: 2px solid var(--border-color);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s var(--ease);
}

.color-preset:hover {
    transform: scale(1.1);
}

.color-preset.active {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-dim);
}

.custom-color-input {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-top: var(--space-2);
}

.custom-color-input label {
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.custom-color-input input[type="color"] {
    width: 60px;
    height: 40px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    cursor: pointer;
}

.gradient-presets {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-3);
}

.gradient-preset {
    aspect-ratio: 2/1;
    border: 2px solid var(--border-color);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s var(--ease);
}

.gradient-preset:hover {
    transform: scale(1.05);
}

.gradient-preset.active {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-dim);
}

.image-upload {
    display: flex;
    gap: var(--space-3);
}

.upload-btn,
.remove-btn {
    padding: var(--space-3) var(--space-6);
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-family: var(--font-sans);
    font-size: 0.875rem;
    font-weight: 400;
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    transition: all 0.3s var(--ease);
}

.upload-btn:hover {
    border-color: var(--accent);
    background: var(--accent-dim);
}

.remove-btn {
    background: transparent;
    color: #ef4444;
    border-color: #ef4444;
}

.remove-btn:hover {
    background: #ef4444;
    color: white;
}

.upload-icon {
    font-size: 1.25rem;
}

.image-preview {
    margin-top: var(--space-3);
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid var(--border-color);
}

.image-preview img {
    width: 100%;
    height: auto;
    display: block;
}

.opacity-slider {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: var(--bg-secondary);
    outline: none;
    -webkit-appearance: none;
}

.opacity-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--accent);
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.opacity-slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--accent);
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
}

.toggle-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    font-size: 0.875rem;
    color: var(--text-secondary);
    cursor: pointer;
}

.toggle-item input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
}

.settings-footer {
    padding: var(--space-6);
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    gap: var(--space-3);
}

.btn-reset,
.btn-apply {
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

.btn-reset {
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
}

.btn-reset:hover {
    border-color: var(--text-primary);
    color: var(--text-primary);
}

.btn-apply {
    background: var(--accent);
    color: white;
}

.btn-apply:hover {
    background: var(--text-primary);
    transform: translateY(-2px);
}

/* Scrollbar */
.settings-content::-webkit-scrollbar {
    width: 6px;
}

.settings-content::-webkit-scrollbar-track {
    background: transparent;
}

.settings-content::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 3px;
}
</style>
