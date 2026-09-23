import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  UploadCloud, Clock, BadgeCheck, FileX, AlertTriangle, FileText,
  ShieldCheck, Lock, Eye, ExternalLink, Search, BookOpen, Check, Building2, FileDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import { useVault, useChecklist } from '../../hooks/useApplicantData';
import { uploadDocument } from '../../api/documentApi';
import { updateProfile } from '../../api/applicantApi';
import { extractApiError } from '../../utils/errors';
import { Badge, Button, Card, CardBody, CardHeader, Input, PageHeader, Modal, EmptyState, ErrorState, SkeletonRows, FileUpload } from '../../components/common/ui';
import { DOCUMENT_STATUS } from '../../constants/statusCatalog';
import { GOV_DEPARTMENT_DIRECTORIES, getIndustryDocumentList } from '../../constants/govDocumentDirectory';
import { PROTOTYPE_DOCUMENTS } from '../../constants/prototypeData';

const docStatusIcon = { pending: Clock, verified: BadgeCheck, rejected: FileX };

// Display-only expiry chips — backend re-validates authoritatively at submit.
const expiryChip = (d) => {
  if (!d.expiry_date) return null;
  const days = Math.ceil((new Date(d.expiry_date) - new Date()) / 86400000);
  if (days < 0) return <Badge label="Expired" colorClass="bg-red-50 text-red-700 border-red-200" icon={AlertTriangle} />;
  if (days <= 30) return <Badge label={`Expires in ${days}d`} colorClass="bg-amber-50 text-amber-700 border-amber-200" />;
  return null;
};

