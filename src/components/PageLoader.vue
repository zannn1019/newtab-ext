<template>
    <transition name="loader" @after-leave="onLoadComplete">
        <div v-if="isLoading" class="page-loader">
            <div class="loader-content">
                <!-- Animated Logo - ZAN Text -->
                <div class="logo-text">
                    <div class="logo-char logo-z">Z</div>
                    <div class="logo-char logo-a">A</div>
                    <div class="logo-char logo-n">N</div>
                </div>

                <!-- Japanese subtitle under logo -->
                <div class="logo-japanese">禅</div>

                <!-- Loading Text -->
                <h2 class="loader-title">Welcome</h2>
                <p class="loader-subtitle">読み込み中...</p>

                <!-- Progress Bar -->
                <div class="loader-progress">
                    <div class="progress-bar" ref="progressBarRef"></div>
                </div>
            </div>

        </div>
    </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import gsap from 'gsap'

const isLoading = ref(true)
const progressBarRef = ref(null)

const emit = defineEmits(['loaded'])

const getParticleStyle = (index) => {
    const angle = (360 / 20) * index
    const radius = 200
    return {
        '--angle': `${angle}deg`,
        '--radius': `${radius}px`,
        '--delay': `${index * 0.1}s`
    }
}

const onLoadComplete = () => {
    emit('loaded')
}

onMounted(() => {
    const tl = gsap.timeline()

    // Animate each letter of ZAN (faster)
    tl.from('.logo-z', {
        opacity: 0,
        scale: 0,
        rotation: -180,
        duration: 0.4,
        ease: 'back.out(1.7)'
    })
        .from('.logo-a', {
            opacity: 0,
            scale: 0,
            rotation: 180,
            duration: 0.4,
            ease: 'back.out(1.7)'
        }, '-=0.3')
        .from('.logo-n', {
            opacity: 0,
            scale: 0,
            rotation: -180,
            duration: 0.4,
            ease: 'back.out(1.7)'
        }, '-=0.3')

    // Animate Japanese character
    tl.from('.logo-japanese', {
        opacity: 0,
        y: 30,
        duration: 0.5,
        ease: 'power3.out'
    }, '-=0.2')

    // Pulse logo (faster)
    tl.to('.logo-text', {
        scale: 1.1,
        duration: 0.3,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: 1
    })

    // Animate text
    tl.from('.loader-title', {
        opacity: 0,
        y: 20,
        duration: 0.4,
        ease: 'power3.out'
    }, '-=0.2')
        .from('.loader-subtitle', {
            opacity: 0,
            y: 10,
            duration: 0.3,
            ease: 'power3.out'
        }, '-=0.2')

    // Animate progress bar (faster)
    tl.from('.loader-progress', {
        scaleX: 0,
        transformOrigin: 'left',
        duration: 0.3,
        ease: 'power3.out'
    }, '-=0.1')
        .to(progressBarRef.value, {
            width: '100%',
            duration: 0.8,
            ease: 'power2.inOut'
        })

    // Animate particles
    tl.to('.particle', {
        scale: 1,
        opacity: 1,
        stagger: 0.03,
        duration: 0.3,
        ease: 'back.out(1.7)'
    }, '-=0.6')

    // Fade out everything (faster)
    tl.to('.loader-content', {
        opacity: 0,
        y: -30,
        duration: 0.4,
        ease: 'power3.in'
    }, '+=0.1')
        .to('.particle', {
            scale: 0,
            opacity: 0,
            stagger: 0.01,
            duration: 0.3,
            ease: 'power2.in'
        }, '-=0.3')
        .to('.page-loader', {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.inOut',
            onComplete: () => {
                isLoading.value = false
            }
        })
})
</script>

<style scoped>
.page-loader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #f5f3f0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.loader-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    position: relative;
    z-index: 2;
}

.logo-text {
    display: flex;
    gap: 0.75rem;
    align-items: center;
}

.logo-char {
    font-family: 'Noto Serif JP', serif;
    font-size: 5rem;
    font-weight: 300;
    color: #2d2d2d;
    letter-spacing: 0.1em;
    line-height: 1;
}

.logo-japanese {
    font-family: 'Noto Serif JP', serif;
    font-size: 2rem;
    font-weight: 400;
    color: #5b7c99;
    letter-spacing: 0.3em;
    margin-top: -1rem;
}

.loader-logo {
    filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.05));
}

.logo-lines line {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: drawLine 1s ease-out forwards;
}

@keyframes drawLine {
    to {
        stroke-dashoffset: 0;
    }
}

.loader-title {
    font-family: 'Noto Sans JP', sans-serif;
    font-size: 1.25rem;
    font-weight: 400;
    letter-spacing: 0.15em;
    margin: 0;
    color: #5a5a5a;
}

.loader-subtitle {
    font-family: 'Noto Serif JP', serif;
    font-size: 0.95rem;
    font-weight: 300;
    color: #808080;
    margin: 0;
    letter-spacing: 0.3em;
}

.loader-progress {
    width: 300px;
    height: 2px;
    background: rgba(45, 45, 45, 0.1);
    border-radius: 2px;
    overflow: hidden;
}

.progress-bar {
    width: 0%;
    height: 100%;
    background: linear-gradient(90deg, #5b7c99, #7d9d7d);
    border-radius: 2px;
}

.loader-particles {
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.particle {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 3px;
    height: 3px;
    background: #5b7c99;
    border-radius: 50%;
    transform:
        rotate(var(--angle)) translateX(var(--radius)) scale(0);
    opacity: 0;
    animation: particlePulse 2s ease-in-out infinite;
    animation-delay: var(--delay);
}

@keyframes particlePulse {

    0%,
    100% {
        opacity: 0.2;
    }

    50% {
        opacity: 0.4;
    }
}

/* Transition animations */
.loader-enter-active {
    transition: opacity 0.3s ease;
}

.loader-leave-active {
    transition: opacity 0.4s ease;
}

.loader-enter-from,
.loader-leave-to {
    opacity: 0;
}

@media (max-width: 768px) {
    .logo-text {
        gap: 0.5rem;
    }

    .logo-char {
        font-size: 3.5rem;
    }

    .logo-japanese {
        font-size: 1.5rem;
    }

    .loader-title {
        font-size: 1.1rem;
    }

    .loader-progress {
        width: 220px;
    }
}
</style>
