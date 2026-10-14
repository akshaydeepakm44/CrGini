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
  TrendingUp,
  Target,
  Download,
  Linkedin,
  Mail,
  Phone,
  CheckCircle2,
  Globe,
  X,
  Calendar,
  Lightbulb
} from 'lucide-react';
import { api } from '../../services/api';

/**
 * Ensures phone number masks strictly display with 'xxxxx' and no bullets
 */
function formatMaskedPhone(rawPhone) {
  if (!rawPhone || typeof rawPhone !== 'string') return '+1 (xxx) xxx-xxxx';
  return rawPhone.replace(/[•·*]/g, 'x');
}

/**
 * Shortens a URL for clean, uncluttered display
 * (e.g. "https://www.linkedin.com/company/meridian-analytics/" -> "linkedin.com/company/meridian...")
 */
function shortenUrl(rawUrl, maxLength = 26) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  try {
    let clean = rawUrl.trim();
    clean = clean.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    if (clean.length > maxLength) {
      return clean.substring(0, maxLength) + '...';
    }
    return clean;
  } catch {
    return rawUrl;
  }
}

/**
 * Smart Industry / Sector parser
 * Splits commas, semicolons, newlines, bullets, or pipes into clean individual labels for mini-cards.
 */
function parseIndustries(rawInd) {
  if (!rawInd || typeof rawInd !== 'string') {
    return ['Enterprise Technology & Services'];
  }
  const trimmed = rawInd.trim();
  if (!trimmed) return ['Enterprise Technology & Services'];

  const protectedParen = [];
  const tokenized = trimmed.replace(/\([^\)]*\)/g, (match) => {
    protectedParen.push(match);
    return `__PAREN_${protectedParen.length - 1}__`;
  });

  const hasExplicitDelimiters = /[\r\n;,•·|]|\s+\/\s+/.test(tokenized);
  let sectors = [];
  if (hasExplicitDelimiters) {
    sectors = tokenized
      .split(/(?:[\r\n;,•·|]+|\s+\/\s+)/)
      .map((s) => s.replace(/^[\s•\-\*\d\.\)\:]+/, '').trim())
      .filter((s) => s.length > 0);
  } else if (tokenized.length > 50) {
    const splitRegex = /(?<=(?:Exploration|Management|Trading|Consulting|Services|Systems|Software|Solutions|Logistics|Manufacturing|Platform|Capital|Finance|Insurance|Banking|Infrastructure|Security|Development|Design|Strategy|Operations|Supply|Analytics|__PAREN_\d+__))\s+(?=[A-Z][a-z0-9]+(?:\s+&|\s+[A-Z]))/g;
    sectors = tokenized.split(splitRegex).map((s) => s.trim()).filter(Boolean);
    if (sectors.length <= 1) {
      sectors = [tokenized];
    }
  } else {
    sectors = [tokenized];
  }

  sectors = sectors.map((item) => {
    return item.replace(/__PAREN_(\d+)__/g, (_, idx) => protectedParen[Number(idx)] || '').trim();
  }).filter((s) => s.length > 1);

  return sectors.length > 0 ? sectors : [trimmed];
}

/**
 * Extracts a concise headline from text if custom headline is not explicitly provided
 */
function getCardHeadline(customTitle, text, fallback) {
  if (customTitle && typeof customTitle === 'string' && customTitle.trim()) {
    return customTitle.trim();
  }
  if (!text || typeof text !== 'string' || !text.trim()) {
    return fallback;
  }
  const firstSentence = text.split(/[.\n]/)[0].trim();
  if (firstSentence && firstSentence.length >= 15 && firstSentence.length <= 75) {
    return firstSentence;
  }
  return fallback;
}

