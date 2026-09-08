const { loadEnvFile } = require("node:process");
loadEnvFile();
const express = require("express");
const path = require("path");
const {
  findLocation,
  getRawWeather,
  cleanWeatherData
} = require("./services/weatherService");


const { getAIResponse } = require("./services/aiService");


const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/hello", (request, response) => {
  const name = request.query.name || "Guest";

  response.send(`Hello, ${name}, from WeatherGPT!`);
});

app.get("/weather", async (request, response) => {
  const city = request.query.city ? request.query.city.trim() : "";

  if (!city) {
    return response.status(400).json({
      error: "Please provide a city, for example: /weather?city=Delhi"
    });
  }

  try {
    const location = await findLocation(city);

    if (!location) {
      return response.status(404).json({
        error: `No location was found for "${city}". Try a more specific city name.`
      });
    }

    const rawWeatherData = await getRawWeather(location);
    const cleanedWeatherData = cleanWeatherData(location, rawWeatherData);

    return response.json(cleanedWeatherData);
  } catch (error) {
    console.error("Weather request failed:", error.message);

    return response.status(502).json({
      error: "Live weather data is temporarily unavailable. Please try again shortly."
    });
  }
});

app.post("/chat", async (request, response) => {
  const message =
    typeof request.body?.message === "string"
      ? request.body.message.trim()
      : "";

  const city =
    typeof request.body?.city === "string"
      ? request.body.city.trim()
      : "";

  if (!message) {
    return response.status(400).json({
      error: "Please provide a message."
    });
  }

  if (!city) {
    return response.status(400).json({
      error: "Please provide a city."
    });
  }

  try {
    const location = await findLocation(city);

    if (!location) {
      return response.status(404).json({
        error: `No location was found for "${city}". Try a more specific city name.`
      });
    }

    const rawWeatherData = await getRawWeather(location);
const weatherData = cleanWeatherData(location, rawWeatherData);

const selectedWeatherData = {
  location: weatherData.location,
  current: weatherData.current,
  forecast: weatherData.forecast
};

const answer = await getAIResponse(message, selectedWeatherData);

    return response.json({
  answer,
  weatherData: selectedWeatherData
});

  } catch (error) {
    console.error("Chat request failed:", error);

    return response.status(502).json({
      error: "Could not retrieve weather data or generate an AI response."
    });
  }
});

app.listen(PORT, () => {
  console.log(`WeatherGPT server is running at http://localhost:${PORT}`);
});