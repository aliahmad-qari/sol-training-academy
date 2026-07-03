import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import Home from '@/pages/Home';
import NDISRegistration from '@/pages/services/NDISRegistration';
import WebsiteDevelopment from '@/pages/services/WebsiteDevelopment';
import SoftwareAutomation from '@/pages/services/SoftwareAutomation';
import Accountancy from '@/pages/services/Accountancy';
import SupportCoordinationTraining from '@/pages/services/SupportCoordinationTraining';
import AdminDashboard from '@/pages/AdminDashboard';
import LMSAdmin from '@/pages/LMSAdmin';
import StudentDashboard from '@/pages/StudentDashboard';
import MarketingAutomation from '@/pages/MarketingAutomation';
import GetStarted from '@/pages/GetStarted';
import Blog from '@/pages/Blog';
import TrainingCourses from '@/pages/TrainingCourses';
import AIAssistant from '@/pages/AIAssistant';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import RefundPolicy from '@/pages/RefundPolicy';
import TermsAndConditions from '@/pages/TermsAndConditions';
import ComplaintsFeedback from '@/pages/ComplaintsFeedback';
import AccessibilityStatement from '@/pages/AccessibilityStatement';
import CaseStudies from '@/pages/CaseStudies';
import ReadinessQuiz from '@/pages/ReadinessQuiz';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import MarketingServices from '@/pages/services/MarketingServices';
import MarketingPackages from '@/pages/MarketingPackages';
import NDISReadinessCalculator from '@/pages/NDISReadinessCalculator';
import ClientPortal from '@/pages/ClientPortal';
import ClientPortalLayout from '@/pages/client/ClientPortalLayout';
import PortalOverview from '@/pages/client/PortalOverview';
import PortalNDISProgress from '@/pages/client/PortalNDISProgress';
import PortalEnquiries from '@/pages/client/PortalEnquiries';
import PortalDocuments from '@/pages/client/PortalDocuments';
import PortalSubscriptions from '@/pages/client/PortalSubscriptions';
import PortalInvoices from '@/pages/client/PortalInvoices';
import PortalTemplates from '@/pages/client/PortalTemplates';
import PortalSupport from '@/pages/client/PortalSupport';
import PortalOnboarding from '@/pages/client/PortalOnboarding';
import PortalClientIntake from '@/pages/client/PortalClientIntake';
import PortalStaffIntake from '@/pages/client/PortalStaffIntake';
import PortalBooking from '@/pages/client/PortalBooking';
import Checkout from '@/pages/Checkout';
import PaymentSuccess from '@/pages/PaymentSuccess';
import PaymentHistory from '@/pages/PaymentHistory';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isAuthenticated, user } = useAuth();

  // Show loading spinner while checking auth state on mount
  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  /**
   * ProtectedRoute — must be logged in, otherwise → /login.
   * Optionally restrict to specific roles (e.g. allowedRoles={['admin','team_member']}).
   */
  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(user?.role)) {
      return <Navigate to="/student-dashboard" replace />;
    }
    return children;
  };

  /**
   * PublicOnlyRoute — if already logged in, redirect away from login/register.
   */
  const PublicOnlyRoute = ({ children }) => {
    if (isAuthenticated) {
      const dest = (user?.role === 'admin' || user?.role === 'team_member')
        ? '/lms-admin'
        : '/student-dashboard';
      return <Navigate to={dest} replace />;
    }
    return children;
  };
  return (
    <Routes>
      {/* ── Public routes ───────────────────────────────────────────── */}
      <Route path="/" element={<Home />} />
      <Route path="/services/ndis-registration" element={<NDISRegistration />} />
      <Route path="/services/website-development" element={<WebsiteDevelopment />} />
      <Route path="/services/software-automation" element={<SoftwareAutomation />} />
      <Route path="/services/accountancy" element={<Accountancy />} />
      <Route path="/services/support-coordination-training" element={<SupportCoordinationTraining />} />
      <Route path="/services/marketing" element={<MarketingServices />} />
      <Route path="/marketing-packages" element={<MarketingPackages />} />
      <Route path="/get-started" element={<GetStarted />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/training-courses" element={<TrainingCourses />} />
      <Route path="/ai-assistant" element={<AIAssistant />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/refund-policy" element={<RefundPolicy />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
      <Route path="/complaints-feedback" element={<ComplaintsFeedback />} />
      <Route path="/accessibility" element={<AccessibilityStatement />} />
      <Route path="/case-studies" element={<CaseStudies />} />
      <Route path="/readiness-quiz" element={<ReadinessQuiz />} />
      <Route path="/ndis-readiness-calculator" element={<NDISReadinessCalculator />} />
      <Route path="/marketing" element={<MarketingAutomation />} />

      {/* ── Auth routes (redirect away if already logged in) ──────── */}
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
      <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
      <Route path="/reset-password" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />

      {/* ── Student protected route ──────────────────────────────────── */}
      <Route path="/student-dashboard" element={
        <ProtectedRoute><StudentDashboard /></ProtectedRoute>
      } />
      <Route path="/checkout" element={
        <ProtectedRoute><Checkout /></ProtectedRoute>
      } />
      <Route path="/payment-success" element={
        <ProtectedRoute><PaymentSuccess /></ProtectedRoute>
      } />
      <Route path="/payment-history" element={
        <ProtectedRoute><PaymentHistory /></ProtectedRoute>
      } />

      {/* ── Admin / team_member protected routes ─────────────────────── */}
      <Route path="/lms-admin" element={
        <ProtectedRoute allowedRoles={['admin', 'team_member']}><LMSAdmin /></ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
      } />

      {/* ── Client portal (protected) ───────────────────────────────── */}
      <Route path="/client-portal" element={<ProtectedRoute><ClientPortalLayout /></ProtectedRoute>}>
        <Route index element={<PortalOverview />} />
        <Route path="ndis-progress" element={<PortalNDISProgress />} />
        <Route path="enquiries" element={<PortalEnquiries />} />
        <Route path="documents" element={<PortalDocuments />} />
        <Route path="subscriptions" element={<PortalSubscriptions />} />
        <Route path="invoices" element={<PortalInvoices />} />
        <Route path="templates" element={<PortalTemplates />} />
        <Route path="support" element={<PortalSupport />} />
        <Route path="onboarding" element={<PortalOnboarding />} />
        <Route path="client-intake" element={<PortalClientIntake />} />
        <Route path="staff-intake" element={<PortalStaffIntake />} />
        <Route path="booking" element={<PortalBooking />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App