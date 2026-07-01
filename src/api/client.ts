import axios from 'axios';

const TOKEN_KEY = 'sga_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

// baseURL vacío ⇒ usa el proxy de Vite (/api). En prod, VITE_API_URL apunta al backend.
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '' });

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      tokenStore.clear();
      if (location.pathname !== '/login') location.assign('/login');
    }
    return Promise.reject(error);
  },
);
