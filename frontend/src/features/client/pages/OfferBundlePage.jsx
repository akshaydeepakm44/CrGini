import React, { useState } from 'react';
import {
  Boxes,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Tag,
  Clock,
  Layers,
  ChevronRight,
  Target,
  PenTool,
  Code,
  Building2,
  Users,
  Presentation,
  Compass,
  Palette,
  Code2
} from 'lucide-react';

export const OFFER_BUNDLES = [
  {
    id: 'gtm-launchpad',
    title: 'Full Go-To-Market Launchpad',
    badge: 'MOST POPULAR',
    badgeColor: '#7C3AED',
    badgeBg: '#F5F3FF',
    tagline: 'Complete launch architecture from positioning to verified outbound leads.',
    description: 'Transform your product rollout with end-to-end strategic positioning, high-converting ad creative angles, and hand-verified lead telemetry ready for immediate campaign activation.',
    turnaround: '3–5 Business Days',
    originalPrice: 2896,
    bundlePrice: 2199,
    savingsPercent: '24%',
    services: [
      { name: 'Strategic Planner', desc: 'Market positioning & ICP value propositions', icon: Compass, color: '#EC4899', bg: '#FDF2F8' },
      { name: 'GTM Strategy', desc: 'Distribution vectors & launch blueprints', icon: Target, color: '#10B981', bg: '#ECFDF5' },
      { name: 'Ad Creatives', desc: 'Multi-format ads for LinkedIn & Meta', icon: Sparkles, color: '#EF4444', bg: '#FEF2F2' },
      { name: 'Lead Research', desc: '50 hand-verified target accounts (0% bounce)', icon: Target, color: '#7C3AED', bg: '#EDE9FE' },
    ],
    deliverables: [
      'GTM Launch Playbook & Channel Distribution Matrix',
      'Target ICP Narrative & Elevator Pitch Deck',
      '12 Production Visual Ad Variants (1:1, 9:16, 16:9)',
      '50 Hand-Verified Account Contacts in CSV/Sheets',
    ],
    serviceIds: ['strategic-planner', 'gtm', 'ad-creatives', 'lead-research'],
  },
  {
    id: 'content-branding-engine',
    title: 'Brand Identity & Content Engine',
    badge: 'SAVE 25%',
    badgeColor: '#E11D48',
    badgeBg: '#FFE4E6',
    tagline: 'High-conversion narrative, visual guidelines, and brand collateral pack.',
    description: 'Establish high-conviction authority in your niche. Our senior creatives deliver complete brand guidelines, executive ghostwritten articles, and conversion-optimized sales collateral.',
    turnaround: '48–72 Hours',
    originalPrice: 2397,
    bundlePrice: 1799,
    savingsPercent: '25%',
    services: [
      { name: 'Brand Identity & Positioning', desc: 'Visual language, style guides & lockups', icon: ShieldCheck, color: '#3B82F6', bg: '#EFF6FF' },
      { name: 'Content Creator', desc: 'High-conversion copy & visual assets', icon: PenTool, color: '#F43F5E', bg: '#FFF1F2' },
      { name: 'Ad Creatives', desc: 'High-CTR campaign creative pack', icon: Sparkles, color: '#EF4444', bg: '#FEF2F2' },
    ],
    deliverables: [
      'Comprehensive Brand Identity Guidelines (Interactive PDF)',
      'Executive Thought Leadership Articles & Sales One-Pagers',
      'Multi-Format Visual Asset Suite (SVG / High-Res PNG)',
      'Branded Social Carousel & Ad Variant Pack',
    ],
    serviceIds: ['brand-identity', 'content-creator', 'ad-creatives'],
  },
  {
    id: 'b2b-pipeline-pack',
    title: 'B2B Account Intelligence Pod',
    badge: 'DATA ACCELERATOR',
    badgeColor: '#0284C7',
    badgeBg: '#E0F2FE',
    tagline: 'Deep account dossiers, executive hierarchy mapping, and verified contacts.',
    description: 'Arm your outbound sales team with unfair competitive advantages. Complete buyer committee mappings, deep tech stack detection, and hand-verified direct dial telemetry.',
    turnaround: '48–72 Hours',
    originalPrice: 1797,
    bundlePrice: 1349,
    savingsPercent: '25%',
    services: [
      { name: 'Lead Research', desc: '100 verified decision-maker contacts', icon: Target, color: '#7C3AED', bg: '#EDE9FE' },
      { name: 'Company Study Dossiers', desc: 'Deep organizational & tech stack audits', icon: Building2, color: '#6366F1', bg: '#EEF2FF' },
      { name: 'Key People Research', desc: 'Buying committee & direct contacts', icon: Users, color: '#0EA5E9', bg: '#F0F9FF' },
    ],
    deliverables: [
      '100 Verified Account Profiles with Direct Emails & Numbers',
      '5 Deep Account Dossiers (Org chart, tech stack, pain points)',
      'Buying Committee Hierarchy Matrix (Economic Buyer + Evaluators)',
      'Personalized Outreach Angles & Trigger Signals',
    ],
    serviceIds: ['lead-research', 'company-study', 'key-people'],
  },
  {
    id: 'mvp-launch-sprint',
    title: 'Turnkey MVP & Product Launch',
    badge: 'FULL-STACK TECH',
    badgeColor: '#059669',
    badgeBg: '#D1FAE5',
    tagline: 'Production-ready web application MVP backed by design & growth strategy.',
    description: 'Go from concept to functional product without hiring a dev agency. Our software engineers and designers build your application core, test UI flows, and prepare your go-to-market plan.',
    turnaround: '5–7 Business Days',
    originalPrice: 3097,
    bundlePrice: 2399,
    savingsPercent: '23%',
    services: [
      { name: 'Web Application MVP', desc: 'Turnkey full-stack application core', icon: Code2, color: '#10B981', bg: '#ECFDF5' },
      { name: 'UI/UX Audit & Specs', desc: 'Heuristic review & friction elimination', icon: Palette, color: '#0284C7', bg: '#F0F9FF' },
      { name: 'Strategic Planner', desc: 'Positioning & early-adopter acquisition', icon: Compass, color: '#EC4899', bg: '#FDF2F8' },
    ],
    deliverables: [
      'Functional Web Application Repository & Staging Deploy',
      'Authenticated User Flows & Relational Database Engine',
      'Heuristic Usability Review & Severity Matrix',
      'Early Adopter Acquisition & Growth Playbook',
    ],
    serviceIds: ['web-app', 'ui-ux-audit', 'strategic-planner'],
  },
  {
    id: 'developer-adoption-sprint',
    title: 'DevRel & Technical Traction Pod',
    badge: 'DEVTOOL SPECIALIST',
    badgeColor: '#7C3AED',
    badgeBg: '#EDE9FE',
    tagline: 'Developer experience audit, documentation samples, and Figma design system.',
    description: 'Designed specifically for APIs, SDKs, and developer tooling startups looking to win developer mindshare and eliminate friction in self-serve onboarding.',
    turnaround: '48–72 Hours',
    originalPrice: 2197,
    bundlePrice: 1699,
    savingsPercent: '23%',
    services: [
      { name: 'DevRel & Technical Advocacy', desc: 'Docs telemetry & quickstart code samples', icon: Code, color: '#8B5CF6', bg: '#F5F3FF' },
      { name: 'Figma Project', desc: 'Component design system & interactive frames', icon: Palette, color: '#7C3AED', bg: '#FAF5FF' },
      { name: 'Content Creator', desc: 'Technical thought leadership & release post', icon: PenTool, color: '#F43F5E', bg: '#FFF1F2' },
    ],
    deliverables: [
      'Developer Experience (DX) Audit & Quickstart Sample Repos',
      'Production Figma UI Kit & Component Library',
      'Technical Blog Post & Architectural Deep-Dive Guide',
      'Community Hackathon & Engagement Blueprint',
    ],
    serviceIds: ['devrel', 'figma-project', 'content-creator'],
  },
  {
    id: 'executive-pitch-blueprint',
    title: 'Investor & Sales Pitch Blueprint',
    badge: 'HIGH STAKES',
    badgeColor: '#D97706',
    badgeBg: '#FEF3C7',
    tagline: 'TAM market sizing, competitor battlecards, and executive company study.',
    description: 'Arm your pitch with airtight defensibility. We produce data-backed market sizing calculations, competitor pricing battlecards, and strategic dossiers for high-stakes meetings.',
    turnaround: '48–72 Hours',
    originalPrice: 1997,
    bundlePrice: 1499,
    savingsPercent: '25%',
    services: [
      { name: 'Pitch Support & Deck Research', desc: 'TAM modeling & objection engineering', icon: Presentation, color: '#10B981', bg: '#ECFDF5' },
      { name: 'Company Study & Dossiers', desc: 'Deep organizational & tech stack audits', icon: Building2, color: '#6366F1', bg: '#EEF2FF' },
      { name: 'Strategic Planner', desc: 'Market differentiation & ICP narrative', icon: Compass, color: '#EC4899', bg: '#FDF2F8' },
    ],
    deliverables: [
      'Verified TAM/SAM/SOM Market Sizing Brief with Sources',
      'Competitor Battlecards & Feature Comparison Matrix',
      'Executive Slide Deck Supporting Narrative & Talking Points',
      'Comprehensive Target Account Dossier Report',
    ],
    serviceIds: ['pitch-support', 'company-study', 'strategic-planner'],
  },
];

