import api from './client';

export const getConversations = () => api.get('/chat/conversations');
export const getMessages = (propertyId: string, otherUserId: string) => api.get(`/chat/messages/${propertyId}/${otherUserId}`);
export const markAsRead = (messageId: string) => api.put(`/chat/messages/${messageId}/read`);