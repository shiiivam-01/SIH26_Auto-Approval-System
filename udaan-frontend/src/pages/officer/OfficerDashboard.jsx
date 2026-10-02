import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  FileText, TrendingUp, AlertTriangle, CheckCircle2,
  ShieldCheck, ArrowRight, Search, Filter, PieChart as PieChartIcon, BarChart2
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { getOverviewAnalytics, getSlaAnalytics } from '../../api/analyticsApi';
import { getDepartmentQueue } from '../../api/applicationApi';
import { Card, CardBody, CardHeader, PageHeader, SkeletonCard, EmptyState, Badge, Button } from '../../components/common/ui';

const KpiCard = ({ icon: Icon, label, value, subtext, iconBg = 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50' }) => (
  <Card hoverable className="group">
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

export const OfficerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filterRisk, setFilterRisk] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const overview = useQuery({
    queryKey: ['officer-dash-overview', user?.department],
    queryFn: () => getOverviewAnalytics(user?.department ? { department: user.department } : {}),
    retry: false,
  });

  const sla = useQuery({
    queryKey: ['officer-dash-sla', user?.department],
    queryFn: () => getSlaAnalytics(user?.department ? { department: user.department } : {}),
    retry: false,
  });

  if (overview.isLoading && sla.isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <SkeletonCard />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  const queueQuery = useQuery({
    queryKey: ['officer-dash-queue'],
    queryFn: () => getDepartmentQueue(),
    retry: false,
  });

  const od = overview.data?.data || {};
  const sd = sla.data?.data || {};
  const slaState = sd.sla_state || {};
  const queue = queueQuery.data || [];

  // Chart Data preparation
  const appStatusData = [
    { name: 'Approved', value: od.application_statuses?.approved || 0, color: '#10b981' },
    { name: 'Pending Review', value: od.application_statuses?.pending_review || 0, color: '#f59e0b' },
    { name: 'Pending Inspection', value: od.application_statuses?.pending_inspection || 0, color: '#3b82f6' },
    { name: 'Rejected', value: od.application_statuses?.rejected || 0, color: '#ef4444' },
    { name: 'Returned', value: od.application_statuses?.returned || 0, color: '#8b5cf6' },
  ].filter(d => d.value > 0);

  const slaChartData = [
    { name: 'Intact', value: slaState.intact || 0, fill: '#10b981' },
    { name: 'Approaching Breach', value: slaState.approaching_breach || 0, fill: '#f59e0b' },
    { name: 'Breached', value: slaState.breached || 0, fill: '#ef4444' },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Department Banner */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-[#1a3a6b] via-blue-900 to-indigo-900 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 border border-white/20 text-blue-100 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Official Departmental Clearance Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {user?.department ? `${user.department} Portal` : 'State Clearance Workdesk'}
            </h1>
            <p className="text-sm text-blue-150 mt-1 max-w-2xl font-normal leading-relaxed">
              Conduct official document scrutiny, verify risk scores, evaluate joint inspector reports, and issue digitally signed clearances within statutory SLAs.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              onClick={() => navigate('/officer/reviews')}
              className="bg-white/10 hover:bg-white/20 text-white border-white/30"
            >
              <span>Open Review Desk</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={FileText}
          label="Pending Scrutiny"
          value={od.pending_workload ?? 0}
          subtext="Files awaiting officer action"
          iconBg="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50"
        />
        <KpiCard
          icon={TrendingUp}
          label="Today's Clearances"
          value={od.decided_in_range ?? 0}
          subtext="Approved and dispatched"
          iconBg="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50"
        />
        <KpiCard
          icon={AlertTriangle}
          label="SLA Breached"
          value={slaState.breached ?? 0}
          subtext="Requires immediate escalation"
          iconBg="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/50"
        />
        <KpiCard
          icon={CheckCircle2}
          label="Department SLA Rate"
          value={sd.sla_compliance_rate !== undefined ? `${sd.sla_compliance_rate}%` : 'N/A'}
          subtext="Files cleared within timeline"
          iconBg="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader 
            title="Department Status Distribution" 
            subtitle="Breakdown of applications by current status"
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
            title="Service Level Agreement (SLA) Health" 
            subtitle="SLA compliance and breaches across active files"
            icon={BarChart2}
          />
          <CardBody>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={slaChartData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" tick={{fontSize: 12}} />
                  <YAxis tick={{fontSize: 12}} />
                  <RechartsTooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                    {slaChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Priority Review Worklist Queue */}
      <Card>
        <CardHeader
          title="Department Applications Queue"
          subtitle="Real-time filings requiring scrutiny or statutory approvals"
          action={
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/officer/reviews')}
            >
              <span>Full Worklist</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          }
        />
        <CardBody className="space-y-4">
          {queue.length > 0 ? (
            queue.map((item) => (
              <div key={item.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{String(item.businessName)} (Profile #{String(item.applicant_id)})</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    <span className="font-medium">{String(item.approval_name)}</span> · Status: {String(item.status).replace('_', ' ')}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={new Date(item.sla_deadline) < new Date() ? 'danger' : 'warning'}>
                    SLA: {new Date(item.sla_deadline).toLocaleDateString()}
                  </Badge>
                  <Button 
                    size="sm" 
                    onClick={() => navigate('/officer/reviews', { state: { applicantId: String(item.applicant_id) } })}
                  >
                    Review Application
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              icon={FileText}
              title="No applications pending scrutiny"
              description="Applications submitted by applicants for your department will appear here for review."
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
};
