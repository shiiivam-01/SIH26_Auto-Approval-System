import { useNavigate } from 'react-router-dom';
import { User, ShieldCheck, ClipboardCheck, Settings, ArrowRight } from 'lucide-react';
import logo from '../../assets/logo.jpg';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { useAuth } from '../../context/AuthContext';

const applicantRole = {
  key: 'applicant',
  label: 'Applicant',
  desc: 'Startup founder',
  detail: 'Apply for NOCs, track real-time SLA status, and view your dynamic compliance checklist.',
  icon: User,
  color: 'from-blue-600 to-blue-700',
  ring: 'ring-blue-200 dark:ring-blue-900/50',
};

const smallRoles = [
  {
    key: 'inspector',
    label: 'Inspector',
    desc: 'Field inspector',
    detail: 'Conduct on-site verifications & upload reports.',
    icon: ClipboardCheck,
    color: 'from-amber-500 to-amber-600',
    ring: 'ring-amber-200 dark:ring-amber-900/50',
  },
  {
    key: 'officer',
    label: 'Officer',
    desc: 'Department officer',
    detail: 'Review applications & process approvals.',
    icon: ShieldCheck,
    color: 'from-emerald-600 to-emerald-700',
    ring: 'ring-emerald-200 dark:ring-emerald-900/50',
  },
  {
    key: 'admin',
    label: 'Admin',
    desc: 'System administrator',
    detail: 'Monitor SLA & manage performance.',
    icon: Settings,
    color: 'from-violet-600 to-violet-700',
    ring: 'ring-violet-200 dark:ring-violet-900/50',
  },
];

export const HomePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleRoleClick = (roleKey) => {
    // If logged in as another role, reset session to allow clean login into clicked role
    if (user && user.role !== roleKey) {
      logout();
    }
    navigate('/login', { state: { role: roleKey } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between max-w-7xl mx-auto w-full animate-fade-in">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="UDAAN" className="w-10 h-10 rounded-lg shadow-sm" />
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">UDAAN</h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-0.5">Unified Digital Approval & Assistance Network</p>
          </div>
        </div>
        
        {/* Top right actions */}
        <div className="flex items-center gap-3.5">
          <ThemeToggle />
          {user ? (
            <button
              onClick={() => navigate(`/${user.role}`)}
              className="text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded-xl shadow-xs transition-all duration-200"
            >
              Go to {user.role.toUpperCase()} Dashboard →
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200 hover:translate-x-0.5"
            >
              Sign in →
            </button>
          )}
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-7xl w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          {/* Left Column - Text */}
          <div className="lg:w-1/2 text-center lg:text-left lg:-translate-y-6 animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-sm font-semibold px-4 py-2 rounded-full mb-8 shadow-xs border border-blue-100 dark:border-blue-900">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Government Approval Workflow Platform
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Single-window clearance for<br />
              <span className="bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-400 dark:to-teal-400 bg-clip-text text-transparent">
                Startups
              </span>
            </h2>
            <p className="mt-6 text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Apply once. Upload documents once. Track every approval in parallel — with live SLA countdowns and risk-based routing.
            </p>
          </div>

          {/* Right Column - Role picker (Applicant BIG, others small) */}
          <div className="lg:w-1/2 w-full animate-slide-up" style={{ animationDelay: '100ms' }}>
            <p className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-6 text-center lg:text-left">
              Select Role To Enter Portal
            </p>

            {/* Applicant — Large Card */}
            <button
              onClick={() => handleRoleClick(applicantRole.key)}
              className={`group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 text-left shadow-sm hover:shadow-xl hover:border-transparent hover:ring-4 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 active:scale-[0.98] ${applicantRole.ring} w-full mb-5 cursor-pointer`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${applicantRole.color} flex items-center justify-center shadow-md transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-translate-y-0.5 shrink-0`}>
                  <applicantRole.icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 dark:text-white text-xl mb-1">{applicantRole.label}</p>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{applicantRole.desc}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                    {applicantRole.detail}
                  </p>
                </div>
              </div>
              <ArrowRight className="absolute top-6 right-5 w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-300 ease-out" />
            </button>

            {/* Inspector, Officer, Admin — Small Cards in a row */}
            <div className="grid grid-cols-3 gap-3">
              {smallRoles.map((role) => (
                <button
                  key={role.key}
                  onClick={() => handleRoleClick(role.key)}
                  className={`group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 text-left shadow-sm hover:shadow-xl hover:border-transparent hover:ring-4 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 active:scale-[0.98] ${role.ring} flex flex-col items-center text-center cursor-pointer`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-2.5 shadow-md transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-translate-y-0.5`}>
                    <role.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm mb-0.5">{role.label}</p>
                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-snug">{role.desc}</p>
                  <ArrowRight className="absolute top-3 right-3 w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all duration-300 ease-out" />
                </button>
              ))}
            </div>
          </div>

        </div>
      </main>

      <footer className="px-6 py-4 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800/80">
        © 2026 UDAAN
      </footer>
    </div>
  );
};
