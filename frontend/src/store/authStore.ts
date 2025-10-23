import { create } from 'zustand';
import api from '../services/api';
import { extractUserFromToken } from '../utils/jwt';

interface User {
  user_id: number;
  role: string;
  branch_id: number;
  branch_name?: string;
  staff_title?: string;
  email: string;
  full_name?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  login: (token: string, user?: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: (() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  })(),
  login: (token, user) => {
    // If user is not provided, extract it from the token
    const userData = user || extractUserFromToken(token);
    
    if (!userData) {
      console.error('Unable to extract user data from token');
      return;
    }
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    set({ token, user: userData });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    set({ token: null, user: null });
  },
  setUser: (user) => {
    set({ user });
  }
}));
