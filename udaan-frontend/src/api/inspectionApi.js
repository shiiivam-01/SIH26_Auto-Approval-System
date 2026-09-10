import api from './axios';

// POST /api/inspections/bundle — applicant/admin; 201 new / 200 additive merge
export const bundleInspections = ({ applicant_id, scheduled_date }) =>
  api.post('/inspections/bundle', { applicant_id, scheduled_date }).then((r) => r.data);

// GET /api/inspections/:applicantId — applicant(own)/inspector(assigned only)/admin
export const getInspections = (applicantId) => api.get(`/inspections/${applicantId}`).then((r) => r.data);

// PATCH /api/inspections/:inspectionId/assign — admin only
export const assignInspector = (inspectionId, assigned_inspector_id) =>
  api.patch(`/inspections/${inspectionId}/assign`, { assigned_inspector_id }).then((r) => r.data);

// PATCH /api/inspections/:inspectionId/complete — assigned inspector/admin
export const completeInspection = (inspectionId, { result, inspector_notes }) =>
  api.patch(`/inspections/${inspectionId}/complete`, { result, inspector_notes }).then((r) => r.data);
