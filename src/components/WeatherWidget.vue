<template>
    <div class="weather-widget" v-if="weather" ref="weatherWidgetRef">
        <!-- Glass morphism container -->
        <div class="weather-container">
            <!-- Animated background particles -->
            <div class="weather-particles">
                <div class="particle" v-for="i in 12" :key="i" :style="{ '--particle-index': i }"></div>
            </div>

            <!-- Main weather display -->
            <div class="weather-main">
                <div class="weather-icon-container">
                    <div class="weather-icon">{{ getWeatherEmoji(weather.condition) }}</div>
                    <div class="weather-glow"></div>
                </div>

                <div class="weather-info">
                    <div class="temperature-display">
                        <span class="temp-value">{{ Math.round(weather.temp) }}</span>
                        <span class="temp-unit">°C</span>
                    </div>
                    <div class="weather-condition">{{ weather.condition }}</div>
                    <div class="weather-location">
                        <span class="location-icon">📍</span>
                        <span>{{ weather.location }}</span>
                    </div>
                </div>
            </div>

            <!-- Weather details grid -->
            <div class="weather-details">
                <div class="detail-card" data-detail="humidity">
                    <div class="detail-icon">💧</div>
                    <div class="detail-content">
                        <div class="detail-value">{{ weather.humidity }}%</div>
                        <div class="detail-label">Humidity</div>
                    </div>
                </div>

                <div class="detail-card" data-detail="wind">
                    <div class="detail-icon">💨</div>
                    <div class="detail-content">
                        <div class="detail-value">{{ weather.windSpeed }}</div>
                        <div class="detail-label">Wind km/h</div>
                    </div>
                </div>

                <div class="detail-card" data-detail="feels">
                    <div class="detail-icon">🌡️</div>
                    <div class="detail-content">
                        <div class="detail-value">{{ Math.round(weather.feelsLike) }}°</div>
                        <div class="detail-label">Feels Like</div>
                    </div>
                </div>
            </div>

            <!-- Last updated -->
            <div class="weather-footer">
                <span class="update-time">Updated {{ formatUpdateTime(weather.lastUpdated) }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import gsap from 'gsap'

const weather = ref(null)
const weatherWidgetRef = ref(null)

const fetchWeather = async () => {
    try {
        // Get user's location
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 10000,
                enableHighAccuracy: false
            })
        })

        const { latitude, longitude } = position.coords

        // Fetch weather from Open-Meteo (free, no API key needed)
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
        )
        const weatherData = await weatherResponse.json()

        // Fetch location name from reverse geocoding
        const locationResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        )
        const locationData = await locationResponse.json()

        weather.value = {
            temp: weatherData.current.temperature_2m,
            feelsLike: weatherData.current.apparent_temperature,
            humidity: weatherData.current.relative_humidity_2m,
            windSpeed: Math.round(weatherData.current.wind_speed_10m),
            condition: getWeatherCondition(weatherData.current.weather_code),
            location: locationData.address?.city || locationData.address?.town || locationData.address?.village || 'Your Location',
            lastUpdated: new Date()
        }

        // Trigger animations after data loads
        nextTick(() => {
            animateWeatherWidget()
        })
    } catch (error) {
        console.error('Failed to fetch weather:', error)
        // Fallback to default location
        fetchDefaultWeather()
    }
}

const fetchDefaultWeather = async () => {
    try {
        // Default to Tokyo coordinates
        const weatherResponse = await fetch(
            'https://api.open-meteo.com/v1/forecast?latitude=35.6762&longitude=139.6503&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto'
        )
        const weatherData = await weatherResponse.json()

        weather.value = {
            temp: weatherData.current.temperature_2m,
            feelsLike: weatherData.current.apparent_temperature,
            humidity: weatherData.current.relative_humidity_2m,
            windSpeed: Math.round(weatherData.current.wind_speed_10m),
            condition: getWeatherCondition(weatherData.current.weather_code),
            location: 'Tokyo',
            lastUpdated: new Date()
        }

        nextTick(() => {
            animateWeatherWidget()
        })
    } catch (error) {
        console.error('Failed to fetch default weather:', error)
    }
}

