import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { MessageSquareWarning, Hand, PlayCircle, CheckCircle2 } from 'lucide-react';
import { getAssignedGrievances, claimGrievance, updateGrievanceStatus } from '../../api/grievanceApi';
import { extractApiError } from '../../utils/errors';
import { Badge, Button, Card, CardBody, CardHeader, PageHeader, Textarea, EmptyState, ErrorState, SkeletonRows, ConfirmDialog, Modal } from '../../components/common/ui';
import { GRIEVANCE_STATUS, GRIEVANCE_PRIORITY } from '../../constants/statusCatalog';

const noRetry = (f, e) => e?.response?.status !== 403 && f < 2;

export const OfficerGrievancesPage = () => {
  const queryClient = useQueryClient();
  const queue = useQuery({ queryKey: ['grievances', 'assigned'], queryFn: () => getAssignedGrievances({ page: 1, limit: 50 }), retry: noRetry });

  const [claimTarget, setClaimTarget] = useState(null);
  const [processTarget, setProcessTarget] = useState(null); // {g, toStatus}
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  const claim = useMutation({
    mutationFn: (g) => claimGrievance(g.id, { state_version: g.state_version }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grievances'] });
      toast.success('Grievance claimed');
      setClaimTarget(null);
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  const update = useMutation({
    mutationFn: () => updateGrievanceStatus(processTarget.g.id, {
      status: processTarget.toStatus,
      resolution_notes: processTarget.toStatus === 'resolved' ? notes.trim() : undefined,
      state_version: processTarget.g.state_version,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grievances'] });
      toast.success('Grievance updated');
      setProcessTarget(null); setNotes(''); setFormError('');
    },
    onError: (error) => setFormError(extractApiError(error)),
  });

  const submitProcess = () => {
    setFormError('');
    if (processTarget?.toStatus === 'resolved' && !notes.trim()) {
      setFormError('Resolution notes are required to resolve a grievance');
      return;
    }
    update.mutate();
  };

  if (queue.isLoading) return <SkeletonRows rows={5} />;
  if (queue.isError) return <ErrorState title="Could not load grievance queue" message={queue.error?.response?.data?.error} onRetry={() => queue.refetch()} />;

  const list = queue.data?.grievances || [];

return (
    <div className="space-y-6">
      <PageHeader title="Grievance Queue" description="Grievances assigned to you or unassigned in your department." />

      {list.length === 0 ? (
        <Card><CardBody>
          <EmptyState icon={MessageSquareWarning} title="No grievances" description="Nothing is awaiting action in your department right now." />
        </CardBody></Card>
      ) : (
        <div className="space-y-3">
          {list.map((g) => {
            const st = GRIEVANCE_STATUS[g.status];
            const pr = GRIEVANCE_PRIORITY[g.priority];
            return (
              <Card key={g.id}>
                <CardHeader
                  title={`#${g.id} · ${g.subject}`}
                  subtitle={`${g.department || 'Unclassified'} · SLA ${new Date(g.sla_deadline).toLocaleDateString()} · Level ${g.escalation_level}`}
                  action={
                    <div className="flex flex-wrap gap-2">
                      {pr && <Badge label={pr.label} colorClass={pr.color} />}
                      {st && <Badge label={st.label} colorClass={st.color} />}
                      {!g.assigned_to && g.status !== 'resolved' && g.status !== 'closed' && (
                        <Button size="sm" className="h-8 px-2" onClick={() => setClaimTarget(g)}>
                          <Hand className="w-4 h-4 mr-1" /> Claim
                        </Button>
                      )}
                      {g.assigned_to && g.status === 'open' && (
                        <Button size="sm" className="h-8 px-2" onClick={() => { setProcessTarget({ g, toStatus: 'in_progress' }); setFormError(''); }}>
                          <PlayCircle className="w-4 h-4 mr-1" /> Start
                        </Button>
                      )}
                      {['open', 'in_progress', 'escalated'].includes(g.status) && g.assigned_to && (
                        <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => { setProcessTarget({ g, toStatus: 'resolved' }); setFormError(''); }}>
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Resolve
                        </Button>
                      )}
                    </div>
                  }
                />
                <CardBody>
                  <p className="text-sm text-slate-600">{g.description}</p>
                  {g.assigned_to && <p className="text-xs text-slate-400 mt-2">Assigned to you</p>}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

{/* Claim */}
      <ConfirmDialog
        open={!!claimTarget}
        onClose={() => setClaimTarget(null)}
        onConfirm={() => claim.mutate(claimTarget)}
        isLoading={claim.isPending}
        title="Claim grievance?"
        confirmLabel="Claim"
        message={claimTarget ? `Claim grievance #${claimTarget.id}? Only officers of ${claimTarget.department} may claim it.` : ''}
      />

      {/* Process modal */}
      <Modal
        open={!!processTarget}
        onClose={() => !update.isPending && setProcessTarget(null)}
        title={processTarget?.toStatus === 'resolved' ? 'Resolve grievance' : 'Start processing'}
        footer={
          <>
            <Button variant="outline" onClick={() => setProcessTarget(null)} disabled={update.isPending}>Cancel</Button>
            <Button onClick={submitProcess} isLoading={update.isPending}>
              {processTarget?.toStatus === 'resolved' ? 'Mark Resolved' : 'Mark In Progress'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Grievance #{processTarget?.g?.id}: "{processTarget?.g?.subject}"
          </p>
          {processTarget?.toStatus === 'resolved' && (
            <Textarea
              label="Resolution notes"
              required
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Explain how the grievance was resolved (1–2000 chars)"
            />
          )}
          {formError && <p className="text-sm text-error" role="alert">{formError}</p>}
        </div>
      </Modal>
    </div>
  );
};