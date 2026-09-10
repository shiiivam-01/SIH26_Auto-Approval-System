import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Search, BadgeCheck, FileX, CheckCircle2, XCircle, FileText,
  Building2, ShieldCheck, Clock, Eye, AlertCircle, Sparkles
} from 'lucide-react';
import { getChecklist } from '../../api/applicantApi';
import { getVault, verifyDocument } from '../../api/documentApi';
import { getApplications, decideApplication } from '../../api/applicationApi';
import { extractApiError } from '../../utils/errors';
import { Badge, Button, Card, CardBody, CardHeader, Input, PageHeader, EmptyState, ErrorState, SkeletonRows, ConfirmDialog } from '../../components/common/ui';
import { DOCUMENT_STATUS, APPLICATION_STATUS, RISK_LEVEL } from '../../constants/statusCatalog';

const noRetry = (f, e) => e?.response?.status !== 403 && e?.response?.status !== 404 && f < 2;

// Quick preset applicant profiles for fast officer testing
const presetApplicants = [
  { id: '1', name: 'Primary Registered Applicant (Profile #1)', badge: 'Active Database' },
  { id: '2', name: 'Vanguard Biotech (Profile #2)', badge: 'Biotech' },
  { id: '3', name: 'Surya Agro Foods (Profile #3)', badge: 'Food Processing' },
];

