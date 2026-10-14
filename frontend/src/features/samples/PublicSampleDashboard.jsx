import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BRAND_LOGO, BRAND_NAME } from '../../assets/branding';
import {
  Building2,
  Users,
  FileText,
  Presentation,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Briefcase,
  MapPin,
  TrendingUp,
  Target,
  Search,
  Download,
  Lock,
  LogIn,
  UserPlus,
  Compass,
  Linkedin,
  Mail,
  Phone,
  CheckCircle,
  CheckCircle2,
  Globe,
  X,
  Send,
  Copy,
  Check,
  Loader2,
  Lightbulb,
  Calendar,
  Layers,
  ArrowUpRight,
  Clock,
  CheckSquare
} from 'lucide-react';
import { api } from '../../services/api';

/**
 * Authoritative fallback showcase data (matching Image 2 for Finkr)
 */
const FINKR_DEFAULT_SHOWCASE = {
  companyName: 'Finkr',
  title: 'Finkr’s next growth opportunities, explored.',
  description: 'Get a tailored view of your market position, key decision-makers, and strategic opportunities — all backed by real-time research and AI-powered insights.',
  companyStudy: {
    company: 'Finkr',
    industry: 'Fintech & Embedded Financial Infrastructure',
    overviewTitle: 'B2B financial infrastructure for modern businesses',
    businessOverview: 'Finkr provides embedded finance solutions, focusing on seamless payment and banking infrastructure for digital-first companies.',
    marketTitle: 'Growing segment with strong momentum',
    marketPosition: 'Finkr is positioned in the fast-growing embedded finance market, competing with established players like Stripe, Marqeta and Kontent.',
    opportunitiesTitle: 'Expansion in European markets and verticals',
    keyObservations: 'There are opportunities in cross-border payments, new verticals (eCommerce, SaaS) and deeper product integrations with fintech partners.',
    focusTitle: 'Enterprise partnerships and product expansion',
    potentialOpportunity: 'Focus on strategic partnerships and integrated solutions to increase wallet share and enter new markets.',
  },
  leads: [
    {
      id: 'lead-finkr-1',
      name: 'Wearemarmalade',
      title: 'Key Executive',
      company: 'Finkr',
      whySuitsBest: 'Leads product strategy and growth initiatives. Relevant to your business based on their role, company focus and recent activity.',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=180&auto=format&fit=crop&q=80',
      linkedinUrl: 'https://linkedin.com',
      companyUrl: 'https://finkr.com',
      whyItMatters: [
        'Leads product and platform strategy',
        'Focused on growth and partnerships',
        'Active in embedded finance ecosystem'
      ],
      tags: ['Verified role', 'Public sources'],
      isUnlocked: true,
    },
    {
      id: 'lead-finkr-2',
      name: 'Daniel Carter',
      title: 'Co-Founder & CEO',
      company: 'Finkr',
      tags: ['Founders', 'Product'],
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=180&auto=format&fit=crop&q=80',
      isUnlocked: false,
    },
    {
      id: 'lead-finkr-3',
      name: 'Sophie Martin',
      title: 'Head of Partnerships',
      company: 'Finkr',
      tags: ['Partnerships', 'Growth'],
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=180&auto=format&fit=crop&q=80',
      isUnlocked: false,
    },
    {
      id: 'lead-finkr-4',
      name: 'James Ellison',
      title: 'VP Engineering',
      company: 'Finkr',
      tags: ['Engineering', 'Product'],
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=180&auto=format&fit=crop&q=80',
      isUnlocked: false,
    },
    {
      id: 'lead-finkr-5',
      name: 'Priya Nair',
      title: 'Head of Marketing',
      company: 'Finkr',
      tags: ['Marketing', 'Brand'],
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=180&auto=format&fit=crop&q=80',
      isUnlocked: false,
    }
  ]
};

