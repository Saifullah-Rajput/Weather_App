
const API_KEY ='f7903c2d68fb950c5baa4eb9430e549a';
// Weather mappings with more comprehensive coverage
const weatherBackgrounds = {
    'clear': 'sunny',
    'sunny': 'sunny',
    'cloud': 'cloudy',
    'clouds': 'cloudy',
    'overcast': 'cloudy',
    'scattered clouds': 'cloudy',
    'broken clouds': 'cloudy',
    'few clouds': 'cloudy',
    'rain': 'rainy',
    'drizzle': 'rainy',
    'light rain': 'rainy',
    'moderate rain': 'rainy',
    'heavy rain': 'rainy',
    'shower rain': 'rainy',
    'snow': 'snowy',
    'light snow': 'snowy',
    'heavy snow': 'snowy',
    'sleet': 'snowy',
    'thunderstorm': 'stormy',
    'storm': 'stormy',
    'thunder': 'stormy',
    'mist': 'cloudy',
    'fog': 'cloudy',
    'haze': 'cloudy',
    'smoke': 'cloudy',
    'dust': 'cloudy',
    'sand': 'cloudy',
    'ash': 'cloudy',
    'squall': 'stormy',
    'tornado': 'stormy'
};

const weatherIcons = {
    'clear': 'fas fa-sun',
    'sunny': 'fas fa-sun',
    'clouds': 'fas fa-cloud',
    'cloud': 'fas fa-cloud',
    'overcast': 'fas fa-cloud',
    'rain': 'fas fa-cloud-rain',
    'drizzle': 'fas fa-cloud-sun-rain',
    'thunderstorm': 'fas fa-bolt',
    'snow': 'fas fa-snowflake',
    'mist': 'fas fa-smog',
    'fog': 'fas fa-smog',
    'haze': 'fas fa-smog',
    'storm': 'fas fa-poo-storm',
    'tornado': 'fas fa-wind'
};

// DOM Elements
const searchBtn = document.getElementById('searchBtn');
const forecastToggleBtn = document.getElementById('forecastToggleBtn');
const resetBtn = document.getElementById('resetBtn');
const closeForecastBtn = document.getElementById('closeForecast');
const cityInput = document.getElementById('cityInput');
const weatherContainer = document.querySelector('.weather-container');
const forecastContainer = document.getElementById('forecastContainer');

// Current weather data storage
let currentWeatherData = null;

// Initialize with empty state
document.addEventListener('DOMContentLoaded', () => {
    // Set default placeholder
    cityInput.placeholder = "Enter city name...";
    
    // Add weather-specific animations to CSS
    addWeatherAnimations();
    
    // Set initial welcome state
    showWelcomeState();
    
    // Set up event listeners
    searchBtn.addEventListener('click', handleSearch);
    forecastToggleBtn.addEventListener('click', toggleForecastView);
    resetBtn.addEventListener('click', handleReset);
    
    // Close forecast button should just close the forecast view, NOT reset
    closeForecastBtn.addEventListener('click', closeForecastView);
    
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    // Hide reset button initially
    resetBtn.style.display = 'none';
    forecastToggleBtn.style.display = 'none';
});

