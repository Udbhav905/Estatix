import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';
import { getMe } from '../api/auth';
import { useFavoriteStore } from './favoriteStore';

interface AuthState {
  user: any | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data;
    await AsyncStorage.setItem('token', token);
    set({ token, user, isLoading: false });
    useFavoriteStore.getState().loadFavorites();
  },
  register: async (email, password, name) => {
    const res = await api.post('/auth/register', { email, password, name });
    const { token, user } = res.data;
    await AsyncStorage.setItem('token', token);
    set({ token, user, isLoading: false });
    useFavoriteStore.getState().loadFavorites();
  },
  logout: async () => {
    await AsyncStorage.removeItem('token');
    set({ token: null, user: null, isLoading: false });
    useFavoriteStore.setState({ favorites: [] });
  },
  loadStoredAuth: async () => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      try {
        const res = await getMe();
        set({ token, user: res.data.user, isLoading: false });
        useFavoriteStore.getState().loadFavorites();
      } catch {
        await AsyncStorage.removeItem('token');
        set({ token: null, user: null, isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },
}));