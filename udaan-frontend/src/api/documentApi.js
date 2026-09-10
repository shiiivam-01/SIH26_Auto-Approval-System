import api from './axios';

// POST /api/vault/upload (JSON; file_url must parse as URL — convert files to data: URLs client-side)
export const uploadDocument = ({ applicant_id, document_type, file_url, expiry_date }) =>
  api.post('/vault/upload', { applicant_id, document_type, file_url, expiry_date }).then((r) => r.data);

// GET /api/vault/:applicantId
export const getVault = (applicantId) => api.get(`/vault/${applicantId}`).then((r) => r.data);

// PATCH /api/vault/:documentId/verify — officer/admin only
export const verifyDocument = (documentId, verified_status) =>
  api.patch(`/vault/${documentId}/verify`, { verified_status }).then((r) => r.data);