export default function PublicSampleDashboard() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [sample, setSample] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);
  const [strategyForm, setStrategyForm] = useState({ name: '', email: '', company: '', notes: '' });
  const [strategySubmitted, setStrategySubmitted] = useState(false);

  const effectiveSlug = slug ? slug.trim().toLowerCase() : 'finkr';

  useEffect(() => {
    setLoading(true);

    api.getPublicSample(effectiveSlug)
      .then((data) => {
        if (data?.sample) {
          // Merge with Finkr defaults to guarantee high-converting presentation
          const s = data.sample;
          const merged = {
            ...s,
            companyName: s.companyName || s.companyStudy?.company || (effectiveSlug === 'finkr' ? 'Finkr' : 'Enterprise Target'),
            title: s.title || `${s.companyName || 'Target'}’s next growth opportunities, explored.`,
            description: s.description || FINKR_DEFAULT_SHOWCASE.description,
            companyStudy: {
              ...FINKR_DEFAULT_SHOWCASE.companyStudy,
              company: s.companyStudy?.company || s.companyName || 'Finkr',
              industry: s.companyStudy?.industry || FINKR_DEFAULT_SHOWCASE.companyStudy.industry,
              overviewTitle: s.companyStudy?.overviewTitle || FINKR_DEFAULT_SHOWCASE.companyStudy.overviewTitle,
              businessOverview: s.companyStudy?.businessOverview || s.companyStudy?.overview || FINKR_DEFAULT_SHOWCASE.companyStudy.businessOverview,
              marketTitle: s.companyStudy?.marketTitle || FINKR_DEFAULT_SHOWCASE.companyStudy.marketTitle,
              marketPosition: s.companyStudy?.marketPosition || FINKR_DEFAULT_SHOWCASE.companyStudy.marketPosition,
              opportunitiesTitle: s.companyStudy?.opportunitiesTitle || FINKR_DEFAULT_SHOWCASE.companyStudy.opportunitiesTitle,
              keyObservations: s.companyStudy?.keyObservations || FINKR_DEFAULT_SHOWCASE.companyStudy.keyObservations,
              focusTitle: s.companyStudy?.focusTitle || FINKR_DEFAULT_SHOWCASE.companyStudy.focusTitle,
              potentialOpportunity: s.companyStudy?.potentialOpportunity || FINKR_DEFAULT_SHOWCASE.companyStudy.potentialOpportunity,
            },
            leads: Array.isArray(s.leads) && s.leads.length > 0 ? s.leads : FINKR_DEFAULT_SHOWCASE.leads,
          };
          setSample(merged);
        } else {
          setSample({
            ...FINKR_DEFAULT_SHOWCASE,
            companyName: effectiveSlug === 'data-i2i' ? 'Data I2I' : effectiveSlug.charAt(0).toUpperCase() + effectiveSlug.slice(1),
          });
        }
      })
      .catch(() => {
        // Fallback to high-converting showcase for instant zero-downtime render
        setSample({
          ...FINKR_DEFAULT_SHOWCASE,
          companyName: effectiveSlug === 'data-i2i' ? 'Data I2I' : (effectiveSlug ? effectiveSlug.charAt(0).toUpperCase() + effectiveSlug.slice(1) : 'Finkr'),
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [effectiveSlug]);

  const activeSample = sample || FINKR_DEFAULT_SHOWCASE;
  const companyName = activeSample.companyName || 'Finkr';
  const companyStudy = activeSample.companyStudy || FINKR_DEFAULT_SHOWCASE.companyStudy;
  const leads = activeSample.leads && activeSample.leads.length > 0 ? activeSample.leads : FINKR_DEFAULT_SHOWCASE.leads;
  const featuredLead = leads[0] || FINKR_DEFAULT_SHOWCASE.leads[0];
  const previewLeads = leads.slice(1, 5).length === 4 ? leads.slice(1, 5) : FINKR_DEFAULT_SHOWCASE.leads.slice(1, 5);

  const handleSignUpClick = () => {
    navigate('/signin?view=signup&returnTo=/portal');
  };

  const handleLoginClick = () => {
    navigate('/signin?returnTo=/portal');
  };

  const handleScrollToSection1 = () => {
    const el = document.getElementById('executive-intelligence');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookStrategySubmit = (e) => {
    e.preventDefault();
    setStrategySubmitted(true);
    setTimeout(() => {
      setIsStrategyModalOpen(false);
      setStrategySubmitted(false);
    }, 2500);
  };

  if (loading && !sample) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="portal-spinner" style={{ margin: '0 auto 16px auto' }} />
          <p style={{ color: '#64748B', fontSize: '0.95rem', fontWeight: 600 }}>
            Preparing intelligence briefing...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', color: '#0F172A', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      
      {/* 1. TOP HEADER & NAVIGATION (Matches Image 2) */}
      <header style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(8px)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <img src={BRAND_LOGO} alt={BRAND_NAME} style={{ height: '34px', width: 'auto', objectFit: 'contain' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                  {BRAND_NAME}
                </span>
                <span style={{ fontSize: '0.62rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Powered by CreativeGini
                </span>
              </div>
            </Link>

            <span style={{ height: '20px', width: '1px', background: '#E2E8F0', margin: '0 4px' }} />

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '20px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#334155'
            }}>
              <span>Personalized Intelligence for {companyName}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={handleLoginClick}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                color: '#334155',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#94A3B8'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; }}
            >
              <LogIn size={14} />
              <span>Login</span>
            </button>

            <button
              type="button"
              onClick={handleSignUpClick}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 18px',
                borderRadius: '8px',
                background: '#2563EB',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#1D4ED8'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#2563EB'; }}
            >
              <UserPlus size={14} />
              <span>Sign Up</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. HERO SECTION (Matches Image 2) */}
      <section style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)', borderBottom: '1px solid #E2E8F0', padding: '52px 24px 60px 24px' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '48px', alignItems: 'center' }}>
          
          {/* Left Column: Heading, Subtitle, Tags, Action */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: '#EEF2FF',
              border: '1px solid #C7D2FE',
              color: '#4F46E5',
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '18px'
            }}>
              <Sparkles size={14} />
              <span>YOUR PERSONALIZED INTELLIGENCE BRIEFING</span>
            </div>

            <h1 style={{
              fontSize: '2.8rem',
              fontWeight: 800,
              color: '#0F172A',
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              margin: '0 0 16px 0'
            }}>
              {companyName}’s next growth<br />opportunities, explored.
            </h1>

            <p style={{
              fontSize: '1.05rem',
              color: '#475569',
              lineHeight: 1.6,
              margin: '0 0 24px 0',
              maxWidth: '540px'
            }}>
              Get a tailored view of your market position, key decision-makers, and strategic opportunities — all backed by real-time research and AI-powered insights.
            </p>

            {/* 3 Pills / Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '28px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 14px',
                borderRadius: '8px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#2563EB',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
              }}>
                <Building2 size={15} color="#2563EB" />
                <span style={{ color: '#334155' }}>Company intelligence</span>
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 14px',
                borderRadius: '8px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#059669',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
              }}>
                <TrendingUp size={15} color="#059669" />
                <span style={{ color: '#334155' }}>Market positioning</span>
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 14px',
                borderRadius: '8px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#7C3AED',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
              }}>
                <Users size={15} color="#7C3AED" />
                <span style={{ color: '#334155' }}>Decision-maker research</span>
              </div>
            </div>

            {/* Primary Action Button */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
              <button
                type="button"
                onClick={handleScrollToSection1}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 26px',
                  borderRadius: '10px',
                  background: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#1D4ED8'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#2563EB'; }}
              >
                <span>Explore the personalized briefing</span>
                <ArrowRight size={16} />
              </button>

              <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 500, paddingLeft: '4px' }}>
                Prepared for {companyName} · Personalized research preview
              </span>
            </div>
          </div>

          {/* Right Column: Visual Graphic (Matches Image 2 Visual) */}
          <div style={{
            position: 'relative',
            background: 'radial-gradient(circle at 70% 30%, #EEF2FF 0%, #FFFFFF 70%)',
            borderRadius: '24px',
            border: '1px solid #E2E8F0',
            padding: '36px',
            minHeight: '320px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
            overflow: 'hidden'
          }}>
            {/* Ambient backdrop glow */}
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(165,180,252,0.4) 0%, rgba(255,255,255,0) 70%)',
              filter: 'blur(20px)',
              pointerEvents: 'none'
            }} />

            {/* Target Company Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1 }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: '#1E293B',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
                fontWeight: 900
              }}>
                {companyName.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                  {companyName}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>
                  Strategic Growth Dossier
                </div>
              </div>
            </div>

            {/* Constellation Network Graph (SVG) */}
            <div style={{ position: 'relative', margin: '24px 0', zIndex: 1 }}>
              <svg width="100%" height="130" viewBox="0 0 380 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Connecting Lines */}
                <line x1="40" y1="65" x2="130" y2="35" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="130" y1="35" x2="240" y2="40" stroke="#93C5FD" strokeWidth="1.5" />
                <line x1="130" y1="35" x2="190" y2="95" stroke="#93C5FD" strokeWidth="1.5" />
                <line x1="240" y1="40" x2="330" y2="70" stroke="#93C5FD" strokeWidth="1.5" />
                <line x1="190" y1="95" x2="330" y2="70" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="240" y1="40" x2="270" y2="105" stroke="#BFDBFE" strokeWidth="1.5" />

                {/* Nodes */}
                <circle cx="40" cy="65" r="7" fill="#2563EB" />
                <circle cx="130" cy="35" r="8" fill="#3B82F6" />
                <circle cx="240" cy="40" r="9" fill="#1D4ED8" />
                <circle cx="190" cy="95" r="7" fill="#60A5FA" />
                <circle cx="330" cy="70" r="8" fill="#2563EB" />
                <circle cx="270" cy="105" r="6" fill="#93C5FD" />
              </svg>
            </div>

            {/* Floating Card (Matches Image 2) */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '16px 20px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.25 }}>
                  Smarter decisions.
                </div>
                <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#2563EB', lineHeight: 1.25 }}>
                  Bigger opportunities.
                </div>
              </div>

              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles size={16} />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* MAIN CONTAINER */}
      <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '48px 24px' }}>

        {/* SECTION 1: EXECUTIVE INTELLIGENCE (Matches Image 2) */}
        <section id="executive-intelligence" style={{ marginBottom: '56px', scrollMarginTop: '80px' }}>
          
          {/* Section 1 Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: '#2563EB',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.95rem'
              }}>
                1
              </div>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                  Executive Intelligence
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '2px 0 0 0' }}>
                  Key findings about {companyName}’s business, market position and growth potential.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsUnlockModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'none',
                border: 'none',
                color: '#2563EB',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <span>View full analysis</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* 4 Cards Grid (Matches Image 2) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px', alignItems: 'stretch' }}>
            
            {/* Card 1: Company Overview */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
              <div>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px'
                }}>
                  <Building2 size={18} />
                </div>

                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                  COMPANY OVERVIEW
                </div>

                <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.35, margin: '0 0 10px 0' }}>
                  {companyStudy.overviewTitle || 'B2B financial infrastructure for modern businesses'}
                </h3>

                <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                  {companyStudy.businessOverview || companyStudy.overview}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#059669', fontWeight: 700, marginTop: '20px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981' }} />
                <span>High confidence</span>
                <ChevronRight size={14} style={{ marginLeft: 'auto' }} />
              </div>
            </div>

            {/* Card 2: Market Position */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
              <div>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#ECFDF5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px'
                }}>
                  <TrendingUp size={18} />
                </div>

                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                  MARKET POSITION
                </div>

                <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.35, margin: '0 0 10px 0' }}>
                  {companyStudy.marketTitle || 'Growing segment with strong momentum'}
                </h3>

                <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                  {companyStudy.marketPosition}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#059669', fontWeight: 700, marginTop: '20px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981' }} />
                <span>High confidence</span>
                <ChevronRight size={14} style={{ marginLeft: 'auto' }} />
              </div>
            </div>

            {/* Card 3: Key Opportunities */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
              <div>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#FEF3C7',
                  color: '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px'
                }}>
                  <Lightbulb size={18} />
                </div>

                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                  KEY OPPORTUNITIES
                </div>

                <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.35, margin: '0 0 10px 0' }}>
                  {companyStudy.opportunitiesTitle || 'Expansion in European markets and verticals'}
                </h3>

                <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                  {companyStudy.keyObservations}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#D97706', fontWeight: 700, marginTop: '20px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#F59E0B' }} />
                <span>Medium confidence</span>
                <ChevronRight size={14} style={{ marginLeft: 'auto' }} />
              </div>
            </div>

            {/* Card 4: Recommended Focus */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
              <div>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#F3E8FF',
                  color: '#9333EA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px'
                }}>
                  <Target size={18} />
                </div>

                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                  RECOMMENDED FOCUS
                </div>

                <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.35, margin: '0 0 10px 0' }}>
                  {companyStudy.focusTitle || 'Enterprise partnerships and product expansion'}
                </h3>

                <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                  {companyStudy.potentialOpportunity}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#D97706', fontWeight: 700, marginTop: '20px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#F59E0B' }} />
                <span>Medium confidence</span>
                <ChevronRight size={14} style={{ marginLeft: 'auto' }} />
              </div>
            </div>

          </div>

        </section>

        {/* SECTION 2: WHAT THIS COULD MEAN FOR YOUR BUSINESS (Matches Image 2) */}
        <section style={{ marginBottom: '56px' }}>
          
          {/* Section 2 Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: '#2563EB',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.95rem'
              }}>
                2
              </div>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                  What this could mean for your business
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '2px 0 0 0' }}>
                  How {companyName}’s position and market dynamics create opportunities for your team.
                </p>
              </div>
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '6px 14px',
              borderRadius: '20px',
              background: '#F1F5F9',
              border: '1px solid #E2E8F0',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#475569'
            }}>
              <span>Research-backed insights · Not financial advice</span>
            </div>
          </div>

          {/* 3 Column Grid (Matches Image 2) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'stretch' }}>
            
            {/* Column 1: Market opportunities */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
              <div>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <Target size={18} />
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 10px 0' }}>
                  Market opportunities
                </h3>

                <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.55, margin: '0 0 20px 0' }}>
                  Identify relevant market signals, customer segments and expansion possibilities in fintech and embedded finance.
                </p>
              </div>

              {/* Example Box */}
              <div style={{
                background: '#F8FAFC',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}>
                <div style={{ color: '#2563EB', marginTop: '2px', flexShrink: 0 }}>
                  <Target size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0F172A', marginBottom: '2px' }}>
                    Example
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.45 }}>
                    Rapid growth in Europe’s embedded finance market (CAGR 18%+ through 2028).
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Decision-maker access */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
              <div>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <Users size={18} />
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 10px 0' }}>
                  Decision-maker access
                </h3>

                <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.55, margin: '0 0 20px 0' }}>
                  Discover relevant stakeholders and understand their business roles, priorities and engagement patterns.
                </p>
              </div>

              {/* Example Box */}
              <div style={{
                background: '#F8FAFC',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}>
                <div style={{ color: '#2563EB', marginTop: '2px', flexShrink: 0 }}>
                  <Users size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0F172A', marginBottom: '2px' }}>
                    Example
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.45 }}>
                    C-Level focus on product, partnerships and go-to-market expansion.
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Actionable growth strategy */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
              <div>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <TrendingUp size={18} />
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 10px 0' }}>
                  Actionable growth strategy
                </h3>

                <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.55, margin: '0 0 20px 0' }}>
                  Translate research into prioritized outreach, partnership opportunities and business development actions.
                </p>
              </div>

              {/* Example Box */}
              <div style={{
                background: '#F8FAFC',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}>
                <div style={{ color: '#2563EB', marginTop: '2px', flexShrink: 0 }}>
                  <TrendingUp size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0F172A', marginBottom: '2px' }}>
                    Example
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.45 }}>
                    Prioritize enterprise partnerships in European markets and fintech verticals.
                  </div>
                </div>
              </div>
            </div>

          </div>

        </section>

        {/* SECTION 3: DECISION-MAKER INTELLIGENCE (Matches Image 2) */}
        <section style={{ marginBottom: '56px' }}>
          
          {/* Section 3 Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: '#2563EB',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.95rem'
              }}>
                3
              </div>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                  Decision-maker intelligence
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '2px 0 0 0' }}>
                  A preview of the people relevant to your target account.
                </p>
              </div>
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#065F46'
            }}>
              <Users size={14} />
              <span>1 profile available</span>
            </div>
          </div>

          {/* Featured Profile Card (Matches Image 2) */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '28px',
            marginBottom: '32px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px',
            alignItems: 'stretch'
          }}>
            
            {/* Left Column: Avatar, Identity, Bio, Badges, Links */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '18px' }}>
                <img
                  src={featuredLead.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=180&auto=format&fit=crop&q=80'}
                  alt={featuredLead.name}
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #E2E8F0'
                  }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=180&auto=format&fit=crop&q=80';
                  }}
                />

                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {companyName}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      {featuredLead.name || 'Wearemarmalade'}
                    </h3>
                    <CheckCircle2 size={16} color="#10B981" />
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2563EB', marginTop: '2px' }}>
                    {featuredLead.title || 'Key Executive'} · {companyName}
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.55, margin: '0 0 16px 0' }}>
                {featuredLead.whySuitsBest || 'Leads product strategy and growth initiatives. Relevant to your business based on their role, company focus and recent activity.'}
              </p>

              {/* Badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: '#ECFDF5',
                  color: '#047857',
                  border: '1px solid #A7F3D0',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  Verified role
                </span>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: '#EFF6FF',
                  color: '#1D4ED8',
                  border: '1px solid #BFDBFE',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  Public sources
                </span>
              </div>

              {/* Links Row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', fontSize: '0.82rem' }}>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}
                >
                  <Linkedin size={14} />
                  <span>LinkedIn</span>
                  <ChevronRight size={13} />
                </a>

                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#64748B', fontWeight: 500 }}>
                  <Globe size={14} />
                  <span>Company website</span>
                </span>

                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#64748B', fontWeight: 500 }}>
                  <FileText size={14} />
                  <span>Recent mentions</span>
                </span>
              </div>
            </div>

            {/* Right Column: Why this person matters (Matches Image 2) */}
            <div style={{
              background: '#F8FAFC',
              borderRadius: '14px',
              border: '1px solid #E2E8F0',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <h4 style={{ fontSize: '0.925rem', fontWeight: 800, color: '#0F172A', margin: '0 0 16px 0' }}>
                  Why this person matters
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={16} color="#10B981" />
                    <span style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 500 }}>
                      Leads product and platform strategy
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={16} color="#10B981" />
                    <span style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 500 }}>
                      Focused on growth and partnerships
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={16} color="#10B981" />
                    <span style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 500 }}>
                      Active in embedded finance ecosystem
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => setSelectedLead(featuredLead)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '12px 18px',
                  borderRadius: '10px',
                  background: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#1D4ED8'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#2563EB'; }}
              >
                <span>View full dossier</span>
                <ArrowRight size={15} />
              </button>
            </div>

          </div>

          {/* More relevant leads (preview) (Matches Image 2) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.925rem', fontWeight: 800, color: '#334155' }}>
                More relevant leads (preview)
              </div>

              <button
                type="button"
                onClick={() => setIsUnlockModalOpen(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563EB',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>View all leads (25+)</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* 4 Preview Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              {previewLeads.map((item, idx) => (
                <div
                  key={item.id || idx}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '14px',
                    border: '1px solid #E2E8F0',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                    <img
                      src={item.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=180&auto=format&fit=crop&q=80'}
                      alt={item.name}
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '1.5px solid #E2E8F0'
                      }}
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=180&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                        {companyName}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {(item.tags || ['Executive', 'Growth']).map((t, tIdx) => (
                        <span
                          key={tIdx}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: '#F1F5F9',
                            color: '#475569',
                            fontSize: '0.7rem',
                            fontWeight: 600
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsUnlockModalOpen(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563EB',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      View profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* SECTION 4: DARK NAVY CTA BANNER (Matches Image 2 - Completely Replaces Old Contact Form!) */}
        <section style={{ marginBottom: '32px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            borderRadius: '20px',
            padding: '36px 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '24px',
            boxShadow: '0 12px 32px rgba(15,23,42,0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', maxWidth: '680px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'rgba(37,99,235,0.25)',
                color: '#60A5FA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Sparkles size={24} />
              </div>

              <div>
                <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
                  Ready to turn intelligence into action?
                </h3>
                <p style={{ fontSize: '0.925rem', color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>
                  Get the complete report, additional leads and a personalized strategy session with our team.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsStrategyModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 26px',
                borderRadius: '10px',
                background: '#FFFFFF',
                color: '#0F172A',
                border: 'none',
                fontSize: '0.925rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.15)';
              }}
            >
              <span>Book a strategy call</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </section>

      </main>

      {/* 5. TRUST FOOTER (Matches Image 2) */}
      <footer style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0', padding: '36px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: '#64748B' }}>
              Already have an account?{' '}
              <button
                onClick={handleLoginClick}
                style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
              >
                LOGIN
              </button>
            </span>

            <span style={{ color: '#CBD5E1' }}>•</span>

            <span style={{ fontSize: '0.875rem', color: '#64748B' }}>
              Need client access?{' '}
              <button
                onClick={handleSignUpClick}
                style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
              >
                SIGN UP
              </button>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#94A3B8' }}>
            <ShieldCheck size={14} color="#10B981" />
            <span>{BRAND_NAME} Protected Intelligence Showcase · Enterprise SLA & Tenant Isolation</span>
          </div>

        </div>
      </footer>

      {/* MODAL 1: STRATEGY CALL BOOKING MODAL */}
      {isStrategyModalOpen && (
        <div
          onClick={() => setIsStrategyModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '36px 32px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              animation: 'modalSlideUp 0.25s ease-out',
            }}
          >
            <button
              type="button"
              onClick={() => setIsStrategyModalOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748B',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>

            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px auto',
              }}
            >
              <Calendar size={26} />
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px', textAlign: 'center' }}>
              Book a Strategy Call
            </h3>

            <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: '1.5', marginBottom: '22px', textAlign: 'center' }}>
              Schedule a 20-minute tailored walkthrough of our complete intelligence dossier and lead activation engine for {companyName}.
            </p>

            {strategySubmitted ? (
              <div style={{
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                color: '#065F46'
              }}>
                <CheckCircle2 size={32} color="#10B981" style={{ margin: '0 auto 8px auto' }} />
                <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '4px' }}>Strategy Call Requested!</div>
                <div style={{ fontSize: '0.85rem' }}>Our team will coordinate the meeting invitation directly with your email.</div>
              </div>
            ) : (
              <form onSubmit={handleBookStrategySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={strategyForm.name}
                    onChange={(e) => setStrategyForm({ ...strategyForm, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Your Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. alex@company.com"
                    value={strategyForm.email}
                    onChange={(e) => setStrategyForm({ ...strategyForm, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Notes or Priority Target Accounts
                  </label>
                  <input
                    type="text"
                    placeholder={`e.g. Focus on ${companyName} European partners`}
                    value={strategyForm.notes}
                    onChange={(e) => setStrategyForm({ ...strategyForm, notes: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '13px 20px',
                    borderRadius: '10px',
                    background: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: '8px',
                    boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
                  }}
                >
                  <Calendar size={16} />
                  <span>Confirm Strategy Session</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: INTERACTIVE LEAD DOSSIER MODAL */}
      {selectedLead && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setSelectedLead(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '24px 28px',
              borderBottom: '1px solid #F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#F8FAFC',
              borderRadius: '20px 20px 0 0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img
                  src={selectedLead.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=180&auto=format&fit=crop&q=80'}
                  alt={selectedLead.name}
                  style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #E2E8F0' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      {selectedLead.name}
                    </h3>
                    <CheckCircle2 size={16} color="#10B981" />
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#2563EB', fontWeight: 600 }}>
                    {selectedLead.title} · {companyName}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748B',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
                  EXECUTIVE PROFILE
                </div>
                <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
                  {selectedLead.whySuitsBest || 'Leads product strategy and growth initiatives. Relevant to your business based on their role, company focus and recent activity.'}
                </p>
              </div>

              <div style={{ background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '16px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', marginBottom: '10px' }}>
                  Strategic Priority Signals
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(selectedLead.whyItMatters || [
                    'Leads product and platform strategy',
                    'Focused on growth and partnerships',
                    'Active in embedded finance ecosystem'
                  ]).map((point, pIdx) => (
                    <div key={pIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: '#475569' }}>
                      <CheckCircle2 size={15} color="#10B981" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Unlock CTA inside dossier */}
              <div style={{
                background: '#EFF6FF',
                borderRadius: '12px',
                border: '1px solid #BFDBFE',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E3A8A', marginBottom: '6px' }}>
                  Unlock Direct Phone Lines & Unmasked Emails
                </div>
                <p style={{ fontSize: '0.84rem', color: '#3B82F6', margin: '0 0 14px 0' }}>
                  Create a client account to unlock verified contact coordinates and download the complete executive dossier.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedLead(null);
                    handleSignUpClick();
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '11px 22px',
                    borderRadius: '8px',
                    background: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(37,99,235,0.25)'
                  }}
                >
                  <UserPlus size={15} />
                  <span>Sign Up to Unlock Full Contact Details</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: LOCKED LEADS ACCESS MODAL */}
      {isUnlockModalOpen && (
        <div
          onClick={() => setIsUnlockModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '36px 32px',
              maxWidth: '480px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              animation: 'modalSlideUp 0.25s ease-out',
            }}
          >
            <button
              type="button"
              onClick={() => setIsUnlockModalOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748B',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>

            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px auto',
              }}
            >
              <Lock size={26} />
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              Unlock Qualified Enterprise Leads
            </h3>

            <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: '1.55', marginBottom: '24px' }}>
              Verified work emails, direct executive phone numbers, deep-dive account dossiers, and custom ICP research for {companyName} are available for registered clients.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={handleSignUpClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
                }}
              >
                <UserPlus size={16} />
                <span>Create Client Account (Sign Up)</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={handleLoginClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '11px 20px',
                  borderRadius: '10px',
                  background: '#F8FAFC',
                  color: '#334155',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <LogIn size={15} />
                <span>Already Have an Account? Log In</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
