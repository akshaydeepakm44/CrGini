import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './components/landing/Navbar';
import IntroExperience from './components/landing/IntroExperience';
import MarketingChannelsSection from './components/landing/MarketingChannelsSection';
import MarketingJourney from './components/landing/MarketingJourney';
import CreativeGiniEndExperience from './components/landing/CreativeGiniEndExperience';
import Footer from './components/landing/Footer';
import Toast from './components/common/Toast';
import CosmicSpaceCanvas from './components/common/CosmicSpaceCanvas';
import SignInPage from './components/auth/SignInPage';
import ResetPasswordPage from './components/auth/ResetPasswordPage';
import ProtectedRoute, { getRoleHome } from './components/common/ProtectedRoute';
import UserDashboard from './components/dashboard/user/UserDashboard';
import AdminDashboard from './components/dashboard/admin/AdminDashboard';
import CompanyLeadDashboard from './components/dashboard/internal/CompanyLeadDashboard';
import CompanyBoostDashboard from './components/dashboard/internal/CompanyBoostDashboard';
import LandingPageDashboard from './components/dashboard/internal/LandingPageDashboard';
import './styles/portal.css';
import { api } from './services/api';

gsap.registerPlugin(ScrollTrigger);

// Helper component to route /ticket/:ticketId directly to the appropriate dashboard
function TicketRedirect({ user, isAuthChecking }) {
  const { ticketId } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tab = searchParams.get('tab') || '';

  if (isAuthChecking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060B13', color: '#00E5FF' }}>
        <div className="portal-spinner" />
      </div>
    );
  }

  if (!user) {
    const returnUrl = `/ticket/${encodeURIComponent(ticketId)}${tab ? `?tab=${encodeURIComponent(tab)}` : ''}`;
    return <Navigate to={`/signin?redirect=${encodeURIComponent(returnUrl)}`} replace />;
  }

  const roleHome = getRoleHome(user);
  const targetUrl = `${roleHome}?ticket=${encodeURIComponent(ticketId)}${tab ? `&tab=${encodeURIComponent(tab)}` : ''}`;
  return <Navigate to={targetUrl} replace />;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const spotlightRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

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

  // Global Inertial Scroll Engine (Lenis + GSAP ScrollTrigger) exclusively on landing page
  useEffect(() => {
    if (!isLandingPage) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.5,
      infinite: false
    });

    lenis.on('scroll', ScrollTrigger.update);

    const updateTicker = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
    };
  }, [isLandingPage]);

  // Spotlight tracking on landing page
  useEffect(() => {
    if (!isLandingPage) return;
    const handleMouseMove = (e) => {
      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isLandingPage]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    const searchParams = new URLSearchParams(location.search);
    const redirectParam = searchParams.get('redirect');
    const targetRoute = redirectParam || getRoleHome(userData);
    navigate(targetRoute, { replace: true });
    showToast(`Welcome to CreativeGini, ${userData.name}!`);
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    navigate('/', { replace: true });
    setIsIntroComplete(false);
    showToast('Signed out successfully');
  };

  return (
    <div className={`app-root ${isLandingPage ? 'cosmic-editorial-root' : ''}`}>
      {/* 3D Cosmic Space Canvas rendered strictly on landing page */}
      {isLandingPage && <CosmicSpaceCanvas />}
      
      {isLandingPage && (
        <div
          ref={spotlightRef}
          className="cursor-cosmic-spotlight"
          style={{ left: 0, top: 0, transform: 'translate3d(-500px, -500px, 0)' }}
        />
      )}

      <Routes>
        {/* 1. Landing Page (100% Preserved) */}
        <Route
          path="/"
          element={
            <>
              <Navbar
                onOpenSignIn={() => navigate('/signin')}
                onOpenGoogleModal={() => navigate('/signin')}
                user={user}
                onLogout={handleLogout}
                onGoToDashboard={() => navigate(getRoleHome(user))}
              />

              <div id="landing-main-scroll-wrapper">
                <IntroExperience
                  isComplete={isIntroComplete}
                  setIsComplete={setIsIntroComplete}
                />

                <div id="next-landing-container" className="next-sections-flow">
                  <MarketingChannelsSection
                    onExploreChannel={user ? () => navigate(getRoleHome(user)) : () => navigate('/signin')}
                  />

                  <MarketingJourney
                    onExploreSolution={user ? () => navigate(getRoleHome(user)) : () => navigate('/signin')}
                  />

                  <CreativeGiniEndExperience />

                  <Footer
                    onOpenAuth={user ? () => navigate(getRoleHome(user)) : () => navigate('/signin')}
                  />
                </div>
              </div>
            </>
          }
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
            user ? (
              <Navigate to={getRoleHome(user)} replace />
            ) : (
              <ResetPasswordPage
                onBackHome={() => navigate('/')}
                showToast={showToast}
              />
            )
          }
        />

        {/* 3. User Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user} allowedRoles={['USER']} isAuthChecking={isAuthChecking} onLogout={handleLogout}>
              <UserDashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* 4. Admin Dashboard Route */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute user={user} allowedRoles={['ADMIN']} isAuthChecking={isAuthChecking} onLogout={handleLogout}>
              <AdminDashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* 5. Company Lead Dashboard Route */}
        <Route
          path="/company-lead"
          element={
            <ProtectedRoute user={user} requiredPermission="companyLead" isAuthChecking={isAuthChecking} onLogout={handleLogout}>
              <CompanyLeadDashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* 6. Company Boost Dashboard Route */}
        <Route
          path="/company-boost"
          element={
            <ProtectedRoute user={user} requiredPermission="companyBoost" isAuthChecking={isAuthChecking} onLogout={handleLogout}>
              <CompanyBoostDashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* 7. Landing Page Enhancement Dashboard Route */}
        <Route
          path="/landing-page-enhancement"
          element={
            <ProtectedRoute user={user} requiredPermission="companyUI" isAuthChecking={isAuthChecking} onLogout={handleLogout}>
              <LandingPageDashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* 8. Direct Ticket Deep Link Helper Route */}
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
