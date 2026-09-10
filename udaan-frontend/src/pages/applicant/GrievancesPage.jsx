import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, ArrowUpRight, MessageSquareWarning } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import { createGrievance, getMyGrievances, escalateGrievance } from '../../api/grievanceApi';
import { extractApiError } from '../../utils/errors';
import { Badge, Button, Card, CardBody, CardHeader, Input, Modal, PageHeader, Select, Textarea, EmptyState, ErrorState, SkeletonRows, ConfirmDialog } from '../../components/common/ui';
import { GRIEVANCE_STATUS, GRIEVANCE_PRIORITY } from '../../constants/statusCatalog';
import { PROTOTYPE_GRIEVANCES } from '../../constants/prototypeData';

export const GrievancesPage = () => {
  const { user } = useAuth();
  const isDemo = user?.email?.toLowerCase() === 'test@gmail.com';
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  const grievances = useQuery({
    queryKey: ['grievances', 'mine'],
    queryFn: () => getMyGrievances({ page: 1, limit: 50 }),
    enabled: !!profile?.id,
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [applicationId, setApplicationId] = useState('');
  const [formError, setFormError] = useState('');
  const [escalateTarget, setEscalateTarget] = useState(null);

  const create = useMutation({
    mutationFn: () => createGrievance({
      subject: subject.trim(),
      description: description.trim(),
      priority,
      application_id: applicationId ? Number(applicationId) : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grievances'] });
      toast.success('Grievance registered — SLA deadline: 7 days');
      setCreateOpen(false);
      setSubject(''); setDescription(''); setPriority('medium'); setApplicationId(''); setFormError('');
    },
    onError: (error) => setFormError(extractApiError(error)),
  });

  const submitCreate = () => {
    setFormError('');
    if (!subject.trim()) { setFormError('Subject is required'); return; }
    if (!description.trim()) { setFormError('Description is required'); return; }
    create.mutate();
  };

  const escalate = useMutation({
    mutationFn: (g) => escalateGrievance(g.id, { reason: 'Requesting early review of grievance', state_version: g.state_version }, crypto.randomUUID() || String(Date.now())),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grievances'] });
      setEscalateTarget(null);
      toast.success('Grievance escalated');
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  if (grievances.isLoading) return <SkeletonRows rows={4} />;
  if (grievances.isError) return <ErrorState title="Could not load grievances" message={grievances.error?.response?.data?.error} onRetry={() => grievances.refetch()} />;

  const list = (grievances.data?.grievances && grievances.data.grievances.length > 0) ? grievances.data.grievances : (isDemo ? PROTOTYPE_GRIEVANCES : []);

return (
    <div className="space-y-6">
      <PageHeader
        title="My Grievances"
        description="Raise and track complaints about your applications."
        action={<Button onClick={() => { setCreateOpen(true); setFormError(''); }}><Plus className="w-4 h-4 mr-2" /> Raise Grievance</Button>}
      />

      {list.length === 0 ? (
        <Card><CardBody>
          <EmptyState icon={MessageSquareWarning} title="No grievances" description="If something is stuck, raise a grievance and it will be tracked with an SLA deadline." />
        </CardBody></Card>
      ) : (
        <div className="space-y-3">
          {list.map((g) => {
            const st = GRIEVANCE_STATUS[g.status];
            const pr = GRIEVANCE_PRIORITY[g.priority];
            const filedDate = g.createdAt || g.created_at;
            const slaDate = g.sla_deadline || g.updated_at;
            return (
              <Card key={g.id}>
                <CardHeader
                  title={g.subject}
                  subtitle={`Filed ${filedDate ? new Date(filedDate).toLocaleDateString() : 'Recent'} · SLA ${slaDate ? new Date(slaDate).toLocaleDateString() : '7 Days'}`}
                  action={
                    <div className="flex flex-wrap gap-2">
                      {pr && <Badge label={pr.label} colorClass={pr.color} />}
                      {st && <Badge label={st.label} colorClass={st.color} />}
                      {g.escalation_level > 0 && <Badge label={`Level ${g.escalation_level}`} colorClass="bg-orange-50 text-orange-700 border-orange-200" />}
                      {g.status === 'escalated' && (
                        <Button variant="outline" onClick={() => setEscalateTarget(g)} className="h-8 px-2">
                          <ArrowUpRight className="w-4 h-4 mr-1" /> Escalate
                        </Button>
                      )}
                    </div>
                  }
                />
                <CardBody>
                  <p className="text-sm text-slate-600">{g.description}</p>
                  {g.department && <p className="text-xs text-slate-400 mt-2">Department: {g.department}</p>}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

{/* Create modal */}
      <Modal
        open={createOpen}
        onClose={() => !create.isPending && setCreateOpen(false)}
        title="Raise a Grievance"
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={create.isPending}>Cancel</Button>
            <Button onClick={submitCreate} isLoading={create.isPending}>Submit Grievance</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Subject" required value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={200} placeholder="Brief title (max 200 chars)" />
          <Textarea label="Description" required rows={5} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} placeholder="Describe the issue (max 2000 chars)" />
          <Select label="Priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
            {Object.entries(GRIEVANCE_PRIORITY).map(([value, opt]) => <option key={value} value={value}>{opt.label}</option>)}
          </Select>
          <Input label="Application ID (optional)" type="number" min="1" value={applicationId} onChange={(e) => setApplicationId(e.target.value)} placeholder="Link to an application" />
          {formError && <p className="text-sm text-error" role="alert">{formError}</p>}
        </div>
      </Modal>

      {/* Escalate confirmation */}
      <ConfirmDialog
        open={!!escalateTarget}
        onClose={() => setEscalateTarget(null)}
        onConfirm={() => escalate.mutate(escalateTarget)}
        isLoading={escalate.isPending}
        title="Escalate grievance?"
        confirmLabel="Escalate"
        message="Escalation raises the grievance to the next level. It cannot be re-escalated until the cooldown passes."
      />
    </div>
  );
};