export default function OfferBundlePage({ onRequestBundle, onNavigate }) {
  const [filter, setFilter] = useState('all');

  const filteredBundles = OFFER_BUNDLES.filter((bundle) => {
    if (filter === 'all') return true;
    if (filter === 'gtm') return bundle.id.includes('gtm') || bundle.id.includes('content');
    if (filter === 'intel') return bundle.id.includes('pipeline') || bundle.id.includes('pitch');
    if (filter === 'tech') return bundle.id.includes('mvp') || bundle.id.includes('developer');
    return true;
  });

  const handleClaim = (bundle) => {
    if (onRequestBundle) {
      onRequestBundle('custom', {
        selectedServices: bundle.serviceIds.reduce((acc, sid) => {
          // map to custom form keys
          const keyMap = {
            'strategic-planner': 'strategicPlan',
            'content-creator': 'content',
            'devrel': 'devrel',
            'gtm': 'gtm',
            'ad-creatives': 'adCreatives',
            'brand-identity': 'brandIdentity',
            'lead-research': 'leadResearch',
            'company-study': 'companyStudy',
            'key-people': 'keyPeople',
            'pitch-support': 'pitchSupport',
            'web-app': 'webApp',
            'mobile-app': 'mobileApp',
            'api-backend': 'apiBackend',
            'ui-ux-audit': 'uiUxAudit',
            'figma-project': 'figmaProject',
            'redesign-request': 'redesignRequest',
          };
          const k = keyMap[sid] || sid;
          acc[k] = true;
          return acc;
        }, {}),
        requirements: `Claiming ${bundle.title} (${bundle.savingsPercent} Bundle Discount applied). Desired deliverables:\n- ${bundle.deliverables.join('\n- ')}`,
      });
    }
  };

  return (
    <div style={{ padding: '32px 36px 60px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#7C3AED',
              backgroundColor: '#F5F3FF',
              padding: '3px 12px',
              borderRadius: '9999px',
              border: '1px solid #DDD4FA',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Boxes size={13} />
            <span>SPECIALIST BUNDLES</span>
          </span>
          <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>•</span>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#059669',
              backgroundColor: '#ECFDF5',
              padding: '3px 10px',
              borderRadius: '9999px',
            }}
          >
            Save Up to 25%
          </span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--cg-font-heading, "Plus Jakarta Sans", sans-serif)',
            fontSize: '2.1rem',
            fontWeight: 800,
            color: 'var(--cg-text-primary, #111827)',
            margin: '0 0 8px 0',
            letterSpacing: '-0.02em',
          }}
        >
          Offer Bundles
        </h1>

        <p style={{ margin: 0, fontSize: '1rem', color: 'var(--cg-text-secondary, #4B5563)', maxWidth: '780px', lineHeight: 1.6 }}>
          Turnkey specialist capabilities bundled for maximum velocity and bundled savings. Every bundle includes coordinated execution by a dedicated specialist pod with fixed turnaround.
        </p>
      </div>

      {/* Filter Tabs + Custom Bundle Shortcut */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '28px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Offer Bundles (6)' },
            { id: 'gtm', label: 'Growth & GTM' },
            { id: 'intel', label: 'Intelligence & Pitches' },
            { id: 'tech', label: 'Tech & Product' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '0.84375rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: filter === tab.id ? '#7C3AED' : '#FFFFFF',
                color: filter === tab.id ? '#FFFFFF' : '#4B5563',
                border: filter === tab.id ? '1px solid #7C3AED' : '1px solid #E5E7EB',
                boxShadow: filter === tab.id ? '0 2px 8px rgba(124, 58, 237, 0.25)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onNavigate && onNavigate('/portal/bundles/custom')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '10px',
            border: '1.5px dashed #7C3AED',
            backgroundColor: '#FAF5FF',
            color: '#7C3AED',
            fontSize: '0.84375rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F5F3FF')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FAF5FF')}
        >
          <Sparkles size={15} />
          <span>Need a tailored setup? Build Custom Bundle</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* 6 Bundles Grid (Balanced 3x2 on Desktop, 2x3 on Tablet, 1 on Mobile) */}
      <style>{`
        .cg-offer-bundles-grid {
          display: grid;
          gap: 24px;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          margin-bottom: 40px;
        }
        @media (max-width: 1140px) {
          .cg-offer-bundles-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 680px) {
          .cg-offer-bundles-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <div className="cg-offer-bundles-grid">
        {filteredBundles.map((b) => (
          <div
            key={b.id}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--cg-radius-xl, 20px)',
              border: '1px solid var(--cg-border-light, #E5E7EB)',
              padding: '28px',
              boxShadow: 'var(--cg-shadow-card, 0 4px 20px rgba(0, 0, 0, 0.04))',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(124, 58, 237, 0.12)';
              e.currentTarget.style.borderColor = '#DDD4FA';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'var(--cg-shadow-card, 0 4px 20px rgba(0, 0, 0, 0.04))';
              e.currentTarget.style.borderColor = 'var(--cg-border-light, #E5E7EB)';
            }}
          >
            <div>
              {/* Badge & Turnaround */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    color: b.badgeColor,
                    backgroundColor: b.badgeBg,
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    border: `1px solid ${b.badgeColor}30`,
                  }}
                >
                  {b.badge}
                </span>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#6B7280',
                    backgroundColor: '#F3F4F6',
                    padding: '3px 8px',
                    borderRadius: '6px',
                  }}
                >
                  <Clock size={12} />
                  <span>{b.turnaround}</span>
                </span>
              </div>

              {/* Title & Tagline */}
              <h3
                style={{
                  fontFamily: 'var(--cg-font-heading, "Plus Jakarta Sans", sans-serif)',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#111827',
                  margin: '0 0 6px 0',
                }}
              >
                {b.title}
              </h3>

              <p style={{ fontSize: '0.84375rem', color: '#4B5563', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                {b.tagline}
              </p>

              {/* Included Services Tags */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9CA3AF', marginBottom: '8px' }}>
                  INCLUDED SPECIALIST SPRINT SERVICES:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {b.services.map((s, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        backgroundColor: '#F9FAFB',
                        border: '1px solid #F3F4F6',
                      }}
                    >
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          backgroundColor: s.bg,
                          color: s.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <s.icon size={13} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1F2937' }}>
                          {s.name}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deliverables Checklist */}
              <div style={{ marginBottom: '22px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9CA3AF', marginBottom: '8px' }}>
                  KEY DELIVERABLES:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {b.deliverables.slice(0, 3).map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.78125rem', color: '#374151' }}>
                      <CheckCircle2 size={13} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing & CTA */}
            <div style={{ paddingTop: '16px', borderTop: '1px solid #F3F4F6' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#111827' }}>
                      ${b.bundlePrice}
                    </span>
                    <span style={{ fontSize: '0.875rem', color: '#9CA3AF', textDecoration: 'line-through' }}>
                      ${b.originalPrice}
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', backgroundColor: '#ECFDF5', padding: '1px 6px', borderRadius: '4px' }}>
                      {b.savingsPercent} OFF
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#6B7280' }}>All-inclusive turnkey bundle</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleClaim(b)}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                  color: '#FFFFFF',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 3px 10px rgba(124, 58, 237, 0.28)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
              >
                <span>Request {b.title.split(' ')[0]} Bundle</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
