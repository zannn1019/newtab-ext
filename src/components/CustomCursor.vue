<template>
    <div class="custom-cursor-container">
        <div ref="cursorRef" class="custom-cursor">
            <div class="cursor-dot"></div>
            <div class="cursor-ring"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'

const cursorRef = ref(null)
let cursorX = 0
let cursorY = 0
let isHovering = false

onMounted(() => {
    const cursor = cursorRef.value
    if (!cursor) return

    const dot = cursor.querySelector('.cursor-dot')
    const ring = cursor.querySelector('.cursor-ring')

    // Mouse move handler with smooth follow
    const handleMouseMove = (e) => {
        cursorX = e.clientX
        cursorY = e.clientY

        // Instant dot movement
        gsap.to(dot, {
            x: cursorX,
            y: cursorY,
            duration: 0,
        })

        // Smooth ring follow
        gsap.to(ring, {
            x: cursorX,
            y: cursorY,
            duration: 0.3,
            ease: 'power2.out'
        })
    }

    // Hover effects for interactive elements
    const handleMouseEnter = () => {
        isHovering = true
        gsap.to(ring, {
            scale: 1.8,
            borderWidth: 1,
            duration: 0.3,
            ease: 'power2.out'
        })
        gsap.to(dot, {
            scale: 0.5,
            duration: 0.3,
            ease: 'power2.out'
        })
    }

    const handleMouseLeave = () => {
        isHovering = false
        gsap.to(ring, {
            scale: 1,
            borderWidth: 2,
            duration: 0.3,
            ease: 'power2.out'
        })
        gsap.to(dot, {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out'
        })
    }

    // Click effect
    const handleClick = () => {
        const tl = gsap.timeline()
        tl.to(ring, {
            scale: isHovering ? 2.2 : 1.3,
            duration: 0.1,
            ease: 'power2.out'
        })
            .to(ring, {
                scale: isHovering ? 1.8 : 1,
                duration: 0.3,
                ease: 'elastic.out(1, 0.3)'
            })
    }

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('click', handleClick)

    // Add hover effects to interactive elements
    const interactiveElements = 'a, button, input, textarea, [role="button"], .link-card'
    document.querySelectorAll(interactiveElements).forEach(el => {
        el.addEventListener('mouseenter', handleMouseEnter)
        el.addEventListener('mouseleave', handleMouseLeave)
    })

    // Observer for dynamically added elements
    const observer = new MutationObserver(() => {
        document.querySelectorAll(interactiveElements).forEach(el => {
            el.addEventListener('mouseenter', handleMouseEnter)
            el.addEventListener('mouseleave', handleMouseLeave)
        })
    })

    observer.observe(document.body, {
        childList: true,
        subtree: true
    })

    // Cleanup
    onUnmounted(() => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('click', handleClick)
        observer.disconnect()
    })
})
</script>

<style scoped>
.custom-cursor-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
}

.custom-cursor {
    position: fixed;
    top: 0;
    left: 0;
    pointer-events: none;
    mix-blend-mode: difference;
}

.cursor-dot {
    width: 8px;
    height: 8px;
    background: var(--text-primary);
    border-radius: 50%;
    position: absolute;
    transform: translate(-50%, -50%);
    pointer-events: none;
}

.cursor-ring {
    width: 40px;
    height: 40px;
    border: 2px solid var(--text-primary);
    border-radius: 50%;
    position: absolute;
    transform: translate(-50%, -50%);
    pointer-events: none;
}

/* Hide default cursor */
:global(body) {
    cursor: none !important;
}

:global(a),
:global(button),
:global(input),
:global(textarea) {
    cursor: none !important;
}

/* Show default cursor on mobile (no hover capability) */
@media (hover: none) and (pointer: coarse) {
    .custom-cursor-container {
        display: none;
    }

    :global(body),
    :global(a),
    :global(button),
    :global(input),
    :global(textarea) {
        cursor: auto !important;
    }
}
</style>
