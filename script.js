
const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");

const errorMessage = document.getElementById("errorMessage");
const weatherResult = document.getElementById("weatherResult");

const weatherIcon = document.getElementById("weatherIcon");
const cityName = document.getElementById("cityName");
const weatherDescription = document.getElementById("weatherDescription");

const temperature = document.getElementById("temperature");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");


searchForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (city === "") {
    showError("Please enter a city name.");
    return;
  }

  getWeather(city);
});


async function getWeather(city) {
  try {
    clearError();

    weatherResult.style.opacity = "0.5";

    // Step 1: Find the city's coordinates
    const locationResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );

    if (!locationResponse.ok) {
      throw new Error("Unable to find location.");
    }

    const locationData = await locationResponse.json();

    if (!locationData.results || locationData.results.length === 0) {
      throw new Error("City not found. Please check the city name.");
    }

    const location = locationData.results[0];

    // Step 2: Get weather using latitude and longitude
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&temperature_unit=celsius&wind_speed_unit=kmh`
    );

    if (!weatherResponse.ok) {
      throw new Error("Unable to fetch weather data.");
    }

    const weatherData = await weatherResponse.json();

    // Step 3: Display the weather
    displayWeather(location, weatherData);

  } catch (error) {
    showError(error.message);
  } finally {
    weatherResult.style.opacity = "1";
  }
}


function displayWeather(location, weatherData) {
  const current = weatherData.current;

  cityName.textContent = `${location.name}, ${location.country}`;

  temperature.textContent =
    Math.round(current.temperature_2m);

  feelsLike.textContent =
    `${Math.round(current.apparent_temperature)}°C`;

  humidity.textContent =
    `${current.relative_humidity_2m}%`;

  windSpeed.textContent =
    `${Math.round(current.wind_speed_10m)} km/h`;

  weatherDescription.textContent =
    getWeatherDescription(current.weather_code);

  weatherIcon.textContent =
    getWeatherIcon(current.weather_code);
}


function getWeatherDescription(code) {
  const weatherCodes = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Heavy rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with heavy hail"
  };

  return weatherCodes[code] || "Unknown weather";
}


function getWeatherIcon(code) {
  if (code === 0) {
    return "☀️";
  }

  if ([1, 2].includes(code)) {
    return "🌤️";
  }

  if (code === 3) {
    return "☁️";
  }

  if ([45, 48].includes(code)) {
    return "🌫️";
  }

  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    return "🌧️";
  }

  if ([71, 73, 75].includes(code)) {
    return "❄️";
  }

  if ([95, 96, 99].includes(code)) {
    return "⛈️";
  }

  return "🌡️";
}


function showError(message) {
  errorMessage.textContent = message;
}


function clearError() {
  errorMessage.textContent = "";
}