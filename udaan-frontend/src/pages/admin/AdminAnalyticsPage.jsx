import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FileText, TrendingUp, CheckCircle2, Clock, Layers, ClipboardCheck, MessageSquareWarning, Activity, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';
import {
  getOverviewAnalytics, getSlaAnalytics, getDepartmentAnalytics,
  getInspectionAnalytics, getGrievanceAnalytics, getTrendsAnalytics, runSlaCheck,
} from '../../api/analyticsApi';
import { extractApiError } from '../../utils/errors';
import { Button, Card, CardHeader, CardBody, PageHeader, Select, SkeletonRows, ErrorState, ConfirmDialog } from '../../components/common/ui';

const tabs = [
  { key: 'overview', label: 'Overview', icon: Activity },
  { key: 'departments', label: 'Bottlenecks', icon: Layers },
  { key: 'inspections', label: 'Inspections', icon: ClipboardCheck },
  { key: 'grievances', label: 'Grievances', icon: MessageSquareWarning },
  { key: 'trends', label: 'Trends', icon: TrendingUp },
];

const Kpi = ({ icon: Icon, label, value, tone = 'text-primary-600' }) => (
  <Card>
    <CardBody className="flex items-center gap-4">
      <div className="rounded-lg bg-slate-100 p-3"><Icon className={`w-6 h-6 ${tone}`} aria-hidden="true" /></div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      </div>
    </CardBody>
  </Card>
);

export const AdminAnalyticsPage = () => {
  const [tab, setTab] = useState('overview');
  const [department, setDepartment] = useState('');
  const [slaConfirm, setSlaConfirm] = useState(false);

  const params = department ? { department } : {};
  const trendsParams = (() => {
    const end = new Date();
    const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { ...params, startDate: start.toISOString(), endDate: end.toISOString() };
  })();

  const overview = useQuery({ queryKey: ['analytics', 'overview', department], queryFn: () => getOverviewAnalytics(params), retry: false });
  const sla = useQuery({ queryKey: ['analytics', 'sla', department], queryFn: () => getSlaAnalytics(params), retry: false });
  const depts = useQuery({ queryKey: ['analytics', 'departments', department], queryFn: () => getDepartmentAnalytics(params), retry: false });
  const inspections = useQuery({ queryKey: ['analytics', 'inspections', department], queryFn: () => getInspectionAnalytics(params), retry: false });
  const grievances = useQuery({ queryKey: ['analytics', 'grievances', department], queryFn: () => getGrievanceAnalytics(params), retry: false });
  const trends = useQuery({ queryKey: ['analytics', 'trends', department], queryFn: () => getTrendsAnalytics(trendsParams), retry: false });

  const runSla = useMutation({ mutationFn: runSlaCheck, onSuccess: () => { toast.success('SLA check executed'); setSlaConfirm(false); }, onError: (e) => toast.error(extractApiError(e)) });

  // Watch for 400 on unknown department filter → clear it and inform the user.
  const firstError = [overview, sla, depts, inspections, grievances, trends].find((q) => q.isError && q.error?.response?.status === 400);
  const query = { overview, sla, depts, inspections, grievances, trends };

  const allowedDepts = [
    'Food Safety and Standards Authority of India (FSSAI)',
    'State FDA & Central Drugs Standard Control Organisation (CDSCO)',
    'Urban Administration & Municipal Corporation'
  ];
  const allDeptsList = (depts.data?.data?.departments || [])
    .filter((d) => allowedDepts.includes(d.department))
    .map((d) => ({ value: d.department, label: d.department }));

  const departmentOptions = department
    ? [{ value: '', label: 'All departments' }, { value: department, label: department }]
    : [{ value: '', label: 'All departments' }, ...allDeptsList];

  const anyLoading = [query.overview, query.sla, query.depts, query.inspections, query.grievances, query.trends].some((q) => q.isLoading && !q.data);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Admin · global or department-filtered. All KPIs are computed by the backend."
        action={
          <div className="flex items-center gap-2">
            <div className="w-64">
              <Select aria-label="Filter by department" value={department} onChange={(e) => setDepartment(e.target.value)} options={departmentOptions} placeholder="All departments" />
            </div>
            <Button variant="outline" onClick={() => setSlaConfirm(true)}><Clock className="w-4 h-4 mr-2" /> Run SLA Check</Button>
          </div>
        }
      />

      {firstError && (
        <ErrorState title="Analytics request failed" message={firstError.error.response?.data?.error} onRetry={() => firstError.refetch()} />
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 -mb-px text-sm font-medium border-b-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              tab === t.key ? 'border-primary-600 text-primary-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            )}
          >
            <t.icon className="w-4 h-4" aria-hidden="true" />
            {t.label}
          </button>
        ))}
      </div>

      {anyLoading ? <SkeletonRows rows={5} /> : (
        <>
          {tab === 'overview' && (
            <OverviewTab overview={query.overview.data?.data} sla={query.sla.data?.data} />
          )}
          {tab === 'departments' && <DepartmentsTab data={query.depts.data?.data} />}
          {tab === 'inspections' && <InspectionsTab data={query.inspections.data?.data} />}
          {tab === 'grievances' && <GrievancesTab data={query.grievances.data?.data} />}
          {tab === 'trends' && <TrendsTab data={query.trends.data?.data} />}
        </>
      )}

      <ConfirmDialog
        open={slaConfirm}
        onClose={() => setSlaConfirm(false)}
        onConfirm={() => runSla.mutate()}
        isLoading={runSla.isPending}
        title="Run SLA check?"
        confirmLabel="Run"
        message="Triggers the SLA warning/breach notification scan now (same job as the nightly cron). It creates notifications and may escalate overdue grievances."
      />
    </div>
  );
};

