import api from './client';

export const getNotifications = () => api.get('/notifications');
export const markNotificationRead = (id: string) => api.put(`/notifications/${id}/read`);
export const markAllRead = () => api.put('/notifications/read-all');