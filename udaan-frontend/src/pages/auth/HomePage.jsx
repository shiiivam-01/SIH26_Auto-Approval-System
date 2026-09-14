import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShieldCheck, ClipboardCheck, Settings } from 'lucide-react';
import logo from '../../assets/logo.jpg';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { CrowdCanvas } from '../../components/new-background';

const allRoles = [
  {
    key: 'applicant',
    label: 'Applicant',
    desc: 'Startup founder',
    detail: 'Apply for NOCs, track real-time SLA status, and view your dynamic compliance checklist.',
    icon: User,
    color: 'from-blue-600 to-blue-700',
    ring: 'ring-blue-200 dark:ring-blue-900/50',
    glow: 'shadow-blue-500/50'
  },
  {
    key: 'inspector',
    label: 'Inspector',
    desc: 'Field inspector',
    detail: 'Conduct on-site verifications & upload reports.',
    icon: ClipboardCheck,
    color: 'from-amber-500 to-amber-600',
    ring: 'ring-amber-200 dark:ring-amber-900/50',
    glow: 'shadow-amber-500/50'
  },
  {
    key: 'officer',
    label: 'Officer',
    desc: 'Department officer',
    detail: 'Review applications & process approvals.',
    icon: ShieldCheck,
    color: 'from-emerald-600 to-emerald-700',
    ring: 'ring-emerald-200 dark:ring-emerald-900/50',
    glow: 'shadow-emerald-500/50'
  },
  {
    key: 'admin',
    label: 'Admin',
    desc: 'System admin',
    detail: 'Monitor SLA & manage performance.',
    icon: Settings,
    color: 'from-violet-600 to-violet-700',
    ring: 'ring-violet-200 dark:ring-violet-900/50',
    glow: 'shadow-violet-500/50'
  },
];

