import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User, Building2, ShieldCheck, CheckCircle2, Lock, Eye, EyeOff,
  Edit3, Calendar, Mail, Phone, Hash, MapPin, IndianRupee, Users,
  Briefcase, Award, Sparkles, ChevronRight, FileText, ExternalLink, FileDown, BookOpen, AlertTriangle,
  Factory, Globe, Truck, Landmark, UserCheck, Heart
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getMyProfile, updateProfile } from '../../api/applicantApi';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import { Button, Modal } from '../../components/common/ui';
import { SECTOR_OPTIONS, STAGE_OPTIONS, BUSINESS_TYPE_OPTIONS } from '../../constants/statusCatalog';
import { INDIA_STATES_DISTRICTS, STATE_OPTIONS } from '../../constants/indiaStatesDistricts';
import { extractApiError } from '../../utils/errors';
import { INDUSTRY_GOV_DOCUMENT_MAP, getIndustryDocumentList } from '../../constants/govDocumentDirectory';

/* ========== Helper: Read-Only Field Display ========== */
const ReadOnlyField = ({ label, value, icon: Icon, badge, mono }) => (
  <div className="space-y-1">
    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
      {label}
    </span>
    <div className={`text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 ${mono ? 'font-mono' : ''}`}>
      {Icon && <Icon className="w-4 h-4 text-slate-400 shrink-0" />}
      <span>{value || '—'}</span>
      {badge && (
        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
          {badge}
        </span>
      )}
    </div>
  </div>
);

