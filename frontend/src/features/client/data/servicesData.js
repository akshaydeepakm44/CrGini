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
    startingPrice: 799,
    backendServiceType: 'COMPANY_BOOST',
    backendSubService: 'STRATEGIC_PLAN',
    whatYouGet: [
      'Comprehensive Market & Positioning Architecture',
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
    startingPrice: 799,
    backendServiceType: 'COMPANY_BOOST',
    backendSubService: 'CONTENT',
    whatYouGet: [
      'Conversion-Optimized Sales Collateral & One-Pagers',
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
    startingPrice: 799,
    backendServiceType: 'COMPANY_BOOST',
    backendSubService: 'DEVREL_PLAN',
    whatYouGet: [
      'Developer Experience (DX) & Documentation Telemetry Audit',
      'Hands-On Quickstart Guides & Sample Code Repositories',
      'Technical Blog Posts & Architectural Deep-Dives',
      'Developer Community Engagement & Hackathon Strategy'
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
    startingPrice: 799,
    backendServiceType: 'COMPANY_BOOST',
    backendSubService: 'GTM_STRATEGY',
    whatYouGet: [
      'GTM Launch Playbook & Channel Distribution Roadmap',
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
    startingPrice: 799,
    backendServiceType: 'COMPANY_BOOST',
    backendSubService: 'AD_CREATIVES',
    whatYouGet: [
      'Multi-Format Visual Ad Creative Pack (1:1, 9:16, 16:9)',
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
    headline: 'Find relevant companies and verified prospect contact intelligence.',
    shortDesc: 'High-intent accounts and verified prospect contact intelligence tailored to your ideal customer profile.',
    description: 'Eliminate cold outreach guesswork. Our human researchers hand-verify decision-makers, direct emails, phone lines, and buying committee contacts tailored to your exact ICP filters.',
    icon: Target,
    iconColor: '#7C3AED',
    iconBg: '#EDE9FE',
    turnaround: '24–48 Hours',
    startingPrice: 499,
    backendServiceType: 'COMPANY_LEAD',
    backendSubService: 'LEAD_RESEARCH',
    whatYouGet: [
      '50–200 Hand-Verified Account Contacts (0% Bounce Guarantee)',
      'Direct Business Email & Verified Phone Telemetry',
      'Decision-Maker Title, LinkedIn Profile, and Location',
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
    name: 'Company Study & Account Dossiers',
    shortTitle: 'Company Study',
    headline: 'Get a structured study of a company, market or business opportunity.',
    shortDesc: 'Deep organizational dossiers, tech stack telemetry, and strategic expansion insights for target accounts.',
    description: 'In-depth account intelligence on your highest-value target accounts. Understand their tech stack, key initiatives, organizational shifts, budget cycles, and strategic pain points.',
    icon: Building2,
    iconColor: '#6366F1',
    iconBg: '#EEF2FF',
    turnaround: '48–72 Hours',
    startingPrice: 499,
    backendServiceType: 'COMPANY_LEAD',
    backendSubService: 'COMPANY_STUDY',
    whatYouGet: [
      'Full Organizational Structure & Reporting Hierarchies',
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
    headline: 'Identify relevant decision-makers and key leadership contacts.',
    shortDesc: 'Direct access to verified decision-makers, direct emails, and key leadership reporting structures.',
    description: 'Map the entire buying committee at target organizations. We identify primary decision-makers, internal champions, budget owners, and technical evaluators.',
    icon: Users,
    iconColor: '#0EA5E9',
    iconBg: '#F0F9FF',
    turnaround: '24–48 Hours',
    startingPrice: 499,
    backendServiceType: 'COMPANY_LEAD',
    backendSubService: 'KEY_PEOPLE',
    whatYouGet: [
      'Full Buying Committee Mapping (Economic Buyers + Technical Leads)',
      'Verified Direct Contact Information with Phone Numbers',
      'Career Background & Recent Public Comments / Podcasts',
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
    name: 'Pitch Support & Deck Research',
    shortTitle: 'Pitch Support',
    headline: 'Get support preparing business-focused pitch material and messaging.',
    shortDesc: 'Market size estimations, competitor battlecards, and persuasive data points for high-stakes pitches.',
    description: 'Arm your pitch with rock-solid data. Our researchers curate market sizing models (TAM/SAM/SOM), competitor matrices, and data points that validate your product thesis.',
    icon: Presentation,
    iconColor: '#10B981',
    iconBg: '#ECFDF5',
    turnaround: '48–72 Hours',
    startingPrice: 499,
    backendServiceType: 'COMPANY_LEAD',
    backendSubService: 'PITCH_SUPPORT',
    whatYouGet: [
      'Verified Market Sizing (TAM/SAM/SOM) Calculations & Sources',
      'Competitor Feature & Pricing Battlecard Matrix',
      'Industry Benchmark Metrics & Customer Problem Validation Data',
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
    channel: 'digitalising',
    channelLabel: 'Digitalising',
    name: 'Custom Request',
    shortTitle: 'Custom',
    headline: 'Build a customized growth sprint across multiple services and deliverables.',
    shortDesc: 'Select combinations of strategic planning, content, DevRel, or intelligence research to fit your exact business goals.',
    description: 'Define customized deliverables or multi-disciplinary sprints. Our specialized team combines research, content production, strategic roadmaps, and outreach intelligence into a single coordinated sprint.',
    icon: Sparkles,
    iconColor: '#7C3AED',
    iconBg: '#F5F3FF',
    turnaround: 'Flexible Scope',
    startingPrice: 799,
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
    headline: 'Comprehensive usability evaluation, user-flow diagnostics and accessibility heuristics.',
    shortDesc: 'Structured interface evaluations across visual hierarchy, responsive layout, interaction patterns, and conversion friction.',
    description: 'Empowers your product team with structured interface evaluations across visual hierarchy, responsive layout, navigation, interaction patterns, and conversion friction.',
    icon: Search,
    iconColor: '#0284C7',
    iconBg: '#F0F9FF',
    turnaround: '48–72 Hours',
    startingPrice: 499,
    backendServiceType: 'LANDING_PAGE',
    backendSubService: 'UI_UX_AUDIT',
    whatYouGet: [
      'Comprehensive UX Audit Report (PDF)',
      'Heuristic Findings & Severity Matrix',
      'Annotated Interface Wireframe Review',
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
    headline: 'High-fidelity Figma component systems, interactive frames, and production-ready vector assets.',
    shortDesc: 'Component libraries, design tokens, atomic UI elements, and developer-handoff Figma files.',
    description: 'Dedicated workspace for specialist designers to craft production-ready component libraries, tokens, atomic UI elements, and developer-ready Figma files.',
    icon: PenTool,
    iconColor: '#8B5CF6',
    iconBg: '#F5F3FF',
    turnaround: '48–72 Hours',
    startingPrice: 599,
    backendServiceType: 'LANDING_PAGE',
    backendSubService: 'FIGMA_PROJECT',
    whatYouGet: [
      'Production Figma File Share Link',
      'Component & Design Token Specifications (PDF)',
      'High-Resolution Frame Exports (PNG / SVG / 2x)',
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
    channel: 'design',
    channelLabel: 'UI / Design',
    name: 'Redesign Request',
    shortTitle: 'Redesign Sprint',
    headline: 'Full-page interface transformations, hero section redesigns, and modern conversion overhauls.',
    shortDesc: 'Modern aesthetic standards, striking hero sections, intuitive layouts, and compelling visual storytelling.',
    description: 'Transform client landing pages and web apps with modern aesthetic standards, striking hero sections, intuitive layouts, and compelling visual storytelling.',
    icon: Sparkles,
    iconColor: '#EC4899',
    iconBg: '#FDF2F8',
    turnaround: '48–72 Hours',
    startingPrice: 599,
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
    id: 'web-app',
    slug: 'web-app',
    channel: 'development',
    channelLabel: 'App Development',
    name: 'Web Application MVP',
    shortTitle: 'Web App',
    headline: 'Production-ready full-stack web applications with modern frontend and backend architecture.',
    shortDesc: 'Responsive React / Next.js web applications, secure backend APIs, database schemas, and cloud deployment.',
    description: 'Engineered for startups and scale-ups. Our senior full-stack developers deliver production-grade web applications, interactive dashboards, SaaS MVPs, and custom portals with clean, scalable code.',
    icon: Globe,
    iconColor: '#059669',
    iconBg: '#ECFDF5',
    turnaround: '3–5 Days',
    startingPrice: 999,
    backendServiceType: 'LANDING_PAGE',
    backendSubService: 'WEB_APP',
    whatYouGet: [
      'Full-Stack React / Next.js Application Source Code',
      'Production Database Schema & API Integration',
      'Responsive UI & Mobile-First Optimization',
      'Vercel / AWS Cloud Deployment & CI/CD Setup'
    ],
    deliverablesSpec: [
      { title: 'Production GitHub Repository', format: 'Clean Source Code', icon: Code },
      { title: 'Architecture & API Docs', format: 'Technical Markdown / PDF', icon: FileText },
      { title: 'Live Deployment URL', format: 'Staging / Production Environment', icon: Zap }
    ],
    idealFor: 'Founders and companies launching new SaaS products, customer portals, or interactive web applications.'
  },
  {
    id: 'mobile-app',
    slug: 'mobile-app',
    channel: 'development',
    channelLabel: 'App Development',
    name: 'Mobile App Development',
    shortTitle: 'Mobile App',
    headline: 'Cross-platform iOS and Android applications built with React Native and modern native features.',
    shortDesc: 'Native performance, offline support, push notifications, and App Store / Play Store deployment readiness.',
    description: 'Bring your product to mobile with native performance. We engineer responsive, fluid mobile applications for iOS and Android with complete state management, authentication, and API integrations.',
    icon: Smartphone,
    iconColor: '#0D9488',
    iconBg: '#F0FDFA',
    turnaround: '5–7 Days',
    startingPrice: 1299,
    backendServiceType: 'LANDING_PAGE',
    backendSubService: 'MOBILE_APP',
    whatYouGet: [
      'Cross-Platform React Native App Repository',
      'iOS & Android TestFlight / APK Build Deliverables',
      'Authentication & Push Notification Systems',
      'App Store / Play Store Submission Assistance'
    ],
    deliverablesSpec: [
      { title: 'Mobile Source Repository', format: 'GitHub Repo', icon: Code },
      { title: 'Installable TestFlight / APK Builds', format: 'Mobile Binaries', icon: Smartphone },
      { title: 'App Store Submission Guide', format: 'Deployment Checklist PDF', icon: FileText }
    ],
    idealFor: 'Companies needing cross-platform mobile apps for iOS and Android with rapid turnaround.'
  },
  {
    id: 'api-backend',
    slug: 'api-backend',
    channel: 'development',
    channelLabel: 'App Development',
    name: 'API & Backend Systems',
    shortTitle: 'API & Backend',
    headline: 'Robust RESTful & GraphQL backend APIs, microservices, and database architecture.',
    shortDesc: 'Scalable server-side endpoints, PostgreSQL / MongoDB data pipelines, webhook integrations, and authentication.',
    description: 'Scale your infrastructure with rock-solid server architectures. We build performant backend endpoints, secure authentication flows, third-party API integrations (Stripe, AI, CRMs), and optimized database schemas.',
    icon: Terminal,
    iconColor: '#6366F1',
    iconBg: '#EEF2FF',
    turnaround: '48–72 Hours',
    startingPrice: 799,
    backendServiceType: 'LANDING_PAGE',
    backendSubService: 'API_BACKEND',
    whatYouGet: [
      'Secure REST / GraphQL API Microservice Endpoints',
      'PostgreSQL / Database Migration Scripts',
      'Third-Party Webhook & Service Integrations',
      'Interactive Swagger / Postman Documentation'
    ],
    deliverablesSpec: [
      { title: 'API Microservice Repository', format: 'Node.js / Python Code', icon: Code },
      { title: 'Postman Collection & API Docs', format: 'Interactive API Docs', icon: FileText },
      { title: 'Database Schema & Seeds', format: 'SQL Migration Scripts', icon: ShieldCheck }
    ],
    idealFor: 'Engineering teams needing dedicated backend endpoints, database migrations, or third-party API integrations.'
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
