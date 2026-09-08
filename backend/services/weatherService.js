const GEOCODING_API_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_API_URL = "https://api.open-meteo.com/v1/forecast";

const WEATHER_CONDITIONS = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail"
};

async function fetchJson(url, errorMessage) {
  const apiResponse = await fetch(url);

  if (!apiResponse.ok) {
    throw new Error(`${errorMessage} Status: ${apiResponse.status}`);
  }

  return apiResponse.json();
}

async function findLocation(city) {
  const searchParameters = new URLSearchParams({
    name: city,
    count: "1",
    language: "en",
    format: "json"
  });

  const url = `${GEOCODING_API_URL}?${searchParameters.toString()}`;
  const locationData = await fetchJson(url, "Could not search for the city.");

  return locationData.results ? locationData.results[0] : null;
}

async function getRawWeather(location) {
  const forecastParameters = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,surface_pressure,visibility",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max",
    timezone: "auto",
    forecast_days: "7"
  });

  const url = `${FORECAST_API_URL}?${forecastParameters.toString()}`;
  return fetchJson(url, "Could not retrieve live weather data.");
}

function getWeatherCondition(weatherCode) {
  return WEATHER_CONDITIONS[weatherCode] || "Unknown weather condition";
}

function cleanWeatherData(location, rawWeatherData) {
  const current = rawWeatherData.current;
  const daily = rawWeatherData.daily;

  const forecast = daily.time.map((date, index) => ({
    date,
    condition: getWeatherCondition(daily.weather_code[index]),
    minTemperatureC: daily.temperature_2m_min[index],
    maxTemperatureC: daily.temperature_2m_max[index],
    rainProbabilityPercent: daily.precipitation_probability_max[index],
    precipitationMm: daily.precipitation_sum[index],
    maxWindSpeedKmh: daily.wind_speed_10m_max[index]
  }));

  return {
    location: {
      city: location.name,
      state: location.admin1 || null,
      country: location.country,
      latitude: location.latitude,
      longitude: location.longitude
    },
    source: {
      provider: "Open-Meteo",
      dataType: "Weather forecast model data",
      currentConditionsTime: current.time,
      timezone: rawWeatherData.timezone
    },
    current: {
      temperatureC: current.temperature_2m,
      feelsLikeC: current.apparent_temperature,
      humidityPercent: current.relative_humidity_2m,
      windSpeedKmh: current.wind_speed_10m,
      condition: getWeatherCondition(current.weather_code),
      precipitationMm: current.precipitation,
      rainMm: current.rain,
      pressureHpa: current.surface_pressure,
      visibilityMeters: current.visibility
    },
    forecast
  };
}

module.exports = {
  findLocation,
  getRawWeather,
  cleanWeatherData
};
