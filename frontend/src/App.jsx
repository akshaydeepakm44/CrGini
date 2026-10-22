import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import Toast from './components/common/Toast';
import ProtectedRoute, { getRoleHome } from './components/common/ProtectedRoute';
import { api, getStoredToken, setStoredToken } from './services/api';
import { ServiceVisibilityProvider } from './features/client/context/ServiceVisibilityContext';

// Dynamic Route-Level Code Splitting (Drastically reduces initial bundle size)
const LandingPage = lazy(() => import('./components/LandingPage/LandingPage'));
const SignInPage = lazy(() => import('./components/auth/SignInPage'));
const ResetPasswordPage = lazy(() => import('./components/auth/ResetPasswordPage'));
const MagicLoginPage = lazy(() => import('./features/auth/pages/MagicLoginPage'));
const ClientPortal = lazy(() => import('./features/client/ClientPortal'));
const LeadPortal = lazy(() => import('./features/lead/LeadPortal'));
const SuperAdminPortal = lazy(() => import('./features/admin/SuperAdminPortal'));
const PublicSampleDashboard = lazy(() => import('./features/samples/PublicSampleDashboard'));

function RouteLoadingSpinner() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        gap: '12px',
        fontFamily: 'var(--cg-font-family, "Inter", sans-serif)',
      }}
    >
      <div className="portal-spinner" style={{ width: '38px', height: '38px', borderTopColor: '#7C3AED' }} />
      <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Loading workspace...</span>
    </div>
  );
}

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
    const token = getStoredToken();
    if (token) {
      api.getMe()
        .then((data) => {
          if (data?.user) {
            setUser(data.user);
            if (data.user.email) {
              localStorage.setItem('cg_user_email', data.user.email);
            }
          }
        })
        .catch((err) => {
          // Only clear session if token is truly unauthorized/invalid (401), NOT on 502 or network blip
          const isExplicitUnauthorized = err?.status === 401 || 
                                          err?.message?.includes('401') || 
                                          err?.message?.includes('Token verification failed') || 
                                          err?.message?.includes('no longer exists');
          if (isExplicitUnauthorized) {
            api.logout();
            setUser(null);
          }
        })
        .finally(() => {
          setIsAuthChecking(false);
        });
    } else {
      setIsAuthChecking(false);
    }

    const handleExpired = () => {
      setUser(null);
      showToast('Session expired. Please sign in again.');
      navigate('/signin?expired=true');
    };
    window.addEventListener('cg_session_expired', handleExpired);
    return () => window.removeEventListener('cg_session_expired', handleExpired);
  }, [navigate]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  const handleLogin = (userData, authToken = null) => {
    if (authToken) {
      setStoredToken(authToken);
    }
    if (userData?.email) {
      localStorage.setItem('cg_user_email', userData.email);
    }
    setUser(userData);
    const searchParams = new URLSearchParams(location.search);
    const redirectParam = searchParams.get('redirect') || searchParams.get('returnTo');
    const targetRoute = redirectParam || getRoleHome(userData);
    navigate(targetRoute, { replace: true });
    showToast(`Welcome to DiziGini, ${userData.name}!`);
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    navigate('/', { replace: true });
    showToast('Signed out successfully');
  };

  return (
    <ServiceVisibilityProvider>
      <div className="app-root">
        <Suspense fallback={<RouteLoadingSpinner />}>
          <Routes>
        {/* 1. Public Light Theme Landing Page */}
        <Route
          path="/"
          element={
            <LandingPage
              onSignIn={() => navigate('/signin')}
              onGetStarted={() => navigate('/signin?view=signup')}
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
        <Route
          path="/showcase"
          element={<Navigate to="/showcase/data-i2i" replace />}
        />
        <Route
          path="/briefing/:slug"
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

        {/* 6. Deactivated Portals - Redirect to Lead Specialist / DizitalGini Platform */}
        <Route path="/boost/*" element={<Navigate to="/lead" replace />} />
        <Route path="/boost" element={<Navigate to="/lead" replace />} />
        <Route path="/company-boost/*" element={<Navigate to="/lead" replace />} />
        <Route path="/company-boost" element={<Navigate to="/lead" replace />} />

        {/* 7. Deactivated UI/Design Portal - Redirect to Lead Specialist / DizitalGini Platform */}
        <Route path="/design/*" element={<Navigate to="/lead" replace />} />
        <Route path="/design" element={<Navigate to="/lead" replace />} />
        <Route path="/landing-page-enhancement" element={<Navigate to="/lead" replace />} />

        {/* 9. Direct Ticket Deep Link Helper Route */}
        <Route
          path="/ticket/:ticketId"
          element={<TicketRedirect user={user} isAuthChecking={isAuthChecking} />}
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>

    <Toast message={toastMessage} />
      </div>
    </ServiceVisibilityProvider>
  );
}
