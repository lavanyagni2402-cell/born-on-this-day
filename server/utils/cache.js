const NodeCache = require('node-cache');

// Cache for 24 hours — historical data doesn't change
const cache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 });

const get = (key) => cache.get(key);
// ttl is optional — pass a shorter TTL (seconds) to negative-cache a
// transient failure so it retries sooner than the default 24h.
const set = (key, value, ttl) => (ttl !== undefined ? cache.set(key, value, ttl) : cache.set(key, value));
const del = (key) => cache.del(key);

module.exports = { get, set, del };