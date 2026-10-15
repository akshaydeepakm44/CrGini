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
  Lightbulb,
  Lock
} from 'lucide-react';
import { api } from '../../services/api';
import './publicSample.css';

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

  // Protect parenthetical terms like (Legal, Finance, Marketing)
  const protectedParen = [];
  const tokenized = trimmed.replace(/\([^\)]*\)/g, (match) => {
    protectedParen.push(match);
    return `___PAREN_${protectedParen.length - 1}___`;
  });

  // Common sector nouns after which a new capitalized sector often begins when pasted without commas
  const boundary = /(?<=(?:Startups|Services|Finance|Providers|WealthTech|InsurTech|FinTech|HealthTech|BioTech|EdTech|PropTech|AgTech|Credit|Lending|Banking|Software|Management|Consulting|Solutions|Logistics|Insurance|Capital|Healthcare|Biotech|E-commerce|Systems|Platform|Analytics|Trading|Mining|Exploration|Brands|Agency))\s+(?=[A-Z])/g;

  // Split on all standard delimiters: commas, semicolons, newlines, pipes, bullets, tabs, multiple spaces, and slashes
  let rawChunks = tokenized
    .split(/(?:[\r\n;,•·|]+|\t+|\s{2,}|\s*\/\s*)/)
    .map((s) => s.replace(/^[\s•\-\*\d\.\)\:]+/, '').trim())
    .filter(Boolean);

  let sectors = [];
  for (const chunk of rawChunks) {
    if (boundary.test(chunk)) {
      const sub = chunk.split(boundary).map((s) => s.trim()).filter(Boolean);
      sectors.push(...sub);
    } else {
      sectors.push(chunk);
    }
  }

  // Restore protected parentheses and cleanup
  sectors = sectors.map((item) => {
    let restored = item.replace(/___PAREN_(\d+)___/g, (_, idx) => protectedParen[Number(idx)] || '').trim();
    return restored.replace(/^[,;.\s/]+|[,;.\s/]+$/g, '').trim();
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
  const [lockedLeadNotice, setLockedLeadNotice] = useState(null);

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

  // Ensure body background is light and no horizontal scroll occurs on this page
  useEffect(() => {
    const originalBg = document.body.style.backgroundColor;
    const originalOverflowX = document.body.style.overflowX;
    document.body.style.backgroundColor = '#F8FAFC';
    document.body.style.overflowX = 'hidden';
    return () => {
      document.body.style.backgroundColor = originalBg;
      document.body.style.overflowX = originalOverflowX;
    };
  }, []);

  // Dynamic Prospect Extraction
  const companyName = sample?.companyName || sample?.companyStudy?.company || 'Target Organization';
  const companyStudy = sample?.companyStudy || {};
  const industrySectors = useMemo(() => parseIndustries(companyStudy.industry), [companyStudy.industry]);
  const pitchDeck = sample?.pitchDeck || null;

  // Extract and resolve the target company logo uploaded by the lead team in prospect showcase
  const companyLogo = useMemo(() => {
    const isPlatformLogo = (url) => {
      if (!url || typeof url !== 'string') return true;
      const clean = url.trim().toLowerCase();
      return clean === '/logo.png' || clean.includes('dizigini') || clean.includes('creativegini');
    };

    // 1. Direct showcase logo uploaded in the prospect showcase
    let raw = sample?.logoUrl || sample?.companyLogo;
    if (raw && !isPlatformLogo(raw)) {
      return raw.trim();
    }

    // 2. Company study logo
    const studyLogo = sample?.companyStudy?.logoUrl || sample?.companyStudy?.logo;
    if (studyLogo && !isPlatformLogo(studyLogo)) {
      return studyLogo.trim();
    }

    // 3. Fallback: Check if lead team uploaded company logo on any of the leads
    const leads = Array.isArray(sample?.leads) ? sample.leads : [];
    const leadWithLogo = leads.find((l) => {
      const candidate = l.companyLogo || l.logo || l.company_logo || l.avatarUrl;
      return candidate && !isPlatformLogo(candidate);
    });
    if (leadWithLogo) {
      const cand = leadWithLogo.companyLogo || leadWithLogo.logo || leadWithLogo.company_logo || leadWithLogo.avatarUrl;
      if (cand) return cand.trim();
    }

    // 4. Fallback: Official company website domain favicon if an actual website was specified
    const explicitWebsite =
      sample?.companyStudy?.website ||
      leads.find((l) => l.companyLink || l.website)?.companyLink ||
      leads.find((l) => l.website)?.website;

    if (explicitWebsite && typeof explicitWebsite === 'string') {
      const cd = explicitWebsite.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].split('?')[0].trim();
      if (cd.includes('.') && cd.length >= 4) {
        return `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${cd.toLowerCase()}&size=128`;
      }
    }

    return null;
  }, [sample]);

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

  // Resolve best logo for any lead (uploaded logo -> lead's own company domain favicon -> null)
  // Ensures leads ONLY show their own uploaded logo and NEVER duplicate the main company logo
  const resolveLeadLogo = (lead, isFeatured = false) => {
    const isPlatformLogo = (url) => {
      if (!url || typeof url !== 'string') return true;
      const clean = url.trim().toLowerCase();
      return clean === '/logo.png' || clean.includes('dizigini') || clean.includes('creativegini');
    };

    // 1. Direct lead logo uploaded specifically for this lead
    if (lead?.logo && !isPlatformLogo(lead.logo)) {
      return lead.logo;
    }
    if (lead?.companyLogo && !isPlatformLogo(lead.companyLogo)) {
      return lead.companyLogo;
    }
    if (lead?.avatarUrl && !isPlatformLogo(lead.avatarUrl)) {
      return lead.avatarUrl;
    }

    // 2. Lead's own company website domain favicon
    const rawLink = lead?.companyLink || lead?.website;
    if (rawLink && typeof rawLink === 'string') {
      let cleanDomain = rawLink
        .replace(/^https?:\/\//i, '')
        .replace(/^www\./i, '')
        .split('/')[0]
        .split('?')[0]
        .trim();
      if (cleanDomain && cleanDomain.includes('.') && cleanDomain.length >= 4) {
        return `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${cleanDomain.toLowerCase()}&size=128`;
      }
    }

    // 3. For the featured primary lead (#1), if its company is the main showcase company, it may fall back to the showcase logo
    if (isFeatured && (lead?.company === companyName || !lead?.company)) {
      return companyLogo || null;
    }

    // For all other uploaded leads, DO NOT duplicate the main company logo!
    return null;
  };

  // ONLY display the leads that are actually uploaded (no fake/synthetic leads!)
  const displayLeads = useMemo(() => {
    const raw = Array.isArray(sample?.leads) ? sample.leads : [];
    return raw.filter((l) => !isMockDummyLead(l));
  }, [sample]);

  // Lead #1 is the featured open profile
  const featuredLead = displayLeads.length > 0 ? displayLeads[0] : null;

  // All the remaining uploaded leads (leads 2+) are displayed in the locked cards section
  const uploadedLockedLeads = displayLeads.length > 1 ? displayLeads.slice(1) : [];

  // Present ALL uploaded locked leads directly with their authentic name & logo
  const lockedLeads = useMemo(() => {
    return uploadedLockedLeads;
  }, [uploadedLockedLeads]);

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
    <div className="public-sample-page">
      
      {/* 1. TOP HEADER & NAVIGATION */}
      <header className="sample-header">
        <div className="sample-header-inner">
          
          <div className="sample-brand-group">
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <img src={BRAND_LOGO} alt={BRAND_NAME} style={{ height: '30px', width: 'auto', objectFit: 'contain' }} />
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                {BRAND_NAME}
              </span>
            </Link>

            <span className="d-none d-sm-inline" style={{ height: '20px', width: '1px', background: '#E2E8F0', margin: '0 4px' }} />

            <div className="sample-brand-pill">
              <span>Personalized Intelligence for {companyName}</span>
            </div>
          </div>

          <div className="sample-verified-badge">
            <ShieldCheck size={14} color="#10B981" />
            <span>Verified Intelligence Briefing</span>
          </div>

        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="sample-hero-section">
        <div className="sample-hero-grid">
          
          {/* Left Column: Title & Subtitle */}
          <div>
            <div className="sample-hero-pill">
              <Sparkles size={14} />
              <span>PERSONALIZED INTELLIGENCE BRIEFING</span>
            </div>

            <h1 className="sample-hero-title">
              {companyName}’s next growth opportunities, explored.
            </h1>

            <p className="sample-hero-desc">
              {sample.description || `Get a tailored view of your market position, key decision-makers, and strategic opportunities — all backed by real-time research and AI-powered insights.`}
            </p>
          </div>

          {/* Right Column: Medium-Sized Container with Visible Company Logo */}
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div className="sample-hero-card">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '70px',
                marginBottom: '12px',
                padding: '4px 12px',
                maxWidth: '100%',
                position: 'relative'
              }}>
                {companyLogo ? (
                  <img
                    src={companyLogo}
                    alt={companyName}
                    style={{
                      maxHeight: '70px',
                      maxWidth: '100%',
                      objectFit: 'contain'
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.nextSibling) {
                        e.currentTarget.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div style={{
                  display: companyLogo ? 'none' : 'flex',
                  width: '54px',
                  height: '54px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                  color: '#2563EB',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.5rem',
                  border: '1.5px solid #BFDBFE'
                }}>
                  {companyName?.charAt(0)?.toUpperCase() || 'C'}
                </div>
              </div>

              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', wordBreak: 'break-word' }}>
                {companyName}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* MAIN CONTAINER */}
      <main className="sample-main">

        {/* SECTION 1: EXECUTIVE INTELLIGENCE */}
        <section id="executive-intelligence" className="sample-section">
          
          {/* Section 1 Header */}
          <div className="sample-section-header">
            <div className="sample-section-title-wrap">
              <div className="sample-section-badge">
                1
              </div>
              <div>
                <h2 className="sample-section-title">
                  Executive Intelligence
                </h2>
                <p className="sample-section-subtitle">
                  Key findings about {companyName}’s business, market position and growth potential.
                </p>
              </div>
            </div>

            {/* View Original Study Document or Not Uploaded */}
            {companyStudy?.hasPdf ? (
              <a
                href={companyStudy.pdfUrl || `/api/samples/${sample.slug}/company-study-pdf`}
                target="_blank"
                rel="noreferrer"
                className="sample-action-btn"
              >
                <FileText size={15} />
                <span>View Original Study Document</span>
                <ExternalLink size={14} />
              </a>
            ) : (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  color: '#64748B',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                <FileText size={15} color="#94A3B8" />
                <span>Original Study Document: Currently not uploaded</span>
              </div>
            )}
          </div>

          {/* Industry / Sector Mini Cards */}
          {industrySectors.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '20px' }}>
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

          {/* 4 Cards Grid */}
          <div className="sample-grid-4">
            
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
                  {companyStudy.businessOverview || companyStudy.overview || 'Overview currently not provided.'}
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
                  {companyStudy.marketPosition || 'Market position currently not provided.'}
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
                  {companyStudy.keyObservations || 'Key observations currently not provided.'}
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
                  {companyStudy.potentialOpportunity || 'Strategic recommendation currently not provided.'}
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
        <section className="sample-section">
          
          <div className="sample-section-header">
            <div className="sample-section-title-wrap">
              <div className="sample-section-badge">
                2
              </div>
              <div>
                <h2 className="sample-section-title">
                  What this could mean for your business
                </h2>
                <p className="sample-section-subtitle">
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
              color: '#475569',
              maxWidth: '100%',
              wordBreak: 'break-word'
            }}>
              <span>Research-backed insights · Not financial advice</span>
            </div>
          </div>

          <div className="sample-grid-3">
            
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

        {/* SECTION 3: DECISION-MAKER INTELLIGENCE */}
        <section className="sample-section">
          
          {/* Section 3 Header */}
          <div className="sample-section-header">
            <div className="sample-section-title-wrap">
              <div className="sample-section-badge">
                3
              </div>
              <div>
                <h2 className="sample-section-title">
                  Decision-maker intelligence
                </h2>
                <p className="sample-section-subtitle">
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
              color: '#065F46',
              maxWidth: '100%',
              wordBreak: 'break-word'
            }}>
              <Users size={14} />
              <span>{featuredLead ? 1 + lockedLeads.length : 0} profiles available (1 featured, {lockedLeads.length} locked)</span>
            </div>
          </div>

          {/* Featured Profile Card */}
          {featuredLead ? (
            <div className="featured-lead-card">
              
              <div className="featured-lead-info">
                {resolveLeadLogo(featuredLead, true) ? (
                  <img
                    src={resolveLeadLogo(featuredLead, true)}
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
                      if (e.currentTarget.nextSibling) {
                        e.currentTarget.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div style={{
                  display: resolveLeadLogo(featuredLead, true) ? 'none' : 'flex',
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                  color: '#2563EB',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.5rem',
                  border: '2px solid #E2E8F0',
                  flexShrink: 0
                }}>
                  {featuredLead.name?.charAt(0) || 'L'}
                </div>

                <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {featuredLead.company || companyName}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                    <h3 style={{ fontSize: 'clamp(1.15rem, 3.5vw, 1.3rem)', fontWeight: 800, color: '#0F172A', margin: 0, wordBreak: 'break-word' }}>
                      {featuredLead.name}
                    </h3>
                    <CheckCircle2 size={18} color="#10B981" />
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#2563EB', marginTop: '2px', wordBreak: 'break-word' }}>
                    {featuredLead.title || 'Executive Decision Maker'} · {featuredLead.company || companyName}
                  </div>

                  {featuredLead.whySuitsBest && (
                    <p style={{ fontSize: '0.86rem', color: '#64748B', lineHeight: 1.5, margin: '8px 0 0 0', maxWidth: '680px', wordBreak: 'break-word' }}>
                      {featuredLead.whySuitsBest}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Button to inspect internal container */}
              <button
                type="button"
                className="featured-lead-btn"
                onClick={() => setSelectedLead(featuredLead)}
              >
                <span>Inspect Full Dossier</span>
                <ArrowRight size={16} />
              </button>

            </div>
          ) : (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '36px', textAlign: 'center', color: '#64748B' }}>
              No decision makers uploaded yet for this prospect.
            </div>
          )}

          {/* THE 4 LOCKED LEADS (Logo & Company Name prominently shown, direct contact locked) */}
          {lockedLeads.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em', wordBreak: 'break-word' }}>
                    Additional target accounts & decision-makers
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px', wordBreak: 'break-word' }}>
                    Target profiles for this prospect dossier ({lockedLeads.length} locked in sample preview).
                  </div>
                </div>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '16px',
                  background: '#FEF3C7',
                  border: '1px solid #FDE68A',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#92400E',
                  flexShrink: 0
                }}>
                  <Lock size={13} color="#D97706" />
                  <span>{lockedLeads.length} Profiles Locked</span>
                </div>
              </div>

              <div className="sample-grid-4">
                {lockedLeads.map((item, idx) => {
                  const leadLogoUrl = resolveLeadLogo(item, false);
                  const effectiveCompany = item.company || sample?.companyName || 'Target Organization';

                  return (
                    <div
                      key={item.id || idx}
                      style={{
                        background: '#FFFFFF',
                        borderRadius: '16px',
                        border: '1px solid #E2E8F0',
                        padding: '22px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 2px 8px rgba(15,23,42,0.03)',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(15,23,42,0.07)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(15,23,42,0.03)';
                      }}
                    >
                      <div>
                        {/* Top Row: Company Logo & Locked Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: '#F8FAFC',
                            border: '1.5px solid #E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            flexShrink: 0
                          }}>
                            {leadLogoUrl ? (
                              <img
                                src={leadLogoUrl}
                                alt={effectiveCompany}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain',
                                  padding: '4px'
                                }}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  if (e.currentTarget.nextSibling) {
                                    e.currentTarget.nextSibling.style.display = 'flex';
                                  }
                                }}
                              />
                            ) : null}
                            <div
                              style={{
                                display: leadLogoUrl ? 'none' : 'flex',
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                                color: '#2563EB',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '1.15rem'
                              }}
                            >
                              {effectiveCompany.charAt(0).toUpperCase()}
                            </div>
                          </div>

                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: '#FEF3C7',
                            color: '#92400E',
                            border: '1px solid #FDE68A',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}>
                            <Lock size={12} color="#D97706" />
                            <span>Locked Profile</span>
                          </span>
                        </div>

                        {/* Company Name & Lead Details */}
                        <div style={{ marginBottom: '16px' }}>
                          <div style={{
                            fontSize: '1.05rem',
                            fontWeight: 800,
                            color: '#0F172A',
                            lineHeight: 1.3,
                            marginBottom: '4px',
                            letterSpacing: '-0.01em'
                          }}>
                            {effectiveCompany}
                          </div>

                          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '2px' }}>
                            {item.name}
                          </div>

                          <div style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.4 }}>
                            {item.title || 'Executive Decision Maker'}
                          </div>
                        </div>
                      </div>

                      {/* Card Footer: Status & Unlock Action */}
                      <div style={{
                        paddingTop: '12px',
                        borderTop: '1px solid #F1F5F9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px'
                      }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#059669', fontWeight: 600 }}>
                          <CheckCircle2 size={14} color="#10B981" />
                          <span>Verified Prospect</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => setLockedLeadNotice(item)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: '#F8FAFC',
                            border: '1px solid #CBD5E1',
                            color: '#334155',
                            padding: '6px 13px',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#EFF6FF';
                            e.currentTarget.style.color = '#2563EB';
                            e.currentTarget.style.borderColor = '#BFDBFE';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#F8FAFC';
                            e.currentTarget.style.color = '#334155';
                            e.currentTarget.style.borderColor = '#CBD5E1';
                          }}
                        >
                          <Lock size={12} />
                          <span>Locked</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </section>

      </main>

      {/* 5. TRUST FOOTER */}
      <footer style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0', padding: '24px 16px', textAlign: 'center', width: '100%' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '6px', fontSize: '0.8rem', color: '#64748B' }}>
            <ShieldCheck size={16} color="#10B981" style={{ flexShrink: 0 }} />
            <span style={{ wordBreak: 'break-word', lineHeight: 1.45 }}>{BRAND_NAME} Protected Intelligence Showcase · Enterprise SLA & Tenant Isolation</span>
          </div>
        </div>
      </footer>

      {/* LOCKED LEAD MODAL NOTICE */}
      {lockedLeadNotice && (
        <div
          onClick={() => setLockedLeadNotice(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 'clamp(10px, 3vw, 20px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: 'clamp(14px, 3vw, 20px)',
              padding: 'clamp(24px, 5vw, 36px) clamp(16px, 4vw, 32px)',
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              textAlign: 'center',
            }}
          >
            <button
              type="button"
              onClick={() => setLockedLeadNotice(null)}
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
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
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                background: '#FEF3C7',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <Lock size={24} />
            </div>

            <h3 style={{ fontSize: 'clamp(1.1rem, 3.5vw, 1.25rem)', fontWeight: 800, color: '#0F172A', marginBottom: '8px', wordBreak: 'break-word' }}>
              Decision-Maker Profile Locked
            </h3>

            <p style={{ fontSize: '0.86rem', color: '#64748B', lineHeight: '1.5', marginBottom: '18px', wordBreak: 'break-word' }}>
              Direct contact details, verified mobile phone, and tailored intelligence dossier for <strong style={{ color: '#0F172A' }}>{lockedLeadNotice.name}</strong> at <strong style={{ color: '#0F172A' }}>{lockedLeadNotice.company || companyName}</strong> are locked in this sample preview.
            </p>

            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '14px 16px',
              marginBottom: '20px',
              textAlign: 'left',
              fontSize: '0.82rem',
              color: '#475569',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              wordBreak: 'break-word'
            }}>
              <div><strong>Target Account:</strong> {lockedLeadNotice.company || companyName}</div>
              <div><strong>Decision Maker:</strong> {lockedLeadNotice.name} ({lockedLeadNotice.title || 'Executive'})</div>
              <div><strong>Access Level:</strong> Enterprise Client Tier</div>
            </div>

            <button
              type="button"
              onClick={() => setLockedLeadNotice(null)}
              style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: '10px',
                background: '#0F172A',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
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
            padding: 'clamp(10px, 3vw, 20px)',
          }}
          onClick={() => setSelectedLead(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'clamp(14px, 3vw, 20px)',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: 'clamp(14px, 3.5vw, 22px) clamp(16px, 4vw, 28px)',
              borderBottom: '1px solid #F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#F8FAFC',
              borderRadius: 'clamp(14px, 3vw, 20px) clamp(14px, 3vw, 20px) 0 0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {resolveLeadLogo(selectedLead) ? (
                  <img
                    src={resolveLeadLogo(selectedLead)}
                    alt={selectedLead.name}
                    style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #E2E8F0' }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.nextSibling) {
                        e.currentTarget.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div style={{
                  display: resolveLeadLogo(selectedLead) ? 'none' : 'flex',
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: '#EFF6FF',
                  color: '#2563EB',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.3rem',
                  border: '1.5px solid #E2E8F0'
                }}>
                  {selectedLead.name?.charAt(0) || 'L'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      {selectedLead.name}
                    </h3>
                    <CheckCircle2 size={16} color="#10B981" />
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#64748B', fontWeight: 600, marginTop: '2px' }}>
                    {selectedLead.title || 'Executive Decision Maker'} · {selectedLead.company || companyName}
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
            {(() => {
              const isLeadUnlocked = Boolean(selectedLead.isUnlocked || (featuredLead && (selectedLead.id === featuredLead.id || selectedLead.name === featuredLead.name)));
              const leadMail = isLeadUnlocked
                ? (selectedLead.email || featuredLead?.email || 'contact@' + ((sample?.companyStudy?.website || '').replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0] || 'company.com'))
                : (selectedLead.maskedEmail || '••••••••@' + ((sample?.companyStudy?.website || '').replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0] || 'company.com'));
              const rawPhone = selectedLead.phone || selectedLead.maskedPhone;
              const isFakePhone = rawPhone && (rawPhone.includes('555') || rawPhone.includes('234-8900') || rawPhone.includes('(xxx)'));
              const leadPhone = isFakePhone ? null : (isLeadUnlocked ? (selectedLead.phone || null) : (selectedLead.maskedPhone ? formatMaskedPhone(selectedLead.maskedPhone) : null));

              return (
                <div style={{ padding: 'clamp(16px, 3.5vw, 22px) clamp(16px, 4vw, 28px)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
                      EXECUTIVE PROFILE
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6, margin: 0, wordBreak: 'break-word' }}>
                      {selectedLead.whySuitsBest || selectedLead.shortSummary || 'Direct budget decision maker aligned with key pain points and strategic initiatives.'}
                    </p>
                  </div>

                  {/* 1. Company Specific Container (Image 2) */}
                  <div style={{ background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '16px 18px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Building2 size={16} color="#2563EB" />
                      <span>COMPANY SPECIFIC</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.86rem' }}>
                      <div className="dossier-info-row">
                        <span style={{ color: '#64748B', fontWeight: 600, flexShrink: 0 }}>Company Web:</span>
                        {(selectedLead.companyLink || sample?.companyStudy?.website) ? (
                          <a
                            href={(selectedLead.companyLink || sample?.companyStudy?.website).startsWith('http') ? (selectedLead.companyLink || sample?.companyStudy?.website) : `https://${selectedLead.companyLink || sample?.companyStudy?.website}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', wordBreak: 'break-all' }}
                          >
                            <Globe size={14} style={{ flexShrink: 0 }} />
                            <span>{shortenUrl(selectedLead.companyLink || sample?.companyStudy?.website, 32)}</span>
                            <ExternalLink size={12} style={{ flexShrink: 0 }} />
                          </a>
                        ) : (
                          <span style={{ color: '#94A3B8' }}>Not specified</span>
                        )}
                      </div>

                      <div className="dossier-info-row">
                        <span style={{ color: '#64748B', fontWeight: 600, flexShrink: 0 }}>Company LinkedIn:</span>
                        {(selectedLead.companyLinkedin || sample?.companyStudy?.linkedin) ? (
                          <a
                            href={(selectedLead.companyLinkedin || sample?.companyStudy?.linkedin).startsWith('http') ? (selectedLead.companyLinkedin || sample?.companyStudy?.linkedin) : `https://${selectedLead.companyLinkedin || sample?.companyStudy?.linkedin}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', wordBreak: 'break-all' }}
                          >
                            <Linkedin size={14} color="#0A66C2" style={{ flexShrink: 0 }} />
                            <span>{shortenUrl(selectedLead.companyLinkedin || sample?.companyStudy?.linkedin, 32)}</span>
                            <ExternalLink size={12} style={{ flexShrink: 0 }} />
                          </a>
                        ) : (
                          <span style={{ color: '#94A3B8' }}>Not specified</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 2. Lead Specific Container (Image 2) */}
                  <div style={{ background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '16px 18px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={16} color="#7C3AED" />
                      <span>LEAD SPECIFIC</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.86rem' }}>
                      {/* Lead Mail */}
                      <div className="dossier-info-row">
                        <span style={{ color: '#64748B', fontWeight: 600, flexShrink: 0 }}>Lead Mail:</span>
                        {leadMail ? (
                          isLeadUnlocked ? (
                            <a
                              href={`mailto:${leadMail}`}
                              style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', wordBreak: 'break-all' }}
                            >
                              <Mail size={14} color="#2563EB" style={{ flexShrink: 0 }} />
                              <span>{leadMail}</span>
                            </a>
                          ) : (
                            <span style={{ color: '#475569', fontFamily: 'monospace', display: 'inline-flex', alignItems: 'center', gap: '6px', wordBreak: 'break-all' }}>
                              <Mail size={14} color="#94A3B8" style={{ flexShrink: 0 }} />
                              <span>{leadMail}</span>
                            </span>
                          )
                        ) : (
                          <span style={{ color: '#94A3B8' }}>Not specified</span>
                        )}
                      </div>

                      {/* Lead Phone */}
                      <div className="dossier-info-row">
                        <span style={{ color: '#64748B', fontWeight: 600, flexShrink: 0 }}>Lead Phone:</span>
                        {leadPhone ? (
                          <span style={{ color: '#0F172A', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px', wordBreak: 'break-all' }}>
                            <Phone size={14} color="#059669" style={{ flexShrink: 0 }} />
                            <span>{leadPhone}</span>
                          </span>
                        ) : (
                          <span style={{ color: '#94A3B8' }}>Not uploaded</span>
                        )}
                      </div>

                      {/* Lead Role */}
                      <div className="dossier-info-row">
                        <span style={{ color: '#64748B', fontWeight: 600, flexShrink: 0 }}>Lead Role:</span>
                        <span style={{ color: '#0F172A', fontWeight: 800, wordBreak: 'break-word' }}>
                          {selectedLead.title?.trim() || 'Executive Decision Maker'}
                        </span>
                      </div>

                      {/* Lead LinkedIn URL */}
                      {selectedLead.linkedin && !selectedLead.linkedin.includes('/company/') && (
                        <div className="dossier-info-row">
                          <span style={{ color: '#64748B', fontWeight: 600, flexShrink: 0 }}>Lead LinkedIn:</span>
                          <a
                            href={selectedLead.linkedin.startsWith('http') ? selectedLead.linkedin : `https://${selectedLead.linkedin}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#0A66C2', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', wordBreak: 'break-all' }}
                          >
                            <Linkedin size={14} color="#0A66C2" style={{ flexShrink: 0 }} />
                            <span>{shortenUrl(selectedLead.linkedin, 32)}</span>
                            <ExternalLink size={12} style={{ flexShrink: 0 }} />
                          </a>
                        </div>
                      )}
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

                  {(selectedLead.pitchDeck || pitchDeck) && (
                    <a
                      href={selectedLead.pitchDeck?.streamUrl || selectedLead.pitchDeck?.downloadUrl || `/api/samples/${sample.slug}/leads/${selectedLead.id}/pitch-deck`}
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

              {/* Close Action */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  style={{
                    padding: '10px 20px',
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
                  Close
                </button>
              </div>

            </div>
          );
        })()}
          </div>
        </div>
      )}

    </div>
  );
}
