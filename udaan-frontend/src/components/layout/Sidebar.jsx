import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, X, CheckSquare, UploadCloud,
  ShieldCheck, ClipboardCheck, BarChart3, MessageSquareWarning, Bell, Settings, User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';
import logo from '../../assets/logo.jpg';

const roleMenus = {
  applicant: [
    { i18nKey: 'sidebar.dashboard', path: '/applicant', icon: LayoutDashboard },
    { i18nKey: 'sidebar.documents', path: '/applicant/documents', icon: UploadCloud },
    { i18nKey: 'sidebar.applications', path: '/applicant/applications', icon: CheckSquare },
    { i18nKey: 'sidebar.inspections', path: '/applicant/inspections', icon: ClipboardCheck },
    { i18nKey: 'sidebar.schemes', path: '/applicant/schemes', icon: ShieldCheck },
    { i18nKey: 'sidebar.grievances', path: '/applicant/grievances', icon: MessageSquareWarning },
    { i18nKey: 'sidebar.notifications', path: '/applicant/notifications', icon: Bell },
    { i18nKey: 'sidebar.profile', path: '/applicant/profile', icon: User },
  ],
  officer: [
    { i18nKey: 'sidebar.dashboard', path: '/officer', icon: LayoutDashboard },
    { i18nKey: 'sidebar.applications', path: '/officer/reviews', icon: CheckSquare },
    { i18nKey: 'sidebar.grievances', path: '/officer/grievances', icon: MessageSquareWarning },
    { i18nKey: 'sidebar.notifications', path: '/officer/notifications', icon: Bell },
  ],
  inspector: [
    { i18nKey: 'sidebar.dashboard', path: '/inspector', icon: LayoutDashboard },
    { i18nKey: 'sidebar.inspections', path: '/inspector/inspections', icon: ClipboardCheck },
    { i18nKey: 'sidebar.notifications', path: '/inspector/notifications', icon: Bell },
  ],
  admin: [
    { i18nKey: 'sidebar.dashboard', path: '/admin', icon: LayoutDashboard },
    { i18nKey: 'sidebar.dashboard', path: '/admin/analytics', icon: BarChart3 },
    { i18nKey: 'sidebar.inspections', path: '/admin/inspections', icon: ClipboardCheck },
    { i18nKey: 'sidebar.grievances', path: '/admin/grievances', icon: MessageSquareWarning },
    { i18nKey: 'sidebar.notifications', path: '/admin/notifications', icon: Bell },
    { i18nKey: 'header.systemSettings', path: '/admin/settings', icon: Settings },
  ],
};

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const menus = roleMenus[user?.role] || [];
  const { t } = useTranslation();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Main navigation"
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-[#1a3a6b] text-white flex flex-col shrink-0 h-full transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:translate-x-0 lg:static lg:inset-0 shadow-lg',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* UDAAN branding — top */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
              <img
                src={logo}
                alt="UDAAN logo"
                className="w-7 h-7 object-contain"
              />
            </div>
            <span className="text-white font-extrabold text-2xl tracking-widest leading-none">
              UDAAN
            </span>
          </Link>
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="lg:hidden p-1.5 text-blue-200 hover:text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav with smooth spring transitions */}
        <nav className="flex-1 pt-3 pb-6 overflow-y-auto space-y-0.5">
          {menus.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => {
                // If on /setup onboarding page, keep Dashboard highlighted, never Profile
                const isItemActive = isActive || (item.path === `/${user?.role}` && window.location.pathname.includes('/setup'));
                return cn(
                  'w-full flex items-center gap-3 px-5 py-3 text-sm transition-all duration-200 ease-out text-left select-none group',
                  isItemActive
                    ? 'bg-white/15 text-white font-semibold border-l-4 border-white pl-4'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white hover:translate-x-1'
                );
              }}
              end
            >
              <item.icon className="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
              <span>{item.i18nKey ? t(item.i18nKey) : item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Secure & Compliant Verification Badge */}
        <div className="p-3.5 mx-3 mb-4 rounded-xl bg-white/10 border border-white/10 text-xs">
          <div className="flex items-center gap-2 text-white font-semibold mb-1">
            <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Secure & Compliant</span>
          </div>
          <p className="text-[11px] text-blue-100/90 leading-tight">
            Data protected with encrypted communication and role-based access.
          </p>
        </div>
      </aside>
    </>
  );
};
