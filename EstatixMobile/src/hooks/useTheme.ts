import { useThemeStore } from '../store/themeStore';

export const useTheme = () => {
  const { isDark, colors, toggleTheme, loadTheme } = useThemeStore();
  return { isDark, colors, toggleTheme, loadTheme };
};