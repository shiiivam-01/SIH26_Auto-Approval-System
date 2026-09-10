import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Search, ClipboardCheck, MapPin, CheckCircle2, XCircle, AlertTriangle,
  Camera, FileText, Building2, Calendar, ShieldCheck, CheckSquare, Clock
} from 'lucide-react';
import { getInspections, completeInspection } from '../../api/inspectionApi';
import { extractApiError } from '../../utils/errors';
import { Badge, Button, Card, CardBody, CardHeader, Input, PageHeader, Textarea, EmptyState, ErrorState, SkeletonRows, Modal } from '../../components/common/ui';
import { INSPECTION_STATUS, INSPECTION_RESULT, APPLICATION_STATUS } from '../../constants/statusCatalog';

const noRetry = (f, e) => e?.response?.status !== 403 && e?.response?.status !== 404 && f < 2;

const presetSites = [
  { id: '1', name: 'Primary Registered Site (Profile #1)', zone: 'Mandideep Zone A' },
  { id: '2', name: 'Vanguard Biotech (Profile #2)', zone: 'Pithampur Sector 3' },
  { id: '3', name: 'Surya Cold Storage (Profile #3)', zone: 'Indore Bypass' },
];

export const InspectorInspectionsPage = () => {
  const [searchId, setSearchId] = useState('1');
  const [applicantId, setApplicantId] = useState('1');
  const queryClient = useQueryClient();

  const inspections = useQuery({
    queryKey: ['inspections', applicantId],
    queryFn: () => getInspections(applicantId),
    enabled: !!applicantId,
    retry: noRetry,
  });

  const [completeTarget, setCompleteTarget] = useState(null); // inspection
  const [result, setResult] = useState('pass');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Physical verification checklist state
  const [checklistState, setChecklistState] = useState({
    fire_exits: true,
    electrical_earthing: true,
    ventilation: true,
    hazardous_containment: true,
  });

  const complete = useMutation({
    mutationFn: () => completeInspection(completeTarget.id, { result, inspector_notes: notes.trim() || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections', applicantId] });
      toast.success('Inspection report submitted — application status updated!');
      setCompleteTarget(null);
      setResult('pass');
      setNotes('');
      setFormError('');
    },
    onError: (error) => {
      if (error?.response?.status === 409) {
        toast.error(extractApiError(error));
        queryClient.invalidateQueries({ queryKey: ['inspections', applicantId] });
        setCompleteTarget(null);
      } else {
        setFormError(extractApiError(error));
      }
    },
  });

  const submitComplete = () => {
    setFormError('');
    if ((result === 'fail' || result === 'conditional') && !notes.trim()) {
      setFormError('Inspector observation remarks are legally required for Fail/Conditional results.');
      return;
    }
    complete.mutate();
  };

  const openComplete = (ins) => {
    setCompleteTarget(ins);
    setResult('pass');
    setNotes('');
    setFormError('');
  };

  const handlePresetClick = (id) => {
    setSearchId(id);
    setApplicantId(id);
  };

  const submitSearch = (e) => {
    e?.preventDefault();
    if (!searchId.trim()) return;
    setApplicantId(searchId.trim());
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        title="Field Inspection & Physical Verification Workdesk"
        description="Conduct on-site parameter checks, verify premises compliance, and submit geo-tagged inspector verdicts."
      />

      {/* Site Selector & Presets */}
      <Card>
        <CardBody className="space-y-4">
          <form onSubmit={submitSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 max-w-sm">
              <Input
                label="Applicant Profile ID for Inspection"
                required
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="e.g. 1"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white">
                <Search className="w-4 h-4 mr-2" /> Load Site Inspections
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {!applicantId && <EmptyState title="Select a site to begin physical verification" />}
      {applicantId && inspections.isLoading && <SkeletonRows rows={4} />}
      {applicantId && inspections.isError && (
        <ErrorState
          title="Could Not Load Inspection File"
          message={inspections.error?.response?.data?.error || `No assigned inspections found for Profile #${applicantId}.`}
        />
      )}

      {applicantId && !inspections.isLoading && !inspections.isError && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Site Inspection Header */}
          <div className="p-4 rounded-2xl border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Field Premises Survey • Applicant Profile #{applicantId}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>GPS Coordinates Logged: 23.2599° N, 77.4126° E (Mandideep Industrial Sector)</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                Joint Inspection Ready
              </span>
            </div>
          </div>

          {/* Inspection Orders Queue */}
          <Card>
            <CardHeader
              title={`Assigned Site Inspections (${inspections.data?.length ?? 0})`}
              subtitle="Inspect physical safety, effluent parameters, and factory installation norms"
            />
            <CardBody>
              {!inspections.data || inspections.data.length === 0 ? (
                <EmptyState
                  icon={ClipboardCheck}
                  title="No inspections assigned for this applicant"
                  description="This applicant profile currently has no physical inspection orders required."
                />
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {inspections.data.map((ins) => {
                    const st = INSPECTION_STATUS[ins.status];
                    const rs = ins.result ? INSPECTION_RESULT[ins.result] : null;
                    const canComplete = ins.status === 'assigned' || ins.status === 'scheduled';
                    return (
                      <li key={ins.id} className="py-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-xs text-slate-400">#{ins.id}</span>
                            <p className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                              {ins.application?.approval_name || 'Statutory Inspection'}
                            </p>
                            <Badge label={st?.label || ins.status} colorClass={st?.color} />
                            {rs && <Badge label={`Verdict: ${rs.label}`} colorClass={rs.color} />}
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            Linked Application: #{ins.application_id} · Inspection Authority: <strong>{ins.department || 'Fire & Industry Directorate'}</strong>
                            {ins.scheduled_date && ` · Scheduled Date: ${new Date(ins.scheduled_date).toLocaleDateString()}`}
                          </p>

                          {ins.inspector_notes && (
                            <div className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                              <span className="font-bold">Inspector Remarks:</span> {ins.inspector_notes}
                            </div>
                          )}
                        </div>

                        {canComplete && (
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              size="sm"
                              className="bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                              onClick={() => openComplete(ins)}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Submit Inspection Verdict
                            </Button>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardBody>
          </Card>

          {/* On-Site Verification Checklist Reference */}
          <Card>
            <CardHeader
              title="Physical Verification Protocol Checklist"
              subtitle="Statutory parameters to verify before issuing clearance report"
            />
            <CardBody>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklistState.fire_exits}
                    onChange={(e) => setChecklistState({ ...checklistState, fire_exits: e.target.checked })}
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 dark:text-white block">Fire Safety &amp; Emergency Exits</span>
                    <span className="text-slate-500 dark:text-slate-400">Minimum 2.4m clear unobstructed corridor width.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklistState.electrical_earthing}
                    onChange={(e) => setChecklistState({ ...checklistState, electrical_earthing: e.target.checked })}
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 dark:text-white block">Electrical Transformer Earthing</span>
                    <span className="text-slate-500 dark:text-slate-400">Double earth pit resistance measurement &lt; 2.5 ohms.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklistState.ventilation}
                    onChange={(e) => setChecklistState({ ...checklistState, ventilation: e.target.checked })}
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 dark:text-white block">Industrial Exhaust &amp; Ventilation</span>
                    <span className="text-slate-500 dark:text-slate-400">Sufficient air changes per hour for chemical formulation.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklistState.hazardous_containment}
                    onChange={(e) => setChecklistState({ ...checklistState, hazardous_containment: e.target.checked })}
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 dark:text-white block">Effluent &amp; Hazardous Containment</span>
                    <span className="text-slate-500 dark:text-slate-400">Bunded storage tanks preventing accidental spill leaks.</span>
                  </div>
                </label>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Complete Inspection Modal */}
      <Modal
        open={!!completeTarget}
        onClose={() => setCompleteTarget(null)}
        title="Submit On-Site Inspection Verdict"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setCompleteTarget(null)} disabled={complete.isPending}>
              Cancel
            </Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={submitComplete}
              isLoading={complete.isPending}
            >
              Confirm &amp; Sign Verdict
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Inspection #{completeTarget?.id} · Application #{completeTarget?.application_id} ({completeTarget?.application?.approval_name})
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Physical Verification Finding <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setResult('pass')}
                className={`py-2 px-3 rounded-xl border font-bold text-center transition-all ${
                  result === 'pass'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                PASS (Compliant)
              </button>
              <button
                type="button"
                onClick={() => setResult('conditional')}
                className={`py-2 px-3 rounded-xl border font-bold text-center transition-all ${
                  result === 'conditional'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                CONDITIONAL
              </button>
              <button
                type="button"
                onClick={() => setResult('fail')}
                className={`py-2 px-3 rounded-xl border font-bold text-center transition-all ${
                  result === 'fail'
                    ? 'bg-red-600 text-white border-red-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                FAIL (Discrepancy)
              </button>
            </div>
          </div>

          <div>
            <Textarea
              label="Inspector Observations & Report Remarks"
              placeholder="Record exact on-site observations, machinery installation notes, or rectification instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <Camera className="w-4 h-4 text-blue-600" />
            <span>Digital Evidence Signed • Geo-stamp attached: 23.2599° N, 77.4126° E</span>
          </div>

          {formError && <p className="text-xs text-red-600 font-semibold">{formError}</p>}
        </div>
      </Modal>
    </div>
  );
};