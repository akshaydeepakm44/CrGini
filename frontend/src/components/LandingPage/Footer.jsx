import React from 'react';
import { 
  ArrowUp, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  ExternalLink,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { BRAND_LOGO } from '../../assets/branding';

export default function Footer({ onSignIn, onGetStarted }) {
  const scrollTo = (id) => (e) => {
    e.preventDefault();
    if (id === 'top') {
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
    <footer className="cg-footer-creative" aria-label="CreativeGini End Credits and Directory">
      {/* Background Typographic Watermark */}
      <div className="cg-footer-watermark" aria-hidden="true">
        CREATIVEGINI
      </div>

      <div className="cg-container">
        {/* End Credits Header Bar: Live Operations & Quick Contact */}
        <div className="cg-footer-topbar">
          <div className="cg-footer-status">
            <span className="cg-status-dot-pulse" />
            <span className="cg-status-text">
              Platform Operational &bull; Live Sprint Turnaround: 48&ndash;72h &bull; Verified Research Active
            </span>
          </div>

          <div className="cg-footer-top-actions">
            <a 
              href="#client-journey" 
              className="cg-footer-direct-contact"
              onClick={scrollTo('client-journey')}
            >
              <span>Explore Workflow &amp; Deliverables</span>
              <ArrowRight size={14} />
            </a>

            <button 
              type="button" 
              className="cg-back-to-top-btn"
              onClick={scrollTo('top')}
              aria-label="Back to top of page"
            >
              <span>Back to Top</span>
              <ArrowUp size={14} />
            </button>
          </div>
        </div>

        {/* Main Directory Columns */}
        <div className="cg-footer-creative-grid">
          {/* Brand & Manifesto Column */}
          <div className="cg-footer-manifesto-col">
            <a href="/" className="cg-footer-brand-lockup" onClick={scrollTo('top')}>
              <img
                src={BRAND_LOGO}
                alt="CreativeGini"
                className="cg-footer-logo-img"
              />
            </a>

            <p className="cg-footer-manifesto-text">
              CreativeGini connects ambitious businesses with dedicated human researchers, strategic growth planners, and creative specialists through a single transparent platform.
            </p>

            <div className="cg-footer-social-strip">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="cg-social-pill" aria-label="LinkedIn">
                <span>LinkedIn</span>
                <ExternalLink size={11} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="cg-social-pill" aria-label="X Twitter">
                <span>X / Twitter</span>
                <ExternalLink size={11} />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="cg-social-pill" aria-label="DevRel GitHub">
                <span>GitHub DevRel</span>
                <ExternalLink size={11} />
              </a>
            </div>

            <div className="cg-footer-cert-badge">
              <ShieldCheck size={16} color="#7C3AED" />
              <span>Enterprise Grade &bull; 256-Bit SSL Encrypted &bull; Human Verified</span>
            </div>
          </div>

          {/* Column 1: Boosting Services */}
          <div className="cg-footer-col">
            <h4 className="cg-footer-col-header">
              <span className="cg-col-indicator pink" />
              <span>Boosting Services</span>
            </h4>
            <ul className="cg-footer-links-list">
              <li><a href="#services" className="cg-footer-link" onClick={scrollTo('services')}>Strategic Outbound Planner</a></li>
              <li><a href="#services" className="cg-footer-link" onClick={scrollTo('services')}>Content &amp; Narrative Creator</a></li>
              <li><a href="#services" className="cg-footer-link" onClick={scrollTo('services')}>DevRel &amp; Technical Advocacy</a></li>
              <li><a href="#services" className="cg-footer-link" onClick={scrollTo('services')}>Go-To-Market Playbooks</a></li>
              <li><a href="#services" className="cg-footer-link" onClick={scrollTo('services')}>Landing Page UI &amp; UX Sprints</a></li>
              <li><a href="#services" className="cg-footer-link" onClick={scrollTo('services')}>Performance Acquisition Ads</a></li>
            </ul>
          </div>

          {/* Column 2: Digitalising Services */}
          <div className="cg-footer-col">
            <h4 className="cg-footer-col-header">
              <span className="cg-col-indicator purple" />
              <span>Digitalising Services</span>
            </h4>
            <ul className="cg-footer-links-list">
              <li><a href="#services" className="cg-footer-link" onClick={scrollTo('services')}>B2B Lead Research (ICP Sprints)</a></li>
              <li><a href="#services" className="cg-footer-link" onClick={scrollTo('services')}>Company Study &amp; Account Dossiers</a></li>
              <li><a href="#services" className="cg-footer-link" onClick={scrollTo('services')}>Key People &amp; Buying Committee</a></li>
              <li><a href="#services" className="cg-footer-link" onClick={scrollTo('services')}>Executive Contact Telemetry</a></li>
              <li><a href="#services" className="cg-footer-link" onClick={scrollTo('services')}>Market Intelligence Reports</a></li>
              <li><a href="#services" className="cg-footer-link" onClick={scrollTo('services')}>Pitch &amp; Deck Research</a></li>
            </ul>
          </div>

          {/* Column 3: Legal & Support */}
          <div className="cg-footer-col">
            <h4 className="cg-footer-col-header">
              <span className="cg-col-indicator green" />
              <span>Legal &amp; Support</span>
            </h4>
            <ul className="cg-footer-links-list">
              <li><a href="#terms" className="cg-footer-link" onClick={(e) => e.preventDefault()}>Terms of Service</a></li>
              <li><a href="mailto:contact@creativegini.com" className="cg-footer-link">Contact Support</a></li>
            </ul>
          </div>
        </div>

        {/* End Credits Bottom Bar */}
        <div className="cg-footer-end-credits">
          <div className="cg-credits-left">
            <span>&copy; {new Date().getFullYear()} CreativeGini Technologies. Built for ambitious founders and modern growth leaders.</span>
          </div>

          <div className="cg-credits-badges">
            <span className="cg-credit-badge">
              <Lock size={12} />
              <span>256-Bit SSL Secured</span>
            </span>
            <span className="cg-credit-badge">
              <CheckCircle2 size={12} color="#10B981" />
              <span>Role-Based RBAC</span>
            </span>
            <span className="cg-credit-badge">
              <Sparkles size={12} color="#7C3AED" />
              <span>Zero AI Hallucinations</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
