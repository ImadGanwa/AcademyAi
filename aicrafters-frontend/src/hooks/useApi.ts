import axios, { AxiosInstance } from 'axios';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api', // TODO: Move hardcoded fallback URL to a central config file
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
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

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export const useApi = (): AxiosInstance => {
  const navigate = useNavigate();

  // Add response interceptor to handle auth errors
  const responseInterceptor = useCallback(
    (error: any) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/auth/login');
      }
      return Promise.reject(error);
    },
    [navigate]
  );

  // Update response interceptor when navigate changes
  api.interceptors.response.use(
    (response) => response,
    responseInterceptor
  );

  return api;
}; 