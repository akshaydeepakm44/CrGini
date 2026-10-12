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
import { useServiceVisibility } from '../../features/client/context/ServiceVisibilityContext';

export default function Footer({ onSignIn, onGetStarted }) {
  const { isChannelActive } = useServiceVisibility();
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
    <footer className="cg-footer-creative" aria-label="DiziGini End Credits and Directory">
      {/* Background Typographic Watermark */}
      <div className="cg-footer-watermark" aria-hidden="true">
        DIZIGINI
      </div>

      <div className="cg-container">
        {/* End Credits Header Bar: Live Operations & Quick Contact */}
        <div className="cg-footer-topbar">
          <div className="cg-footer-status">
            <span className="cg-status-dot-pulse" />
            <span className="cg-status-text">
              DizitalGini Operational &bull; Live Sprint Turnaround: 48&ndash;72h &bull; Verified B2B Intelligence Active
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
                alt="DiziGini"
                className="cg-footer-logo-img"
              />
            </a>

            <p className="cg-footer-manifesto-text">
              DiziGini connects ambitious businesses with dedicated human researchers, deep account dossiers, and verified B2B intelligence through the DizitalGini platform.
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
              <a href="https://dizigini.com" target="_blank" rel="noopener noreferrer" className="cg-social-pill" aria-label="dizigini.com">
                <span>dizigini.com</span>
                <ExternalLink size={11} />
              </a>
            </div>

            <div className="cg-footer-cert-badge">
              <ShieldCheck size={16} color="#7C3AED" />
              <span>Enterprise Grade &bull; 256-Bit SSL Encrypted &bull; Human Verified</span>
            </div>
          </div>

          {/* Column 1: Digitalising Platform */}
          <div className="cg-footer-col">
            <h4 className="cg-footer-col-header">
              <span className="cg-col-indicator purple" />
              <span>Digitalising Platform</span>
            </h4>
            <ul className="cg-footer-links-list">
              <li><a href="#services" className="cg-footer-link" onClick={scrollTo('services')}>B2B Lead Research (ICP Sprints)</a></li>
              <li><a href="#services" className="cg-footer-link" onClick={scrollTo('services')}>Company Study &amp; Account Dossiers</a></li>
              <li><a href="#services" className="cg-footer-link" onClick={scrollTo('services')}>Key People &amp; Buying Committee</a></li>
              <li><a href="#services" className="cg-footer-link" onClick={scrollTo('services')}>Pitch &amp; Presentation Support</a></li>
              <li><a href="#services" className="cg-footer-link" onClick={scrollTo('services')}>Executive Contact Telemetry</a></li>
              <li><a href="#services" className="cg-footer-link" onClick={scrollTo('services')}>Custom Digitalising Requests</a></li>
            </ul>
          </div>

          {/* Column 2: Platform Architecture */}
          <div className="cg-footer-col">
            <h4 className="cg-footer-col-header">
              <span className="cg-col-indicator pink" />
              <span>DizitalGini Ecosystem</span>
            </h4>
            <ul className="cg-footer-links-list">
              <li><a href="/portal" className="cg-footer-link">DiziGini Client Portal</a></li>
              <li><a href="/lead" className="cg-footer-link">Internal Lead Specialist Hub</a></li>
              <li><a href="/admin" className="cg-footer-link">Super Admin Control Center</a></li>
              <li><a href="/portal/deliverables" className="cg-footer-link">Verified Deliverables Vault</a></li>
              <li><a href="/portal/messages" className="cg-footer-link">Direct Specialist Chat</a></li>
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
              <li><a href="mailto:contact@dizigini.com" className="cg-footer-link">contact@dizigini.com</a></li>
              <li><span className="cg-footer-link" style={{ cursor: 'default', color: '#9CA3AF' }}>dizigini.com</span></li>
            </ul>
          </div>
        </div>

        {/* End Credits Bottom Bar */}
        <div className="cg-footer-end-credits">
          <div className="cg-credits-left">
            <span>&copy; {new Date().getFullYear()} DiziGini Technologies (dizigini.com). Built for modern B2B growth teams.</span>
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
