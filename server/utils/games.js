const axios = require('axios');
const cache = require('./cache');

// ─── Trending Games (RAWG API) ──────────────────────────────────────────────
async function getGames(year) {
  const cacheKey = `games_${year}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // Was previously checking for the exact string 'your_rawg_api_key_here',
  // but the .env placeholder is actually 'your_rawg_key_here' — those never
  // matched, so a real (failing) request was being fired on every load
  // instead of short-circuiting. `.includes('your_')` matches any of that
  // placeholder family, same pattern already used for the World News API key.
  if (!process.env.RAWG_API_KEY || process.env.RAWG_API_KEY.includes('your_')) {
    // TEMP DEBUG — remove once confirmed working.
    console.log(`[games ${year}] RAWG_API_KEY is missing or still a placeholder — skipping request.`);
    return [];
  }

  try {
    const url = `https://api.rawg.io/api/games?key=${process.env.RAWG_API_KEY}&dates=${year}-01-01,${year}-12-31&ordering=-rating&page_size=3`;
    const res = await axios.get(url, { timeout: 8000 });

    // TEMP DEBUG — remove once confirmed working.
    console.log(`[games ${year}] RAWG returned ${res.data.results?.length ?? 0} results`);

    const games = (res.data.results || []).slice(0, 3).map(g => ({
      title: g.name,
      cover: g.background_image || null,
      releaseDate: g.released || null,
      rating: g.rating ? g.rating.toFixed(1) : null,
      genre: (g.genres || []).map(x => x.name).join(', ') || null,
      link: g.slug ? `https://rawg.io/games/${g.slug}` : 'https://rawg.io',
    }));

    cache.set(cacheKey, games);
    return games;
  } catch (err) {
    // TEMP DEBUG — logs the actual HTTP status (e.g. 401 = bad key,
    // 429 = rate limited) instead of just the generic error message.
    console.error(`[games ${year}] RAWG request failed:`, err.response?.status, err.response?.statusText || err.message);
    return [];
  }
}

module.exports = { getGames };
