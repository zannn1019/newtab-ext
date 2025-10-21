<template>
    <div class="animated-background"></div>
</template>

<script setup>
// Purely CSS-based minimal background - no canvas needed
</script>

<style scoped>
.animated-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
    /* Remove background - let App.vue handle it */
}

/* Subtle radial gradient for depth */
.animated-background::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 150%;
    height: 150%;
    background: radial-gradient(circle at center,
            rgba(255, 255, 255, 0.3) 0%,
            transparent 50%);
    animation: breathe 8s ease-in-out infinite;
    mix-blend-mode: soft-light;
}

/* Very subtle noise texture overlay */
.animated-background::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.015;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}

@keyframes breathe {

    0%,
    100% {
        opacity: 0.3;
        transform: translate(-50%, -50%) scale(1);
    }

    50% {
        opacity: 0.5;
        transform: translate(-50%, -50%) scale(1.1);
    }
}
</style>
