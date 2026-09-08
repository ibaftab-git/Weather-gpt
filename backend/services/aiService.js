const OpenAI = require("openai");

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

async function getAIResponse(message, weatherData) {
  const context = `
You are WeatherGPT, a weather assistant.

GROUNDING RULES:
- Use the supplied weather data as the factual source for weather information.
- Do not invent weather values, conditions, temperatures, rain probabilities, dates, or other weather facts.
- Do not provide weather information that is not present in the supplied data.
- If the requested weather information is missing from the supplied data, clearly say that it is unavailable.
- Do not claim to have independently checked live weather.
- Use the user's question to decide which parts of the supplied weather data are relevant.
- Answer clearly and naturally.

USER QUESTION:
${message}

WEATHER DATA:
${JSON.stringify(weatherData, null, 2)}
`;

  const response = await client.chat.completions.create({
    model: "openrouter/free",
    messages: [
      {
        role: "user",
        content: context,
      },
    ],
  });

  return response.choices[0].message.content;
}

module.exports = {
  getAIResponse,
};