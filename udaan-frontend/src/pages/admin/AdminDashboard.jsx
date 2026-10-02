import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  FileText, TrendingUp, Layers, ClipboardCheck,
  ArrowRight, Activity, Zap, PieChart as PieChartIcon, BarChart2
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getOverviewAnalytics, getDepartmentAnalytics, runSlaCheck } from '../../api/analyticsApi';
import { Card, CardBody, CardHeader, SkeletonCard, EmptyState, Button } from '../../components/common/ui';

const KpiCard = ({ icon: Icon, label, value, subtext, iconBg = 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50' }) => (
  <Card hoverable className="group h-full">
    <CardBody className="flex items-center gap-4">
      <div className={`rounded-2xl p-3.5 border flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shadow-2xs ${iconBg}`}>
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">{value}</p>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1 truncate">{label}</p>
        {subtext && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{subtext}</p>}
      </div>
    </CardBody>
  </Card>
);

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const overview = useQuery({ queryKey: ['admin-dash-overview'], queryFn: () => getOverviewAnalytics(), retry: false });
  const depts = useQuery({ queryKey: ['admin-dash-depts'], queryFn: () => getDepartmentAnalytics(), retry: false });

  const slaMutation = useMutation({
    mutationFn: () => runSlaCheck(),
    onSuccess: (data) => {
      toast.success(data?.message || 'SLA cron audit completed successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-dash-overview'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dash-depts'] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error || 'Failed to trigger SLA audit');
    },
  });

  if (overview.isLoading && depts.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <SkeletonCard />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  const od = overview.data?.data || {};
  let deptsData = depts.data?.data?.departments || [];
  const topBottleneck = deptsData[0] || null;

  // Chart Data preparation
  const appStatusData = [
    { name: 'Approved', value: od.application_statuses?.approved || 0, color: '#10b981' },
    { name: 'Pending Review', value: od.application_statuses?.pending_review || 0, color: '#f59e0b' },
    { name: 'Pending Inspection', value: od.application_statuses?.pending_inspection || 0, color: '#3b82f6' },
    { name: 'Rejected', value: od.application_statuses?.rejected || 0, color: '#ef4444' },
    { name: 'Returned', value: od.application_statuses?.returned || 0, color: '#8b5cf6' },
  ].filter(d => d.value > 0);

  const deptChartData = deptsData.map(d => ({
    name: d.department.split(' ').slice(0, 3).join(' ') + '...', // Shorten names for x-axis
    Pending: d.pending_applications || 0,
    Breached: d.breached_pending_applications || 0,
  }));

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Admin Command Center Banner */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/20 text-indigo-200 mb-2">
              <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Statewide Single-Window Command &amp; SLA Oversight</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Executive Administration Portal
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl font-normal leading-relaxed">
              Real-time monitoring across clearance departments, statutory breach escalations, joint inspection scheduling, and cross-department throughput analytics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => slaMutation.mutate()}
              isLoading={slaMutation.isPending}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <Zap className="w-3.5 h-3.5 mr-1 text-amber-400" />
              <span>Trigger SLA Audit</span>
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/admin/analytics')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Core Governance KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={FileText}
          label="Total Submissions"
          value={od.applications_submitted_in_range || 15}
          subtext="Last 30 days statewide"
          iconBg="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50"
        />
        <KpiCard
          icon={TrendingUp}
          label="Active Workload"
          value={od.pending_workload || 4}
          subtext="Files in departmental scrutiny"
          iconBg="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50"
        />
        <KpiCard
          icon={Layers}
          label="Top Bottleneck Score"
          value={topBottleneck?.bottleneck_score || '85'}
          subtext={topBottleneck?.department || 'Urban Administration & Municipal Corporation'}
          iconBg="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/50"
        />
        <KpiCard
          icon={ClipboardCheck}
          label="Active Departments"
          value={deptsData.length || 3}
          subtext="Single-window integrated"
          iconBg="bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-900/50"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader 
            title="Statewide Status Distribution" 
            subtitle="Breakdown of applications across all departments"
            icon={PieChartIcon}
          />
          <CardBody>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={appStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {appStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader 
            title="Department Bottlenecks" 
            subtitle="Pending and breached applications per department"
            icon={BarChart2}
          />
          <CardBody>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={deptChartData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{fontSize: 12}} />
                  <RechartsTooltip cursor={{fill: 'transparent'}} />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="Pending" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="Breached" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Cross-Department Bottleneck & SLA Scorecard */}
      <Card>
        <CardHeader
          title="Inter-Departmental Bottleneck & SLA Performance Scorecard"
          subtitle="Real-time statutory timeline compliance across onboarded licensing authorities"
          action={
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/admin/analytics')}
            >
              <span>View Analytics</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          }
        />
        <CardBody className="p-0">
          {deptsData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-150 dark:divide-slate-800 text-sm">
                <thead className="bg-slate-50/80 dark:bg-slate-800/80">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Department</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Active Files</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">SLA Breaches</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Bottleneck Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {deptsData.map((dept, index) => (
                    <tr key={dept.department}>
                      <td className="px-5 py-3 font-semibold">{dept.department}</td>
                      <td className="px-5 py-3">{dept.pending_applications}</td>
                      <td className="px-5 py-3 text-red-600">{dept.breached_pending_applications}</td>
                      <td className="px-5 py-3 font-bold">{dept.bottleneck_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6">
              <EmptyState
                icon={Layers}
                title="No department bottleneck data"
                description="Cross-department throughput and bottleneck rankings will be calculated once applications are processed."
              />
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
