import { create } from 'zustand';
import axios from 'axios';

axios.defaults.withCredentials = true; // VERY IMPORTANT to send cookies with requests
const API_URL = `${import.meta.env.VITE_SERVERURL}/api`;

interface User {
  id: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  loginOrSignup: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true, // true by default so we wait for initial fetch before rendering Protected routes

  checkAuth: async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/me`);
      if (res.data.success) {
        set({ user: res.data.user, isLoading: false });
      }
    } catch (error) {
      set({ user: null, isLoading: false });
    }
  },

  loginOrSignup: async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth`, { email, password });
      if (res.data.success) {
        set({ user: res.data.user });
        return true;
      }
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  logout: async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`);
      set({ user: null });
    } catch (error) {
      console.error(error);
    }
  }
}));
