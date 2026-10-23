import { query } from './postgres.js';
import { seedFinkrShowcase } from './seedFinkr.js';

export const DEFAULT_SHOWCASES = [
  {
    "slug": "data-i2i",
    "title": "Data I2I Intelligence & Growth Showcase",
    "company_name": "Data I2I",
    "description": "Curated B2B account intelligence, qualified decision-makers, verified market observations, and customized presentation architecture prepared by DiziGini specialist teams.",
    "logo_url": "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://data-i2i.com&size=128",
    "status": "PUBLISHED",
    "company_study": {
      "company": "Data I2I",
      "industry": "Enterprise Data Analytics & AI Consulting",
      "marketPosition": "Strong footprint across mid-market and enterprise fintech and healthtech sectors, competing with boutique data consultancies through rapid POC deployment models.",
      "keyObservations": "High enterprise demand for unified data lineage and governance; client decision-makers are actively consolidating fragmented ETL silos into modern lakehouse architectures.",
      "businessOverview": "Data I2I accelerates digital transformations by architecting unified analytics pipelines, modern data warehouses, and custom AI-driven business decision engines for Fortune 1000 enterprises.",
      "potentialOpportunity": "Position bespoke AI readiness assessments to CIOs and Heads of Data Engineering navigating enterprise data governance."
    },
    "leads": [
      {
        "id": "sample-lead-1",
        "logo": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80",
        "name": "Sarah Jenkins",
        "title": "VP of Data Engineering & Cloud Architecture",
        "company": "Meridian Financial Systems",
        "industry": "Fintech & Banking",
        "location": "Boston, MA",
        "shortSummary": "Directs cloud infrastructure, enterprise warehouse migrations, and real-time transaction processing for North American banking operations."
      },
      {
        "id": "sample-lead-2",
        "logo": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=120&auto=format&fit=crop&q=80",
        "name": "Marcus Vance",
        "title": "Chief Information Officer",
        "company": "Apex Global Logistics",
        "industry": "Logistics & Supply Chain",
        "location": "Dallas, TX",
        "shortSummary": "Spearheads operational tech stack modernization, AI route optimization, and legacy ERP system retirement across 42 logistics hubs."
      },
      {
        "id": "sample-lead-3",
        "logo": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=120&auto=format&fit=crop&q=80",
        "name": "Elena Rostova",
        "title": "Head of Enterprise Analytics & BI",
        "company": "Novalis Health Sciences",
        "industry": "Healthcare & Life Sciences",
        "location": "San Francisco, CA",
        "shortSummary": "Oversees unified clinical data platforms, HIPAA-compliant predictive models, and self-service BI analytics delivery."
      },
      {
        "id": "sample-lead-4",
        "logo": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=120&auto=format&fit=crop&q=80",
        "name": "David Thorne",
        "title": "Director of Customer Insights & Growth",
        "company": "Kinetix Retail Technologies",
        "industry": "Retail & E-Commerce",
        "location": "Chicago, IL",
        "shortSummary": "Leads omnichannel customer data integration, predictive lifetime value modeling, and personalization engines."
      }
    ],
    "lead_studies": [
      {
        "id": "study-1",
        "role": "VP of Data Engineering & Cloud Architecture",
        "company": "Meridian Financial Systems",
        "leadName": "Sarah Jenkins",
        "whyRelevant": "Meridian recently initiated a 3-year cloud modernization sprint and is actively vetting specialized data architecture implementation partners.",
        "observedContext": "Currently reconciling dual legacy Teradata and Snowflake deployments across regional bank subsidiaries, resulting in cross-functional reporting bottlenecks.",
        "suggestedApproach": "Lead with peer financial case studies demonstrating automated compliance governance and zero-downtime warehouse cutovers.",
        "potentialOpportunity": "Propose a structured 6-week Data Architecture Review to audit pipelines, reduce query latency by 40%, and automate compliance monitoring."
      }
    ],
    "pitch_deck": {
      "id": "sample-pitch-deck-1",
      "title": "Data I2I Enterprise Intelligence & Growth Playbook",
      "summary": "Executive pitch deck showcasing tailored market positioning, ROI frameworks, technical architecture blueprints, and 90-day execution milestones.",
      "assetKey": "public-samples/data-i2i/4fcb33bd-629f-4cb8-82af-963d85fa8a90-Data_I2I_Enterprise_Growth_Playbook.pdf",
      "fileName": "Data_I2I_Enterprise_Growth_Playbook.pdf",
      "fileSize": 685,
      "mimeType": "application/pdf",
      "previewAvailable": true
    }
  },
  {
    "slug": "siift-ai",
    "title": "Intelligent Workflow Automation & Business Growth Blueprint",
    "company_name": "siift",
    "description": "An agentic AI operating system that helps founders and small teams research, validate, and automate business growth with a privacy-first, memory-driven approach.",
    "logo_url": "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://siift.ai&size=128",
    "status": "PUBLISHED",
    "company_study": {
      "hasPdf": true,
      "pdfUrl": "/api/samples/siift-ai/company-study-pdf",
      "company": "siift",
      "industry": "SaaS & Software , Digital Services & Consulting,  E-commerce & D2C Brands,  Professional Services (Legal, Finance, Marketing)",
      "pdfFileName": "SHIIDT COMPANYSTUDY.pdf",
      "marketPosition": "siift differentiates by offering a specialized, privacy-focused agentic OS for business building that provides structured, evidence-backed strategic guidance, rather than a general\u0002purpose chatbot or unstructured note-taking tool.\n\nCOMPETITOR\n\n1.Notion AI \n2.ChatGPT (OpenAI) \n3.Perplexity AI \n4.Gong (for sales/strategy insights) \n5.Airtable (for structured business data)",
      "keyObservations": "1.Agentic AI Operating System: Unlike simple chatbots, siift acts as an OS that manages the entire business lifecycle from idea to growth.\n\n2.Intelligent Business Canvas: A visual, decision-ready framework that filters business ideas through practical lenses.\n\n3.Living Memory System: Scalable agentic memory that learns and evolves with the user's specific business context.\n\n4.Privacy-First Architecture: Explicitly states it does not use customer data to train external models, ensuring data security.\n\n5.Strategy as Moat: Focuses on out-thinking competition through disciplined, data-grounded guidance rather than out-spending them",
      "businessOverview": "siift is an agentic AI operating system designed to help individuals and small teams build businesses by researching ideas, validating opportunities, and automating\ngrowth strategies. It positions itself as a 'strategy-first' tool that reduces market noise and provides evidence-backed decision-making for serious builders. The\nplatform emphasizes privacy and democratizes entrepreneurial success by enabling high-efficiency business creation without requiring large corporate resources.",
      "potentialOpportunity": ""
    },
    "leads": [
      {
        "id": "lead-1791806905615",
        "logo": "/api/samples/siift-ai/leads/lead-1791806905615/logo",
        "name": "gammaux",
        "email": "darmengola@gammaux.com",
        "title": "Key Executive",
        "company": "siift",
        "industry": "",
        "linkedin": "",
        "location": "",
        "leadStudy": {
          "whyRelevant": "Direct decision authority and strategic alignment.",
          "observedContext": "Observed growth and strategic expansion.",
          "suggestedApproach": "Lead with verifiable outcomes and SLA guarantees.",
          "potentialOpportunity": "High-probability engagement for specialized outsourced execution."
        },
        "pitchDeck": {
          "title": "gammaux Proposal Pitch Deck",
          "summary": "Targeted strategic pitch deck prepared for client leadership.",
          "assetKey": "public-samples/siift-ai/leads/lead-1791806905615/pitch-deck/b9b3c8bd-abaf-4d08-97ab-cd3a1b677c1b-SHIFFT_1ST__Gammaux_PITCHDECK.pdf",
          "fileName": "SHIFFT 1ST  Gammaux PITCHDECK.pdf",
          "streamUrl": "/api/samples/siift-ai/leads/lead-1791806905615/pitch-deck",
          "downloadUrl": "/api/samples/siift-ai/leads/lead-1791806905615/pitch-deck?download=true"
        },
        "isUnlocked": true,
        "companyLink": "https://gammaux.com/",
        "companyLogo": "/api/samples/siift-ai/leads/lead-1791806905615/logo",
        "maskedEmail": "da\u2022\u2022\u2022\u2022@gammaux.com",
        "maskedPhone": "+1 (\u2022\u2022\u2022) \u2022\u2022\u2022-\u2022\u2022\u2022\u2022",
        "aboutCompany": "Enterprise organization operating in SaaS & Software , Digital Services & Consulting,  E-commerce & D2C Brands,  Professional Services (Legal, Finance, Marketing).",
        "leadStudyPdf": "/api/samples/siift-ai/leads/lead-1791806905615/lead-study-pdf",
        "logoAssetKey": "public-samples/siift-ai/leads/lead-1791806905615/logo/9a37f100-f735-4b2c-b288-6a677594f7e7-siift-ai_lead_lead-1791806905615_logo.png",
        "pitchDeckPdf": "/api/samples/siift-ai/leads/lead-1791806905615/pitch-deck",
        "shortSummary": "GammaUX is a Barcelona and Madrid-based UX and digital innovation consultancy that specializes in user experience design, user research, and digital talent acqu GammaUX leverages user research to drive innovation, but the volume of data and the need for privacy in client engagements can slow down strategic validation. Siift offers a privacy-first, agentic AI system that automates market research and structures strategic insights, allowing your team to focus on high-value UX design rather than data wrangling.",
        "whySuitsBest": "GammaUX is a Barcelona and Madrid-based UX and digital innovation consultancy that specializes in user experience design, user research, and digital talent acqu GammaUX leverages user research to drive innovation, but the volume of data and the need for privacy in client engagements can slow down strategic validation. Siift offers a privacy-first, agentic AI system that automates market research and structures strategic insights, allowing your team to focus on high-value UX design rather than data wrangling.",
        "leadStudyPdfName": "SHIIFT 1ST Gammaux LEADSTUDY.pdf",
        "pitchDeckPdfName": "SHIFFT 1ST  Gammaux PITCHDECK.pdf",
        "pitchDeckAssetKey": "public-samples/siift-ai/leads/lead-1791806905615/pitch-deck/b9b3c8bd-abaf-4d08-97ab-cd3a1b677c1b-SHIFFT_1ST__Gammaux_PITCHDECK.pdf",
        "leadStudyPdfAssetKey": "public-samples/siift-ai/leads/lead-1791806905615/lead-study/64b82b51-4665-40c6-9b82-02acba28c21a-SHIIFT_1ST_Gammaux_LEADSTUDY.pdf"
      },
      {
        "id": "lead-1791806979127",
        "logo": "/api/samples/siift-ai/leads/lead-1791806979127/logo",
        "name": "bossinfo",
        "title": "Key Executive",
        "company": "siift",
        "industry": "",
        "linkedin": "",
        "location": "",
        "leadStudy": {
          "whyRelevant": "Direct decision authority and strategic alignment.",
          "observedContext": "Observed growth and strategic expansion.",
          "suggestedApproach": "Lead with verifiable outcomes and SLA guarantees.",
          "potentialOpportunity": "High-probability engagement for specialized outsourced execution."
        },
        "pitchDeck": {
          "title": "bossinfo Proposal Pitch Deck",
          "summary": "Targeted strategic pitch deck prepared for client leadership.",
          "assetKey": "public-samples/siift-ai/leads/lead-1791806979127/pitch-deck/ea542bef-fefa-446d-8599-ccc0fe12e76d-SHIIFT_2ND_Bossinfo_PITCHDECK.pdf",
          "fileName": "SHIIFT 2ND Bossinfo PITCHDECK.pdf",
          "streamUrl": "/api/samples/siift-ai/leads/lead-1791806979127/pitch-deck",
          "downloadUrl": "/api/samples/siift-ai/leads/lead-1791806979127/pitch-deck?download=true"
        },
        "isUnlocked": false,
        "companyLink": "https://bossinfo.ch/",
        "companyLogo": "/api/samples/siift-ai/leads/lead-1791806979127/logo",
        "maskedEmail": "\u2022\u2022\u2022\u2022\u2022@company.com",
        "maskedPhone": "+1 (\u2022\u2022\u2022) \u2022\u2022\u2022-\u2022\u2022\u2022\u2022",
        "aboutCompany": "Enterprise organization operating in SaaS & Software , Digital Services & Consulting,  E-commerce & D2C Brands,  Professional Services (Legal, Finance, Marketing).",
        "leadStudyPdf": "/api/samples/siift-ai/leads/lead-1791806979127/lead-study-pdf",
        "logoAssetKey": "public-samples/siift-ai/leads/lead-1791806979127/logo/e42fa39c-6590-43b9-a553-bec7579bff30-siift-ai_lead_lead-1791806979127_logo.png",
        "pitchDeckPdf": "/api/samples/siift-ai/leads/lead-1791806979127/pitch-deck",
        "shortSummary": "Strategic decision maker aligned with key pain points.",
        "whySuitsBest": "Strategic decision maker aligned with key pain points.",
        "leadStudyPdfName": "SHIIF 2ND Bossinfo LEADSTUDY.pdf",
        "pitchDeckPdfName": "SHIIFT 2ND Bossinfo PITCHDECK.pdf",
        "pitchDeckAssetKey": "public-samples/siift-ai/leads/lead-1791806979127/pitch-deck/ea542bef-fefa-446d-8599-ccc0fe12e76d-SHIIFT_2ND_Bossinfo_PITCHDECK.pdf",
        "leadStudyPdfAssetKey": "public-samples/siift-ai/leads/lead-1791806979127/lead-study/95c70995-052e-472f-b384-659064fba731-SHIIF_2ND_Bossinfo_LEADSTUDY.pdf"
      },
      {
        "id": "lead-1791807039151",
        "logo": "/api/samples/siift-ai/leads/lead-1791807039151/logo",
        "name": "Uncapped",
        "title": "Key Executive",
        "company": "siift",
        "industry": "",
        "linkedin": "",
        "location": "",
        "leadStudy": {
          "whyRelevant": "Direct decision authority and strategic alignment.",
          "observedContext": "Observed growth and strategic expansion.",
          "suggestedApproach": "Lead with verifiable outcomes and SLA guarantees.",
          "potentialOpportunity": "High-probability engagement for specialized outsourced execution."
        },
        "pitchDeck": {
          "title": "Uncapped Proposal Pitch Deck",
          "summary": "Targeted strategic pitch deck prepared for client leadership.",
          "assetKey": "public-samples/siift-ai/leads/lead-1791807039151/pitch-deck/0d408ad9-69f3-46bd-89c9-8007775a9059-SHIIFT_5TH_Weareuncapped_PITCHDECK.pdf",
          "fileName": "SHIIFT 5TH Weareuncapped PITCHDECK.pdf",
          "streamUrl": "/api/samples/siift-ai/leads/lead-1791807039151/pitch-deck",
          "downloadUrl": "/api/samples/siift-ai/leads/lead-1791807039151/pitch-deck?download=true"
        },
        "isUnlocked": false,
        "companyLink": "https://weareuncapped.com/",
        "companyLogo": "/api/samples/siift-ai/leads/lead-1791807039151/logo",
        "maskedEmail": "\u2022\u2022\u2022\u2022\u2022@company.com",
        "maskedPhone": "+1 (\u2022\u2022\u2022) \u2022\u2022\u2022-\u2022\u2022\u2022\u2022",
        "aboutCompany": "Enterprise organization operating in SaaS & Software , Digital Services & Consulting,  E-commerce & D2C Brands,  Professional Services (Legal, Finance, Marketing).",
        "leadStudyPdf": "/api/samples/siift-ai/leads/lead-1791807039151/lead-study-pdf",
        "logoAssetKey": "public-samples/siift-ai/leads/lead-1791807039151/logo/eb3daf2a-3eed-4b41-a4b9-4478bf319312-siift-ai_lead_lead-1791807039151_logo.png",
        "pitchDeckPdf": "/api/samples/siift-ai/leads/lead-1791807039151/pitch-deck",
        "shortSummary": "Uncapped is a London-based fintech company providing fast, flexible working capital, including fixed-term loans, lines of credit, and cash advances, specificall siift provides Uncapped with an agentic AI operating system to rigorously validate their new 'Daily Payouts' product and optimize their B2B partner acquisition strategy, ensuring their 'founder-friendly' speed is backed by data-driven strategic clarity rather than guesswork.",
        "whySuitsBest": "Uncapped is a London-based fintech company providing fast, flexible working capital, including fixed-term loans, lines of credit, and cash advances, specificall siift provides Uncapped with an agentic AI operating system to rigorously validate their new 'Daily Payouts' product and optimize their B2B partner acquisition strategy, ensuring their 'founder-friendly' speed is backed by data-driven strategic clarity rather than guesswork.",
        "leadStudyPdfName": "SHIIFT 5TH Weareuncapped LEADSTUDY.pdf",
        "pitchDeckPdfName": "SHIIFT 5TH Weareuncapped PITCHDECK.pdf",
        "pitchDeckAssetKey": "public-samples/siift-ai/leads/lead-1791807039151/pitch-deck/0d408ad9-69f3-46bd-89c9-8007775a9059-SHIIFT_5TH_Weareuncapped_PITCHDECK.pdf",
        "leadStudyPdfAssetKey": "public-samples/siift-ai/leads/lead-1791807039151/lead-study/d22f362c-049f-4ca2-a5db-439d36bc39c9-SHIIFT_5TH_Weareuncapped_LEADSTUDY.pdf"
      },
      {
        "id": "lead-1791807139454",
        "logo": "/api/samples/siift-ai/leads/lead-1791807139454/logo",
        "name": "dGB Earth Sciences",
        "title": "Key Executive",
        "company": "siift",
        "industry": "",
        "linkedin": "",
        "location": "",
        "leadStudy": {
          "whyRelevant": "Direct decision authority and strategic alignment.",
          "observedContext": "Observed growth and strategic expansion.",
          "suggestedApproach": "Lead with verifiable outcomes and SLA guarantees.",
          "potentialOpportunity": "High-probability engagement for specialized outsourced execution."
        },
        "pitchDeck": {
          "title": "dGB Earth Sciences Proposal Pitch Deck",
          "summary": "Targeted strategic pitch deck prepared for client leadership.",
          "assetKey": "public-samples/siift-ai/leads/lead-1791807139454/pitch-deck/c444139e-75e9-4f78-83b0-bcfe36261cea-SHIIFT_3RD_Dgbes_PITCHDECK.pdf",
          "fileName": "SHIIFT 3RD Dgbes PITCHDECK.pdf",
          "streamUrl": "/api/samples/siift-ai/leads/lead-1791807139454/pitch-deck",
          "downloadUrl": "/api/samples/siift-ai/leads/lead-1791807139454/pitch-deck?download=true"
        },
        "isUnlocked": false,
        "companyLink": "https://dgbes.com/",
        "companyLogo": "/api/samples/siift-ai/leads/lead-1791807139454/logo",
        "maskedEmail": "\u2022\u2022\u2022\u2022\u2022@company.com",
        "maskedPhone": "+1 (\u2022\u2022\u2022) \u2022\u2022\u2022-\u2022\u2022\u2022\u2022",
        "aboutCompany": "Enterprise organization operating in SaaS & Software , Digital Services & Consulting,  E-commerce & D2C Brands,  Professional Services (Legal, Finance, Marketing).",
        "leadStudyPdf": "/api/samples/siift-ai/leads/lead-1791807139454/lead-study-pdf",
        "logoAssetKey": "public-samples/siift-ai/leads/lead-1791807139454/logo/4251f3e8-6b5e-4391-b409-abdd9e610609-siift-ai_lead_lead-1791807139454_logo.png",
        "pitchDeckPdf": "/api/samples/siift-ai/leads/lead-1791807139454/pitch-deck",
        "shortSummary": "dGB Earth Sciences is a Dutch software company founded in 1995 that provides open-source and commercial seismic interpretation software (OpendTect) powered by m While siift is designed for early-stage founders validating new ideas, dGB Earth Sciences is a mature, domain-specific software leader; the fit is poor because their operational challenges are technical and enterprise-focused, not strategic validation or market noise reduction for a new venture.",
        "whySuitsBest": "dGB Earth Sciences is a Dutch software company founded in 1995 that provides open-source and commercial seismic interpretation software (OpendTect) powered by m While siift is designed for early-stage founders validating new ideas, dGB Earth Sciences is a mature, domain-specific software leader; the fit is poor because their operational challenges are technical and enterprise-focused, not strategic validation or market noise reduction for a new venture.",
        "leadStudyPdfName": "SHIIFT 3RD Dgbes LEADSTUDY.pdf",
        "pitchDeckPdfName": "SHIIFT 3RD Dgbes PITCHDECK.pdf",
        "pitchDeckAssetKey": "public-samples/siift-ai/leads/lead-1791807139454/pitch-deck/c444139e-75e9-4f78-83b0-bcfe36261cea-SHIIFT_3RD_Dgbes_PITCHDECK.pdf",
        "leadStudyPdfAssetKey": "public-samples/siift-ai/leads/lead-1791807139454/lead-study/c13fb816-acaa-496e-8a3e-1c0a1795e80b-SHIIFT_3RD_Dgbes_LEADSTUDY.pdf"
      },
      {
        "id": "lead-1791807255659",
        "logo": "/api/samples/siift-ai/leads/lead-1791807255659/logo",
        "name": "PopSQL",
        "title": "Key Executive",
        "company": "siift",
        "industry": "",
        "linkedin": "",
        "location": "",
        "leadStudy": {
          "whyRelevant": "Direct decision authority and strategic alignment.",
          "observedContext": "Observed growth and strategic expansion.",
          "suggestedApproach": "Lead with verifiable outcomes and SLA guarantees.",
          "potentialOpportunity": "High-probability engagement for specialized outsourced execution."
        },
        "pitchDeck": {
          "title": "PopSQL Proposal Pitch Deck",
          "summary": "Targeted strategic pitch deck prepared for client leadership.",
          "assetKey": "public-samples/siift-ai/leads/lead-1791807255659/pitch-deck/6ea7ec93-ebe5-4377-88e6-e5f648caa7af-SHIIFT_4TH_Popsql_PITCHDECK.pdf",
          "fileName": "SHIIFT 4TH Popsql PITCHDECK.pdf",
          "streamUrl": "/api/samples/siift-ai/leads/lead-1791807255659/pitch-deck",
          "downloadUrl": "/api/samples/siift-ai/leads/lead-1791807255659/pitch-deck?download=true"
        },
        "isUnlocked": false,
        "companyLink": "https://popsql.com/",
        "companyLogo": "/api/samples/siift-ai/leads/lead-1791807255659/logo",
        "maskedEmail": "\u2022\u2022\u2022\u2022\u2022@company.com",
        "maskedPhone": "+1 (\u2022\u2022\u2022) \u2022\u2022\u2022-\u2022\u2022\u2022\u2022",
        "aboutCompany": "Enterprise organization operating in SaaS & Software , Digital Services & Consulting,  E-commerce & D2C Brands,  Professional Services (Legal, Finance, Marketing).",
        "leadStudyPdf": "/api/samples/siift-ai/leads/lead-1791807255659/lead-study-pdf",
        "logoAssetKey": "public-samples/siift-ai/leads/lead-1791807255659/logo/e29c1351-2cb2-4226-8f9d-463b32d2c19d-siift-ai_lead_lead-1791807255659_logo.png",
        "pitchDeckPdf": "/api/samples/siift-ai/leads/lead-1791807255659/pitch-deck",
        "shortSummary": "PopSQL is a collaborative SQL editor and data workspace that helps data teams centralize queries, visualize data, and share insights, trusted by over 2,000 comp PopSQL is a mature, funded SaaS company that has already solved the problem of idea validation and market entry, making them an inappropriate target for a tool designed to help early-stage founders structure their initial business plans.",
        "whySuitsBest": "PopSQL is a collaborative SQL editor and data workspace that helps data teams centralize queries, visualize data, and share insights, trusted by over 2,000 comp PopSQL is a mature, funded SaaS company that has already solved the problem of idea validation and market entry, making them an inappropriate target for a tool designed to help early-stage founders structure their initial business plans.",
        "leadStudyPdfName": "SHIIFT 4TH Popsql LEADSTUDY.pdf",
        "pitchDeckPdfName": "SHIIFT 4TH Popsql PITCHDECK.pdf",
        "pitchDeckAssetKey": "public-samples/siift-ai/leads/lead-1791807255659/pitch-deck/6ea7ec93-ebe5-4377-88e6-e5f648caa7af-SHIIFT_4TH_Popsql_PITCHDECK.pdf",
        "leadStudyPdfAssetKey": "public-samples/siift-ai/leads/lead-1791807255659/lead-study/7e759427-9c09-4889-914e-3bb9daedc893-SHIIFT_4TH_Popsql_LEADSTUDY.pdf"
      }
    ],
    "lead_studies": [],
    "pitch_deck": {}
  }
];

