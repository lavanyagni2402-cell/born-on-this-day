const axios = require('axios');
const cache = require('./cache');

// Delhi, India — default location when the visitor's coordinates aren't
// available (no browser geolocation permission, etc.)
const DEFAULT_LAT = 28.6139;
const DEFAULT_LON = 77.209;
const DEFAULT_LABEL = 'Delhi, India';

// ─── Historical Weather (Open-Meteo Archive API — no key required) ─────────
async function getWeather(dateStr, lat, lon) {
  const latitude = lat ?? DEFAULT_LAT;
  const longitude = lon ?? DEFAULT_LON;
  const cacheKey = `weather_${dateStr}_${latitude}_${longitude}`;
  const cached = cache.get(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${dateStr}&end_date=${dateStr}&daily=temperature_2m_mean,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto`;
    const res = await axios.get(url, { timeout: 8000 });
    const daily = res.data.daily;

    if (!daily || !daily.time || daily.time.length === 0) {
      cache.set(cacheKey, null);
      return null;
    }

    const units = res.data.daily_units || {};

    const result = {
      location: lat ? 'Your location' : DEFAULT_LABEL,
      avgTemp: daily.temperature_2m_mean?.[0] ?? null,
      maxTemp: daily.temperature_2m_max?.[0] ?? null,
      minTemp: daily.temperature_2m_min?.[0] ?? null,
      rainfall: daily.precipitation_sum?.[0] ?? null,
      windSpeed: daily.wind_speed_10m_max?.[0] ?? null,
      units: {
        temp: units.temperature_2m_mean || '°C',
        rain: units.precipitation_sum || 'mm',
        wind: units.wind_speed_10m_max || 'km/h',
      },
    };

    // If literally everything came back null, treat it as unavailable
    // rather than showing an empty card.
    if (result.avgTemp === null && result.maxTemp === null && result.minTemp === null) {
      cache.set(cacheKey, null);
      return null;
    }

    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error('Open-Meteo error:', err.message);
    cache.set(cacheKey, null, 3600);
    return null;
  }
}

module.exports = { getWeather, DEFAULT_LAT, DEFAULT_LON };
