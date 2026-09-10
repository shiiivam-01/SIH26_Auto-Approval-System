import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  FileText, UploadCloud, CheckCircle2, Clock, ShieldCheck, AlertTriangle,
  ExternalLink, BookOpen, FileDown, Edit3, X, ChevronRight, Check, Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import { useApplications, useChecklist, useVault } from '../../hooks/useApplicantData';
import { updateProfile } from '../../api/applicantApi';
import {
  Badge, Button, Card, CardBody, CardHeader, PageHeader,
  SkeletonCard, EmptyState, ErrorState, Modal
} from '../../components/common/ui';
import { APPLICATION_STATUS, RISK_LEVEL, BUSINESS_TYPE_OPTIONS, SECTOR_OPTIONS } from '../../constants/statusCatalog';
import { getDepartmentGovtLink, getIndustryDocumentList } from '../../constants/govDocumentDirectory';
import { extractApiError } from '../../utils/errors';
import { PROTOTYPE_APPLICATIONS, PROTOTYPE_DOCUMENTS } from '../../constants/prototypeData';

const KpiCard = ({
  icon: Icon,
  label,
  value,
  iconBg = 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50',
  isActive = false,
  onClick,
}) => (
  <Card
    hoverable
    onClick={onClick}
    className={`group cursor-pointer select-none transition-all duration-200 ${
      isActive
        ? 'ring-2 ring-blue-500 shadow-md bg-blue-50/30 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700'
        : 'hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
    }`}
  >
    <CardBody className="flex items-center justify-between gap-2 p-4">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className={`rounded-xl p-3 border flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 ${iconBg}`}>
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">{value}</p>
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1 truncate">{label}</p>
        </div>
      </div>
      <div className="flex items-center text-[11px] font-medium text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors shrink-0">
        <span className="hidden sm:inline mr-0.5">{isActive ? 'Hide' : 'Details'}</span>
        <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${isActive ? 'rotate-90 text-blue-600 dark:text-blue-400' : 'group-hover:translate-x-0.5'}`} />
      </div>
    </CardBody>
  </Card>
);

const slaTone = (a) =>
  a.sla_breached ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900'
  : a.days_left <= 2 ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900'
  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900';

const slaLabel = (a) =>
  a.sla_breached ? `SLA breached ${Math.abs(a.days_left)}d ago`
  : a.days_left === 0 ? 'Due today'
  : `${a.days_left} day${a.days_left === 1 ? '' : 's'} left`;

export const ApplicantDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading, hasProfile } = useProfile();
  const applicantId = profile?.id;
  const queryClient = useQueryClient();

  const [selectedKpi, setSelectedKpi] = useState(null); // 'approvals' | 'docs' | 'in_progress' | 'sla' | null
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [dashFormData, setDashFormData] = useState({
    business_name: '',
    business_type: 'pharmacy',
    sector: 'pharma',
  });

  useEffect(() => {
    if (profile) {
      setDashFormData({
        business_name: profile.business_name || '',
        business_type: profile.business_type || 'pharmacy',
        sector: profile.sector || 'pharma',
      });
    }
  }, [profile]);

  const updateBusinessMutation = useMutation({
    mutationFn: async (payload) => {
      return await updateProfile(payload);
    },
    onSuccess: () => {
      // Invalidate all connected caches so Dashboard, Documents, Checklist all update together
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['applicantProfile'] });
      queryClient.invalidateQueries({ queryKey: ['checklist'] });
      queryClient.invalidateQueries({ queryKey: ['vault'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success(`Business updated to "${dashFormData.business_name}"! Synchronized everywhere.`);
      setIsEditModalOpen(false);
    },
    onError: (err) => toast.error(extractApiError(err) || 'Failed to update business details'),
  });

  const applications = useApplications(applicantId);
  const checklist = useChecklist(applicantId);
  const vault = useVault(applicantId);

  if (!profileLoading && !hasProfile) return <Navigate to="/applicant/profile/setup" replace />;

  if (profileLoading || applications.isLoading || checklist.isLoading || vault.isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (applications.isError || checklist.isError || vault.isError) {
    const err = applications.error || checklist.error || vault.error;
    return <ErrorState title="Could not load your dashboard" message={err?.response?.data?.error} />;
  }

  const isDemo = user?.email?.toLowerCase() === 'test@gmail.com';
  const apps = (applications.data && applications.data.length > 0) ? applications.data : (isDemo ? PROTOTYPE_APPLICATIONS : []);
  const docs = (vault.data && vault.data.length > 0) ? vault.data : (isDemo ? PROTOTYPE_DOCUMENTS : []);
  const verifiedDocs = docs.filter((d) => d.verified_status === 'verified').length;
  const pendingReview = apps.filter((a) => !['approved', 'auto_approved', 'rejected'].includes(a.status)).length;
  const breached = apps.filter((a) => a.sla_breached).length;

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        title={`Welcome, ${user?.name?.split(' ')[0] || 'Entrepreneur'}`}
        description={
          profile?.is_customized && profile?.business_name
            ? `${profile.business_name} · ${(profile.business_type || profile.sector || '').replace(/_/g, ' ')} · ${profile.state || 'Madhya Pradesh'}`
            : 'Select your business type (Cafe/Hotel, Pharmacy, Gym, Food Mfg, etc.) to link your dashboard & direct document checklist'
        }
        action={
          <Button onClick={() => setIsEditModalOpen(true)} variant={profile?.is_customized ? "outline" : "default"} className="shadow-2xs">
            <Edit3 className="w-4 h-4 mr-2" />
            {profile?.is_customized ? 'Update Business Details' : 'Set Up Business Details'}
          </Button>
        }
      />

      {/* KPI cards with interactive breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={FileText}
          label="Approvals Required"
          value={checklist.data?.total_approvals_required ?? (isDemo ? 6 : 0)}
          iconBg="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50"
          isActive={selectedKpi === 'approvals'}
          onClick={() => setSelectedKpi((prev) => (prev === 'approvals' ? null : 'approvals'))}
        />
        <KpiCard
          icon={UploadCloud}
          label="Docs Verified"
          value={`${verifiedDocs}/${docs.length}`}
          iconBg="bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-900/50"
          isActive={selectedKpi === 'docs'}
          onClick={() => setSelectedKpi((prev) => (prev === 'docs' ? null : 'docs'))}
        />
        <KpiCard
          icon={Clock}
          label="In Progress"
          value={pendingReview}
          iconBg="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50"
          isActive={selectedKpi === 'in_progress'}
          onClick={() => setSelectedKpi((prev) => (prev === 'in_progress' ? null : 'in_progress'))}
        />
        <KpiCard
          icon={AlertTriangle}
          label="SLA Breached"
          value={breached}
          iconBg="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/50"
          isActive={selectedKpi === 'sla'}
          onClick={() => setSelectedKpi((prev) => (prev === 'sla' ? null : 'sla'))}
        />
      </div>

      {/* Interactive Opening Bar with Detailed Breakdown */}
      {selectedKpi && (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 shadow-md backdrop-blur-sm transition-all animate-slide-up">
          {/* Top colored accent indicator */}
          <div
            className={`h-1.5 w-full ${
              selectedKpi === 'approvals'
                ? 'bg-blue-600'
                : selectedKpi === 'docs'
                ? 'bg-teal-500'
                : selectedKpi === 'in_progress'
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
          />

          <div className="p-5 sm:p-6 space-y-4">
            {/* Header with Title, Status & Close Button */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div
                  className={`p-2.5 rounded-xl border shrink-0 ${
                    selectedKpi === 'approvals'
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50'
                      : selectedKpi === 'docs'
                      ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-900/50'
                      : selectedKpi === 'in_progress'
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50'
                  }`}
                >
                  {selectedKpi === 'approvals' && <FileText className="w-5 h-5" />}
                  {selectedKpi === 'docs' && <UploadCloud className="w-5 h-5" />}
                  {selectedKpi === 'in_progress' && <Clock className="w-5 h-5" />}
                  {selectedKpi === 'sla' && <ShieldCheck className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {selectedKpi === 'approvals' && (isDemo ? '6 Required Approvals for Your Business' : `${checklist.data?.total_approvals_required ?? 0} Required Approvals for Your Business`)}
                      {selectedKpi === 'docs' && (isDemo ? 'Document Vault Verification (5 of 6 Ready)' : `Document Vault Verification (${verifiedDocs} of ${docs.length} Ready)`)}
                      {selectedKpi === 'in_progress' && `${pendingReview} Clearances Currently In Progress`}
                      {selectedKpi === 'sla' && `${breached} Overdue Breaches — 100% On-Time Processing Guarantee`}
                    </h3>
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {selectedKpi === 'approvals' && 'Statutory Single-Window Checklist'}
                      {selectedKpi === 'docs' && 'DigiLocker & Govt API Verified'}
                      {selectedKpi === 'in_progress' && 'Active Department Scrutiny'}
                      {selectedKpi === 'sla' && 'Public Services Guarantee Act'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {selectedKpi === 'approvals' &&
                      `Mandatory Central and Madhya Pradesh state clearances required for ${profile?.business_name || (isDemo ? 'Sharma Medical & Pharmacy' : 'your enterprise')}.`}
                    {selectedKpi === 'docs' &&
                      'All statutory documents uploaded once and verified by scrutiny officers. Reused automatically across all clearances.'}
                    {selectedKpi === 'in_progress' &&
                      'Active department scrutiny and scheduled joint site inspections tracked with live SLA countdowns.'}
                    {selectedKpi === 'sla' &&
                      'Zero overdue files. All departments are legally bound by strict statutory SLA timelines under the Lok Seva Guarantee Adhiniyam.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedKpi(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                title="Close details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* DETAIL BODY 1: Approvals Required */}
            {selectedKpi === 'approvals' && (
              <div className="space-y-3 pt-1">
                {(!checklist.data?.checklist || checklist.data.checklist.length === 0) && !isDemo ? (
                  <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                    <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No clearance rules mapped yet</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                      Configure your business sector and location to generate the exact statutory approvals and licenses required for your enterprise.
                    </p>
                    <div className="pt-2">
                      <Button size="sm" onClick={() => setIsEditModalOpen(true)}>Set Up Business Details</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {((checklist.data?.checklist && checklist.data.checklist.length > 0)
                        ? checklist.data.checklist.map((rule) => {
                            const existingApp = apps.find((a) => a.approval_rule_id === rule.approval_rule_id);
                            return {
                              name: rule.approval_name,
                              dept: rule.department,
                              sla: `${rule.sla_days} Days`,
                              risk: rule.hazard_level ? `${rule.hazard_level.charAt(0).toUpperCase() + rule.hazard_level.slice(1)} Risk` : 'Medium Risk',
                              inspection: rule.requires_inspection ? 'In-Person Inspection' : 'No Inspection',
                              status: existingApp
                                ? (existingApp.status === 'auto_approved'
                                  ? 'Auto-Approved ✓'
                                  : existingApp.status === 'approved'
                                  ? 'Approved ✓'
                                  : `In Progress (${existingApp.days_left !== undefined ? `${existingApp.days_left}d left` : 'Active'})`)
                                : 'Ready to Apply',
                              statusColor: existingApp
                                ? (['approved', 'auto_approved'].includes(existingApp.status)
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800')
                                : 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                            };
                          })
                        : [
                        {
                          name: 'Retail / Wholesale Drug License (Form 20/21)',
                          dept: 'State Food & Drug Administration (FDA / CDSCO)',
                          sla: '21 Days',
                          risk: 'Moderate',
                          inspection: 'Drug Inspector On-site Inspection',
                          status: 'Submitted · In Progress (5d left)',
                          statusColor:
                            'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
                        },
                        {
                          name: 'Provisional Fire Safety NOC',
                          dept: 'Fire & Emergency Services / Urban Administration',
                          sla: '15 Days',
                          risk: 'High',
                          inspection: 'Joint Site Safety & Hydrant Inspection',
                          status: 'Submitted · Pending Inspection (6d left)',
                          statusColor:
                            'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
                        },
                        {
                          name: 'Municipal Trade License (Gumasta Registration)',
                          dept: 'Municipal Corporation / Urban Local Bodies',
                          sla: '3 Days',
                          risk: 'Low',
                          inspection: 'None (Instant Auto-Approval)',
                          status: 'Auto-Approved ✓',
                          statusColor:
                            'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
                        },
                        {
                          name: 'Goods & Services Tax (GST) Registration',
                          dept: 'Commercial Tax Department / GSTN',
                          sla: '7 Days',
                          risk: 'Low',
                          inspection: 'Desk Scrutiny Only',
                          status: 'Approved ✓',
                          statusColor:
                            'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
                        },
                        {
                          name: 'Udyam Registration Certificate',
                          dept: 'Ministry of Micro, Small and Medium Enterprises',
                          sla: '3 Days',
                          risk: 'Low',
                          inspection: 'None (Direct Aadhaar/PAN Validation)',
                          status: 'Eligible · Ready to Submit',
                          statusColor:
                            'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                        },
                        {
                          name: 'Bio-Medical & Hazardous Waste Disposal Authorization',
                          dept: 'State Pollution Control Board (MPPCB)',
                          sla: '15 Days',
                          risk: 'High',
                          inspection: 'Biomedical Waste Facility Audit',
                          status: 'Eligible · Ready to Submit',
                          statusColor:
                            'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                        },
                      ]).map((app, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-blue-300 dark:hover:border-blue-700 transition-colors flex flex-col justify-between gap-2"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                                {app.dept}
                              </span>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${app.statusColor}`}>
                                {app.status}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                              {app.name}
                            </h4>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-200/70 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400">
                            <span>
                              SLA: <strong className="text-slate-700 dark:text-slate-300">{app.sla}</strong>
                            </span>
                            <span>•</span>
                            <span>
                              Risk: <strong className="text-slate-700 dark:text-slate-300">{app.risk}</strong>
                            </span>
                            <span>•</span>
                            <span className="truncate">{app.inspection}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Need more statutory details? Explore official gazette notification guidelines.
                      </span>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => navigate('/applicant/documents#gov-guidelines')}>
                          <BookOpen className="w-3.5 h-3.5 mr-1" />
                          Statutory Guidelines
                        </Button>
                        <Button size="sm" onClick={() => navigate('/applicant/applications')}>
                          <span>View Applications List</span>
                          <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* DETAIL BODY 2: Docs Verified */}
            {selectedKpi === 'docs' && (
              <div className="space-y-3 pt-1">
                {docs.length === 0 ? (
                  <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                    <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No documents uploaded yet in Vault</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                      Upload your identity, premises lease, and statutory credentials. Once verified by scrutiny officers, they are auto-attached to all current and future clearance applications.
                    </p>
                    <div className="pt-2">
                      <Button size="sm" onClick={() => navigate('/applicant/documents')}>Open Document Vault</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {docs.map((doc) => {
                        const isVerified = doc.verified_status === 'verified';
                        return (
                          <div
                            key={doc.id || doc.document_type}
                            className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-2 ${
                              isVerified
                                ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20'
                                : 'border-amber-200 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/20'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                                    isVerified
                                      ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                                      : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                                  }`}
                                >
                                  {isVerified ? (
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                  ) : (
                                    <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                  )}
                                  <span>{isVerified ? 'Verified ✓' : 'Under Scrutiny ⏳'}</span>
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(doc.uploaded_at).toLocaleDateString()}
                                </span>
                              </div>
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                                {doc.document_type}
                              </h4>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                                {doc.notes || 'Verified statutory corporate credential stored in secure vault.'}
                              </p>
                            </div>
                            <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between text-[11px] text-slate-400">
                              <span className="text-emerald-700 dark:text-emerald-400 font-medium">AES-256 Encrypted</span>
                              <span>{doc.expiry_date ? `Exp: ${new Date(doc.expiry_date).toLocaleDateString()}` : 'Lifetime Valid'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Documents stored in your vault are cryptographic AES-256 protected.
                      </span>
                      <Button size="sm" onClick={() => navigate('/applicant/documents')}>
                        <UploadCloud className="w-3.5 h-3.5 mr-1" />
                        <span>Manage Document Vault</span>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* DETAIL BODY 3: In Progress */}
            {selectedKpi === 'in_progress' && (
              <div className="space-y-3 pt-1">
                {pendingReview === 0 ? (
                  <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                    <Clock className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No clearances currently in progress</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                      Submit your clearance applications to launch departmental scrutiny and track active reviews with live SLA countdowns.
                    </p>
                    <div className="pt-2">
                      <Button size="sm" onClick={() => navigate('/applicant/applications')}>View Applications</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {apps.filter((a) => !['approved', 'auto_approved', 'rejected'].includes(a.status)).map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-xl border border-amber-200 dark:border-amber-800/80 bg-amber-50/30 dark:bg-amber-950/20 space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                                {item.department}
                              </span>
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                                {item.approval_name}
                              </h4>
                            </div>
                            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500 text-white shadow-2xs whitespace-nowrap">
                              {item.days_left !== undefined ? `${item.days_left} days left` : 'Under Review'}
                            </span>
                          </div>

                          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-400">Current Stage:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {item.status === 'pending_inspection' ? 'Site Inspection Scheduled' : 'Officer Desk Scrutiny Active'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-400">Assigned Officer:</span>
                              <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[210px]">
                                {item.inspector_name || 'Chief Scrutiny Officer'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-blue-600 dark:text-blue-400">
                              <span className="flex items-center gap-1 font-medium">
                                <Calendar className="w-3 h-3" /> Joint Inspection:
                              </span>
                              <span className="font-bold">12 Sep 2026</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/60">
                            <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                              <span>SLA Clock</span>
                              <span>
                                {item.sla_days ? `${Math.max(0, item.sla_days - (item.days_left || 0))} of ${item.sla_days} days elapsed` : 'Active'}
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, Math.max(15, 100 - ((item.days_left || 5) / (item.sla_days || 14)) * 100))}%` }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex flex-wrap items-center justify-between gap-2">
                      <span>
                        All active clearances are protected by the <strong>M.P. Lok Seva Guarantee Act</strong> with automatic escalation.
                      </span>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => navigate('/applicant/inspections')}>
                          <Calendar className="w-3.5 h-3.5 mr-1" />
                          Inspection Details
                        </Button>
                        <Button size="sm" onClick={() => navigate('/applicant/applications')}>
                          Track Applications
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* DETAIL BODY 4: 0 SLA Breached */}
            {selectedKpi === 'sla' && (
              <div className="space-y-3 pt-1">
                <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                        100% Statutory SLA Compliance — All Clearances On Schedule
                      </h4>
                      <p className="text-xs text-emerald-800 dark:text-emerald-300/90 mt-0.5">
                        Zero overdue clearances. All department scrutiny officers are currently processing your applications within their statutory legal limits.
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs shrink-0 self-start sm:self-auto shadow-2xs">
                    0 Delays Active
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                    <p className="font-bold text-slate-900 dark:text-white mb-1">Guarantee of Public Services</p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                      Under the Madhya Pradesh Lok Seva Guarantee Act, officers must clear or raise queries before the statutory deadline (14–21 days).
                    </p>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                    <p className="font-bold text-slate-900 dark:text-white mb-1">Automated Escalation</p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                      If the SLA clock reaches 0, the system automatically escalates the file to the First Appellate Authority (District Collector).
                    </p>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                    <p className="font-bold text-slate-900 dark:text-white mb-1">Statutory Deemed Approval</p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                      If the appellate period elapses without a response, the clearance is deemed approved by law, and you can download your certificate.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    If an officer unnecessarily delays your clearance after SLA expiry, you can raise an instant grievance.
                  </span>
                  <Button size="sm" variant="outline" onClick={() => navigate('/applicant/grievances')}>
                    <span>Open Escalation Cell</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Personalized Direct Document Checklist Banner for Applicant's Industry */}
      {(() => {
        const activeKey = profile?.business_type || (profile?.is_customized ? profile?.sector : null);
        const indDoc = getIndustryDocumentList(activeKey);

        if (!profile?.is_customized || !indDoc) {
          return (
            <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                    Business Details Not Configured Yet
                  </h3>
                  <p className="text-xs text-amber-800/90 dark:text-amber-300/80 mt-0.5">
                    Select your establishment (Cafe/Hotel, Pharmacy, Gym, Food Mfg, etc.) to link your dashboard & unlock your direct statutory document checklist.
                  </p>
                </div>
              </div>
              <Button onClick={() => setIsEditModalOpen(true)} size="sm">
                Set Up Business Details
              </Button>
            </div>
          );
        }

        return (
          <div className="rounded-2xl border border-blue-200/80 dark:border-blue-900/60 bg-gradient-to-r from-blue-50/90 via-indigo-50/40 to-white dark:from-blue-950/40 dark:via-slate-900 dark:to-slate-900 p-4 sm:p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 sm:mt-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Direct Statutory Document Checklist: {indDoc.sectorName}
                    </h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                      Official Government Direct Link
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    {indDoc.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
                <a
                  href={indDoc.directDocumentListUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
                  title={`Open official statutory document list for ${indDoc.sectorName}`}
                >
                  {indDoc.isDirectPdf ? <FileDown className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5" />}
                  <span>Open Official Document List {indDoc.isDirectPdf ? '(Direct PDF) ↗' : '↗'}</span>
                </a>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Change Business</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Applications status list */}
      <Card>
        <CardHeader
          title="Your Approvals"
          subtitle="Live status with SLA countdown — synchronized in real-time"
        />
        <CardBody>
          {apps.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title="No applications submitted yet"
              description="Upload your documents to the vault, then submit to generate one application per required approval."
            />
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {apps.map((a) => {
                const st = APPLICATION_STATUS[a.status];
                const rl = RISK_LEVEL[a.risk_level];
                return (
                  <li key={a.id} className="py-3.5 px-3 -mx-3 rounded-xl hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors duration-150 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm tracking-tight">{a.approval_name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{a.department}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {rl && <Badge label={`${rl.label} risk`} colorClass={rl.color} />}
                      <Badge label={st?.label || a.status} colorClass={st?.color} />
                      {!['approved', 'auto_approved', 'rejected'].includes(a.status) && (
                        <Badge label={slaLabel(a)} colorClass={slaTone(a)} icon={Clock} />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardBody>
      </Card>

      {/* Checklist preview */}
      <Card>
        <CardHeader
          title="Required Approvals & Compliance Checklist"
          subtitle="Derived dynamically based on your business profile parameters"
        />
        <CardBody>
          {(checklist.data?.checklist || []).length === 0 ? (
            <EmptyState title="No matching approvals" description="No approval rules matched your profile yet." />
          ) : (
            <div className="space-y-3">
              <ul className="space-y-3">
                {checklist.data.checklist.map((c) => {
                  const gov = getDepartmentGovtLink(c.department, c.approval_name);
                  return (
                    <li
                      key={c.approval_rule_id}
                      className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900/60 bg-white dark:bg-slate-900/80 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-all duration-150"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
                              {c.approval_name}
                            </p>
                            {c.requires_inspection && (
                              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900/50">
                                inspection required
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            <span className="font-medium text-slate-700 dark:text-slate-300">{c.department}</span> · Statutory SLA: {c.sla_days} days
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                            <span className="font-semibold text-slate-700 dark:text-slate-200">Required Docs:</span>
                            {c.required_documents.map((doc, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]"
                              >
                                {doc}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Redirect to Official Govt Portal */}
                      <a
                        href={gov.govUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 shrink-0 transition-colors shadow-2xs self-start md:self-auto cursor-pointer"
                        title={`Inspect official statutory documents on ${gov.govPortalName}`}
                      >
                        <span>Official Govt Site ({gov.govPortalName})</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Looking for complete document checklists across all state departments?</span>
                </div>
                <a
                  href="/applicant/documents#gov-guidelines"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 transition-colors shrink-0"
                >
                  <span>Explore Govt Document Guidelines Directory</span>
                  <span>→</span>
                </a>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Quick Business Profile & Industry Update Modal */}
      <Modal
        open={isEditModalOpen}
        onClose={() => !updateBusinessMutation.isPending && setIsEditModalOpen(false)}
        title="Update Business Details & Industry"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={updateBusinessMutation.isPending}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!dashFormData.business_name.trim()) {
                  toast.error('Business Name is required');
                  return;
                }
                updateBusinessMutation.mutate({
                  ...profile,
                  business_name: dashFormData.business_name.trim(),
                  business_type: dashFormData.business_type,
                  department: dashFormData.department,
                });
              }}
              isLoading={updateBusinessMutation.isPending}
            >
              Update & Synchronize
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Business / Enterprise Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Royal Cafe & Bakery, Apollo Meds, Gold Gym, Sharma Foods"
              value={dashFormData.business_name}
              onChange={(e) => setDashFormData((prev) => ({ ...prev, business_name: e.target.value }))}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Business Type / Establishment
              </label>
              <input
                type="text"
                value={dashFormData.business_type}
                onChange={(e) => setDashFormData((prev) => ({ ...prev, business_type: e.target.value }))}
                placeholder="e.g. Retail, Manufacturing"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department
              </label>
              <select
                value={dashFormData.department}
                onChange={(e) => setDashFormData((prev) => ({ ...prev, department: e.target.value }))}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Food Safety and Standards Authority of India (FSSAI)">Food Safety and Standards Authority of India (FSSAI)</option>
                <option value="State FDA & Central Drugs Standard Control Organisation (CDSCO)">State FDA & Central Drugs Standard Control Organisation (CDSCO)</option>
                <option value="Urban Administration & Municipal Corporation">Urban Administration & Municipal Corporation</option>
              </select>
            </div>
          </div>

          {/* Live preview of direct document checklist for the chosen business */}
          {(() => {
            const previewDoc = getIndustryDocumentList(dashFormData.business_type || dashFormData.department);
            if (!previewDoc) return null;
            return (
              <div className="p-3 rounded-xl bg-blue-50/90 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-900/60 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-950 dark:text-blue-100">
                    Direct Govt Document List: {previewDoc.sectorName}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                    Live Match
                  </span>
                </div>
                <p className="text-[11px] text-blue-700/80 dark:text-blue-300/80 leading-relaxed">
                  {previewDoc.directDocumentListTitle}
                </p>
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[10.5px] text-slate-500 dark:text-slate-400">
                    Dept: {previewDoc.department}
                  </span>
                  <a
                    href={previewDoc.directDocumentListUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 hover:underline text-[11px]"
                  >
                    <span>Inspect List {previewDoc.isDirectPdf ? '(PDF)' : ''} ↗</span>
                  </a>
                </div>
              </div>
            );
          })()}
        </div>
      </Modal>
    </div>
  );
};
