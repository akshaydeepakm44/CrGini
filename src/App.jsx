import React, { useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './components/landing/Navbar';
import IntroExperience from './components/landing/IntroExperience';
import MarketingChannelsSection from './components/landing/MarketingChannelsSection';
import MarketingJourney from './components/landing/MarketingJourney';
import CreativeGiniEndExperience from './components/landing/CreativeGiniEndExperience';
import Footer from './components/landing/Footer';
import GoogleAuthModal from './components/common/GoogleAuthModal';
import Toast from './components/common/Toast';
import Dashboard from './components/dashboard/Dashboard';
import CosmicSpaceCanvas from './components/common/CosmicSpaceCanvas';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null); 
  const [toastMessage, setToastMessage] = useState('');
  const spotlightRef = useRef(null);

  // Global Silky-Smooth Inertial Scroll Engine (Lenis + GSAP ScrollTrigger)
  useEffect(() => {
    if (currentView !== 'landing') return;

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
  }, [currentView]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
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
    showToast(`Signed in as ${userData.name}. Welcome to CreativeGini!`);
  };

  const handleDirectSignInClick = () => {
    const demoUser = {
      name: 'Creative Founder',
      email: 'founder@creativegini.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    };
    setUser(demoUser);
    setCurrentView('dashboard');
    showToast(`Signed in as ${demoUser.name}. Opening CreativeGini Dashboard...`);
  };

  const [isIntroComplete, setIsIntroComplete] = useState(false);

  const handleLogout = () => {
    setUser(null);
    setCurrentView('landing');
    setIsIntroComplete(false);
    showToast('Signed out successfully');
  };

  return (
    <div className="app-root cosmic-editorial-root">
      {/* 3D Multi-Layer Continuous Parallax Starfield & Nebula Engine */}
      <CosmicSpaceCanvas />
      
      <div
        ref={spotlightRef}
        className="cursor-cosmic-spotlight"
        style={{ left: 0, top: 0, transform: 'translate3d(-500px, -500px, 0)' }}
      />

      {currentView === 'dashboard' ? (
        <Dashboard
          user={user}
          onLogout={handleLogout}
        />
      ) : (
        <>
          <Navbar
            onOpenGoogleModal={handleDirectSignInClick}
            user={user}
            onLogout={handleLogout}
            onGoToDashboard={() => setCurrentView('dashboard')}
          />

          <GoogleAuthModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onLogin={handleLogin}
          />

          <div id="landing-main-scroll-wrapper">
            {/* 1. SCROLL-CONTROLLED 3D ROLLING OPENING TITLE EXPERIENCE (LAYER 1 SUB-SCROLL) */}
            <IntroExperience
              isComplete={isIntroComplete}
              setIsComplete={setIsIntroComplete}
            />

            {/* 2. MAIN PAGE CONTENT FLOW (LAYER 2 UNLOCKED AFTER TITLE 3) */}
            <div id="next-landing-container" className="next-sections-flow">
              {/* Marketing Globe Section */}
              <MarketingChannelsSection
                onExploreChannel={handleDirectSignInClick}
              />

              {/* Horizontal Scroll Journey Section */}
              <MarketingJourney
                onExploreSolution={handleDirectSignInClick}
              />

              {/* 3. SCREEN 1 FINALE */}
              <CreativeGiniEndExperience />

              {/* 4. MAIN FOOTER */}
              <Footer
                onOpenAuth={handleDirectSignInClick}
              />
            </div>
          </div>
        </>
      )}

      <Toast message={toastMessage} />
    </div>
  );
}
