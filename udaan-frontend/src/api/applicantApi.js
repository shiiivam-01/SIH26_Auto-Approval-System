import api from './axios';

// POST /api/applicant/profile (backend: createProfile)
export const createProfile = (data) => api.post('/applicant/profile', data).then((r) => r.data);

// GET /api/applicant/profile/me (backend: getMyProfile) — 404 when no profile yet
export const getMyProfile = () => api.get('/applicant/profile/me').then((r) => r.data);

// PUT /api/applicant/profile (backend: updateProfile)
export const updateProfile = (data) => api.put('/applicant/profile', data).then((r) => r.data);

// GET /api/checklist/:applicantId (backend: getChecklist)
export const getChecklist = (applicantId) => api.get(`/checklist/${applicantId}`).then((r) => r.data);


// GET /api/schemes/match/:applicantId (backend: matchSchemes)
export const getMatchedSchemes = (applicantId) => api.get(`/schemes/match/${applicantId}`).then((r) => r.data);
