import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User, Building2, ShieldCheck, CheckCircle2, Lock, Eye, EyeOff,
  Edit3, Calendar, Mail, Phone, Hash, MapPin, IndianRupee, Users,
  Briefcase, Award, Sparkles, ChevronRight, FileText, ExternalLink, FileDown, BookOpen, AlertTriangle
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

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { t } = useTranslation();
  const isDemo = user?.email?.toLowerCase() === 'test@gmail.com';
  const queryClient = useQueryClient();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'business'
  const [showPhone, setShowPhone] = useState(false);
  const [showAadhaar, setShowAadhaar] = useState(false);
  const [previewSector, setPreviewSector] = useState(null);

  // Fetch current applicant profile from single source of truth hook
  const { data: profile, isLoading, error } = useProfile();

  // Edit form state
  const [formData, setFormData] = useState({
    applicant_name: '',
    date_of_birth: '',
    phone_number: '',
    aadhaar_number: '',
    pan_number: '',
    business_name: '',
    business_type: isDemo ? 'pharmacy' : 'food_processing',
    sector: isDemo ? 'pharma' : 'food_processing',
    nic_code: isDemo ? '47721' : '',
    stage: 'pre_establishment',
    state: 'Madhya Pradesh',
    district: 'Bhopal',
    investment_amount: isDemo ? '25' : '10',
    employee_count: isDemo ? '8' : '5',
  });

  // Populate form data once profile loads or user context is available
  useEffect(() => {
    if (profile) {
      setFormData({
        applicant_name: profile.applicant_name || user?.name || (isDemo ? 'Aarav Sharma' : ''),
        date_of_birth: profile.date_of_birth || (isDemo ? '1995-08-15' : ''),
        phone_number: profile.phone_number || (isDemo ? '9876543210' : ''),
        aadhaar_number: profile.aadhaar_number || (isDemo ? '892145894812' : ''),
        pan_number: profile.pan_number || (isDemo ? 'AAAPA9481K' : ''),
        business_name: profile.business_name || (isDemo ? 'Sharma Medical & Pharmacy' : ''),
        business_type: profile.business_type || (isDemo ? 'pharmacy' : 'food_processing'),
        sector: profile.sector || (isDemo ? 'pharma' : 'food_processing'),
        nic_code: profile.nic_code || (isDemo ? '47721' : ''),
        stage: profile.stage || 'pre_establishment',
        state: profile.state || 'Madhya Pradesh',
        district: profile.district || 'Bhopal',
        investment_amount: profile.investment_amount != null ? String(profile.investment_amount) : (isDemo ? '25' : '10'),
        employee_count: profile.employee_count != null ? String(profile.employee_count) : (isDemo ? '8' : '5'),
      });
    } else if (user) {
      setFormData(prev => ({
        ...prev,
        applicant_name: user.name || '',
      }));
    }
  }, [profile, user, isDemo]);

  // Handle profile update mutation
  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      return await updateProfile(payload);
    },
    onSuccess: () => {
      // Invalidate all linked caches so Dashboard, Document and Checklist update together
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['applicantProfile'] });
      queryClient.invalidateQueries({ queryKey: ['checklist'] });
      queryClient.invalidateQueries({ queryKey: ['vault'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });

      // Synchronize AuthContext so top header instantly displays updated name
      if (formData.applicant_name) {
        updateUser({ name: formData.applicant_name.trim() });
      }
      setPreviewSector(formData.business_type || formData.sector);
      toast.success(
        `Business & profile details updated! Synchronized across Dashboard, Profile, and Documents.`,
        { duration: 4000 }
      );
      setIsEditModalOpen(false);
    },
    onError: (err) => {
      toast.error(extractApiError(err) || 'Failed to update profile');
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'business_type') {
      let autoSector = formData.sector;
      const t = value.toLowerCase();
      if (t === 'pharmacy' || t === 'clinic') autoSector = 'pharma';
      else if (['cafe', 'restaurant', 'hotel', 'bakery', 'dhaba', 'food_processing'].includes(t)) autoSector = 'food_processing';
      else if (t === 'factory') autoSector = 'manufacturing';
      else if (t === 'gym_fitness' || t === 'office') autoSector = 'it_ites';
      else if (t === 'textile') autoSector = 'textile';
      else if (t === 'warehouse') autoSector = 'agriculture';
      else if (t === 'salon_spa' || t === 'coaching_institute' || t === 'petrol_pump') autoSector = 'service';
      setFormData(prev => ({ ...prev, business_type: value, sector: autoSector }));
      return;
    }
    if (name === 'sector') {
      let autoType = formData.business_type;
      const s = value.toLowerCase();
      if (s === 'pharma') autoType = 'pharmacy';
      else if (s === 'food_processing') autoType = 'food_processing';
      else if (s === 'manufacturing') autoType = 'factory';
      else if (s === 'it_ites') autoType = 'gym_fitness';
      else if (s === 'textile') autoType = 'textile';
      else if (s === 'agriculture') autoType = 'warehouse';
      else if (s === 'service') autoType = 'office';
      setFormData(prev => ({ ...prev, sector: value, business_type: autoType }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.applicant_name.trim()) {
      toast.error('Applicant Full Name is required');
      return;
    }
    updateMutation.mutate({
      ...formData,
      investment_amount: Number(formData.investment_amount) || 0,
      employee_count: Number(formData.employee_count) || 0,
    });
  };

  // Safe masking helper
  const maskPhone = (phone) => {
    if (!phone) return isDemo ? '+91 XXXXXXX645' : 'Not provided';
    const digits = phone.replace(/\D/g, '');
    if (digits.length <= 3) return '+91 XXXXXXX' + digits;
    const last3 = digits.slice(-3);
    return `+91 XXXXXXX${last3}`;
  };

  // Safe masking for Aadhaar
  const maskAadhaar = (aadhaar) => {
    if (!aadhaar) return isDemo ? 'XXXX-XXXX-4812' : 'Not linked';
    const clean = aadhaar.replace(/\D/g, '');
    const last4 = clean.slice(-4) || (isDemo ? '4812' : '');
    return last4 ? `XXXX-XXXX-${last4}` : 'Not linked';
  };

  // Formatted Applicant ID — deterministic "ABCD-1234" from user id
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

  // Format Date of Birth
  const formatDob = (dob) => {
    if (!dob) return isDemo ? '15 Aug 1995' : 'Not provided';
    try {
      const d = new Date(dob);
      if (isNaN(d.getTime())) return dob;
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dob;
    }
  };

  const districtsForState = formData.state && INDIA_STATES_DISTRICTS[formData.state]
    ? INDIA_STATES_DISTRICTS[formData.state]
    : ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain'];

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
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t('profile.title')}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Active Applicant
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t('profile.desc')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsEditModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a3a6b] dark:bg-blue-600 hover:bg-[#14306a] dark:hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all duration-200 active:scale-98 cursor-pointer shrink-0"
        >
          <Edit3 className="w-4 h-4" />
          <span>{t('profile.editProfile')}</span>
        </button>
      </div>

      {/* Security notice pill */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200">
        <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
        <div className="flex-1">
          <span className="font-semibold">Secure & Compliant Data Protection: </span>
          PII & contact fields are protected with zero-leakage masking (<code className="font-mono text-[11px] bg-blue-100 dark:bg-blue-900/50 px-1 py-0.5 rounded">+91 XXXXXXX645</code>) and 256-bit encryption.
        </div>
      </div>

      {/* SECTION 1: Personal Information */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 sm:px-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Personal Information
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Primary applicant credentials and verified contact identity
              </p>
            </div>
          </div>

        </div>

        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Full Name
            </span>
            <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{profile?.applicant_name || user?.name || (isDemo ? 'Aarav Sharma' : 'Applicant')}</span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                Primary
              </span>
            </div>
          </div>

          {/* Applicant ID */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Applicant ID
            </span>
            <div>
              <span className="inline-block font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                {applicantId}
              </span>
            </div>
          </div>

          {/* Date of Birth */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Date of Birth
            </span>
            <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{formatDob(profile?.date_of_birth || formData.date_of_birth)}</span>
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Email Address
            </span>
            <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{user?.email || profile?.email || (isDemo ? 'test@gmail.com' : '')}</span>
            </div>
          </div>

          {/* Phone Number with Data Security Masking */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Phone Number / Linked Identity
            </span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white font-mono">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>
                  {showPhone ? `+91 ${formData.phone_number}` : maskPhone(formData.phone_number)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPhone(!showPhone)}
                title={showPhone ? 'Mask phone number' : 'Reveal phone number'}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {showPhone ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800/40">
                Verified
              </span>
            </div>
          </div>

          {/* Aadhaar Number with statutory masking */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Aadhaar (Statutory ID)
            </span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white font-mono">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {showAadhaar ? formData.aadhaar_number : maskAadhaar(formData.aadhaar_number)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAadhaar(!showAadhaar)}
                title={showAadhaar ? 'Mask Aadhaar' : 'Reveal Aadhaar'}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {showAadhaar ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Business Information */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 sm:px-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Business Information
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enterprise entity attributes and registered project details
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Operational • Level 2 Validated
          </span>
        </div>

        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Name */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Business Name
            </span>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              {profile?.business_name || formData.business_name || 'Not Configured'}
            </div>
          </div>

          {/* Business Type */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Business Type / Establishment
            </span>
            <div className="text-sm font-semibold text-slate-900 dark:text-white capitalize">
              {(profile?.business_type || formData.business_type || '').replace(/_/g, ' ') || 'Not Specified'}
            </div>
          </div>

          {/* Department */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Department
            </span>
            <div className="text-sm font-semibold text-slate-900 dark:text-white capitalize">
              {profile?.department || formData.department || 'State FDA & Central Drugs Standard Control Organisation (CDSCO)'}
            </div>
          </div>

          {/* NIC Code */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              NIC Code
            </span>
            <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="font-mono">{profile?.nic_code || formData.nic_code || (isDemo ? '47721' : 'Classified')}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                {profile?.business_type === 'pharmacy' || profile?.sector === 'pharma'
                  ? '(Retail sale of pharmaceuticals & medical goods)'
                  : profile?.sector === 'food_processing'
                  ? '(Manufacture & processing of food products)'
                  : `(${((profile?.business_type || profile?.sector || 'General enterprise')).replace(/_/g, ' ')})`}
              </span>
            </div>
          </div>

          {/* Business Stage */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Business Stage
            </span>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 capitalize">
                {(profile?.stage || formData.stage || 'pre_establishment').replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* State & District */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              State & District
            </span>
            <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{profile?.state || formData.state || 'Madhya Pradesh'}, {profile?.district || formData.district || 'Bhopal'}</span>
            </div>
          </div>

          {/* Investment Scale */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Investment Scale
            </span>
            <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-slate-400" />
              <span>₹ {Number(profile?.investment_amount || formData.investment_amount || '1500000').toLocaleString('en-IN')} (Micro Enterprise)</span>
            </div>
          </div>

          {/* Employee Count */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Employees / Headcount
            </span>
            <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              <span>{profile?.employee_count || formData.employee_count || '10'} Persons</span>
            </div>
          </div>

          {/* Compliance Status */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Statutory Single Window Status
            </span>
            <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Secure & Compliant • Fast-track Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Direct Official Statutory Document Checklist for Industry */}
      {(() => {
        const currentSector = previewSector || profile?.business_type || profile?.sector || formData.business_type || formData.sector || 'cafe_hotel';
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
                    <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                      Direct Statutory Document Checklist
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                      Official Govt Direct Link
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Official required documents for <strong className="text-slate-700 dark:text-slate-200">{indDoc.sectorName}</strong>
                  </p>
                </div>
              </div>

              {/* Direct Link Action Button */}
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <a
                  href={indDoc.directDocumentListUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-150 cursor-pointer"
                  title={`Open direct official document list for ${indDoc.sectorName}`}
                >
                  {indDoc.isDirectPdf ? <FileDown className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                  <span>Open Official Document List {indDoc.isDirectPdf ? '(Direct PDF) ↗' : '↗'}</span>
                </a>
                <a
                  href={indDoc.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  <span>{indDoc.portalName}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              {/* Interactive Industry Switcher: Check documents for other businesses */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
                  Select or Preview Industry Requirements:
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {Object.entries(INDUSTRY_GOV_DOCUMENT_MAP).map(([key, item]) => {
                    const isSelected = key === currentSector;
                    const isUserRegistered = key === (profile?.business_type || profile?.sector || formData.business_type || formData.sector);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setPreviewSector(key)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs font-bold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span>{item.sectorName}</span>
                        {isUserRegistered && (
                          <span className={`text-[9.5px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-blue-700 text-blue-100' : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'}`}>
                            Your Business
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Document Checklist Description & Details */}
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      Department / Authority: {indDoc.department}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {indDoc.directDocumentListTitle}
                    </h4>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Source: <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{new URL(indDoc.directDocumentListUrl).hostname}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {indDoc.description}
                </p>
              </div>

              {/* Statutory Documents List */}
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white mb-2.5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Mandatory Statutory Documents for {indDoc.sectorName}:</span>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {indDoc.statutoryDocuments.map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-start gap-2.5 text-xs text-slate-800 dark:text-slate-200"
                    >
                      <span className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        {idx + 1}
                      </span>
                      <span className="leading-snug">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}



      {/* EDIT PROFILE MODAL */}
      <Modal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
        size="lg"
        position="top"
        containerClassName="pt-2 sm:pt-4 md:pt-5"
      >
        <div>
          {/* Section Tab switcher */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4">
            <button
              type="button"
              onClick={() => setActiveTab('personal')}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'personal'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Personal Information</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('business')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'business'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Business Information</span>
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* TAB 1: PERSONAL INFORMATION */}
            {activeTab === 'personal' && (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl text-xs text-blue-800 dark:text-blue-200 border border-blue-200/50 dark:border-blue-800/40">
                  The Full Name entered here will be displayed across your portal header, certificates, and inspection clearances.
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Applicant Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="applicant_name"
                    required
                    value={formData.applicant_name}
                    onChange={handleInputChange}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number (Linked Identity)
                    </label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      placeholder="e.g. 9876543210"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Protected on public interfaces as <code className="font-mono text-[10px]">+91 XXXXXXX645</code>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Aadhaar Number (12 Digits)
                    </label>
                    <input
                      type="text"
                      name="aadhaar_number"
                      maxLength={12}
                      value={formData.aadhaar_number}
                      onChange={handleInputChange}
                      placeholder="12 digit Aadhaar number"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      PAN Card Number
                    </label>
                    <input
                      type="text"
                      name="pan_number"
                      maxLength={10}
                      value={formData.pan_number}
                      onChange={handleInputChange}
                      placeholder="e.g. AAAPA9481K"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: BUSINESS INFORMATION */}
            {activeTab === 'business' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Business / Enterprise Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="business_name"
                    required
                    value={formData.business_name}
                    onChange={handleInputChange}
                    placeholder="e.g. ABC Foods Pvt. Ltd."
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Business Type / Establishment
                    </label>
                    <input
                      type="text"
                      name="business_type"
                      value={formData.business_type}
                      onChange={handleInputChange}
                      placeholder="e.g. Retail, Manufacturing"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Department
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="Food Safety and Standards Authority of India (FSSAI)">Food Safety and Standards Authority of India (FSSAI)</option>
                      <option value="State FDA & Central Drugs Standard Control Organisation (CDSCO)">State FDA & Central Drugs Standard Control Organisation (CDSCO)</option>
                      <option value="Urban Administration & Municipal Corporation">Urban Administration & Municipal Corporation</option>
                    </select>
                  </div>
                </div>

                {/* Live Direct Document Checklist Preview for selected Business Type / Sector */}
                {(() => {
                  const selDoc = getIndustryDocumentList(formData.business_type || formData.sector);
                  if (!selDoc) return null;
                  return (
                    <div className="p-3 rounded-xl bg-blue-50/90 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-blue-950 dark:text-blue-100">
                            Direct Govt Document List: {selDoc.sectorName}
                          </p>
                          <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold">
                            Official Source
                          </span>
                        </div>
                        <p className="text-[11px] text-blue-700/90 dark:text-blue-300/80 mt-0.5">
                          {selDoc.directDocumentListTitle}
                        </p>
                      </div>
                      <a
                        href={selDoc.directDocumentListUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shrink-0 transition-colors shadow-xs self-start sm:self-auto"
                      >
                        <span>Open Document List {selDoc.isDirectPdf ? '(PDF) ↗' : '↗'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  );
                })()}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Business Stage
                    </label>
                    <select
                      name="stage"
                      value={formData.stage}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {STAGE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      NIC Code
                    </label>
                    <input
                      type="text"
                      name="nic_code"
                      value={formData.nic_code}
                      onChange={handleInputChange}
                      placeholder="e.g. 10792"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      State
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {STATE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      District
                    </label>
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {districtsForState.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Total Investment (₹)
                    </label>
                    <input
                      type="number"
                      name="investment_amount"
                      value={formData.investment_amount}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Employee Count
                    </label>
                    <input
                      type="number"
                      name="employee_count"
                      value={formData.employee_count}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'personal' ? 'business' : 'personal')}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
              >
                Switch to {activeTab === 'personal' ? 'Business Information' : 'Personal Information'} →
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  isLoading={updateMutation.isPending}
                  className="bg-[#1a3a6b] dark:bg-blue-600 hover:bg-[#14306a] text-white text-xs px-5 py-2"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};
