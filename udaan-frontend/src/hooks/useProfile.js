import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyProfile } from '../api/applicantApi';

// Applicant profile — single source of truth across Dashboard, Profile, Documents, and Approvals
export const useProfile = () => {
  const query = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const data = await getMyProfile();
      if (data) {
        // Ensure business_type and sector are always aligned and normalized
        if (!data.business_type && data.sector) {
          const s = data.sector.toLowerCase();
          if (s === 'pharma') data.business_type = 'pharmacy';
          else if (s === 'food_processing') data.business_type = 'food_processing';
          else if (s === 'manufacturing') data.business_type = 'factory';
          else if (s === 'textile') data.business_type = 'textile';
          else if (s === 'agriculture') data.business_type = 'agriculture';
          else if (s === 'it_ites') data.business_type = 'gym_fitness';
          else if (s === 'service') data.business_type = 'office';
          else data.business_type = s;
        }

        // is_customized is true if user has configured their business details
        data.is_customized = Boolean(data.business_name && (data.business_type || data.sector));
      }
      return data;
    },
    retry: (failureCount, error) => error?.response?.status !== 404 && failureCount < 2,
  });

  const hasProfile = Boolean(query.data?.id);
  return { ...query, hasProfile };
};

export const useProfileInvalidator = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['profile'] });
    queryClient.invalidateQueries({ queryKey: ['applicantProfile'] });
    queryClient.invalidateQueries({ queryKey: ['checklist'] });
    queryClient.invalidateQueries({ queryKey: ['vault'] });
    queryClient.invalidateQueries({ queryKey: ['applications'] });
  };
};

