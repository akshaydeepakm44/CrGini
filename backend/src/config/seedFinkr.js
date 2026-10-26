import { query } from './postgres.js';

export async function seedFinkrShowcase() {
  const finkrStudy = {
    company: "Finkr",
    website: "https://finkr.co.uk",
    linkedin: "https://www.linkedin.com/company/finkr",
    industry: "Fintech, Financial Services, Embedded Finance, WealthTech, Lending & Credit",
    businessOverview: "A comprehensive fintech transformation service offering strategy, product, and technology consulting alongside venture funding facilitation for financial services and tech companies. Leveraging experts from institutions like Deutsche Bank, HSBC, and Thought Machine, Finkr offers hands-on execution in areas such as embedded finance, core banking, and AI-driven lending. The firm also provides venture funding support to secure equity or debt for scaling businesses.",
    marketPosition: "Practitioner-led approach with experts from top-tier banks (Deutsche Bank, HSBC) and core banking tech (Thought Machine). Integrated service model combining strategy, product, technology consulting, and venture funding. Key Competitors: McKinsey & Company (Fintech Practice), Deloitte (Financial Services), Thought Machine (Direct Tech/Consulting Competitor), Bain & Company (Fintech), KPMG (Financial Services Advisory). Finkr differentiates by offering 'practitioner-led' execution from former senior bankers and core banking technologists, combining strategic consulting with direct venture funding support, rather than acting as a distant advisory body.",
    keyObservations: "#1 Access to senior practitioners from Deutsche Bank, HSBC, and Thought Machine for high-level expertise.\n#2 End-to-end support from strategy and tech implementation to securing £5M+ in venture funding.\n#3 Structured, results-driven approach that moves beyond advice to actual execution ('we make it happen').\n#4 Bridging the knowledge gap with timely, expert-led training (Finkr Academy) for safe and efficient execution.\n#5 Specialized focus on 'next-gen' fintech areas like AI in lending and embedded finance.",
    potentialOpportunity: "The single best segment to target first is Series A/B fintech founders and CTOs in the UK and Nordics who are actively seeking to modernize their core banking infrastructure or secure their next round of funding. This segment aligns perfectly with Finkr's dual value proposition of technical execution (leveraging Thought Machine/Deutsche Bank expertise) and venture funding access, addressing the most critical pain points for scaling fintechs.",
    pdfAssetKey: "public-samples/finkr/company-study/9da37103-c463-48cb-a41b-2c3911a55e1e-Finkr_Dossier_Report.pdf",
    pdfFileName: "Finkr - Company Study Report.pdf",
    pdfFileSize: 449374,
    pdfMimeType: "application/pdf",
    hasPdf: true
  };

  const finkrLogo = "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://finkr.co.uk&size=128";

  const finkrLeads = [
    {
      id: "lead-finkr-1",
      name: "Scaling Fintech Founder",
      title: "Chief Executive Officer & Founder",
      company: "Finkr (Scaling Fintech)",
      companyLink: "https://finkr.co.uk",
      logo: finkrLogo,
      industry: "Fintech, Financial Services, Embedded Finance",
      location: "London, United Kingdom",
      email: "contact@finkr.co.uk",
      phone: "+44 20 7946 0912",
      isUnlocked: true,
      whySuitsBest: "Needs both technical guidance to modernize core banking and access to investors to secure the next round of funding. Pain point: Struggling to balance technical debt (legacy core banking) with the pressure to raise capital and scale quickly.",
      aboutCompany: "Fintech scale-up navigating Series A/B expansion across the UK & Nordics.",
      shortSummary: "Needs technical guidance to modernize core banking and access to investors to secure £5M+ venture funding.",
      leadStudy: {
        whyRelevant: "Direct budget authority looking for practitioner-led execution over generic consulting.",
        observedContext: "Active funding cycle with pressing technical transformation requirements.",
        potentialOpportunity: "High-impact advisory and engineering engagement for core banking modernisation.",
        suggestedApproach: "Lead with former Deutsche Bank & Thought Machine pedigree and verified funding access."
      }
    },
    {
      id: "lead-finkr-2",
      name: "Fintech CTO",
      title: "Chief Technology Officer",
      company: "Thought Machine",
      companyLink: "https://www.thoughtmachine.net",
      logo: "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.thoughtmachine.net&size=128",
      industry: "Core Banking & Cloud Systems",
      location: "London, United Kingdom",
      maskedEmail: "••••••@thoughtmachine.net",
      maskedPhone: "+44 (20) xxxxx",
      isUnlocked: false,
      whySuitsBest: "Requires expert technical advice on implementing next-gen core banking and AI-driven lending solutions. Pain point: Lacks in-house expertise in complex core banking technologies (like Thought Machine) and AI integration for credit underwriting.",
      aboutCompany: "Next-gen core banking technology platform providing cloud-native engines for leading financial institutions.",
      shortSummary: "Requires expert technical advice on implementing next-gen core banking and AI-driven lending solutions.",
      leadStudy: {
        whyRelevant: "Lead technical stakeholder vetting architecture and cloud-native core banking integrations.",
        observedContext: "Undergoing major core banking upgrade to reduce technical debt.",
        potentialOpportunity: "Hands-on implementation support leveraging Thought Machine senior engineers.",
        suggestedApproach: "Demonstrate deep architectural benchmarks and execution-first delivery."
      }
    },
    {
      id: "lead-finkr-3",
      name: "Embedded Finance Product Lead",
      title: "Head of Product, Embedded Finance",
      company: "Weavr (Embedded Banking)",
      companyLink: "https://www.weavr.io",
      logo: "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.weavr.io&size=128",
      industry: "Embedded Finance & WealthTech",
      location: "Stockholm, Sweden",
      maskedEmail: "••••••@weavr.io",
      maskedPhone: "+46 (8) xxxxx",
      isUnlocked: false,
      whySuitsBest: "Needs strategic and product consulting to integrate financial services into non-financial platforms. Pain point: Unclear on how to structure embedded finance offerings and navigate regulatory/compliance complexities while scaling.",
      aboutCompany: "Enterprise platform embedding compliant merchant banking, debit accounts, and payment rails directly into digital software.",
      shortSummary: "Needs strategic and product consulting to integrate financial services into non-financial platforms.",
      leadStudy: {
        whyRelevant: "Product strategy leader launching regulated financial services products.",
        observedContext: "Expanding into regulated payments and credit products.",
        potentialOpportunity: "End-to-end product architecture and regulatory structuring.",
        suggestedApproach: "Showcase compliance blueprints and modular banking integrations."
      }
    },
    {
      id: "lead-finkr-4",
      name: "Head of AI Lending & Risk",
      title: "VP, Credit Risk & AI Lending",
      company: "OakNorth Bank",
      companyLink: "https://www.oaknorth.co.uk",
      logo: "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.oaknorth.co.uk&size=128",
      industry: "Lending & Credit Underwriting",
      location: "London, United Kingdom",
      maskedEmail: "••••••@oaknorth.co.uk",
      maskedPhone: "+44 (20) xxxxx",
      isUnlocked: false,
      whySuitsBest: "Evaluating AI-driven credit underwriting algorithms and automated compliance systems for scaling enterprise debt facilities.",
      aboutCompany: "Digital lending and credit intelligence platform providing customized commercial debt facilities for growth businesses.",
      shortSummary: "Evaluating AI-driven credit underwriting algorithms and automated compliance systems.",
      leadStudy: {
        whyRelevant: "Risk and underwriting authority evaluating algorithmic debt models.",
        observedContext: "Deploying automated real-time credit scoring infrastructure.",
        potentialOpportunity: "Algorithm verification and AI-driven underwriting integration.",
        suggestedApproach: "Lead with specialized expertise in next-gen credit underwriting and banking standards."
      }
    },
    {
      id: "lead-finkr-5",
      name: "Fintech Venture Partner",
      title: "Partner, Growth & Venture Funding",
      company: "Augmentum Fintech",
      companyLink: "https://augmentum.vc",
      logo: "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://augmentum.vc&size=128",
      industry: "Venture Capital & Debt Financing",
      location: "London, United Kingdom",
      maskedEmail: "••••••@augmentum.vc",
      maskedPhone: "+44 (20) xxxxx",
      isUnlocked: false,
      whySuitsBest: "Syndicating £5M+ venture funding rounds alongside technical transformation advisory for mid-market and Series A/B institutions.",
      aboutCompany: "Leading publicly listed fintech venture capital investor backing high-growth European fintech innovators.",
      shortSummary: "Syndicating £5M+ venture funding rounds alongside technical transformation advisory.",
      leadStudy: {
        whyRelevant: "Investment partner evaluating technical readiness of prospective portfolio investments.",
        observedContext: "High-volume deal flow needing technical due diligence and execution support.",
        potentialOpportunity: "Co-investment structuring and technical advisory partner.",
        suggestedApproach: "Highlight dual capability of strategic venture funding and hands-on core banking delivery."
      }
    }
  ];

  const existing = await query("SELECT id FROM public_sample_showcases WHERE slug = 'finkr'");
  if (existing.rows.length === 0) {
    await query(`
      INSERT INTO public_sample_showcases (
        slug, title, company_name, description, logo_url, status, company_study, leads, lead_studies, pitch_deck, published_at
      ) VALUES (
        'finkr',
        'Finkr - Practitioner-Led Fintech Consultancy & Venture Partner',
        'Finkr',
        'London-based, practitioner-led fintech consultancy and venture funding partner helping financial services and tech companies scale through strategy, product, and technology transformation.',
        $1,
        'PUBLISHED',
        $2,
        $3,
        '[]'::jsonb,
        '{}'::jsonb,
        NOW()
      )
    `, [finkrLogo, JSON.stringify(finkrStudy), JSON.stringify(finkrLeads)]);
    console.log('[Seed] Finkr showcase inserted successfully in PostgreSQL.');
  } else {
    // Showcase already exists; preserve user edits and do not overwrite
  }
}

// Execute directly if run via CLI
if (process.argv[1]?.endsWith('seedFinkr.js')) {
  seedFinkrShowcase().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
}