const getWeatherCondition = (code) => {
    const conditions = {
        0: 'Clear Sky',
        1: 'Mainly Clear',
        2: 'Partly Cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Foggy',
        51: 'Light Drizzle',
        53: 'Drizzle',
        55: 'Heavy Drizzle',
        61: 'Light Rain',
        63: 'Rain',
        65: 'Heavy Rain',
        71: 'Light Snow',
        73: 'Snow',
        75: 'Heavy Snow',
        77: 'Snow Grains',
        80: 'Light Showers',
        81: 'Showers',
        82: 'Heavy Showers',
        85: 'Snow Showers',
        86: 'Heavy Snow',
        95: 'Thunderstorm',
        96: 'Hail Storm',
        99: 'Severe Storm'
    }
    return conditions[code] || 'Unknown'
}

const getWeatherEmoji = (condition) => {
    const emojis = {
        'Clear Sky': '☀️',
        'Mainly Clear': '🌤️',
        'Partly Cloudy': '⛅',
        'Overcast': '☁️',
        'Foggy': '🌫️',
        'Light Drizzle': '🌦️',
        'Drizzle': '🌧️',
        'Heavy Drizzle': '🌧️',
        'Light Rain': '🌦️',
        'Rain': '🌧️',
        'Heavy Rain': '⛈️',
        'Light Snow': '🌨️',
        'Snow': '❄️',
        'Heavy Snow': '❄️',
        'Snow Grains': '❄️',
        'Light Showers': '🌦️',
        'Showers': '🌧️',
        'Heavy Showers': '⛈️',
        'Snow Showers': '🌨️',
        'Heavy Snow': '❄️',
        'Thunderstorm': '⛈️',
        'Hail Storm': '⛈️',
        'Severe Storm': '⛈️'
    }
    return emojis[condition] || '🌡️'
}

const formatUpdateTime = (date) => {
    if (!date) return ''
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)

    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

const animateWeatherWidget = () => {
    const tl = gsap.timeline()

    // Animate container
    tl.from('.weather-container', {
        scale: 0.9,
        opacity: 0,
        duration: 0.8,
        ease: 'back.out(1.7)'
    })

    // Animate weather icon with bounce
    tl.from('.weather-icon-container', {
        scale: 0,
        rotation: -180,
        duration: 0.8,
        ease: 'back.out(2)'
    }, '-=0.4')

    // Animate temperature
    tl.from('.temperature-display', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out'
    }, '-=0.4')

    // Animate condition and location
    tl.from('.weather-condition, .weather-location', {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.5,
        ease: 'power2.out'
    }, '-=0.3')

    // Animate detail cards
    tl.from('.detail-card', {
        scale: 0.8,
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.5,
        ease: 'back.out(1.7)'
    }, '-=0.3')

    // Animate particles
    tl.to('.particle', {
        scale: 1,
        opacity: 1,
        stagger: 0.05,
        duration: 0.5,
        ease: 'power2.out'
    }, '-=0.5')

    // Continuous floating animation for icon
    gsap.to('.weather-icon', {
        y: -15,
        duration: 2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true
    })

    // Pulse glow animation
    gsap.to('.weather-glow', {
        scale: 1.5,
        opacity: 0.3,
        duration: 2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true
    })
}

onMounted(() => {
    fetchWeather()

    // Update weather every 30 minutes
    setInterval(fetchWeather, 30 * 60 * 1000)
})
</script>

<style scoped>
.weather-widget {
    position: fixed;
    bottom: var(--space-8);
    right: var(--space-8);
    z-index: 100;
}

.weather-container {
    width: 380px;
    background: linear-gradient(135deg,
            rgba(255, 255, 255, 0.1) 0%,
            rgba(255, 255, 255, 0.05) 100%);
    backdrop-filter: blur(30px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 24px;
    padding: var(--space-8);
    box-shadow:
        0 20px 60px rgba(0, 0, 0, 0.15),
        0 0 0 1px rgba(255, 255, 255, 0.1) inset;
    position: relative;
    overflow: hidden;
}

/* Animated particles */
.weather-particles {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    overflow: hidden;
}

.particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: rgba(91, 124, 153, 0.3);
    border-radius: 50%;
    opacity: 0;
    transform: scale(0);
    animation: particleDrift 15s ease-in-out infinite;
    animation-delay: calc(var(--particle-index) * -1.2s);
}

