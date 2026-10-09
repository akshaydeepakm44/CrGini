import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import LandingPage from './components/LandingPage/LandingPage';
import Toast from './components/common/Toast';
import SignInPage from './components/auth/SignInPage';
import ResetPasswordPage from './components/auth/ResetPasswordPage';
import MagicLoginPage from './features/auth/pages/MagicLoginPage';
import ProtectedRoute, { getRoleHome } from './components/common/ProtectedRoute';
import ClientPortal from './features/client/ClientPortal';
import LeadPortal from './features/lead/LeadPortal';
import BoostPortal from './features/boost/BoostPortal';
import DesignPortal from './features/design/DesignPortal';
import SuperAdminPortal from './features/admin/SuperAdminPortal';
import PublicSampleDashboard from './features/samples/PublicSampleDashboard';
import { api } from './services/api';

// Helper component to route /ticket/:ticketId directly to the appropriate dashboard
function TicketRedirect({ user, isAuthChecking }) {
  const { ticketId } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tab = searchParams.get('tab') || '';

  if (isAuthChecking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', color: '#0284C7' }}>
        <div className="portal-spinner" />
      </div>
    );
  }

  if (!user) {
    const returnUrl = `/ticket/${encodeURIComponent(ticketId)}${tab ? `?tab=${encodeURIComponent(tab)}` : ''}`;
    return <Navigate to={`/signin?redirect=${encodeURIComponent(returnUrl)}`} replace />;
  }

  const roleHome = getRoleHome(user);
  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
    return <Navigate to={`/admin/requests/${encodeURIComponent(ticketId)}`} replace />;
  }
  if (user.role === 'USER') {
    return <Navigate to={`/portal/requests/${encodeURIComponent(ticketId)}`} replace />;
  }
  if (user.role === 'COMPANY_LEAD' || user.dashboardAccess?.companyLead) {
    return <Navigate to={`/lead/requests/${encodeURIComponent(ticketId)}`} replace />;
  }
  if (user.role === 'COMPANY_BOOST' || user.dashboardAccess?.companyBoost) {
    return <Navigate to={`/boost/requests/${encodeURIComponent(ticketId)}`} replace />;
  }
  if (user.role === 'LANDING_PAGE' || user.dashboardAccess?.companyUI) {
    return <Navigate to={`/design/requests/${encodeURIComponent(ticketId)}`} replace />;
  }

  const targetUrl = `${roleHome}?ticket=${encodeURIComponent(ticketId)}${tab ? `&tab=${encodeURIComponent(tab)}` : ''}`;
  return <Navigate to={targetUrl} replace />;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  // Check existing session on initial load
  useEffect(() => {
    const token = localStorage.getItem('cg_auth_token');
    if (token) {
      api.getMe()
        .then((data) => {
          if (data?.user) {
            setUser(data.user);
          }
        })
        .catch(() => {
          api.logout();
          setUser(null);
        })
        .finally(() => {
          setIsAuthChecking(false);
        });
    } else {
      setIsAuthChecking(false);
    }
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    const searchParams = new URLSearchParams(location.search);
    const redirectParam = searchParams.get('redirect') || searchParams.get('returnTo');
    const targetRoute = redirectParam || getRoleHome(userData);
    navigate(targetRoute, { replace: true });
    showToast(`Welcome to CreativeGini, ${userData.name}!`);
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    navigate('/', { replace: true });
    showToast('Signed out successfully');
  };

  return (
    <div className="app-root">
      <Routes>
        {/* 1. Public Light Theme Landing Page */}
        <Route
          path="/"
          element={
            <LandingPage
              user={user}
              onSignIn={() => navigate('/signin')}
              onGetStarted={() => navigate('/signin?view=signup')}
              onGoToDashboard={() => navigate(getRoleHome(user))}
              onSignOut={handleLogout}
            />
          }
        />

        {/* Public Sample Intelligence Showcases */}
        <Route
          path="/samples/:slug"
          element={<PublicSampleDashboard />}
        />
        <Route
          path="/samples"
          element={<Navigate to="/samples/data-i2i" replace />}
        />
        <Route
          path="/showcase/:slug"
          element={<PublicSampleDashboard />}
        />

        {/* Dedicated Sign Up redirect */}
        <Route
          path="/signup"
          element={<Navigate to="/signin?view=signup" replace />}
        />
        <Route
          path="/register"
          element={<Navigate to="/signin?view=signup" replace />}
        />

        {/* Legacy landing page route (cleanly redirected to modern landing page) */}
        <Route
          path="/legacy"
          element={<Navigate to="/" replace />}
        />

        {/* 2. Sign In Route */}
        <Route
          path="/signin"
          element={
            user ? (
              <Navigate to={getRoleHome(user)} replace />
            ) : (
              <SignInPage
                initialView="signin"
                onLogin={handleLogin}
                onBackHome={() => navigate('/')}
                showToast={showToast}
              />
            )
          }
        />

        {/* 2a. Forgot Password Route */}
        <Route
          path="/forgot-password"
          element={
            user ? (
              <Navigate to={getRoleHome(user)} replace />
            ) : (
              <SignInPage
                initialView="forgot"
                onLogin={handleLogin}
                onBackHome={() => navigate('/')}
                showToast={showToast}
              />
            )
          }
        />

        {/* 2b. Reset Password Route */}
        <Route
          path="/reset-password"
          element={
            <ResetPasswordPage
              onBackHome={() => navigate('/')}
              showToast={showToast}
            />
          }
        />

        {/* 2c. Passwordless Magic Link Login Route */}
        <Route
          path="/magic-login"
          element={
            <MagicLoginPage
              onLogin={handleLogin}
              showToast={showToast}
            />
          }
        />

        {/* 3. New Modern Client Portal Routes */}
        <Route
          path="/portal/*"
          element={
            <ProtectedRoute user={user} allowedRoles={['USER', 'ADMIN']} isAuthChecking={isAuthChecking} onLogout={handleLogout}>
              <ClientPortal user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* 3a. Client Dashboard Redirect */}
        <Route
          path="/dashboard"
          element={<Navigate to="/portal" replace />}
        />

        {/* 3b. Legacy User Dashboard Redirect */}
        <Route
          path="/legacy-dashboard"
          element={<Navigate to="/portal" replace />}
        />

        {/* 4. Super Admin Control Center Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute user={user} allowedRoles={['ADMIN', 'SUPER_ADMIN']} isAuthChecking={isAuthChecking} onLogout={handleLogout}>
              <SuperAdminPortal user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute user={user} allowedRoles={['ADMIN', 'SUPER_ADMIN']} isAuthChecking={isAuthChecking} onLogout={handleLogout}>
              <SuperAdminPortal user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        {/* 4b. Legacy Admin Dashboard Route (Redirected to modern Super Admin) */}
        <Route
          path="/admin/legacy"
          element={<Navigate to="/admin" replace />}
        />

        {/* 5. Modern Lead Service Portal Routes */}
        <Route
          path="/lead/*"
          element={
            <ProtectedRoute user={user} allowedRoles={['COMPANY_LEAD', 'ADMIN', 'SUPER_ADMIN']} requiredPermission="companyLead" isAuthChecking={isAuthChecking} onLogout={handleLogout}>
              <LeadPortal user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company-lead/*"
          element={
            <ProtectedRoute user={user} allowedRoles={['COMPANY_LEAD', 'ADMIN', 'SUPER_ADMIN']} requiredPermission="companyLead" isAuthChecking={isAuthChecking} onLogout={handleLogout}>
              <LeadPortal user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company-lead"
          element={
            <ProtectedRoute user={user} allowedRoles={['COMPANY_LEAD', 'ADMIN', 'SUPER_ADMIN']} requiredPermission="companyLead" isAuthChecking={isAuthChecking} onLogout={handleLogout}>
              <LeadPortal user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        {/* Legacy Lead route redirect */}
        <Route
          path="/company-lead-legacy"
          element={<Navigate to="/lead" replace />}
        />

        {/* 6. Modern Boost Service Portal Routes */}
        <Route
          path="/boost/*"
          element={
            <ProtectedRoute user={user} allowedRoles={['COMPANY_BOOST', 'ADMIN', 'SUPER_ADMIN']} requiredPermission="companyBoost" isAuthChecking={isAuthChecking} onLogout={handleLogout}>
              <BoostPortal user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/boost"
          element={
            <ProtectedRoute user={user} allowedRoles={['COMPANY_BOOST', 'ADMIN', 'SUPER_ADMIN']} requiredPermission="companyBoost" isAuthChecking={isAuthChecking} onLogout={handleLogout}>
              <BoostPortal user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* Legacy Boost route redirects */}
        <Route
          path="/company-boost/*"
          element={<Navigate to="/boost" replace />}
        />
        <Route
          path="/company-boost"
          element={<Navigate to="/boost" replace />}
        />

        {/* 7. Modern UI/Design Service Portal Routes */}
        <Route
          path="/design/*"
          element={
            <ProtectedRoute user={user} allowedRoles={['LANDING_PAGE', 'ADMIN', 'SUPER_ADMIN']} requiredPermission="companyUI" isAuthChecking={isAuthChecking} onLogout={handleLogout}>
              <DesignPortal user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/design"
          element={
            <ProtectedRoute user={user} allowedRoles={['LANDING_PAGE', 'ADMIN', 'SUPER_ADMIN']} requiredPermission="companyUI" isAuthChecking={isAuthChecking} onLogout={handleLogout}>
              <DesignPortal user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* 8. Legacy Landing Page Enhancement Dashboard Route (Redirected to modern Design portal) */}
        <Route
          path="/landing-page-enhancement"
          element={<Navigate to="/design" replace />}
        />

        {/* 9. Direct Ticket Deep Link Helper Route */}
        <Route
          path="/ticket/:ticketId"
          element={<TicketRedirect user={user} isAuthChecking={isAuthChecking} />}
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toast message={toastMessage} />
    </div>
  );
}
