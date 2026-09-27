import { Gift } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import { getMatchedSchemes } from '../../api/applicantApi';
import { Card, CardBody, CardHeader, PageHeader, EmptyState, ErrorState, SkeletonRows } from '../../components/common/ui';
import { PROTOTYPE_SCHEMES } from '../../constants/prototypeData';

export const SchemesPage = () => {
  const { user } = useAuth();
  const isDemo = user?.email?.toLowerCase() === 'test@gmail.com';
  const { data: profile } = useProfile();
  const schemes = useQuery({
    queryKey: ['schemes', profile?.id],
    queryFn: () => getMatchedSchemes(profile.id),
    enabled: !!profile?.id,
  });

  if (schemes.isLoading) return <SkeletonRows rows={4} />;
  if (schemes.isError) return <ErrorState title="Could not load schemes" message={schemes.error?.response?.data?.error} onRetry={() => schemes.refetch()} />;

  const list = (schemes.data?.schemes && schemes.data.schemes.length > 0) ? schemes.data.schemes : (isDemo ? PROTOTYPE_SCHEMES : (schemes.data?.schemes || []));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Eligible Schemes"
        description={`${schemes.data?.eligible_scheme_count || list.length} government incentive schemes matched to your profile`}
      />

      {list.length === 0 ? (
        <Card><CardBody>
          <EmptyState icon={Gift} title="No eligible schemes found" description="No schemes currently match your sector, state, investment or employee count." />
        </CardBody></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map((s) => (
            <Card key={s.id}>
              <CardHeader title={s.name} subtitle={s.description} />
              <CardBody>
                {s.match_score && (
                  <div className="mb-4 flex items-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {s.match_score}% Match
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Based on your business profile</span>
                  </div>
                )}
                
                <p className="text-sm text-slate-700">{s.benefit_description}</p>
                
                {s.match_reasons && s.match_reasons.length > 0 && (
                  <div className="mt-3 p-2.5 bg-blue-50/50 rounded-lg text-xs text-blue-700 border border-blue-100">
                    <strong>Why you match:</strong> {s.match_reasons.join(' • ')}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1">Sector: {s.sector}</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1">Investment: ₹{s.min_investment}–{s.max_investment === 999999999 ? '∞' : s.max_investment}L</span>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
