import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HomePage } from '../pages/auth/HomePage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { AccessDeniedPage } from '../pages/auth/AccessDeniedPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { AboutPage } from '../pages/AboutPage';
import { MainLayout } from '../components/layout/MainLayout';
export const ProtectedRoute = () => {
  const { user, token } = useAuth();
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export const RoleProtectedRoute = ({ allowedRoles }) => {
  const { user, token } = useAuth();
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }
  return <Outlet />;
};

// Dashboards
import { ApplicantDashboard } from '../pages/applicant/ApplicantDashboard';
import { ProfileSetupPage } from '../pages/applicant/ProfileSetupPage';
import { ProfilePage } from '../pages/applicant/ProfilePage';
import { DocumentsPage } from '../pages/applicant/DocumentsPage';
import { ApplicationsPage } from '../pages/applicant/ApplicationsPage';
import { InspectionsPage } from '../pages/applicant/InspectionsPage';
import { SchemesPage } from '../pages/applicant/SchemesPage';
import { GrievancesPage } from '../pages/applicant/GrievancesPage';
import { NotificationsPage } from '../pages/applicant/NotificationsPage';
import { OfficerReviewsPage } from '../pages/officer/OfficerReviewsPage';
import { OfficerGrievancesPage } from '../pages/officer/OfficerGrievancesPage';
import { InspectorInspectionsPage } from '../pages/inspector/InspectorInspectionsPage';
import { AdminAnalyticsPage } from '../pages/admin/AdminAnalyticsPage';
import { AdminInspectionsPage } from '../pages/admin/AdminInspectionsPage';
import { AdminGrievancesPage } from '../pages/admin/AdminGrievancesPage';
import { OfficerDashboard } from '../pages/officer/OfficerDashboard';
import { InspectorDashboard } from '../pages/inspector/InspectorDashboard';
import { AdminDashboard } from '../pages/admin/AdminDashboard';

export const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes - allow accessing HomePage and LoginPage freely */}
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/403" element={<AccessDeniedPage />} />

      {/* Protected Routes with MainLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>

          {/* Applicant Routes */}
          <Route element={<RoleProtectedRoute allowedRoles={['applicant']} />}>
            <Route path="/applicant" element={<ApplicantDashboard />} />
            <Route path="/applicant/profile" element={<ProfilePage />} />
            <Route path="/applicant/profile/setup" element={<ProfileSetupPage />} />
            <Route path="/applicant/documents" element={<DocumentsPage />} />
            <Route path="/applicant/applications" element={<ApplicationsPage />} />
            <Route path="/applicant/inspections" element={<InspectionsPage />} />
            <Route path="/applicant/schemes" element={<SchemesPage />} />
            <Route path="/applicant/grievances" element={<GrievancesPage />} />
            <Route path="/applicant/notifications" element={<NotificationsPage />} />
            <Route path="/applicant/*" element={<ApplicantDashboard />} />
          </Route>

          {/* Officer Routes */}
          <Route element={<RoleProtectedRoute allowedRoles={['officer']} />}>
            <Route path="/officer" element={<OfficerDashboard />} />
            <Route path="/officer/reviews" element={<OfficerReviewsPage />} />
            <Route path="/officer/grievances" element={<OfficerGrievancesPage />} />
            <Route path="/officer/notifications" element={<NotificationsPage notificationKey="officer" />} />
            <Route path="/officer/*" element={<OfficerDashboard />} />
          </Route>

          {/* Inspector Routes */}
          <Route element={<RoleProtectedRoute allowedRoles={['inspector']} />}>
            <Route path="/inspector" element={<InspectorDashboard />} />
            <Route path="/inspector/inspections" element={<InspectorInspectionsPage />} />
            <Route path="/inspector/notifications" element={<NotificationsPage notificationKey="inspector" />} />
            <Route path="/inspector/*" element={<InspectorDashboard />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<RoleProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
            <Route path="/admin/inspections" element={<AdminInspectionsPage />} />
            <Route path="/admin/grievances" element={<AdminGrievancesPage />} />
            <Route path="/admin/notifications" element={<NotificationsPage notificationKey="admin" />} />
            <Route path="/admin/settings" element={<AdminDashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
          </Route>

        </Route>
      </Route>

      {/* Catch all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
