import api from './axios';

// POST /api/grievances — applicant only; privileged fields rejected by backend
export const createGrievance = ({ subject, description, priority, application_id }) =>
  api.post('/grievances', { subject, description, priority, application_id }).then((r) => r.data);

// GET /api/grievances/mine — applicant only
export const getMyGrievances = (params = { page: 1, limit: 20 }) =>
  api.get('/grievances/mine', { params }).then((r) => r.data);

// GET /api/grievances/assigned — officer/admin
export const getAssignedGrievances = (params = { page: 1, limit: 20 }) =>
  api.get('/grievances/assigned', { params }).then((r) => r.data);

// PATCH /api/grievances/:id/classify — admin only
export const classifyGrievance = (id, { department, state_version }) =>
  api.patch(`/grievances/${id}/classify`, { department, state_version }).then((r) => r.data);

// PATCH /api/grievances/:id/claim — officer (self) / admin (assignee_id or null)
export const claimGrievance = (id, body) => api.patch(`/grievances/${id}/claim`, body).then((r) => r.data);

// PATCH /api/grievances/:id — status transitions (optimistic state_version)
export const updateGrievanceStatus = (id, { status, resolution_notes, state_version }) =>
  api.patch(`/grievances/${id}`, { status, resolution_notes, state_version }).then((r) => r.data);

// POST /api/grievances/:id/escalate — applicant only; requires Idempotency-Key header
export const escalateGrievance = (id, { reason, state_version }, idempotencyKey) =>
  api.post(`/grievances/${id}/escalate`, { reason, state_version }, { headers: { 'Idempotency-Key': idempotencyKey } }).then((r) => r.data);
