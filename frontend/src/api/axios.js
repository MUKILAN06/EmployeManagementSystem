import axios from 'axios';

// Create an axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors globally 
// (e.g., handling 401 Unauthorized by clearing local storage)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and user data if unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // You could also redirect to login here if not using a redirect in ProtectedRoute
    }
    return Promise.reject(error);
  }
);

export default api;
