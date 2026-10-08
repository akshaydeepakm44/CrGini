import {
  Search,
  PenTool,
  Sparkles,
  LayoutTemplate,
  Layers,
  Palette,
  Eye,
  Smartphone,
  Gauge,
  Sliders,
  CheckCircle2,
  FileText
} from 'lucide-react';

/**
 * CreativeGini UI/Design Services Centralized Registry
 * Authoritative configuration for the three design disciplines:
 * 1. UI/UX Audits
 * 2. Figma Projects
 * 3. Redesign Requests
 */
export const DESIGN_SERVICES = [
  {
    id: 'ui-ux-audit',
    slug: 'ui-ux-audit',
    altSlug: 'audit',
    name: 'UI/UX Audit',
    shortName: 'UX Audit',
    category: 'audit',
    categoryLabel: 'Audit & Heuristics',
    icon: Search,
    color: '#0284C7', // Sky / Cyan
    bgColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    headline: 'Comprehensive usability evaluation, user-flow diagnostics and accessibility heuristics.',
    description: 'Empowers specialists to conduct structured interface evaluations across visual hierarchy, responsive layout, navigation, interaction patterns, and conversion friction.',
    subServiceMatch: [
      'UI_UX_AUDIT',
      'AUDIT',
      'UX_AUDIT',
      'UI_AUDIT',
      'HEURISTIC_EVALUATION',
      'HEURISTICS',
      'ACCESSIBILITY_AUDIT'
    ],
    deliverableTypes: [
      'Comprehensive UX Audit Report (PDF)',
      'Heuristic Findings & Severity Matrix',
      'Annotated Interface Wireframe Review'
    ],
    checklist: [
      'Inspect client target product URLs and live digital interface flows',
      'Evaluate navigation architecture, page hierarchies, and cognitive load',
      'Analyze interactive components, affordances, and micro-states',
      'Check responsive breakpoint adaptability (Desktop, Tablet, Mobile)',
      'Assess WCAG color contrast, typography readability, and accessibility standards',
      'Synthesize high-impact conversion observations and package final audit report'
    ],
    auditDimensions: [
      { key: 'usability', label: 'Usability & Friction', icon: Eye, desc: 'Clarity of task flows, affordances, and ease of completing key conversions.' },
      { key: 'navigation', label: 'Navigation & Information Architecture', icon: LayoutTemplate, desc: 'Menu structure, content grouping, breadcrumbs, and search accessibility.' },
      { key: 'visualHierarchy', label: 'Visual Hierarchy & Typography', icon: Palette, desc: 'Focal points, typographic scale, white space rhythm, and styling harmony.' },
      { key: 'interaction', label: 'Interaction & Micro-States', icon: Sliders, desc: 'Hover, active, focus, disabled feedback states and interactive elements.' },
      { key: 'responsive', label: 'Responsive Behavior', icon: Smartphone, desc: 'Fluid layout adjustments across mobile, tablet, and widescreen breakpoints.' },
      { key: 'accessibility', label: 'Accessibility (WCAG)', icon: Gauge, desc: 'Color contrast compliance, screen-reader semantics, and readable scales.' },
      { key: 'conversion', label: 'Conversion & Value Messaging', icon: Sparkles, desc: 'CTA visibility, benefit articulation, and frictionless funnel progression.' }
    ]
  },
  {
    id: 'figma-project',
    slug: 'figma-project',
    altSlug: 'figma',
    name: 'Figma Project',
    shortName: 'Figma Files',
    category: 'figma',
    categoryLabel: 'Figma Design Systems',
    icon: PenTool,
    color: '#8B5CF6', // Purple / Violet
    bgColor: '#F5F3FF',
    borderColor: '#DDD6FE',
    headline: 'High-fidelity Figma component systems, interactive frames, and production-ready vector assets.',
    description: 'Dedicated workspace for specialist designers to craft component libraries, tokens, atomic UI elements, and developer-handoff Figma files.',
    subServiceMatch: [
      'FIGMA_PROJECT',
      'FIGMA',
      'FIGMA_DESIGN',
      'DESIGN_SYSTEM',
      'COMPONENT_LIBRARY',
      'PROTOTYPE',
      'VECTOR_ASSETS'
    ],
    deliverableTypes: [
      'Production Figma File Share Link',
      'Component & Design Token Specifications (PDF)',
      'High-Resolution Frame Exports (PNG / SVG / 2x)'
    ],
    checklist: [
      'Establish brand design tokens: color palette variables, typographic scales, spacing units',
      'Build atomic UI components utilizing auto-layout and component properties',
      'Construct complete page frames across desktop, tablet, and mobile breakpoints',
      'Organize layer hierarchy, named component variants, and interactive states',
      'Generate shareable Figma review link and export deliverable design assets'
    ]
  },
  {
    id: 'redesign-request',
    slug: 'redesign-request',
    altSlug: 'redesign',
    name: 'Redesign Request',
    shortName: 'Redesign Sprint',
    category: 'redesign',
    categoryLabel: 'Interface Redesign',
    icon: Sparkles,
    color: '#EC4899', // Pink / Magenta
    bgColor: '#FDF2F8',
    borderColor: '#FBCFE8',
    headline: 'Full-page interface transformations, hero section redesigns, and modern conversion overhauls.',
    description: 'Transform client landing pages and web apps with modern aesthetic standards, striking hero sections, intuitive layouts, and compelling visual storytelling.',
    subServiceMatch: [
      'REDESIGN_REQUEST',
      'REDESIGN',
      'LANDING_PAGE',
      'LANDING_PAGE_ENHANCEMENT',
      'PAGE_REDESIGN',
      'HERO_REDESIGN',
      'UI_REDESIGN'
    ],
    deliverableTypes: [
      'Full-Page Redesign Master Concept (PNG / SVG)',
      'Side-by-Side Before / After Comparison Deck',
      'Production Component Assets & Layout Specs'
    ],
    checklist: [
      'Review existing client website assets, brand guidelines, and reference links',
      'Identify critical redesign objectives and modern visual direction',
      'Produce upgraded hero section, narrative feature blocks, and high-impact CTAs',
      'Prepare comparative Before / After presentation visuals for client evaluation',
      'Package high-resolution design deliverables and submit for client review'
    ]
  }
];

