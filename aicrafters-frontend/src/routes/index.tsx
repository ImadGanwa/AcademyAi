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
import ChoicePage from '../pages/ChoicePage/ChoicePage';
import MyBookingPage from '../pages/Dashboard/User/Booking/MyBookingPage';


// Protected route component for dashboard
const ProtectedDashboardRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const currentLang = location.pathname.split('/')[1];

  // For use in this component
  const checkChoiceAndGetPath = () => {
    const choiceMade = sessionStorage.getItem('userChoiceMade');
    console.log('DEBUG - ProtectedRoute - userChoiceMade:', choiceMade);
    
    if (!isAuthenticated) {
      return `/${currentLang}/login`;
    }
    
    if (choiceMade !== 'true') {
      console.log('DEBUG - ProtectedRoute - Redirecting to choice page');
      return `/${currentLang}/choice`;
    }
    
    // User is authenticated and has made a choice, proceed normally
    return null;
  };

  // If still loading auth state, show nothing
  if (isLoading) {
    return null;
  }

  // Check if user needs to be redirected
  const redirectPath = checkChoiceAndGetPath();
  if (redirectPath) {
    console.log('DEBUG - ProtectedRoute - Redirecting to:', redirectPath);
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// User dashboard routes
const UserDashboardRoutes = () => {
  const location = useLocation(); 
  const currentLang = location.pathname.split('/')[1];
  const choiceMade = sessionStorage.getItem('userChoiceMade');
  
  console.log('DEBUG - UserDashboardRoutes - userChoiceMade:', choiceMade);
  
  if (choiceMade !== 'true') {
    console.log('DEBUG - UserDashboardRoutes - Redirecting to choice page');
    return <Navigate to={`/${currentLang}/choice`} replace />;
  }
  
  return (
    <UserRouteGuard>
      <Routes>
        <Route path="/" element={<Navigate to="learning" replace />} />
        <Route path="learning" element={<MyLearningPage />} />
        <Route path="learning/:courseId" element={<CourseLearningPage />} />
        <Route path="certificate/:courseId" element={<CourseCertificatePage />} />
        <Route path="booking" element={<MyBookingPage />} />
        <Route path="settings/*" element={<AccountSettingsPage />} />
      </Routes>
    </UserRouteGuard>
  );
};


// Trainer dashboard routes
const TrainerDashboardRoutes = () => {
  const location = useLocation(); 
  const currentLang = location.pathname.split('/')[1];
  const choiceMade = sessionStorage.getItem('userChoiceMade');
  
  console.log('DEBUG - TrainerDashboardRoutes - userChoiceMade:', choiceMade);
  
  if (choiceMade !== 'true') {
    console.log('DEBUG - TrainerDashboardRoutes - Redirecting to choice page');
    return <Navigate to={`/${currentLang}/choice`} replace />;
  }
  
  return (
    <TrainerRouteGuard>
      <Routes>
        <Route path="/" element={<Navigate to="courses" replace />} />
        <Route path="/*" element={<TrainerDashboard />} />
      </Routes>
    </TrainerRouteGuard>
  );
};

// Mentor dashboard routes
const MentorDashboardRoutes = () => {
  const location = useLocation(); 
  const currentLang = location.pathname.split('/')[1];
  const choiceMade = sessionStorage.getItem('userChoiceMade');
  
  console.log('DEBUG - MentorDashboardRoutes - userChoiceMade:', choiceMade);
  
  if (choiceMade !== 'true') {
    console.log('DEBUG - MentorDashboardRoutes - Redirecting to choice page');
    return <Navigate to={`/${currentLang}/choice`} replace />;
  }
  
  return (
    <MentorRouteGuard>
      <Routes>
        <Route path="/" element={<Navigate to="mentees" replace />} />
        <Route path="/*" element={<MentorDashboard />} />
      </Routes>
    </MentorRouteGuard>
  );
};

// Admin dashboard routes
const AdminDashboardRoutes = () => {
  const location = useLocation(); 
  const currentLang = location.pathname.split('/')[1];
  const choiceMade = sessionStorage.getItem('userChoiceMade');
  
  console.log('DEBUG - AdminDashboardRoutes - userChoiceMade:', choiceMade);
  
  if (choiceMade !== 'true') {
    console.log('DEBUG - AdminDashboardRoutes - Redirecting to choice page');
    return <Navigate to={`/${currentLang}/choice`} replace />;
  }
  
  return (
    <AdminRouteGuard>
      <Routes>
        <Route path="/*" element={<AdminDashboard />} />
      </Routes>
    </AdminRouteGuard>
  );
};

export const AppRoutes: React.FC = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const getDashboardPath = () => {
    const lang = location.pathname.split('/')[1] || DEFAULT_LANGUAGE;
    switch (user?.role) {
      case 'admin':
        return `/${lang}/dashboard/admin`;
      case 'trainer':
        return `/${lang}/dashboard/trainer/courses`;
      case 'mentor':
        return `/${lang}/dashboard/mentor/mentees`;
      default:
        return `/${lang}/dashboard/user/learning`;
    }
  };

  const getPostLoginPath = () => {
    const lang = location.pathname.split('/')[1] || DEFAULT_LANGUAGE;
    const choiceMade = sessionStorage.getItem('userChoiceMade');
    console.log('DEBUG - userChoiceMade in sessionStorage:', choiceMade);
    console.log('DEBUG - isAuthenticated:', isAuthenticated);
    console.log('DEBUG - user:', user);
    
    if (choiceMade === 'true') {
      console.log('DEBUG - Choice made, redirecting to dashboard:', getDashboardPath());
      return getDashboardPath();
    }
    
    console.log('DEBUG - No choice made, redirecting to choice page:', `/${lang}/choice`);
    return `/${lang}/choice`;
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
        <Route path="app" element={<PlaceholderPage pageName={i18n.t('placeholder.titles.app')} />} />
        <Route path="affiliate" element={<PlaceholderPage pageName={i18n.t('placeholder.titles.affiliate')} />} />
        <Route path="investors" element={<PlaceholderPage pageName={i18n.t('placeholder.titles.investors')} />} />
        <Route path="cookie-settings" element={<PlaceholderPage pageName={i18n.t('placeholder.titles.cookieSettings')} />} />
        <Route path="sitemap" element={<PlaceholderPage pageName={i18n.t('placeholder.titles.sitemap')} />} />
        <Route path="accessibility" element={<PlaceholderPage pageName={i18n.t('placeholder.titles.accessibility')} />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="blog" element={<PlaceholderPage pageName={i18n.t('placeholder.titles.blog')} />} />
        <Route path="help" element={<PlaceholderPage pageName={i18n.t('placeholder.titles.help')} />} />
        <Route path="terms" element={<PlaceholderPage pageName={i18n.t('placeholder.titles.terms')} />} />
        <Route path="privacy" element={<PlaceholderPage pageName={i18n.t('placeholder.titles.privacy')} />} />
        <Route path="choice" element={<ChoicePage />} />

        {/* Auth routes */}
        <Route path="login" element={
          isAuthenticated ? (
            <Navigate to={getPostLoginPath()} replace />
          ) : (
            <LoginPage />
          )
        } />
        <Route path="signup" element={
          isAuthenticated ? (
            <Navigate to={getPostLoginPath()} replace />
          ) : (
            <SignUpPage />
          )
        } />
        <Route path="forgot-password" element={
          isAuthenticated ? (
            <Navigate to={getPostLoginPath()} replace />
          ) : (
            <ForgotPasswordPage />
          )
        } />
        <Route path="reset-password/:token" element={
          isAuthenticated ? (
            <Navigate to={getPostLoginPath()} replace />
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