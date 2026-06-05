const NodeCache = require('node-cache');

// Cache for 24 hours — historical data doesn't change
const cache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 });

const get = (key) => cache.get(key);
const set = (key, value) => cache.set(key, value);
const del = (key) => cache.del(key);

module.exports = { get, set, del };