/* ========== Helper: Section Card ========== */
const SectionCard = ({ icon: Icon, iconBg, title, subtitle, badge, children }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 sm:px-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
      </div>
      {badge}
    </div>
    <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {children}
    </div>
  </div>
);

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { t } = useTranslation();
  const isDemo = user?.email?.toLowerCase() === 'test@gmail.com';
  const queryClient = useQueryClient();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showAadhaar, setShowAadhaar] = useState(false);
  const [previewSector, setPreviewSector] = useState(null);

  const { data: profile, isLoading, error } = useProfile();

  // Only personal info is editable
  const [formData, setFormData] = useState({
    applicant_name: '',
    date_of_birth: '',
    phone_number: '',
    aadhaar_number: '',
    pan_number: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        applicant_name: profile.applicant_name || user?.name || '',
        date_of_birth: profile.date_of_birth || '',
        phone_number: profile.phone_number || '',
        aadhaar_number: profile.aadhaar_number || '',
        pan_number: profile.pan_number || '',
      });
    } else if (user) {
      setFormData(prev => ({ ...prev, applicant_name: user.name || '' }));
    }
  }, [profile, user]);

  const updateMutation = useMutation({
    mutationFn: async (payload) => await updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['applicantProfile'] });
      if (formData.applicant_name) updateUser({ name: formData.applicant_name.trim() });
      toast.success('Personal details updated successfully!');
      setIsEditModalOpen(false);
    },
    onError: (err) => toast.error(extractApiError(err) || 'Failed to update profile'),
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.applicant_name.trim()) {
      toast.error('Applicant Full Name is required');
      return;
    }
    updateMutation.mutate(formData);
  };

  const maskPhone = (phone) => {
    if (!phone) return 'Not provided';
    const digits = phone.replace(/\D/g, '');
    if (digits.length <= 3) return '+91 XXXXXXX' + digits;
    return `+91 XXXXXXX${digits.slice(-3)}`;
  };

  const maskAadhaar = (aadhaar) => {
    if (!aadhaar) return 'Not linked';
    const clean = aadhaar.replace(/\D/g, '');
    const last4 = clean.slice(-4);
    return last4 ? `XXXX-XXXX-${last4}` : 'Not linked';
  };

  const generateApplicantId = (seed) => {
    if (!seed) return 'New Applicant';
    const n = typeof seed === 'number' ? seed : parseInt(seed, 10) || 0;
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const a = letters[(n * 7 + 3) % 26];
    const b = letters[(n * 13 + 11) % 26];
    const c = letters[(n * 17 + 5) % 26];
    const d = letters[(n * 23 + 1) % 26];
    const digits = String(((n * 9301 + 49297) % 9000) + 1000);
    return `${a}${b}${c}${d}-${digits}`;
  };
  const applicantId = generateApplicantId(profile?.id || user?.id);

  const formatDob = (dob) => {
    if (!dob) return 'Not provided';
    try {
      const d = new Date(dob);
      if (isNaN(d.getTime())) return dob;
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return dob; }
  };

  const enterpriseLabel = (type) => {
    if (!type) return '—';
    const map = { Micro: 'Micro Enterprise', Small: 'Small Enterprise', Medium: 'Medium Enterprise' };
    return map[type] || type;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-slide-up">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">Portal</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-slate-800 dark:text-slate-200">My Profile</span>
      </nav>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t('profile.title')}</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Active Applicant
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{t('profile.desc')}</p>
        </div>
        <button
          type="button"
          onClick={() => setIsEditModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a3a6b] dark:bg-blue-600 hover:bg-[#14306a] dark:hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all duration-200 active:scale-98 cursor-pointer shrink-0"
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Personal Info</span>
        </button>
      </div>

      {/* Security notice */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200">
        <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
        <div className="flex-1">
          <span className="font-semibold">Secure & Compliant: </span>
          Business details are locked after initial setup. Only personal information can be updated.
        </div>
      </div>

      {/* ==================== SECTION 1: Personal Information (Editable) ==================== */}
      <SectionCard
        icon={User}
        iconBg="bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/60 text-blue-600 dark:text-blue-400"
        title="Personal Information"
        subtitle="Primary applicant credentials — editable"
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            <Edit3 className="w-3 h-3" /> Editable
          </span>
        }
      >
        <ReadOnlyField label="Full Name" value={profile?.applicant_name || user?.name || 'Applicant'} badge="Primary" />
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Applicant ID</span>
          <div><span className="inline-block font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">{applicantId}</span></div>
        </div>
        <ReadOnlyField label="Date of Birth" value={formatDob(profile?.date_of_birth)} icon={Calendar} />
        <ReadOnlyField label="Email Address" value={user?.email || profile?.email || ''} icon={Mail} />

        {/* Phone with masking */}
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Phone Number</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white font-mono">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>{showPhone ? `+91 ${profile?.phone_number || ''}` : maskPhone(profile?.phone_number)}</span>
            </div>
            <button type="button" onClick={() => setShowPhone(!showPhone)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
              {showPhone ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800/40">Verified</span>
          </div>
        </div>

        {/* Aadhaar with masking */}
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Aadhaar (Statutory ID)</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white font-mono">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>{showAadhaar ? profile?.aadhaar_number : maskAadhaar(profile?.aadhaar_number)}</span>
            </div>
            <button type="button" onClick={() => setShowAadhaar(!showAadhaar)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
              {showAadhaar ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </SectionCard>

      {/* ==================== SECTION 2: Business Details (Read-Only) ==================== */}
      <SectionCard
        icon={Building2}
        iconBg="bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400"
        title="Business Details"
        subtitle="Enterprise entity attributes — locked after setup"
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <Lock className="w-3 h-3" /> Read-Only
          </span>
        }
      >
        <ReadOnlyField label="Business Name" value={profile?.business_name} icon={Building2} />
        <ReadOnlyField label="Business Type" value={(profile?.business_type || '').replace(/_/g, ' ')} icon={Briefcase} />
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Business Stage</span>
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 capitalize">
              {(profile?.stage || 'pre_establishment').replace(/_/g, ' ')}
            </span>
          </div>
        </div>
        <ReadOnlyField label="Date of Establishment" value={profile?.date_of_establishment ? formatDob(profile.date_of_establishment) : '—'} icon={Calendar} />
        <ReadOnlyField label="Registration Number" value={profile?.registration_number} mono />
        <ReadOnlyField label="Udyam Registration No" value={profile?.udyam_registration_number} mono />
      </SectionCard>

      {/* ==================== SECTION 3: Business Activity (Read-Only) ==================== */}
      <SectionCard
        icon={Factory}
        iconBg="bg-purple-50 dark:bg-purple-950/50 border border-purple-200/60 dark:border-purple-800/60 text-purple-600 dark:text-purple-400"
        title="Business Activity"
        subtitle="Department, sector & trade classification — locked"
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <Lock className="w-3 h-3" /> Read-Only
          </span>
        }
      >
        <ReadOnlyField label="Department" value={profile?.department} icon={Landmark} />
        <ReadOnlyField label="Sub-sector" value={profile?.sub_sector} />
        <ReadOnlyField label="Business Activity" value={profile?.business_activity} />
        <ReadOnlyField label="Products / Services" value={profile?.products_services} />
        <ReadOnlyField label="NIC Code" value={profile?.nic_code} mono />
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Export Business</span>
          <div>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              profile?.is_export_business === 'Yes'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}>
              {profile?.is_export_business || 'No'}
            </span>
          </div>
        </div>
      </SectionCard>

      {/* ==================== SECTION 4: Financial Details (Read-Only) ==================== */}
      <SectionCard
        icon={IndianRupee}
        iconBg="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400"
        title="Financial Details"
        subtitle="Investment, turnover & enterprise classification — locked"
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <Lock className="w-3 h-3" /> Read-Only
          </span>
        }
      >
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Enterprise Type</span>
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
              {enterpriseLabel(profile?.enterprise_type)}
            </span>
          </div>
        </div>
        <ReadOnlyField label="Total Investment" value={profile?.investment_amount ? `₹ ${Number(profile.investment_amount).toLocaleString('en-IN')} Lakhs` : '—'} icon={IndianRupee} />
        <ReadOnlyField label="Annual Turnover" value={profile?.annual_turnover ? `₹ ${Number(profile.annual_turnover).toLocaleString('en-IN')} Lakhs` : '—'} icon={IndianRupee} />
        <ReadOnlyField label="Employee Count" value={profile?.employee_count ? `${profile.employee_count} Persons` : '—'} icon={Users} />
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Existing Loan</span>
          <div>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              profile?.existing_loan === 'Yes'
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}>
              {profile?.existing_loan || 'No'}
            </span>
          </div>
        </div>
        <ReadOnlyField label="Required Investment" value={profile?.required_investment_amount ? `₹ ${Number(profile.required_investment_amount).toLocaleString('en-IN')} Lakhs` : '—'} icon={IndianRupee} />
      </SectionCard>

      {/* ==================== SECTION 5: Business Location (Read-Only) ==================== */}
      <SectionCard
        icon={MapPin}
        iconBg="bg-orange-50 dark:bg-orange-950/50 border border-orange-200/60 dark:border-orange-800/60 text-orange-600 dark:text-orange-400"
        title="Business Location"
        subtitle="Registered address & geographic classification — locked"
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <Lock className="w-3 h-3" /> Read-Only
          </span>
        }
      >
        <ReadOnlyField label="State" value={profile?.state} icon={MapPin} />
        <ReadOnlyField label="District" value={profile?.district} />
        <ReadOnlyField label="City / Town / Village" value={profile?.city_town_village} />
        <ReadOnlyField label="PIN Code" value={profile?.pin_code} mono />
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Area Type</span>
          <div>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              profile?.area_type === 'Urban'
                ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800/60'
                : 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/60'
            }`}>
              {profile?.area_type || '—'}
            </span>
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Industrial Area / SEZ</span>
          <div>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              profile?.is_sez === 'Yes'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}>
              {profile?.is_sez || 'No'}
            </span>
          </div>
        </div>
      </SectionCard>

      {/* ==================== SECTION 6: Owner Details (Read-Only) ==================== */}
      <SectionCard
        icon={UserCheck}
        iconBg="bg-teal-50 dark:bg-teal-950/50 border border-teal-200/60 dark:border-teal-800/60 text-teal-600 dark:text-teal-400"
        title="Owner / Applicant Details"
        subtitle="Demographics for scheme matching — locked"
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <Lock className="w-3 h-3" /> Read-Only
          </span>
        }
      >
        <ReadOnlyField label="Age" value={profile?.owner_age ? `${profile.owner_age} years` : '—'} />
        <ReadOnlyField label="Gender" value={profile?.owner_gender} />
        <ReadOnlyField label="Nationality" value={profile?.owner_nationality || 'Indian'} icon={Globe} />
        <ReadOnlyField label="Social Category" value={profile?.social_category} />
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Minority Status</span>
          <div>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              profile?.minority_status === 'Yes'
                ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800/60'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}>
              {profile?.minority_status || 'No'}
            </span>
          </div>
        </div>
        <ReadOnlyField label="Annual Family Income" value={profile?.family_income ? `₹ ${Number(profile.family_income).toLocaleString('en-IN')}` : '—'} icon={IndianRupee} />
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Disability Status</span>
          <div>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              profile?.disability_status === 'Yes'
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}>
              {profile?.disability_status || 'No'}
            </span>
          </div>
        </div>
      </SectionCard>

      {/* ==================== SECTION 7: Compliance Status ==================== */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Compliance Status</h2>
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Secure & Compliant • Fast-track Active • All sections verified</span>
            </p>
          </div>
        </div>
      </div>

      {/* ==================== SECTION 8: Official Document Checklist ==================== */}
      {(() => {
        const currentSector = previewSector || profile?.business_type || profile?.sector || 'cafe_hotel';
        const indDoc = getIndustryDocumentList(currentSector);
        if (!indDoc) return null;

        return (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-blue-200/90 dark:border-blue-900/60 shadow-xs overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 sm:px-6 border-b border-blue-100 dark:border-blue-900/40 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 dark:from-blue-950/30 dark:to-slate-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Direct Statutory Document Checklist</h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">Official Govt Direct Link</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Official required documents for <strong className="text-slate-700 dark:text-slate-200">{indDoc.sectorName}</strong>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <a href={indDoc.directDocumentListUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-150 cursor-pointer">
                  {indDoc.isDirectPdf ? <FileDown className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                  <span>Open Official Document List {indDoc.isDirectPdf ? '(Direct PDF) ↗' : '↗'}</span>
                </a>
                <a href={indDoc.portalUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer">
                  <span>{indDoc.portalName}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              <div>
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">Select or Preview Industry Requirements:</span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {Object.entries(INDUSTRY_GOV_DOCUMENT_MAP).map(([key, item]) => {
                    const isSelected = key === currentSector;
                    const isUserRegistered = key === (profile?.business_type || profile?.sector);
                    return (
                      <button key={key} type="button" onClick={() => setPreviewSector(key)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                          isSelected ? 'bg-blue-600 text-white shadow-xs font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}>
                        <span>{item.sectorName}</span>
                        {isUserRegistered && (
                          <span className={`text-[9.5px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-blue-700 text-blue-100' : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'}`}>Your Business</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Department / Authority: {indDoc.department}</span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{indDoc.directDocumentListTitle}</h4>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Source: <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{new URL(indDoc.directDocumentListUrl).hostname}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{indDoc.description}</p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white mb-2.5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Mandatory Statutory Documents for {indDoc.sectorName}:</span>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {indDoc.statutoryDocuments.map((doc, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-start gap-2.5 text-xs text-slate-800 dark:text-slate-200">
                      <span className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center shrink-0 text-[11px]">{idx + 1}</span>
                      <span className="leading-snug">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ==================== EDIT PERSONAL INFO MODAL (Only Personal) ==================== */}
      <Modal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Personal Information"
        size="md"
        position="top"
        containerClassName="pt-2 sm:pt-4 md:pt-5"
      >
        <div>
          <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl text-xs text-blue-800 dark:text-blue-200 border border-blue-200/50 dark:border-blue-800/40 mb-4">
            Only personal information can be edited. Business details are locked after initial profile setup to maintain data integrity for approvals and scheme matching.
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Applicant Full Name <span className="text-red-500">*</span>
              </label>
              <input type="text" name="applicant_name" required value={formData.applicant_name} onChange={handleInputChange} placeholder="e.g. Aarav Sharma"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
                <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleInputChange} placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Aadhaar Number (12 Digits)</label>
                <input type="text" name="aadhaar_number" maxLength={12} value={formData.aadhaar_number} onChange={handleInputChange} placeholder="12 digit Aadhaar number"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">PAN Card Number</label>
                <input type="text" name="pan_number" maxLength={10} value={formData.pan_number} onChange={handleInputChange} placeholder="e.g. AAAPA9481K"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase font-mono" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button type="button" onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer">
                Cancel
              </button>
              <Button type="submit" isLoading={updateMutation.isPending} className="bg-[#1a3a6b] dark:bg-blue-600 hover:bg-[#14306a] text-white text-xs px-5 py-2">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};
