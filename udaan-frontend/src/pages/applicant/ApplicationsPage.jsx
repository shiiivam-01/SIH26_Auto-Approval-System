import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Send, Clock, FileText, ListChecks, Calendar, CheckCircle2, FileDown, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import { useApplications, useChecklist } from '../../hooks/useApplicantData';
import { submitApplications } from '../../api/applicationApi';
import { extractApiError } from '../../utils/errors';
import { Badge, Button, Card, CardBody, CardHeader, PageHeader, Modal, EmptyState, ErrorState, SkeletonRows, ConfirmDialog, Timeline, applicationTimelineSteps } from '../../components/common/ui';
import { APPLICATION_STATUS, RISK_LEVEL, FINAL_APPLICATION_STATUSES } from '../../constants/statusCatalog';
import { PROTOTYPE_APPLICATIONS } from '../../constants/prototypeData';

const slaTone = (a) =>
  a.sla_breached ? 'bg-red-50 text-red-700 border-red-200'
  : a.days_left <= 2 ? 'bg-amber-50 text-amber-700 border-amber-200'
  : 'bg-green-50 text-green-700 border-green-200';

export const ApplicationsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const isDemo = user?.email?.toLowerCase() === 'test@gmail.com';
  const { data: profile } = useProfile();
  const applicantId = profile?.id;
  const applications = useApplications(applicantId);
  const checklist = useChecklist(applicantId);
  const queryClient = useQueryClient();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resultModal, setResultModal] = useState(null); // {status, message, applications}
  const [missing, setMissing] = useState(null); // missing_by_approval array

  const submit = useMutation({
    mutationFn: (allow_resubmission) => submitApplications({ applicant_id: applicantId, allow_resubmission }),
    onSuccess: (data, allow_resubmission) => {
      queryClient.invalidateQueries({ queryKey: ['applications', applicantId] });
      setConfirmOpen(false);
      // 201 = new applications created; 200 = idempotent re-run (nothing new)
      setResultModal({
        isNew: data.applications?.some((a) => !a.already_existed),
        message: data.message,
        applications: data.applications || [],
        resubmission: allow_resubmission,
      });
    },
    onError: (error) => {
      setConfirmOpen(false);
      const missingByApproval = error?.response?.data?.missing_by_approval;
      if (missingByApproval) {
        setMissing(missingByApproval); // 400 — render actionable missing-docs panel
      } else {
        toast.error(extractApiError(error));
      }
    },
  });

  if (applications.isLoading || checklist.isLoading) return <SkeletonRows rows={5} />;
  const apps = (applications.data && applications.data.length > 0) ? applications.data : (isDemo ? PROTOTYPE_APPLICATIONS : []);
  const resubmittable = apps.filter((a) => FINAL_APPLICATION_STATUSES.includes(a.status));

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('applications.title')}
        description={t('applications.desc')}
        action={
          <Button onClick={() => { setMissing(null); setConfirmOpen(true); }} disabled={submit.isPending || (checklist.data?.total_approvals_required ?? 0) === 0}>
            <Send className="w-4 h-4 mr-2" /> {t('applications.submitAll')}
          </Button>
        }
      />

      {/* Missing-documents panel (backend 400: missing_by_approval) */}
      {missing && (
        <Card className="border-red-200">
          <CardHeader title="Missing required documents" subtitle="Submission blocked by the backend — upload these first" />
          <CardBody className="space-y-3">
            {missing.map((m, i) => (
              <div key={i} className="rounded-md bg-red-50 border border-red-100 px-4 py-3">
                <p className="text-sm font-medium text-slate-900">{m.approval_name} <span className="text-slate-400">· {m.department}</span></p>
                <p className="text-sm text-red-700 mt-1">Missing: {m.missing_documents.join(', ')}</p>
              </div>
            ))}
            <Button variant="outline" onClick={() => setMissing(null)}>Dismiss</Button>
          </CardBody>
        </Card>
      )}

      {/* Applications summary banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center font-bold text-base shrink-0">
            {apps.length}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">{t('applications.submitted')}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Processed in parallel by departments</p>
          </div>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50 flex items-center justify-center font-bold text-base shrink-0">
            {apps.filter((a) => !['approved', 'auto_approved', 'rejected'].includes(a.status)).length}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">{t('applications.activeScrutiny', 'In Active Scrutiny')}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('applications.activeScrutinyDesc', 'Under officer review / inspection')}</p>
          </div>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center font-bold text-base shrink-0">
            {apps.filter((a) => ['approved', 'auto_approved'].includes(a.status)).length}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">{t('applications.approved', 'Clearances Approved')}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('applications.approvedDesc', 'Certificates ready for download')}</p>
          </div>
        </div>
      </div>

      {/* Applications list with live tracking timeline */}
      {apps.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={FileText}
              title="No applications yet"
              description="Submit to generate one application per approval that applies to your profile."
            />
          </CardBody>
        </Card>
      ) : (
        apps.map((a) => {
          const st = APPLICATION_STATUS[a.status];
          const rl = RISK_LEVEL[a.risk_level];
          const isPending = !FINAL_APPLICATION_STATUSES.includes(a.status);
          const isApproved = ['approved', 'auto_approved'].includes(a.status);

          return (
            <Card key={a.id} className="overflow-hidden">
              <CardHeader
                title={a.approval_name}
                subtitle={a.department}
                action={
                  <div className="flex flex-wrap items-center gap-2">
                    {rl && <Badge label={`${rl.label} risk`} colorClass={rl.color} />}
                    <Badge label={st?.label || a.status} colorClass={st?.color} />
                    {isPending && (
                      <Badge
                        icon={Clock}
                        label={a.sla_breached ? `SLA breached (${Math.abs(a.days_left)}d)` : `${a.days_left}d left`}
                        colorClass={slaTone(a)}
                      />
                    )}
                  </div>
                }
              />
              <CardBody className="space-y-4">
                {/* Active progress timeline with real status feedback */}
                <Timeline steps={applicationTimelineSteps(a.status, a, t)} />

                {/* Status-specific context and actions */}
                {a.id === 201 && (
                  <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-amber-900 dark:text-amber-200">
                        Officer Scrutiny Active · Assigned: Dr. Rajeshwar Tiwari (Chief Drug Inspector)
                      </p>
                      <p className="text-amber-800/90 dark:text-amber-300/80 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Joint Single-Window Inspection scheduled for <strong>12 Sep 2026 at 11:30 AM</strong>.
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => navigate('/applicant/inspections')} className="shrink-0">
                      View Joint Inspection
                    </Button>
                  </div>
                )}

                {a.id === 202 && (
                  <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-amber-900 dark:text-amber-200">
                        Desk Scrutiny Passed · Assigned: S.K. Sharma (Fire Safety Officer)
                      </p>
                      <p className="text-amber-800/90 dark:text-amber-300/80 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Site egress & hydrant inspection bundled with FDA visit on <strong>12 Sep 2026</strong>.
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => navigate('/applicant/inspections')} className="shrink-0">
                      View Joint Inspection
                    </Button>
                  </div>
                )}

                {isApproved && (
                  <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        {a.status === 'auto_approved'
                          ? 'Instant Auto-Clearance Granted under M.P. Policy'
                          : 'Statutory Clearance Certificate Issued & Active'}
                      </p>
                      <p className="text-emerald-800/90 dark:text-emerald-300/80">
                        Certificate reference #{a.id}-UDAAN-2026 · Valid and legally verified across all state portals.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => toast.success(`Downloaded official certificate for ${a.approval_name}`)}
                      className="shrink-0"
                    >
                      <FileDown className="w-3.5 h-3.5 mr-1" />
                      Download Certificate (PDF)
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })
      )}

      {/* Eligible Approvals Ready to Apply (To complete all 6 required clearances - for demo showcase) */}
      {isDemo && (
        <Card className="border-blue-200/80 dark:border-blue-900/60 bg-gradient-to-r from-blue-50/30 via-white to-slate-50 dark:from-slate-900 dark:to-slate-900">
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Eligible Approvals Ready to Apply (2 of 6 Required)</span>
              </div>
            }
            subtitle="Remaining statutory clearances computed for your Retail Pharmacy. Single-Window reuse automatically attaches your verified vault documents."
            action={
              <Button onClick={() => setConfirmOpen(true)} size="sm">
                <Send className="w-3.5 h-3.5 mr-1" />
                Submit Remaining Approvals
              </Button>
            }
          />
          <CardBody className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/70 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                    Ministry of Commerce
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    Ready to Submit
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Udyam Registration Certificate
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Statutory SLA: 3 Days · Low Risk · Direct Aadhaar & PAN authentication from Vault.
                </p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">All 3 required docs ready in Vault ✓</span>
                  <span className="text-slate-400">No inspection needed</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/70 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                    State Pollution Control Board (MPPCB)
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    Ready to Submit
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Bio-Medical & Hazardous Waste Disposal Authorization
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Statutory SLA: 15 Days · High Risk · Biomedical Waste Management Rules 2016.
                </p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Agreement verified in Vault ✓</span>
                  <span className="text-slate-400">ETP / Protocol Audit</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Submit confirmation */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => submit.mutate(false)}
        isLoading={submit.isPending}
        title="Submit applications?"
        confirmLabel="Submit"
        message={`This creates one application per required approval (${checklist.data?.total_approvals_required ?? 0}). Already-submitted approvals are returned as-is (idempotent). Continue?`}
      />

      {/* Result modal — distinguishes 201 (new) vs 200 (idempotent) */}
      <Modal
        open={!!resultModal}
        onClose={() => setResultModal(null)}
        title={resultModal?.isNew ? 'Applications created' : 'Already submitted'}
        footer={<Button onClick={() => setResultModal(null)}>Done</Button>}
      >
        <p className="text-sm text-slate-600 mb-3">{resultModal?.message}</p>
        <ul className="space-y-2">
          {(resultModal?.applications || []).map((a) => {
            const st = APPLICATION_STATUS[a.status];
            return (
              <li key={a.application_id} className="flex items-center justify-between gap-2 rounded-md border border-slate-200 px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">{a.approval_name}</p>
                  <p className="text-xs text-slate-500">{a.department} · SLA {new Date(a.sla_deadline).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge label={st?.label || a.status} colorClass={st?.color} />
                  {a.already_existed
                    ? <Badge label="Existing" colorClass="bg-slate-100 text-slate-500 border-slate-200" />
                    : <Badge label="New" colorClass="bg-primary-50 text-primary-700 border-primary-200" icon={ListChecks} />}
                </div>
              </li>
            );
          })}
        </ul>
      </Modal>

      {/* Resubmission for finalized approvals */}
      {resubmittable.length > 0 && (
        <Card>
          <CardHeader title="Finalized approvals" subtitle="Approved / auto-approved / rejected applications can be re-submitted with allow_resubmission" />
          <CardBody>
            <ul className="space-y-1 mb-3">
              {resubmittable.map((a) => (
                <li key={a.id} className="text-sm text-slate-600">
                  {a.approval_name} — <Badge label={APPLICATION_STATUS[a.status]?.label || a.status} colorClass={APPLICATION_STATUS[a.status]?.color} />
                </li>
              ))}
            </ul>
            <Button
              variant="outline"
              onClick={() => submit.mutate(true)}
              isLoading={submit.isPending}
            >
              Re-submit Finalized Approvals
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  );
};



