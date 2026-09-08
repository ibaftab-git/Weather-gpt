const express = require("express");
const {
  findLocation,
  getRawWeather,
  cleanWeatherData
} = require("./services/weatherService");

const app = express();
const PORT = 3000;

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
        error: `No location was found for \"${city}\". Try a more specific city name.`
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

app.listen(PORT, () => {
  console.log(`WeatherGPT server is running at http://localhost:${PORT}`);
});
