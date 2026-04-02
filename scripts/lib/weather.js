async function getWeather(config) {
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${config.weather.lat}&lon=${config.weather.lon}&appid=${config.weather.api_key}&units=${config.weather.units || 'imperial'}`;
  const res = await fetch(weatherUrl);
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
  const data = await res.json();
  return {
    high: Math.round(data.main.temp_max),
    low: Math.round(data.main.temp_min),
    wind: Math.round(data.wind.speed),
    clouds: Math.round(data.clouds.all)
  };
}

module.exports = { getWeather };
