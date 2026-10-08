import {
  Compass,
  PenTool,
  Image,
  Video,
  Sparkles,
  Target,
  Code2,
  FileText,
  TrendingUp,
  Layers,
  Zap,
  CheckCircle2
} from 'lucide-react';

/**
 * CreativeGini Boost Services Authoritative Registry
 * Centralized configuration for the seven Boost disciplines.
 */
export const BOOST_SERVICES = [
  {
    id: 'strategic-plans',
    slug: 'strategic-plans',
    altSlug: 'strategic-planner',
    name: 'Strategic Planner',
    shortName: 'Strategic Plan',
    category: 'strategy',
    categoryLabel: 'Growth & Strategy',
    icon: Compass,
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    borderColor: '#DDD6FE',
    headline: 'Comprehensive growth roadmaps, audience positioning, and outbound playbooks.',
    description: 'Empowers specialists to craft high-conviction market positioning architectures, ICP frameworks, and multi-channel outbound playbooks.',
    subServiceMatch: ['STRATEGIC_PLAN', 'STRATEGIC_PLANNER', 'STRATEGY', 'GROWTH_STRATEGY'],
    deliverableTypes: ['Growth Strategy Deck (PDF/Notion)', 'ICP & Audience Matrix', 'Outbound Playbook'],
    checklist: [
      'Audit client business context & current market positioning',
      'Define core ICP demographics, pain points, and triggers',
      'Synthesize value proposition and narrative pillars',
      'Assemble quarterly outbound channels and execution milestones',
      'Package strategy deck and submit for client review'
    ]
  },
  {
    id: 'content',
    slug: 'content',
    altSlug: 'content-creator',
    name: 'Content Creator',
    shortName: 'Content Sprint',
    category: 'content',
    categoryLabel: 'Narrative & Copy',
    icon: PenTool,
    color: '#EC4899',
    bgColor: '#FDF2F8',
    borderColor: '#FBCFE8',
    headline: 'High-impact narrative copy, executive articles, and branded content engines.',
    description: 'Translates client products into magnetic sales collateral, executive ghostwriting, and conversion-optimized written assets.',
    subServiceMatch: ['CONTENT', 'CONTENT_CREATOR', 'COPYWRITING', 'BLOG', 'NARRATIVE'],
    deliverableTypes: ['Sales Collateral & One-Pagers', 'Executive Thought Leadership Articles', 'Social Copy Pack'],
    checklist: [
      'Review target audience tone of voice and technical complexity',
      'Draft primary conversion copy or longform manuscript',
      'Format headings, takeaways, and visual hooks',
      'Perform brand voice consistency and accuracy check',
      'Export formatted copy doc and upload deliverables'
    ]
  },
  {
    id: 'ad-creatives',
    slug: 'ad-creatives',
    altSlug: 'ads',
    name: 'Ad Creatives',
    shortName: 'Paid Ad Creatives',
    category: 'creative',
    categoryLabel: 'Paid Acquisition',
    icon: Sparkles,
    color: '#EF4444',
    bgColor: '#FEF2F2',
    borderColor: '#FECACA',
    headline: 'High-converting ad banners, social ads, display creatives, and variant copy.',
    description: 'Conversion-focused creative production for Meta, LinkedIn, Google Display, and X ad campaigns.',
    subServiceMatch: ['AD_CREATIVES', 'ADS', 'AD_CREATIVE', 'PAID_ADS'],
    deliverableTypes: ['Multi-Format Ad Visual Pack (1:1, 9:16, 16:9)', 'Ad Copy Angles & Hooks Spreadsheet', 'A/B Test Creative Matrix'],
    checklist: [
      'Analyze campaign objective, audience targeting, and offer hooks',
      'Design high-contrast visual formats tailored to platform specs',
      'Draft primary text, headlines, and call-to-action variants',
      'Ensure ad compliance with platform text-density guidelines',
      'Package creative assets with clear file nomenclature'
    ]
  },
  {
    id: 'gtm-strategy',
    slug: 'gtm-strategy',
    altSlug: 'gtm',
    name: 'GTM Strategy',
    shortName: 'Go-To-Market',
    category: 'strategy',
    categoryLabel: 'Launch & Expansion',
    icon: Target,
    color: '#10B981',
    bgColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    headline: 'Launch execution blueprints, distribution channel mapping, and market traction models.',
    description: 'Operational strategy for new product rollouts, geographic expansion, and high-velocity distribution.',
    subServiceMatch: ['GTM_STRATEGY', 'GTM', 'GO_TO_MARKET', 'LAUNCH_STRATEGY'],
    deliverableTypes: ['GTM Strategy Brochure & Product Collateral (PDF)', 'GTM Launch Playbook & Channel Distribution Roadmap', 'Launch Timeline & KPI Scorecard'],
    checklist: [
      'Examine product readiness, positioning, and value proposition',
      'Produce comprehensive GTM product brochure and sales collateral',
      'Map primary distribution vectors (Product Hunt, outbound, partnerships)',
      'Structure pre-launch, launch-day, and post-launch sprint cadences',
      'Define acquisition metrics, CAC estimates, and traction triggers',
      'Submit brochure and complete GTM roadmap for executive review'
    ]
  },
  {
    id: 'devrel',
    slug: 'devrel',
    altSlug: 'developer-relations',
    name: 'DevRel',
    shortName: 'DevRel & Advocacy',
    category: 'developer-growth',
    categoryLabel: 'Developer Growth',
    icon: Code2,
    color: '#6366F1',
    bgColor: '#EEF2FF',
    borderColor: '#C7D2FE',
    headline: 'Developer advocacy, DX documentation telemetry, quickstarts, and code samples.',
    description: 'Specialized technical workspace for developer tools, API onboarding, code samples, and community architecture.',
    subServiceMatch: ['DEVREL', 'DEVREL_PLAN', 'DEVELOPER_RELATIONS', 'TECHNICAL_ADVOCACY', 'DOCS'],
    deliverableTypes: ['DX & API Documentation Audit Report', 'Ready-to-Use Code Samples Repository', 'Developer Quickstart Guide'],
    checklist: [
      'Conduct developer onboarding walkthrough and API telemetry check',
      'Identify onboarding hurdles, confusing error codes, or missing snippets',
      'Draft step-by-step developer guide with executable sample code',
      'Review API endpoint schemas and request/response examples',
      'Publish developer deliverable pack with architecture notes'
    ]
  }
];

