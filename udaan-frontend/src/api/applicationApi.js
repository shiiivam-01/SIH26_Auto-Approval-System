import api from './axios';

// POST /api/applications/submit — 201 new / 200 idempotent re-run
export const submitApplications = ({ applicant_id, allow_resubmission }) =>
  api.post('/applications/submit', { applicant_id, allow_resubmission }).then((r) => r.data);

// GET /api/applications/:applicantId — enriched rows with days_left / sla_breached
export const getApplications = (applicantId) => api.get(`/applications/${applicantId}`).then((r) => r.data);

// PATCH /api/applications/:applicationId/decide — officer/admin
export const decideApplication = (applicationId, decision) =>
  api.patch(`/applications/${applicationId}/decide`, { decision }).then((r) => r.data);
