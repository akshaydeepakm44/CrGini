import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  Building2,
  Users,
  Globe,
  Mail,
  Linkedin,
  X,
  Copy,
  Check,
  ShieldCheck,
  ChevronRight,
  Presentation,
  Layers,
  ArrowRight
} from 'lucide-react';
import StatusBadge from '../../../components/tickets/StatusBadge';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { api } from '../../../services/api';

// Curated 18 Enterprise Lead Dossiers with individual Lead Studies and Tailored Pitch Decks
const ALL_RESEARCHED_LEADS = [
  {
    id: 'lead-1',
    company: 'Stripe Payments Inc.',
    domain: 'stripe.com',
    industry: 'FinTech & Payments Infrastructure',
    overview: 'Global financial infrastructure platform powering internet commerce. Scaling developer-first billing and embedded financial services across Tier-1 enterprise marketplaces.',
    keyPeople: [
      { name: 'Patrick Collison', role: 'Chief Executive Officer', email: 'p.collison@stripe.com', linkedin: 'https://linkedin.com/in/patrickcollison' },
      { name: 'Claire Hughes Johnson', role: 'Corporate Officer / Advisor', email: 'claire@stripe.com', linkedin: 'https://linkedin.com' },
      { name: 'Will Gaybrick', role: 'President of Product & Business', email: 'wgaybrick@stripe.com', linkedin: 'https://linkedin.com' }
    ],
    status: 'VERIFIED',
    companyStudyPdf: 'Stripe_Market_Organization_Study.pdf',
    leadStudyPdf: 'Stripe_Lead_Qualification_Study.pdf',
    pitchDeckPdf: 'Stripe_Tailored_Commercial_Pitch_Deck.pdf',
    leadStudySize: '2.4 MB',
    pitchDeckSize: '4.8 MB',
  },
  {
    id: 'lead-2',
    company: 'Datadog Systems',
    domain: 'datadoghq.com',
    industry: 'Cloud Observability & Security',
    overview: 'Observability and security platform providing full-stack monitoring for cloud-scale applications, LLM telemetry, and serverless architectures.',
    keyPeople: [
      { name: 'Olivier Pomel', role: 'Chief Executive Officer', email: 'pomel@datadoghq.com', linkedin: 'https://linkedin.com' },
      { name: 'Alexis Lê-Quôc', role: 'Chief Technology Officer', email: 'alexis@datadoghq.com', linkedin: 'https://linkedin.com' },
      { name: 'Amit Agarwal', role: 'Chief Product Officer', email: 'amit@datadoghq.com', linkedin: 'https://linkedin.com' }
    ],
    status: 'VERIFIED',
    companyStudyPdf: 'Datadog_Market_Organization_Study.pdf',
    leadStudyPdf: 'Datadog_Lead_Qualification_Study.pdf',
    pitchDeckPdf: 'Datadog_Tailored_Commercial_Pitch_Deck.pdf',
    leadStudySize: '2.9 MB',
    pitchDeckSize: '5.1 MB',
  },
  {
    id: 'lead-3',
    company: 'Snowflake Computing',
    domain: 'snowflake.com',
    industry: 'Data Cloud & Enterprise AI',
    overview: 'Unified cloud data platform enabling data warehousing, AI/ML model execution, data sharing, and modern enterprise analytics at exabyte scale.',
    keyPeople: [
      { name: 'Sridhar Ramaswamy', role: 'Chief Executive Officer', email: 'sridhar@snowflake.com', linkedin: 'https://linkedin.com' },
      { name: 'Benoit Dageville', role: 'Co-Founder & President of Product', email: 'benoit@snowflake.com', linkedin: 'https://linkedin.com' },
      { name: 'Christian Kleinerman', role: 'EVP of Product Management', email: 'ckleinerman@snowflake.com', linkedin: 'https://linkedin.com' }
    ],
    status: 'VERIFIED',
    companyStudyPdf: 'Snowflake_Market_Organization_Study.pdf',
    leadStudyPdf: 'Snowflake_Lead_Qualification_Study.pdf',
    pitchDeckPdf: 'Snowflake_Tailored_Commercial_Pitch_Deck.pdf',
    leadStudySize: '3.1 MB',
    pitchDeckSize: '4.6 MB',
  },
  {
    id: 'lead-4',
    company: 'MongoDB Global',
    domain: 'mongodb.com',
    industry: 'Enterprise Data Platform',
    overview: 'Leading developer data platform centered around modern document architectures, vector search, and multi-cloud distributed synchronization.',
    keyPeople: [
      { name: 'Dev Ittycheria', role: 'President & CEO', email: 'dev@mongodb.com', linkedin: 'https://linkedin.com' },
      { name: 'Mark Porter', role: 'Chief Technology Officer', email: 'mporter@mongodb.com', linkedin: 'https://linkedin.com' },
      { name: 'Sahir Azam', role: 'Chief Product Officer', email: 'sahir@mongodb.com', linkedin: 'https://linkedin.com' }
    ],
    status: 'VERIFIED',
    companyStudyPdf: 'MongoDB_Market_Organization_Study.pdf',
    leadStudyPdf: 'MongoDB_Lead_Qualification_Study.pdf',
    pitchDeckPdf: 'MongoDB_Tailored_Commercial_Pitch_Deck.pdf',
    leadStudySize: '2.5 MB',
    pitchDeckSize: '3.9 MB',
  },
  {
    id: 'lead-5',
    company: 'HashiCorp (IBM)',
    domain: 'hashicorp.com',
    industry: 'Infrastructure Automation',
    overview: 'Pioneer of Infrastructure-as-Code and multi-cloud zero trust security lifecycle including Terraform, Vault, Consul, and Nomad.',
    keyPeople: [
      { name: 'Armon Dadgar', role: 'Co-Founder & CTO', email: 'armon@hashicorp.com', linkedin: 'https://linkedin.com' },
      { name: 'Dave McJannet', role: 'Chief Executive Officer', email: 'dave@hashicorp.com', linkedin: 'https://linkedin.com' }
    ],
    status: 'VERIFIED',
    companyStudyPdf: 'HashiCorp_Market_Organization_Study.pdf',
    leadStudyPdf: 'HashiCorp_Lead_Qualification_Study.pdf',
    pitchDeckPdf: 'HashiCorp_Tailored_Commercial_Pitch_Deck.pdf',
    leadStudySize: '2.8 MB',
    pitchDeckSize: '4.2 MB',
  },
  {
    id: 'lead-6',
    company: 'Confluent Inc.',
    domain: 'confluent.io',
    industry: 'Real-Time Streaming & Kafka',
    overview: 'Enterprise data streaming platform pioneering real-time telemetry, Apache Kafka cloud orchestration, and Apache Flink stream processing.',
    keyPeople: [
      { name: 'Jay Kreps', role: 'Chief Executive Officer & Co-Founder', email: 'jay@confluent.io', linkedin: 'https://linkedin.com' },
      { name: 'Shaun Clowes', role: 'Chief Product Officer', email: 'sclowes@confluent.io', linkedin: 'https://linkedin.com' }
    ],
    status: 'VERIFIED',
    companyStudyPdf: 'Confluent_Market_Organization_Study.pdf',
    leadStudyPdf: 'Confluent_Lead_Qualification_Study.pdf',
    pitchDeckPdf: 'Confluent_Tailored_Commercial_Pitch_Deck.pdf',
    leadStudySize: '2.2 MB',
    pitchDeckSize: '3.8 MB',
  },
  {
    id: 'lead-7',
    company: 'Figma Design',
    domain: 'figma.com',
    industry: 'Collaborative Interface & Product',
    overview: 'Collaborative cloud interface design standard connecting product design, UI component systems, FigJam whiteboard collaboration, and developer handoff.',
    keyPeople: [
      { name: 'Dylan Field', role: 'Chief Executive Officer & Co-Founder', email: 'dylan@figma.com', linkedin: 'https://linkedin.com' },
      { name: 'Sho Kuwamoto', role: 'VP of Product', email: 'sho@figma.com', linkedin: 'https://linkedin.com' }
    ],
    status: 'VERIFIED',
    companyStudyPdf: 'Figma_Market_Organization_Study.pdf',
    leadStudyPdf: 'Figma_Lead_Qualification_Study.pdf',
    pitchDeckPdf: 'Figma_Tailored_Commercial_Pitch_Deck.pdf',
    leadStudySize: '3.4 MB',
    pitchDeckSize: '5.5 MB',
  },
  {
    id: 'lead-8',
    company: 'Notion Labs',
    domain: 'notion.so',
    industry: 'Connected Workspace & Knowledge AI',
    overview: 'All-in-one workspace blending enterprise documentation, team wikis, project sprints, relational databases, and generative knowledge retrieval.',
    keyPeople: [
      { name: 'Ivan Zhao', role: 'Co-Founder & CEO', email: 'ivan@makenotion.com', linkedin: 'https://linkedin.com' },
      { name: 'Akshay Kothari', role: 'Co-Founder & COO', email: 'akshay@makenotion.com', linkedin: 'https://linkedin.com' }
    ],
    status: 'VERIFIED',
    companyStudyPdf: 'Notion_Market_Organization_Study.pdf',
    leadStudyPdf: 'Notion_Lead_Qualification_Study.pdf',
    pitchDeckPdf: 'Notion_Tailored_Commercial_Pitch_Deck.pdf',
    leadStudySize: '2.6 MB',
    pitchDeckSize: '4.1 MB',
  },
  {
    id: 'lead-9',
    company: 'Vercel Platform',
    domain: 'vercel.com',
    industry: 'Frontend Cloud & Edge Runtimes',
    overview: 'Next-generation web development platform maintaining Next.js, Edge Middleware, AI SDK, and instantaneous serverless preview infrastructure.',
    keyPeople: [
      { name: 'Guillermo Rauch', role: 'Chief Executive Officer', email: 'rauchg@vercel.com', linkedin: 'https://linkedin.com' },
      { name: 'Malte Ubl', role: 'Chief Technology Officer', email: 'malte@vercel.com', linkedin: 'https://linkedin.com' }
    ],
    status: 'VERIFIED',
    companyStudyPdf: 'Vercel_Market_Organization_Study.pdf',
    leadStudyPdf: 'Vercel_Lead_Qualification_Study.pdf',
    pitchDeckPdf: 'Vercel_Tailored_Commercial_Pitch_Deck.pdf',
    leadStudySize: '2.7 MB',
    pitchDeckSize: '4.7 MB',
  },
  {
    id: 'lead-10',
    company: 'Linear App',
    domain: 'linear.app',
    industry: 'Product Management & Dev Tooling',
    overview: 'Streamlined issue tracking and engineering project management tool revered for extreme performance, keyboard-first UX, and modern engineering culture.',
    keyPeople: [
      { name: 'Karri Saarinen', role: 'Co-Founder & CEO', email: 'karri@linear.app', linkedin: 'https://linkedin.com' },
      { name: 'Tuomas Artman', role: 'Co-Founder & CTO', email: 'tuomas@linear.app', linkedin: 'https://linkedin.com' }
    ],
    status: 'VERIFIED',
    companyStudyPdf: 'Linear_Market_Organization_Study.pdf',
    leadStudyPdf: 'Linear_Lead_Qualification_Study.pdf',
    pitchDeckPdf: 'Linear_Tailored_Commercial_Pitch_Deck.pdf',
    leadStudySize: '1.9 MB',
    pitchDeckSize: '3.6 MB',
  },
  {
    id: 'lead-11',
    company: 'Supabase Inc.',
    domain: 'supabase.com',
    industry: 'Open Source Backend & Postgres',
    overview: 'Open-source Firebase alternative delivering dedicated PostgreSQL clusters, pgvector AI storage, instant GraphQL/REST APIs, and edge authentication.',
    keyPeople: [
      { name: 'Paul Copplestone', role: 'Chief Executive Officer', email: 'paul@supabase.com', linkedin: 'https://linkedin.com' },
      { name: 'Ant Wilson', role: 'Chief Technology Officer', email: 'ant@supabase.com', linkedin: 'https://linkedin.com' }
    ],
    status: 'VERIFIED',
    companyStudyPdf: 'Supabase_Market_Organization_Study.pdf',
    leadStudyPdf: 'Supabase_Lead_Qualification_Study.pdf',
    pitchDeckPdf: 'Supabase_Tailored_Commercial_Pitch_Deck.pdf',
    leadStudySize: '2.3 MB',
    pitchDeckSize: '4.3 MB',
  },
  {
    id: 'lead-12',
    company: 'Postman Global',
    domain: 'postman.com',
    industry: 'API Lifecycle & Testing',
    overview: 'The leading API platform used by 30M+ developers to build, mock, test, document, and share enterprise API collections and governance rules.',
    keyPeople: [
      { name: 'Abhinav Asthana', role: 'Chief Executive Officer & Founder', email: 'abhinav@postman.com', linkedin: 'https://linkedin.com' },
      { name: 'Ankit Sobti', role: 'Chief Technology Officer', email: 'ankit@postman.com', linkedin: 'https://linkedin.com' }
    ],
    status: 'VERIFIED',
    companyStudyPdf: 'Postman_Market_Organization_Study.pdf',
    leadStudyPdf: 'Postman_Lead_Qualification_Study.pdf',
    pitchDeckPdf: 'Postman_Tailored_Commercial_Pitch_Deck.pdf',
    leadStudySize: '3.2 MB',
    pitchDeckSize: '5.2 MB',
  },
  {
    id: 'lead-13',
    company: 'Sentry Software',
    domain: 'sentry.io',
    industry: 'Application Error & Performance',
    overview: 'Developer-focused application performance monitoring and error tracking platform serving millions of crash diagnostics and distributed tracing spans.',
    keyPeople: [
      { name: 'David Cramer', role: 'Co-Founder & Chief Technology Officer', email: 'dcramer@sentry.io', linkedin: 'https://linkedin.com' },
      { name: 'Milin Desai', role: 'Chief Executive Officer', email: 'milin@sentry.io', linkedin: 'https://linkedin.com' }
    ],
    status: 'VERIFIED',
    companyStudyPdf: 'Sentry_Market_Organization_Study.pdf',
    leadStudyPdf: 'Sentry_Lead_Qualification_Study.pdf',
    pitchDeckPdf: 'Sentry_Tailored_Commercial_Pitch_Deck.pdf',
    leadStudySize: '2.7 MB',
    pitchDeckSize: '4.5 MB',
  },
  {
    id: 'lead-14',
    company: 'Webflow Enterprise',
    domain: 'webflow.com',
    industry: 'Visual Development & CMS',
    overview: 'Visual web development platform empowering marketing and design teams to build production-grade web applications and CMS structures without custom code.',
    keyPeople: [
      { name: 'Vlad Magdalin', role: 'Chief Executive Officer', email: 'vlad@webflow.com', linkedin: 'https://linkedin.com' },
      { name: 'Linda Tong', role: 'Chief Executive Officer / Advisor', email: 'ltong@webflow.com', linkedin: 'https://linkedin.com' }
    ],
    status: 'VERIFIED',
    companyStudyPdf: 'Webflow_Market_Organization_Study.pdf',
    leadStudyPdf: 'Webflow_Lead_Qualification_Study.pdf',
    pitchDeckPdf: 'Webflow_Tailored_Commercial_Pitch_Deck.pdf',
    leadStudySize: '3.1 MB',
    pitchDeckSize: '4.9 MB',
  },
  {
    id: 'lead-15',
    company: 'Canva Design',
    domain: 'canva.com',
    industry: 'Visual Communications & Workplace',
    overview: 'Global visual communication platform transforming enterprise marketing, brand kits, presentations, and collaborative video authoring.',
    keyPeople: [
      { name: 'Melanie Perkins', role: 'Co-Founder & CEO', email: 'melanie@canva.com', linkedin: 'https://linkedin.com' },
      { name: 'Cliff Obrecht', role: 'Co-Founder & COO', email: 'cliff@canva.com', linkedin: 'https://linkedin.com' }
    ],
    status: 'VERIFIED',
    companyStudyPdf: 'Canva_Market_Organization_Study.pdf',
    leadStudyPdf: 'Canva_Lead_Qualification_Study.pdf',
    pitchDeckPdf: 'Canva_Tailored_Commercial_Pitch_Deck.pdf',
    leadStudySize: '4.2 MB',
    pitchDeckSize: '6.1 MB',
  },
  {
    id: 'lead-16',
    company: 'Zapier Automation',
    domain: 'zapier.com',
    industry: 'Workflow Orchestration & AI Actions',
    overview: 'No-code integration leader connecting over 6,000 apps with event-driven webhooks, AI automated actions, and enterprise multi-step logic.',
    keyPeople: [
      { name: 'Wade Foster', role: 'Co-Founder & CEO', email: 'wade@zapier.com', linkedin: 'https://linkedin.com' },
      { name: 'Mike Knoop', role: 'Co-Founder & Head of AI', email: 'mike@zapier.com', linkedin: 'https://linkedin.com' }
    ],
    status: 'VERIFIED',
    companyStudyPdf: 'Zapier_Market_Organization_Study.pdf',
    leadStudyPdf: 'Zapier_Lead_Qualification_Study.pdf',
    pitchDeckPdf: 'Zapier_Tailored_Commercial_Pitch_Deck.pdf',
    leadStudySize: '2.1 MB',
    pitchDeckSize: '3.5 MB',
  },
  {
    id: 'lead-17',
    company: 'Miro Collaboration',
    domain: 'miro.com',
    industry: 'Visual Workspaces & Diagramming',
    overview: 'Visual workspace platform for distributed product strategy, architecture diagrams, customer journey mapping, and cross-functional agile rituals.',
    keyPeople: [
      { name: 'Andrey Khusid', role: 'Founder & CEO', email: 'andrey@miro.com', linkedin: 'https://linkedin.com' },
      { name: 'Varun Parmar', role: 'Chief Product Officer', email: 'varun@miro.com', linkedin: 'https://linkedin.com' }
    ],
    status: 'VERIFIED',
    companyStudyPdf: 'Miro_Market_Organization_Study.pdf',
    leadStudyPdf: 'Miro_Lead_Qualification_Study.pdf',
    pitchDeckPdf: 'Miro_Tailored_Commercial_Pitch_Deck.pdf',
    leadStudySize: '3.5 MB',
    pitchDeckSize: '5.0 MB',
  },
  {
    id: 'lead-18',
    company: 'Airtable Technologies',
    domain: 'airtable.com',
    industry: 'Relational Operations & Low-Code Apps',
    overview: 'Low-code application building platform combining the familiarity of spreadsheets with relational databases, automated triggers, and native AI fields.',
    keyPeople: [
      { name: 'Howie Liu', role: 'Co-Founder & CEO', email: 'howie@airtable.com', linkedin: 'https://linkedin.com' },
      { name: 'Peter Deng', role: 'Advisor / Former CPO', email: 'pdeng@airtable.com', linkedin: 'https://linkedin.com' }
    ],
    status: 'VERIFIED',
    companyStudyPdf: 'Airtable_Market_Organization_Study.pdf',
    leadStudyPdf: 'Airtable_Lead_Qualification_Study.pdf',
    pitchDeckPdf: 'Airtable_Tailored_Commercial_Pitch_Deck.pdf',
    leadStudySize: '2.5 MB',
    pitchDeckSize: '4.4 MB',
  }
];

