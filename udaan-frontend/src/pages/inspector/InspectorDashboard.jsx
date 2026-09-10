import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardCheck, MapPin, Calendar, Clock, CheckCircle2,
  AlertTriangle, ShieldCheck, Camera, ArrowRight, Search, FileCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardBody, CardHeader, Button, EmptyState } from '../../components/common/ui';

const KpiCard = ({ icon: Icon, label, value, subtext, iconBg = 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50' }) => (
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

export const InspectorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quickId, setQuickId] = useState('');

  const handleQuickLookup = (e) => {
    e.preventDefault();
    if (!quickId.trim()) return;
    navigate('/inspector/inspections');
  };

  // Prototype Mock Data
  const inspections = [
    {
      id: "APP-90210",
      businessName: "Test Applicant (test@gmail.com)",
      department: user?.department || "Unassigned",
      status: "pending_inspection",
      date: new Date().toLocaleDateString()
    }
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Field Officer Active Station Header */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 border border-white/20 text-amber-100 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Active Field Verification Unit • On Duty</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Field Inspector Control Center
            </h1>
            <p className="text-sm text-amber-100 mt-1 max-w-2xl font-normal leading-relaxed">
              Officer: <strong>{user?.name}</strong> • Scheduled site verifications, on-site photo evidence documentation, and physical parameter clearances.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              onClick={() => navigate('/inspector/inspections')}
              className="bg-white/10 hover:bg-white/20 text-white border-white/30"
            >
              <ClipboardCheck className="w-4 h-4 mr-1.5" />
              <span>Inspection Queue</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Field Inspection Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Calendar}
          label="Site Visits Today"
          value="1"
          subtext="Scheduled across your zone"
          iconBg="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50"
        />
        <KpiCard
          icon={Clock}
          label="Pending Queue"
          value="1"
          subtext="Awaiting on-site survey"
          iconBg="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50"
        />
        <KpiCard
          icon={CheckCircle2}
          label="Clearance Pass Rate"
          value="100%"
          subtext="Compliance satisfied on 1st visit"
          iconBg="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:emerald-900/50"
        />
        <KpiCard
          icon={AlertTriangle}
          label="Discrepancies Flagged"
          value="0"
          subtext="Rectifications ordered"
          iconBg="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/50"
        />
      </div>

      {/* Quick Lookup Bar */}
      <Card>
        <CardBody className="p-4 sm:p-5">
          <form onSubmit={handleQuickLookup} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={quickId}
                onChange={(e) => setQuickId(e.target.value)}
                placeholder="Enter Applicant Profile ID to begin inspection report..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-2xs"
              />
            </div>
            <Button
              type="submit"
              className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white"
            >
              <FileCheck className="w-4 h-4 mr-1.5" />
              <span>Open Field Report</span>
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* Today's Scheduled Field Roster */}
      <Card>
        <CardHeader
          title="Today's On-Site Verification Schedule"
          subtitle="Physical premises inspections assigned to your inspector ID for today"
          action={
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/inspector/inspections')}
            >
              <span>Full Worklist</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          }
        />
        <CardBody className="space-y-3">
          {inspections.length > 0 ? (
            inspections.map((item) => (
              <div
                key={item.id}
                className="p-4 flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm"
              >
                <div>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">{item.businessName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.department} • {item.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-md">Scheduled: Today</p>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              icon={ClipboardCheck}
              title="No inspections scheduled today"
              description="Assigned site verification visits and joint inspection orders will appear here."
            />
          )}
        </CardBody>
      </Card>

      {/* Field Inspection Protocol & Verification Guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2.5">
            <Camera className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Geo-Tagged Evidence</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            All physical site inspections mandate capturing latitude/longitude verified photos of plant machinery and fire extinguishers.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2.5">
            <Clock className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">48-Hour Upload SLA</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Once physical inspection is completed on-site, report remarks and findings must be recorded on UDAAN within 48 hours.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Single Joint Verification</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Under Ease of Doing Business norms, joint inspections eliminate multiple departmental visits for business premises.
          </p>
        </div>
      </div>
    </div>
  );
};
