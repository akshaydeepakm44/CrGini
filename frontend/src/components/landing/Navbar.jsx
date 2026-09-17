import React, { useState, useEffect, useRef } from 'react';
import { LogOut, LayoutDashboard, Sparkles, LogIn } from 'lucide-react';

export default function Navbar({ onOpenSignIn, onOpenGoogleModal, user, onLogout, onGoToDashboard }) {
  const handleSignIn = onOpenSignIn || onOpenGoogleModal;
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
            onClick={user ? onGoToDashboard : handleSignIn}
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
            <button className="nav-signin-btn desktop-signin-btn" onClick={handleSignIn}>
              <LogIn size={14} />
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
            onClick={() => { setMobileOpen(false); if (user) { onGoToDashboard(); } else { handleSignIn(); } }}
          >
            <Sparkles size={14} />
            <span>Deploy Campaign</span>
          </button>
          {!user && (
            <button className="nav-signin-btn mobile-signin-btn" onClick={() => { setMobileOpen(false); handleSignIn(); }}>
              <LogIn size={15} />
              <span>Sign in</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}
