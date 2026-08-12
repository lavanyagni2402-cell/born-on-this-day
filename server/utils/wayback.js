const axios = require('axios');
const cache = require('./cache');

// ─── The Internet as It Looked (Internet Archive Wayback Machine) ──────────
// Free, keyless: https://archive.org/wayback/available?url=...&timestamp=...
// A handful of iconic, long-lived sites so the section reads as "the web
// back then" rather than one random snapshot. Not every site has a capture
// close to every date — sites with no reasonably close snapshot are simply
// dropped rather than shown broken.
const SITES = [
  { name: 'Google', url: 'google.com' },
  { name: 'Yahoo', url: 'yahoo.com' },
  { name: 'Wikipedia', url: 'wikipedia.org' },
  { name: 'Apple', url: 'apple.com' },
];

async function getWaybackSnapshots(dateStr) {
  const cacheKey = `wayback_${dateStr}`;
  const cached = cache.get(cacheKey);
  if (cached !== undefined) return cached;

  const timestamp = dateStr.replace(/-/g, ''); // YYYYMMDD

  try {
    const results = await Promise.all(
      SITES.map(async (site) => {
        try {
          const res = await axios.get('https://archive.org/wayback/available', {
            params: { url: site.url, timestamp },
            timeout: 8000,
          });
          const snap = res.data?.archived_snapshots?.closest;
          if (!snap || !snap.available || !snap.url) return null;

          // Only keep snapshots reasonably close (~90 days) to the requested
          // date — otherwise "closest" can be years off for rarely-crawled
          // dates and misrepresent what the site looked like that day.
          const snapDate = snap.timestamp?.slice(0, 8);
          if (snapDate) {
            const d1 = new Date(`${snapDate.slice(0, 4)}-${snapDate.slice(4, 6)}-${snapDate.slice(6, 8)}`);
            const d2 = new Date(dateStr);
            const diffDays = Math.abs((d1 - d2) / 86400000);
            if (diffDays > 90) return null;
          }

          return {
            name: site.name,
            url: snap.url.replace(/^http:\/\//, 'https://'),
            snapshotDate: snapDate
              ? `${snapDate.slice(0, 4)}-${snapDate.slice(4, 6)}-${snapDate.slice(6, 8)}`
              : dateStr,
          };
        } catch {
          return null;
        }
      })
    );

    const snapshots = results.filter(Boolean);
    cache.set(cacheKey, snapshots.length ? snapshots : null);
    return snapshots.length ? snapshots : null;
  } catch (err) {
    console.error('Wayback Machine error:', err.message);
    cache.set(cacheKey, null, 3600);
    return null;
  }
}

module.exports = { getWaybackSnapshots };
