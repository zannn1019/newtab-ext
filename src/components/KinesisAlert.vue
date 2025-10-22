<template>
    <Teleport to="body">
        <Transition @before-enter="onBeforeEnter" @enter="onEnter" @leave="onLeave">
            <div v-if="isVisible" class="kinesis-alert-overlay" @click="handleOverlayClick">
                <div class="kinesis-alert-container" @click.stop>
                    <!-- Japanese decorative lines -->
                    <div class="alert-decoration-top"></div>
                    <div class="alert-decoration-bottom"></div>

                    <!-- Icon with animation -->
                    <div class="alert-icon-wrapper" ref="iconRef">
                        <div class="alert-icon-pulse"></div>
                        <div class="alert-icon" :class="`alert-icon-${type}`">
                            <component :is="iconComponent" :size="36" :stroke-width="1.5" />
                        </div>
                    </div>

                    <!-- Title with Japanese subtitle -->
                    <div class="alert-content" ref="contentRef">
                        <h3 class="alert-title">{{ title }}</h3>
                        <p v-if="japaneseTitle" class="alert-subtitle-jp">{{ japaneseTitle }}</p>
                        <p class="alert-message">{{ message }}</p>
                    </div>

                    <!-- Actions -->
                    <div class="alert-actions" ref="actionsRef">
                        <button v-if="cancelText" class="btn-alert btn-alert-cancel" @click="handleCancel">
                            {{ cancelText }}
                        </button>
                        <button class="btn-alert btn-alert-confirm" :class="`btn-alert-${type}`" @click="handleConfirm"
                            ref="confirmBtnRef">
                            {{ confirmText }}
                        </button>
                    </div>

                    <!-- Ambient particles -->
                    <div class="alert-particles">
                        <div v-for="i in 8" :key="i" class="particle" :style="getParticleStyle(i)"></div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import gsap from 'gsap'
import { CheckCircle2, XCircle, AlertTriangle, Info, HelpCircle } from 'lucide-vue-next'