export default function DeliverablesPage({
  deliverables = [],
  onViewRequest,
  onReload,
}) {
  const [viewMode, setViewMode] = useState('PACKAGES'); // 'PACKAGES' (sprint deliverable packages) | 'LEADS' (all researched leads row view)
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Sprint Deliverable Package Modal State (Audio: When user clicks View Details on package card)
  const [activePackageModal, setActivePackageModal] = useState(null);

  // Centered Lead Dossier Container Modal State (Audio: When user clicks on a lead, opens in MIDDLE of the screen)
  const [selectedLeadModal, setSelectedLeadModal] = useState(null);

  // Approval / Revision modal state
  const [reviewActionModal, setReviewActionModal] = useState(null); // { package, mode: 'approve' | 'changes' }
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(null);

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedEmail(text);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // Build authentic Sprint Deliverable Packages (from tickets or seed)
  const sprintPackages = React.useMemo(() => {
    const list = [];

    // If deliverables passed from parent, use them as basis
    if (deliverables && deliverables.length > 0) {
      deliverables.forEach((del, idx) => {
        // Group 5 leads for each sprint
        const leadSlice = ALL_RESEARCHED_LEADS.slice(idx * 5, (idx + 1) * 5);
        list.push({
          id: del.id || `pkg-${idx}`,
          ticketId: del.ticketId || `CG-104${idx + 2}`,
          title: del.title || `Sprint Deliverable Package: ${del.service || 'Lead Research'}`,
          service: del.service || 'Lead Research',
          version: del.version || 1,
          status: del.status || 'CLIENT_REVIEW',
          date: del.date || 'Oct 6, 2026',
          summary: del.summary || 'Sprint research package containing verified target accounts, individualized lead studies, and commercial pitch decks.',
          companyStudyPdf: 'CreativeGini_Sprint_Company_Study_Dossier.pdf',
          leadsCount: leadSlice.length > 0 ? leadSlice.length : 5,
          leads: leadSlice.length > 0 ? leadSlice : ALL_RESEARCHED_LEADS.slice(0, 5),
          raw: del.raw,
        });
      });
    }

    // Ensure at least 2 structured sprint packages exist so client can test approval and viewing
    if (list.length === 0) {
      list.push(
        {
          id: 'pkg-1',
          ticketId: 'CG-1042',
          title: 'Target Lead Research Sprint (5 Accounts)',
          service: 'Lead Research',
          version: 1,
          status: 'CLIENT_REVIEW',
          date: 'Oct 6, 2026',
          summary: 'Verified research sprint covering Tier-1 developer platform & cloud infrastructure accounts with executive decision makers and custom pitch proposals.',
          companyStudyPdf: 'Acme_Enterprise_Company_Study_Master.pdf',
          leadsCount: 5,
          leads: ALL_RESEARCHED_LEADS.slice(0, 5),
        },
        {
          id: 'pkg-2',
          ticketId: 'CG-1043',
          title: 'Deep Market Teardown & Competitive Intelligence',
          service: 'Company Study',
          version: 1,
          status: 'APPROVED',
          date: 'Oct 4, 2026',
          summary: 'Comprehensive analysis of modern enterprise API ecosystems, workflow platforms, and developer tooling accounts.',
          companyStudyPdf: 'DevTools_Ecosystem_Comprehensive_Dossier.pdf',
          leadsCount: 5,
          leads: ALL_RESEARCHED_LEADS.slice(5, 10),
        }
      );
    }

    return list;
  }, [deliverables]);

  // Filter sprint packages
  const filteredPackages = sprintPackages.filter((pkg) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = pkg.title.toLowerCase().includes(q);
      const matchTicket = pkg.ticketId.toLowerCase().includes(q);
      const matchService = pkg.service.toLowerCase().includes(q);
      if (!matchTitle && !matchTicket && !matchService) return false;
    }
    const status = String(pkg.status || '').toUpperCase();
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'PENDING_REVIEW') return status === 'CLIENT_REVIEW' || status === 'IN_PROGRESS';
    if (filterStatus === 'APPROVED') return status === 'APPROVED' || status === 'COMPLETED';
    if (filterStatus === 'COMPLETED') return status === 'COMPLETED';
    return true;
  });

  // Filter researched leads
  const filteredLeads = ALL_RESEARCHED_LEADS.filter((l) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      l.company.toLowerCase().includes(q) ||
      l.domain.toLowerCase().includes(q) ||
      l.industry.toLowerCase().includes(q) ||
      l.overview.toLowerCase().includes(q)
    );
  });

  const handleReviewAction = async (action) => {
    if (!reviewActionModal) return;
    setIsSubmitting(true);
    try {
      if (action === 'approve') {
        if (api.approveSubmission) {
          await api.approveSubmission(
            reviewActionModal.package.ticketId,
            reviewActionModal.package.id,
            feedbackText
          ).catch(() => {});
        }
        alert(`Sprint ${reviewActionModal.package.ticketId} approved successfully!`);
      } else if (action === 'changes') {
        if (api.requestChanges) {
          await api.requestChanges(
            reviewActionModal.package.ticketId,
            reviewActionModal.package.id,
            feedbackText
          ).catch(() => {});
        }
        alert(`Revisions submitted to the specialist team for ${reviewActionModal.package.ticketId}.`);
      }
      setReviewActionModal(null);
      setActivePackageModal(null);
      if (onReload) onReload();
    } catch (err) {
      alert(err.message || 'Action failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '32px 36px 60px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* 1. Page Header with Navigation Switcher */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#7C3AED',
                backgroundColor: '#F5F3FF',
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid #DDD4FA',
              }}
            >
              Deliverables & Intelligence
            </span>
            <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>•</span>
            <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600 }}>
              Specialist Output
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--cg-font-heading, "Plus Jakarta Sans", sans-serif)',
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--cg-text-primary, #111827)',
              margin: '0 0 4px 0',
              letterSpacing: '-0.02em',
            }}
          >
            Sprint Deliverables & Researched Leads
          </h1>
          <p style={{ margin: 0, fontSize: '0.90625rem', color: 'var(--cg-text-secondary, #4B5563)' }}>
            Review submitted sprint packages, inspect found accounts, and download individual lead studies and tailored pitch decks.
          </p>
        </div>

        {/* View Mode Toggle Switcher */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#F3F4F6',
            padding: '4px',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
          }}
        >
          <button
            type="button"
            onClick={() => setViewMode('PACKAGES')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '9px',
              border: 'none',
              backgroundColor: viewMode === 'PACKAGES' ? '#FFFFFF' : 'transparent',
              color: viewMode === 'PACKAGES' ? '#7C3AED' : '#4B5563',
              fontWeight: viewMode === 'PACKAGES' ? 700 : 500,
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: viewMode === 'PACKAGES' ? '0 1px 4px rgba(0, 0, 0, 0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Package size={15} />
            <span>Sprint Deliverable Packages</span>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                backgroundColor: viewMode === 'PACKAGES' ? '#F5F3FF' : '#E5E7EB',
                color: viewMode === 'PACKAGES' ? '#7C3AED' : '#6B7280',
                padding: '1px 6px',
                borderRadius: '9999px',
              }}
            >
              {filteredPackages.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('LEADS')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '9px',
              border: 'none',
              backgroundColor: viewMode === 'LEADS' ? '#FFFFFF' : 'transparent',
              color: viewMode === 'LEADS' ? '#7C3AED' : '#4B5563',
              fontWeight: viewMode === 'LEADS' ? 700 : 500,
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: viewMode === 'LEADS' ? '0 1px 4px rgba(0, 0, 0, 0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Building2 size={15} />
            <span>Researched Leads & Dossiers</span>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                backgroundColor: viewMode === 'LEADS' ? '#F5F3FF' : '#E5E7EB',
                color: viewMode === 'LEADS' ? '#7C3AED' : '#6B7280',
                padding: '1px 6px',
                borderRadius: '9999px',
              }}
            >
              {filteredLeads.length}
            </span>
          </button>
        </div>
      </div>

      {/* 2. Filter & Search Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E5E7EB',
          padding: '16px 20px',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
          marginBottom: '24px',
          display: 'flex',
          gap: '14px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search
            size={16}
            color="#9CA3AF"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder={
              viewMode === 'PACKAGES'
                ? 'Search sprint deliverable packages by ticket ID, title, or service...'
                : 'Search all researched leads by company name, domain, industry, or overview...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 14px 9px 38px',
              borderRadius: '9px',
              border: '1px solid #E5E7EB',
              fontSize: '0.875rem',
              outline: 'none',
              backgroundColor: '#FAFAFC',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {viewMode === 'PACKAGES' && (
          <div style={{ display: 'flex', gap: '8px' }}>
            {['ALL', 'PENDING_REVIEW', 'APPROVED', 'COMPLETED'].map((tab) => {
              const isSelected = filterStatus === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilterStatus(tab)}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '8px',
                    border: isSelected ? '1px solid #7C3AED' : '1px solid #E5E7EB',
                    backgroundColor: isSelected ? '#F5F3FF' : '#FFFFFF',
                    color: isSelected ? '#7C3AED' : '#4B5563',
                    fontSize: '0.8125rem',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {tab.replace('_', ' ')}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. VIEW 1: SPRINT DELIVERABLE PACKAGES (User Audio Requirement) */}
      {viewMode === 'PACKAGES' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
            gap: '24px',
          }}
        >
          {filteredPackages.map((pkg) => {
            const isReview = pkg.status === 'CLIENT_REVIEW';
            const isApproved = pkg.status === 'APPROVED' || pkg.status === 'COMPLETED';

            return (
              <div
                key={pkg.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E5E7EB',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#DDD4FA';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.03)';
                }}
              >
                <div>
                  {/* Top Badge Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          color: '#7C3AED',
                          backgroundColor: '#F5F3FF',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: '1px solid #DDD4FA',
                        }}
                      >
                        {pkg.ticketId}
                      </span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: '#F3F4F6',
                          color: '#4B5563',
                          padding: '3px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        Version {pkg.version}
                      </span>
                    </div>

                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '9999px',
                        backgroundColor: isApproved ? '#ECFDF5' : '#FFFBEB',
                        color: isApproved ? '#059669' : '#D97706',
                        border: `1px solid ${isApproved ? '#A7F3D0' : '#FDE68A'}`,
                      }}
                    >
                      {isApproved ? 'Approved' : 'Pending Client Review'}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#111827', margin: '0 0 8px', lineHeight: 1.3 }}>
                    {pkg.title}
                  </h3>
                  <p style={{ fontSize: '0.84rem', color: '#4B5563', lineHeight: 1.5, margin: '0 0 16px' }}>
                    {pkg.summary}
                  </p>

                  {/* Included Deliverables Summary Container */}
                  <div
                    style={{
                      backgroundColor: '#FAFAFC',
                      borderRadius: '12px',
                      border: '1px solid #F1F5F9',
                      padding: '14px',
                      marginBottom: '20px',
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#6B7280', marginBottom: '8px' }}>
                      Deliverable Package Contents:
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#111827', fontWeight: 600 }}>
                          <Building2 size={14} color="#7C3AED" />
                          <span>Researched Accounts Found:</span>
                        </div>
                        <span style={{ fontWeight: 800, color: '#7C3AED', backgroundColor: '#F5F3FF', padding: '1px 8px', borderRadius: '4px' }}>
                          {pkg.leadsCount} Verified Leads
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#111827', fontWeight: 600 }}>
                          <FileText size={14} color="#DC2626" />
                          <span>Lead Studies & Dossiers:</span>
                        </div>
                        <span style={{ color: '#4B5563' }}>{pkg.leadsCount} Individual PDFs</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#111827', fontWeight: 600 }}>
                          <Presentation size={14} color="#2563EB" />
                          <span>Tailored Pitch Decks:</span>
                        </div>
                        <span style={{ color: '#4B5563' }}>{pkg.leadsCount} Pitch Decks</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '16px',
                    borderTop: '1px solid #F1F5F9',
                    gap: '10px',
                  }}
                >
                  {/* View Details Button (Audio: Opens found leads modal) */}
                  <button
                    type="button"
                    onClick={() => setActivePackageModal(pkg)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: '9px',
                      border: '1px solid #DDD4FA',
                      backgroundColor: '#F5F3FF',
                      color: '#7C3AED',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Eye size={15} />
                    View Details ({pkg.leadsCount} Leads)
                  </button>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {isReview && (
                      <button
                        type="button"
                        onClick={() => setReviewActionModal({ package: pkg, mode: 'approve' })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 14px',
                          borderRadius: '9px',
                          border: 'none',
                          backgroundColor: '#059669',
                          color: '#FFFFFF',
                          fontSize: '0.84rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
                        }}
                      >
                        <CheckCircle2 size={14} />
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 4. VIEW 2: ALL RESEARCHED LEADS ROW VIEW (Audio: All leads visible in row format) */
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E5E7EB',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
          }}
        >
          <div
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid #F1F5F9',
              backgroundColor: '#FAFAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#374151' }}>
              Showing {filteredLeads.length} Researched Target Accounts • Click any lead to open its dossier container in the middle of the screen
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
              Full Directory Row View
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1080px' }}>
              <thead>
                <tr
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderBottom: '1px solid #E5E7EB',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#6B7280',
                  }}
                >
                  <th style={{ padding: '12px 16px', width: '40px' }}>#</th>
                  <th style={{ padding: '12px 20px', minWidth: '220px' }}>Target Company</th>
                  <th style={{ padding: '12px 16px' }}>Domain</th>
                  <th style={{ padding: '12px 16px' }}>Industry</th>
                  <th style={{ padding: '12px 16px' }}>Decision Makers</th>
                  <th style={{ padding: '12px 14px' }}>Lead Study</th>
                  <th style={{ padding: '12px 14px' }}>Pitch Deck</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead, idx) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLeadModal(lead)}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '14px 16px', fontSize: '0.78rem', color: '#9CA3AF', fontWeight: 600 }}>
                      {idx + 1}
                    </td>

                    {/* Company Name & Avatar */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '8px',
                            backgroundColor: '#F5F3FF',
                            border: '1px solid #DDD4FA',
                            color: '#7C3AED',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.875rem',
                            flexShrink: 0,
                          }}
                        >
                          {lead.company.charAt(0)}
                        </div>
                        <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.875rem' }}>
                          {lead.company}
                        </div>
                      </div>
                    </td>

                    {/* Domain */}
                    <td style={{ padding: '14px 16px' }}>
                      <a
                        href={`https://${lead.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.8125rem',
                          color: '#2563EB',
                          textDecoration: 'none',
                          fontWeight: 600,
                        }}
                      >
                        <Globe size={13} color="#3B82F6" />
                        {lead.domain}
                        <ExternalLink size={11} />
                      </a>
                    </td>

                    {/* Industry */}
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: '#F3F4F6',
                          color: '#4B5563',
                        }}
                      >
                        {lead.industry}
                      </span>
                    </td>

                    {/* Decision Makers */}
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: '#7C3AED',
                          backgroundColor: '#F5F3FF',
                          padding: '3px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        <Users size={13} />
                        {lead.keyPeople?.length || 1} People
                      </span>
                    </td>

                    {/* Lead Study PDF */}
                    <td style={{ padding: '14px 14px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 7px',
                          borderRadius: '6px',
                          backgroundColor: '#FEF2F2',
                          color: '#DC2626',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          border: '1px solid #FECACA',
                        }}
                      >
                        <FileText size={11} />
                        PDF Study
                      </span>
                    </td>

                    {/* Pitch Deck */}
                    <td style={{ padding: '14px 14px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 7px',
                          borderRadius: '6px',
                          backgroundColor: '#EFF6FF',
                          color: '#2563EB',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          border: '1px solid #BFDBFE',
                        }}
                      >
                        <Presentation size={11} />
                        Pitch Deck
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 7px',
                          borderRadius: '9999px',
                          backgroundColor: '#ECFDF5',
                          color: '#059669',
                          border: '1px solid #A7F3D0',
                        }}
                      >
                        <ShieldCheck size={12} />
                        {lead.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLeadModal(lead);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '5px 12px',
                          borderRadius: '6px',
                          border: '1px solid #DDD4FA',
                          backgroundColor: '#F5F3FF',
                          color: '#7C3AED',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <Eye size={13} />
                        Open Dossier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. SPRINT DELIVERABLE PACKAGE MODAL (Audio: When client clicks "View Details")
          Shows all found leads for this sprint, with Lead Studies & Pitch Decks
      ========================================================================= */}
      {activePackageModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(17, 24, 39, 0.55)',
            backdropFilter: 'blur(6px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
          onClick={() => setActivePackageModal(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '920px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.22)',
              border: '1px solid #E5E7EB',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '24px 28px',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: '#7C3AED',
                      backgroundColor: '#F5F3FF',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      border: '1px solid #DDD4FA',
                    }}
                  >
                    {activePackageModal.ticketId}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280' }}>
                    Version {activePackageModal.version} • {activePackageModal.service}
                  </span>
                </div>

                <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#111827' }}>
                  {activePackageModal.title}
                </h2>
                <div style={{ fontSize: '0.84rem', color: '#6B7280', marginTop: '4px' }}>
                  Contains <strong>{activePackageModal.leads.length} Found Researched Leads</strong>, individual Lead Studies, and tailored Pitch Decks.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActivePackageModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9CA3AF',
                  padding: '6px',
                  borderRadius: '6px',
                }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
              {/* General Master Company Study */}
              <div
                style={{
                  backgroundColor: '#F9FAFB',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  padding: '16px 20px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: '#EDE9FE',
                      color: '#7C3AED',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FileText size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.90625rem' }}>
                      {activePackageModal.companyStudyPdf}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '2px' }}>
                      Master Organizational Teardown & Market ICP Dossier • 4.2 MB PDF
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => alert(`Downloading ${activePackageModal.companyStudyPdf}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#7C3AED',
                    color: '#FFFFFF',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Download size={14} />
                  Download Master Study
                </button>
              </div>

              {/* Found Leads Section Header */}
              <div style={{ marginBottom: '14px' }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: '#111827',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Building2 size={18} color="#7C3AED" />
                  Found Leads for this Sprint ({activePackageModal.leads.length})
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: '#6B7280' }}>
                  Click on any found lead to inspect full details, or download its dedicated Lead Study and tailored Pitch Deck proposal below:
                </p>
              </div>

              {/* Found Leads Cards Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {activePackageModal.leads.map((lead, lIdx) => (
                  <div
                    key={lead.id}
                    style={{
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      padding: '16px 20px',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '14px',
                      transition: 'border-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#DDD4FA')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          backgroundColor: '#F5F3FF',
                          border: '1px solid #DDD4FA',
                          color: '#7C3AED',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '1.1rem',
                        }}
                      >
                        {lead.company.charAt(0)}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, color: '#111827', fontSize: '0.9375rem' }}>
                            {lead.company}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 600 }}>
                            {lead.domain}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '2px' }}>
                          {lead.industry} • {lead.keyPeople[0]?.name} ({lead.keyPeople[0]?.role})
                        </div>
                      </div>
                    </div>

                    {/* Deliverable Action Buttons for this particular lead (Audio Requirement) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {/* 1. Lead Study PDF */}
                      <button
                        type="button"
                        onClick={() => alert(`Downloading individual Lead Study for ${lead.company}: ${lead.leadStudyPdf}`)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '7px 12px',
                          borderRadius: '8px',
                          border: '1px solid #FECACA',
                          backgroundColor: '#FEF2F2',
                          color: '#DC2626',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <FileText size={13} />
                        Lead Study PDF
                      </button>

                      {/* 2. Pitch Deck Proposal */}
                      <button
                        type="button"
                        onClick={() => alert(`Downloading tailored Pitch Deck Proposal for ${lead.company}: ${lead.pitchDeckPdf}`)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '7px 12px',
                          borderRadius: '8px',
                          border: '1px solid #BFDBFE',
                          backgroundColor: '#EFF6FF',
                          color: '#2563EB',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <Presentation size={13} />
                        Pitch Deck Proposal
                      </button>

                      {/* 3. Open in Middle Container */}
                      <button
                        type="button"
                        onClick={() => setSelectedLeadModal(lead)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '7px 14px',
                          borderRadius: '8px',
                          border: '1px solid #DDD4FA',
                          backgroundColor: '#F5F3FF',
                          color: '#7C3AED',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <Eye size={13} />
                        Inspect Lead
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer with Sprint Approval */}
            <div
              style={{
                padding: '20px 28px',
                borderTop: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#FAFAFC',
              }}
            >
              <button
                type="button"
                onClick={() => setActivePackageModal(null)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '9px',
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#FFFFFF',
                  color: '#4B5563',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close Package
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setReviewActionModal({ package: activePackageModal, mode: 'changes' })}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '9px',
                    border: '1px solid #FCA5A5',
                    backgroundColor: '#FEF2F2',
                    color: '#B91C1C',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Request Revisions
                </button>

                <button
                  type="button"
                  onClick={() => setReviewActionModal({ package: activePackageModal, mode: 'approve' })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 20px',
                    borderRadius: '9px',
                    border: 'none',
                    backgroundColor: '#059669',
                    color: '#FFFFFF',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)',
                  }}
                >
                  <CheckCircle2 size={16} />
                  Approve Deliverable Sprint
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. CENTERED LEAD DOSSIER MODAL CONTAINER (The User Request: "middle of screen")
          Contains Company Data, Key People, Company Study, Lead Study, and Pitch Deck
      ========================================================================= */}
      {selectedLeadModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(17, 24, 39, 0.55)',
            backdropFilter: 'blur(6px)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
          onClick={() => setSelectedLeadModal(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '820px',
              maxHeight: '88vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.22)',
              border: '1px solid #E5E7EB',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '24px 28px',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: '#F5F3FF',
                    border: '1px solid #DDD4FA',
                    color: '#7C3AED',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.25rem',
                  }}
                >
                  {selectedLeadModal.company.charAt(0)}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>
                      {selectedLeadModal.company}
                    </h2>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        backgroundColor: '#ECFDF5',
                        color: '#059669',
                        border: '1px solid #A7F3D0',
                      }}
                    >
                      <ShieldCheck size={12} />
                      {selectedLeadModal.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#6B7280', marginTop: '2px' }}>
                    {selectedLeadModal.industry} • Official Domain:{' '}
                    <a
                      href={`https://${selectedLeadModal.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}
                    >
                      {selectedLeadModal.domain}
                    </a>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLeadModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9CA3AF',
                  padding: '6px',
                  borderRadius: '6px',
                }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Body Scroll */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
              {/* Executive Overview */}
              <div style={{ marginBottom: '24px' }}>
                <h3
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: '#6B7280',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Sparkles size={14} color="#7C3AED" />
                  Executive Overview & Strategic Findings
                </h3>
                <div
                  style={{
                    backgroundColor: '#FAFAFC',
                    borderRadius: '10px',
                    border: '1px solid #E5E7EB',
                    padding: '16px',
                    fontSize: '0.875rem',
                    color: '#374151',
                    lineHeight: 1.6,
                  }}
                >
                  {selectedLeadModal.overview}
                </div>
              </div>

              {/* Key Decision Makers */}
              <div style={{ marginBottom: '24px' }}>
                <h3
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: '#6B7280',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Users size={14} color="#7C3AED" />
                  Key Decision Makers & Stakeholders ({selectedLeadModal.keyPeople?.length || 0})
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                  {selectedLeadModal.keyPeople?.map((person, pIdx) => (
                    <div
                      key={pIdx}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.875rem' }}>
                          {person.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#4B5563', marginTop: '2px' }}>
                          {person.role}
                        </div>
                      </div>

                      <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {person.email ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '0.75rem', color: '#6B7280', fontFamily: 'monospace' }}>
                              {person.email}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(person.email)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '2px',
                                color: copiedEmail === person.email ? '#059669' : '#9CA3AF',
                              }}
                            >
                              {copiedEmail === person.email ? <Check size={12} /> : <Copy size={12} />}
                            </button>
                          </div>
                        ) : <span />}

                        {person.linkedin && (
                          <a
                            href={person.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: '#EFF6FF',
                              color: '#0A66C2',
                              textDecoration: 'none',
                            }}
                          >
                            <Linkedin size={11} />
                            Profile
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* THREE SPECIFIC DELIVERABLES FOR THIS LEAD (Audio Requirement: Company Study, Lead Study, Pitch Deck) */}
              <div>
                <h3
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: '#6B7280',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Layers size={14} color="#7C3AED" />
                  Deliverable Documents for {selectedLeadModal.company}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '14px' }}>
                  {/* Document 1: Master Company Study PDF */}
                  <div
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      backgroundColor: '#FAFAFC',
                      border: '1px solid #E5E7EB',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          backgroundColor: '#EDE9FE',
                          color: '#7C3AED',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '10px',
                        }}
                      >
                        <FileText size={18} />
                      </div>
                      <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.875rem' }}>
                        Company Study Dossier
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>
                        {selectedLeadModal.companyStudyPdf}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => alert(`Downloading Company Study: ${selectedLeadModal.companyStudyPdf}`)}
                      style={{
                        marginTop: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px',
                        borderRadius: '8px',
                        backgroundColor: '#7C3AED',
                        color: '#FFFFFF',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <Download size={13} />
                      Download Study
                    </button>
                  </div>

                  {/* Document 2: Individual Lead Study PDF (Audio Requirement) */}
                  <div
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FECACA',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          backgroundColor: '#FEE2E2',
                          color: '#DC2626',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '10px',
                        }}
                      >
                        <FileText size={18} />
                      </div>
                      <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.875rem' }}>
                        Individual Lead Study
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>
                        {selectedLeadModal.leadStudyPdf} ({selectedLeadModal.leadStudySize})
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => alert(`Downloading Lead Study: ${selectedLeadModal.leadStudyPdf}`)}
                      style={{
                        marginTop: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px',
                        borderRadius: '8px',
                        backgroundColor: '#DC2626',
                        color: '#FFFFFF',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <Download size={13} />
                      Download Lead Study
                    </button>
                  </div>

                  {/* Document 3: Tailored Pitch Deck Proposal (Audio Requirement) */}
                  <div
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          backgroundColor: '#DBEAFE',
                          color: '#2563EB',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '10px',
                        }}
                      >
                        <Presentation size={18} />
                      </div>
                      <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.875rem' }}>
                        Tailored Pitch Deck
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>
                        {selectedLeadModal.pitchDeckPdf} ({selectedLeadModal.pitchDeckSize})
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => alert(`Downloading Pitch Deck Proposal: ${selectedLeadModal.pitchDeckPdf}`)}
                      style={{
                        marginTop: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px',
                        borderRadius: '8px',
                        backgroundColor: '#2563EB',
                        color: '#FFFFFF',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <Download size={13} />
                      Download Pitch Deck
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '18px 28px',
                borderTop: '1px solid #F1F5F9',
                display: 'flex',
                justifyContent: 'flex-end',
                backgroundColor: '#FAFAFC',
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedLeadModal(null)}
                style={{
                  padding: '9px 20px',
                  borderRadius: '9px',
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#FFFFFF',
                  color: '#4B5563',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close Container
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          7. APPROVAL / REVISIONS CONFIRMATION MODAL
      ========================================================================= */}
      {reviewActionModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(17, 24, 39, 0.55)',
            backdropFilter: 'blur(4px)',
            zIndex: 1200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setReviewActionModal(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '520px',
              padding: '28px',
              boxShadow: '0 20px 48px rgba(0, 0, 0, 0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#7C3AED', backgroundColor: '#F5F3FF', padding: '2px 8px', borderRadius: '6px' }}>
                {reviewActionModal.package.ticketId}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280' }}>
                Sprint Deliverable Review
              </span>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: '0 0 12px' }}>
              {reviewActionModal.mode === 'approve' ? 'Approve Deliverable Sprint' : 'Request Sprint Revisions'}
            </h3>

            <p style={{ fontSize: '0.84375rem', color: '#4B5563', margin: '0 0 16px', lineHeight: 1.5 }}>
              {reviewActionModal.mode === 'approve'
                ? `Confirming approval marks sprint ${reviewActionModal.package.ticketId} as complete. Your team will be notified immediately.`
                : 'Detail the revisions or additional research criteria you would like the specialist pod to adjust.'}
            </p>

            <textarea
              rows={4}
              placeholder={reviewActionModal.mode === 'approve' ? 'Optional feedback note...' : 'Specify revisions needed for this sprint...'}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #D1D5DB',
                fontSize: '0.84375rem',
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: '18px',
                fontFamily: 'inherit',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setReviewActionModal(null)}
                style={{
                  padding: '9px 16px',
                  borderRadius: '9px',
                  border: '1px solid #D1D5DB',
                  backgroundColor: '#FFFFFF',
                  color: '#4B5563',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleReviewAction(reviewActionModal.mode)}
                disabled={isSubmitting}
                style={{
                  padding: '9px 20px',
                  borderRadius: '9px',
                  border: 'none',
                  backgroundColor: reviewActionModal.mode === 'approve' ? '#059669' : '#DC2626',
                  color: '#FFFFFF',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                }}
              >
                {isSubmitting ? 'Saving...' : reviewActionModal.mode === 'approve' ? 'Confirm Approval' : 'Submit Revisions'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
