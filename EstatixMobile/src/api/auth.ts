import api from './client';

export const login = (email: string, password: string) => api.post('/auth/login', { email, password });
export const register = (email: string, password: string, name: string) => api.post('/auth/register', { email, password, name });
export const googleLogin = (idToken: string) => api.post('/auth/google', { idToken });
export const forgotPassword = (email: string) => api.post('/auth/forgot-password', { email });
export const getMe = () => api.get('/auth/me');