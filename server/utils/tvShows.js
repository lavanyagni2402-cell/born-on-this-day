const axios = require('axios');
const cache = require('./cache');

// ─── Popular TV Shows (TMDB TV API) ────────────────────────────────────────
// Reuses the same TMDB_API_KEY already used for movies — no new key needed.
async function getTVShows(year) {
  const cacheKey = `tv_${year}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  if (!process.env.TMDB_API_KEY || process.env.TMDB_API_KEY === 'your_tmdb_api_key_here') {
    return [];
  }

  try {
    const baseUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${process.env.TMDB_API_KEY}&first_air_date_year=${year}&sort_by=popularity.desc&language=en-US`;

    // Prefer shows with a meaningful vote count, same quality-floor approach
    // used for movies, falling back to unfiltered if nothing qualifies.
    let res = await axios.get(`${baseUrl}&vote_count.gte=20`, { timeout: 8000 });
    let results = res.data.results || [];
    if (results.length === 0) {
      res = await axios.get(baseUrl, { timeout: 8000 });
      results = res.data.results || [];
    }

    const shows = results.slice(0, 3).map(s => ({
      title: s.name,
      overview: s.overview ? s.overview.slice(0, 150) + '...' : '',
      poster: s.poster_path ? `https://image.tmdb.org/t/p/w300${s.poster_path}` : null,
      firstAirDate: s.first_air_date || null,
      rating: s.vote_average ? s.vote_average.toFixed(1) : null,
    }));

    cache.set(cacheKey, shows);
    return shows;
  } catch (err) {
    console.error('TMDB TV error:', err.message);
    return [];
  }
}

module.exports = { getTVShows };
