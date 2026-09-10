import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '../../context/AuthContext';
import { ApplicantChatbot } from '../applicant/ApplicantChatbot';

export const MainLayout = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100 dark:bg-[#0b1120] text-slate-900 dark:text-slate-100 transition-colors duration-200 relative">
      {/* Full-height #1a3a6b sidebar on the left */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Right: header + content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 sm:pb-28">
          <div key={location.pathname} className="max-w-7xl mx-auto animate-slide-up">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Persistent Floating AI Chatbot for Applicants */}
      {user?.role === 'applicant' && (
        <ApplicantChatbot applicantName={user?.name || 'Entrepreneur'} />
      )}
    </div>
  );
};
