const axios = require('axios');
const cache = require('./cache');

// ─── Space Missions (Launch Library 2 — thespacedevs.com) ──────────────────
// Free, keyless (anonymous tier is rate-limited, but each date is only ever
// fetched once per 24h thanks to caching, so this stays well within it).
// Uses the production `ll` host, not `lldev` — the dev host is explicitly
// documented as for local testing only, not production traffic.
async function getSpaceMissions(dateStr) {
  const cacheKey = `space_${dateStr}`;
  const cached = cache.get(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const res = await axios.get('https://ll.thespacedevs.com/2.3.0/launches/', {
      params: {
        net__gte: `${dateStr}T00:00:00Z`,
        net__lte: `${dateStr}T23:59:59Z`,
        limit: 3,
        ordering: 'net',
      },
      timeout: 8000,
    });

    const missions = (res.data?.results || []).slice(0, 3).map((l) => ({
      name: l.name,
      provider: l.launch_service_provider?.name || null,
      rocket: l.rocket?.configuration?.name || null,
      status: l.status?.name || null,
      image: (l.image && typeof l.image === 'object' ? l.image.image_url : l.image) || null,
      link: `https://thespacedevs.com/llapi`,
    }));

    const result = missions.length ? missions : null;
    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error('Launch Library 2 API error:', err.message);
    cache.set(cacheKey, null, 3600);
    return null;
  }
}

module.exports = { getSpaceMissions };
