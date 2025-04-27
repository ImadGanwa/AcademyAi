import axios from 'axios';
import { store } from '../store';
import config from '../config';

const api = axios.create({
  baseURL: `${config.API_URL}/api`,
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export { api }; 