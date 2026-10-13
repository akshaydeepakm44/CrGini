import React from 'react';
import { 
  Compass, 
  PenTool, 
  Code, 
  ArrowRight,
  Palette,
  Sparkles,
  Layers,
  Terminal,
  Smartphone,
  Globe
} from 'lucide-react';
import { useServiceVisibility } from '../../features/client/context/ServiceVisibilityContext';

const FEATURED_SERVICES = [
  // Channel 1: Boosting
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

  // Channel 2: UI / Design
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
    id: 'figma-project',
    title: 'Figma Design System',
    category: 'Design',
    icon: Layers,
    bgIcon: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
    desc: 'Production-ready component libraries, design token hierarchies, typography scales, and seamless developer handoff specs.',
    badgeBg: '#EEF2FF',
    badgeColor: '#4F46E5'
  },

  // Channel 3: App Development
  {
    id: 'technical-discovery',
    title: 'Technical Discovery',
    category: 'Development',
    icon: Terminal,
    bgIcon: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
    desc: 'Architecture blueprints, technology stack evaluation, schema design, and technical feasibility reports before building.',
    badgeBg: '#EEF2FF',
    badgeColor: '#4F46E5'
  },
  {
    id: 'clickable-prototype',
    title: 'Clickable App Prototype',
    category: 'Development',
    icon: Smartphone,
    bgIcon: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
    desc: 'Interactive high-fidelity clickable prototype for user testing, investor demos, and customer validation with real UX flows.',
    badgeBg: '#F0FDFA',
    badgeColor: '#0F766E'
  },
  {
    id: 'web-app',
    title: 'MVP Development',
    category: 'Development',
    icon: Globe,
    bgIcon: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    desc: 'POC + V1 turnkey full-stack application core, relational database, authentication, and cloud deployment ready for users.',
    badgeBg: '#ECFDF5',
    badgeColor: '#047857'
  }
];

export default function FeaturedServices({ onExploreService }) {
  const { isChannelActive, isServiceActive } = useServiceVisibility();

  const visible = FEATURED_SERVICES.filter(
    (srv) => isChannelActive(srv.category.toLowerCase()) && isServiceActive(srv.id)
  );
  const activeServices = visible.length >= 3 ? visible : FEATURED_SERVICES;

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
