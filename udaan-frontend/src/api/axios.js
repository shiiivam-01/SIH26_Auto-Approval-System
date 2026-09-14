import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Enhanced error logging for debugging API mismatches
    if (error.response) {
      console.error(
        `API Error [${error.response.status}] on ${error.config.url}:`,
        error.response.data
      );
    } else if (error.request) {
      console.error(`API Error on ${error.config?.url}: No response received`, error.request);
    } else {
      console.error('API Error:', error.message);
    }

    if (error.response?.status === 401) {
      const errorMsg = error.response?.data?.error || '';
      if (errorMsg.includes('token') || errorMsg.includes('Authorization') || errorMsg.includes('expired')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('session-expired'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
