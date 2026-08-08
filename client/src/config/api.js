// client/src/config/api.js
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export default API_BASE;

export const apiUrl = (path = '') => {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${clean}`;
};

export const backendOrigin = () => {
  return API_BASE.replace(/\/api\/?$/, '') || 'http://localhost:5000';
};