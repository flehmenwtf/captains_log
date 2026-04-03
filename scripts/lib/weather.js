async function getWeather(config) {
  const timeoutMs = Number(config.weather?.timeout_ms || 8000);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${config.weather.lat}&lon=${config.weather.lon}&appid=${config.weather.api_key}&units=${config.weather.units || 'imperial'}`;
  try {
    const res = await fetch(weatherUrl, { signal: controller.signal });
    if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
    const data = await res.json();
    return {
      high: Math.round(data.main.temp_max),
      low: Math.round(data.main.temp_min),
      wind: Math.round(data.wind.speed),
      clouds: Math.round(data.clouds.all)
    };
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { getWeather };
