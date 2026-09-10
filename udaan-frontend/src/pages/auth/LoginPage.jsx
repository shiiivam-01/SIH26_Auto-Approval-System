import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Eye, EyeOff, ChevronRight, UserPlus, X } from 'lucide-react';
import logo from '../../assets/logo.jpg';
import { loginSchema } from '../../schemas/authSchemas';
import { login, googleLogin } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';

import { extractApiError } from '../../utils/errors';
import { Button, Input } from '../../components/common/ui';
import { ThemeToggle } from '../../components/common/ThemeToggle';

// --- Stored accounts utility (localStorage) ---
const ACCOUNTS_KEY = 'udaan_google_accounts';
// One-time cleanup: purge stale/test accounts
(() => {
  try {
    const raw = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
    const cleaned = raw.filter(a => !['aman12@gmail.com'].includes(a.email));
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(cleaned));
  } catch {}
})();
function getSavedAccounts() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
  } catch { return []; }
}
function saveAccount(email, name) {
  const accounts = getSavedAccounts().filter(a => a.email !== email);
  accounts.unshift({ email, name: name || email.split('@')[0], lastLogin: Date.now() });
  // Keep only the latest 5
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts.slice(0, 5)));
}

const roleDefaults = {
  applicant: {
    email: 'test@gmail.com',
    password: '',
    name: 'Aarav Sharma',
    role: 'applicant',
    department: null,
  },
  officer: {
    email: 'officer@gmail.com',
    password: 'officer12345',
    name: 'Department Officer',
    role: 'officer',
    department: 'Fire Department',
  },
  inspector: {
    email: 'inspector@gmail.com',
    password: 'inspector12345',
    name: 'Field Inspector',
    role: 'inspector',
    department: 'Fire Department',
  },
  admin: {
    email: 'admin@gmail.com',
    password: 'admin12345',
    name: 'System Admin',
    role: 'admin',
    department: null,
  },
};

// Google logo SVG component
const GoogleLogo = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

