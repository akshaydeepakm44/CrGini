import React, { useState } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Target, 
  Building2, 
  Users, 
  Presentation, 
    ShieldCheck,
  Zap,
  Clock
} from 'lucide-react';

const SPRINT_PREVIEWS = [
  {
    id: 'lead-research',
    label: 'Lead Research',
    icon: Target,
    highlight: '50 Verified B2B Enterprise Prospects',
    eta: '48–72 Hours',
    channel: 'Digitalising',
    desc: 'Human-verified email & LinkedIn contacts matching your exact ICP criteria.'
  },
  {
    id: 'company-study',
    label: 'Company Study',
    icon: Building2,
    highlight: 'Deep Account Dossier & Tech Stack Telemetry',
    eta: '3–5 Days',
    channel: 'Digitalising',
    desc: 'Comprehensive org mapping, key decision-maker pain points, and vendor footprints.'
  },
  {
    id: 'key-people',
    label: 'Key People Research',
    icon: Users,
    highlight: 'Buying Committee & C-Level Decision Map',
    eta: '48–72 Hours',
    channel: 'Digitalising',
    desc: 'Targeted intelligence on VP and C-level decision-makers with direct emails and mobile dials.'
  },
  {
    id: 'pitch-support',
    label: 'Pitch & Deck Support',
    icon: Presentation,
    highlight: 'Competitive Battlecard & Deal Brief',
    eta: '3–5 Days',
    channel: 'Digitalising',
    desc: 'Data-backed market research, objection teardowns, and win-loss intelligence for critical pitches.'
  }
];

export default function FinalCTA({ onGetStarted, onExploreServices }) {
  const [selectedSprint, setSelectedSprint] = useState(SPRINT_PREVIEWS[0]);

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
    <section className="cg-final-cta-section" aria-label="Ready to Scale with DiziGini">
      <div className="cg-container">
        <div className="cg-launchpad-card">
          {/* Subtle Ambient Glow Elements */}
          <div className="cg-launchpad-ambient-1" />
          <div className="cg-launchpad-ambient-2" />
          <div className="cg-launchpad-ring-decorative" />

          {/* Top Eyebrow Tag */}
          <div className="cg-launchpad-tag">
            <span className="cg-launchpad-dot" />
            <Zap size={14} />
            <span>YOUR ON-DEMAND B2B INTELLIGENCE &amp; RESEARCH SPRINT ENGINE</span>
          </div>

          {/* Main Headline */}
          <h2 className="cg-launchpad-title">
            Ready to scale your pipeline with <br />
            <span className="cg-launchpad-gradient-title">DiziGini?</span>
          </h2>

          <p className="cg-launchpad-subtitle">
            Choose the exact deliverable your team needs today. Verified human specialist execution, transparent scoping, and zero agency bloat.
          </p>

          {/* Interactive Sprint Chip Selector */}
          <div className="cg-sprint-selector-container">
            <span className="cg-sprint-selector-label">Select a deliverable to preview sprint turnaround:</span>
            <div className="cg-sprint-chips-row">
              {SPRINT_PREVIEWS.map((sp) => {
                const IconComp = sp.icon;
                const isSelected = selectedSprint.id === sp.id;
                return (
                  <button
                    key={sp.id}
                    type="button"
                    className={`cg-sprint-chip ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => setSelectedSprint(sp)}
                  >
                    <IconComp size={15} />
                    <span>{sp.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Live Sprint Details Banner */}
            <div className="cg-sprint-live-preview">
              <div className="cg-sprint-preview-left">
                <span className="cg-sprint-preview-channel">{selectedSprint.channel} Sprint</span>
                <strong className="cg-sprint-preview-name">{selectedSprint.highlight}</strong>
                <p className="cg-sprint-preview-desc">{selectedSprint.desc}</p>
              </div>
              <div className="cg-sprint-preview-right">
                <div className="cg-eta-badge">
                  <Clock size={13} />
                  <span>Turnaround: {selectedSprint.eta}</span>
                </div>
                <span className="cg-verified-tag">
                  <CheckCircle2 size={13} color="#10B981" />
                  <span>100% Human Verified</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="cg-launchpad-actions">
            <button
              type="button"
              className="cg-launchpad-btn-primary"
              onClick={onGetStarted}
            >
              <span>Get Started with DiziGini</span>
              <ArrowRight size={17} />
            </button>

            <button
              type="button"
              className="cg-launchpad-btn-secondary"
              onClick={handleScrollToServices}
            >
              <span>Explore All Deliverables</span>
            </button>
          </div>

          {/* Value Assurances Ribbon */}
          <div className="cg-launchpad-guarantees">
            <div className="cg-guarantee-item">
              <ShieldCheck size={16} />
              <span>Turnkey Scoped Sprints</span>
            </div>
            <div className="cg-guarantee-divider">&bull;</div>
            <div className="cg-guarantee-item">
              <CheckCircle2 size={16} />
              <span>Dedicated Human Specialists</span>
            </div>
            <div className="cg-guarantee-divider">&bull;</div>
            <div className="cg-guarantee-item">
              <Zap size={16} />
              <span>No Retainer Lock-In</span>
            </div>
            <div className="cg-guarantee-divider">&bull;</div>
            <div className="cg-guarantee-item">
              <Sparkles size={16} />
              <span>In-Portal Revisions &amp; Approvals</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
