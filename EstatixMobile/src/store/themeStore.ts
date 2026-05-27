import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, Theme } from '../utils/colors';

interface ThemeState {
  isDark: boolean;
  colors: Theme;
  toggleTheme: () => void;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: false,
  colors: lightColors,
  toggleTheme: async () => {
    set((state) => {
      const newIsDark = !state.isDark;
      AsyncStorage.setItem('theme', newIsDark ? 'dark' : 'light');
      return { isDark: newIsDark, colors: newIsDark ? darkColors : lightColors };
    });
  },
  loadTheme: async () => {
    const saved = await AsyncStorage.getItem('theme');
    const isDark = saved === 'dark';
    set({ isDark, colors: isDark ? darkColors : lightColors });
  },
}));