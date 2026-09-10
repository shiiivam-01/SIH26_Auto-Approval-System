import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { MessageSquareWarning, FolderCog, UserCog, CheckCircle2 } from 'lucide-react';
import { getAssignedGrievances, classifyGrievance, claimGrievance, updateGrievanceStatus } from '../../api/grievanceApi';
import { extractApiError } from '../../utils/errors';
import { Badge, Button, Card, CardBody, CardHeader, EmptyState, ErrorState, Input, Modal, PageHeader, Select, SkeletonRows, Textarea } from '../../components/common/ui';
import { GRIEVANCE_STATUS, GRIEVANCE_PRIORITY } from '../../constants/statusCatalog';

export const AdminGrievancesPage = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ status: '', assigned: '', escalation_level: '' });

  const queue = useQuery({
    queryKey: ['grievances', 'assigned', 'admin', filters],
    queryFn: () => getAssignedGrievances({
      page: 1, limit: 100,
      status: filters.status || undefined,
      assigned: filters.assigned || undefined,
      escalation_level: filters.escalation_level === '' ? undefined : Number(filters.escalation_level),
    }),
    refetchInterval: 5000,
  });

  const [classifyTarget, setClassifyTarget] = useState(null);
  const [classifyDept, setClassifyDept] = useState('');
  const [classifyError, setClassifyError] = useState('');

  const [assignTarget, setAssignTarget] = useState(null);
  const [assigneeId, setAssigneeId] = useState('');
  const [assignError, setAssignError] = useState('');

  const [resolveTarget, setResolveTarget] = useState(null);
  const [notes, setNotes] = useState('');
  const [resolveError, setResolveError] = useState('');

  const classify = useMutation({
    mutationFn: () => classifyGrievance(classifyTarget.id, { department: classifyDept.trim(), state_version: classifyTarget.state_version }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['grievances'] }); toast.success('Grievance classified'); setClassifyTarget(null); setClassifyDept(''); setClassifyError(''); },
    onError: (e) => setClassifyError(extractApiError(e)),
  });

  const reassign = useMutation({
    mutationFn: () => claimGrievance(assignTarget.id, { assignee_id: assigneeId === '' ? null : Number(assigneeId), state_version: assignTarget.state_version }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['grievances'] }); toast.success('Assignee updated'); setAssignTarget(null); setAssigneeId(''); setAssignError(''); },
    onError: (e) => setAssignError(extractApiError(e)),
  });

  const resolve = useMutation({
    mutationFn: () => updateGrievanceStatus(resolveTarget.id, { status: 'resolved', resolution_notes: notes.trim(), state_version: resolveTarget.state_version }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['grievances'] }); toast.success('Grievance resolved'); setResolveTarget(null); setNotes(''); setResolveError(''); },
    onError: (e) => setResolveError(extractApiError(e)),
  });

  const submitClassify = () => { setClassifyError(''); if (!classifyDept.trim()) { setClassifyError('Department is required'); return; } classify.mutate(); };
  const submitReassign = () => { setAssignError(''); if (assigneeId !== '' && Number(assigneeId) < 1) { setAssignError('Enter a valid officer user ID'); return; } reassign.mutate(); };
  const submitResolve = () => { setResolveError(''); if (!notes.trim()) { setResolveError('Resolution notes are required'); return; } resolve.mutate(); };

  if (queue.isLoading) return <SkeletonRows rows={6} />;
  if (queue.isError) return <ErrorState title="Could not load grievances" message={queue.error.response?.data?.error} onRetry={() => queue.refetch()} />;

  const list = queue.data?.grievances || [];

