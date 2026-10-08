import React from 'react';
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import GrowthEcosystem from './GrowthEcosystem/GrowthEcosystem';

export default function HeroSection({ onGetStarted, onExploreServices }) {
  const handleScrollToServices = (e) => {
    e.preventDefault();
    const el = document.getElementById('services');
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
    <section id="home" className="cg-hero-section">
      <div className="cg-container">
        <div className="cg-hero-grid">
          {/* Left Column: Value Proposition & CTAs */}
          <div className="cg-hero-content">
            <div className="cg-eyebrow-pill">
              <span className="cg-eyebrow-dot" />
              <span>DIGITAL MARKETING &amp; BUSINESS GROWTH</span>
            </div>

            <h1 className="cg-hero-headline">
              Grow smarter.<br />
              Build faster.<br />
              <span className="cg-headline-gradient">Market better.</span>
            </h1>

            <p className="cg-hero-subtext">
              CreativeGini connects your business with the research, strategy, content and growth services you need to move forward.
            </p>

            <div className="cg-hero-ctas">
              <button
                type="button"
                className="cg-hero-btn-primary"
                onClick={onGetStarted}
              >
                <span>Get Started</span>
                <ArrowRight size={17} />
              </button>

              <button
                type="button"
                className="cg-hero-btn-secondary"
                onClick={handleScrollToServices}
              >
                <span>Explore Services</span>
              </button>
            </div>

            {/* Micro Trust Indicators */}
            <div className="cg-hero-trust-bar">
              <div className="cg-trust-item">
                <CheckCircle2 size={16} className="cg-trust-icon" />
                <span>Human Specialists</span>
              </div>
              <div className="cg-trust-item">
                <ShieldCheck size={16} className="cg-trust-icon" />
                <span>Verified Deliverables</span>
              </div>
              <div className="cg-trust-item">
                <Zap size={16} className="cg-trust-icon" />
                <span>Turnkey Execution</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Growth Ecosystem */}
          <div className="cg-hero-ecosystem-col">
            <GrowthEcosystem
              onExploreService={(service) => {
                const target = document.getElementById('services');
                if (target) {
                  target.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
