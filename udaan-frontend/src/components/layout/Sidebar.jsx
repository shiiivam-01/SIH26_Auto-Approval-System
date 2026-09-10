import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, X, CheckSquare, UploadCloud,
  ShieldCheck, ClipboardCheck, BarChart3, MessageSquareWarning, Bell, Settings, User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';
import logo from '../../assets/logo.jpg';

const roleMenus = {
  applicant: [
    { name: 'Dashboard', path: '/applicant', icon: LayoutDashboard },
    { name: 'Documents', path: '/applicant/documents', icon: UploadCloud },
    { name: 'My Applications', path: '/applicant/applications', icon: CheckSquare },
    { name: 'Inspections', path: '/applicant/inspections', icon: ClipboardCheck },
    { name: 'Schemes', path: '/applicant/schemes', icon: ShieldCheck },
    { name: 'Grievances', path: '/applicant/grievances', icon: MessageSquareWarning },
    { name: 'Notifications', path: '/applicant/notifications', icon: Bell },
    { name: 'Profile', path: '/applicant/profile', icon: User },
  ],
  officer: [
    { name: 'Dashboard', path: '/officer', icon: LayoutDashboard },
    { name: 'Application Review', path: '/officer/reviews', icon: CheckSquare },
    { name: 'Grievances', path: '/officer/grievances', icon: MessageSquareWarning },
    { name: 'Notifications', path: '/officer/notifications', icon: Bell },
  ],
  inspector: [
    { name: 'Dashboard', path: '/inspector', icon: LayoutDashboard },
    { name: 'My Inspections', path: '/inspector/inspections', icon: ClipboardCheck },
    { name: 'Notifications', path: '/inspector/notifications', icon: Bell },
  ],
  admin: [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Inspections', path: '/admin/inspections', icon: ClipboardCheck },
    { name: 'Grievances', path: '/admin/grievances', icon: MessageSquareWarning },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ],
};

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const menus = roleMenus[user?.role] || [];

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
          <div className="flex items-center gap-2.5">
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
          </div>
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
              <span>{item.name}</span>
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
