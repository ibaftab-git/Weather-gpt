const weatherForm = document.querySelector("#weather-form");
const cityInput = document.querySelector("#city-input");
const submitButton = weatherForm.querySelector("button");
const statusMessage = document.querySelector("#status-message");
const locationTitle = document.querySelector("#location-title");
const currentCondition = document.querySelector("#current-condition");
const currentTemperature = document.querySelector("#current-temperature");
const feelsLike = document.querySelector("#feels-like");
const humidity = document.querySelector("#humidity");
const windSpeed = document.querySelector("#wind-speed");
const visibility = document.querySelector("#visibility");
const sourceLabel = document.querySelector("#source-label");
const forecastList = document.querySelector("#forecast-list");

function formatNumber(value, unit) {
  if (!Number.isFinite(value)) {
    return "Not available";
  }

  return `${Math.round(value)}${unit}`;
}

function formatVisibility(value) {
  if (!Number.isFinite(value)) {
    return "Not available";
  }

  return `${(value / 1000).toFixed(1)} km`;
}

function formatDate(dateText) {
  const date = new Date(`${dateText}T00:00:00Z`);

  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC"
  }).format(date);
}

function createForecastCard(day) {
  const card = document.createElement("article");
  const date = document.createElement("p");
  const condition = document.createElement("p");
  const temperature = document.createElement("p");
  const rainChance = document.createElement("p");

  card.className = "forecast-day";
  date.className = "forecast-date";
  condition.className = "forecast-condition";
  temperature.className = "forecast-temperature";
  rainChance.className = "forecast-extra";

  date.textContent = formatDate(day.date);
  condition.textContent = day.condition;
  temperature.textContent = `${formatNumber(day.maxTemperatureC, "°")} / ${formatNumber(
    day.minTemperatureC,
    "°"
  )}`;
  rainChance.textContent = `Rain chance: ${formatNumber(day.rainProbabilityPercent, "%")}`;

  card.append(date, condition, temperature, rainChance);
  return card;
}

function renderWeather(weatherData) {
  const { location, source, current, forecast } = weatherData;
  const locationSuffix = location.state || location.country;

  locationTitle.textContent = `${location.city}, ${locationSuffix}`;
  currentCondition.textContent = current.condition;
  currentTemperature.textContent = formatNumber(current.temperatureC, "");
  feelsLike.textContent = formatNumber(current.feelsLikeC, " °C");
  humidity.textContent = formatNumber(current.humidityPercent, "%");
  windSpeed.textContent = formatNumber(current.windSpeedKmh, " km/h");
  visibility.textContent = formatVisibility(current.visibilityMeters);
  sourceLabel.textContent = `${source.provider} • Conditions time: ${source.currentConditionsTime} (${source.timezone})`;

  forecastList.replaceChildren();
  forecast.forEach((day) => {
    forecastList.append(createForecastCard(day));
  });
}

async function loadWeather(city) {
  statusMessage.textContent = `Loading live weather for ${city}...`;
  submitButton.disabled = true;

  try {
    const weatherResponse = await fetch(`/weather?city=${encodeURIComponent(city)}`);
    const weatherData = await weatherResponse.json();

    if (!weatherResponse.ok) {
      throw new Error(weatherData.error || "Could not load weather data.");
    }

    renderWeather(weatherData);
    statusMessage.textContent = `Showing live weather for ${weatherData.location.city}.`;
  } catch (error) {
    statusMessage.textContent = error.message;
  } finally {
    submitButton.disabled = false;
  }
}

weatherForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (!city) {
    statusMessage.textContent = "Please enter a city name.";
    return;
  }

  loadWeather(city);
});

const chatForm = document.querySelector("#chat-form");
const chatInput = document.querySelector("#chat-input");
const chatMessages = document.querySelector("#chat-messages");
const chatStatus = document.querySelector("#chat-status");
const chatSubmitButton = chatForm.querySelector("button");

function addChatMessage(role, message) {
  const messageElement = document.createElement("div");
  const labelElement = document.createElement("strong");
  const textElement = document.createElement("p");

  messageElement.className = `chat-message ${
    role === "user" ? "user-message" : "assistant-message"
  }`;

  labelElement.textContent = role === "user" ? "You" : "WeatherGPT";
  textElement.textContent = message;

  messageElement.append(labelElement, textElement);
  chatMessages.append(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendChatMessage(message, city) {
  chatStatus.textContent = "WeatherGPT is thinking...";
  chatSubmitButton.disabled = true;
  chatInput.disabled = true;

  try {
    const chatResponse = await fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
  message,
  city: cityInput.value.trim()
  })
    });

    const chatData = await chatResponse.json();

    if (!chatResponse.ok) {
      throw new Error(chatData.error || "Could not get an AI response.");
    }

    addChatMessage("assistant", chatData.answer);
    chatStatus.textContent = "";
  } catch (error) {
    chatStatus.textContent = error.message;
  } finally {
    chatSubmitButton.disabled = false;
    chatInput.disabled = false;
    chatInput.focus();
  }
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const message = chatInput.value.trim();

  if (!message) {
    return;
  }

  const city = cityInput.value.trim();

  if (!city) {
    chatStatus.textContent = "Please enter a city name first.";
    return;
  }

  addChatMessage("user", message);
  chatInput.value = "";

  sendChatMessage(message, city);
});