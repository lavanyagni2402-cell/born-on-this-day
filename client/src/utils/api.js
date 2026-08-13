import axios from 'axios';

const api = axios.create({
  baseURL: 'https://born-on-this-day-api.onrender.com/api',
  timeout: 30000,
});

export async function fetchCapsule(date) {
  const res = await api.get(`/capsule/${date}`);
  return res.data;
}

export async function saveCapsule(birthDate, name) {
  const res = await api.post('/share', { birthDate, name });
  return res.data;
}

export async function loadSharedCapsule(shareId) {
  const res = await api.get(`/share/${shareId}`);
  return res.data;
}

// Get the user's browser location for location-based sections
export async function getBrowserCoords() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        resolve(null);
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000,
      }
    );
  });
}

export default api;