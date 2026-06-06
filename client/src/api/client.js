import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

client.interceptors.request.use(
  (config) => {
    try {
      const session = JSON.parse(localStorage.getItem('userSession') || '{}');
      const token = session?.state?.token;
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {}
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('userSession');
      localStorage.removeItem('cartEvents');
      localStorage.removeItem('favouriteEvents');
    }
    const message = error.response?.data?.message || error.message || 'An error occurred';
    console.error('API Error:', message);
    return Promise.reject(new Error(message));
  }
);

export default client;
