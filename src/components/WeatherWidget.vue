<template>
    <div class="weather-widget" v-if="weather" ref="weatherWidgetRef">
        <!-- Minimalist Japanese container -->
        <div class="weather-container">
            <!-- Vertical Japanese text decoration -->
            <div class="weather-kanji">天気</div>

            <!-- Main weather display -->
            <div class="weather-main">
                <div class="weather-temp">
                    <span class="temp-value">{{ Math.round(weather.temp) }}</span>
                    <span class="temp-unit">°</span>
                </div>

                <div class="weather-divider"></div>

                <div class="weather-info">
                    <div class="weather-condition">{{ weather.condition }}</div>
                    <div class="weather-location">{{ weather.location }}</div>
                </div>
            </div>

            <!-- Weather details - minimalist grid -->
            <div class="weather-details">
                <div class="detail-item">
                    <span class="detail-label">Humidity <span class="label-jp">湿度</span></span>
                    <span class="detail-value">{{ weather.humidity }}%</span>
                </div>
                <div class="detail-divider"></div>
                <div class="detail-item">
                    <span class="detail-label">Wind <span class="label-jp">風速</span></span>
                    <span class="detail-value">{{ weather.windSpeed }}</span>
                </div>
                <div class="detail-divider"></div>
                <div class="detail-item">
                    <span class="detail-label">Feels <span class="label-jp">体感</span></span>
                    <span class="detail-value">{{ Math.round(weather.feelsLike) }}°</span>
                </div>
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
    // Try automatic detection
    try {
        // Check if geolocation is available
        if (!navigator.geolocation) {
            console.warn('Geolocation not supported, using IP-based location')
            await fetchWeatherByIP()
            return
        }

        // Get user's location with better error handling
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                resolve,
                (error) => {
                    console.error('Geolocation error:', error.message)
                    reject(error)
                },
                {
                    timeout: 15000,
                    enableHighAccuracy: true,
                    maximumAge: 300000 // Cache position for 5 minutes
                }
            )
        })

        const { latitude, longitude } = position.coords
        console.log(`Location detected: ${latitude}, ${longitude}`)

        // Fetch weather from Open-Meteo (free, no API key needed)
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
        )
        const weatherData = await weatherResponse.json()

        // Fetch location name from reverse geocoding with User-Agent
        const locationResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10`
        )
        const locationData = await locationResponse.json()

        const cityName = locationData.address?.city ||
            locationData.address?.town ||
            locationData.address?.village ||
            locationData.address?.county ||
            locationData.address?.state ||
            'Your Location'

        console.log('Location name:', cityName)

        weather.value = {
            temp: weatherData.current.temperature_2m,
            feelsLike: weatherData.current.apparent_temperature,
            humidity: weatherData.current.relative_humidity_2m,
            windSpeed: Math.round(weatherData.current.wind_speed_10m),
            condition: getWeatherCondition(weatherData.current.weather_code),
            location: cityName,
            lastUpdated: new Date()
        }

        // Trigger animations after data loads
        nextTick(() => {
            animateWeatherWidget()
        })
    } catch (error) {
        console.error('Failed to fetch weather with geolocation:', error)
        // Try IP-based location as fallback
        await fetchWeatherByIP()
    }
}

// Function to get weather based on IP address
const fetchWeatherByIP = async () => {
    try {
        console.log('Attempting IP-based location...')

        // Get location from IP using ipapi.co (free, no key needed)
        const ipResponse = await fetch('https://ipapi.co/json/')
        const ipData = await ipResponse.json()

        const { latitude, longitude, city, country_name } = ipData
        console.log(`IP location: ${city}, ${country_name} (${latitude}, ${longitude})`)

        // Fetch weather from Open-Meteo
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
        )
        const weatherData = await weatherResponse.json()

        weather.value = {
            temp: weatherData.current.temperature_2m,
            feelsLike: weatherData.current.apparent_temperature,
            humidity: weatherData.current.relative_humidity_2m,
            windSpeed: Math.round(weatherData.current.wind_speed_10m),
            condition: getWeatherCondition(weatherData.current.weather_code),
            location: city || country_name || 'Your Location',
            lastUpdated: new Date()
        }

        nextTick(() => {
            animateWeatherWidget()
        })
    } catch (error) {
        console.error('Failed to fetch weather by IP:', error)
        // Final fallback
        fetchDefaultWeather()
    }
}

const fetchDefaultWeather = async () => {
    try {
        console.log('Using default location (Jakarta, Indonesia)')
        // Default to Jakarta, Indonesia coordinates
        const weatherResponse = await fetch(
            'https://api.open-meteo.com/v1/forecast?latitude=-6.2088&longitude=106.8456&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto'
        )
        const weatherData = await weatherResponse.json()

        weather.value = {
            temp: weatherData.current.temperature_2m,
            feelsLike: weatherData.current.apparent_temperature,
            humidity: weatherData.current.relative_humidity_2m,
            windSpeed: Math.round(weatherData.current.wind_speed_10m),
            condition: getWeatherCondition(weatherData.current.weather_code),
            location: 'Jakarta',
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
    width: 280px;
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 2px;
    padding: var(--space-6);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    position: relative;
    font-family: var(--font-serif);
}

/* Vertical Japanese text decoration */
.weather-kanji {
    position: absolute;
    top: var(--space-6);
    left: var(--space-4);
    writing-mode: vertical-rl;
    font-family: var(--font-serif);
    font-size: 0.75rem;
    font-weight: 300;
    color: rgba(0, 0, 0, 0.15);
    letter-spacing: 0.2em;
}

/* Main weather display */
.weather-main {
    display: flex;
    align-items: center;
    gap: var(--space-5);
    margin-bottom: var(--space-6);
    padding-left: var(--space-6);
}

.weather-temp {
    display: flex;
    align-items: baseline;
}

.temp-value {
    font-size: 4.5rem;
    font-weight: 200;
    line-height: 1;
    color: #1a1a1a;
    letter-spacing: -0.02em;
}

.temp-unit {
    font-size: 2rem;
    font-weight: 200;
    color: rgba(0, 0, 0, 0.4);
    margin-left: var(--space-1);
}

.weather-divider {
    width: 1px;
    height: 60px;
    background: rgba(0, 0, 0, 0.08);
}

.weather-info {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

.weather-condition {
    font-size: 0.9rem;
    font-weight: 300;
    color: rgba(0, 0, 0, 0.75);
    letter-spacing: 0.05em;
}

.weather-location {
    font-size: 0.75rem;
    font-weight: 300;
    color: rgba(0, 0, 0, 0.35);
    letter-spacing: 0.1em;
    text-transform: uppercase;
}

/* Weather details - minimalist grid */
.weather-details {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4) var(--space-6);
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    margin-bottom: var(--space-4);
}

.detail-item {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    align-items: center;
}

.detail-label {
    font-size: 0.65rem;
    font-weight: 300;
    color: rgba(255, 255, 255, 0.35);
    letter-spacing: 0.1em;
    text-transform: uppercase;
}

.label-jp {
    font-size: 0.6rem;
    opacity: 0.3;
    margin-left: var(--space-1);
    font-weight: 300;
}

.detail-value {
    font-size: 0.95rem;
    font-weight: 300;
    color: rgba(255, 255, 255, 0.85);
}

.detail-divider {
    width: 1px;
    height: 30px;
    background: rgba(0, 0, 0, 0.06);
}

/* Responsive */
@media (max-width: 768px) {
    .weather-widget {
        bottom: var(--space-4);
        right: var(--space-4);
    }

    .weather-container {
        width: 260px;
    }

    .temp-value {
        font-size: 3.5rem;
    }
}
</style>
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
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

.settings-content {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(30px) saturate(180%);
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 16px;
    width: 90%;
    max-width: 420px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    animation: slideUp 0.3s ease;
}

@keyframes slideUp {
    from {
        transform: translateY(30px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.settings-header {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    padding: var(--space-7);
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    position: relative;
}

.settings-header h3 {
    font-family: var(--font-serif);
    font-size: 1.8rem;
    font-weight: 300;
    color: var(--text-primary);
    margin: 0;
    letter-spacing: 0.02em;
}

.close-btn {
    position: absolute;
    top: var(--space-6);
    right: var(--space-6);
    background: transparent;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    line-height: 1;
    cursor: pointer;
    transition: all 0.3s ease;
    color: var(--text-secondary);
}

.close-btn:hover {
    background: rgba(0, 0, 0, 0.04);
    border-color: rgba(0, 0, 0, 0.15);
    transform: rotate(90deg);
}

.settings-body {
    padding: var(--space-7);
}

.input-group {
    margin-bottom: var(--space-5);
}

.input-group label {
    display: block;
    font-family: var(--font-sans);
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--text-secondary);
    margin-bottom: var(--space-3);
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

.input-group input {
    width: 100%;
    background: rgba(0, 0, 0, 0.02);
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 8px;
    padding: var(--space-4);
    font-family: var(--font-sans);
    font-size: 1rem;
    color: var(--text-primary);
    transition: all 0.3s ease;
}

.input-group input:focus {
    outline: none;
    background: rgba(0, 0, 0, 0.03);
    border-color: rgba(0, 0, 0, 0.2);
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.03);
}

.input-group input::placeholder {
    color: var(--text-muted);
}

.saved-location {
    padding: var(--space-4);
    background: rgba(52, 199, 89, 0.08);
    border: 1px solid rgba(52, 199, 89, 0.2);
    border-radius: 8px;
    font-family: var(--font-sans);
    font-size: 0.9rem;
    color: var(--text-secondary);
    letter-spacing: 0.02em;
}

.settings-footer {
    display: flex;
    gap: var(--space-4);
    padding: var(--space-7);
    border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.btn-cancel,
.btn-save {
    flex: 1;
    padding: var(--space-4);
    border-radius: 8px;
    font-family: var(--font-sans);
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
}

.btn-cancel {
    background: rgba(0, 0, 0, 0.04);
    color: var(--text-secondary);
}

.btn-cancel:hover {
    background: rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
}

.btn-save {
    background: var(--text-primary);
    color: #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}


