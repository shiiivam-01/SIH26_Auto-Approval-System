import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import logo from '../../assets/logo.jpg';
import { registerSchema } from '../../schemas/authSchemas';
import { register as registerApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { extractApiError } from '../../utils/errors';
import { Button, Input } from '../../components/common/ui';
import { GoogleLogin } from '@react-oauth/google';
import { googleLogin } from '../../api/authApi';

export const RegisterPage = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login: loginAuth, logout } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      logout();
      const res = await googleLogin({
        credential: credentialResponse.credential,
        targetRole: 'applicant',
      });

      const effectiveRole = res.user.role || 'applicant';
      const userPayload = {
        ...res.user,
        role: effectiveRole,
        department: res.user.department || null,
      };

      loginAuth(res.token, userPayload);
      toast.success('Registration successful with Google!');
      navigate(`/${effectiveRole}`, { replace: true });
    } catch (err) {
      toast.error(extractApiError(err) || 'Google registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google registration failed. Please try again.');
  };

  const passwordValue = watch('password') || '';
  const checks = {
    length: passwordValue.length >= 8,
    upper: /[A-Z]/.test(passwordValue),
    lower: /[a-z]/.test(passwordValue),
    number: /[0-9]/.test(passwordValue),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(passwordValue),
  };
  const passedCount = Object.values(checks).filter(Boolean).length;
  const strengthColor = passedCount <= 2 ? 'bg-red-500' : passedCount <= 4 ? 'bg-amber-500' : 'bg-emerald-500';
  const strengthLabel = passedCount <= 2 ? 'Weak' : passedCount <= 4 ? 'Moderate' : 'Strong';

  const roleValue = watch('role') || 'applicant';

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const res = await registerApi(data);
      // For prototype: mock the role and department since backend forces applicant
      if (data.role === 'officer' || data.role === 'inspector') {
        res.user.role = data.role;
        res.user.department = data.department;
      }
      
      loginAuth(res.token, res.user);
      toast.success('Registration successful');
      navigate(`/${res.user.role}`);
    } catch (error) {
      toast.error(extractApiError(error) || 'Registration failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-neutral p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center space-x-2 text-primary-900 mb-2">
            <img src={logo} alt="UDAAN logo" className="w-8 h-8 rounded" />
            <span className="text-2xl font-bold tracking-tight">UDAAN</span>
          </div>
          <h1 className="text-xl font-semibold text-slate-800">Create an Account</h1>
          <p className="text-sm text-slate-500">Register for the UDAAN portal</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            placeholder="Ravi Kumar"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Date of Birth"
            type="date"
            error={errors.date_of_birth?.message}
            {...register('date_of_birth')}
          />
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
            <select
              {...register('role')}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="applicant">Applicant (Business Owner)</option>
              <option value="officer">Department Officer</option>
              <option value="inspector">Field Inspector</option>
            </select>
            {errors.role?.message && <p className="mt-1.5 text-sm text-red-600">{errors.role.message}</p>}
          </div>

          {(roleValue === 'officer' || roleValue === 'inspector') && (
            <div className="animate-fade-in">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Department</label>
              <select
                {...register('department')}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select your department...</option>
                <option value="Food Safety and Standards Authority of India (FSSAI)">Food Safety and Standards Authority of India (FSSAI)</option>
                <option value="State FDA & Central Drugs Standard Control Organisation (CDSCO)">State FDA & Central Drugs Standard Control Organisation (CDSCO)</option>
                <option value="Urban Administration & Municipal Corporation">Urban Administration & Municipal Corporation</option>
              </select>
              {errors.department?.message && <p className="mt-1.5 text-sm text-red-600">{errors.department.message}</p>}
            </div>
          )}
          <div>
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            {/* Live Password Security Meter */}
            {passwordValue && (
              <div className="mt-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-600">
                  <span>Security Strength:</span>
                  <span className={passedCount <= 2 ? 'text-red-600 font-bold' : passedCount <= 4 ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                    {strengthLabel}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strengthColor}`}
                    style={{ width: `${(passedCount / 5) * 100}%` }}
                  />
                </div>
                {/* Criteria */}
                <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-500 pt-1">
                  <span className={checks.length ? 'text-emerald-700 font-medium' : ''}>
                    {checks.length ? '✓' : '○'} 8+ characters
                  </span>
                  <span className={checks.upper ? 'text-emerald-700 font-medium' : ''}>
                    {checks.upper ? '✓' : '○'} Uppercase (A-Z)
                  </span>
                  <span className={checks.lower ? 'text-emerald-700 font-medium' : ''}>
                    {checks.lower ? '✓' : '○'} Lowercase (a-z)
                  </span>
                  <span className={checks.number ? 'text-emerald-700 font-medium' : ''}>
                    {checks.number ? '✓' : '○'} Number (0-9)
                  </span>
                  <span className={checks.special ? 'text-emerald-700 font-medium col-span-2' : 'col-span-2'}>
                    {checks.special ? '✓' : '○'} Special character (!@#$%^&*)
                  </span>
                </div>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Register
          </Button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-slate-400 font-medium">
              Or register with
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2.5">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            theme="outline"
            size="large"
            width="100%"
          />
        </div>

        <div className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};
