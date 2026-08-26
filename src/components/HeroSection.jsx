import React from 'react';
import { Rocket, FileText, Activity, ShieldCheck } from 'lucide-react';

export default function HeroSection() {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero-section" id="hero">
      <div className="hero-content full-hero">
        <div className="badge-pill hero-flagship-badge">
          <span className="pulse-dot"></span> Flagship AI Product • Autonomous Creative AI POD
        </div>

        {/* Hero Official Brand Logo Display */}
        <div className="hero-logo-wrapper">
          <img src="/logo.png" alt="CreativeGini Brand Logo" className="hero-logo-img" />
        </div>

        <h1 className="hero-title">
          Amplify Your Digital Footprint with <span className="gradient-text">CreativeGini</span>
        </h1>

        <p className="hero-subtitle">
          An enterprise-grade AI architecture integrating advanced generative models, automated multi-agent pipelines, and a dedicated Creative AI POD team to exponentially scale your digital reach, brand authority, and community momentum.
        </p>

        <div className="hero-cta-group">
          <a
            href="https://www.datai2i.com/contact?service=CreativeGini+POD"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            <Rocket size={16} /> Deploy a CreativeGini AI POD
          </a>
          <button className="btn-glass" onClick={() => scrollToSection('pod-squad')}>
            <FileText size={16} /> Explore POD Blueprint
          </button>
          <a
            href="https://www.datai2i.com/contact?service=CreativeGini+POD"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-glass btn-demo"
          >
            Request Custom Demo
          </a>
        </div>

        {/* Hero Metrics Strip */}
        <div className="hero-metrics-grid">
          <div className="metric-card">
            <div className="metric-value">10x</div>
            <div className="metric-label">Content Velocity</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">+480%</div>
            <div className="metric-label">Organic Reach Surge</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">3 Roles</div>
            <div className="metric-label">Dedicated POD Squad</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">100%</div>
            <div className="metric-label">Brand Consistency</div>
          </div>
        </div>

        {/* Live Multi-Agent Telemetry Bar */}
        <div className="telemetry-bar">
          <div className="telemetry-status">
            <Activity size={15} className="telemetry-icon" />
            <span className="telemetry-title">CreativeGini Multi-Agent State Graph: <strong className="status-active">Active</strong></span>
          </div>
          <div className="telemetry-stats">
            <span>Telemetry: <strong>185 Posts/Day</strong></span>
            <span className="telemetry-sep">•</span>
            <span><strong>12.3K Interactions</strong></span>
            <span className="telemetry-sep">•</span>
            <span><ShieldCheck size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> <strong>0% Egress</strong></span>
          </div>
        </div>
      </div>
    </section>
  );
}
