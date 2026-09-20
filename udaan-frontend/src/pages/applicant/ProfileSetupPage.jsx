import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import logo from '../../assets/logo.jpg';
import { profileSchema } from '../../schemas/profileSchema';
import { createProfile } from '../../api/applicantApi';
import { extractApiError } from '../../utils/errors';
import { Input, Select } from '../../components/common/ui';
import { SECTOR_OPTIONS, STAGE_OPTIONS, BUSINESS_TYPE_OPTIONS } from '../../constants/statusCatalog';
import { INDIA_STATES_DISTRICTS, STATE_OPTIONS } from '../../constants/indiaStatesDistricts';

export const ProfileSetupPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { stage: 'pre_establishment', state: 'Madhya Pradesh', district: '', business_type: '' },
  });

  const selectedState = watch('state');
  const districtOptions = selectedState && INDIA_STATES_DISTRICTS[selectedState]
    ? INDIA_STATES_DISTRICTS[selectedState].map(d => ({ value: d, label: d }))
    : [];

  useEffect(() => {
    setValue('district', '');
  }, [selectedState, setValue]);

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
      toast.success('Profile created — approval checklist generated!');
      window.location.assign('/applicant');
    } catch (error) {
      if (error?.response?.status === 401) {
        toast.error('Your session expired. Please sign in to generate your checklist.');
        setTimeout(() => {
          window.location.assign('/login');
        }, 1200);
      } else {
        toast.error(extractApiError(error) || 'Failed to create profile and generate checklist');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-2 sm:py-6 animate-slide-up">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-8 transition-colors duration-200">
        
        {/* Card header matching Figma reference */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded bg-[#1a3a6b]/10 dark:bg-blue-900/30 flex items-center justify-center overflow-hidden">
            <img
              src={logo}
              alt="UDAAN logo"
              className="w-6 h-6 object-contain"
            />
          </div>
          <span className="font-bold text-[#1a3a6b] dark:text-blue-400 text-lg tracking-wide">UDAAN</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-3 mb-1">
          Set up your business profile
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-7">
          This generates your{' '}
          <strong className="text-blue-700 dark:text-blue-400 font-semibold">dynamic approval checklist</strong>
          {' '}— only approvals that genuinely apply to your sector, state, stage and investment scale.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Business Name"
            required
            placeholder="Ravi Foods Pvt Ltd"
            error={errors.business_name?.message}
            {...register('business_name')}
          />

          <Input
            label="Business Type"
            required
            placeholder="e.g. Retail, Manufacturing, Services"
            error={errors.business_type?.message}
            {...register('business_type')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Department"
              required
              placeholder="Select department"
              error={errors.department?.message}
              {...register('department')}
            >
              <option value="Food Safety and Standards Authority of India (FSSAI)">Food Safety and Standards Authority of India (FSSAI)</option>
              <option value="State FDA & Central Drugs Standard Control Organisation (CDSCO)">State FDA & Central Drugs Standard Control Organisation (CDSCO)</option>
              <option value="Urban Administration & Municipal Corporation">Urban Administration & Municipal Corporation</option>
            </Select>

            <Select
              label="State"
              required
              error={errors.state?.message}
              {...register('state')}
            >
              {STATE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="District"
              placeholder="Select district"
              error={errors.district?.message}
              {...register('district')}
              disabled={!selectedState}
            >
              {districtOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>

            <Input
              label="NIC Code (optional)"
              placeholder="10711"
              error={errors.nic_code?.message}
              {...register('nic_code')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Total Investment (₹ Lakhs)"
              required
              type="number"
              step="0.01"
              min="0"
              placeholder="80"
              error={errors.investment_amount?.message}
              {...register('investment_amount')}
            />

            <Input
              label="Employee Count"
              required
              type="number"
              min="0"
              placeholder="40"
              error={errors.employee_count?.message}
              {...register('employee_count')}
            />
          </div>

          <Select
            label="Business Stage"
            required
            error={errors.stage?.message}
            {...register('stage')}>
            {STAGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1a3a6b] dark:bg-blue-600 hover:bg-[#14306a] dark:hover:bg-blue-700 active:scale-[0.99] text-white font-semibold py-2.5 rounded-lg transition-all duration-200 text-sm shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? 'Generating…' : 'Generate My Approval Checklist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
