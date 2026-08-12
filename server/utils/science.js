const axios = require('axios');
const cache = require('./cache');

// ─── Science of Your Birth Year (OpenAlex) ──────────────────────────────────
// Free, keyless: https://api.openalex.org/works?filter=publication_year:YYYY
// OpenAlex asks polite-pool users to identify themselves via a `mailto`
// param for faster, more reliable service — not a secret, just an email.
async function getScienceHighlights(year) {
  const cacheKey = `science_${year}`;
  const cached = cache.get(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const res = await axios.get('https://api.openalex.org/works', {
      params: {
        filter: `publication_year:${year}`,
        sort: 'cited_by_count:desc',
        per_page: 3,
        mailto: 'contact@bornonthisday.app',
      },
      timeout: 8000,
    });

    const papers = (res.data?.results || []).slice(0, 3).map((w) => ({
      title: w.title || w.display_name,
      citedBy: w.cited_by_count ?? 0,
      field: w.primary_topic?.field?.display_name || w.primary_topic?.display_name || null,
      link: w.doi || w.id,
    })).filter(p => p.title);

    const result = papers.length ? papers : null;
    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error('OpenAlex API error:', err.message);
    cache.set(cacheKey, null, 3600);
    return null;
  }
}

module.exports = { getScienceHighlights };
