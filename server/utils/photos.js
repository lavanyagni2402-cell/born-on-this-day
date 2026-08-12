const axios = require('axios');
const cache = require('./cache');

// ─── Photos From the Era (Unsplash) ────────────────────────────────────────
// Replaces Pexels per request — Unsplash's editorial style fits the site's
// aesthetic better.
async function getEraPhotos(year) {
  const cacheKey = `photos_${year}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  if (!process.env.UNSPLASH_ACCESS_KEY || process.env.UNSPLASH_ACCESS_KEY === 'your_unsplash_access_key_here') {
    return [];
  }

  try {
    const query = `${year} vintage`;
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=6&orientation=portrait`;
    const res = await axios.get(url, {
      timeout: 8000,
      headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
    });

    const photos = (res.data.results || []).slice(0, 6).map(p => ({
      thumb: p.urls?.small || p.urls?.thumb || null,
      full: p.urls?.regular || p.urls?.full || null,
      alt: p.alt_description || `${year} photo`,
      photographer: p.user?.name || 'Unsplash',
      link: p.links?.html || 'https://unsplash.com',
    })).filter(p => p.thumb);

    cache.set(cacheKey, photos);
    return photos;
  } catch (err) {
    console.error('Unsplash error:', err.message);
    return [];
  }
}

module.exports = { getEraPhotos };
