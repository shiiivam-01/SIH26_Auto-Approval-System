import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Search, ClipboardCheck, CalendarPlus } from 'lucide-react';
import { getInspections, bundleInspections, assignInspector } from '../../api/inspectionApi';
import { extractApiError } from '../../utils/errors';
import { Badge, Button, Card, CardBody, CardHeader, EmptyState, ErrorState, Input, Modal, PageHeader, SkeletonRows } from '../../components/common/ui';
import { INSPECTION_STATUS, INSPECTION_RESULT, APPLICATION_STATUS } from '../../constants/statusCatalog';

const noRetry = (f, e) => e?.response?.status !== 403 && e?.response?.status !== 404 && f < 2;

export const AdminInspectionsPage = () => {
  const [applicantIdInput, setApplicantIdInput] = useState('');
  const [searchId, setSearchId] = useState(null);
  const [inspectorId, setInspectorId] = useState('');
  const [assignTarget, setAssignTarget] = useState(null);
  const [assignError, setAssignError] = useState('');
  const queryClient = useQueryClient();

  const inspections = useQuery({ queryKey: ['inspections', searchId], queryFn: () => getInspections(searchId), enabled: !!searchId, retry: noRetry, refetchInterval: 5000 });

  const bundle = useMutation({
    mutationFn: () => bundleInspections({ applicant_id: searchId }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['inspections', searchId] });
      toast.success(data.message);
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  const assign = useMutation({
    mutationFn: () => assignInspector(assignTarget.id, Number(inspectorId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections', searchId] });
      toast.success('Inspector assigned');
      setAssignTarget(null); setInspectorId(''); setAssignError('');
    },
    onError: (error) => setAssignError(extractApiError(error)),
  });

  const submitAssign = () => {
    setAssignError('');
    if (!inspectorId.trim() || Number(inspectorId) < 1) { setAssignError('Enter a valid inspector user ID'); return; }
    assign.mutate();
  };

  const submitSearch = (e) => {
    e?.preventDefault();
    if (!applicantIdInput.trim()) return;
    setSearchId(applicantIdInput.trim());
  };

return (
    <div className="space-y-6">
      <PageHeader title="Inspection Management" description="Bundle inspections for any applicant and assign inspectors." />

      <Card>
        <CardBody className="space-y-3">
          <form onSubmit={submitSearch} className="flex flex-col sm:flex-row gap-3">
            <Input label="Applicant profile ID" required type="text" value={applicantIdInput} onChange={(e) => setApplicantIdInput(e.target.value)} placeholder="e.g. 1 or APP-001" className="sm:max-w-xs" />
            <div className="flex items-end">
              <Button type="submit"><Search className="w-4 h-4 mr-2" /> Load Inspections</Button>
            </div>
          </form>
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
            <span className="font-semibold uppercase tracking-wider">Quick Presets:</span>
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => {
                  setApplicantIdInput(String(num));
                  setSearchId(String(num));
                }}
                className="px-2.5 py-1 rounded bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-brand-blue hover:text-brand-blue font-medium transition-colors"
              >
                Applicant #{num}
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {searchId && (
        <Button onClick={() => bundle.mutate()} isLoading={bundle.isPending}>
          <CalendarPlus className="w-4 h-4 mr-2" /> Bundle / Update Inspection
        </Button>
      )}

      {searchId && inspections.isLoading && <SkeletonRows rows={3} />}
      {searchId && inspections.error && <ErrorState title="Could not load inspections" message={inspections.error.response?.data?.error} onRetry={() => inspections.refetch()} />}
      {searchId && inspections.data && inspections.data.length === 0 && (
        <Card><CardBody><EmptyState title="No inspections for this applicant" /></CardBody></Card>
      )}

      {searchId && inspections.data && inspections.data.length > 0 && (
        inspections.data.map((ins) => {
          const st = INSPECTION_STATUS[ins.status];
          const res = ins.result ? INSPECTION_RESULT[ins.result] : null;
          const assignable = ins.status === 'scheduled';
          return (
            <Card key={ins.id}>
              <CardHeader
                title={`Inspection #${ins.id}`}
                subtitle={`Scheduled: ${new Date(ins.scheduled_date).toLocaleString()} · Applicant #${searchId}`}
                action={
                  <div className="flex flex-wrap gap-2">
                    <Badge label={st?.label || ins.status} colorClass={st?.color} icon={ClipboardCheck} />
                    {res && <Badge label={res.label} colorClass={res.color} />}
                    {assignable && (
                      <Button size="sm" className="h-8 px-2" onClick={() => { setAssignTarget(ins); setInspectorId(ins.assigned_inspector_id || ''); setAssignError(''); }}>
                        Assign Inspector
                      </Button>
                    )}
                  </div>
                }
              />
              <CardBody className="space-y-3">
                <p className="text-sm font-medium text-slate-900">Linked applications</p>
                <ul className="space-y-1">
                  {(ins.Applications || []).map((a) => {
                    const aSt = APPLICATION_STATUS[a.status];
                    return (
                      <li key={a.id} className="text-sm text-slate-700 flex flex-wrap items-center gap-2">
                        {a.ApprovalRule?.approval_name}
                        <span className="text-slate-400">· {a.ApprovalRule?.department}</span>
                        <Badge label={aSt?.label || a.status} colorClass={aSt?.color} />
                      </li>
                    );
                  })}
                </ul>
                {ins.Inspector ? (
                  <p className="text-sm text-slate-600">Assigned: <span className="font-medium">{ins.Inspector.name}</span> ({ins.Inspector.department || 'no dept'})</p>
                ) : (
                  <p className="text-sm text-amber-700">No inspector assigned.</p>
                )}
              </CardBody>
            </Card>
          );
        })
      )}

{/* Assign inspector modal */}
      <Modal
        open={!!assignTarget}
        onClose={() => !assign.isPending && setAssignTarget(null)}
        title={`Assign inspector to inspection #${assignTarget?.id}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setAssignTarget(null)} disabled={assign.isPending}>Cancel</Button>
            <Button onClick={submitAssign} isLoading={assign.isPending}>Assign</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Target must exist and have role <span className="font-medium">inspector</span>. Seed IDs: 4 = Fire Inspector, 5 = Pollution Inspector.
          </p>
          <Input label="Inspector user ID" required type="number" min="1" value={inspectorId} onChange={(e) => setInspectorId(e.target.value)} placeholder="e.g. 4" />
          {assignError && <p className="text-sm text-error" role="alert">{assignError}</p>}
        </div>
      </Modal>
    </div>
  );
};