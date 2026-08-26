import React from 'react';
import { Rocket, Calendar } from 'lucide-react';

export default function CtaSection() {
  return (
    <section className="glass-section cta-banner-section" id="accelerate">
      <div className="section-container">
        <div className="hero-content cta-banner-card">
          <div className="section-tag">Accelerate With CreativeGini</div>
          <h2 className="hero-title cta-title">
            Ready to Exponentially Scale Your <span className="gradient-text">Digital Presence?</span>
          </h2>
          <p className="hero-subtitle cta-subtitle">
            Deploy a dedicated CreativeGini Creative AI POD to supercharge your brand authority, multi-modal content velocity, and active developer community momentum.
          </p>

          <div className="hero-cta-group">
            <a
              href="https://www.datai2i.com/contact?service=CreativeGini+POD"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <Rocket size={16} /> Deploy an Enterprise POD
            </a>
            <a
              href="https://www.datai2i.com/contact?service=CreativeGini+Discovery"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-glass"
            >
              <Calendar size={16} /> Schedule Strategy Session
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
