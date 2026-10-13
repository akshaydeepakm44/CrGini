import React from 'react';
import { 
  Target, 
  Building2, 
  Users, 
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
    id: 'strategic-planner',
    title: 'Strategic Planner',
    category: 'Boosting',
    icon: Compass,
    bgIcon: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
    desc: 'Actionable go-to-market roadmaps, competitor messaging audits, and high-conversion positioning frameworks for B2B expansion.',
    badgeBg: '#FCE7F3',
    badgeColor: '#BE185D'
  },
  {
    id: 'content-creator',
    title: 'Content Creator',
    category: 'Boosting',
    icon: PenTool,
    bgIcon: 'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)',
    desc: 'Compelling thought leadership articles, sales one-pagers, outbound email sequences, and high-converting landing page copy.',
    badgeBg: '#FCE7F3',
    badgeColor: '#BE185D'
  },
  {
    id: 'devrel',
    title: 'DevRel & Technical Advocacy',
    category: 'Boosting',
    icon: Code,
    bgIcon: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    desc: 'Developer marketing playbooks, hands-on tutorials, API quickstarts, and engineering community engagement strategies.',
    badgeBg: '#FCE7F3',
    badgeColor: '#BE185D'
  },
  {
    id: 'ui-ux-audit',
    title: 'UI/UX Audit',
    category: 'Design',
    icon: Palette,
    bgIcon: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
    desc: 'Comprehensive usability evaluation, user-flow diagnostics and heuristic interface review to eliminate UX friction.',
    badgeBg: '#E0F2FE',
    badgeColor: '#0369A1'
  },
  {
    id: 'redesign-request',
    title: 'Landing Page Redesign',
    category: 'Design',
    icon: Sparkles,
    bgIcon: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
    desc: 'Modern aesthetic standards, striking hero sections, intuitive layouts, and compelling visual storytelling for high conversion.',
    badgeBg: '#FDF2F8',
    badgeColor: '#BE185D'
  },
  {
    id: 'lead-research',
    title: 'Lead Research',
    category: 'Digitalising',
    icon: Target,
    bgIcon: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
    desc: 'Bespoke prospect discovery matching your ICP criteria with 100% human-verified business emails and direct phone numbers.',
    badgeBg: '#EDE9FE',
    badgeColor: '#6D28D9'
  },
  {
    id: 'company-study',
    title: 'Company Study',
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
          <span className="cg-section-badge">Core Deliverables</span>
          <h2 className="cg-section-title">Featured Growth Services</h2>
          <p className="cg-section-subtitle">
            Explore our most requested deliverables, requested directly by venture-backed startups and modern enterprise teams.
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
