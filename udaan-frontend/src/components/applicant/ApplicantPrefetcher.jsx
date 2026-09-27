import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useProfile } from '../../hooks/useProfile';
import { useApplications, useChecklist, useVault, useInspections } from '../../hooks/useApplicantData';

export const ApplicantPrefetcher = () => {
  const { data: profile } = useProfile();
  const applicantId = profile?.id;

  // By simply calling these hooks, React Query will fetch the data in the background
  // and store it in the cache. When the user navigates to the actual pages,
  // the data will already be there, eliminating the loading skeletons!
  useApplications(applicantId);
  useChecklist(applicantId);
  useVault(applicantId);
  useInspections(applicantId);

  return null;
};
