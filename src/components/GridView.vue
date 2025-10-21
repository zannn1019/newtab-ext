<template>
    <div class="grid-view">
        <!-- Japanese decoration -->
        <div class="japanese-label">リンク集</div>

        <div class="grid-container">
            <!-- Animated title -->
            <h2 class="grid-title">
                <span v-for="(char, index) in titleChars" :key="index" class="char" :style="{ '--char-index': index }">
                    {{ char }}
                </span>
            </h2>

            <!-- Links grid with stagger animation -->
            <div class="links-grid">
                <div v-for="(link, index) in links" :key="link.id || index" class="link-card"
                    :style="{ '--card-index': index }" @click="handleLinkClick(link)" @mouseenter="handleCardHover"
                    @mouseleave="handleCardLeave">

                    <div class="card-inner">
                        <div class="card-corner"></div>
                        <div class="link-title">{{ link.title }}</div>
                        <div class="link-url">{{ link.url }}</div>
                        <div class="card-icon">→</div>
                    </div>
                </div>

                <!-- Add new link card -->
                <div class="link-card add-card" @click="handleAddLink" @mouseenter="handleCardHover"
                    @mouseleave="handleCardLeave">
                    <div class="card-inner">
                        <div class="add-icon">+</div>
                        <div class="add-text">新しいリンク</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Floating decorative elements -->
        <div class="floating-element" v-for="i in 3" :key="i" :style="{ '--float-delay': i * 0.5 + 's' }"></div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import gsap from 'gsap'

const links = ref([
    { id: 1, title: 'GitHub', url: 'github.com' },
    { id: 2, title: 'Gmail', url: 'gmail.com' },
    { id: 3, title: 'Calendar', url: 'calendar.google.com' },
    { id: 4, title: 'Drive', url: 'drive.google.com' },
    { id: 5, title: 'YouTube', url: 'youtube.com' },
    { id: 6, title: 'Twitter', url: 'twitter.com' },
])

const titleChars = 'Quick Links'.split('')

const handleLinkClick = (link) => {
    const url = link.url.startsWith('http') ? link.url : `https://${link.url}`

    // Animate out before navigation
    gsap.to('.link-card', {
        scale: 0.9,
        opacity: 0,
        duration: 0.3,
        stagger: 0.05,
        ease: 'power2.in',
        onComplete: () => {
            window.location.href = url
        }
    })
}

const handleAddLink = () => {
    const title = prompt('リンクのタイトル:')
    const url = prompt('URL:')

    if (title && url) {
        const newId = Math.max(...links.value.map(l => l.id || 0)) + 1
        links.value.push({ id: newId, title, url })
        localStorage.setItem('zan-links', JSON.stringify(links.value))

        // Animate new card
        nextTick(() => {
            const newCard = document.querySelector('.link-card:last-of-type')
            gsap.from(newCard, {
                scale: 0,
                rotation: 180,
                duration: 0.6,
                ease: 'back.out(1.7)'
            })
        })
    }
}

const handleCardHover = (e) => {
    const card = e.currentTarget
    const cardInner = card.querySelector('.card-inner')

    gsap.to(cardInner, {
        y: -8,
        rotationX: 5,
        duration: 0.4,
        ease: 'power2.out'
    })

    gsap.to(card.querySelector('.card-corner'), {
        scaleX: 1,
        scaleY: 1,
        duration: 0.4,
        ease: 'power2.out'
    })
}

const handleCardLeave = (e) => {
    const card = e.currentTarget
    const cardInner = card.querySelector('.card-inner')

    gsap.to(cardInner, {
        y: 0,
        rotationX: 0,
        duration: 0.4,
        ease: 'power2.out'
    })

    gsap.to(card.querySelector('.card-corner'), {
        scaleX: 0,
        scaleY: 0,
        duration: 0.4,
        ease: 'power2.out'
    })
}