.particle:nth-child(odd) {
    left: calc(8% * var(--particle-index));
    animation-duration: 12s;
}

.particle:nth-child(even) {
    right: calc(8% * var(--particle-index));
    animation-duration: 18s;
}

@keyframes particleDrift {

    0%,
    100% {
        transform: translateY(0) scale(0.5);
        opacity: 0;
    }

    10% {
        opacity: 0.5;
    }

    50% {
        transform: translateY(-120px) translateX(20px) scale(1);
        opacity: 0.8;
    }

    90% {
        opacity: 0.3;
    }
}

/* Main weather display */
.weather-main {
    display: flex;
    align-items: center;
    gap: var(--space-6);
    margin-bottom: var(--space-8);
    position: relative;
    z-index: 2;
}

.weather-icon-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.weather-icon {
    font-size: 6rem;
    line-height: 1;
    position: relative;
    z-index: 2;
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2));
}

.weather-glow {
    position: absolute;
    width: 120px;
    height: 120px;
    background: radial-gradient(circle,
            rgba(91, 124, 153, 0.4) 0%,
            transparent 70%);
    border-radius: 50%;
    z-index: 1;
}

.weather-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

.temperature-display {
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
}

.temp-value {
    font-family: var(--font-serif);
    font-size: 4rem;
    font-weight: 300;
    line-height: 1;
    color: var(--text-primary);
    background: linear-gradient(135deg,
            var(--text-primary) 0%,
            var(--accent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.temp-unit {
    font-family: var(--font-sans);
    font-size: 1.5rem;
    font-weight: 300;
    color: var(--text-secondary);
}

.weather-condition {
    font-family: var(--font-sans);
    font-size: 1.1rem;
    font-weight: 400;
    color: var(--text-primary);
    letter-spacing: 0.05em;
}

.weather-location {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-serif);
    font-size: 0.9rem;
    font-weight: 300;
    color: var(--text-tertiary);
    letter-spacing: 0.08em;
}

.location-icon {
    font-size: 1rem;
    line-height: 1;
}

/* Weather details grid */
.weather-details {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-3);
    margin-bottom: var(--space-6);
    position: relative;
    z-index: 2;
}

.detail-card {
    background: linear-gradient(135deg,
            rgba(255, 255, 255, 0.08) 0%,
            rgba(255, 255, 255, 0.02) 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    transition: all 0.3s ease;
    cursor: pointer;
}

.detail-card:hover {
    transform: translateY(-4px);
    background: linear-gradient(135deg,
            rgba(255, 255, 255, 0.12) 0%,
            rgba(255, 255, 255, 0.06) 100%);
    border-color: rgba(91, 124, 153, 0.3);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.detail-icon {
    font-size: 2rem;
    line-height: 1;
    animation: detailIconBounce 2s ease-in-out infinite;
}

.detail-card:nth-child(1) .detail-icon {
    animation-delay: 0s;
}

.detail-card:nth-child(2) .detail-icon {
    animation-delay: 0.3s;
}

.detail-card:nth-child(3) .detail-icon {
    animation-delay: 0.6s;
}

@keyframes detailIconBounce {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-5px);
    }
}

.detail-content {
    text-align: center;
}

.detail-value {
    font-family: var(--font-serif);
    font-size: 1.3rem;
    font-weight: 400;
    color: var(--text-primary);
    margin-bottom: var(--space-1);
}

.detail-label {
    font-family: var(--font-sans);
    font-size: 0.7rem;
    font-weight: 400;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.1em;
}

/* Footer */
.weather-footer {
    text-align: center;
    padding-top: var(--space-4);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;
    z-index: 2;
}

.update-time {
    font-family: var(--font-serif);
    font-size: 0.75rem;
    font-weight: 300;
    color: var(--text-tertiary);
    letter-spacing: 0.08em;
}

/* Responsive */
@media (max-width: 768px) {
    .weather-widget {
        bottom: var(--space-4);
        right: var(--space-4);
        left: var(--space-4);
    }

    .weather-container {
        width: auto;
    }

    .weather-icon {
        font-size: 4rem;
    }

    .temp-value {
        font-size: 3rem;
    }

    .weather-details {
        grid-template-columns: repeat(3, 1fr);
    }
}
</style>
