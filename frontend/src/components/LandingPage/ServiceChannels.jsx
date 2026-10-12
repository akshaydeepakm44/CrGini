import React from 'react';
import { 
  ArrowRight, 
  Target, 
  Building2, 
  Users, 
  Presentation,
  Check,
  Sparkles
} from 'lucide-react';
import { useServiceVisibility } from '../../features/client/context/ServiceVisibilityContext';

export default function ServiceChannels({ onSelectChannel }) {
  const { isChannelActive } = useServiceVisibility();

  const digitalisingModules = [
    {
      id: 'lead-research',
      title: 'Lead Research & ICP Sprints',
      badge: 'Lead Discovery',
      index: '01',
      icon: Target,
      desc: 'B2B prospect discovery matching your ICP criteria with 100% human-verified business emails and direct phone numbers.',
      features: [
        'Boolean & ICP Target Filtering',
        '100% SMTP Ping Validated',
        'Direct Phone Dials & Mobiles',
        'Enriched LinkedIn Profiles'
      ],
      accent: '#4F46E5',
      accentHover: '#4338CA',
      gradient: 'linear-gradient(90deg, #4F46E5 0%, #6366F1 100%)',
      lightBg: '#EEF2FF',
      border: '#E0E7FF',
      badgeText: '#4338CA',
      shadow: 'rgba(79, 70, 229, 0.16)'
    },
    {
      id: 'company-study',
      title: 'Company Study & Account Dossiers',
      badge: 'Account Intelligence',
      index: '02',
      icon: Building2,
      desc: 'Deep-dive account dossiers uncovering internal org charts, vendor footprints, recent funding triggers, and pain points.',
      features: [
        'Tech Stack & Vendor Telemetry',
        'Competitor Moat Analysis',
        'Hiring & Growth Trigger Signals',
        'Revenue & Enterprise Size Tiering'
      ],
      accent: '#0284C7',
      accentHover: '#0369A1',
      gradient: 'linear-gradient(90deg, #0284C7 0%, #38BDF8 100%)',
      lightBg: '#F0F9FF',
      border: '#BAE6FD',
      badgeText: '#0369A1',
      shadow: 'rgba(2, 132, 199, 0.16)'
    },
    {
      id: 'key-people',
      title: 'Key People & Buying Committee',
      badge: 'Decision Makers',
      index: '03',
      icon: Users,
      desc: 'Targeted intelligence on VP and C-level decision-makers, direct executive emails, verified social profiles, and background notes.',
      features: [
        'Org Hierarchy & Stakeholder Trees',
        'Direct C-Suite & VP Contacts',
        'Procurement Champions & Gatekeepers',
        'Pain Point & Role Mapping'
      ],
      accent: '#059669',
      accentHover: '#047857',
      gradient: 'linear-gradient(90deg, #059669 0%, #34D399 100%)',
      lightBg: '#ECFDF5',
      border: '#A7F3D0',
      badgeText: '#047857',
      shadow: 'rgba(5, 150, 105, 0.16)'
    },
    {
      id: 'pitch-support',
      title: 'Pitch & Presentation Support',
      badge: 'Pitch Strategy',
      index: '04',
      icon: Presentation,
      desc: 'Market intelligence, win-loss competitive teardowns, and data-backed proof points to empower high-stakes sales pitches.',
      features: [
        'Custom Competitive Battlecards',
        'Executive Slide Summaries',
        'Deal Intelligence Briefs',
        'Objection Teardowns & Rebuttals'
      ],
      accent: '#D97706',
      accentHover: '#B45309',
      gradient: 'linear-gradient(90deg, #D97706 0%, #FBBF24 100%)',
      lightBg: '#FFFBEB',
      border: '#FDE68A',
      badgeText: '#B45309',
      shadow: 'rgba(217, 119, 6, 0.16)'
    }
  ];

  return (
    <section id="services" className="cg-section" aria-label="DiziGini Digitalising Platform Modules">
      <div className="cg-container">
        <div className="cg-section-header">
          <span className="cg-section-badge">DizitalGini Intelligence Platform</span>
          <h2 className="cg-section-title">Dedicated Intelligence Modules for B2B Growth</h2>
          <p className="cg-section-subtitle">
            Equip your sales and executive teams with verified prospect databases, deep company dossiers, key people intelligence, and bespoke pitch research.
          </p>
        </div>

        <div className="cg-channels-grid">
          {digitalisingModules.map((module) => {
            const Icon = module.icon;
            return (
              <div 
                key={module.id} 
                className="cg-module-card"
                style={{
                  '--mod-accent': module.accent,
                  '--mod-accent-hover': module.accentHover,
                  '--mod-gradient': module.gradient,
                  '--mod-light-bg': module.lightBg,
                  '--mod-border': module.border,
                  '--mod-badge-text': module.badgeText,
                  '--mod-shadow': module.shadow,
                  '--mod-btn-shadow': module.shadow,
                }}
              >
                {/* Top Colored Accent Bar */}
                <div className="cg-module-top-accent" />

                <div className="cg-module-content">
                  {/* Header Row: Icon + Badge + Index */}
                  <div className="cg-module-header">
                    <div className="cg-module-icon-wrap">
                      <Icon size={20} strokeWidth={2.2} />
                    </div>
                    <div className="cg-module-header-meta">
                      <span className="cg-module-badge">
                        {module.badge}
                      </span>
                      <span className="cg-module-index">{module.index}</span>
                    </div>
                  </div>

                  <h3 className="cg-module-title">{module.title}</h3>
                  <p className="cg-module-desc">
                    {module.desc}
                  </p>

                  {/* Clean Feature Deliverables List */}
                  <div className="cg-module-features">
                    {module.features.map((feat) => (
                      <div key={feat} className="cg-module-feature-item">
                        <div className="cg-module-feature-bullet">
                          <Check size={11} strokeWidth={3} />
                        </div>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Interactive Action Button */}
                  <button
                    type="button"
                    className="cg-module-btn"
                    onClick={() => onSelectChannel && onSelectChannel('DIGITALISING')}
                  >
                    <span>Request Deliverable</span>
                    <ArrowRight size={15} className="cg-btn-arrow" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
