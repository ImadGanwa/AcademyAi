import axios from 'axios';
import { store } from '../store';
import { setCredentials, logout, User, updateUser } from '../store/slices/authSlice';
import config from '../config';

const API_URL = `${config.API_URL}/api`;



// Add request interceptor to include token
axios.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle unauthorized responses
axios.interceptors.response.use(
  (response) => {
    
    return response;
  },
  (error) => {
    

    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      

      // Only logout if not trying to login or register
      const isAuthEndpoint = error.config.url.includes('/auth/login') || 
                            error.config.url.includes('/auth/register') ||
                            error.config.url.includes('/user/password');
      
      

      if (!isAuthEndpoint) {
        store.dispatch(logout());
        // Save the current path before redirecting
        localStorage.setItem('redirectPath', currentPath);
        // Redirect to login page with the current language
        const lang = currentPath.split('/')[1] || 'en';
        window.location.href = `/${lang}/login`;
      }
    }
    return Promise.reject(error);
  }
);

export interface AuthResponse {
  token?: string;
  user: User;
  message: string;
  requiresLogin?: boolean;
  redirectTo?: string;
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  marketingConsent: boolean;
  recaptchaToken: string | null;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, {
        email,
        password,
      });
      

      if (response.data.token && response.data.user) {
        store.dispatch(setCredentials({
          user: response.data.user,
          token: response.data.token
        }));
       
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(`${API_URL}/auth/register`, data);
    
    return response.data;
  },

  logout() {

    store.dispatch(logout());
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
    
    const response = await axios.get(`${API_URL}/auth/verify-email/${token}`);
    return response.data;
  },

  async updateProfile(data: { fullName: string }): Promise<AuthResponse> {
    try {
      
      const currentToken = store.getState().auth.token;
      

      const response = await axios.put<AuthResponse>(`${API_URL}/user/profile`, data, {
        headers: {
          Authorization: `Bearer ${currentToken}`
        }
      });
      
      

      if (response.data.user) {
        store.dispatch(updateUser(response.data.user));
        
      }
      
      return response.data;
    } catch (error) {
      
      throw error;
    }
  },

  async updateProfileImage(file: File): Promise<AuthResponse> {
    try {
      
      const currentToken = store.getState().auth.token;
      

      const formData = new FormData();
      formData.append('profileImage', file);
      
      const response = await axios.put<AuthResponse>(`${API_URL}/user/profile-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${currentToken}`
        }
      });

      

      if (response.data.user) {
        store.dispatch(updateUser(response.data.user));
        
      }

      return response.data;
    } catch (error) {
      
      throw error;
    }
  },

  async updatePassword(currentPassword: string, newPassword: string): Promise<AuthResponse> {
    try {
      const currentToken = store.getState().auth.token;

      const response = await axios.put<AuthResponse>(`${API_URL}/user/password`, {
        currentPassword,
        newPassword
      }, {
        headers: {
          Authorization: `Bearer ${currentToken}`
        },
        timeout: 10000 // 10-second timeout to prevent infinite loading
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async resendVerification(email: string): Promise<{ message: string }> {
    
    const response = await axios.post<{ message: string }>(`${API_URL}/auth/resend-verification`, {
      email,
    });
    
    return response.data;
  },

  async googleLogin(token: string): Promise<AuthResponse> {
    try {
      
      const response = await axios.post(
        `${API_URL}/auth/google`,
        { token },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true
        }
      );

      

      if (response.data?.token && response.data?.user) {
        localStorage.setItem('token', response.data.token);
        store.dispatch(setCredentials({
          user: response.data.user,
          token: response.data.token
        }));
        
        return response.data;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error: any) {
      console.error('Google login error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  async linkedinLogin(code: string): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(
        `${API_URL}/auth/linkedin`,
        { code },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000, // 10 second timeout
          validateStatus: (status) => {
            return status >= 200 && status < 500; // Accept all responses to handle errors properly
          }
        }
      );


      if (response.status !== 200) {
        console.error('Non-200 response:', {
          status: response.status,
          statusText: response.statusText,
          data: response.data
        });
        throw new Error(`Server responded with status ${response.status}: ${response.data?.message || 'Unknown error'}`);
      }

      if (!response.data?.token || !response.data?.user) {
        console.error('Invalid response format:', response.data);
        throw new Error('Invalid response format from server');
      }

      store.dispatch(setCredentials({
        user: response.data.user,
        token: response.data.token
      }));
      
      return response.data;
    } catch (error: any) {
      console.error('LinkedIn login service error:', {
        name: error.name,
        message: error.message,
        isAxiosError: error.isAxiosError,
        response: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers
        },
        request: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.config?.data,
          timeout: error.config?.timeout
        }
      });
      throw error;
    }
  },

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const response = await axios.post(`${API_URL}/auth/request-password-reset`, { email });
    return response.data;
  },

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const response = await axios.post(`${API_URL}/auth/reset-password/${token}`, { password });
    return response.data;
  }
}; 