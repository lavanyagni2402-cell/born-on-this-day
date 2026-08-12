const axios = require('axios');
const cache = require('./cache');

// ─── Currency Snapshot (Frankfurter.app — ECB reference rates) ─────────────
// Free, keyless. Daily rates for 30+ currencies back to 1999-01-04. The ECB
// only publishes on business days — Frankfurter automatically returns the
// nearest prior available rate for weekends/holidays, and dates before 1999
// simply return nothing, so this gracefully hides for older birth dates.
async function getCurrencySnapshot(dateStr) {
  const cacheKey = `currency_${dateStr}`;
  const cached = cache.get(cacheKey);
  if (cached !== undefined) return cached;

  // Frankfurter has no data before this — skip the request entirely.
  if (dateStr < '1999-01-04') {
    cache.set(cacheKey, null);
    return null;
  }

  try {
    const res = await axios.get(`https://api.frankfurter.app/${dateStr}`, {
      params: { from: 'USD', to: 'EUR,GBP,INR,JPY' },
      timeout: 8000,
    });

    const rates = res.data?.rates;
    if (!rates) {
      cache.set(cacheKey, null);
      return null;
    }

    const result = {
      base: 'USD',
      date: res.data.date || dateStr,
      rates: {
        EUR: rates.EUR ?? null,
        GBP: rates.GBP ?? null,
        INR: rates.INR ?? null,
        JPY: rates.JPY ?? null,
      },
    };

    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error('Frankfurter API error:', err.message);
    cache.set(cacheKey, null, 3600);
    return null;
  }
}

module.exports = { getCurrencySnapshot };