const props = defineProps({
    type: {
        type: String,
        default: 'info', // 'success', 'error', 'warning', 'info', 'confirm'
        validator: (value) => ['success', 'error', 'warning', 'info', 'confirm'].includes(value)
    },
    title: {
        type: String,
        required: true
    },
    japaneseTitle: {
        type: String,
        default: ''
    },
    message: {
        type: String,
        required: true
    },
    confirmText: {
        type: String,
        default: 'OK'
    },
    cancelText: {
        type: String,
        default: ''
    },
    autoClose: {
        type: Number,
        default: 0 // 0 = no auto close
    }
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

const isVisible = ref(false)
const iconRef = ref(null)
const contentRef = ref(null)
const actionsRef = ref(null)
const confirmBtnRef = ref(null)

const iconComponent = computed(() => {
    const icons = {
        success: CheckCircle2,
        error: XCircle,
        warning: AlertTriangle,
        info: Info,
        confirm: HelpCircle
    }
    return icons[props.type] || Info
})

let autoCloseTimeout = null

const show = () => {
    isVisible.value = true

    if (props.autoClose > 0) {
        autoCloseTimeout = setTimeout(() => {
            handleConfirm()
        }, props.autoClose)
    }
}

const hide = () => {
    if (autoCloseTimeout) {
        clearTimeout(autoCloseTimeout)
    }
    isVisible.value = false
}

const handleConfirm = () => {
    emit('confirm')
    emit('close')
    hide()
}

const handleCancel = () => {
    emit('cancel')
    emit('close')
    hide()
}

const handleOverlayClick = () => {
    if (!props.cancelText) {
        handleConfirm()
    }
}

const getParticleStyle = (index) => {
    const angle = (360 / 8) * index
    const distance = 120 + Math.random() * 40
    const x = Math.cos(angle * Math.PI / 180) * distance
    const y = Math.sin(angle * Math.PI / 180) * distance

    return {
        '--x': `${x}px`,
        '--y': `${y}px`,
        '--delay': `${index * 0.1}s`,
        '--duration': `${2 + Math.random()}s`
    }
}

// GSAP Animations
const onBeforeEnter = (el) => {
    gsap.set(el, { opacity: 0 })
    gsap.set('.kinesis-alert-container', {
        scale: 0.7,
        y: 50,
        opacity: 0,
        filter: 'blur(10px)'
    })
}

const onEnter = (el, done) => {
    const tl = gsap.timeline({
        onComplete: done,
        defaults: { ease: 'power3.out' }
    })

    // Overlay fade in
    tl.to(el, {
        opacity: 1,
        duration: 0.3
    })

    // Container entrance with scale + bounce
    tl.to('.kinesis-alert-container', {
        scale: 1,
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.6,
        ease: 'back.out(1.7)'
    }, '-=0.2')

    // Icon pulse animation
    if (iconRef.value) {
        tl.from(iconRef.value, {
            scale: 0,
            rotation: -180,
            duration: 0.5,
            ease: 'back.out(2)'
        }, '-=0.4')

        // Continuous pulse
        gsap.to('.alert-icon-pulse', {
            scale: 2,
            opacity: 0,
            duration: 1.5,
            repeat: -1,
            ease: 'power2.out'
        })
    }

    // Content stagger
    if (contentRef.value) {
        tl.from(contentRef.value.children, {
            y: 20,
            opacity: 0,
            duration: 0.4,
            stagger: 0.08
        }, '-=0.3')
    }

    // Actions stagger
    if (actionsRef.value) {
        tl.from(actionsRef.value.children, {
            y: 20,
            scale: 0.9,
            duration: 0.3,
            stagger: 0.1
        }, '-=0.2')
    }

    // Particles animation
    tl.from('.particle', {
        scale: 0,
        opacity: 0,
        duration: 0.6,
        stagger: 0.05
    }, '-=0.5')

    // Decorative lines
    tl.from('.alert-decoration-top, .alert-decoration-bottom', {
        scaleX: 0,
        duration: 0.4
    }, '-=0.3')
}

const onLeave = (el, done) => {
    const tl = gsap.timeline({ onComplete: done })

    // Container exit
    tl.to('.kinesis-alert-container', {
        scale: 0.9,
        y: -30,
        opacity: 0,
        filter: 'blur(10px)',
        duration: 0.3,
        ease: 'power2.in'
    })

    // Overlay fade out
    tl.to(el, {
        opacity: 0,
        duration: 0.2
    }, '-=0.1')
}

// Expose methods for parent component
defineExpose({
    show,
    hide
})
</script>

<style scoped>
/* Overlay */
.kinesis-alert-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(12px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
    }
    
    /* Alert Container */
    .kinesis-alert-container {
        position: relative;
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 16px;
        padding: 48px 40px 32px;
        max-width: 480px;
        width: 100%;
        box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.15),
            0 0 0 1px rgba(0, 0, 0, 0.02) inset;
        overflow: hidden;
    }
    
    /* Decorative Lines */
    .alert-decoration-top,
    .alert-decoration-bottom {
        position: absolute;
        left: 40px;
        right: 40px;
        height: 1px;
        background: linear-gradient(90deg,
                transparent 0%,
                rgba(99, 102, 241, 0.3) 50%,
                transparent 100%);
        transform-origin: center;
    }
    
    .alert-decoration-top {
        top: 32px;
    }
    
    .alert-decoration-bottom {
        bottom: 24px;
    }
    
    /* Icon */
    .alert-icon-wrapper {
        position: relative;
        width: 80px;
        height: 80px;
        margin: 0 auto 24px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .alert-icon-pulse {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: currentColor;
        opacity: 0.2;
    }
    
    .alert-icon {
        position: relative;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid currentColor;
        z-index: 1;
        background: rgba(255, 255, 255, 0.5);
        backdrop-filter: blur(10px);
    }
    
    .alert-icon-success {
        color: #22c55e;
        background: rgba(34, 197, 94, 0.1);
    }
    
    .alert-icon-error {
        color: #ef4444;
        background: rgba(239, 68, 68, 0.1);
    }
    
    .alert-icon-warning {
        color: #f59e0b;
        background: rgba(245, 158, 11, 0.1);
    }
    
    .alert-icon-info,
    .alert-icon-confirm {
        color: #6366f1;
        background: rgba(99, 102, 241, 0.1);
    }
    
    /* Content */
    .alert-content {
        text-align: center;
        margin-bottom: 32px;
    }
    
    .alert-title {
        font-size: 24px;
        font-weight: 200;
        color: #1a1a1a;
        margin: 0 0 8px 0;
        letter-spacing: 0.5px;
    }
    
    .alert-subtitle-jp {
        font-size: 13px;
        font-weight: 200;
        color: rgba(0, 0, 0, 0.4);
        margin: 0 0 16px 0;
        letter-spacing: 2px;
        font-family: 'Noto Sans JP', sans-serif;
    }
    
    .alert-message {
        font-size: 15px;
        font-weight: 300;
        color: rgba(0, 0, 0, 0.7);
        line-height: 1.6;
        margin: 0;
    }
    
    /* Actions */
    .alert-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
        position: relative;
        z-index: 10;
    }
    
    .btn-alert {
        padding: 12px 32px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        letter-spacing: 0.5px;
        min-width: 120px;
        position: relative;
        z-index: 10;
    }
    
    .btn-alert-cancel {
        background: rgba(0, 0, 0, 0.03);
        color: rgba(0, 0, 0, 0.6);
        border: 1px solid rgba(0, 0, 0, 0.1);
    }
    
    .btn-alert-cancel:hover {
        background: rgba(0, 0, 0, 0.05);
        color: rgba(0, 0, 0, 0.9);
    transform: translateY(-2px);
}

.btn-alert-confirm {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    border: 1px solid rgba(99, 102, 241, 0.5);
}

.btn-alert-confirm:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
}

.btn-alert-success {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    border-color: rgba(34, 197, 94, 0.5);
}

.btn-alert-success:hover {
    box-shadow: 0 8px 24px rgba(34, 197, 94, 0.4);
}

.btn-alert-error {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    border-color: rgba(239, 68, 68, 0.5);
}

.btn-alert-error:hover {
    box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4);
}

.btn-alert-warning {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    border-color: rgba(245, 158, 11, 0.5);
}

.btn-alert-warning:hover {
    box-shadow: 0 8px 24px rgba(245, 158, 11, 0.4);
}

/* Particles */
.alert-particles {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    pointer-events: none;
}

.particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: currentColor;
    border-radius: 50%;
    opacity: 0.3;
    animation: particleFloat var(--duration, 2s) var(--delay, 0s) infinite ease-in-out;
}

@keyframes particleFloat {

    0%,
    100% {
        transform: translate(0, 0) scale(1);
        opacity: 0;
    }

    50% {
        transform: translate(var(--x, 0), var(--y, 0)) scale(1.5);
        opacity: 0.3;
    }
}

/* Responsive */
@media (max-width: 640px) {
    .kinesis-alert-container {
        padding: 36px 24px 24px;
        margin: 20px;
    }

    .alert-title {
        font-size: 20px;
    }

    .alert-message {
        font-size: 14px;
    }

    .btn-alert {
        padding: 10px 24px;
        min-width: 100px;
        font-size: 13px;
    }

    .alert-decoration-top,
    .alert-decoration-bottom {
        left: 24px;
        right: 24px;
    }
}
</style>