/**
 * Resolve design service definition by slug or ID
 */
export const getDesignServiceBySlug = (slugOrId) => {
  if (!slugOrId) return DESIGN_SERVICES[2]; // Default to Redesign
  const clean = String(slugOrId).toLowerCase().trim();
  return (
    DESIGN_SERVICES.find(
      (s) => s.slug === clean || s.id === clean || s.altSlug === clean || s.category === clean
    ) || DESIGN_SERVICES[2]
  );
};

/**
 * Intelligently detect which Design discipline a ticket belongs to
 * Uses subService codes, title, description, and notes keywords
 */
export const detectDesignService = (request) => {
  if (!request) return DESIGN_SERVICES[2];

  const sub = (request.subService || request.sub_service || '').toUpperCase().trim();
  const title = (request.title || '').toLowerCase();
  const desc = (request.description || '').toLowerCase();
  const notes = typeof request.notes === 'string' ? request.notes.toLowerCase() : JSON.stringify(request.notes || '').toLowerCase();
  const combined = `${title} ${desc} ${notes}`;

  // 1. Direct subservice match
  for (const service of DESIGN_SERVICES) {
    if (service.subServiceMatch.includes(sub)) {
      return service;
    }
  }

  // 2. Keyword heuristic checks
  if (
    combined.includes('audit') ||
    combined.includes('heuristic') ||
    combined.includes('usability') ||
    combined.includes('accessibility') ||
    combined.includes('review')
  ) {
    return DESIGN_SERVICES[0]; // UI/UX Audit
  }

  if (
    combined.includes('figma') ||
    combined.includes('design system') ||
    combined.includes('component library') ||
    combined.includes('prototype') ||
    combined.includes('wireframe')
  ) {
    return DESIGN_SERVICES[1]; // Figma Project
  }

  // 3. Redesign / Enhancement (standard landing page work)
  return DESIGN_SERVICES[2]; // Redesign Request
};