// Show welcome state (only called on initial load or reset)
function showWelcomeState() {
    document.getElementById('city').textContent = 'Track And Monitor Weather Conditions';
    document.getElementById('temp').textContent = '--';
    document.getElementById('desc').innerHTML = '<i class="fas fa-search"></i> Search for a city to see weather';
    document.getElementById('wind').textContent = '-- km/h';
    document.getElementById('humidity').textContent = '--%';
    document.getElementById('feelsLikeMain').textContent = '--°';
    document.getElementById('sunrise').textContent = '--:--';
    document.getElementById('sunset').textContent = '--:--';
    document.getElementById('feelsLike').textContent = '--°';
    document.getElementById('pressure').textContent = '-- hPa';
    
    // Clear forecast containers and show welcome message
    document.getElementById('hourlyForecast').innerHTML = `
        <div class="empty-state">
            <i class="fas fa-cloud-sun"></i>
            <p>Search for a city to see hourly forecast</p>
        </div>
    `;
    
    document.getElementById('dailyForecast').innerHTML = `
        <div class="empty-state">
            <i class="fas fa-calendar"></i>
            <p>Search for a city to see daily forecast</p>
        </div>
    `;
    
    // Clear current weather summary in forecast
    const currentWeatherSummary = document.getElementById('currentWeatherSummary');
    if (currentWeatherSummary) {
        currentWeatherSummary.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-cloud-sun"></i>
                <p>No weather data available</p>
            </div>
        `;
    }
    
    // Set default background
    document.body.classList.remove('sunny', 'cloudy', 'rainy', 'snowy', 'stormy', 'clear-night');
    
    // Hide forecast toggle button
    forecastToggleBtn.style.display = 'none';
    resetBtn.style.display = 'none';
    
    // Clear current weather data
    currentWeatherData = null;
}

// Toggle forecast view
function toggleForecastView() {
    if (!currentWeatherData) {
        showNotification('Search for a city first to see forecast', 'warning');
        return;
    }
    
    if (forecastContainer.classList.contains('active')) {
        // Close forecast view - return to main view with current data
        closeForecastView();
    } else {
        // Open forecast view - show forecast with current data
        forecastContainer.classList.add('active');
        forecastToggleBtn.innerHTML = '<i class="fas fa-home"></i> Main View';
       
        
        // Update forecast with current weather
        updateForecastWithCurrentWeather();
    }
}

// Close forecast view (just close, don't reset)
function closeForecastView() {
    if (forecastContainer.classList.contains('active')) {
        forecastContainer.classList.remove('active');
        forecastToggleBtn.innerHTML = '<i class="fas fa-chart-line"></i> Forecast';
        
    }
}

// Add weather-specific CSS animations
function addWeatherAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        /* Welcome animation */
        @keyframes welcomePulse {
            0%, 100% {
                transform: scale(1);
                opacity: 1;
            }
            50% {
                transform: scale(1.02);
                opacity: 0.9;
            }
        }
        
        /* Current weather summary styles */
        .current-weather-summary {
            background: rgba(13, 20, 60, 0.7);
            backdrop-filter: blur(15px);
            border-radius: 15px;
            padding: 20px;
            margin: 20px 0;
            border: 1px solid rgba(103, 58, 183, 0.4);
            box-shadow: 
                0 5px 25px rgba(103, 58, 183, 0.3),
                0 0 15px rgba(3, 169, 244, 0.2);
            position: relative;
            overflow: hidden;
        }
        
        .current-weather-summary::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 1px;
            background: linear-gradient(90deg, 
                transparent,
                rgba(3, 169, 244, 0.8),
                rgba(103, 58, 183, 0.8),
                transparent);
            animation: cardGlow 3s linear infinite;
        }
        
        .current-weather-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            color: #e3f2fd;
        }
        
        .current-main {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .current-icon {
            font-size: 3rem;
            background: linear-gradient(135deg, #00bcd4, #2196f3);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .current-details {
            text-align: left;
        }
        
        .current-temperature {
            font-size: 2.2rem;
            font-weight: 600;
            background: linear-gradient(135deg, #00bcd4, #2196f3, #673ab7);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 5px;
        }
        
        .current-description {
            font-size: 1.1rem;
            color: #bbdefb;
            text-transform: capitalize;
            margin-bottom: 8px;
        }
        
        .current-location {
            font-size: 0.9rem;
            color: #4fc3f7;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .current-stats {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            min-width: 200px;
        }
        
        .current-stat-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .current-stat-item i {
            font-size: 1.2rem;
            color: #4fc3f7;
            width: 24px;
        }
        
        .current-stat-value {
            font-size: 0.95rem;
            color: #e3f2fd;
            font-weight: 600;
        }
        
        .current-stat-label {
            font-size: 0.8rem;
            color: #bbdefb;
            margin-top: 2px;
        }
        
        /* Weather-specific animations */
        .sunny::before {
            animation: sunnyShimmer 10s ease infinite;
        }
        
        .cloudy::before {
            animation: cloudMove 20s linear infinite;
        }
        
        .rainy::before {
            animation: rainPattern 5s linear infinite;
        }
        
        .snowy::before {
            animation: snowDrift 30s linear infinite;
        }
        
        .stormy::before {
            animation: stormPulse 3s ease infinite;
        }
        
        .clear-night::before {
            animation: starGlow 8s ease infinite;
        }
        
        @keyframes sunnyShimmer {
            0%, 100% { opacity: 0.15; }
            50% { opacity: 0.25; }
        }
        
        @keyframes cloudMove {
            0% { transform: translate(0%, 0%); }
            100% { transform: translate(2%, 2%); }
        }
        
        @keyframes rainPattern {
            0% { background-position: 0% 0%; }
            100% { background-position: 0% 100%; }
        }
        
        @keyframes snowDrift {
            0% { transform: translateY(0px); }
            100% { transform: translateY(100px); }
        }
        
        @keyframes stormPulse {
            0%, 100% { filter: brightness(1); }
            50% { filter: brightness(1.2); }
        }
        
        @keyframes starGlow {
            0%, 100% { opacity: 0.08; }
            50% { opacity: 0.12; }
        }
        
        /* Responsive styles for current weather summary */
        @media (max-width: 768px) {
            .current-weather-content {
                flex-direction: column;
                text-align: center;
            }
            
            .current-main {
                flex-direction: column;
                text-align: center;
            }
            
            .current-details {
                text-align: center;
            }
            
            .current-stats {
                grid-template-columns: repeat(2, 1fr);
                width: 100%;
            }
            
            .current-stat-item {
                flex-direction: column;
                text-align: center;
            }
        }
        
        @media (max-width: 480px) {
            .current-stats {
                grid-template-columns: 1fr;
            }
            
            .current-temperature {
                font-size: 1.8rem;
            }
            
            .current-icon {
                font-size: 2.5rem;
            }
        }
    `;
    document.head.appendChild(style);
}

// Handle search
async function handleSearch() {
    const city = cityInput.value.trim();
    if (!city) {
        showNotification('Please enter a city name', 'warning');
        return;
    }
    
    // Show loading state
    showLoading(true);
    
    try {
        await getWeather(city);
        
        // Show forecast toggle button
        forecastToggleBtn.style.display = 'inline-block';
        resetBtn.style.display = 'inline-block';
        
    } catch (error) {
        console.error('Error:', error);
        showNotification('Failed to fetch weather data', 'error');
        showLoading(false);
    }
}

// Handle reset - ONLY called when user clicks reset button
function handleReset() {
    // Close forecast view if open
    if (forecastContainer.classList.contains('active')) {
        forecastContainer.classList.remove('active');
    }
    
    // Reset forecast toggle button text
    forecastToggleBtn.innerHTML = '<i class="fas fa-chart-line"></i> Forecast';
    
    // Reset to welcome state
    setTimeout(() => {
        showWelcomeState();
        cityInput.value = '';
        
        
        
        // Focus on search input for better UX
        cityInput.focus();
    }, 300);
}

// Show loading state
function showLoading(isLoading) {
    if (isLoading) {
        document.getElementById('city').textContent = 'Loading...';
        document.getElementById('temp').textContent = '--';
        document.getElementById('desc').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fetching weather...';
        
        // Show loading in forecast
        document.getElementById('hourlyForecast').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading hourly forecast...</p>
            </div>
        `;
        
        document.getElementById('dailyForecast').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading daily forecast...</p>
            </div>
        `;
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) existingNotification.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add notification styles if not already present
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(13, 20, 60, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(103, 58, 183, 0.3);
                border-left: 4px solid #4fc3f7;
                border-radius: 12px;
                padding: 12px 16px;
                color: white;
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 1000;
                transform: translateX(120%);
                transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                max-width: 300px;
                box-shadow: 
                    0 10px 30px rgba(0, 0, 0, 0.3),
                    0 0 20px rgba(103, 58, 183, 0.2);
                font-size: 0.9rem;
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification.error {
                border-left-color: #ff6b6b;
            }
            
            .notification.warning {
                border-left-color: #ffd93d;
            }
            
            .notification.info {
                border-left-color: #00bcd4;
            }
            
            @media (max-width: 768px) {
                .notification {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                    transform: translateY(-100%);
                }
                
                .notification.show {
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Update background
function updateBackground(weatherCondition, isDay = 1) {
    // Remove all weather classes
    const weatherClasses = ['sunny', 'cloudy', 'rainy', 'snowy', 'stormy', 'clear-night'];
    document.body.classList.remove(...weatherClasses);
    
    const weatherConditionLower = weatherCondition.toLowerCase();
    let weatherClass = weatherBackgrounds[weatherConditionLower] || 'sunny';
    
    // Handle night time for clear skies
    if (isDay === 0 && (weatherConditionLower.includes('clear') || weatherConditionLower.includes('sunny'))) {
        weatherClass = 'clear-night';
    }
    
    // Smooth transition with delay
    setTimeout(() => {
        document.body.classList.add(weatherClass);
    }, 200);
}

// Get weather icon
function getWeatherIcon(weatherCondition, isDay = 1) {
    const condition = weatherCondition.toLowerCase();
    
    // Use Font Awesome for main weather icon
    let iconClass = weatherIcons[condition] || 'fas fa-cloud';
    
    // Night time adjustments
    if (isDay === 0 && (condition.includes('clear') || condition.includes('sunny'))) {
        iconClass = 'fas fa-moon';
    } else if (isDay === 0 && condition.includes('cloud')) {
        iconClass = 'fas fa-cloud-moon';
    }
    
    return `<i class="${iconClass}"></i>`;
}

// Get weather data
async function getWeather(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
        );
        const data = await response.json();

        if (data.cod === "404") {
            showNotification(`City "${city}" not found. Please try another city.`, 'warning');
            showWelcomeState();
            return;
        }
        
        if (data.cod !== 200) {
            throw new Error(data.message || 'Failed to fetch weather');
        }
        
        // Store current weather data
        currentWeatherData = data;
        
        // Determine if it's day or night
        const currentTime = Math.floor(Date.now() / 1000);
        const isDay = (currentTime > data.sys.sunrise && currentTime < data.sys.sunset) ? 1 : 0;
        
        // Update main display
        document.getElementById('city').textContent = `${data.name}, ${data.sys.country}`;
        document.getElementById('temp').textContent = `${Math.round(data.main.temp)}`;
        document.getElementById('desc').innerHTML = `
            ${getWeatherIcon(data.weather[0].main, isDay)}
            ${data.weather[0].description}
        `;
        
        // Update additional weather details
        document.getElementById('wind').textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
        document.getElementById('humidity').textContent = `${data.main.humidity}%`;
        document.getElementById('feelsLikeMain').textContent = `${Math.round(data.main.feels_like)}°`;
        
        if (document.getElementById('sunrise')) {
            const sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            document.getElementById('sunrise').textContent = sunriseTime;
        }
        
        if (document.getElementById('sunset')) {
            const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            document.getElementById('sunset').textContent = sunsetTime;
        }
        
        if (document.getElementById('feelsLike')) {
            document.getElementById('feelsLike').textContent = `${Math.round(data.main.feels_like)}°`;
        }
        
        if (document.getElementById('pressure')) {
            document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
        }
        
        // Update background with reactive effects
        updateBackground(data.weather[0].main, isDay);
        
        // Get forecast data
        await getForecast(city);
        
        // Remove loading state
        showLoading(false);
        
    } catch (error) {
        console.error('Error fetching weather:', error);
        
        showNotification('Unable to fetch weather data. Please check your connection.', 'error');
        showWelcomeState();
    }
}

// Update forecast container with current weather
function updateForecastWithCurrentWeather() {
    if (!currentWeatherData) return;
    
    // Check if current weather summary already exists
    let currentWeatherSummary = document.getElementById('currentWeatherSummary');
    
    if (!currentWeatherSummary) {
        // Create current weather summary container
        currentWeatherSummary = document.createElement('div');
        currentWeatherSummary.id = 'currentWeatherSummary';
        currentWeatherSummary.className = 'current-weather-summary';
        
        // Insert it at the top of forecast content
        const forecastContent = document.querySelector('.forecast-content');
        const firstChild = forecastContent.firstChild;
        forecastContent.insertBefore(currentWeatherSummary, firstChild);
    }
    
    // Determine if it's day or night
    const currentTime = Math.floor(Date.now() / 1000);
    const isDay = (currentTime > currentWeatherData.sys.sunrise && currentTime < currentWeatherData.sys.sunset) ? 1 : 0;
    
    // Get current time in readable format
    const currentTimeFormatted = new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
    
    // Update current weather summary
    currentWeatherSummary.innerHTML = `
        <div class="current-weather-content">
            <div class="current-main">
                <div class="current-icon">
                    ${getWeatherIcon(currentWeatherData.weather[0].main, isDay)}
                </div>
                <div class="current-details">
                    <div class="current-temperature">
                        ${Math.round(currentWeatherData.main.temp)}°C
                    </div>
                    <div class="current-description">
                        ${currentWeatherData.weather[0].description}
                    </div>
                    <div class="current-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${currentWeatherData.name}, ${currentWeatherData.sys.country}
                        <span style="margin-left: 15px; opacity: 0.8;">
                            <i class="far fa-clock"></i> ${currentTimeFormatted}
                        </span>
                    </div>
                </div>
            </div>
            <div class="current-stats">
                <div class="current-stat-item">
                    <i class="fas fa-temperature-high"></i>
                    <div>
                        <div class="current-stat-value">${Math.round(currentWeatherData.main.feels_like)}°C</div>
                        <div class="current-stat-label">Feels Like</div>
                    </div>
                </div>
                <div class="current-stat-item">
                    <i class="fas fa-wind"></i>
                    <div>
                        <div class="current-stat-value">${Math.round(currentWeatherData.wind.speed * 3.6)} km/h</div>
                        <div class="current-stat-label">Wind Speed</div>
                    </div>
                </div>
                <div class="current-stat-item">
                    <i class="fas fa-tint"></i>
                    <div>
                        <div class="current-stat-value">${currentWeatherData.main.humidity}%</div>
                        <div class="current-stat-label">Humidity</div>
                    </div>
                </div>
                <div class="current-stat-item">
                    <i class="fas fa-compress-alt"></i>
                    <div>
                        <div class="current-stat-value">${currentWeatherData.main.pressure} hPa</div>
                        <div class="current-stat-label">Pressure</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Get forecast data
async function getForecast(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&cnt=40&appid=${API_KEY}`
        );
        const data = await response.json();

        if (data.cod !== "200") {
            throw new Error(data.message || 'Failed to fetch forecast');
        }

        // Clear existing forecast containers (but keep current weather summary)
        document.getElementById('hourlyForecast').innerHTML = '';
        document.getElementById('dailyForecast').innerHTML = '';

        // Hourly forecast (next 6 entries, 3-hour intervals)
        const hourlyItems = data.list.slice(0, 6);
        
        if (hourlyItems.length === 0) {
            document.getElementById('hourlyForecast').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-info-circle"></i>
                    <p>Hourly forecast not available</p>
                </div>
            `;
        } else {
            hourlyItems.forEach((item, index) => {
                const time = new Date(item.dt * 1000).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
                const temp = Math.round(item.main.temp);
                const icon = getWeatherIcon(item.weather[0].main, 1);
                
                const card = document.createElement('div');
                card.className = 'forecast-card';
                card.style.animationDelay = `${0.1 + (index * 0.1)}s`;
                card.innerHTML = `
                    <div class="icon">${icon}</div>
                    <div class="time">${time}</div>
                    <div class="temp">${temp}°</div>
                    <div class="desc">${item.weather[0].description}</div>
                `;
                document.getElementById('hourlyForecast').appendChild(card);
            });
        }

        // Group by day for daily forecast
        const dailyMap = new Map();
        
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dayKey = date.toLocaleDateString('en-US', { 
                weekday: 'short' 
            });
            
            if (!dailyMap.has(dayKey)) {
                dailyMap.set(dayKey, {
                    date: dayKey,
                    temp_min: item.main.temp_min,
                    temp_max: item.main.temp_max,
                    weather: item.weather[0],
                    items: [item]
                });
            } else {
                const dayData = dailyMap.get(dayKey);
                dayData.temp_min = Math.min(dayData.temp_min, item.main.temp_min);
                dayData.temp_max = Math.max(dayData.temp_max, item.main.temp_max);
                dayData.items.push(item);
            }
        });

        // Get next 5 days (skip today if it's the first day)
        let dayIndex = 0;
        const daysToShow = 5;
        const dayEntries = Array.from(dailyMap.entries());
        
        if (dayEntries.length === 0) {
            document.getElementById('dailyForecast').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-info-circle"></i>
                    <p>Daily forecast not available</p>
                </div>
            `;
        } else {
            // Skip today if it's in the list
            const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
            const startIndex = dayEntries[0][0] === today ? 1 : 0;
            
            for (let i = startIndex; i < Math.min(startIndex + daysToShow, dayEntries.length); i++) {
                const [dayName, dayData] = dayEntries[i];
                const high = Math.round(dayData.temp_max);
                const low = Math.round(dayData.temp_min);
                const icon = getWeatherIcon(dayData.weather.main, 1);
                
                // Find most common weather for the day
                const weatherCounts = {};
                dayData.items.forEach(item => {
                    const weather = item.weather[0].main;
                    weatherCounts[weather] = (weatherCounts[weather] || 0) + 1;
                });
                const mostCommonWeather = Object.keys(weatherCounts).reduce((a, b) => 
                    weatherCounts[a] > weatherCounts[b] ? a : b
                );
                
                const card = document.createElement('div');
                card.className = 'forecast-card';
                card.style.animationDelay = `${0.3 + (dayIndex * 0.1)}s`;
                card.innerHTML = `
                    <div class="icon">${icon}</div>
                    <div class="time">${dayName}</div>
                    <div class="temp">${high}°/${low}°</div>
                    <div class="desc">${mostCommonWeather.toLowerCase()}</div>
                `;
                document.getElementById('dailyForecast').appendChild(card);
                dayIndex++;
            }
        }

    } catch (error) {
        console.error('Error fetching forecast:', error);
        document.getElementById('hourlyForecast').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load forecast data</p>
            </div>
        `;
        document.getElementById('dailyForecast').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load forecast data</p>
            </div>
        `;
    }
}

// Handle window resize for responsive behavior
window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
        // Mobile-specific adjustments
        forecastContainer.style.position = 'fixed';
        forecastContainer.style.top = '0';
        forecastContainer.style.left = '0';
        forecastContainer.style.width = '100%';
        forecastContainer.style.height = '100%';
        forecastContainer.style.borderRadius = '0';
        forecastContainer.style.zIndex = '100';
    } else {
        // Desktop styles
        forecastContainer.style.position = 'absolute';
        forecastContainer.style.top = '0';
        forecastContainer.style.left = '0';
        forecastContainer.style.width = '100%';
        forecastContainer.style.height = '100%';
        forecastContainer.style.borderRadius = '24px';
        forecastContainer.style.zIndex = '20';
    }
});

// Initialize responsive styles
window.dispatchEvent(new Event('resize'));