import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CalendarClock, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import { useInspections } from '../../hooks/useApplicantData';
import { bundleInspections } from '../../api/inspectionApi';
import { extractApiError } from '../../utils/errors';
import { Badge, Button, Card, CardBody, CardHeader, PageHeader, EmptyState, ErrorState, SkeletonRows, ConfirmDialog } from '../../components/common/ui';
import { INSPECTION_STATUS, INSPECTION_RESULT, APPLICATION_STATUS } from '../../constants/statusCatalog';
import { PROTOTYPE_INSPECTIONS } from '../../constants/prototypeData';

export const InspectionsPage = () => {
  const { user } = useAuth();
  const isDemo = user?.email?.toLowerCase() === 'test@gmail.com';
  const { data: profile } = useProfile();
  const applicantId = profile?.id;
  const inspections = useInspections(applicantId);
  const queryClient = useQueryClient();

  const [scheduleOpen, setScheduleOpen] = useState(false);

  const bundle = useMutation({
    mutationFn: () => bundleInspections({ applicant_id: applicantId }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['inspections', applicantId] });
      setScheduleOpen(false);
      toast.success(data.message); // distinguishes new (201) vs merged (200)
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  if (inspections.isLoading) return <SkeletonRows rows={3} />;
  const list = (inspections.data && inspections.data.length > 0) ? inspections.data : (isDemo ? PROTOTYPE_INSPECTIONS : []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inspections"
        description="All approvals requiring inspection are bundled into ONE joint site visit."
        action={<Button onClick={() => setScheduleOpen(true)}><CalendarClock className="w-4 h-4 mr-2" /> Schedule Joint Inspection</Button>}
      />

      {inspections.isError ? (
        <ErrorState title="Could not load inspections" message={inspections.error?.response?.data?.error} onRetry={() => inspections.refetch()} />
      ) : list.length === 0 ? (
        <Card><CardBody>
          <EmptyState
            icon={Search}
            title="No inspections yet"
            description="Applications in 'Pending Inspection' can be bundled into a single scheduled site visit."
          />
        </CardBody></Card>
      ) : (
        list.map((ins) => {
          const st = INSPECTION_STATUS[ins.status];
          const res = ins.result ? INSPECTION_RESULT[ins.result] : null;
          return (
            <Card key={ins.id}>
              <CardHeader
                title={`Inspection #${ins.id}`}
                subtitle={`Scheduled: ${new Date(ins.scheduled_date).toLocaleString()}`}
                action={
                  <div className="flex flex-wrap gap-2">
                    <Badge label={st?.label || ins.status} colorClass={st?.color} icon={CalendarClock} />
                    {res && <Badge label={res.label} colorClass={res.color} />}
                  </div>
                }
              />
              <CardBody className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Linked applications</p>
                  <ul className="space-y-1">
                    {(ins.Applications || []).map((a) => {
                      const st = APPLICATION_STATUS[a.status];
                      return (
                        <li key={a.id} className="text-sm text-slate-700 flex flex-wrap items-center gap-2">
                          {a.ApprovalRule?.approval_name}
                          <span className="text-slate-400">· {a.ApprovalRule?.department}</span>
                          <Badge label={st?.label || a.status} colorClass={st?.color} />
                        </li>
                      );
                    })}
                  </ul>
                </div>
                {ins.Inspector && (
                  <p className="text-sm text-slate-600">Assigned inspector: <span className="font-medium">{ins.Inspector.name}</span> ({ins.Inspector.email})</p>
                )}
                {ins.completed_at && (
                  <p className="text-sm text-slate-500">Completed: {new Date(ins.completed_at).toLocaleString()}</p>
                )}
                {ins.inspector_notes && (
                  <div className="rounded-md bg-slate-50 border border-slate-200 px-4 py-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Inspector notes</p>
                    <p className="text-sm text-slate-700">{ins.inspector_notes}</p>
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })
      )}

      <ConfirmDialog
        open={scheduleOpen}
        onClose={() => !bundle.isPending && setScheduleOpen(false)}
        onConfirm={() => bundle.mutate()}
        isLoading={bundle.isPending}
        title="Schedule joint inspection?"
        confirmLabel="Schedule"
        message="Bundles every 'Pending Inspection' application into one site visit. If one is already scheduled, new applications are merged into it. Default slot: 7 days from now."
      />
    </div>
  );
};

