import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:7070',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(request => {
  console.log('Starting Request:', {
    url: request.url,
    method: request.method,
    data: request.data
  });
  return request;
});

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.message === 'Network Error') {
      console.error('API Server not reachable. Please ensure the server is running at:', apiClient.defaults.baseURL);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