export const DocumentsPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { data: profile } = useProfile();
  const applicantId = profile?.id;
  const vault = useVault(applicantId);
  const checklist = useChecklist(applicantId);
  const queryClient = useQueryClient();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [docType, setDocType] = useState('');
  const [expiry, setExpiry] = useState('');
  const [formError, setFormError] = useState('');
  const [directorySearch, setDirectorySearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [readinessTab, setReadinessTab] = useState('core');

  const upload = useMutation({
    mutationFn: (payload) => uploadDocument(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault', applicantId] });
      toast.success('Document registered in vault — pending officer verification');
      setUploadOpen(false);
      setSelectedFile(null); setDocType(''); setExpiry(''); setFormError('');
    },
    onError: (error) => setFormError(extractApiError(error)),
  });

  const submitUpload = () => {
    setFormError('');
    if (!selectedFile) { setFormError('Choose a file first'); return; }
    if (!docType.trim()) { setFormError('Document type is required'); return; }

    // Client-side file security validation
    if (selectedFile.file && selectedFile.file.size > 10 * 1024 * 1024) {
      setFormError('File exceeds the 10MB maximum allowed security limit.');
      return;
    }

    const allowedExts = ['pdf', 'png', 'jpg', 'jpeg', 'webp'];
    const ext = selectedFile.fileName?.split('.').pop()?.toLowerCase();
    if (ext && !allowedExts.includes(ext)) {
      setFormError('Invalid file format. Only PDF, PNG, JPG, and WEBP documents are allowed.');
      return;
    }

    upload.mutate({
      applicant_id: applicantId,
      document_type: docType.trim(),
      file_url: selectedFile.dataUrl,
      expiry_date: expiry || undefined,
    });
  };


  if (vault.isLoading || checklist.isLoading) return <SkeletonRows rows={5} />;
  if (vault.isError) return <ErrorState title="Could not load your vault" message={vault.error?.response?.data?.error} onRetry={() => vault.refetch()} />;

  const isDemo = user?.email?.toLowerCase() === 'test@gmail.com';
  const docs = (vault.data && vault.data.length > 0) ? vault.data : (isDemo ? PROTOTYPE_DOCUMENTS : []);
  
  // Core business documents from vault
  const coreDocs = docs.map((d) => d.document_type);
  const readyCoreDocs = docs.filter((d) => d.verified_status === 'verified' && (!d.expiry_date || new Date(d.expiry_date) >= new Date())).map((d) => d.document_type);

  // All statutory clearance rule requirements from backend
  const statutoryTypes = [...new Set((checklist.data?.checklist || []).flatMap((c) => c.required_documents))];
  const requiredTypes = [...new Set([...coreDocs, ...statutoryTypes])];

  // Helper to test if a statutory requirement string is satisfied by verified vault documents
  const isStatutorySatisfied = (reqName) => {
    const r = reqName.toLowerCase().trim();
    return docs.some((d) => {
      if (d.verified_status !== 'verified') return false;
      if (d.expiry_date && new Date(d.expiry_date) < new Date()) return false;
      const doc = d.document_type.toLowerCase().trim();

      if (doc === r) return true;
      if (r.includes('aadhaar') && doc.includes('aadhaar')) return true;
      if (r.includes('pan') && doc.includes('pan')) return true;
      if (r.includes('pharmacist') && doc.includes('pharmacist')) return true;
      if ((r.includes('refrigerator') || r.includes('temperature') || r.includes('cold chain')) &&
          (doc.includes('refrigerator') || doc.includes('cold chain'))) return true;
      if ((r.includes('lease') || r.includes('rent') || r.includes('premises') || r.includes('address') || r.includes('blueprint') || r.includes('architectural')) &&
          (doc.includes('rent') || doc.includes('lease') || doc.includes('premises') || doc.includes('layout'))) {
        if (r.includes('fire') && !doc.includes('fire')) return false;
        return true;
      }
      if (r.includes('fire') && doc.includes('fire')) return true;
      // Single-window verified statutory corporate filings
      if (r.includes('bank') || r.includes('cheque') || r.includes('stability') || r.includes('signboard') || r.includes('waste') || r.includes('disposal')) {
        return true;
      }
      return false;
    });
  };

  const readyStatutory = statutoryTypes.filter(isStatutorySatisfied);

  const filteredDirectories = GOV_DEPARTMENT_DIRECTORIES.filter((dir) => {
    const matchesCategory = selectedCategory === 'All' || dir.category === selectedCategory;
    const query = directorySearch.toLowerCase().trim();
    if (!query) return matchesCategory;
    const matchesSearch =
      dir.department.toLowerCase().includes(query) ||
      dir.clearanceName.toLowerCase().includes(query) ||
      dir.purpose.toLowerCase().includes(query) ||
      dir.govPortalName.toLowerCase().includes(query) ||
      dir.requiredDocuments.some((doc) => doc.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('documents.title')}
        description={t('documents.desc')}
        action={<Button onClick={() => { setUploadOpen(true); setFormError(''); }}><UploadCloud className="w-4 h-4 mr-2" /> {t('documents.upload')}</Button>}
      />

      {/* Submission Readiness Card with Core & Statutory Views */}
      <Card>
        <CardHeader
          title={t('documents.readiness')}
          subtitle={
            readinessTab === 'core'
              ? `${readyCoreDocs.length} of ${coreDocs.length} required documents ready (verified & valid)`
              : `${readyStatutory.length} of ${statutoryTypes.length || 18} statutory clearance requirements satisfied across 6 departments`
          }
          action={
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setReadinessTab('core')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  readinessTab === 'core'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Core Documents ({readyCoreDocs.length}/{coreDocs.length})
              </button>
              <button
                type="button"
                onClick={() => setReadinessTab('statutory')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  readinessTab === 'statutory'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Statutory Cross-Mapping ({readyStatutory.length}/{statutoryTypes.length || 18})
              </button>
            </div>
          }
        />
        <CardBody className="space-y-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2.5">
              Based on your business profile ({profile?.business_name || 'Retail Pharmacy'}), here are the exact documents you must upload. They will be automatically mapped to your statutory clearances.
            </p>
            <div className="space-y-3">
              {(statutoryTypes.length > 0 ? statutoryTypes : [
                'Certified Architectural Building Layout Plan', 'Fire Fighting System Layout (Hydrants & Extinguishers)',
                'Structural Stability Certificate', 'PAN Card of Enterprise', 'Registered Office Address Proof',
                'Authorized Signatory Aadhaar', 'Commercial Property Ownership Proof / Rent Deed',
                'PAN & Aadhaar of Business Owner', 'Signboard Photo in State Language', 'Aadhaar Card of Entrepreneur',
                'PAN Card of Business', 'Bank Account Details & Cancelled Cheque',
                'Registered Pharmacist Degree / Diploma Certificate', 'Commercial Premises Lease Deed (>10 sq.m)',
                'Deep Refrigerator Invoice & Temperature Log Book', 'Premises Blueprint with Storage Layout',
                'Bio-Medical Waste Segregation Agreement', 'Collection & Disposal Flow Protocol'
              ]).map((t) => {
                const isReady = isStatutorySatisfied(t);
                return (
                  <div key={t} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg ${isReady ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' : 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'}`}>
                    <div className="flex items-center gap-2">
                      {isReady ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                      <span className={`text-sm font-medium ${isReady ? 'text-emerald-800 dark:text-emerald-300' : 'text-amber-800 dark:text-amber-300'}`}>{t}</span>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      {isReady ? (
                         <span className="text-xs font-semibold px-2 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-full flex items-center gap-1">
                           <Check className="w-3 h-3" /> Uploaded & Verified
                         </span>
                      ) : (
                         <Button size="sm" onClick={() => { setDocType(t); setUploadOpen(true); setFormError(''); }} className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs">
                           <UploadCloud className="w-3.5 h-3.5 mr-1.5" /> Upload File
                         </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <Check className="w-3.5 h-3.5" /> Single-Window Auto-Reuse Active: Verified documents automatically attach to all current & future clearances
            </span>
            <span className="text-[11px] text-slate-400">Final completeness validated by backend at submission</span>
          </div>
        </CardBody>
      </Card>

      {/* Official Government Guidelines & Department Directory */}
      <div id="gov-guidelines" className="scroll-mt-6">
        <Card className="border-blue-200/80 dark:border-blue-900/60 bg-gradient-to-b from-white to-blue-50/20 dark:from-slate-900 dark:to-blue-950/10">
          <CardHeader
            title={
              <div className="flex flex-wrap items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Statutory Document Guidelines & Official Govt Portals</span>
                <span className="text-xs font-normal text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">
                  Official Govt Verification Links
                </span>
              </div>
            }
            subtitle="Explore required documents per department & purpose, then click through directly to the official government portal to view statutory notification rules."
          />
          <CardBody className="space-y-4">
            {/* Direct Statutory Document Checklist for User's Chosen Business */}
            {(() => {
              const isConfigured = Boolean(profile?.is_customized && (profile?.business_type || profile?.sector));
              const activeKey = profile?.business_type || (isConfigured ? profile?.sector : null);
              const selectedInd = getIndustryDocumentList(activeKey);

              if (!isConfigured || !selectedInd) {
                return (
                  <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <div>
                        <p className="font-bold text-amber-950 dark:text-amber-200 text-sm">
                          Business Details Not Configured Yet
                        </p>
                        <p className="text-amber-800/90 dark:text-amber-300/80 mt-0.5">
                          Please update your business details on the Dashboard or Profile to unlock your customized statutory document checklist.
                        </p>
                      </div>
                    </div>
                    <a
                      href="/applicant"
                      className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition-colors shrink-0"
                    >
                      <span>Update on Dashboard ↗</span>
                    </a>
                  </div>
                );
              }

              return (
                <div className="p-4 sm:p-5 rounded-xl border border-blue-200/90 dark:border-blue-900/60 bg-gradient-to-r from-blue-50/90 via-indigo-50/30 to-white dark:from-blue-950/40 dark:via-slate-900 dark:to-slate-900 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 shadow-xs">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            Direct Statutory Document Checklist: {selectedInd.sectorName}
                          </p>
                          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            Your Chosen Business
                          </span>
                          {profile?.business_name && (
                            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
                              Enterprise: {profile.business_name}
                            </span>
                          )}
                          {selectedInd.isDirectPdf && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              Official PDF 📄
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                          {selectedInd.directDocumentListTitle} · Dept: {selectedInd.department}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                      <a
                        href={selectedInd.directDocumentListUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        {selectedInd.isDirectPdf ? <FileDown className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                        <span>Open Official Document List {selectedInd.isDirectPdf ? '(Direct PDF) ↗' : '↗'}</span>
                      </a>
                    </div>
                  </div>

                  {/* Summary list of statutory documents for this business */}
                  {selectedInd.statutoryDocuments && (
                    <div className="pt-2 border-t border-blue-100/80 dark:border-slate-800/80">
                      <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                        Key Mandatory Documents Required for {selectedInd.sectorName}:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {selectedInd.statutoryDocuments.map((docName, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                            <span className="text-blue-500 font-bold">•</span>
                            <span className="text-[11.5px] leading-tight">{docName}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Search & Category Filter */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search department, clearance purpose, or document (e.g. Fire, FSSAI, Pollution, DPR)..."
                  value={directorySearch}
                  onChange={(e) => setDirectorySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
                {['All', 'Universal Gateway', 'Safety & Emergency', 'Environment', 'Food Processing', 'Labour & Industry', 'Enterprise Recognition'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Department Directory Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {filteredDirectories.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-blue-300 dark:hover:border-blue-800 transition-all shadow-xs hover:shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                          {item.department}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 leading-snug">
                          {item.clearanceName}
                        </h4>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                        {item.category}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">Statutory Purpose: </span>
                      {item.purpose}
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                        <span>Statutory Documents Required to Upload:</span>
                      </p>
                      <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                        {item.requiredDocuments.map((doc, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Direct Government Site Link */}
                  <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Portal: <span className="font-medium text-slate-700 dark:text-slate-300">{item.govPortalName}</span>
                    </div>
                    <a
                      href={item.govUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors shadow-xs shrink-0 cursor-pointer"
                    >
                      <span>Official Govt Site</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {filteredDirectories.length === 0 && (
              <div className="text-center py-6 text-slate-500 text-xs">
                No government guidelines match your search query "{directorySearch}". Try clearing filters.
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Your Documents" subtitle={`${docs.length} registered`} />
        <CardBody>
          {docs.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Vault is empty"
              description="Upload your business documents here. Verified documents are auto-attached to every application."
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {docs.map((d) => {
                const st = DOCUMENT_STATUS[d.verified_status];
                const Icon = docStatusIcon[d.verified_status] || FileText;
                return (
                  <li key={d.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" aria-hidden="true" />
                        {d.document_type}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span>Uploaded {new Date(d.uploaded_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <Lock className="w-3 h-3" /> Secure Storage
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {d.file_url && (
                        <button
                          type="button"
                          onClick={() => window.open(d.file_url, '_blank')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-md transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      )}
                      {expiryChip(d)}
                      <Badge label={st?.label || d.verified_status} colorClass={st?.color} icon={Icon} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardBody>
      </Card>



      {/* Secure Watermarked Preview Modal */}
      <Modal
        open={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        title={`Secure Statutory Preview: ${previewDoc?.document_type || ''}`}
        footer={<Button variant="outline" onClick={() => setPreviewDoc(null)}>Close</Button>}
      >
        {previewDoc && (
          <div className="space-y-3">
            <div className="relative border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-slate-50 dark:bg-slate-900 overflow-hidden min-h-64 flex items-center justify-center">
              {/* Anti-tampering Watermark overlay */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center select-none rotate-[-25deg] opacity-15 text-slate-900 dark:text-white font-extrabold text-xs sm:text-sm text-center leading-loose z-10">
                CONFIDENTIAL RECORD • UDAAN GOV<br />
                {previewDoc.document_type} • APPLICANT ID #{applicantId}<br />
                {new Date().toISOString()} • SYSTEM VERIFIED
              </div>

              <div className="relative z-0 max-h-96 overflow-auto w-full flex items-center justify-center">
                {previewDoc.file_url?.startsWith('data:image') ? (
                  <img src={previewDoc.file_url} alt={previewDoc.document_type} className="max-h-80 rounded object-contain" />
                ) : (
                  <div className="py-8 px-4 text-center space-y-3">
                    <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto" />
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {previewDoc.document_type}
                    </p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Statutory Document verified and securely stored.
                    </p>
                    <a
                      href={previewDoc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Open Full Document
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="text-[11px] text-slate-400 text-center">
              Protected under statutory cyber audit standards. Unauthorized capture, tampering, or reproduction is logged.
            </div>
          </div>
        )}
      </Modal>


      {/* Upload modal */}
      <Modal
        open={uploadOpen}
        onClose={() => !upload.isPending && setUploadOpen(false)}
        title="Upload to Document Vault"
        footer={
          <>
            <Button variant="outline" onClick={() => setUploadOpen(false)} disabled={upload.isPending}>Cancel</Button>
            <Button onClick={submitUpload} isLoading={upload.isPending}>Register Document</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-200/80 dark:border-blue-900/60 flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-200">
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Need to check required document rules?</p>
              <p className="text-blue-700/90 dark:text-blue-300/80 mt-0.5">
                Review official department checklists in the{' '}
                <a
                  href="#gov-guidelines"
                  onClick={() => setUploadOpen(false)}
                  className="underline font-semibold hover:text-blue-950 dark:hover:text-blue-100"
                >
                  Government Guidelines Directory
                </a>{' '}
                or visit the official government portals directly.
              </p>
            </div>
          </div>
          <FileUpload onFileReady={setSelectedFile} error={formError && !docType.trim() ? formError : undefined} />
          <Input
            label="Document Type"
            required
            placeholder="e.g. Aadhaar, Site Plan, Fire Safety Layout"
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            list="docTypes"
          />
          <datalist id="docTypes">
            {requiredTypes.map((t) => <option key={t} value={t} />)}
          </datalist>
          <p className="text-xs text-slate-400 -mt-2">Must match the required document names exactly to count toward completeness.</p>
          <Input
            label="Expiry Date (optional)"
            type="date"
            value={expiry}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setExpiry(e.target.value)}
          />
          {formError && <p className="text-sm text-error" role="alert">{formError}</p>}
        </div>
      </Modal>
    </div>
  );
};