onMounted(() => {
    // Load saved links
    const savedLinks = localStorage.getItem('zan-links')
    if (savedLinks) {
        try {
            links.value = JSON.parse(savedLinks)
        } catch (e) {
            console.error('Failed to load links')
        }
    }

    nextTick(() => {
        // Animate title
        gsap.from('.char', {
            opacity: 0,
            y: 30,
            rotationY: 90,
            duration: 0.8,
            stagger: 0.04,
            ease: 'back.out(2)',
            delay: 0.2
        })

        // Animate cards
        gsap.from('.link-card', {
            opacity: 0,
            scale: 0.8,
            y: 60,
            duration: 0.8,
            stagger: {
                amount: 0.6,
                from: 'start',
                ease: 'power2.out'
            },
            ease: 'back.out(1.4)',
            delay: 0.5
        })

        // Animate floating elements
        gsap.from('.floating-element', {
            opacity: 0,
            scale: 0,
            duration: 2,
            stagger: 0.3,
            ease: 'power2.out',
            delay: 1
        })
    })
})
</script>

<style scoped>
.grid-view {
    width: 100%;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-16) var(--space-8);
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

.grid-container {
    width: 100%;
    max-width: 1400px;
    display: flex;
    flex-direction: column;
    gap: var(--space-16);
    z-index: 1;
}

.grid-title {
    font-size: 2.5rem;
    font-weight: 100;
    text-align: center;
    letter-spacing: 0.2em;
    color: var(--white);
    margin: 0;
    text-transform: uppercase;
    perspective: 1000px;
}

.char {
    display: inline-block;
    transform-origin: center;
}

.links-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--space-8);
    padding: var(--space-4);
}

.link-card {
    position: relative;
    min-height: 200px;
    cursor: pointer;
    perspective: 1000px;
}

.card-inner {
    width: 100%;
    height: 100%;
    background: transparent;
    border: var(--border);
    padding: var(--space-8);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
    transition: border-color 0.4s var(--ease);
    transform-style: preserve-3d;
}

.link-card:hover .card-inner {
    border-color: var(--white-20);
}

.card-corner {
    position: absolute;
    top: 0;
    left: 0;
    width: 40px;
    height: 40px;
    border-top: 2px solid var(--white);
    border-left: 2px solid var(--white);
    transform: scale(0);
    transform-origin: top left;
}

.link-title {
    font-size: 1.5rem;
    font-weight: 200;
    letter-spacing: 0.05em;
    color: var(--white);
    margin-bottom: var(--space-4);
}

.link-url {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--white-40);
    letter-spacing: 0.05em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.card-icon {
    position: absolute;
    bottom: var(--space-8);
    right: var(--space-8);
    font-size: 2rem;
    color: var(--white-40);
    transition: all 0.4s var(--ease);
}

.link-card:hover .card-icon {
    color: var(--white);
    transform: translateX(8px);
}

/* Add card styles */
.add-card .card-inner {
    align-items: center;
    justify-content: center;
    border-style: dashed;
    border-color: var(--white-20);
}

.add-icon {
    font-size: 3rem;
    font-weight: 100;
    color: var(--white-40);
    transition: all 0.4s var(--ease);
}

.add-card:hover .add-icon {
    color: var(--white);
    transform: rotate(90deg);
}

.add-text {
    font-family: var(--font-japanese);
    font-size: 0.875rem;
    color: var(--white-40);
    letter-spacing: 0.15em;
    margin-top: var(--space-4);
    transition: color 0.4s var(--ease);
}

.add-card:hover .add-text {
    color: var(--white-60);
}

/* Floating decorative elements */
.floating-element {
    position: absolute;
    width: 200px;
    height: 200px;
    border: 1px solid var(--white-05);
    border-radius: 50%;
    pointer-events: none;
    animation: float 20s ease-in-out infinite;
    animation-delay: var(--float-delay);
}

.floating-element:nth-child(1) {
    top: 10%;
    left: 10%;
}

.floating-element:nth-child(2) {
    top: 60%;
    right: 15%;
}

.floating-element:nth-child(3) {
    bottom: 15%;
    left: 50%;
}

@keyframes float {

    0%,
    100% {
        transform: translate(0, 0) scale(1);
        opacity: 0.1;
    }

    50% {
        transform: translate(30px, -30px) scale(1.2);
        opacity: 0.2;
    }
}
</style>
