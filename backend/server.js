const express = require("express");

const app = express();
const PORT = 3000;

app.get("/hello", (request, response) => {
  const name = request.query.name || "Guest";

  response.send(`Hello, ${name}, from WeatherGPT!`);
});

app.get("/weather", (request, response) => {
  const city = request.query.city || "Delhi";

  response.json({
    city,
    message: `Weather request received for ${city}.`,
    dataStatus: "Demo placeholder. Live weather data will be added in Milestone 6."
  });
});

app.listen(PORT, () => {
  console.log(`WeatherGPT server is running at http://localhost:${PORT}`);
});
