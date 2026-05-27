import api from './client';

export const getPendingProperties = () => api.get('/admin/properties/pending');
export const approveProperty = (id: string) => api.put(`/admin/properties/${id}/approve`);
export const rejectProperty = (id: string) => api.put(`/admin/properties/${id}/reject`);
export const banUser = (userId: string) => api.put(`/admin/users/${userId}/ban`);
export const getReports = () => api.get('/admin/reports');
export const resolveReport = (id: string) => api.put(`/admin/reports/${id}/resolve`);

// npx expo start --lan --go  