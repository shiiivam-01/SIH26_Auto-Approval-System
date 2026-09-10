import { useState, useRef, useEffect } from 'react';
import { Menu, LogOut, User, ChevronDown, UserCog, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../common/ThemeToggle';

export const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const timeoutRef = useRef(null);

  const [isHindi, setIsHindi] = useState(() => {
    return document.cookie.includes('googtrans=/en/hi');
  });

  const toggleLanguage = () => {
    if (isHindi) {
      document.cookie = 'googtrans=/en/en; path=/';
      document.cookie = 'googtrans=/en/en; domain=' + window.location.hostname + '; path=/';
      setIsHindi(false);
      window.location.reload();
    } else {
      document.cookie = 'googtrans=/en/hi; path=/';
      document.cookie = 'googtrans=/en/hi; domain=' + window.location.hostname + '; path=/';
      setIsHindi(true);
      window.location.reload();
    }
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsMenuOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsMenuOpen(false);
    }, 150); // slight buffer so cursor doesn't close menu moving between trigger and popup
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
    navigate('/login');
  };

  const handleEditProfile = () => {
    setIsMenuOpen(false);
    if (user?.role === 'applicant') {
      navigate('/applicant/profile');
    } else if (user?.role === 'admin') {
      navigate('/admin/settings');
    } else {
      navigate(`/${user?.role || 'applicant'}`);
    }
  };

  const displayName = (() => {
    if (!user?.name) return 'Applicant';
    if (user.name.includes('@')) {
      return user.name.split('@')[0].split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
    if (user.name.includes('.') && !user.name.includes(' ')) {
      return user.name.split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
    return user.name;
  })();

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('') || 'A';

  return (
    <header className="h-16 shrink-0 relative bg-white dark:bg-slate-900 border-b border-slate-200/70 dark:border-slate-800 shadow-2xs z-30 transition-colors duration-200">
      {/* SVG curve — blue fills left, curves inward on the right edge */}
      <div className="absolute inset-y-0 left-0 w-[310px] h-full overflow-hidden pointer-events-none">
        <svg
          className="h-full w-full"
          viewBox="0 0 310 64"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0 0 H256 Q228 32 256 64 H0 Z" fill="#1a3a6b" />
        </svg>
      </div>

      {/* Mobile hamburger — positioned over the SVG curve */}
      <button
        onClick={onMenuClick}
        aria-label="Open sidebar"
        className="lg:hidden absolute inset-y-0 left-0 flex items-center px-4 text-white z-10 focus:outline-none focus:ring-2 focus:ring-white cursor-pointer"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Far Right: User Profile stacked with Mode Toggle directly below it */}
      <div className="absolute inset-y-0 right-0 flex items-center px-5 sm:px-6 z-20">
        <div className="flex flex-col items-end justify-center gap-1">
          
          {/* User trigger with hover & click sub-tab dropdown */}
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 px-2 py-0.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all duration-200 cursor-pointer group select-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              aria-expanded={isMenuOpen}
              aria-haspopup="true"
            >
              <div className="w-6 h-6 rounded-full bg-[#1a3a6b] dark:bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                {initials}
              </div>
              
              <div className="flex items-center gap-1.5 text-left">
                <span className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-100 tracking-tight">
                  {displayName}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  ({user?.role || 'applicant'})
                </span>
              </div>

              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 group-hover:text-slate-600 dark:group-hover:text-slate-300 ${
                  isMenuOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
                }`}
              />
            </button>

            {/* Hover Sub-tab Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 top-full pt-1.5 z-50 animate-scale-in">
                <div className="w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-800 p-1.5 backdrop-blur-xl transition-all">
                  {/* User info header inside popup */}
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {user?.name || 'Account'}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 capitalize flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                      {user?.role || 'applicant'} account
                    </p>
                  </div>

                  {/* Action items */}
                  <div className="py-1 space-y-0.5">
                    <button
                      type="button"
                      onClick={handleEditProfile}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800 rounded-xl transition-all duration-150 cursor-pointer group text-left"
                    >
                      <UserCog className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                      <span>{user?.role === 'admin' ? 'System Settings' : 'Edit Profile'}</span>
                    </button>

                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-950/40 rounded-xl transition-all duration-150 cursor-pointer group text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-500 group-hover:translate-x-0.5 transition-transform" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Language toggle placed directly below user next to ThemeToggle */}
          <div className="flex items-center pr-1 gap-2 mt-1">
            <button
              onClick={toggleLanguage}
              className="notranslate text-[11px] font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-xs"
            >
              {isHindi ? 'Change Language' : 'भाषा बदलें'}
            </button>
            <ThemeToggle size="sm" />
          </div>

        </div>
      </div>
    </header>
  );
};
