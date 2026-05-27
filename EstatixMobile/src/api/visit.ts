import api from './client';

export const createVisit = (data: { propertyId: string; date: string; notes?: string }) => api.post('/visits', data);
export const getMyVisitRequests = () => api.get('/visits/requests');
export const getMyVisitBookings = () => api.get('/visits/bookings');
export const updateVisitStatus = (id: string, status: string) => api.put(`/visits/${id}`, { status });