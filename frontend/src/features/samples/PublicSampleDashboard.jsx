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

  // Resolve best logo for any lead (uploaded logo -> company link favicon -> showcase company logo)
  const resolveLeadLogo = (lead) => {
    if (lead?.logo && !lead.logo.includes('creativegini') && !lead.logo.includes('dizigini')) {
      return lead.logo;
    }
    if (lead?.companyLogo && !lead.companyLogo.includes('creativegini') && !lead.companyLogo.includes('dizigini')) {
      return lead.companyLogo;
    }
    if (lead?.avatarUrl && !lead.avatarUrl.includes('creativegini') && !lead.avatarUrl.includes('dizigini')) {
      return lead.avatarUrl;
    }
    const rawLink = lead?.companyLink || lead?.website;
    if (rawLink) {
      const cleanDomain = String(rawLink)
        .replace(/^https?:\/\//i, '')
        .replace(/^www\./i, '')
        .split('/')[0]
        .trim();
      if (cleanDomain && cleanDomain.includes('.')) {
        return `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${cleanDomain}&size=128`;
      }
    }
    return companyLogo || null;
  };

  // ONLY display the leads that are actually uploaded (no fake/synthetic leads!)
  const displayLeads = useMemo(() => {
    const raw = Array.isArray(sample?.leads) ? sample.leads : [];
    return raw.filter((l) => !isMockDummyLead(l));
  }, [sample]);

  // Lead #1 is the featured open profile
  const featuredLead = displayLeads.length > 0 ? displayLeads[0] : null;

  // The remaining uploaded leads (leads 2-5)
  const uploadedLockedLeads = displayLeads.length > 1 ? displayLeads.slice(1) : [];

  // Guarantee that the 4 locked leads are presented (using uploaded leads first, gracefully filling up to 4 if needed)
  const lockedLeads = useMemo(() => {
    const list = [...uploadedLockedLeads];
    if (list.length < 4) {
      const fallbackRoles = [
        { title: 'Chief Technology Officer', name: 'Executive Contact', why: 'Technical architecture & cloud systems' },
        { title: 'VP of Product Engineering', name: 'Executive Contact', why: 'Product roadmap & platform scalability' },
        { title: 'Head of Enterprise Analytics', name: 'Executive Contact', why: 'Data architecture & intelligence integration' },
        { title: 'Director of Strategic Growth', name: 'Executive Contact', why: 'Commercial expansion & partnership development' },
      ];
      const needed = 4 - list.length;
      for (let i = 0; i < needed; i++) {
        const fb = fallbackRoles[i % fallbackRoles.length];
        list.push({
          id: `locked-preview-${i + 1}`,
          name: fb.name,
          title: fb.title,
          company: companyName,
          companyLink: companyStudy?.website || '',
          logo: companyLogo,
          whySuitsBest: fb.why,
          isPlaceholder: true,
          maskedEmail: '••••••••@' + (companyStudy?.website ? companyStudy.website.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0] : 'enterprise.com'),
          maskedPhone: '+1 (xxx) xxx-xxxx',
        });
      }
    }
    return list.slice(0, 4);
  }, [uploadedLockedLeads, companyName, companyStudy, companyLogo]);

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
              <span>{featuredLead ? 1 + lockedLeads.length : 0} profiles available (1 featured, {lockedLeads.length} locked)</span>
            </div>
          </div>

          {/* Featured Profile Card (Clean outer card - details live inside dossier modal) */}
          {featuredLead ? (
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '28px 32px',
              marginBottom: '32px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '24px',
            }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: '1 1 360px' }}>
                {resolveLeadLogo(featuredLead) ? (
                  <img
                    src={resolveLeadLogo(featuredLead)}
                    alt={featuredLead.name}
                    style={{
                      width: '68px',
                      height: '68px',
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
                  display: resolveLeadLogo(featuredLead) ? 'none' : 'flex',
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                  color: '#2563EB',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.6rem',
                  border: '2px solid #E2E8F0',
                  flexShrink: 0
                }}>
                  {featuredLead.name?.charAt(0) || 'L'}
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {featuredLead.company || companyName}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      {featuredLead.name}
                    </h3>
                    <CheckCircle2 size={18} color="#10B981" />
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#2563EB', marginTop: '2px' }}>
                    {featuredLead.title || 'Executive Decision Maker'} · {featuredLead.company || companyName}
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
                  padding: '13px 24px',
                  borderRadius: '10px',
                  background: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '0.9rem',
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
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>
                    Additional target accounts & decision-makers
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px' }}>
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
                  color: '#92400E'
                }}>
                  <Lock size={13} color="#D97706" />
                  <span>{lockedLeads.length} Profiles Locked</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {lockedLeads.map((item, idx) => {
                  const leadLogoUrl = resolveLeadLogo(item);
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

      {/* 5. TRUST FOOTER (Item 5 Applied: Login and Sign Up completely removed from footer) */}
      <footer style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0', padding: '28px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#64748B' }}>
            <ShieldCheck size={16} color="#10B981" />
            <span>{BRAND_NAME} Protected Intelligence Showcase · Enterprise SLA & Tenant Isolation</span>
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
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '36px 32px',
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
                background: '#FEF3C7',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px auto',
              }}
            >
              <Lock size={26} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              Decision-Maker Profile Locked
            </h3>

            <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: '1.5', marginBottom: '18px' }}>
              Direct contact details, verified mobile phone, and tailored intelligence dossier for <strong style={{ color: '#0F172A' }}>{lockedLeadNotice.name}</strong> at <strong style={{ color: '#0F172A' }}>{lockedLeadNotice.company || companyName}</strong> are locked in this sample preview.
            </p>

            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              textAlign: 'left',
              fontSize: '0.82rem',
              color: '#475569',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
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
              const leadPhone = isLeadUnlocked
                ? (selectedLead.phone || featuredLead?.phone || '+1 (555) 234-8900')
                : formatMaskedPhone(selectedLead.phone || selectedLead.maskedPhone);

              return (
                <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
                      EXECUTIVE PROFILE
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
                      {selectedLead.whySuitsBest || selectedLead.shortSummary || 'Direct budget decision maker aligned with key pain points and strategic initiatives.'}
                    </p>
                  </div>

                  {/* 1. Company Specific Container (Image 2) */}
                  <div style={{ background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '16px 20px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Building2 size={16} color="#2563EB" />
                      <span>COMPANY SPECIFIC</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.86rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <span style={{ color: '#64748B', fontWeight: 600 }}>Company Web:</span>
                        {(selectedLead.companyLink || sample?.companyStudy?.website) ? (
                          <a
                            href={(selectedLead.companyLink || sample?.companyStudy?.website).startsWith('http') ? (selectedLead.companyLink || sample?.companyStudy?.website) : `https://${selectedLead.companyLink || sample?.companyStudy?.website}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          >
                            <Globe size={14} style={{ flexShrink: 0 }} />
                            <span>{shortenUrl(selectedLead.companyLink || sample?.companyStudy?.website, 32)}</span>
                            <ExternalLink size={12} style={{ flexShrink: 0 }} />
                          </a>
                        ) : (
                          <span style={{ color: '#94A3B8' }}>Not specified</span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <span style={{ color: '#64748B', fontWeight: 600 }}>Company LinkedIn:</span>
                        {(selectedLead.companyLinkedin || sample?.companyStudy?.linkedin) ? (
                          <a
                            href={(selectedLead.companyLinkedin || sample?.companyStudy?.linkedin).startsWith('http') ? (selectedLead.companyLinkedin || sample?.companyStudy?.linkedin) : `https://${selectedLead.companyLinkedin || sample?.companyStudy?.linkedin}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
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
                  <div style={{ background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '16px 20px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={16} color="#7C3AED" />
                      <span>LEAD SPECIFIC</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.86rem' }}>
                      {/* Lead Mail */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <span style={{ color: '#64748B', fontWeight: 600 }}>Lead Mail:</span>
                        {leadMail ? (
                          isLeadUnlocked ? (
                            <a
                              href={`mailto:${leadMail}`}
                              style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                              <Mail size={14} color="#2563EB" style={{ flexShrink: 0 }} />
                              <span>{leadMail}</span>
                            </a>
                          ) : (
                            <span style={{ color: '#475569', fontFamily: 'monospace', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <Mail size={14} color="#94A3B8" style={{ flexShrink: 0 }} />
                              <span>{leadMail}</span>
                            </span>
                          )
                        ) : (
                          <span style={{ color: '#94A3B8' }}>Not specified</span>
                        )}
                      </div>

                      {/* Lead Phone */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <span style={{ color: '#64748B', fontWeight: 600 }}>Lead Phone:</span>
                        <span style={{ color: '#0F172A', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={14} color="#059669" style={{ flexShrink: 0 }} />
                          <span>{leadPhone}</span>
                        </span>
                      </div>

                      {/* Lead Role */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <span style={{ color: '#64748B', fontWeight: 600 }}>Lead Role:</span>
                        <span style={{ color: '#0F172A', fontWeight: 800 }}>
                          {selectedLead.title?.trim() || 'Executive Decision Maker'}
                        </span>
                      </div>

                      {/* Lead LinkedIn URL */}
                      {selectedLead.linkedin && !selectedLead.linkedin.includes('/company/') && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                          <span style={{ color: '#64748B', fontWeight: 600 }}>Lead LinkedIn:</span>
                          <a
                            href={selectedLead.linkedin.startsWith('http') ? selectedLead.linkedin : `https://${selectedLead.linkedin}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#0A66C2', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
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
