import {
  Compass,
  PenTool,
  Code,
  Target,
  Building2,
  Users,
  Presentation,
  Rocket,
  Search,
  CheckCircle2,
  Zap,
  Sparkles,
  ShieldCheck,
  FileText,
  Smartphone,
  Terminal,
  Layers,
  Globe
} from 'lucide-react';

/**
 * CreativeGini Services Catalog
 * Authoritative registry of all services across BOOSTING & DIGITALISING channels.
 */
export const SERVICES_CATALOG = [
  // ==========================================
  // BOOSTING SERVICES
  // ==========================================
  {
    id: 'strategic-planner',
    slug: 'strategic-planner',
    channel: 'boosting',
    channelLabel: 'Boosting',
    name: 'Strategic Planner',
    shortTitle: 'Strategic Plan',
    headline: 'Build a focused growth and marketing plan for your business.',
    shortDesc: 'Comprehensive growth positioning, ICP narrative frameworks, and quarterly multi-channel execution plans.',
    description: 'Our senior marketing strategists analyze your business model, competitive landscape, and audience positioning to create an actionable, high-conviction growth playbook.',
    icon: Compass,
    iconColor: '#EC4899',
    iconBg: '#FDF2F8',
    turnaround: '48–72 Hours',
    startingPrice: 19,
    backendServiceType: 'COMPANY_BOOST',
    backendSubService: 'STRATEGIC_PLAN',
    whatYouGet: [
      'Comprehensive Market & Positioning Architecture (3 months plan)',
      'Target ICP Narrative & Value Proposition Framework',
      'Multi-Channel Outbound Sequencing Strategy',
      'Quarterly KPIs, Resource Planning & Playbook'
    ],
    deliverablesSpec: [
      { title: 'Growth Architecture Deck', format: 'Interactive PDF & Notion', icon: FileText },
      { title: 'Audience Matrix & ICP Maps', format: 'Structured Spreadsheet', icon: Target },
      { title: 'Outbound Playbook Sequences', format: 'Ready-to-deploy Copy', icon: Zap }
    ],
    idealFor: 'Founders and growth leaders launching new campaigns or repositioning for scale.'
  },
  {
    id: 'content-creator',
    slug: 'content-creator',
    channel: 'boosting',
    channelLabel: 'Boosting',
    name: 'Content Creator',
    shortTitle: 'Content Sprint',
    headline: 'High-impact narrative copy, branded creative assets, and content engines.',
    shortDesc: 'High-conversion sales collateral, technical thought leadership essays, branded visual assets, and executive copy.',
    description: 'Transform complex product offerings into magnetic content. Our specialized copywriters and creatives produce polished sales collateral, executive articles, and conversion-optimized narratives.',
    icon: PenTool,
    iconColor: '#F43F5E',
    iconBg: '#FFF1F2',
    turnaround: '48–72 Hours',
    startingPrice: 29,
    backendServiceType: 'COMPANY_BOOST',
    backendSubService: 'CONTENT',
    whatYouGet: [
      'Conversion-Optimized Sales Collateral (2 posters + 3 reels + 1 branding)',
      'High-Definition Executive Thought Leadership Articles',
      'Visual Social Creative Assets & Infographics',
      'Email Nurture & Announcement Sequences'
    ],
    deliverablesSpec: [
      { title: 'Narrative Copy & One-Pagers', format: 'Google Docs / Figma / PDF', icon: FileText },
      { title: 'Branded Social Creative Pack', format: 'High-Res PNG / SVG Assets', icon: Sparkles },
      { title: 'Executive Ghostwriting Drafts', format: 'Longform Markdown / HTML', icon: PenTool }
    ],
    idealFor: 'B2B companies seeking authoritative brand voice and high-converting marketing collateral.'
  },
  {
    id: 'devrel',
    slug: 'devrel',
    channel: 'boosting',
    channelLabel: 'Boosting',
    name: 'DevRel & Technical Advocacy',
    shortTitle: 'DevRel',
    headline: 'Developer advocacy, technical community engagement, and developer-first positioning.',
    shortDesc: 'Developer advocacy, technical documentation reviews, code samples, and developer-first product positioning.',
    description: 'Built specifically for developer tools, APIs, and technical products. Our engineering specialists audit your documentation, write technical guides, and create engaging developer content.',
    icon: Code,
    iconColor: '#8B5CF6',
    iconBg: '#F5F3FF',
    turnaround: '48–72 Hours',
    startingPrice: 49,
    backendServiceType: 'COMPANY_BOOST',
    backendSubService: 'DEVREL_PLAN',
    whatYouGet: [
      'Developer Experience (DX) & Documentation Telemetry Audit',
      'Hands-On Quickstart Guides & Sample Code Repositories',
      'Technical Blog Posts & Architectural Deep-Dives',
      'Community, content creation & developer feedback strategy'
    ],
    deliverablesSpec: [
      { title: 'DX & Docs Assessment Report', format: 'Detailed Technical PDF', icon: FileText },
      { title: 'Code Samples & Starter Kits', format: 'GitHub Repository / Gist', icon: Code },
      { title: 'Technical Guide & Deep-Dive', format: 'Markdown with Diagrams', icon: Zap }
    ],
    idealFor: 'DevTool, SaaS API, and Web3 founders targeting engineering teams and developer decision-makers.'
  },
  {
    id: 'gtm',
    slug: 'gtm',
    altSlug: 'gtm-strategy',
    channel: 'boosting',
    channelLabel: 'Boosting',
    name: 'GTM Strategy',
    shortTitle: 'GTM Strategy',
    headline: 'Launch execution blueprints, distribution channel mapping, and market traction models.',
    shortDesc: 'Operational strategy for new product rollouts, geographic expansion, distribution vectors, and launch blueprints.',
    description: 'Transform new product rollouts into high-traction events. Our senior growth operators build your launch blueprints, channel distribution architecture, and executive go-to-market collateral.',
    icon: Target,
    iconColor: '#10B981',
    iconBg: '#ECFDF5',
    turnaround: '48–72 Hours',
    startingPrice: 19,
    backendServiceType: 'COMPANY_BOOST',
    backendSubService: 'GTM_STRATEGY',
    whatYouGet: [
      'GTM Launch Playbook & 2 Months Reach Plan',
      'GTM Product Brochure & Sales Collateral Deck (PDF)',
      'Pre-Launch, Launch-Day & Post-Launch Sprint Timeline',
      'Acquisition Metrics, CAC Projections & KPI Scorecard'
    ],
    deliverablesSpec: [
      { title: 'GTM Launch Playbook', format: 'Interactive Notion & PDF', icon: FileText },
      { title: 'Product Brochure Collateral', format: 'High-Res Presentation / PDF', icon: Presentation },
      { title: 'Distribution Roadmap & KPI Matrix', format: 'Structured Roadmap Spreadsheet', icon: Target }
    ],
    idealFor: 'Founders and product leaders launching new products, features, or expanding into new target markets.'
  },
  {
    id: 'ad-creatives',
    slug: 'ad-creatives',
    altSlug: 'ads',
    channel: 'boosting',
    channelLabel: 'Boosting',
    name: 'Ad Creatives',
    shortTitle: 'Ad Creatives',
    headline: 'High-converting ad banners, social creatives, display assets, and variant copy angles.',
    shortDesc: 'Conversion-focused creative production for Meta, LinkedIn, Google Display, and X advertising campaigns.',
    description: 'Stop burning ad budget on low-CTR creatives. Our specialist designers and copywriters produce high-converting static banners, carousel packs, and multi-angle ad copy tailored to your target platform.',
    icon: Sparkles,
    iconColor: '#EF4444',
    iconBg: '#FEF2F2',
    turnaround: '48–72 Hours',
    startingPrice: 10,
    backendServiceType: 'COMPANY_BOOST',
    backendSubService: 'AD_CREATIVES',
    whatYouGet: [
      'Multi-Format Visual Ad Creative Pack (4 posters + boosting angles)',
      'High-CTR Ad Copy Angles & Compelling Hook Variants',
      'A/B Creative Testing Matrix & Audience Angle Guide',
      'Production-Ready PNG / SVG Asset Source Files'
    ],
    deliverablesSpec: [
      { title: 'Visual Ad Creative Pack', format: 'PNG, SVG & Figma Components', icon: Sparkles },
      { title: 'Ad Copy Angles & Hooks', format: 'Structured Copy Sheet (Notion / Sheets)', icon: FileText },
      { title: 'A/B Testing Matrix', format: 'Campaign Variant Guide', icon: Zap }
    ],
    idealFor: 'Growth marketers and founders running paid campaigns on Meta, LinkedIn, Google, or X.'
  },
  {
    id: 'brand-identity',
    slug: 'brand-identity',
    channel: 'boosting',
    channelLabel: 'Boosting',
    name: 'Brand Identity & Positioning',
    shortTitle: 'Brand Identity',
    headline: 'Establish a distinctive brand voice, visual guidelines, and market differentiation.',
    shortDesc: 'Brand architecture, core narrative, visual design language, platforms access like Meta + Insta + Facebook.',
    description: 'Elevate your brand with cohesive positioning and modern visual identity across social and web platforms.',
    icon: ShieldCheck,
    iconColor: '#3B82F6',
    iconBg: '#EFF6FF',
    turnaround: '48–72 Hours',
    startingPrice: 5,
    backendServiceType: 'COMPANY_BOOST',
    backendSubService: 'STRATEGIC_PLAN',
    whatYouGet: [
      'Brand Identity & Positioning across platforms (Meta + Instagram + Facebook)',
      'Core Narrative Architecture & Positioning Matrix',
      'Typography, Color Palette & Vector Logo Lockups',
      'Executive Elevator Pitch & Tone-of-Voice Playbook'
    ],
    deliverablesSpec: [
      { title: 'Brand Identity Guidelines', format: 'Interactive PDF & Figma Kit', icon: FileText },
      { title: 'Positioning & Tone Playbook', format: 'Structured Playbook Document', icon: Compass },
      { title: 'Vector Asset Pack', format: 'High-Res SVG & PNG Files', icon: Sparkles }
    ],
    idealFor: 'Founders and marketing leaders launching or refreshing their corporate brand identity.'
  },

  // ==========================================
  // DIGITALISING SERVICES
  // ==========================================
  {
    id: 'lead-research',
    slug: 'lead-research',
    channel: 'digitalising',
    channelLabel: 'Digitalising',
    name: 'Lead Research',
    shortTitle: 'Lead Research',
    headline: 'Find relevant companies and verified prospect contact intelligence ($2 per lead).',
    shortDesc: 'Hand-verified prospect contact intelligence tailored to your ideal customer profile ($2 per lead).',
    description: 'Eliminate cold outreach guesswork. Our researchers hand-verify decision-makers, direct emails, phone lines, and buying committee contacts ($2 per lead).',
    icon: Target,
    iconColor: '#7C3AED',
    iconBg: '#EDE9FE',
    turnaround: '24–48 Hours',
    startingPrice: 2,
    backendServiceType: 'COMPANY_LEAD',
    backendSubService: 'LEAD_RESEARCH',
    whatYouGet: [
      'Hand-Verified Account Contacts ($2 per lead, 0% Bounce Guarantee)',
      'Lead study + Pitch Deck research assistance',
      'Decision-Maker Title, Direct Email & Verified Telemetry',
      'Account Industry, Employee Count & Revenue Segmentation'
    ],
    deliverablesSpec: [
      { title: 'Verified Lead Dossier', format: 'Clean CSV & Google Sheets', icon: Target },
      { title: 'Verification Audit Log', format: 'SMTP Verified Report', icon: ShieldCheck },
      { title: 'ICP Coverage Summary', format: 'Executive Briefing PDF', icon: FileText }
    ],
    idealFor: 'Outbound sales teams, account executives, and founders looking to fill their sales pipeline.'
  },
  {
    id: 'company-study',
    slug: 'company-study',
    channel: 'digitalising',
    channelLabel: 'Digitalising',
    name: 'Company Study',
    shortTitle: 'Company Study',
    headline: 'Get a structured personal company study, market overview, or account dossier.',
    shortDesc: 'Personal company study, tech stack telemetry, and strategic expansion insights for target accounts.',
    description: 'In-depth account intelligence on your target accounts. Understand their tech stack, key initiatives, organizational shifts, budget cycles, and strategic pain points.',
    icon: Building2,
    iconColor: '#6366F1',
    iconBg: '#EEF2FF',
    turnaround: '48–72 Hours',
    startingPrice: 1,
    backendServiceType: 'COMPANY_LEAD',
    backendSubService: 'COMPANY_STUDY',
    whatYouGet: [
      'Personal Company Study & Organizational Structure',
      'Current Tech Stack & Cloud Infrastructure Telemetry',
      'Recent Strategic Hires, Funding & Expansion Signals',
      'Tailored Talking Points for Executive Pitches'
    ],
    deliverablesSpec: [
      { title: 'Comprehensive Account Dossier', format: 'Structured PDF Report', icon: Building2 },
      { title: 'Tech Stack & Vendor Map', format: 'Visual Architecture Matrix', icon: Code },
      { title: 'Executive Intelligence Briefing', format: 'Slide Deck / PDF', icon: Presentation }
    ],
    idealFor: 'Enterprise sales reps preparing for high-stakes enterprise sales calls and ABM campaigns.'
  },
  {
    id: 'key-people',
    slug: 'key-people',
    channel: 'digitalising',
    channelLabel: 'Digitalising',
    name: 'Key People Research',
    shortTitle: 'Key People',
    headline: 'Identify relevant decision-makers and key leadership contacts ($2).',
    shortDesc: 'Key profile and direct mail access to verified decision-makers and key leadership contacts.',
    description: 'Map the entire buying committee at target organizations. We identify primary decision-makers, internal champions, budget owners, and technical evaluators.',
    icon: Users,
    iconColor: '#0EA5E9',
    iconBg: '#F0F9FF',
    turnaround: '24–48 Hours',
    startingPrice: 2,
    backendServiceType: 'COMPANY_LEAD',
    backendSubService: 'KEY_PEOPLE',
    whatYouGet: [
      'Key Profile + Direct Email Access',
      'Full Buying Committee Mapping (Economic Buyers + Technical Leads)',
      'Verified Direct Contact Information with Phone Numbers',
      'Personalized Icebreakers & Hook Angles for Each Contact'
    ],
    deliverablesSpec: [
      { title: 'Committee Hierarchy Chart', format: 'Visual Org Chart PDF', icon: Users },
      { title: 'Contact Roster & Verification Log', format: 'Clean CSV / Spreadsheet', icon: Target },
      { title: 'Outreach Personalization Hooks', format: 'Notion / Doc Guide', icon: FileText }
    ],
    idealFor: 'Founders and SDRs conducting multi-threaded enterprise outbound.'
  },
  {
    id: 'pitch-support',
    slug: 'pitch-support',
    channel: 'digitalising',
    channelLabel: 'Digitalising',
    name: 'Pitch Support',
    shortTitle: 'Pitch Support',
    headline: 'Pitch support and competitor analysis to win high-stakes presentations ($2).',
    shortDesc: 'Pitch preparation, competitor battlecards, and persuasive data points for high-stakes pitches.',
    description: 'Arm your pitch with rock-solid data and competitor analysis. Our researchers curate market sizing models (TAM/SAM/SOM), competitor matrices, and data points that validate your thesis.',
    icon: Presentation,
    iconColor: '#10B981',
    iconBg: '#ECFDF5',
    turnaround: '48–72 Hours',
    startingPrice: 2,
    backendServiceType: 'COMPANY_LEAD',
    backendSubService: 'PITCH_SUPPORT',
    whatYouGet: [
      'Pitch Preparation + Competitor Analysis',
      'Verified Market Sizing (TAM/SAM/SOM) Calculations & Sources',
      'Competitor Feature & Pricing Battlecard Matrix',
      'Investor/Customer Pitch Talking Points Deck'
    ],
    deliverablesSpec: [
      { title: 'Market & TAM Research Brief', format: 'Data-Backed PDF Report', icon: Presentation },
      { title: 'Competitor Battlecard Deck', format: 'Figma / Keynote / PDF', icon: FileText },
      { title: 'Citation & Source Database', format: 'Searchable Spreadsheet', icon: Search }
    ],
    idealFor: 'Founders pitching investors or enterprise clients who require rigorous data validation.'
  },
  {
    id: 'custom',
    slug: 'custom',
    channel: 'custom',
    channelLabel: 'Custom Scope',
    name: 'Custom Request',
    shortTitle: 'Custom',
    headline: 'Build a customized growth sprint across multiple services and deliverables.',
    shortDesc: 'Select combinations of strategic planning, content, DevRel, or intelligence research to fit your exact business goals.',
    description: 'Define customized deliverables or multi-disciplinary sprints. Our specialized team combines research, content production, strategic roadmaps, and outreach intelligence into a single coordinated sprint.',
    icon: Sparkles,
    iconColor: '#7C3AED',
    iconBg: '#F5F3FF',
    turnaround: 'Flexible Scope',
    startingPrice: 1,
    backendServiceType: 'COMPANY_LEAD',
    backendSubService: 'CUSTOM',
    whatYouGet: [
      'Tailored Multidisciplinary Deliverable Architecture',
      'Configurable Scope Across Strategy, Content & Intelligence',
      'Dedicated Specialist Pod & Coordinated Execution',
      'Transparent Itemized Pricing Based on Scope'
    ],
    deliverablesSpec: [
      { title: 'Customized Deliverable Package', format: 'Structured Deliverables', icon: FileText },
      { title: 'Scope & Architecture Brief', format: 'Executive Summary PDF', icon: Sparkles },
      { title: 'Sprint Delivery Dashboard', format: 'Real-time Tracking', icon: Zap }
    ],
    idealFor: 'Companies with specific multidisciplinary needs or custom deliverable requirements.'
  },

  // ==========================================
  // UI / DESIGN SERVICES
  // ==========================================
  {
    id: 'ui-ux-audit',
    slug: 'ui-ux-audit',
    channel: 'design',
    channelLabel: 'UI / Design',
    name: 'UI/UX Audit',
    shortTitle: 'UX Audit',
    headline: 'Comprehensive usability evaluation, user-flow diagnostics and accessibility heuristics ($19).',
    shortDesc: 'Structured interface evaluations across visual hierarchy, responsive layout, interaction patterns, and conversion friction.',
    description: 'Empowers your product team with mock screens, prototype review, and heuristic evaluations to eliminate UX friction.',
    icon: Search,
    iconColor: '#0284C7',
    iconBg: '#F0F9FF',
    turnaround: '48–72 Hours',
    startingPrice: 19,
    backendServiceType: 'LANDING_PAGE',
    backendSubService: 'UI_UX_AUDIT',
    whatYouGet: [
      'Comprehensive UX Audit Report (PDF)',
      'Mock screens & prototype review diagnostics',
      'Heuristic Findings & Severity Matrix',
      'WCAG Accessibility & Contrast Compliance Audit'
    ],
    deliverablesSpec: [
      { title: 'Comprehensive UX Audit Report', format: 'Structured PDF Report', icon: FileText },
      { title: 'Heuristic Findings Matrix', format: 'Severity Spreadsheet', icon: Target },
      { title: 'Annotated Interface Review', format: 'Visual Wireframe Review', icon: Sparkles }
    ],
    idealFor: 'Product teams, founders, and growth leads looking to eliminate UX friction and increase landing page conversion.'
  },
  {
    id: 'figma-project',
    slug: 'figma-project',
    channel: 'design',
    channelLabel: 'UI / Design',
    name: 'Figma Project',
    shortTitle: 'Figma Files',
    headline: 'High-fidelity Figma component systems, mock screens and prototypes ($9).',
    shortDesc: 'Mock screens + prototype, component libraries, design tokens, and developer-handoff Figma files.',
    description: 'Craft production-ready component libraries, tokens, atomic UI elements, and developer-ready Figma files.',
    icon: PenTool,
    iconColor: '#8B5CF6',
    iconBg: '#F5F3FF',
    turnaround: '48–72 Hours',
    startingPrice: 9,
    backendServiceType: 'LANDING_PAGE',
    backendSubService: 'FIGMA_PROJECT',
    whatYouGet: [
      'Mock screens + interactive prototype',
      'Production Figma File Share Link',
      'Component & Design Token Specifications (PDF)',
      'Developer Handoff Redline & Layout Specs'
    ],
    deliverablesSpec: [
      { title: 'Production Figma Source File', format: 'Interactive Figma Link', icon: PenTool },
      { title: 'Component Token Specifications', format: 'Design System PDF', icon: FileText },
      { title: 'High-Res Frame Exports', format: 'PNG / SVG Vector Pack', icon: Sparkles }
    ],
    idealFor: 'Startups and engineering teams needing professional Figma UI kits and design systems.'
  },
  {
    id: 'redesign-request',
    slug: 'redesign-request',
    altSlug: 'landing-page-redesign',
    channel: 'design',
    channelLabel: 'UI / Design',
    name: 'Landing Page Redesign',
    shortTitle: 'Landing Page Redesign',
    headline: 'Full-page interface transformations, hero section redesigns, and modern conversion overhauls ($59).',
    shortDesc: 'Modern aesthetic standards, striking hero sections, intuitive layouts, and compelling visual storytelling.',
    description: 'Transform client landing pages and web apps with modern aesthetic standards, striking hero sections, intuitive layouts, and compelling visual storytelling.',
    icon: Sparkles,
    iconColor: '#EC4899',
    iconBg: '#FDF2F8',
    turnaround: '48–72 Hours',
    startingPrice: 59,
    backendServiceType: 'LANDING_PAGE',
    backendSubService: 'REDESIGN_REQUEST',
    whatYouGet: [
      'Full-Page Redesign Master Concept (PNG / SVG)',
      'Side-by-Side Before / After Comparison Deck',
      'Production Component Assets & Layout Specs',
      'Mobile Responsive Breakpoint Layouts'
    ],
    deliverablesSpec: [
      { title: 'Full-Page Redesign Master', format: 'High-Resolution Vector / PNG', icon: Sparkles },
      { title: 'Before / After Comparison Deck', format: 'Slide Deck / PDF', icon: Presentation },
      { title: 'Layout Specifications', format: 'Component Redlines', icon: FileText }
    ],
    idealFor: 'Companies seeking a modern visual identity overhaul and higher landing page conversion rates.'
  },

  // ==========================================
  // APP DEVELOPMENT SERVICES
  // ==========================================
  {
    id: 'technical-discovery',
    slug: 'technical-discovery',
    altSlug: 'api-backend',
    channel: 'development',
    channelLabel: 'App Development',
    name: 'Technical Discovery',
    shortTitle: 'Technical Discovery',
    headline: 'Technical discovery, architecture planning, and backend system feasibility ($49).',
    shortDesc: 'Architecture blueprints, technology stack evaluation, schema design, and technical feasibility reports.',
    description: 'Get deep technical feasibility, database schema planning, and API architecture before starting development.',
    icon: Terminal,
    iconColor: '#6366F1',
    iconBg: '#EEF2FF',
    turnaround: '48–72 Hours',
    startingPrice: 49,
    backendServiceType: 'LANDING_PAGE',
    backendSubService: 'API_BACKEND',
    whatYouGet: [
      'System Architecture Blueprint & Data Models',
      'Technical Feasibility & Technology Selection Report',
      'Database Schema Planning & API Contracts',
      'Interactive Swagger / Postman Specifications'
    ],
    deliverablesSpec: [
      { title: 'Architecture & Discovery Report', format: 'Technical Markdown / PDF', icon: FileText },
      { title: 'Database Schema & Seeds', format: 'SQL Migration Scripts', icon: ShieldCheck },
      { title: 'API Specification', format: 'Postman / OpenAPI Spec', icon: Code }
    ],
    idealFor: 'Founders and engineering teams establishing foundational architectures before writing code.'
  },
  {
    id: 'clickable-prototype',
    slug: 'clickable-prototype',
    altSlug: 'mobile-app',
    channel: 'development',
    channelLabel: 'App Development',
    name: 'Clickable App Prototype',
    shortTitle: 'Clickable Prototype',
    headline: 'Clickable interactive web & mobile prototypes with user authentication flows ($199).',
    shortDesc: 'Interactive high-fidelity clickable prototype for user testing, investor demos, and customer validation.',
    description: 'Transform wireframes into fully clickable, responsive prototypes for iOS, Android, and web without backend overhead.',
    icon: Smartphone,
    iconColor: '#0D9488',
    iconBg: '#F0FDFA',
    turnaround: '3–5 Days',
    startingPrice: 199,
    backendServiceType: 'LANDING_PAGE',
    backendSubService: 'MOBILE_APP',
    whatYouGet: [
      'Clickable Interactive High-Fidelity Prototype',
      'Key User Flows & Interactive Animation States',
      'Testable Shareable Web & Mobile Link',
      'User Journey & Feedback Collection Matrix'
    ],
    deliverablesSpec: [
      { title: 'Clickable Prototype URL', format: 'Live Interactive Link', icon: Zap },
      { title: 'Screen Asset Pack', format: 'Figma / High-Res PNGs', icon: Smartphone },
      { title: 'Flow Documentation', format: 'PDF Walkthrough', icon: FileText }
    ],
    idealFor: 'Startups validating app ideas with investors or beta users before full MVP development.'
  },
  {
    id: 'web-app',
    slug: 'web-app',
    altSlug: 'mvp-development',
    channel: 'development',
    channelLabel: 'App Development',
    name: 'MVP Development',
    shortTitle: 'MVP Development',
    headline: 'Production-ready web application MVP (POC + V1) with modern frontend and backend ($1,500).',
    shortDesc: 'POC + V1 turnkey full-stack application core, relational database, authentication, and deployment.',
    description: 'Engineered for startups and scale-ups. Our senior full-stack developers deliver production-grade MVP applications (POC + V1) with clean, scalable code.',
    icon: Globe,
    iconColor: '#059669',
    iconBg: '#ECFDF5',
    turnaround: '5–7 Days',
    startingPrice: 1500,
    backendServiceType: 'LANDING_PAGE',
    backendSubService: 'WEB_APP',
    whatYouGet: [
      'Full-Stack Web Application Source Code (POC + V1)',
      'Production Relational Database Schema & Authentication Engine',
      'Responsive UI & User Flow Implementation',
      'Cloud Deployment on Staging/Production Environment'
    ],
    deliverablesSpec: [
      { title: 'Production GitHub Repository', format: 'Clean Source Code', icon: Code },
      { title: 'Architecture & API Docs', format: 'Technical Markdown / PDF', icon: FileText },
      { title: 'Live Deployment URL', format: 'Staging / Production Environment', icon: Zap }
    ],
    idealFor: 'Founders and companies launching new SaaS products, customer portals, or interactive web applications.'
  }
];

export const getServiceBySlug = (slug) => {
  if (!slug) return null;
  const cleanSlug = slug.toLowerCase().trim();
  return SERVICES_CATALOG.find((s) => s.slug === cleanSlug || s.id === cleanSlug || s.altSlug === cleanSlug) || null;
};

export const getServicesByChannel = (channel) => {
  if (!channel) return [];
  const cleanChannel = channel.toLowerCase().trim();
  return SERVICES_CATALOG.filter((s) => s.channel.toLowerCase() === cleanChannel);
};
