import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HomePage } from '../pages/Home/HomePage';
import { ComponentsPage } from '../pages/Components/ComponentsPage';
import { CourseDetailsPage } from '../pages/Course/CourseDetailsPage';
import { LoginPage } from '../pages/Auth/LoginPage';
import { SignUpPage } from '../pages/Auth/SignUpPage';
import { VerifyEmail } from '../pages/VerifyEmail';
import { ForgotPasswordPage } from '../pages/Auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/Auth/ResetPasswordPage';
import { LanguageWrapper } from './LanguageWrapper';
import { DEFAULT_LANGUAGE } from '../utils/constants';
import { PlaceholderPage } from '../pages/Placeholder/PlaceholderPage';
import { CartPage } from '../pages/Cart/CartPage';
import { CheckoutPage } from '../pages/Checkout/CheckoutPage';
import { MyLearningPage } from '../pages/Dashboard/User/Learning/MyLearningPage';
import { CourseLearningPage } from '../pages/Dashboard/User/Learning/CourseLearningPage';
import { CourseCertificatePage } from '../pages/Dashboard/User/Learning/CourseCertificatePage';
import { AccountSettingsPage } from '../pages/Dashboard/User/Settings/AccountSettingsPage';
import { TrainerDashboard } from '../pages/Dashboard/Trainer/TrainerDashboard';
import { TrainerRouteGuard } from '../components/guards/TrainerRouteGuard';
import { UserRouteGuard } from '../components/guards/UserRouteGuard';
import { AdminRouteGuard } from '../components/guards/AdminRouteGuard';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { AdminDashboard } from '../pages/Dashboard/Admin/AdminDashboard';
import { useTranslation } from 'react-i18next';
import { BusinessPage } from '../pages/Business/BusinessPage';
import { TeachPage } from '../pages/Teach/TeachPage';
import { AboutPage } from '../pages/About/AboutPage';
import { ContactPage } from '../pages/Contact/ContactPage';
import { MentorshipPage } from '../pages/Mentorship/MentorshipPage';
import MentorshipBookSession from '../pages/Mentorship/MentorshipBookSession';
import MentorshipConfirmation from '../pages/Mentorship/MentorshipConfirmation';
import BecomeMentor from '../pages/Mentorship/BecomeMentor';
import MentorApplicationConfirmation from '../pages/Mentorship/MentorApplicationConfirmation';
import { MentorDashboard } from '../pages/Dashboard/Mentor/MentorDashboard';
import { MentorRouteGuard } from '../components/guards/MentorRouteGuard';

// Protected route component for dashboard
const ProtectedDashboardRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const currentLang = location.pathname.split('/')[1];

  // If still loading auth state, show nothing
  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    // Preserve the attempted URL in the state
    return <Navigate to={`/${currentLang}/login`} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// User dashboard routes
const UserDashboardRoutes = () => (
  <UserRouteGuard>
    <Routes>
      <Route path="/" element={<Navigate to="learning" replace />} />
      <Route path="learning" element={<MyLearningPage />} />
      <Route path="learning/:courseId" element={<CourseLearningPage />} />
      <Route path="certificate/:courseId" element={<CourseCertificatePage />} />
      <Route path="settings/*" element={<AccountSettingsPage />} />
    </Routes>
  </UserRouteGuard>
);

// Trainer dashboard routes
const TrainerDashboardRoutes = () => (
  <TrainerRouteGuard>
    <Routes>
      <Route path="/" element={<Navigate to="courses" replace />} />
      <Route path="/*" element={<TrainerDashboard />} />
    </Routes>
  </TrainerRouteGuard>
);

// Mentor dashboard routes
const MentorDashboardRoutes = () => (
  <MentorRouteGuard>
    <Routes>
      <Route path="/" element={<Navigate to="mentees" replace />} />
      <Route path="/*" element={<MentorDashboard />} />
    </Routes>
  </MentorRouteGuard>
);

// Admin dashboard routes
const AdminDashboardRoutes = () => (
  <AdminRouteGuard>
    <Routes>
      <Route path="/*" element={<AdminDashboard />} />
    </Routes>
  </AdminRouteGuard>
);

