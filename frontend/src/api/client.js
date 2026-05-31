import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('wifak_access');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const refresh = localStorage.getItem('wifak_refresh');
    if (error.response?.status === 401 && refresh && !original._retry) {
      original._retry = true;
      const { data } = await axios.post(`${api.defaults.baseURL}/token/refresh/`, { refresh });
      localStorage.setItem('wifak_access', data.access);
      original.headers.Authorization = `Bearer ${data.access}`;
      return api(original);
    }
    return Promise.reject(error);
  },
);
