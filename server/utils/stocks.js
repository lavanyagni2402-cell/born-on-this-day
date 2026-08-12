const axios = require('axios');
const cache = require('./cache');

// ─── Stock Market Snapshot (Alpha Vantage) ─────────────────────────────────
// Replaces MarketStack per request — Alpha Vantage's free tier has better
// historical coverage and is simpler to query.
//
// Alpha Vantage's daily-series endpoint works with tradable tickers, not
// raw index symbols, so we use the standard ETF proxies:
//   DIA  → Dow Jones Industrial Average (inception 1998)
//   QQQ  → Nasdaq-100 (inception 1999) — closest free-tier proxy for "NASDAQ"
//   SPY  → S&P 500 (inception 1993)
// Free tier is rate-limited to 25 requests/day, so results are cached hard.
const SYMBOLS = {
  dowJones: 'DIA',
  nasdaq: 'QQQ',
  sp500: 'SPY',
};

async function fetchSeries(symbol) {
  const cacheKey = `stocks_series_${symbol}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // outputsize=full (20+ years of history) is a paid-plan-only feature as of
  // Alpha Vantage's current terms — free keys are rejected with a 200 OK and
  // an "Information" field instead of data. `compact` (last ~100 trading
  // days) is what's actually available on the free tier.
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
  const res = await axios.get(url, { timeout: 10000 });

  const series = res.data['Time Series (Daily)'];
  if (!series) {
    // Alpha Vantage returns 200 with a "Note"/"Information" field instead of
    // an HTTP error when the key is invalid or the daily quota is hit.
    const reason = res.data['Note'] || res.data['Information'] || res.data['Error Message'] || 'Unknown response shape';
    throw new Error(reason);
  }

  // Cache the whole series for 24h — this is what actually saves quota,
  // since one request per symbol covers every date we'll ever ask for today.
  cache.set(cacheKey, series);
  return series;
}

function nearestTradingDay(series, dateStr) {
  const dates = Object.keys(series).sort(); // ascending YYYY-MM-DD strings sort correctly
  if (dates.length === 0) return null;

  if (series[dateStr]) return dateStr;

  // Walk backwards from the target date to the nearest earlier trading day
  // present in the series (handles weekends/holidays).
  let candidate = new Date(dateStr + 'T00:00:00Z');
  for (let i = 0; i < 10; i++) {
    candidate.setUTCDate(candidate.getUTCDate() - 1);
    const candidateStr = candidate.toISOString().split('T')[0];
    if (series[candidateStr]) return candidateStr;
  }

  // Date is outside the series entirely (before the ETF existed, or after
  // the most recent close on record) — no reasonable "nearest" to report.
  const earliest = dates[0];
  const latest = dates[dates.length - 1];
  if (dateStr < earliest || dateStr > latest) return null;

  return null;
}

async function getStockSnapshot(dateStr) {
  const cacheKey = `stocks_${dateStr}`;
  const cached = cache.get(cacheKey);
  if (cached !== undefined) return cached;

  if (!process.env.ALPHA_VANTAGE_API_KEY || process.env.ALPHA_VANTAGE_API_KEY === 'your_alpha_vantage_api_key_here') {
    return null;
  }

  try {
    const entries = await Promise.all(
      Object.entries(SYMBOLS).map(async ([key, symbol]) => {
        const series = await fetchSeries(symbol);
        const tradingDay = nearestTradingDay(series, dateStr);
        if (!tradingDay) return [key, null];
        const close = parseFloat(series[tradingDay]['4. close']);
        return [key, { close: Number(close.toFixed(2)), date: tradingDay, symbol }];
      })
    );

    const result = Object.fromEntries(entries);

    // If all three came back empty, there's nothing worth showing.
    if (!result.dowJones && !result.nasdaq && !result.sp500) {
      cache.set(cacheKey, null);
      return null;
    }

    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error('Alpha Vantage error:', err.message);
    cache.set(cacheKey, null, 3600);
    return null;
  }
}

module.exports = { getStockSnapshot };