export const OfficerReviewsPage = () => {
  const [applicantId, setApplicantId] = useState('1');
  const [searchId, setSearchId] = useState('1');
  const queryClient = useQueryClient();

  const checklist = useQuery({ queryKey: ['checklist', searchId], queryFn: () => getChecklist(searchId), enabled: !!searchId, retry: noRetry, refetchInterval: 5000 });
  const vault = useQuery({ queryKey: ['vault', searchId], queryFn: () => getVault(searchId), enabled: !!searchId, retry: noRetry, refetchInterval: 5000 });
  const applications = useQuery({ queryKey: ['applications', searchId], queryFn: () => getApplications(searchId), enabled: !!searchId, retry: noRetry, refetchInterval: 5000 });

  const [verifyTarget, setVerifyTarget] = useState(null); // {doc, status}
  const [decideTarget, setDecideTarget] = useState(null);  // {app, decision}

  const verify = useMutation({
    mutationFn: () => verifyDocument(verifyTarget.doc.id, verifyTarget.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault', searchId] });
      toast.success(`Document marked as ${verifyTarget.status.toUpperCase()}`);
      setVerifyTarget(null);
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  const decide = useMutation({
    mutationFn: () => decideApplication(decideTarget.app.id, decideTarget.decision),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications', searchId] });
      toast.success(`Application marked as ${decideTarget.decision.toUpperCase()}`);
      setDecideTarget(null);
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  const handleSelectPreset = (id) => {
    setApplicantId(id);
    setSearchId(id);
  };

  const submitSearch = (e) => {
    e?.preventDefault();
    if (!applicantId.trim()) return;
    setSearchId(applicantId.trim());
  };

  const loading = checklist.isLoading || vault.isLoading || applications.isLoading;

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        title="Official Document Scrutiny & Clearance Desk"
        description="Verify uploaded legal credentials, inspect mandatory certifications, and grant or reject statutory clearances."
      />

      {/* Applicant File Selector & Quick Presets */}
      <Card>
        <CardBody className="space-y-4">
          <form onSubmit={submitSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 max-w-sm">
              <Input
                label="Applicant Profile ID"
                required
                type="text"
                value={applicantId}
                onChange={(e) => setApplicantId(e.target.value)}
                placeholder="e.g. 1"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full sm:w-auto">
                <Search className="w-4 h-4 mr-2" /> Load File
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {!searchId && <EmptyState title="Select an applicant profile to begin scrutiny" />}
      {searchId && loading && <SkeletonRows rows={6} />}
      {searchId && checklist.isError && (
        <ErrorState
          title="Applicant Record Not Found"
          message={checklist.error?.response?.data?.error || `No applicant profile with ID #${searchId} exists yet in the database. Try Profile #1 or create one as an applicant.`}
        />
      )}

      {searchId && !loading && !checklist.isError && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Applicant Identity Card */}
          {checklist.data?.applicant && (
            <div className="p-4 rounded-2xl border border-blue-200/80 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    {checklist.data.applicant.business_name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Profile #{checklist.data.applicant.id} · Sector: <strong className="capitalize">{checklist.data.applicant.sector?.replace(/_/g, ' ')}</strong> · {checklist.data.applicant.state}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Investment: ₹{checklist.data.applicant.investment_amount} Lakhs
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                  Employees: {checklist.data.applicant.employee_count}
                </span>
              </div>
            </div>
          )}

          {/* Document Vault Scrutiny Desk */}
          <Card>
            <CardHeader
              title="Uploaded Credentials & Document Vault"
              subtitle="Examine applicant legal files and mark authenticity status"
            />
            <CardBody>
              {!vault.data || vault.data.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No documents uploaded by applicant"
                  description="The applicant has not yet uploaded files to their document vault."
                />
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {vault.data.map((d) => {
                    const st = DOCUMENT_STATUS[d.verified_status];
                    return (
                      <li key={d.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                            <p className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{d.document_type}</p>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Document Vault Ref #{d.id} · Uploaded on {new Date(d.uploaded_at).toLocaleDateString()}
                            {d.expiry_date ? ` · Expiry: ${new Date(d.expiry_date).toLocaleDateString()}` : ''}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Badge label={st?.label || d.verified_status} colorClass={st?.color} />
                          
                          {d.verified_status !== 'verified' && (
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                              onClick={() => setVerifyTarget({ doc: d, status: 'verified' })}
                            >
                              <BadgeCheck className="w-4 h-4 mr-1" /> Mark Verified
                            </Button>
                          )}
                          
                          {d.verified_status !== 'rejected' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-200 dark:border-red-900/50"
                              onClick={() => setVerifyTarget({ doc: d, status: 'rejected' })}
                            >
                              <FileX className="w-4 h-4 mr-1" /> Flag Discrepancy
                            </Button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardBody>
          </Card>

          {/* Statutory Approvals & NOC Decision Desk */}
          <Card>
            <CardHeader
              title={`Departmental Clearance Applications (${applications.data?.length ?? 0})`}
              subtitle="Grant official clearances or record rejection reasons with statutory audit logging"
            />
            <CardBody>
              {!applications.data || applications.data.length === 0 ? (
                <EmptyState
                  icon={ShieldCheck}
                  title="No clearance applications filed yet"
                  description="The applicant has not yet submitted their approval applications."
                />
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {applications.data.map((a) => {
                    const st = APPLICATION_STATUS[a.status];
                    const rl = RISK_LEVEL[a.risk_level];
                    const isOpen = !['approved', 'auto_approved', 'rejected'].includes(a.status);
                    return (
                      <li key={a.id} className="py-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-slate-400">#{a.id}</span>
                            <p className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{a.approval_name}</p>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Jurisdiction: <strong>{a.department}</strong> · Statutory SLA Deadline: {new Date(a.sla_deadline).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {rl && <Badge label={`${rl.label} Risk`} colorClass={rl.color} />}
                          <Badge label={st?.label || a.status} colorClass={st?.color} />

                          {isOpen && (
                            <div className="flex items-center gap-2 ml-2">
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() => setDecideTarget({ app: a, decision: 'approved' })}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" /> Grant Approval
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-200 dark:border-red-900/50"
                                onClick={() => setDecideTarget({ app: a, decision: 'rejected' })}
                              >
                                <XCircle className="w-4 h-4 mr-1" /> Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* Verification Confirmation Modal */}
      <ConfirmDialog
        open={!!verifyTarget}
        onClose={() => setVerifyTarget(null)}
        onConfirm={() => verify.mutate()}
        isLoading={verify.isPending}
        title={verifyTarget?.status === 'verified' ? 'Verify Applicant Document?' : 'Flag Document Discrepancy?'}
        confirmLabel={verifyTarget?.status === 'verified' ? 'Confirm Verification' : 'Confirm Rejection'}
        message={verifyTarget ? `Record document "${verifyTarget.doc.document_type}" as ${verifyTarget.status.toUpperCase()} in the state compliance vault.` : ''}
      />

      {/* Decision Confirmation Modal */}
      <ConfirmDialog
        open={!!decideTarget}
        onClose={() => setDecideTarget(null)}
        onConfirm={() => decide.mutate()}
        isLoading={decide.isPending}
        title={decideTarget?.decision === 'approved' ? 'Grant Statutory Clearance?' : 'Reject Clearance Application?'}
        confirmLabel={decideTarget?.decision === 'approved' ? 'Grant Clearance' : 'Issue Rejection'}
        message={decideTarget ? `Officially record "${decideTarget.app.approval_name}" (#${decideTarget.app.id}) as ${decideTarget.decision.toUpperCase()}. This updates the applicant SLA tracking and digital certificate.` : ''}
      />
    </div>
  );
};