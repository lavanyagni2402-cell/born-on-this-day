const axios = require('axios');
const cache = require('./cache');

// ─── Books (Google Books API) ──────────────────────────────────────────────
// Google Books' public search works without a key (lower quota). Set
// GOOGLE_BOOKS_API_KEY for a higher quota — entirely optional.
// The API has no "published in year X" filter, so we pull a batch of
// generally well-known books and pick whichever are closest to the target year.
async function getBooks(year) {
  const cacheKey = `books_${year}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const keyParam = process.env.GOOGLE_BOOKS_API_KEY && process.env.GOOGLE_BOOKS_API_KEY !== 'your_google_books_api_key_here'
      ? `&key=${process.env.GOOGLE_BOOKS_API_KEY}`
      : '';

    const url = `https://www.googleapis.com/books/v1/volumes?q=subject:fiction&orderBy=relevance&maxResults=40&printType=books&langRestrict=en${keyParam}`;
    const res = await axios.get(url, { timeout: 8000 });
    const items = res.data.items || [];

    const withYear = items
      .filter(it => it.volumeInfo?.title && /^\d{4}/.test(it.volumeInfo?.publishedDate || ''))
      .map(it => {
        const info = it.volumeInfo;
        const publishedYear = parseInt(info.publishedDate.slice(0, 4), 10);
        return {
          title: info.title,
          author: (info.authors || []).join(', ') || 'Unknown author',
          publishedDate: info.publishedDate,
          description: info.description ? info.description.slice(0, 150) + '...' : '',
          cover: info.imageLinks?.thumbnail ? info.imageLinks.thumbnail.replace('http://', 'https://') : null,
          link: info.infoLink || info.canonicalVolumeLink || null,
          yearDiff: Math.abs(publishedYear - year),
        };
      })
      .sort((a, b) => a.yearDiff - b.yearDiff);

    const books = withYear.slice(0, 3).map(({ yearDiff, ...b }) => b);

    cache.set(cacheKey, books);
    return books;
  } catch (err) {
    console.error('Google Books error:', err.message);
    return [];
  }
}

module.exports = { getBooks };
