import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor: Inject bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rosys_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle auth expirations
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('rosys_auth_token');
      localStorage.removeItem('rosys_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