// Avatar circle with initial
const AvatarCircle = ({ name, color }) => {
  const colors = [
    'bg-blue-600', 'bg-red-500', 'bg-green-600', 'bg-purple-600',
    'bg-amber-600', 'bg-teal-600', 'bg-pink-600', 'bg-indigo-600',
  ];
  const initial = (name || '?')[0].toUpperCase();
  const bgColor = color || colors[initial.charCodeAt(0) % colors.length];
  return (
    <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center text-white font-bold text-base shrink-0`}>
      {initial}
    </div>
  );
};

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: loginAuth, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Read the chosen role if selected from the Home page (defaults to applicant)
  const targetRole = location.state?.role && roleDefaults[location.state.role]
    ? location.state.role
    : 'applicant';

  const defaultRoleConfig = roleDefaults[targetRole];

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: defaultRoleConfig.email,
      password: defaultRoleConfig.password,
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      logout();
      const res = await login(data);
      const effectiveRole = res.user.role || 'applicant';
      const userPayload = {
        ...res.user,
        role: effectiveRole,
        department: data.department || res.user.department || null,
      };

      // Save to Google accounts list for the popup
      saveAccount(res.user.email, res.user.name);

      loginAuth(res.token, userPayload);
      toast.success(`Logged in as ${effectiveRole.toUpperCase()}: ${userPayload.name}`);
      navigate(`/${effectiveRole}`, { replace: true });
    } catch (error) {
      toast.error(extractApiError(error) || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Google OAuth simulation ---
  const [googleOpen, setGoogleOpen] = useState(false);
  const [googleStep, setGoogleStep] = useState('choose'); // 'choose' | 'email' | 'password'
  const [googleEmail, setGoogleEmail] = useState('');
  const [googlePassword, setGooglePassword] = useState('');
  const [googleError, setGoogleError] = useState('');
  const [showGooglePwd, setShowGooglePwd] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState([]);

  const openGooglePopup = () => {
    setSavedAccounts(getSavedAccounts());
    setGoogleStep('choose');
    setGoogleEmail('');
    setGooglePassword('');
    setGoogleError('');
    setShowGooglePwd(false);
    setGoogleOpen(true);
  };

  const handleAccountClick = (account) => {
    setGoogleEmail(account.email);
    setGooglePassword('');
    setGoogleError('');
    setGoogleStep('password');
  };

  const handleUseAnother = () => {
    setGoogleEmail('');
    setGooglePassword('');
    setGoogleError('');
    setGoogleStep('email');
  };

  const handleEmailNext = (e) => {
    e.preventDefault();
    if (!googleEmail.trim() || !googleEmail.includes('@')) {
      setGoogleError('Enter a valid email address');
      return;
    }
    setGoogleError('');
    setGoogleStep('password');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!googlePassword.trim()) {
      setGoogleError('Enter your password');
      return;
    }
    setGoogleError('');
    try {
      setIsLoading(true);
      logout();
      const res = await googleLogin({
        email: googleEmail.trim(),
        password: googlePassword.trim(),
        name: googleEmail.split('@')[0],
        targetRole,
      });

      const effectiveRole = res.user.role || 'applicant';
      const userPayload = {
        ...res.user,
        role: effectiveRole,
        department: res.user.department || null,
      };

      saveAccount(res.user.email, res.user.name);

      loginAuth(res.token, userPayload);
      setGoogleOpen(false);
      toast.success(`Welcome! Logged in as ${effectiveRole.toUpperCase()}`);
      navigate(`/${effectiveRole}`, { replace: true });
    } catch (err) {
      setGoogleError(extractApiError(err) || 'Authentication failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 relative transition-colors duration-200">
      {/* Top right theme toggle */}
      <div className="absolute top-5 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 animate-slide-up">
        {/* Header */}
        <div className="flex flex-col items-center mb-6 relative">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="absolute left-0 top-1 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-2.5 mb-2">
            <img src={logo} alt="UDAAN logo" className="w-9 h-9 rounded-lg object-contain shadow-2xs" />
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">UDAAN</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Sign In</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enter your credentials to access your portal</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              aria-label="Toggle password"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {(targetRole === 'officer' || targetRole === 'inspector') && (
            <div className="animate-fade-in">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Department</label>
              <select
                {...register('department')}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="Food Safety and Standards Authority of India (FSSAI)">Food Safety and Standards Authority of India (FSSAI)</option>
                <option value="State FDA & Central Drugs Standard Control Organisation (CDSCO)">State FDA & Central Drugs Standard Control Organisation (CDSCO)</option>
                <option value="Urban Administration & Municipal Corporation">Urban Administration & Municipal Corporation</option>
              </select>
            </div>
          )}

          <Button
            type="submit"
            className="w-full mt-2"
            isLoading={isLoading}
          >
            Sign In
          </Button>
        </form>

        {/* OAuth 2.0 Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-medium">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google OAuth Button */}
        <div className="flex flex-col items-center gap-2.5">
          <button
            type="button"
            onClick={openGooglePopup}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-xs cursor-pointer active:scale-[0.99]"
          >
            <GoogleLogo className="w-5 h-5" />
            <span>Sign in with Google</span>
          </button>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Need an applicant account?{' '}
          <Link to="/register" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
            Register Business
          </Link>
        </div>
      </div>

      {/* ==================== GOOGLE OAUTH POPUP SIMULATION ==================== */}
      {googleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px] animate-[fadeIn_150ms_ease-out]"
            onClick={() => !isLoading && setGoogleOpen(false)}
          />

          {/* Google popup card */}
          <div className="relative z-10 w-full max-w-[420px] bg-white rounded-2xl shadow-2xl overflow-hidden animate-[scaleIn_200ms_ease-out]"
            style={{ fontFamily: "'Google Sans', 'Roboto', 'Arial', sans-serif" }}
          >
            {/* Google header bar */}
            <div className="px-8 pt-8 pb-2">
              <GoogleLogo className="w-7 h-7 mb-5" />

              {/* ---- STEP: Choose an account ---- */}
              {googleStep === 'choose' && (
                <>
                  <h1 className="text-[22px] font-normal text-[#202124] tracking-[-0.01em]">Choose an account</h1>
                  <p className="text-sm text-[#5f6368] mt-1 mb-1">
                    to continue to <strong className="text-[#202124] font-medium">UDAAN</strong>
                  </p>
                </>
              )}

              {/* ---- STEP: Enter email ---- */}
              {googleStep === 'email' && (
                <>
                  <h1 className="text-[22px] font-normal text-[#202124] tracking-[-0.01em]">Sign in</h1>
                  <p className="text-sm text-[#5f6368] mt-1">
                    to continue to <strong className="text-[#202124] font-medium">UDAAN</strong>
                  </p>
                </>
              )}

              {/* ---- STEP: Enter password ---- */}
              {googleStep === 'password' && (
                <>
                  <h1 className="text-[22px] font-normal text-[#202124] tracking-[-0.01em]">Welcome</h1>
                  <div className="flex items-center gap-2 mt-3 mb-1 px-3 py-1.5 border border-[#dadce0] rounded-full w-fit cursor-pointer hover:bg-[#f1f3f4] transition-colors"
                    onClick={() => setGoogleStep('email')}
                  >
                    <AvatarCircle name={googleEmail} />
                    <span className="text-sm text-[#3c4043] font-medium pr-1">{googleEmail}</span>
                    <svg className="w-4 h-4 text-[#5f6368]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 10l5 5 5-5H7z" />
                    </svg>
                  </div>
                </>
              )}
            </div>

            {/* Error */}
            {googleError && (
              <div className="mx-8 mt-2 text-sm text-red-600 flex items-start gap-2">
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm0-4V7h2v6h-2z" />
                </svg>
                <span>{googleError}</span>
              </div>
            )}

            {/* Content area */}
            <div className="px-0 pt-2 pb-2">

              {/* ---- STEP: Account list ---- */}
              {googleStep === 'choose' && (
                <div className="border-t border-b border-[#e8eaed] my-3">
                  {savedAccounts.map((account, i) => (
                    <button
                      key={account.email}
                      type="button"
                      onClick={() => handleAccountClick(account)}
                      className="w-full flex items-center gap-4 px-8 py-3 hover:bg-[#f7f8f8] transition-colors text-left cursor-pointer"
                    >
                      <AvatarCircle name={account.name} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#202124] truncate">{account.name}</p>
                        <p className="text-xs text-[#5f6368] truncate">{account.email}</p>
                      </div>
                    </button>
                  ))}

                  {/* Use another account */}
                  <button
                    type="button"
                    onClick={handleUseAnother}
                    className="w-full flex items-center gap-4 px-8 py-3 hover:bg-[#f7f8f8] transition-colors text-left cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full border-2 border-[#dadce0] flex items-center justify-center text-[#5f6368]">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-medium text-[#202124]">Use another account</p>
                  </button>
                </div>
              )}

              {/* ---- STEP: Email input ---- */}
              {googleStep === 'email' && (
                <form onSubmit={handleEmailNext} className="px-8 pt-4 pb-2">
                  <div className="mb-6">
                    <div className="relative">
                      <input
                        type="email"
                        autoFocus
                        value={googleEmail}
                        onChange={(e) => { setGoogleEmail(e.target.value); setGoogleError(''); }}
                        placeholder=" "
                        className="peer w-full px-4 pt-5 pb-2 text-[15px] text-[#202124] border border-[#dadce0] rounded-[4px] focus:outline-none focus:border-[#1a73e8] focus:border-2 focus:ring-0 transition-colors bg-white"
                      />
                      <label className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#5f6368] pointer-events-none transition-all duration-150 peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#1a73e8] peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs">
                        Email or phone
                      </label>
                    </div>
                  </div>

                  <p className="text-sm text-[#5f6368] mb-6 leading-relaxed">
                    Not your computer? Use Guest mode to sign in privately.{' '}
                    <a href="#" className="text-[#1a73e8] font-medium hover:underline" onClick={e => e.preventDefault()}>Learn more about using Guest mode</a>
                  </p>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => { setGoogleStep('choose'); setGoogleError(''); }}
                      className="text-sm font-medium text-[#1a73e8] hover:bg-[#f0f4ff] px-4 py-2 rounded-[4px] transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="bg-[#1a73e8] hover:bg-[#1765cc] text-white font-medium text-sm px-6 py-2.5 rounded-[4px] transition-colors cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </form>
              )}

              {/* ---- STEP: Password input ---- */}
              {googleStep === 'password' && (
                <form onSubmit={handlePasswordSubmit} className="px-8 pt-4 pb-2">
                  <div className="mb-4">
                    <div className="relative">
                      <input
                        type={showGooglePwd ? 'text' : 'password'}
                        autoFocus
                        value={googlePassword}
                        onChange={(e) => { setGooglePassword(e.target.value); setGoogleError(''); }}
                        placeholder=" "
                        className="peer w-full px-4 pt-5 pb-2 text-[15px] text-[#202124] border border-[#dadce0] rounded-[4px] focus:outline-none focus:border-[#1a73e8] focus:border-2 focus:ring-0 transition-colors bg-white"
                      />
                      <label className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#5f6368] pointer-events-none transition-all duration-150 peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#1a73e8] peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs">
                        Enter your password
                      </label>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-sm text-[#202124] mb-6 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showGooglePwd}
                      onChange={() => setShowGooglePwd(!showGooglePwd)}
                      className="w-[18px] h-[18px] accent-[#1a73e8] cursor-pointer"
                    />
                    Show password
                  </label>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => { setGoogleStep('email'); setGoogleError(''); setGooglePassword(''); }}
                      className="text-sm font-medium text-[#1a73e8] hover:bg-[#f0f4ff] px-4 py-2 rounded-[4px] transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-[#1a73e8] hover:bg-[#1765cc] disabled:opacity-60 text-white font-medium text-sm px-6 py-2.5 rounded-[4px] transition-colors cursor-pointer flex items-center gap-2"
                    >
                      {isLoading && (
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      )}
                      Next
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-4 flex items-center justify-between text-xs text-[#5f6368] border-t border-[#e8eaed]">
              <span>English (United States)</span>
              <div className="flex items-center gap-4">
                <span className="hover:text-[#202124] cursor-pointer">Help</span>
                <span className="hover:text-[#202124] cursor-pointer">Privacy</span>
                <span className="hover:text-[#202124] cursor-pointer">Terms</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
    </div>
  );
};
