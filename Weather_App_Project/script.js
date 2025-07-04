
const API_KEY ='f7903c2d68fb950c5baa4eb9430e549a';





const searchBtn = document.getElementById('searchBtn');
const resetBtn = document.getElementById('resetBtn');
const weatherContent = document.getElementById('weatherContent');

searchBtn.addEventListener('click', () => {
  const city = document.getElementById('cityInput').value.trim();
  if (city) {
    getWeather(city);
    getForecast(city);

    weatherContent.style.display = 'block';
    resetBtn.style.display = 'inline-block';
  }
});

resetBtn.addEventListener('click', () => {
  weatherContent.style.display = 'none';
  resetBtn.style.display = 'none';

  document.getElementById('cityInput').value = '';
  document.getElementById('city').innerText = 'City';
  document.getElementById('temp').innerText = '-- °C';
  document.getElementById('desc').innerText = 'Description';
  document.getElementById('hourly').innerHTML = '';
  document.getElementById('daily').innerHTML = '';
});

async function getWeather(city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
    );
    const data = await response.json();

    if (data.cod === "404") {
      document.getElementById('city').innerText = 'City not found';
      document.getElementById('temp').innerText = '-- °C';
      document.getElementById('desc').innerText = '';
    } else {
      document.getElementById('city').innerText = `${data.name}, ${data.sys.country}`;
      document.getElementById('temp').innerText = `${Math.round(data.main.temp)}°C`;
      document.getElementById('desc').innerText = data.weather[0].description;
    }
  } catch (error) {
    console.error('Error fetching weather:', error);
  }
}

async function getForecast(city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
    );
    const data = await response.json();

    const hourly = document.getElementById('hourly');
    const daily = document.getElementById('daily');
    hourly.innerHTML = '';
    daily.innerHTML = '';

    if (data.cod === "404") {
      hourly.innerHTML = '<p>Forecast not found.</p>';
      return;
    }

    // Hourly - next 5
    data.list.slice(0, 5).forEach(item => {
      const time = item.dt_txt.split(' ')[1].slice(0, 5);
      const temp = Math.round(item.main.temp);
      const desc = item.weather[0].description;

      const card = document.createElement('div');
      card.className = 'forecast-card';
      card.innerHTML = `
        <p>${time}</p>
        <p>${temp}°C</p>
        <p>${desc}</p>
      `;
      hourly.appendChild(card);
    });

    // Daily - pick one per day
    const dailyMap = {};
    data.list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyMap[date]) {
        dailyMap[date] = item;
      }
    });

    Object.keys(dailyMap).slice(0, 5).forEach(date => {
      const item = dailyMap[date];
      const temp = Math.round(item.main.temp);
      const desc = item.weather[0].description;

      const card = document.createElement('div');
      card.className = 'forecast-card';
      card.innerHTML = `
        <p>${date}</p>
        <p>${temp}°C</p>
        <p>${desc}</p>
      `;
      daily.appendChild(card);
    });

  } catch (error) {
    console.error('Error fetching forecast:', error);
  }
}
