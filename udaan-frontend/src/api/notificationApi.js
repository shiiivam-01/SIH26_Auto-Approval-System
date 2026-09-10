import api from './axios';

// GET /api/notifications — { total, page, limit, pages, notifications[] }
export const getNotifications = (params = { page: 1, limit: 20 }) =>
  api.get('/notifications', { params }).then((r) => r.data);

// PATCH /api/notifications/read-all
export const markAllAsRead = () => api.patch('/notifications/read-all').then((r) => r.data);

// PATCH /api/notifications/:id/read
export const markAsRead = (id) => api.patch(`/notifications/${id}/read`).then((r) => r.data);
