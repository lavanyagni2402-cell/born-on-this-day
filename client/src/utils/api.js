import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  timeout: 30000,
});

export async function fetchCapsule(date, coords) {
  const params = {};
  if (coords?.lat != null && coords?.lon != null) {
    params.lat = coords.lat;
    params.lon = coords.lon;
  }
  const res = await api.get(`/capsule/${date}`, { params });
  return res.data;
}

// Best-effort, silent browser geolocation for the weather section — resolves
// to null (never rejects) if permission isn't granted or it's unsupported,
// so callers can always safely fall back to the server's New York default.
export function getBrowserCoords(timeout = 4000) {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    const timer = setTimeout(() => resolve(null), timeout);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer);
        resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => {
        clearTimeout(timer);
        resolve(null);
      },
      { timeout, maximumAge: 3600000 }
    );
  });
}

export async function saveCapsule(birthDate, name) {
  const res = await api.post('/share', { birthDate, name });
  return res.data;
}

export async function loadSharedCapsule(shareId) {
  const res = await api.get(`/share/${shareId}`);
  return res.data;
}

export default api;