import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, UserCheck, LayoutDashboard } from 'lucide-react';

export default function Navbar({ onSignIn, onGetStarted, user, onGoToDashboard, onSignOut }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sections = ['services', 'how-it-works', 'specialists', 'platform', 'why-us'];
      let current = 'home';
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) {
            current = id;
            break;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      const navOffset = 80;
      const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - navOffset,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header className={`cg-navbar-wrapper ${isScrolled ? 'scrolled' : ''}`}>
      <div className="cg-container">
        <nav className="cg-navbar" aria-label="Main Navigation">
          {/* Brand Logo */}
          <a
            href="/"
            className="cg-nav-brand"
            onClick={(e) => scrollToSection(e, 'home')}
            aria-label="CreativeGini Home"
          >
            <img
              src="/logo.png"
              alt="CreativeGini Logo"
              className="cg-nav-logo"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="cg-nav-brand-text">
              Creative<span>Gini</span>
            </span>
          </a>

          {/* Navigation Links */}
          <ul className="cg-nav-links">
            <li>
              <a
                href="#home"
                className={`cg-nav-link ${activeSection === 'home' ? 'active' : ''}`}
                onClick={(e) => scrollToSection(e, 'home')}
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#services"
                className={`cg-nav-link ${activeSection === 'services' ? 'active' : ''}`}
                onClick={(e) => scrollToSection(e, 'services')}
              >
                Services
              </a>
            </li>
            <li>
              <a
                href="#how-it-works"
                className={`cg-nav-link ${activeSection === 'how-it-works' ? 'active' : ''}`}
                onClick={(e) => scrollToSection(e, 'how-it-works')}
              >
                How It Works
              </a>
            </li>
            <li>
              <a
                href="#specialists"
                className={`cg-nav-link ${activeSection === 'specialists' ? 'active' : ''}`}
                onClick={(e) => scrollToSection(e, 'specialists')}
              >
                Specialists
              </a>
            </li>
            <li>
              <a
                href="#client-journey"
                className={`cg-nav-link ${activeSection === 'client-journey' ? 'active' : ''}`}
                onClick={(e) => scrollToSection(e, 'client-journey')}
              >
                Workflow &amp; Delivery
              </a>
            </li>
          </ul>

          {/* Action CTAs */}
          <div className="cg-nav-actions">
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  className="cg-btn-login"
                  onClick={onSignOut}
                  title={`Signed in as ${user.name || user.email}`}
                >
                  Sign Out
                </button>
                <button
                  type="button"
                  className="cg-btn-cta"
                  onClick={onGoToDashboard}
                >
                  <LayoutDashboard size={15} />
                  <span>Dashboard</span>
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className="cg-btn-login"
                  onClick={onSignIn}
                >
                  Login
                </button>
                <button
                  type="button"
                  className="cg-btn-cta"
                  onClick={onGetStarted || onSignIn}
                >
                  <span>Get Started</span>
                  <ArrowRight size={15} />
                </button>
              </>
            )}

            {/* Mobile menu trigger */}
            <button
              type="button"
              className="cg-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div
            style={{
              padding: '20px',
              background: '#FFFFFF',
              borderRadius: '16px',
              marginTop: '12px',
              border: '1px solid #DDD4FA',
              boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <a
              href="#home"
              className="cg-nav-link"
              onClick={(e) => scrollToSection(e, 'home')}
            >
              Home
            </a>
            <a
              href="#services"
              className="cg-nav-link"
              onClick={(e) => scrollToSection(e, 'services')}
            >
              Services
            </a>
            <a
              href="#how-it-works"
              className="cg-nav-link"
              onClick={(e) => scrollToSection(e, 'how-it-works')}
            >
              How It Works
            </a>
            <a
              href="#specialists"
              className="cg-nav-link"
              onClick={(e) => scrollToSection(e, 'specialists')}
            >
              Specialists
            </a>
            <a
              href="#client-journey"
              className="cg-nav-link"
              onClick={(e) => scrollToSection(e, 'client-journey')}
            >
              Workflow &amp; Delivery
            </a>
            {user ? (
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  className="cg-btn-login"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onSignOut && onSignOut();
                  }}
                >
                  Sign Out
                </button>
                <button
                  type="button"
                  className="cg-btn-cta"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onGoToDashboard && onGoToDashboard();
                  }}
                >
                  <span>Dashboard</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  className="cg-btn-login"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onSignIn();
                  }}
                >
                  Login
                </button>
                <button
                  type="button"
                  className="cg-btn-cta"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onGetStarted();
                  }}
                >
                  <span>Get Started</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