return (
    <div className="space-y-6">
      <PageHeader title="Grievance Oversight" description="Classify, assign and monitor grievances across departments." />

      <Card>
        <CardBody className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select aria-label="Filter by status" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} placeholder="All statuses">
            {Object.entries(GRIEVANCE_STATUS).map(([value, opt]) => <option key={value} value={value}>{opt.label}</option>)}
          </Select>
          <Select aria-label="Filter by assignment" value={filters.assigned} onChange={(e) => setFilters({ ...filters, assigned: e.target.value })} placeholder="Any assignment">
            <option value="true">Assigned</option>
            <option value="false">Unassigned</option>
          </Select>
          <Select aria-label="Filter by escalation level" value={filters.escalation_level} onChange={(e) => setFilters({ ...filters, escalation_level: e.target.value })} placeholder="Any level">
            {[0, 1, 2, 3].map((l) => <option key={l} value={l}>Level {l}</option>)}
          </Select>
        </CardBody>
      </Card>

      {list.length === 0 ? (
        <Card><CardBody><EmptyState icon={MessageSquareWarning} title="No grievances match" /></CardBody></Card>
      ) : (
        <div className="space-y-3">
          {list.map((g) => {
            const st = GRIEVANCE_STATUS[g.status];
            const pr = GRIEVANCE_PRIORITY[g.priority];
            return (
              <Card key={g.id}>
                <CardHeader
                  title={`#${g.id} · ${g.subject}`}
                  subtitle={`${g.department || 'Unclassified'} · Created ${new Date(g.createdAt).toLocaleDateString()} · SLA ${new Date(g.sla_deadline).toLocaleDateString()} · Level ${g.escalation_level}`}
                  action={
                    <div className="flex flex-wrap gap-2">
                      {pr && <Badge label={pr.label} colorClass={pr.color} />}
                      {st && <Badge label={st.label} colorClass={st.color} />}
                      {!g.department && (
                        <Button size="sm" className="h-8 px-2" onClick={() => { setClassifyTarget(g); setClassifyDept(''); setClassifyError(''); }}>
                          <FolderCog className="w-4 h-4 mr-1" /> Classify
                        </Button>
                      )}
                      {g.status !== 'resolved' && g.status !== 'closed' && (
                        <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => { setAssignTarget(g); setAssigneeId(g.assigned_to || ''); setAssignError(''); }}>
                          <UserCog className="w-4 h-4 mr-1" /> Assign
                        </Button>
                      )}
                      {['open', 'in_progress', 'escalated'].includes(g.status) && (
                        <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => { setResolveTarget(g); setNotes(''); setResolveError(''); }}>
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Resolve
                        </Button>
                      )}
                    </div>
                  }
                />
                <CardBody>
                  <p className="text-sm text-slate-600">{g.description}</p>
                  {g.assigned_to && <p className="text-xs text-slate-400 mt-2">Assigned to user {g.assigned_to}</p>}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

{/* Classify modal */}
      <Modal
        open={!!classifyTarget}
        onClose={() => !classify.isPending && setClassifyTarget(null)}
        title={`Classify grievance #${classifyTarget?.id}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setClassifyTarget(null)} disabled={classify.isPending}>Cancel</Button>
            <Button onClick={submitClassify} isLoading={classify.isPending}>Classify</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Assign a canonical department so officers can claim it. Only unlinked grievances can be classified.</p>
          <Input label="Department" required value={classifyDept} onChange={(e) => setClassifyDept(e.target.value)} placeholder="e.g. Fire Department" />
          {classifyError && <p className="text-sm text-error" role="alert">{classifyError}</p>}
        </div>
      </Modal>

      {/* Assign modal */}
      <Modal
        open={!!assignTarget}
        onClose={() => !reassign.isPending && setAssignTarget(null)}
        title={`Assign grievance #${assignTarget?.id}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setAssignTarget(null)} disabled={reassign.isPending}>Cancel</Button>
            <Button onClick={submitReassign} isLoading={reassign.isPending}>Assign</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Assignee must be an officer in the grievance's department. Blank = unassign.</p>
          <Input label="Officer user ID" type="number" min="1" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} placeholder="Blank to unassign" />
          {assignError && <p className="text-sm text-error" role="alert">{assignError}</p>}
        </div>
      </Modal>

      {/* Resolve modal */}
      <Modal
        open={!!resolveTarget}
        onClose={() => !resolve.isPending && setResolveTarget(null)}
        title={`Resolve grievance #${resolveTarget?.id}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setResolveTarget(null)} disabled={resolve.isPending}>Cancel</Button>
            <Button onClick={submitResolve} isLoading={resolve.isPending}>Mark Resolved</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Textarea label="Resolution notes" required rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Explain the resolution (1–2000 chars)" />
          {resolveError && <p className="text-sm text-error" role="alert">{resolveError}</p>}
        </div>
      </Modal>
    </div>
  );
};