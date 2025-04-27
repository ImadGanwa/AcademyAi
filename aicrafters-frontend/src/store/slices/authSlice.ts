import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  profileImage?: string;
  isEmailVerified: boolean;
  status: string;
  courses?: Array<{
    courseId: string;
    status: 'in progress' | 'saved' | 'completed';
    progress?: {
      percentage: number;
      completedLessons: string[];
    };
  }>;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}


const loadState = () => {
  try {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    

    return {
      user: storedUser ? JSON.parse(storedUser) : null,
      token: storedToken || null,
      isAuthenticated: !!storedToken && !!storedUser,
      isLoading: false
    };
  } catch (error) {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false
    };
  }
};

const initialState: AuthState = loadState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      

      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      
      try {
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      } catch (error) {
      }
    },
    updateUser: (state, action: PayloadAction<User>) => {
      
      state.user = {
        ...state.user,
        ...action.payload,
        courses: action.payload.courses || []
      };
      try {
        localStorage.setItem('user', JSON.stringify(state.user));
      } catch (error) {
      }
    },
    logout: (state) => {
      
      
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('redirectPath');
      } catch (error) {
      }
    },
  },
});

export const { setCredentials, updateUser, logout } = authSlice.actions;
export default authSlice.reducer; 