const OverviewTab = ({ overview, sla }) => {
  const approval = overview?.approval_rate_for_decisions_in_range;
  const turnaround = overview?.average_turnaround_for_decisions_in_range;
  const slaState = sla?.sla_state || {};
  const statuses = overview?.application_statuses || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={FileText} label="Submitted (30d)" value={overview?.applications_submitted_in_range ?? 0} />
        <Kpi icon={CheckCircle2} label="Decisions (30d)" value={overview?.decisions_completed_in_range ?? 0} tone="text-secondary-600" />
        <Kpi icon={TrendingUp} label="Approval Rate" value={approval ? `${approval.rate ?? 0}%` : '—'} />
        <Kpi icon={Clock} label="Pending Workload" value={overview?.pending_workload ?? 0} tone="text-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Application statuses" subtitle="Current records (incl. pending paths)" />
          <CardBody>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(statuses).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2">
                  <span className="text-sm text-slate-600 capitalize">{status.replace(/_/g, ' ')}</span>
                  <span className="text-sm font-semibold text-slate-900">{count}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="SLA state" subtitle={`Warning threshold: ${sla?.warning_hours ?? 48} hours`} />
            <CardBody>
              <div className="space-y-2">
                <div className="flex justify-between rounded-md border border-green-200 bg-green-50 px-3 py-2"><span className="text-sm text-green-800">On track</span><span className="text-sm font-semibold">{slaState.on_track ?? 0}</span></div>
                <div className="flex justify-between rounded-md border border-amber-200 bg-amber-50 px-3 py-2"><span className="text-sm text-amber-800">Warning</span><span className="text-sm font-semibold">{slaState.warning ?? 0}</span></div>
                <div className="flex justify-between rounded-md border border-red-200 bg-red-50 px-3 py-2"><span className="text-sm text-red-800">Breached</span><span className="text-sm font-semibold">{slaState.breached ?? 0}</span></div>
                <div className="flex justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2"><span className="text-sm text-slate-600">Missing deadline</span><span className="text-sm font-semibold">{slaState.missing_deadline ?? 0}</span></div>
              </div>
            </CardBody>
          </Card>

          {turnaround && (
            <Card>
              <CardHeader title="Average turnaround" />
              <CardBody>
                <p className="text-2xl font-bold text-slate-900">{turnaround.average_hours ?? 0} <span className="text-sm font-normal text-slate-500">hours</span></p>
                <p className="text-xs text-slate-400 mt-1">Sample: {turnaround.sample_size ?? 0} decisions</p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

const DepartmentsTab = ({ data }) => {
  const depts = data?.departments || [];
  const maxScore = Math.max(1, ...depts.map((d) => d.bottleneck_score));

  return (
    <Card>
      <CardHeader title="Department bottlenecks" subtitle={`Score = pending + 2×breached + 2×high-escalation grievances · ${data?.formula || ''}`} />
      <CardBody>
        {depts.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No department data.</p>
        ) : (
          <ul className="space-y-4">
            {depts.map((d) => (
              <li key={d.department}>
                <div className="flex items-center justify-between mb-1 gap-2">
                  <p className="text-sm font-medium text-slate-900">{d.department}</p>
                  <p className="text-sm font-semibold text-slate-900">{d.bottleneck_score}</p>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-primary-600" style={{ width: `${(d.bottleneck_score / maxScore) * 100}%` }} />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {d.pending_applications} pending · {d.breached_pending_applications} breached · {d.unresolved_high_escalation_grievances} high-escalation grievances · avg age {d.average_pending_age_hours ?? 0}h
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
};

const InspectionsTab = ({ data }) => {
  const results = data?.inspection_results || {};
  const avg = data?.average_inspection_duration;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={ClipboardCheck} label="Completed (30d)" value={data?.completed_inspections_in_range ?? 0} />
        <Kpi icon={CheckCircle2} label="Passed" value={results.pass ?? 0} tone="text-green-600" />
        <Kpi icon={Clock} label="Conditional" value={results.conditional ?? 0} tone="text-amber-600" />
        <Kpi icon={AlertTriangle} label="Unassigned Scheduled" value={data?.unassigned_scheduled_inspections ?? 0} tone="text-error" />
      </div>
      {avg && (
        <Card>
          <CardHeader title="Average inspection duration" />
          <CardBody>
            <p className="text-2xl font-bold text-slate-900">{avg.avg_hours ?? 0} <span className="text-sm font-normal text-slate-500">hours</span></p>
            <p className="text-xs text-slate-400 mt-1">Sample: {avg.sample_size ?? 0} inspections</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

const GrievancesTab = ({ data }) => {
  const statuses = data?.grievance_statuses || {};
  const levels = data?.unresolved_grievance_levels || {};
  const avg = data?.average_grievance_resolution_time;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={MessageSquareWarning} label="Created (30d)" value={data?.grievances_created_in_range ?? 0} />
        <Kpi icon={CheckCircle2} label="Resolved (30d)" value={data?.grievances_resolved_in_range ?? 0} tone="text-green-600" />
        <Kpi icon={Clock} label="Unresolved" value={data?.unresolved_grievances ?? 0} tone="text-amber-600" />
        {avg && <Kpi icon={TrendingUp} label="Avg Resolution (h)" value={avg.avg_hours ?? 0} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Grievance statuses (created in range)" />
          <CardBody>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(statuses).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2">
                  <span className="text-sm text-slate-600 capitalize">{status.replace(/_/g, ' ')}</span>
                  <span className="text-sm font-semibold text-slate-900">{count}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Unresolved by escalation level" />
          <CardBody>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(levels).map(([level, count]) => (
                <div key={level} className="rounded-md border border-slate-200 px-3 py-2 text-center">
                  <p className="text-lg font-bold text-slate-900">{count}</p>
                  <p className="text-xs text-slate-500">L{level}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

const TrendsTab = ({ data }) => {
  const buckets = data?.buckets || [];
  // Backend bucket shape (authoritative): { application_decisions: {approved, auto_approved, rejected, total}, inspections_completed, grievances_created, grievances_resolved }
  const maxTotal = Math.max(1, ...buckets.map((b) => b.application_decisions?.total ?? 0));
  const maxInsp = Math.max(1, ...buckets.map((b) => b.inspections_completed ?? 0));
  const maxGriev = Math.max(1, ...buckets.map((b) => Math.max(b.grievances_created ?? 0, b.grievances_resolved ?? 0)));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Daily submissions & decisions" subtitle={`Interval: ${data?.interval ?? 'day'} · ${buckets.length} buckets`} />
        <CardBody>
          {buckets.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No trend data.</p>
          ) : (
            <div className="space-y-3">
              {buckets.map((b, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-[120px_1fr_90px_90px] items-center gap-2 text-sm">
                  <span className="text-xs text-slate-400">Bucket {i + 1}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-full max-w-sm rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-primary-600" style={{ width: `${((b.application_decisions?.total ?? 0) / maxTotal) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-slate-700">{b.application_decisions?.total ?? 0} decisions</span>
                  <span className="text-slate-500">{b.inspections_completed ?? 0} inspections</span>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader title="Inspection completions" />
          <CardBody>
            <div className="space-y-2">
              {buckets.map((b, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-16">#{i + 1}</span>
                  <div className="h-2.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-secondary-500" style={{ width: `${((b.inspections_completed ?? 0) / maxInsp) * 100}%` }} />
                  </div>
                  <span className="text-xs text-slate-600 w-6 text-right">{b.inspections_completed ?? 0}</span>
                </div>
              ))}
              {buckets.length === 0 && <p className="text-sm text-slate-500">No data.</p>}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Grievances created/resolved" />
          <CardBody>
            <div className="space-y-2">
              {buckets.map((b, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-16">#{i + 1}</span>
                  <div className="h-2.5 flex-1 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="h-full rounded-l-full bg-amber-500" style={{ width: `${((b.grievances_created ?? 0) / maxGriev) * 100}%` }} />
                    <div className="h-full rounded-r-full bg-green-500" style={{ width: `${((b.grievances_resolved ?? 0) / maxGriev) * 100}%` }} />
                  </div>
                  <span className="text-xs text-slate-600 w-16 text-right">{b.grievances_created ?? 0}/{b.grievances_resolved ?? 0}</span>
                </div>
              ))}
              {buckets.length === 0 && <p className="text-sm text-slate-500">No data.</p>}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Approval mix (last bucket)" />
          <CardBody>
            <div className="space-y-2">
              {(() => {
                const last = buckets[buckets.length - 1]?.application_decisions;
                return last ? (
                  <>
                    <div className="flex justify-between rounded-md border border-slate-200 px-3 py-2"><span className="text-sm text-slate-600">Approved</span><span className="text-sm font-semibold">{last.approved ?? 0}</span></div>
                    <div className="flex justify-between rounded-md border border-slate-200 px-3 py-2"><span className="text-sm text-slate-600">Auto-approved</span><span className="text-sm font-semibold">{last.auto_approved ?? 0}</span></div>
                    <div className="flex justify-between rounded-md border border-slate-200 px-3 py-2"><span className="text-sm text-slate-600">Rejected</span><span className="text-sm font-semibold">{last.rejected ?? 0}</span></div>
                  </>
                ) : <p className="text-sm text-slate-500">No data.</p>;
              })()}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};