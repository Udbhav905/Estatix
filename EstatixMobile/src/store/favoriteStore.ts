import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toggleFavorite as apiToggleFavorite, getFavorites } from '../api/property';

interface FavoriteState {
  favorites: string[];
  loadFavorites: () => Promise<void>;
  toggleFavorite: (propertyId: string) => Promise<void>;
  isFavorite: (propertyId: string) => boolean;
}

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  favorites: [],
  loadFavorites: async () => {
    try {
      const res = await getFavorites();
      set({ favorites: res.data.map((fav: any) => fav.propertyId) });
    } catch (e) { console.log(e); }
  },
  toggleFavorite: async (propertyId) => {
    await apiToggleFavorite(propertyId);
    const current = get().favorites;
    if (current.includes(propertyId)) {
      set({ favorites: current.filter(id => id !== propertyId) });
    } else {
      set({ favorites: [...current, propertyId] });
    }
  },
  isFavorite: (propertyId) => get().favorites.includes(propertyId),
}));