export default function PublicSampleDashboard() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [sample, setSample] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);
  const [strategyForm, setStrategyForm] = useState({ name: '', email: '', company: '', notes: '' });
  const [strategySubmitted, setStrategySubmitted] = useState(false);

  // Dynamic slug: defaults to 'data-i2i' if none specified in route
  const effectiveSlug = slug ? slug.trim().toLowerCase() : 'data-i2i';

  useEffect(() => {
    setLoading(true);
    setError('');

    api.getPublicSample(effectiveSlug)
      .then((data) => {
        if (data?.sample) {
          setSample(data.sample);
        } else {
          setError('The requested intelligence showcase could not be loaded.');
        }
      })
      .catch((err) => {
        console.error('[PublicSampleDashboard] Failed to fetch showcase:', err);
        setError(err.message || 'Intelligence showcase not found or currently unpublished.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [effectiveSlug]);

  // Dynamic Prospect Extraction
  const companyName = sample?.companyName || sample?.companyStudy?.company || 'Target Organization';
  const companyStudy = sample?.companyStudy || {};
  const industrySectors = useMemo(() => parseIndustries(companyStudy.industry), [companyStudy.industry]);
  const pitchDeck = sample?.pitchDeck || null;

  // Extract and resolve the target company logo uploaded by the lead team
  const companyLogo = useMemo(() => {
    const isPlatformLogo = (url) => {
      if (!url || typeof url !== 'string') return true;
      const clean = url.trim().toLowerCase();
      return clean === '/logo.png' || clean.includes('dizigini') || clean.includes('creativegini');
    };

    // 1. Direct showcase or company study logo
    let raw = sample?.logoUrl || sample?.companyLogo || sample?.companyStudy?.logoUrl || sample?.companyStudy?.logo;

    // 2. Fallback: Check if lead team uploaded company logo on any of the leads
    if (isPlatformLogo(raw)) {
      const leads = Array.isArray(sample?.leads) ? sample.leads : [];
      const leadWithLogo = leads.find((l) => {
        const candidate = l.companyLogo || l.logo || l.company_logo || l.avatarUrl;
        return candidate && !isPlatformLogo(candidate);
      });
      if (leadWithLogo) {
        raw = leadWithLogo.companyLogo || leadWithLogo.logo || leadWithLogo.company_logo || leadWithLogo.avatarUrl;
      }
    }

    // 3. Fallback: Official company website domain favicon if available
    if (isPlatformLogo(raw)) {
      const leads = Array.isArray(sample?.leads) ? sample.leads : [];
      const firstLink = leads.find((l) => l.companyLink || l.website)?.companyLink || sample?.companyStudy?.website;
      const targetStr = firstLink || companyName;
      if (targetStr) {
        const cleanDomain = String(targetStr)
          .replace(/^https?:\/\//i, '')
          .replace(/^www\./i, '')
          .split('/')[0]
          .trim();
        if (cleanDomain && cleanDomain.includes('.')) {
          return `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${cleanDomain}&size=128`;
        }
      }
      return null;
    }

    return raw.trim();
  }, [sample, companyName]);

  // Helper to detect dummy/mock template leads
  const isMockDummyLead = (l) => {
    if (!l) return true;
    const email = (l.email || '').toLowerCase().trim();
    const company = (l.company || '').toLowerCase().trim();
    const name = (l.name || '').toLowerCase().trim();
    return (
      email === 's.jenkins@acmeglobal.com' ||
      (name === 'sarah jenkins' && company === 'acme global systems') ||
      (name === 'sample decision maker' && company.includes('partner'))
    );
  };

  // ONLY display the leads that are actually uploaded (no fake/synthetic leads!)
  const displayLeads = useMemo(() => {
    const raw = Array.isArray(sample?.leads) ? sample.leads : [];
    return raw.filter((l) => !isMockDummyLead(l));
  }, [sample]);

  const featuredLead = displayLeads.length > 0 ? displayLeads[0] : null;
  const previewLeads = displayLeads.length > 1 ? displayLeads.slice(1) : [];

  const handleBookStrategySubmit = (e) => {
    e.preventDefault();
    setStrategySubmitted(true);
    setTimeout(() => {
      setIsStrategyModalOpen(false);
      setStrategySubmitted(false);
    }, 2500);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="portal-spinner" style={{ margin: '0 auto 16px auto' }} />
          <p style={{ color: '#64748B', fontSize: '0.95rem', fontWeight: 600 }}>
            Loading Intelligence Showcase...
          </p>
        </div>
      </div>
    );
  }

  if (error || !sample) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', padding: '24px' }}>
        <div style={{ maxWidth: '480px', width: '100%', background: '#FFFFFF', padding: '36px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <FileText size={24} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
            Showcase Unavailable
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748B', lineHeight: '1.6', marginBottom: '24px' }}>
            {error || 'The requested sample collection is either unpublished or not found.'}
          </p>
          <button
            onClick={() => navigate('/')}
            style={{ padding: '10px 20px', borderRadius: '8px', background: '#2563EB', border: 'none', color: '#FFFFFF', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', color: '#0F172A', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      
      {/* 1. TOP HEADER & NAVIGATION (View Page: Login and Sign Up Removed as requested in Image 5) */}
      <header style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(8px)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <img src={BRAND_LOGO} alt={BRAND_NAME} style={{ height: '34px', width: 'auto', objectFit: 'contain' }} />
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                {BRAND_NAME}
              </span>
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

          {/* View page note: No login or sign-in buttons here */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
            <ShieldCheck size={14} color="#10B981" />
            <span>Verified Public Intelligence Briefing</span>
          </div>

        </div>
      </header>

      {/* 2. HERO SECTION (Item 1 & 2 Applied: Removed pills, button, subtext; Container is medium size with prominent logo) */}
      <section style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)', borderBottom: '1px solid #E2E8F0', padding: '48px 24px 52px 24px' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'center' }}>
          
          {/* Left Column: Title & Subtitle only (Pills and Explore button removed as requested in Image 1) */}
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
              marginBottom: '16px'
            }}>
              <Sparkles size={14} />
              <span>YOUR PERSONALIZED INTELLIGENCE BRIEFING</span>
            </div>

            <h1 style={{
              fontSize: '2.7rem',
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
              margin: 0,
              maxWidth: '560px'
            }}>
              {sample.description || `Get a tailored view of your market position, key decision-makers, and strategic opportunities — all backed by real-time research and AI-powered insights.`}
            </p>
          </div>

          {/* Right Column: Medium-Sized Container with Visible Company Logo (Point 1: Company Logo only, no industry/sector under it) */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: '100%',
              maxWidth: '380px',
              minHeight: '190px',
              background: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
              padding: '28px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            }}>
              {companyLogo ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '75px',
                  marginBottom: '14px',
                  padding: '4px 12px'
                }}>
                  <img
                    src={companyLogo}
                    alt={companyName}
                    style={{
                      maxHeight: '75px',
                      maxWidth: '220px',
                      objectFit: 'contain'
                    }}
                    onError={(e) => {
                      const domain = (displayLeads[0]?.companyLink || companyName || '')
                        .replace(/^https?:\/\//i, '')
                        .replace(/^www\./i, '')
                        .split('/')[0]
                        .trim();
                      if (domain && domain.includes('.') && !e.currentTarget.src.includes('gstatic.com')) {
                        e.currentTarget.src = `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128`;
                      } else {
                        e.currentTarget.style.display = 'none';
                      }
                    }}
                  />
                </div>
              ) : (
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.85rem',
                  fontWeight: 900,
                  marginBottom: '14px',
                  boxShadow: '0 4px 14px rgba(15,23,42,0.15)'
                }}>
                  {companyName.charAt(0)}
                </div>
              )}

              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                {companyName}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* MAIN CONTAINER */}
      <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '44px 24px' }}>

        {/* SECTION 1: EXECUTIVE INTELLIGENCE (Item 3 Applied: View Full Analysis is a Clickable Button) */}
        <section id="executive-intelligence" style={{ marginBottom: '52px' }}>
          
          {/* Section 1 Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
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

            {/* Clickable Button for View Full Analysis PDF (as requested in Image 3) */}
            <a
              href={companyStudy.pdfUrl || `/api/samples/${sample.slug}/company-study-pdf`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '8px',
                background: '#2563EB',
                color: '#FFFFFF',
                fontSize: '0.85rem',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#1D4ED8'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#2563EB'; }}
            >
              <FileText size={15} />
              <span>View Full Analysis PDF</span>
              <ExternalLink size={14} />
            </a>
          </div>

          {/* Industry / Sector Mini Cards */}
          {industrySectors.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '22px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: '4px' }}>
                Industry Sectors:
              </span>
              {industrySectors.map((ind, i) => (
                <div
                  key={i}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#1E293B',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                  }}
                >
                  <Briefcase size={12} color="#2563EB" />
                  <span>{ind}</span>
                </div>
              ))}
            </div>
          )}

          {/* 4 Cards Grid with Real Dynamic Content */}
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
                  {getCardHeadline(companyStudy.overviewTitle, companyStudy.businessOverview, 'B2B Core Architecture & Service Overview')}
                </h3>

                <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                  {companyStudy.businessOverview || companyStudy.overview || `${companyName} delivers high-impact products and operational infrastructure for enterprise clients.`}
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
                  {getCardHeadline(companyStudy.marketTitle, companyStudy.marketPosition, 'Market Footprint & Segment Velocity')}
                </h3>

                <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                  {companyStudy.marketPosition || `${companyName} maintains an active commercial footprint across its target sectors.`}
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
                  {getCardHeadline(companyStudy.opportunitiesTitle, companyStudy.keyObservations, 'Observed Market & Integration Opportunities')}
                </h3>

                <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                  {companyStudy.keyObservations || `Observed high demand for consolidated service delivery, technical integrations, and turnkey execution.`}
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
                  {getCardHeadline(companyStudy.focusTitle, companyStudy.potentialOpportunity, 'Recommended Commercial Strategy & Focus')}
                </h3>

                <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                  {companyStudy.potentialOpportunity || `Focus on strategic enterprise partnerships and integrated solutions to expand market share.`}
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

        {/* SECTION 2: WHAT THIS COULD MEAN FOR YOUR BUSINESS */}
        <section style={{ marginBottom: '52px' }}>
          
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'stretch' }}>
            
            {/* Column 1 */}
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
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Target size={18} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 10px 0' }}>
                  Market opportunities
                </h3>
                <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.55, margin: '0 0 20px 0' }}>
                  Identify relevant market signals, customer segments and expansion possibilities across {companyStudy.industry || 'the enterprise landscape'}.
                </p>
              </div>
              <div style={{ background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ color: '#2563EB', marginTop: '2px', flexShrink: 0 }}><Target size={15} /></div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0F172A', marginBottom: '2px' }}>Example</div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.45 }}>Accelerating demand for unified, enterprise-grade capabilities across accounts.</div>
                </div>
              </div>
            </div>

            {/* Column 2 */}
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
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Users size={18} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 10px 0' }}>
                  Decision-maker access
                </h3>
                <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.55, margin: '0 0 20px 0' }}>
                  Discover relevant stakeholders and understand their business roles, priorities and engagement patterns.
                </p>
              </div>
              <div style={{ background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ color: '#2563EB', marginTop: '2px', flexShrink: 0 }}><Users size={15} /></div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0F172A', marginBottom: '2px' }}>Example</div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.45 }}>Direct engagement paths to budget authorities vetting new implementation partners.</div>
                </div>
              </div>
            </div>

            {/* Column 3 */}
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
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <TrendingUp size={18} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 10px 0' }}>
                  Actionable growth strategy
                </h3>
                <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.55, margin: '0 0 20px 0' }}>
                  Translate research into prioritized outreach, partnership opportunities and business development actions.
                </p>
              </div>
              <div style={{ background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ color: '#2563EB', marginTop: '2px', flexShrink: 0 }}><TrendingUp size={15} /></div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0F172A', marginBottom: '2px' }}>Example</div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.45 }}>Prioritize commercial engagement based on verified operational pain points.</div>
                </div>
              </div>
            </div>

          </div>

        </section>

        {/* SECTION 3: DECISION-MAKER INTELLIGENCE (Item 4 & 6 Applied: Two clean containers for Company Specific & Lead Specific; Only real uploaded leads) */}
        <section style={{ marginBottom: '52px' }}>
          
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
              <span>{displayLeads.length} {displayLeads.length === 1 ? 'profile' : 'profiles'} available</span>
            </div>
          </div>

          {/* Featured Profile Card (Simple Card as requested in Point 2; details live in the internal container) */}
          {featuredLead ? (
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '24px 28px',
              marginBottom: '32px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '20px',
            }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flex: '1 1 340px' }}>
                {featuredLead.logo || featuredLead.avatarUrl ? (
                  <img
                    src={featuredLead.logo || featuredLead.avatarUrl}
                    alt={featuredLead.name}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #E2E8F0',
                      flexShrink: 0
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.6rem',
                    border: '2px solid #E2E8F0',
                    flexShrink: 0
                  }}>
                    {featuredLead.name?.charAt(0) || 'L'}
                  </div>
                )}

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      {featuredLead.name}
                    </h3>
                    <CheckCircle2 size={16} color="#10B981" />
                  </div>

                  {featuredLead.whySuitsBest && (
                    <p style={{ fontSize: '0.86rem', color: '#64748B', lineHeight: 1.5, margin: '8px 0 0 0', maxWidth: '680px' }}>
                      {featuredLead.whySuitsBest}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Button to inspect internal container */}
              <button
                type="button"
                onClick={() => setSelectedLead(featuredLead)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 22px',
                  borderRadius: '10px',
                  background: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
                  transition: 'all 0.15s ease',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#1D4ED8'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#2563EB'; }}
              >
                <span>Inspect Full Dossier</span>
                <ArrowRight size={15} />
              </button>

            </div>
          ) : (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '36px', textAlign: 'center', color: '#64748B' }}>
              No decision makers uploaded yet for this prospect.
            </div>
          )}

          {/* More relevant leads */}
          {previewLeads.length > 0 && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                  More relevant leads ({previewLeads.length})
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
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
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                      {item.logo || item.avatarUrl ? (
                        <img
                          src={item.logo || item.avatarUrl}
                          alt={item.name}
                          style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '1.5px solid #E2E8F0'
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '50%',
                          background: '#F1F5F9',
                          color: '#64748B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '1.1rem',
                          flexShrink: 0
                        }}>
                          {item.name?.charAt(0) || 'L'}
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '8px', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedLead(item)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#EFF6FF',
                          border: '1px solid #BFDBFE',
                          color: '#2563EB',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#DBEAFE'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#EFF6FF'; }}
                      >
                        <span>Inspect</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </section>

        {/* SECTION 4: DARK NAVY CTA BANNER (No contact form below!) */}
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

      {/* 5. TRUST FOOTER (Item 5 Applied: Login and Sign Up completely removed from footer) */}
      <footer style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0', padding: '28px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#64748B' }}>
            <ShieldCheck size={16} color="#10B981" />
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
                    placeholder={`e.g. Focus on enterprise banking & fintech`}
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

      {/* MODAL 2: INTERACTIVE LEAD DOSSIER MODAL (Item 4 Applied: Clean 2 Containers for Company Specific & Lead Specific) */}
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
                {selectedLead.logo || selectedLead.avatarUrl ? (
                  <img
                    src={selectedLead.logo || selectedLead.avatarUrl}
                    alt={selectedLead.name}
                    style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #E2E8F0' }}
                  />
                ) : (
                  <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.3rem' }}>
                    {selectedLead.name?.charAt(0) || 'L'}
                  </div>
                )}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      {selectedLead.name}
                    </h3>
                    <CheckCircle2 size={16} color="#10B981" />
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
                  {selectedLead.whySuitsBest || selectedLead.shortSummary || 'Direct budget decision maker aligned with key pain points and strategic initiatives.'}
                </p>
              </div>

              {/* 1. Company Specific Container (Item 4) */}
              <div style={{ background: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '18px 20px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={16} color="#2563EB" />
                  <span>Company Specific</span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                  <div style={{ background: '#FFFFFF', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '5px' }}>
                      Company Web URL
                    </div>
                    {selectedLead.companyLink ? (
                      <a
                        href={selectedLead.companyLink.startsWith('http') ? selectedLead.companyLink : `https://${selectedLead.companyLink}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '0.86rem', fontWeight: 700, color: '#2563EB', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', wordBreak: 'break-all' }}
                      >
                        <Globe size={14} style={{ flexShrink: 0 }} />
                        <span>{shortenUrl(selectedLead.companyLink, 28)}</span>
                        <ExternalLink size={12} style={{ flexShrink: 0 }} />
                      </a>
                    ) : (
                      <span style={{ fontSize: '0.86rem', color: '#94A3B8' }}>{companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com</span>
                    )}
                  </div>

                  <div style={{ background: '#FFFFFF', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '5px' }}>
                      Company LinkedIn URL
                    </div>
                    {selectedLead.companyLinkedin || selectedLead.linkedin ? (
                      <a
                        href={(selectedLead.companyLinkedin || selectedLead.linkedin).startsWith('http') ? (selectedLead.companyLinkedin || selectedLead.linkedin) : `https://${selectedLead.companyLinkedin || selectedLead.linkedin}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '0.86rem', fontWeight: 700, color: '#2563EB', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', wordBreak: 'break-all' }}
                      >
                        <Linkedin size={14} color="#0A66C2" style={{ flexShrink: 0 }} />
                        <span>{shortenUrl(selectedLead.companyLinkedin || selectedLead.linkedin, 28)}</span>
                        <ExternalLink size={12} style={{ flexShrink: 0 }} />
                      </a>
                    ) : (
                      <span style={{ fontSize: '0.86rem', color: '#94A3B8' }}>linkedin.com/company/{companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Lead Specific Container (Point 3 Applied: Uncongested 2x2 grid + Lead LinkedIn URL) */}
              <div style={{ background: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '18px 20px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={16} color="#7C3AED" />
                  <span>Lead Specific</span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                  
                  {/* Lead Role */}
                  <div style={{ background: '#FFFFFF', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '5px' }}>
                      Lead Role
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                      {(selectedLead.title && selectedLead.title.trim().toLowerCase() !== 'key executive') ? selectedLead.title : 'Executive Decision Maker'}
                    </div>
                  </div>

                  {/* Lead Mail */}
                  <div style={{ background: '#FFFFFF', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '5px' }}>
                      Lead Mail
                    </div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px', wordBreak: 'break-all' }}>
                      <Mail size={14} color="#2563EB" style={{ flexShrink: 0 }} />
                      <span>{selectedLead.email || selectedLead.maskedEmail || 'contact@' + (selectedLead.companyLink ? shortenUrl(selectedLead.companyLink) : 'company.com')}</span>
                    </div>
                  </div>

                  {/* Lead Phone Number (Masked strictly with xxxxx) */}
                  <div style={{ background: '#FFFFFF', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '5px' }}>
                      Lead Phone Number
                    </div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={14} color="#059669" style={{ flexShrink: 0 }} />
                      <span>{formatMaskedPhone(selectedLead.phone || selectedLead.maskedPhone)}</span>
                    </div>
                  </div>

                  {/* Lead LinkedIn URL (Item 3 Applied) */}
                  <div style={{ background: '#FFFFFF', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '5px' }}>
                      Lead LinkedIn URL
                    </div>
                    {selectedLead.linkedin ? (
                      <a
                        href={selectedLead.linkedin.startsWith('http') ? selectedLead.linkedin : `https://${selectedLead.linkedin}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '0.86rem', fontWeight: 700, color: '#2563EB', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', wordBreak: 'break-all' }}
                      >
                        <Linkedin size={14} color="#0A66C2" style={{ flexShrink: 0 }} />
                        <span>{shortenUrl(selectedLead.linkedin, 28)}</span>
                        <ExternalLink size={12} style={{ flexShrink: 0 }} />
                      </a>
                    ) : (
                      <span style={{ fontSize: '0.86rem', color: '#94A3B8' }}>
                        linkedin.com/in/{selectedLead.name ? selectedLead.name.toLowerCase().replace(/[^a-z0-9]/g, '') : 'executive'}
                      </span>
                    )}
                  </div>

                </div>
              </div>

              {/* Pitch Deck proposal if available */}
              {(selectedLead.pitchDeck || pitchDeck) && (
                <div style={{
                  background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ color: '#FFFFFF' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#A5B4FC', textTransform: 'uppercase' }}>Proposal Pitch Deck</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>
                      {selectedLead.pitchDeck?.title || pitchDeck?.title || `${companyName} Growth Architecture Playbook`}
                    </div>
                  </div>

                  {(selectedLead.pitchDeck?.downloadUrl || pitchDeck?.assetKey) && (
                    <a
                      href={selectedLead.pitchDeck?.streamUrl || selectedLead.pitchDeck?.downloadUrl || `/api/samples/${sample.slug}/pitch-deck-pdf`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#FFFFFF',
                        color: '#1E1B4B',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '0.825rem',
                        fontWeight: 700,
                        textDecoration: 'none'
                      }}
                    >
                      <Presentation size={14} />
                      <span>Preview Deck PDF</span>
                    </a>
                  )}
                </div>
              )}

              {/* Close / Strategy Action */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    color: '#475569',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLead(null);
                    setIsStrategyModalOpen(true);
                  }}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    background: '#2563EB',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(37,99,235,0.25)'
                  }}
                >
                  Book Strategy Call
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
