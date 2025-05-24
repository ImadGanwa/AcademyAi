import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
// TODO: Move hardcoded fallback URL to a central config file
console.log('API baseURL configured as:', baseURL);

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // TODO: Move hardcoded timeout to a central config file
});

// Add a request interceptor to add the auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`Request to ${config.url}: Authorization header set with token`);
    } else {
      console.log(`Request to ${config.url}: No authentication token found`);
    }
    
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      params: config.params,
      data: config.data
    });
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for better error handling
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`API Response from ${response.config.url}: Status ${response.status}`, {
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
    const errorStatus = error.response?.status || 'No status';
    const errorURL = error.config?.url || 'Unknown URL';
    
    console.error(`API Error: ${errorStatus} from ${errorURL}`, errorMessage);
    console.error('Full error response:', error.response?.data);
    console.error('Request that caused error:', {
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers,
      data: error.config?.data
    });
    
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      console.log('Authentication error detected - logging out user');
      
      // Dispatch logout action to clear auth state
      store.dispatch(logout());
      
      // Clear token from localStorage
      localStorage.removeItem('token');
      
      // Redirect to login page
      const currentLang = localStorage.getItem('i18nextLng') || 'en';
      window.location.href = `/${currentLang}/login?expired=true`;
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 