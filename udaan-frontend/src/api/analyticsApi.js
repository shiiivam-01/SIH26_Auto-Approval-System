import api from './axios';

const BASE = '/admin/analytics';

// GET /api/admin/analytics/overview — {success, generated_at, historical_range, department_scope, data}
export const getOverviewAnalytics = (params = {}) => api.get(`${BASE}/overview`, { params }).then((r) => r.data);

// GET /api/admin/analytics/sla — current snapshot, no date range
export const getSlaAnalytics = (params = {}) => api.get(`${BASE}/sla`, { params }).then((r) => r.data);

// GET /api/admin/analytics/departments — bottleneck ranking
export const getDepartmentAnalytics = (params = {}) => api.get(`${BASE}/departments`, { params }).then((r) => r.data);

// GET /api/admin/analytics/inspections
export const getInspectionAnalytics = (params = {}) => api.get(`${BASE}/inspections`, { params }).then((r) => r.data);

// GET /api/admin/analytics/grievances
export const getGrievanceAnalytics = (params = {}) => api.get(`${BASE}/grievances`, { params }).then((r) => r.data);

// GET /api/admin/analytics/trends — {interval: 'day'|'week'|'month'}
export const getTrendsAnalytics = (params = {}) => api.get(`${BASE}/trends`, { params }).then((r) => r.data);

// POST /api/admin/run-sla-check
export const runSlaCheck = () => api.post('/admin/run-sla-check').then((r) => r.data);
