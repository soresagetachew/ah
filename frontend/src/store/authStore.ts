import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  passwordExpiryWarning: string | null;
  login: (user: User, token: string, expiryWarning?: string | null) => void;
  logout: () => void;
  refreshUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  passwordExpiryWarning: null,
  
  login: (user, token, expiryWarning = null) => {
    localStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true, passwordExpiryWarning: expiryWarning });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false, passwordExpiryWarning: null });
  },
  
  refreshUser: (user) => {
    set({ user });
  }
}));
