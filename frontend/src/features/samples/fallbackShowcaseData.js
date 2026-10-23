/**
 * Fallback Showcase Data for Public Intelligence Briefings
 * Ensures zero-downtime display even if database is cold, restarting, or network is intermittent.
 */

export const FALLBACK_SHOWCASES = {
  'data-i2i': {
    id: 1,
    slug: 'data-i2i',
    title: 'Data I2I Intelligence & Growth Showcase',
    companyName: 'Data I2I',
    description: 'Curated B2B account intelligence, qualified decision-makers, verified market observations, and customized presentation architecture prepared by DiziGini specialist teams.',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://data-i2i.com&size=128',
    status: 'PUBLISHED',
    companyStudy: {
      company: 'Data I2I',
      website: 'https://data-i2i.com',
      industry: 'Enterprise Data Analytics & AI Consulting',
      marketPosition: 'Strong footprint across mid-market and enterprise fintech and healthtech sectors, competing with boutique data consultancies through rapid POC deployment models.',
      keyObservations: 'High enterprise demand for unified data lineage and governance; client decision-makers are actively consolidating fragmented ETL silos into modern lakehouse architectures.',
      businessOverview: 'Data I2I accelerates digital transformations by architecting unified analytics pipelines, modern data warehouses, and custom AI-driven business decision engines for Fortune 1000 enterprises.',
      potentialOpportunity: 'Position bespoke AI readiness assessments to CIOs and Heads of Data Engineering navigating enterprise data governance.'
    },
    leads: [
      {
        id: 'sample-lead-1',
        logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
        name: 'Sarah Jenkins',
        title: 'VP of Data Engineering & Cloud Architecture',
        company: 'Meridian Financial Systems',
        industry: 'Fintech & Banking',
        location: 'Boston, MA',
        isUnlocked: true,
        shortSummary: 'Directs cloud infrastructure, enterprise warehouse migrations, and real-time transaction processing for North American banking operations.',
        whySuitsBest: 'Meridian recently initiated a 3-year cloud modernization sprint and is actively vetting specialized data architecture implementation partners.',
        leadStudy: {
          whyRelevant: 'Meridian recently initiated a 3-year cloud modernization sprint and is actively vetting specialized data architecture implementation partners.',
          observedContext: 'Currently reconciling dual legacy Teradata and Snowflake deployments across regional bank subsidiaries, resulting in cross-functional reporting bottlenecks.',
          suggestedApproach: 'Lead with peer financial case studies demonstrating automated compliance governance and zero-downtime warehouse cutovers.',
          potentialOpportunity: 'Propose a structured 6-week Data Architecture Review to audit pipelines, reduce query latency by 40%, and automate compliance monitoring.'
        }
      },
      {
        id: 'sample-lead-2',
        logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=120&auto=format&fit=crop&q=80',
        name: 'Marcus Vance',
        title: 'Chief Information Officer',
        company: 'Apex Global Logistics',
        industry: 'Logistics & Supply Chain',
        location: 'Dallas, TX',
        isUnlocked: false,
        shortSummary: 'Spearheads operational tech stack modernization, AI route optimization, and legacy ERP system retirement across 42 logistics hubs.',
        whySuitsBest: 'Spearheading cloud ERP migration and automated dispatch intelligence; seeking battle-tested integration partners.',
        leadStudy: {
          whyRelevant: 'Direct technology budget authority for North American freight corridors.',
          observedContext: 'Modernizing dispatch pipelines to lower fleet idle time by 18%.',
          suggestedApproach: 'Present modular microservices integration roadmap.',
          potentialOpportunity: 'Enterprise predictive routing contract.'
        }
      },
      {
        id: 'sample-lead-3',
        logo: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=120&auto=format&fit=crop&q=80',
        name: 'Elena Rostova',
        title: 'Head of Enterprise Analytics & BI',
        company: 'Novalis Health Sciences',
        industry: 'Healthcare & Life Sciences',
        location: 'San Francisco, CA',
        isUnlocked: false,
        shortSummary: 'Oversees unified clinical data platforms, HIPAA-compliant predictive models, and self-service BI analytics delivery.',
        whySuitsBest: 'Consolidating patient trial analytics into Snowflake with strict HIPAA compliance requirements.',
        leadStudy: {
          whyRelevant: 'Key stakeholder evaluating health data pipeline consultants.',
          observedContext: 'Migrating legacy on-prem health data stores.',
          suggestedApproach: 'Share clinical analytics governance whitepaper.',
          potentialOpportunity: 'HIPAA-grade unified data lakehouse deployment.'
        }
      },
      {
        id: 'sample-lead-4',
        logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=120&auto=format&fit=crop&q=80',
        name: 'David Thorne',
        title: 'Director of Customer Insights & Growth',
        company: 'Kinetix Retail Technologies',
        industry: 'Retail & E-Commerce',
        location: 'Chicago, IL',
        isUnlocked: false,
        shortSummary: 'Leads omnichannel customer data integration, predictive lifetime value modeling, and personalization engines.',
        whySuitsBest: 'Looking to unify real-time in-store and online shopper purchase signals to boost repeat purchases.',
        leadStudy: {
          whyRelevant: 'Owns analytics tooling decisions for digital customer journeys.',
          observedContext: 'Launching multi-brand loyalty program in Q4.',
          suggestedApproach: 'Demonstrate real-time streaming ML feature store.',
          potentialOpportunity: 'Predictive customer lifetime engine implementation.'
        }
      }
    ],
    pitchDeck: {
      id: 'sample-pitch-deck-1',
      title: 'Data I2I Enterprise Intelligence & Growth Playbook',
      summary: 'Executive pitch deck showcasing tailored market positioning, ROI frameworks, technical architecture blueprints, and 90-day execution milestones.',
      fileName: 'Data_I2I_Enterprise_Growth_Playbook.pdf',
      previewAvailable: true
    }
  },
  'siift-ai': {
    id: 2,
    slug: 'siift-ai',
    title: 'Intelligent Workflow Automation & Business Growth Blueprint',
    companyName: 'Siift AI',
    description: 'An agentic AI operating system that helps founders and small teams research, validate, and automate business growth with a privacy-first, memory-driven approach.',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://siift.ai&size=128',
    status: 'PUBLISHED',
    companyStudy: {
      company: 'Siift AI',
      website: 'https://siift.ai',
      industry: 'SaaS & Software, Digital Services & Consulting, E-Commerce & D2C Brands',
      marketPosition: 'Differentiates by offering a specialized, privacy-focused agentic OS for business building that provides structured, evidence-backed strategic guidance.',
      keyObservations: 'Agentic AI Operating System managing the full business lifecycle from idea to growth with visual canvas and living memory.',
      businessOverview: 'Siift is an agentic AI operating system designed to help individuals and small teams build businesses by researching ideas, validating opportunities, and automating growth strategies.',
      potentialOpportunity: 'Series A/B founders looking for agentic intelligence workflows.'
    },
    leads: [
      {
        id: 'lead-siift-1',
        logo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        name: 'Gammaux Leadership',
        title: 'Key Executive',
        company: 'Siift AI Ecosystem',
        industry: 'Enterprise Software',
        isUnlocked: true,
        shortSummary: 'Direct decision authority and strategic alignment with workflow automation.',
        whySuitsBest: 'Direct decision authority and strategic alignment with enterprise agentic workflows.',
        leadStudy: {
          whyRelevant: 'Direct decision authority and strategic alignment.',
          observedContext: 'Observed growth and strategic expansion.',
          suggestedApproach: 'Lead with verifiable outcomes and SLA guarantees.',
          potentialOpportunity: 'High-probability engagement for specialized outsourced execution.'
        }
      }
    ],
    pitchDeck: {
      title: 'Siift AI Proposal Pitch Deck',
      summary: 'Targeted strategic pitch deck prepared for client leadership.',
      fileName: 'Siift_AI_Executive_Pitch_Deck.pdf',
      previewAvailable: true
    }
  },
  'finkr': {
    id: 3,
    slug: 'finkr',
    title: 'Finkr Fintech Transformation & Scaling Blueprint',
    companyName: 'Finkr',
    description: 'Practitioner-led fintech consulting and venture funding facilitation for financial institutions and tech companies.',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://finkr.co.uk&size=128',
    status: 'PUBLISHED',
    companyStudy: {
      company: 'Finkr',
      website: 'https://finkr.co.uk',
      industry: 'Fintech, Financial Services, Embedded Finance, WealthTech, Lending & Credit',
      marketPosition: 'Practitioner-led approach with experts from top-tier banks (Deutsche Bank, HSBC) and core banking tech (Thought Machine).',
      keyObservations: 'End-to-end support from strategy and tech implementation to securing venture funding.',
      businessOverview: 'Comprehensive fintech transformation service offering strategy, product, and technology consulting alongside venture funding facilitation.',
      potentialOpportunity: 'Series A/B fintech founders and CTOs in the UK and Nordics.'
    },
    leads: [
      {
        id: 'lead-finkr-1',
        name: 'Scaling Fintech Founder',
        title: 'Chief Executive Officer & Founder',
        company: 'Finkr (Scaling Fintech)',
        companyLink: 'https://finkr.co.uk',
        logo: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://finkr.co.uk&size=128',
        industry: 'Fintech, Financial Services, Embedded Finance',
        location: 'London, United Kingdom',
        isUnlocked: true,
        whySuitsBest: 'Needs both technical guidance to modernize core banking and access to investors to secure next round funding.',
        aboutCompany: 'Fintech scale-up navigating Series A/B expansion across the UK & Nordics.',
        shortSummary: 'Needs technical guidance to modernize core banking and access to investors to secure £5M+ venture funding.',
        leadStudy: {
          whyRelevant: 'Direct budget authority looking for practitioner-led execution over generic consulting.',
          observedContext: 'Active funding cycle with pressing technical transformation requirements.',
          potentialOpportunity: 'High-impact advisory and engineering engagement for core banking modernisation.',
          suggestedApproach: 'Lead with former Deutsche Bank & Thought Machine pedigree and verified funding access.'
        }
      }
    ],
    pitchDeck: {
      title: 'Finkr Fintech Transformation Pitch Deck',
      summary: 'Executive pitch deck covering core banking transformation and venture acceleration.',
      fileName: 'Finkr_Transformation_Blueprint.pdf',
      previewAvailable: true
    }
  }
};

/**
 * Returns a fallback showcase matching the slug, or defaults to data-i2i
 */
export function getFallbackShowcase(slug) {
  if (!slug) return FALLBACK_SHOWCASES['data-i2i'];
  const clean = String(slug).toLowerCase().trim().replace(/[^a-z0-9]/g, '');

  if (clean.includes('i2i') || clean.includes('data')) {
    return FALLBACK_SHOWCASES['data-i2i'];
  }
  if (clean.includes('siift')) {
    return FALLBACK_SHOWCASES['siift-ai'];
  }
  if (clean.includes('finkr')) {
    return FALLBACK_SHOWCASES['finkr'];
  }

  // Exact key lookup
  const exactKey = Object.keys(FALLBACK_SHOWCASES).find((k) => k === slug.toLowerCase().trim());
  if (exactKey) {
    return FALLBACK_SHOWCASES[exactKey];
  }

  return FALLBACK_SHOWCASES['data-i2i'];
}