export const AppRoutes: React.FC = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const { t } = useTranslation();
  const getDashboardPath = () => {
    switch (user?.role) {
      case 'admin':
        return '/dashboard/admin';
      case 'trainer':
        return '/dashboard/trainer/courses';
      case 'mentor':
        return '/dashboard/mentor/mentees';
      default:
        return '/dashboard/user/learning';
    }
  };

  return (
    <Routes>
      {/* Root redirect to default language */}
      <Route path="/" element={<Navigate to={`/${DEFAULT_LANGUAGE}`} replace />} />

      {/* LinkedIn callback route - outside language wrapper */}
      <Route path="/auth/linkedin/callback" element={<SignUpPage />} />

      {/* Language-specific routes */}
      <Route path="/:lang" element={<LanguageWrapper />}>
        {/* Public routes - no authentication required */}
        <Route index element={<HomePage />} />
        <Route path="components" element={<ComponentsPage />} />
        <Route path="courses/:courseId" element={<CourseDetailsPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="business" element={<BusinessPage />} />
        <Route path="teach" element={<TeachPage />} />
        <Route path="mentorship" element={<MentorshipPage />} />
        <Route path="mentorship/book/:mentorId" element={<MentorshipBookSession />} />
        <Route path="mentorship/booking-confirmation" element={<MentorshipConfirmation />} />
        <Route path="mentorship/become-mentor" element={<BecomeMentor />} />
        <Route path="mentorship/application-confirmation" element={<MentorApplicationConfirmation />} />
        <Route path="app" element={<PlaceholderPage pageName={t('placeholder.titles.app')} />} />
        <Route path="affiliate" element={<PlaceholderPage pageName={t('placeholder.titles.affiliate')} />} />
        <Route path="investors" element={<PlaceholderPage pageName={t('placeholder.titles.investors')} />} />
        <Route path="cookie-settings" element={<PlaceholderPage pageName={t('placeholder.titles.cookieSettings')} />} />
        <Route path="sitemap" element={<PlaceholderPage pageName={t('placeholder.titles.sitemap')} />} />
        <Route path="accessibility" element={<PlaceholderPage pageName={t('placeholder.titles.accessibility')} />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="blog" element={<PlaceholderPage pageName={t('placeholder.titles.blog')} />} />
        <Route path="help" element={<PlaceholderPage pageName={t('placeholder.titles.help')} />} />
        <Route path="terms" element={<PlaceholderPage pageName={t('placeholder.titles.terms')} />} />
        <Route path="privacy" element={<PlaceholderPage pageName={t('placeholder.titles.privacy')} />} />

        {/* Auth routes */}
        <Route path="login" element={
          isAuthenticated ? (
            <Navigate to={`/${DEFAULT_LANGUAGE}${getDashboardPath()}`} replace />
          ) : (
            <LoginPage />
          )
        } />
        <Route path="signup" element={
          isAuthenticated ? (
            <Navigate to={`/${DEFAULT_LANGUAGE}${getDashboardPath()}`} replace />
          ) : (
            <SignUpPage />
          )
        } />
        <Route path="forgot-password" element={
          isAuthenticated ? (
            <Navigate to={`/${DEFAULT_LANGUAGE}${getDashboardPath()}`} replace />
          ) : (
            <ForgotPasswordPage />
          )
        } />
        <Route path="reset-password/:token" element={
          isAuthenticated ? (
            <Navigate to={`/${DEFAULT_LANGUAGE}${getDashboardPath()}`} replace />
          ) : (
            <ResetPasswordPage />
          )
        } />
        <Route path="verify-email/:token" element={<VerifyEmail />} />

        {/* Protected dashboard routes */}
        <Route path="dashboard">
          <Route path="admin/*" element={
            <ProtectedDashboardRoute>
              <AdminDashboardRoutes />
            </ProtectedDashboardRoute>
          } />

          <Route path="user/*" element={
            <ProtectedDashboardRoute>
              <UserDashboardRoutes />
            </ProtectedDashboardRoute>
          } />

          <Route path="trainer/*" element={
            <ProtectedDashboardRoute>
              <TrainerRouteGuard>
                <TrainerDashboardRoutes />
              </TrainerRouteGuard>
            </ProtectedDashboardRoute>
          } />

          <Route path="mentor/*" element={
            <ProtectedDashboardRoute>
              <MentorRouteGuard>
                <MentorDashboardRoutes />
              </MentorRouteGuard>
            </ProtectedDashboardRoute>
          } />
        </Route>

        {/* Catch-all redirect to home */}
        <Route path="*" element={<Navigate to={`/${DEFAULT_LANGUAGE}`} replace />} />
      </Route>
    </Routes>
  );
}; 