export async function seedDefaultShowcases() {
  try {
    for (const sc of DEFAULT_SHOWCASES) {
      const existing = await query('SELECT id, status FROM public_sample_showcases WHERE slug = $1', [sc.slug]);
      if (existing.rows.length === 0) {
        await query(`
          INSERT INTO public_sample_showcases (
            slug, title, company_name, description, logo_url, status,
            company_study, leads, lead_studies, pitch_deck, published_at
          )
          VALUES ($1, $2, $3, $4, $5, 'PUBLISHED', $6, $7, $8, $9, NOW())
          ON CONFLICT (slug) DO UPDATE
          SET
            title = EXCLUDED.title,
            company_name = EXCLUDED.company_name,
            description = EXCLUDED.description,
            status = 'PUBLISHED',
            company_study = EXCLUDED.company_study,
            leads = EXCLUDED.leads,
            lead_studies = EXCLUDED.lead_studies,
            pitch_deck = EXCLUDED.pitch_deck
        `, [
          sc.slug,
          sc.title,
          sc.company_name,
          sc.description,
          sc.logo_url,
          JSON.stringify(sc.company_study || {}),
          JSON.stringify(sc.leads || []),
          JSON.stringify(sc.lead_studies || []),
          JSON.stringify(sc.pitch_deck || {})
        ]);
        console.log('[Showcase Seeder] Seeded default showcase: ' + sc.company_name + ' (' + sc.slug + ')');
      } else if (existing.rows[0].status !== 'PUBLISHED') {
        await query("UPDATE public_sample_showcases SET status = 'PUBLISHED' WHERE slug = $1", [sc.slug]);
        console.log('[Showcase Seeder] Published showcase: ' + sc.slug);
      }
    }

    // Also ensure Finkr showcase is seeded
    try {
      await seedFinkrShowcase();
    } catch (fErr) {
      console.warn('[Showcase Seeder] Finkr seed note:', fErr.message);
    }
  } catch (err) {
    console.error('[Showcase Seeder] Failed to seed default showcases:', err.message);
  }
}
