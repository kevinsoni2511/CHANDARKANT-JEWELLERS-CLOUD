import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cjc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const subdomain = localStorage.getItem('cjc_subdomain') || 'chandarkant';
  config.headers['X-Tenant-Subdomain'] = subdomain;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cjc_token');
      localStorage.removeItem('cjc_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