export const HomePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [scrollPosition, setScrollPosition] = useState(0);
  const activeIndex = ((scrollPosition % allRoles.length) + allRoles.length) % allRoles.length;
  
  const isScrolling = useRef(false);

  // Handle scroll to rotate the dial
  const handleWheel = (e) => {
    if (isScrolling.current) return;
    isScrolling.current = true;
    
    if (e.deltaY > 0) {
      // Scrolled down -> Next role
      setScrollPosition((prev) => prev + 1);
    } else if (e.deltaY < 0) {
      // Scrolled up -> Previous role
      setScrollPosition((prev) => prev - 1);
    }
    
    // Throttle scrolling to make it feel deliberate like a physical dial
    setTimeout(() => {
      isScrolling.current = false;
    }, 600); 
  };

  const handleRoleAction = (roleKey, type) => {
    // If logged in as another role, reset session to allow clean login into clicked role
    if (user && user.role !== roleKey) {
      logout();
    }
    navigate(type === 'login' ? '/login' : '/register', { state: { role: roleKey } });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200 overflow-hidden relative">
      
      {/* CrowdCanvas Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 dark:opacity-10 overflow-hidden mix-blend-multiply dark:mix-blend-lighten">
        <CrowdCanvas src="/images/peeps/all-peeps.png" rows={15} cols={7} />
      </div>
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between max-w-7xl mx-auto w-full animate-fade-in relative z-20">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="UDAAN" className="w-10 h-10 rounded-lg shadow-sm" />
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">UDAAN</h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-0.5">Unified Digital Approval & Assistance Network</p>
            <button onClick={() => navigate('/about')} className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline self-start mt-0.5">
              About Us
            </button>
          </div>
        </div>
        
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
      <main className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="max-w-7xl w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          
          {/* Left Column - Text */}
          <div className="lg:w-1/2 text-center lg:text-left lg:-translate-y-6 animate-slide-up relative z-10">
            <div className="inline-flex items-center gap-2 bg-blue-50/90 dark:bg-blue-950/80 backdrop-blur-sm text-blue-800 dark:text-blue-300 text-sm font-bold px-4 py-2 rounded-full mb-8 shadow-sm border border-blue-200 dark:border-blue-800">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
              Government Approval Workflow Platform
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-black dark:text-white tracking-tight leading-tight drop-shadow-md">
              Single-window clearance for<br />
              <span className="bg-gradient-to-r from-blue-700 to-teal-600 dark:from-blue-400 dark:to-teal-400 bg-clip-text text-transparent">
                Startups
              </span>
            </h2>
            <p className="mt-6 text-lg sm:text-xl text-slate-800 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-semibold drop-shadow-sm">
              Apply once. Upload documents once. Track every approval in parallel — with live SLA countdowns and risk-based routing.
            </p>
          </div>

          {/* Right Column - Circular Role Dial */}
          <div className="lg:w-1/2 w-full flex justify-center items-center animate-slide-up" style={{ animationDelay: '100ms' }}>
            
            <div 
              className="relative flex items-center justify-center select-none"
              style={{ width: '400px', height: '400px' }}
              onWheel={handleWheel}
            >
              {/* Outer Decorative Rings */}
              <div className="absolute inset-0 rounded-full border-2 border-slate-300 dark:border-slate-700 opacity-80 scale-110 pointer-events-none" />
              <div className="absolute inset-0 rounded-full border-[3px] border-dashed border-slate-300 dark:border-slate-700 opacity-90 pointer-events-none" />
              
              {/* Rotating Track */}
              <div 
                className="absolute inset-0 rounded-full transition-transform duration-[600ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                style={{ transform: `rotate(${-scrollPosition * 90}deg)` }}
              >
                {allRoles.map((role, i) => {
                  const isActive = i === activeIndex;
                  const Icon = role.icon;
                  // Position items in a circle. Radius is approx 170px.
                  return (
                    <div 
                      key={role.key} 
                      className="absolute top-1/2 left-1/2 w-16 h-16 -ml-8 -mt-8"
                      style={{ 
                        transform: `rotate(${i * 90}deg) translateY(-170px)`
                      }}
                    >
                      {/* Counter-rotate the icon container so it stays upright */}
                      <button 
                        onClick={() => {
                          let diff = i - activeIndex;
                          if (diff > 2) diff -= 4;
                          if (diff < -2) diff += 4;
                          setScrollPosition(prev => prev + diff);
                        }}
                        className={`w-full h-full rounded-2xl flex items-center justify-center transition-all duration-[600ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer
                          ${isActive ? `scale-125 ring-4 ${role.ring} ${role.glow} shadow-xl z-20` : 'scale-75 opacity-100 border-2 border-slate-300 dark:border-slate-600 bg-white/95 backdrop-blur-sm shadow-md hover:scale-90 hover:shadow-lg z-10'}`}
                        style={{ transform: `rotate(${(scrollPosition - i) * 90}deg)` }}
                        aria-label={`Select ${role.label} role`}
                      >
                         {isActive ? (
                            <div className={`w-full h-full rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center`}>
                               <Icon className="w-7 h-7 text-white" />
                            </div>
                         ) : (
                            <Icon className="w-7 h-7 text-slate-800 dark:text-slate-300" />
                         )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Center Content: Actions & Description */}
              <div className="absolute z-10 flex flex-col items-center justify-center w-64 h-64 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-full border border-white/60 dark:border-slate-700/60 shadow-2xl transition-all duration-300 pointer-events-auto">
                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-2">
                  Scroll to change
                </p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1 transition-colors duration-300">
                  {allRoles[activeIndex].label}
                </h3>
                <p className="text-xs text-center text-slate-500 dark:text-slate-400 px-6 h-10 mb-5 font-medium">
                  {allRoles[activeIndex].desc}
                </p>
                
                <div className="flex gap-2.5">
                  <button 
                    onClick={() => handleRoleAction(allRoles[activeIndex].key, 'login')}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r ${allRoles[activeIndex].color} shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all`}
                  >
                    LOGIN
                  </button>
                  <button 
                    onClick={() => handleRoleAction(allRoles[activeIndex].key, 'register')}
                    className="px-5 py-2.5 rounded-full text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all"
                  >
                    SIGN UP
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>

      <footer className="px-6 py-4 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800/80 relative z-20">
        © 2026 UDAAN
      </footer>
    </div>
  );
};
