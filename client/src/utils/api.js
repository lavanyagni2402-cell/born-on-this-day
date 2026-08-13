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


export function getBrowserCoords() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      error => {
        reject(error);
      }
    );
  });
}


export default api;