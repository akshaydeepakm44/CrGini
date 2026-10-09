import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  Globe,
  X
} from 'lucide-react';
import { api } from '../../services/api';

/**
 * PublicSampleDashboard Component
 * Controlled public read-only showcase of curated intelligence:
 * Company Studies, Lead Intelligence, Lead Studies, and Pitch Deck samples.
 * Designed for prospective clients arriving from marketing emails ("Visit" link).
 */
export default function PublicSampleDashboard() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [sample, setSample] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'company' | 'leads' | 'study' | 'pitch'
  const [selectedLead, setSelectedLead] = useState(null);

  const effectiveSlug = slug || 'data-i2i';

  useEffect(() => {
    setLoading(true);
    setError('');

    api.getPublicSample(effectiveSlug)
      .then((data) => {
        if (data?.sample) {
          setSample(data.sample);
        } else {
          setError('Sample showcase could not be loaded.');
        }
      })
      .catch((err) => {
        console.error('[PublicSampleDashboard] Failed to fetch:', err);
        setError(err.message || 'Sample intelligence showcase not found or currently unpublished.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [effectiveSlug]);

  const handleMoreLeadsClick = () => {
    navigate('/signin?returnTo=/portal');
  };

  const handleSignUpClick = () => {
    navigate('/signin?view=signup&returnTo=/portal');
  };

  const handleLoginClick = () => {
    navigate('/signin?returnTo=/portal');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="portal-spinner" style={{ margin: '0 auto 16px auto' }} />
          <p style={{ color: '#64748B', fontSize: '0.95rem', fontWeight: 500 }}>
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
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                background: '#F1F5F9',
                border: '1px solid #E2E8F0',
                color: '#334155',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Return Home
            </button>
            <button
              onClick={handleMoreLeadsClick}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                background: '#2563EB',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Client Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { title, companyName, description, companyStudy, leads, leadStudies, pitchDeck } = sample;

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', color: '#0F172A', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      
      {/* 1. TOP HEADER & NAVIGATION */}
      <header style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 40, backdropFilter: 'blur(8px)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <img src="/logo.png" alt="CreativeGini" style={{ height: '34px', width: 'auto' }} />
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.3px' }}>
                Creative<span style={{ color: '#2563EB' }}>Gini</span>
              </span>
            </Link>
            <span style={{ height: '18px', width: '1px', background: '#CBD5E1' }} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#475569', background: '#F1F5F9', padding: '4px 10px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              Sample Intelligence Showcase
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
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
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <LogIn size={15} />
              <span>Login</span>
            </button>

            <button
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
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
                transition: 'all 0.15s ease',
              }}
            >
              <UserPlus size={15} />
              <span>Sign Up</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. HERO BANNER */}
      <section style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%)', borderBottom: '1px solid #E2E8F0', padding: '48px 24px' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '6px 14px', borderRadius: '20px', color: '#1D4ED8', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '16px' }}>
            <Sparkles size={14} />
            <span>Curated Intelligence · Enterprise Delivery Demonstration</span>
          </div>

          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0F172A', lineHeight: '1.2', letterSpacing: '-0.5px', marginBottom: '12px' }}>
            See the kind of intelligence CreativeGini can prepare for your team.
          </h1>

          <p style={{ fontSize: '1.05rem', color: '#475569', maxWidth: '780px', lineHeight: '1.6', marginBottom: '24px' }}>
            {description || `Explore sample company research, qualified executive decision-makers, actionable opportunity studies, and pitch architecture prepared for ${companyName}.`}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '8px 14px', borderRadius: '8px', fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>
              <Building2 size={16} color="#2563EB" />
              <span>Target: {companyName}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '8px 14px', borderRadius: '8px', fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>
              <Users size={16} color="#059669" />
              <span>{leads?.length || 4} Verified Decision Makers</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '8px 14px', borderRadius: '8px', fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>
              <Presentation size={16} color="#7C3AED" />
              <span>B2B Growth Playbook Included</span>
            </div>
          </div>

        </div>
      </section>

      {/* MAIN CONTENT BODY */}
      <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '40px 24px' }}>

        {/* SECTION 1: COMPANY STUDY */}
        {companyStudy && (
          <section style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Company Study: What We Know About {companyStudy.company || companyName}
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
                    Executive profile, peer market positioning, and observed commercial opportunities
                  </p>
                </div>
              </div>

              {/* View / Download Company Study PDF Button */}
              <a
                href={companyStudy.pdfUrl || `/api/samples/${sample.slug}/company-study-pdf`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  background: '#2563EB',
                  color: '#FFFFFF',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
                  transition: 'all 0.15s ease',
                }}
              >
                <FileText size={16} />
                <span>View Company Study PDF</span>
                <ExternalLink size={14} />
              </a>
            </div>

            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '28px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                <div style={{ background: '#F8FAFC', padding: '18px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748B', marginBottom: '6px' }}>
                    Target Organization
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>
                    {companyStudy.company || companyName}
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '18px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748B', marginBottom: '6px' }}>
                    Industry / Sector
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>
                    {companyStudy.industry || 'Technology & Professional Services'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Compass size={16} color="#2563EB" />
                    Business Overview
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                    {companyStudy.businessOverview || 'Comprehensive analysis of product-market fit, enterprise scale, and organizational structure.'}
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={16} color="#059669" />
                    Market Position
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                    {companyStudy.marketPosition || 'Evaluated peer landscape, customer benchmarks, and competitive differentiation vectors.'}
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Search size={16} color="#D97706" />
                    Key Observations
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                    {companyStudy.keyObservations || 'Observed operational bottlenecks, growth triggers, and leadership priorities.'}
                  </p>
                </div>

              </div>

            </div>
          </section>
        )}

        {/* SECTION 2: CURATED LEADS (ROW VIEW) */}
        <section style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Curated Leads & Stakeholder Intelligence
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
                  Click any lead row to open the complete Lead Dossier with LinkedIn, "Why Suits Best", Lead Study & Pitch Deck
                </p>
              </div>
            </div>

            <div style={{ fontSize: '0.8125rem', color: '#059669', background: '#ECFDF5', padding: '6px 14px', borderRadius: '20px', fontWeight: 600, border: '1px solid #A7F3D0' }}>
              Row View · Click row to open Lead Card
            </div>
          </div>

          {/* List of Leads in Row View */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            }}
          >
            {/* Table Header Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(240px, 1.3fr) minmax(180px, 1fr) minmax(280px, 1.8fr) 140px',
                padding: '14px 24px',
                background: '#F8FAFC',
                borderBottom: '1px solid #E2E8F0',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#64748B',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              <div>Executive Lead</div>
              <div>Company He Belongs To</div>
              <div>Why This Lead Suits Best</div>
              <div style={{ textAlign: 'right' }}>Dossier</div>
            </div>

            {/* Lead Rows */}
            {(leads || []).map((lead, idx) => (
              <div
                key={lead.id || idx}
                onClick={() => setSelectedLead(lead)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(240px, 1.3fr) minmax(180px, 1fr) minmax(280px, 1.8fr) 140px',
                  alignItems: 'center',
                  padding: '18px 24px',
                  borderBottom: idx === leads.length - 1 ? 'none' : '1px solid #F1F5F9',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                  backgroundColor: '#FFFFFF',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
              >
                {/* Column 1: Lead Avatar, Name & Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {lead.logo ? (
                    <img
                      src={lead.logo}
                      alt={lead.company}
                      style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #E2E8F0' }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                        color: '#2563EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1rem',
                        flexShrink: 0,
                      }}
                    >
                      {lead.name?.charAt(0) || 'L'}
                    </div>
                  )}

                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {lead.name}
                      </span>
                      <ShieldCheck size={14} color="#10B981" title="Verified Decision Maker" />
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#2563EB', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {lead.title}
                    </div>
                  </div>
                </div>

                {/* Column 2: Company he belongs to */}
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building2 size={14} color="#64748B" />
                    <span>{lead.company || sample?.companyName}</span>
                  </div>
                  {lead.companyLink ? (
                    <a
                      href={lead.companyLink.startsWith('http') ? lead.companyLink : `https://${lead.companyLink}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{ fontSize: '0.75rem', color: '#2563EB', marginTop: '2px', display: 'inline-flex', alignItems: 'center', gap: '3px', textDecoration: 'none', fontWeight: 500 }}
                    >
                      <Globe size={11} />
                      <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lead.companyLink.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '')}
                      </span>
                      <ExternalLink size={10} />
                    </a>
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                      {lead.location || lead.industry || 'B2B Enterprise'}
                    </div>
                  )}
                </div>

                {/* Column 3: Why Suits Best (Snippet) */}
                <div style={{ paddingRight: '16px' }}>
                  <div
                    style={{
                      fontSize: '0.8125rem',
                      color: '#475569',
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    🎯 <strong style={{ color: '#1E293B' }}>Fit Rationale:</strong> {lead.whySuitsBest || lead.shortSummary}
                  </div>
                </div>

                {/* Column 4: Action */}
                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#EFF6FF',
                      color: '#2563EB',
                      border: '1px solid #BFDBFE',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    Inspect Card ↗
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: PITCH SUPPORT SAMPLE */}
        {pitchDeck && (
          <section style={{ marginBottom: '56px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FAF5FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Presentation size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Pitch Support
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
                  Tailored presentation blueprint and high-impact sales enablement collateral
                </p>
              </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)', borderRadius: '16px', padding: '32px', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
              
              <div style={{ maxWidth: '640px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#A5B4FC' }}>
                  Interactive Deliverable Sample
                </span>
                <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF', margin: '6px 0 10px 0' }}>
                  {pitchDeck.title || 'Enterprise Growth & Intelligence Playbook'}
                </h3>
                <p style={{ fontSize: '0.92rem', color: '#C7D2FE', lineHeight: '1.6', margin: 0 }}>
                  {pitchDeck.summary || 'Custom presentation architecture highlighting strategic value drivers, implementation milestones, and ROI projections.'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <a
                  href={pitchDeck.streamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 22px',
                    borderRadius: '10px',
                    background: '#FFFFFF',
                    color: '#1E1B4B',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                  }}
                >
                  <ExternalLink size={16} />
                  <span>Preview Pitch Deck</span>
                </a>

                {pitchDeck.downloadUrl && (
                  <a
                    href={pitchDeck.downloadUrl}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 20px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.15)',
                      color: '#FFFFFF',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      textDecoration: 'none',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    <Download size={16} />
                    <span>Download PDF</span>
                  </a>
                )}
              </div>

            </div>
          </section>
        )}

        {/* SECTION 5: CALL TO ACTION "MORE LEADS +" */}
        <section
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            border: '2px solid #2563EB',
            padding: '48px 36px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(37,99,235,0.08)',
            marginBottom: '48px',
          }}
        >
          <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', marginBottom: '16px' }}>
            <Users size={32} />
          </div>

          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', marginBottom: '10px', letterSpacing: '-0.3px' }}>
            Want access to more qualified leads & custom intelligence?
          </h2>

          <p style={{ fontSize: '1rem', color: '#64748B', maxWidth: '620px', margin: '0 auto 28px auto', lineHeight: '1.6' }}>
            Unlock your full tailored pipeline of vetted decision makers, detailed company dossiers, and direct specialist execution on your private CreativeGini dashboard.
          </p>

          <button
            onClick={handleMoreLeadsClick}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '16px 36px',
              borderRadius: '12px',
              background: '#2563EB',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '1.05rem',
              fontWeight: 800,
              letterSpacing: '0.5px',
              cursor: 'pointer',
              boxShadow: '0 4px 18px rgba(37,99,235,0.35)',
              transition: 'all 0.2s ease',
            }}
          >
            <span>MORE LEADS +</span>
            <ArrowRight size={18} />
          </button>
        </section>

      </main>

      {/* 6. TRUST FOOTER */}
      <footer style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0', padding: '36px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
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
            <span>CreativeGini Protected Intelligence Showcase · Enterprise SLA & Tenant Isolation</span>
          </div>

        </div>
      </footer>

      {/* 7. INTERACTIVE LEAD DOSSIER CARD / MODAL */}
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
            animation: 'fadeIn 0.2s ease',
          }}
          onClick={() => setSelectedLead(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '720px',
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
            <div
              style={{
                padding: '24px 28px',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                background: 'linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)',
                borderRadius: '20px 20px 0 0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {selectedLead.logo ? (
                  <img
                    src={selectedLead.logo}
                    alt={selectedLead.company}
                    style={{ width: '56px', height: '56px', borderRadius: '14px', objectFit: 'cover', border: '1px solid #E2E8F0' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                      color: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.4rem',
                      flexShrink: 0,
                    }}
                  >
                    {selectedLead.name?.charAt(0) || 'L'}
                  </div>
                )}

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      {selectedLead.name}
                    </h3>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: '12px', border: '1px solid #A7F3D0' }}>
                      <ShieldCheck size={13} /> Verified
                    </span>
                  </div>

                  <div style={{ fontSize: '0.9rem', color: '#2563EB', fontWeight: 600, marginTop: '2px' }}>
                    {selectedLead.title}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', fontSize: '0.8125rem', color: '#64748B' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>🏢 {selectedLead.company}</span>
                    {selectedLead.location && <span>📍 {selectedLead.location}</span>}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedLead(null)}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '10px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748B',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>

              {/* 1. LinkedIn & Masked Contact Bar */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px',
                  background: '#F8FAFC',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                }}
              >
                {/* LinkedIn Profile */}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                    LinkedIn Profile
                  </div>
                  {selectedLead.linkedin ? (
                    <a
                      href={selectedLead.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#0A66C2',
                        textDecoration: 'none',
                      }}
                    >
                      <Linkedin size={15} />
                      <span>Verified Profile</span>
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Profile on file</span>
                  )}
                </div>

                {/* Masked Work Email */}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Direct Work Email
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                    <Lock size={13} color="#D97706" />
                    <span>{selectedLead.maskedEmail || 's••••@company.com'}</span>
                  </div>
                </div>

                {/* Company Link / Website */}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Company Link / Website
                  </div>
                  {selectedLead.companyLink ? (
                    <a
                      href={selectedLead.companyLink.startsWith('http') ? selectedLead.companyLink : `https://${selectedLead.companyLink}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#2563EB',
                        textDecoration: 'none',
                      }}
                    >
                      <Globe size={14} />
                      <span style={{ maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {selectedLead.companyLink.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '')}
                      </span>
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>{selectedLead.company || 'Website on file'}</span>
                  )}
                </div>
              </div>

              {/* Lead Study PDF Attachment */}
              {(selectedLead.leadStudyPdf || selectedLead.leadStudyPdfUrl) && (
                <div
                  style={{
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#DBEAFE', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1E40AF' }}>
                        Lead Study Research PDF
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#3B82F6' }}>
                        {selectedLead.leadStudyPdfName || `${selectedLead.name} - Deep-Dive Research.pdf`}
                      </div>
                    </div>
                  </div>

                  <a
                    href={selectedLead.leadStudyPdf || selectedLead.leadStudyPdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    download={selectedLead.leadStudyPdfName || `${selectedLead.name}_Lead_Study.pdf`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#2563EB',
                      color: '#FFFFFF',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                    }}
                  >
                    <Download size={14} />
                    <span>Download / View PDF</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}

              {/* 2. About the Lead Company */}
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1E293B', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={15} color="#2563EB" />
                  About The Lead's Company ({selectedLead.company})
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: '1.5', margin: 0, background: '#FFFFFF', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  {selectedLead.aboutCompany || `Leading corporate enterprise operating within the ${selectedLead.industry || 'technology'} vertical.`}
                </p>
              </div>

              {/* 3. Why This Lead Suits Best For You */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #FAF5FF 0%, #F5F3FF 100%)',
                  border: '1px solid #DDD4FA',
                  borderRadius: '12px',
                  padding: '16px 18px',
                }}
              >
                <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#6D28D9', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Target size={15} color="#7C3AED" />
                  Why This Lead Suits Best For You
                </div>
                <p style={{ fontSize: '0.9rem', color: '#4C1D95', lineHeight: '1.5', margin: 0, fontWeight: 500 }}>
                  {selectedLead.whySuitsBest || selectedLead.shortSummary || 'High-probability prospect with immediate authority and strategic alignment with your growth objectives.'}
                </p>
              </div>

              {/* 4. Lead Study Deep-Dive (Inside the Lead Card) */}
              {selectedLead.leadStudy && (
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1E293B', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={15} color="#D97706" />
                    Lead Study: What You Should Know About This Prospect
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                    <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>
                        🎯 Why Relevant
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: '#475569', margin: 0, lineHeight: '1.4' }}>
                        {selectedLead.leadStudy.whyRelevant || 'Direct budget decision maker aligned with key pain points.'}
                      </p>
                    </div>

                    <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>
                        🔍 Observed Context
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: '#475569', margin: 0, lineHeight: '1.4' }}>
                        {selectedLead.leadStudy.observedContext || 'Observed operational growth and procurement signals.'}
                      </p>
                    </div>

                    <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>
                        🧭 Suggested Approach Angle
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: '#475569', margin: 0, lineHeight: '1.4' }}>
                        {selectedLead.leadStudy.suggestedApproach || 'Lead with rapid technical deliverables and measurable SLA proof.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. Pitch Deck Proposal For This Lead */}
              {selectedLead.pitchDeck && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
                    borderRadius: '14px',
                    padding: '20px 22px',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '14px',
                  }}
                >
                  <div style={{ maxWidth: '420px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#A5B4FC', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Proposal Pitch Deck For This Lead
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
                      {selectedLead.pitchDeck.title || `Tailored Pitch Proposal for ${selectedLead.name}`}
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: '#C7D2FE', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                      {selectedLead.pitchDeck.summary || 'Turnkey presentation proposal crafted specifically to engage and convert this stakeholder.'}
                    </p>
                  </div>

                  <a
                    href={selectedLead.pitchDeck.streamUrl || `/api/samples/${sample.slug}/leads/${selectedLead.id}/pitch-deck`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: '#FFFFFF',
                      color: '#1E1B4B',
                      padding: '10px 18px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    }}
                  >
                    <Presentation size={15} />
                    <span>View Lead Pitch Deck PDF</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              )}

              {/* 6. Unlock Full Contact Details Call to Action */}
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  border: '2px solid #2563EB',
                  padding: '20px',
                  textAlign: 'center',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.08)',
                }}
              >
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                  Unlock Unmasked Direct Contacts & Full Campaign Engine
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#64748B', maxWidth: '460px', margin: '0 auto 16px auto' }}>
                  Sign up to access verified direct emails, direct phone numbers, and unlock 50+ additional leads tailored to your exact ICP.
                </p>

                <button
                  onClick={handleMoreLeadsClick}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 28px',
                    borderRadius: '10px',
                    background: '#2563EB',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                  }}
                >
                  <span>MORE LEADS + (UNLOCK FULL CONTACT)</span>
                  <ArrowRight size={16} />
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
