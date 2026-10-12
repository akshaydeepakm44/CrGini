import { 
  ArrowRight, 
  Sparkles, 
  Layers, 
  Search, 
  BarChart3, 
  Target, 
  Building2, 
  Users, 
  Presentation,
  Compass,
  PenTool,
  Code,
  Rocket,
  Palette,
  Megaphone
} from 'lucide-react';
import { useServiceVisibility } from '../../features/client/context/ServiceVisibilityContext';

export default function ServiceChannels({ onSelectChannel }) {
  const { isChannelActive } = useServiceVisibility();

  const digitalisingModules = [
    {
      id: 'lead-research',
      title: 'Lead Research & ICP Sprints',
      icon: Target,
      desc: 'B2B prospect discovery matching your ICP criteria with 100% human-verified business emails and direct phone numbers.',
      features: ['Boolean & ICP Filtering', '100% SMTP Ping Validated', 'Direct Phone Dials', 'LinkedIn Profiles']
    },
    {
      id: 'company-study',
      title: 'Company Study & Account Dossiers',
      icon: Building2,
      desc: 'Deep-dive account dossiers uncovering internal org charts, vendor footprints, recent funding triggers, and pain points.',
      features: ['Tech Stack Telemetry', 'Competitor Analysis', 'Hiring Signals', 'Revenue & Size Tiering']
    },
    {
      id: 'key-people',
      title: 'Key People & Buying Committee',
      icon: Users,
      desc: 'Targeted intelligence on VP and C-level decision-makers, direct executive emails, verified social profiles, and background notes.',
      features: ['Org Hierarchy Trees', 'C-Suite & VP Contacts', 'Procurement Champions', 'Pain Point Mapping']
    },
    {
      id: 'pitch-support',
      title: 'Pitch & Presentation Support',
      icon: Presentation,
      desc: 'Market intelligence, win-loss competitive teardowns, and data-backed proof points to empower high-stakes sales pitches.',
      features: ['Competitive Battlecards', 'Executive Slide Summaries', 'Deal Intelligence Briefs', 'Objection Teardowns']
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

        <div className="cg-channels-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {digitalisingModules.map((module) => {
            const Icon = module.icon;
            return (
              <div key={module.id} className="cg-channel-card digitalising">
                <span className="cg-channel-badge">
                  <Icon size={14} />
                  <span>Digitalising Module</span>
                </span>

                <h3 className="cg-channel-title" style={{ fontSize: '1.25rem', marginTop: '12px' }}>{module.title}</h3>
                <p className="cg-channel-desc" style={{ minHeight: '60px' }}>
                  {module.desc}
                </p>

                <div className="cg-channel-features-list">
                  {module.features.map((feat) => (
                    <div key={feat} className="cg-channel-feature-item">
                      <Search size={14} className="cg-channel-feature-icon" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="cg-channel-btn"
                  onClick={() => onSelectChannel && onSelectChannel('DIGITALISING')}
                >
                  <span>Request Deliverable</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
