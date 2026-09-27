import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.jpg';
import { profileSchema } from '../../schemas/profileSchema';
import { createProfile } from '../../api/applicantApi';
import { extractApiError } from '../../utils/errors';
import { Input, Select } from '../../components/common/ui';
import { STAGE_OPTIONS } from '../../constants/statusCatalog';
import { INDIA_STATES_DISTRICTS, STATE_OPTIONS } from '../../constants/indiaStatesDistricts';

export const ProfileSetupPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const navigate = useNavigate();

  const { register, handleSubmit, watch, trigger, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { stage: 'pre_establishment', state: 'Madhya Pradesh', district: '', business_type: '' },
  });

  const selectedState = watch('state');
  const selectedEnterpriseType = watch('enterprise_type');
  
  const districtOptions = selectedState && INDIA_STATES_DISTRICTS[selectedState]
    ? INDIA_STATES_DISTRICTS[selectedState].map(d => ({ value: d, label: d }))
    : [];

  useEffect(() => {
    setValue('district', '');
  }, [selectedState, setValue]);

  const handleNext = () => {
    // Allow progression without strict validation per step
    // Final validation happens on Complete Profile (onSubmit)
    setStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const res = await createProfile({
        ...data,
        district: data.district || undefined,
        nic_code: data.nic_code || undefined,
      });
      if (res?.user_id || res?.id) {
        const uid = res.user_id || res.id;
        if (data.business_type || data.sector) {
          localStorage.setItem(`udaan_business_type_${uid}`, data.business_type || data.sector);
        }
        localStorage.setItem(`udaan_business_customized_${uid}`, 'true');
      }
      toast.success('Profile created — intelligent matching ready!');
      window.location.assign('/applicant');
    } catch (error) {
      if (error?.response?.status === 401) {
        toast.error('Your session expired. Please sign in again.');
        setTimeout(() => navigate('/login'), 1200);
      } else {
        toast.error(extractApiError(error) || 'Failed to create profile');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-2 sm:py-6 animate-slide-up pb-10">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-8 transition-colors duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#1a3a6b]/10 dark:bg-blue-900/30 flex items-center justify-center overflow-hidden">
              <img src={logo} alt="UDAAN logo" className="w-6 h-6 object-contain" />
            </div>
            <span className="font-bold text-[#1a3a6b] dark:text-blue-400 text-lg tracking-wide">UDAAN</span>
          </div>
          <div className="text-sm font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            Step {step} of {totalSteps}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-1.5 mb-8">
          <div className="bg-[#1a3a6b] dark:bg-blue-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {step === 1 && "Business Details"}
          {step === 2 && "Business Activity"}
          {step === 3 && "Financial Details"}
          {step === 4 && "Business Location"}
          {step === 5 && "Owner Details"}
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-7">
          This generates your <strong className="text-blue-700 dark:text-blue-400 font-semibold">dynamic approval checklist</strong> and matches you with <strong className="text-blue-700 dark:text-blue-400 font-semibold">Govt Schemes</strong>.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* STEP 1: Business Details */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <Input label="Business Name" required placeholder="Ravi Foods Pvt Ltd" error={errors.business_name?.message} {...register('business_name')} />
              <Input label="Business Type" required placeholder="e.g. Retail, Manufacturing, Services" error={errors.business_type?.message} {...register('business_type')} />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select label="Business Stage" required error={errors.stage?.message} {...register('stage')}>
                  {STAGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </Select>
                <Input label="Date of Establishment" type="date" error={errors.date_of_establishment?.message} {...register('date_of_establishment')} />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Registration Number (Optional)" placeholder="CIN/LLPIN" error={errors.registration_number?.message} {...register('registration_number')} />
                <Input label="Udyam Registration No (Optional)" placeholder="UDYAM-XX-00-0000000" error={errors.udyam_registration_number?.message} {...register('udyam_registration_number')} />
              </div>
            </div>
          )}

          {/* STEP 2: Business Activity */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <Select label="Department" required placeholder="Select department" error={errors.department?.message} {...register('department')}>
                <option value="Municipal Corporation / Urban Local Body">Municipal Corporation / Urban Local Body</option>
                <option value="District Industries Centre (DIC)">District Industries Centre (DIC)</option>
                <option value="Industries Department">Industries Department</option>
                <option value="Pollution Control Board">Pollution Control Board</option>
                <option value="Fire & Emergency Services">Fire & Emergency Services</option>
                <option value="Food Safety and Standards Authority of India (FSSAI)">Food Safety and Standards Authority of India (FSSAI)</option>
                <option value="Factories & Boilers Department">Factories & Boilers Department</option>
                <option value="Labour Department">Labour Department</option>
                <option value="State FDA & Central Drugs Standard Control Organisation (CDSCO)">State FDA & Central Drugs Standard Control Organisation (CDSCO)</option>
                <option value="Urban Administration & Municipal Corporation">Urban Administration & Municipal Corporation</option>
                <option value="Town & Country Planning Department">Town & Country Planning Department</option>
                <option value="Revenue / Land Records Department">Revenue / Land Records Department</option>
                <option value="Electricity Distribution Department">Electricity Distribution Department</option>
                <option value="Water Resources / Water Supply Department">Water Resources / Water Supply Department</option>
                <option value="Environment Department">Environment Department</option>
                <option value="Legal Metrology Department">Legal Metrology Department</option>
                <option value="Weights & Measures Department">Weights & Measures Department</option>
                <option value="Agriculture Department">Agriculture Department</option>
                <option value="Animal Husbandry & Dairy Department">Animal Husbandry & Dairy Department</option>
                <option value="Tourism Department">Tourism Department</option>
                <option value="Excise Department">Excise Department</option>
                <option value="Transport Department">Transport Department</option>
                <option value="Mining & Geology Department">Mining & Geology Department</option>
                <option value="Registrar of Companies (MCA)">Registrar of Companies (MCA)</option>
                <option value="MSME / Small Industries Department">MSME / Small Industries Department</option>
              </Select>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Sub-sector (Optional)" placeholder="e.g. Dairy Processing" error={errors.sub_sector?.message} {...register('sub_sector')} />
                <Input label="Business Activity (Optional)" placeholder="e.g. Manufacturing, Assembly" error={errors.business_activity?.message} {...register('business_activity')} />
              </div>

              <Input label="Products / Services (Optional)" placeholder="List core products/services" error={errors.products_services?.message} {...register('products_services')} />
              
              <Select label="Export Business?" error={errors.is_export_business?.message} {...register('is_export_business')}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </Select>
            </div>
          )}

          {/* STEP 3: Financial Details */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <Select label="Enterprise Type" error={errors.enterprise_type?.message} {...register('enterprise_type')}>
                <option value="">Select type...</option>
                <option value="Micro">Micro (Investment &lt; 1Cr, Turnover &lt; 5Cr)</option>
                <option value="Small">Small (Investment &lt; 10Cr, Turnover &lt; 50Cr)</option>
                <option value="Medium">Medium (Investment &lt; 50Cr, Turnover &lt; 250Cr)</option>
              </Select>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Total Investment (₹ Lakhs)" required type="number" step="0.01" min="0" placeholder="80" error={errors.investment_amount?.message} {...register('investment_amount')} />
                <Input label="Annual Turnover (₹ Lakhs)" type="number" step="0.01" min="0" placeholder="150" error={errors.annual_turnover?.message} {...register('annual_turnover')} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Employee Count" required type="number" min="0" placeholder="40" error={errors.employee_count?.message} {...register('employee_count')} />
                <Select label="Existing Loan?" error={errors.existing_loan?.message} {...register('existing_loan')}>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </Select>
              </div>

              <Input label="Required Investment Amount (₹ Lakhs) (For Schemes)" type="number" step="0.01" min="0" placeholder="50" error={errors.required_investment_amount?.message} {...register('required_investment_amount')} />
            </div>
          )}

          {/* STEP 4: Business Location */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select label="State" required error={errors.state?.message} {...register('state')}>
                  {STATE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </Select>
                <Select label="District" placeholder="Select district" error={errors.district?.message} {...register('district')} disabled={!selectedState}>
                  {districtOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="City / Town / Village" placeholder="Enter city" error={errors.city_town_village?.message} {...register('city_town_village')} />
                <Input label="PIN Code" placeholder="000000" error={errors.pin_code?.message} {...register('pin_code')} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select label="Area Type" error={errors.area_type?.message} {...register('area_type')}>
                  <option value="">Select...</option>
                  <option value="Urban">Urban</option>
                  <option value="Rural">Rural</option>
                </Select>
                <Select label="Inside Industrial Area / SEZ?" error={errors.is_sez?.message} {...register('is_sez')}>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </Select>
              </div>
            </div>
          )}

          {/* STEP 5: Owner Details */}
          {step === 5 && (
            <div className="space-y-4 animate-fade-in">
              <Input label="Owner / Applicant Name" placeholder="Full Name" error={errors.owner_name?.message} {...register('owner_name')} />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Age" type="number" min="18" placeholder="35" error={errors.owner_age?.message} {...register('owner_age')} />
                <Select label="Gender" error={errors.owner_gender?.message} {...register('owner_gender')}>
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Transgender">Transgender</option>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select label="Social Category" error={errors.social_category?.message} {...register('social_category')}>
                  <option value="">Select...</option>
                  <option value="General">General</option>
                  <option value="Scheduled Caste (SC)">Scheduled Caste (SC)</option>
                  <option value="Scheduled Tribe (ST)">Scheduled Tribe (ST)</option>
                  <option value="OBC">OBC</option>
                </Select>
                <Select label="Minority Status" error={errors.minority_status?.message} {...register('minority_status')}>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Annual Family Income (₹)" type="number" placeholder="500000" error={errors.family_income?.message} {...register('family_income')} />
                <Select label="Disability Status" error={errors.disability_status?.message} {...register('disability_status')}>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </Select>
              </div>
            </div>
          )}

          <div className="pt-6 flex items-center justify-between border-t border-gray-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1 || isLoading}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all text-sm ${
                step === 1 ? 'opacity-0 cursor-default' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Back
            </button>

            {step < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="bg-[#1a3a6b] dark:bg-blue-600 hover:bg-[#14306a] dark:hover:bg-blue-700 text-white font-semibold py-2.5 px-8 rounded-lg transition-all shadow-xs text-sm"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="bg-emerald-600 dark:bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-500 text-white font-semibold py-2.5 px-8 rounded-lg transition-all shadow-xs disabled:opacity-50 text-sm"
              >
                {isLoading ? 'Saving...' : 'Complete Profile'}
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
};