/**
 * Resolves a service by slug or alias
 */
export function getBoostServiceBySlug(slug) {
  if (!slug) return null;
  const clean = slug.toLowerCase().trim();
  return (
    BOOST_SERVICES.find(
      (s) => s.slug === clean || s.id === clean || s.altSlug === clean
    ) || null
  );
}

/**
 * Detects which Boost service discipline a request belongs to
 */
export function detectBoostService(request) {
  if (!request) return BOOST_SERVICES[0];

  const sub = (request.subService || request.sub_service || '').toUpperCase().trim();
  const title = (request.title || '').toLowerCase();
  const desc = (request.description || '').toLowerCase();
  const text = `${title} ${desc}`;

  // 1. Direct subservice code match
  if (sub) {
    for (const service of BOOST_SERVICES) {
      if (service.subServiceMatch.includes(sub)) {
        return service;
      }
    }
  }

  // 2. Keyword heuristic fallback
  if (text.includes('devrel') || text.includes('developer') || text.includes('sdk') || text.includes('api doc')) {
    return BOOST_SERVICES.find((s) => s.slug === 'devrel');
  }
  if (text.includes('gtm') || text.includes('go-to-market') || text.includes('launch strategy') || text.includes('brochure') || text.includes('broucher')) {
    return BOOST_SERVICES.find((s) => s.slug === 'gtm-strategy');
  }
  if (text.includes('ad creative') || text.includes('paid ad') || text.includes('banner ad')) {
    return BOOST_SERVICES.find((s) => s.slug === 'ad-creatives');
  }
  if (text.includes('content') || text.includes('article') || text.includes('copywriting') || text.includes('narrative') || text.includes('video') || text.includes('poster')) {
    return BOOST_SERVICES.find((s) => s.slug === 'content');
  }

  // Default to Strategic Planner
  return BOOST_SERVICES[0];
}
