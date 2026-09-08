import React, { useState, useEffect, useRef } from 'react';
import { LogOut, LayoutDashboard, Sparkles } from 'lucide-react';

export default function Navbar({ onOpenGoogleModal, user, onLogout, onGoToDashboard }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 20);

      const sections = [
        'marketing-channels',
        'marketing-journey',
        'scene-04-costs-section',
        'scene-07-solution-reveal'
      ];

      let current = '';
      const navHeight = 90;
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= navHeight + 140 && rect.bottom >= navHeight) {
            current = sectionId;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dismiss mobile drawer on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };

    if (mobileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside, { passive: true });
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileOpen]);

  const scrollToSection = (e, sectionId) => {
    if (e) e.preventDefault();
    setMobileOpen(false);

    // Ensure document scroll is active
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';

    const el = document.getElementById(sectionId);
    if (el) {
      const navHeight = 76;
      const targetY = el.getBoundingClientRect().top + window.pageYOffset - navHeight;
      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: 'smooth'
      });
    }
  };

  const scrollToTop = (e) => {
    if (e) e.preventDefault();
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header ref={headerRef} className={`navbar-container ${isScrolled ? 'scrolled' : ''}`}>
      <nav className="glass-navbar">
        <a href="#" className="nav-brand" onClick={scrollToTop} title="CreativeGini - Autonomous AI Marketing Engine">
          <img src="/logo.png" alt="CreativeGini Logo" className="nav-logo-img" />
        </a>

        <div className="nav-menu">
          <a
            href="#marketing-channels"
            className={`nav-item ${activeSection === 'marketing-channels' ? 'active' : ''}`}
            onClick={(e) => scrollToSection(e, 'marketing-channels')}
          >
            12+ Channels
          </a>
          <a
            href="#marketing-journey"
            className={`nav-item ${activeSection === 'marketing-journey' ? 'active' : ''}`}
            onClick={(e) => scrollToSection(e, 'marketing-journey')}
          >
            Campaign Journey
          </a>
          <a
            href="#scene-04-costs-section"
            className={`nav-item ${activeSection === 'scene-04-costs-section' ? 'active' : ''}`}
            onClick={(e) => scrollToSection(e, 'scene-04-costs-section')}
          >
            Cost Analysis
          </a>
          <a
            href="#scene-07-solution-reveal"
            className={`nav-item ${activeSection === 'scene-07-solution-reveal' ? 'active' : ''}`}
            onClick={(e) => scrollToSection(e, 'scene-07-solution-reveal')}
          >
            AI Solution
          </a>
        </div>

        <div className="nav-actions">
          {user && (
            <button className="btn-glass btn-dashboard-nav" onClick={onGoToDashboard}>
              <LayoutDashboard size={14} /> <span>Dashboard</span>
            </button>
          )}

          <button
            type="button"
            className="deploy-cta-btn"
            onClick={onOpenGoogleModal}
            title="Deploy AI Campaign"
          >
            <Sparkles size={14} />
            <span className="deploy-btn-text">Deploy Campaign</span>
          </button>

          {user ? (
            <div className="user-profile-pill" onClick={onGoToDashboard} style={{ cursor: 'pointer' }}>
              <img src={user.avatar} alt={user.name} className="avatar" />
              <span className="user-name">{user.name}</span>
              <button className="logout-btn" onClick={(e) => { e.stopPropagation(); onLogout(); }} title="Sign Out">
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button className="google-btn desktop-google-btn" onClick={onOpenGoogleModal}>
              <svg className="google-icon" width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span className="btn-text">Sign in</span>
            </button>
          )}

          <button
            className={`mobile-toggle ${mobileOpen ? 'open' : ''}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="mobile-drawer">
          <a
            href="#marketing-channels"
            className="mobile-link"
            onClick={(e) => scrollToSection(e, 'marketing-channels')}
          >
            12+ Channels
          </a>
          <a
            href="#marketing-journey"
            className="mobile-link"
            onClick={(e) => scrollToSection(e, 'marketing-journey')}
          >
            Campaign Journey
          </a>
          <a
            href="#scene-04-costs-section"
            className="mobile-link"
            onClick={(e) => scrollToSection(e, 'scene-04-costs-section')}
          >
            Cost Analysis
          </a>
          <a
            href="#scene-07-solution-reveal"
            className="mobile-link"
            onClick={(e) => scrollToSection(e, 'scene-07-solution-reveal')}
          >
            AI Solution
          </a>
          <div className="mobile-divider"></div>
          {user && (
            <button className="btn-glass mobile-deploy-btn" onClick={() => { setMobileOpen(false); onGoToDashboard(); }}>
              <LayoutDashboard size={14} /> <span>Open Dashboard</span>
            </button>
          )}
          <button
            type="button"
            className="deploy-cta-btn mobile-deploy-btn"
            onClick={() => { setMobileOpen(false); onOpenGoogleModal(); }}
          >
            <Sparkles size={14} />
            <span>Deploy Campaign</span>
          </button>
          {!user && (
            <button className="google-btn mobile-google-btn" onClick={() => { setMobileOpen(false); onOpenGoogleModal(); }}>
              <svg className="google-icon" width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span>Sign in with Google</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}
