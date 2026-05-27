import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { user, token, isLoading, login, register, logout, loadStoredAuth } = useAuthStore();
  return { user, token, isLoading, login, register, logout, loadStoredAuth };
};