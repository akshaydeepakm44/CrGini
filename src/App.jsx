import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroCanvas from './components/HeroCanvas';
import HeroSection from './components/HeroSection';
import PodSquadSection from './components/PodSquadSection';
import PipelineSection from './components/PipelineSection';
import EstimatorSection from './components/EstimatorSection';
import EnterpriseSection from './components/EnterpriseSection';
import CtaSection from './components/CtaSection';
import GoogleAuthModal from './components/GoogleAuthModal';
import Dashboard from './components/Dashboard';
import Toast from './components/Toast';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'dashboard'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null); // Unauthenticated by default for pristine landing page UI
  const [toastMessage, setToastMessage] = useState('');
  const [cursorPos, setCursorPos] = useState({ x: -500, y: -500 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setIsModalOpen(false);
    setCurrentView('dashboard');
    showToast(`Signed in as ${userData.name}. Welcome to CreativeGini AI POD Dashboard!`);
  };

  const handleDirectSignInClick = () => {
    // Open Google Auth modal or directly sign in and launch Dashboard
    const demoUser = {
      name: 'Enterprise Admin',
      email: 'admin@creativegini.ai',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    };
    setUser(demoUser);
    setCurrentView('dashboard');
    showToast(`Signed in as ${demoUser.name}. Opening CreativeGini AI POD Dashboard...`);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('landing');
    showToast('Signed out successfully');
  };

  return (
    <div className="app-root">
      {/* Interactive Cursor Spotlight Glow */}
      <div
        className="cursor-spotlight"
        style={{ left: `${cursorPos.x}px`, top: `${cursorPos.y}px` }}
      />

      {currentView === 'dashboard' ? (
        <Dashboard
          user={user}
          onGoToLanding={() => setCurrentView('landing')}
          onLogout={handleLogout}
        />
      ) : (
        <>
          {/* Glass Navbar */}
          <Navbar
            onOpenGoogleModal={handleDirectSignInClick}
            user={user}
            onLogout={handleLogout}
            onGoToDashboard={() => setCurrentView('dashboard')}
          />

          {/* Google Auth Modal */}
          <GoogleAuthModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onLogin={handleLogin}
          />

          {/* Full-Brightness Canvas Frame & Cursor Scrub Animation */}
          <div id="scroll-container">
            <HeroCanvas />

            {/* Translucent Glass Section Overlays */}
            <main className="page-sections">
              <HeroSection />
              <PodSquadSection />
              <PipelineSection />
              <EstimatorSection />
              <EnterpriseSection />
              <CtaSection />
            </main>
          </div>
        </>
      )}

      {/* Toast Feedback */}
      <Toast message={toastMessage} />
    </div>
  );
}
