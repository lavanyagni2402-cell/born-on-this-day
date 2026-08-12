const axios = require('axios');
const cache = require('./cache');

// ─── Earth Events (USGS Earthquake Catalog) ─────────────────────────────────
// Free, keyless: https://earthquake.usgs.gov/fdsnws/event/1/query
// The USGS catalog is reliably complete for significant (mag 5+) quakes
// worldwide only from roughly the 1960s/70s onward — older dates will
// typically just come back empty, which is fine, the section hides itself.
async function getEarthquakes(dateStr) {
  const cacheKey = `earthquakes_${dateStr}`;
  const cached = cache.get(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const start = new Date(`${dateStr}T00:00:00Z`);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    const toISODate = (d) => d.toISOString().split('T')[0];

    const res = await axios.get('https://earthquake.usgs.gov/fdsnws/event/1/query', {
      params: {
        format: 'geojson',
        starttime: toISODate(start),
        endtime: toISODate(end),
        minmagnitude: 5,
        orderby: 'magnitude',
        limit: 4,
      },
      timeout: 8000,
    });

    const quakes = (res.data?.features || []).slice(0, 4).map((f) => ({
      place: f.properties?.place || 'Unknown location',
      magnitude: f.properties?.mag,
      time: f.properties?.time ? new Date(f.properties.time).toISOString() : null,
      link: f.properties?.url || null,
      depthKm: f.geometry?.coordinates?.[2] ?? null,
    })).filter(q => q.magnitude != null);

    const result = quakes.length ? quakes : null;
    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error('USGS earthquake API error:', err.message);
    cache.set(cacheKey, null, 3600);
    return null;
  }
}

module.exports = { getEarthquakes };
