import { useQuery } from '@tanstack/react-query';
import { getApplications } from '../api/applicationApi';
import { getChecklist } from '../api/applicantApi';
import { getVault } from '../api/documentApi';
import { getInspections } from '../api/inspectionApi';

const noRetry = (failureCount, error) => error?.response?.status !== 403 && error?.response?.status !== 404 && failureCount < 2;

// All applicant data is keyed by the profile id (applicantId).
export const useApplications = (applicantId) =>
  useQuery({ queryKey: ['applications', applicantId], queryFn: () => getApplications(applicantId), enabled: !!applicantId, retry: noRetry, refetchInterval: 5000 });

export const useChecklist = (applicantId) =>
  useQuery({ queryKey: ['checklist', applicantId], queryFn: () => getChecklist(applicantId), enabled: !!applicantId, retry: noRetry, refetchInterval: 5000 });

export const useVault = (applicantId) =>
  useQuery({ queryKey: ['vault', applicantId], queryFn: () => getVault(applicantId), enabled: !!applicantId, retry: noRetry, refetchInterval: 5000 });

export const useInspections = (applicantId) =>
  useQuery({ queryKey: ['inspections', applicantId], queryFn: () => getInspections(applicantId), enabled: !!applicantId, retry: (f, e) => e?.response?.status !== 403 && f < 2, refetchInterval: 5000 });
