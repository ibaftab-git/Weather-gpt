const express = require("express");

const app = express();
const PORT = 3000;

app.get("/hello", (request, response) => {
  response.send("Hello from WeatherGPT!");
});

app.listen(PORT, () => {
  console.log(`WeatherGPT server is running at http://localhost:${PORT}`);
});
