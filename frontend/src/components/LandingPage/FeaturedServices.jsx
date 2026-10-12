import React from 'react';
import { 
  Target, 
  Building2, 
  Users, 
  Presentation,
  Compass, 
  PenTool, 
  Code, 
  ArrowRight,
  Palette,
  Sparkles
} from 'lucide-react';
import { useServiceVisibility } from '../../features/client/context/ServiceVisibilityContext';

const FEATURED_SERVICES = [
  {
    id: 'lead-research',
    title: 'Lead Research & ICP Discovery',
    category: 'Digitalising',
    icon: Target,
    bgIcon: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
    desc: 'Bespoke prospect discovery matching your ICP criteria with 100% human-verified business emails and direct phone numbers.',
    badgeBg: '#EDE9FE',
    badgeColor: '#6D28D9'
  },
  {
    id: 'company-study',
    title: 'Company Study & Account Dossiers',
    category: 'Digitalising',
    icon: Building2,
    bgIcon: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
    desc: 'Deep-dive account dossiers uncovering internal org charts, vendor footprints, recent funding triggers, and pain points.',
    badgeBg: '#EDE9FE',
    badgeColor: '#6D28D9'
  },
  {
    id: 'key-people',
    title: 'Key People Research',
    category: 'Digitalising',
    icon: Users,
    bgIcon: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
    desc: 'Targeted intelligence on VP and C-level decision-makers, direct executive emails, verified social profiles, and background notes.',
    badgeBg: '#EDE9FE',
    badgeColor: '#6D28D9'
  },
  {
    id: 'pitch-support',
    title: 'Pitch & Presentation Support',
    category: 'Digitalising',
    icon: Presentation,
    bgIcon: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    desc: 'Market intelligence, win-loss competitive teardowns, and data-backed proof points to empower high-stakes sales pitches.',
    badgeBg: '#D1FAE5',
    badgeColor: '#059669'
  }
];

export default function FeaturedServices({ onExploreService }) {
  const { isChannelActive, isServiceActive } = useServiceVisibility();

  const activeServices = FEATURED_SERVICES.filter(
    (srv) => isChannelActive(srv.category.toLowerCase()) && isServiceActive(srv.id)
  );

  return (
    <section className="cg-section" aria-label="Featured Services">
      <div className="cg-container">
        <div className="cg-section-header">
          <span className="cg-section-badge">DizitalGini Deliverables</span>
          <h2 className="cg-section-title">Featured Intelligence Services</h2>
          <p className="cg-section-subtitle">
            Explore our verified B2B intelligence deliverables, requested directly by venture-backed startups and modern enterprise teams.
          </p>
        </div>

        <div className="cg-services-grid">
          {activeServices.map((srv) => {
            const Icon = srv.icon;
            return (
              <div key={srv.id} className="cg-service-box">
                <div className="cg-service-box-top">
                  <div 
                    className="cg-service-box-icon"
                    style={{ background: srv.bgIcon }}
                  >
                    <Icon size={20} />
                  </div>
                  <span
                    className="cg-service-box-pill"
                    style={{ background: srv.badgeBg, color: srv.badgeColor }}
                  >
                    {srv.category}
                  </span>
                </div>

                <h3 className="cg-service-box-title">{srv.title}</h3>
                <p className="cg-service-box-desc">{srv.desc}</p>

                <button
                  type="button"
                  className="cg-service-box-link"
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  onClick={() => onExploreService && onExploreService(srv)}
                >
                  <span>Explore Deliverable</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
