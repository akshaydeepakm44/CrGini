import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckSquare,
  Square,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Target,
  Compass,
  PenTool,
  Code,
  Building2,
  Users,
  Presentation,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';

/**
 * CustomPage Component
 * Dedicated full page for Custom Requests located after Pitch Support under Digitalising.
 * Faithfully implements the uploaded Custom Request functionality strictly in the application light theme.
 */
export default function CustomPage({ onRequestService, onNavigate }) {
  // Service selection state matching user mockup
  const [selectedServices, setSelectedServices] = useState({
    strategicPlan: true,
    content: true,
    devrel: false,
    leadResearch: false,
    companyStudy: false,
    keyPeople: false,
    pitchSupport: false,
  });

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'boosting', 'digitalising'
  const [customRequirements, setCustomRequirements] = useState('');

  const servicesList = [
    {
      key: 'strategicPlan',
      category: 'boosting',
      label: 'Strategic Plan',
      sub: 'Positioning & ICP Roadmap',
      icon: Compass,
      color: '#EC4899',
      bg: '#FDF2F8',
    },
    {
      key: 'content',
      category: 'boosting',
      label: 'Content for Your Company',
      sub: 'Branded Posters & Demo Videos',
      icon: PenTool,
      color: '#F43F5E',
      bg: '#FFF1F2',
    },
    {
      key: 'devrel',
      category: 'boosting',
      label: 'DevRel Plan',
      sub: 'Developer Relations Strategy',
      icon: Code,
      color: '#8B5CF6',
      bg: '#F5F3FF',
    },
    {
      key: 'leadResearch',
      category: 'digitalising',
      label: 'Lead Research',
      sub: 'Target Verified Lead Telemetry',
      icon: Target,
      color: '#7C3AED',
      bg: '#EDE9FE',
    },
    {
      key: 'companyStudy',
      category: 'digitalising',
      label: 'Company Study',
      sub: 'Comprehensive Account Dossier',
      icon: Building2,
      color: '#6366F1',
      bg: '#EEF2FF',
    },
    {
      key: 'keyPeople',
      category: 'digitalising',
      label: 'Key People Research',
      sub: 'Executive Hierarchy & Contacts',
      icon: Users,
      color: '#0EA5E9',
      bg: '#F0F9FF',
    },
    {
      key: 'pitchSupport',
      category: 'digitalising',
      label: 'Pitch Support',
      sub: 'Narrative & Objection Handling',
      icon: Presentation,
      color: '#10B981',
      bg: '#ECFDF5',
    },
  ];

  const filteredServices = activeTab === 'all'
    ? servicesList
    : servicesList.filter((s) => s.category === activeTab);

  const toggleService = (key) => {
    setSelectedServices((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const selectedCount = Object.values(selectedServices).filter(Boolean).length;

  const handleConfigureCustom = () => {
    if (onRequestService) {
      onRequestService('custom', {
        selectedServices,
        requirements: customRequirements,
      });
    }
  };

  return (
    <div
      style={{
        padding: '32px 36px 60px',
        maxWidth: '1280px',
        margin: '0 auto',
        fontFamily: 'var(--cg-font-family, "Inter", sans-serif)',
      }}
    >
      {/* 1. Breadcrumbs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.8125rem',
          color: '#6B7280',
          marginBottom: '16px',
        }}
      >
        <span
          onClick={() => onNavigate && onNavigate('/portal/dashboard')}
          style={{ cursor: 'pointer', transition: 'color 0.15s ease' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#7C3AED')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
        >
          Dashboard
        </span>
        <ChevronRight size={14} color="#9CA3AF" />
        <span
          onClick={() => onNavigate && onNavigate('/portal/digitalising')}
          style={{ cursor: 'pointer', transition: 'color 0.15s ease' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#7C3AED')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
        >
          Digitalising
        </span>
        <ChevronRight size={14} color="#9CA3AF" />
        <span style={{ color: '#111827', fontWeight: 600 }}>Custom Request</span>
      </div>

      {/* 2. Page Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#7C3AED',
              backgroundColor: '#EDE9FE',
              padding: '3px 10px',
              borderRadius: '9999px',
            }}
          >
            Custom Sprint Builder
          </span>
          <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>•</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280' }}>
            Multi-Disciplinary Execution
          </span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--cg-font-heading, "Plus Jakarta Sans", sans-serif)',
            fontSize: '2.1rem',
            fontWeight: 800,
            color: '#111827',
            margin: '0 0 10px 0',
            letterSpacing: '-0.025em',
          }}
        >
          Custom Request
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: '1rem',
            color: '#4B5563',
            maxWidth: '780px',
            lineHeight: 1.6,
          }}
        >
          Combine any set of strategic planning, creative content, developer advocacy, and account intelligence modules. Our specialist team will architect and deliver a coordinated execution package tailored to your unique objectives.
        </p>

        {/* Value Chips */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            marginTop: '16px',
          }}
        >
          {[
            { icon: Clock, label: 'Flexible Scope & Turnaround' },
            { icon: Users, label: 'Dedicated Specialist Pod' },
            { icon: ShieldCheck, label: 'Transparent Dynamic Pricing' },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                fontSize: '0.8125rem',
                color: '#4B5563',
                fontWeight: 500,
              }}
            >
              <item.icon size={14} color="#7C3AED" />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================
          3. MAIN CUSTOM REQUEST CARD (Application Light Theme)
          ============================================================ */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid var(--cg-border-light, #E5E7EB)',
          borderRadius: '20px',
          padding: '32px 36px',
          boxShadow: 'var(--cg-shadow-card, 0 4px 20px rgba(0, 0, 0, 0.04))',
          marginBottom: '36px',
        }}
      >
        {/* Card Header Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '8px',
            paddingBottom: '20px',
            borderBottom: '1px solid #F1F5F9',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: '#F5F3FF',
                color: '#7C3AED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(124, 58, 237, 0.15)',
              }}
            >
              <Sparkles size={22} />
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: '#111827',
                  letterSpacing: '-0.02em',
                }}
              >
                Custom Request
              </h2>
              <p
                style={{
                  margin: '4px 0 0 0',
                  fontSize: '0.875rem',
                  color: '#6B7280',
                  lineHeight: 1.4,
                }}
              >
                Select a combination of services or define customized deliverables for your growth sprint.
              </p>
            </div>
          </div>

          <div
            style={{
              textAlign: 'right',
              backgroundColor: '#FAF5FF',
              padding: '8px 16px',
              borderRadius: '10px',
              border: '1px solid #EDE9FE',
            }}
          >
            <div
              style={{
                fontSize: '0.72rem',
                color: '#6B7280',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontWeight: 700,
              }}
            >
              PRICING MODEL
            </div>
            <div
              style={{
                fontSize: '0.9375rem',
                fontWeight: 800,
                color: '#7C3AED',
                marginTop: '2px',
              }}
            >
              Pricing based on scope
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '20px',
            marginBottom: '16px',
          }}
        >
          {[
            { id: 'all', label: 'All Services' },
            { id: 'boosting', label: 'Boosting Sprints' },
            { id: 'digitalising', label: 'Digitalising Intelligence' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: activeTab === tab.id ? '#7C3AED' : '#E5E7EB',
                backgroundColor: activeTab === tab.id ? '#EDE9FE' : '#FFFFFF',
                color: activeTab === tab.id ? '#6D28D9' : '#4B5563',
                fontSize: '0.8125rem',
                fontWeight: activeTab === tab.id ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* SELECT WHAT YOU NEED: */}
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#4B5563',
              marginBottom: '12px',
            }}
          >
            SELECT WHAT YOU NEED:
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '14px',
            }}
          >
            {filteredServices.map((srv) => {
              const isChecked = !!selectedServices[srv.key];
              const Icon = srv.icon;
              return (
                <div
                  key={srv.key}
                  onClick={() => toggleService(srv.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: isChecked ? '#FAF5FF' : '#FFFFFF',
                    border: isChecked ? '1.5px solid #7C3AED' : '1px solid #E5E7EB',
                    boxShadow: isChecked
                      ? '0 4px 14px rgba(124, 58, 237, 0.1)'
                      : '0 1px 3px rgba(0, 0, 0, 0.03)',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isChecked) {
                      e.currentTarget.style.borderColor = '#C4B5FD';
                      e.currentTarget.style.backgroundColor = '#FAFAFD';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isChecked) {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }
                  }}
                >
                  <div style={{ marginTop: '2px' }}>
                    {isChecked ? (
                      <CheckSquare size={19} color="#7C3AED" />
                    ) : (
                      <Square size={19} color="#9CA3AF" />
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '6px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.925rem',
                          fontWeight: 700,
                          color: isChecked ? '#6D28D9' : '#111827',
                        }}
                      >
                        {srv.label}
                      </div>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          backgroundColor: srv.bg,
                          color: srv.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon size={13} />
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: '0.78rem',
                        color: isChecked ? '#7C3AED' : '#6B7280',
                        marginTop: '3px',
                      }}
                    >
                      {srv.sub}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Textarea Section */}
        <div style={{ marginBottom: '24px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.84375rem',
              fontWeight: 700,
              color: '#111827',
              marginBottom: '8px',
            }}
          >
            What would you like CreativeGini to prepare for you?
          </label>
          <textarea
            rows={5}
            value={customRequirements}
            onChange={(e) => setCustomRequirements(e.target.value)}
            placeholder="Describe your specific requirements, key goals, target market, or customized deliverables..."
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '12px',
              border: '1px solid #D1D5DB',
              backgroundColor: '#FFFFFF',
              color: '#111827',
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box',
              resize: 'vertical',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              lineHeight: 1.5,
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#7C3AED';
              e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.15)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#D1D5DB';
              e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.04)';
            }}
          />
        </div>

        {/* Bottom Action Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            paddingTop: '16px',
            borderTop: '1px solid #F1F5F9',
          }}
        >
          <div style={{ fontSize: '0.84375rem', color: '#6B7280' }}>
            <strong style={{ color: '#111827' }}>{selectedCount}</strong> {selectedCount === 1 ? 'service area' : 'service areas'} selected • Pricing calculated dynamically upon review
          </div>

          <button
            type="button"
            onClick={handleConfigureCustom}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 28px',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(124, 58, 237, 0.3)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
          >
            <span>Configure Custom Request</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* 4. How Custom Sprints Work Cards */}
      <div>
        <h3
          style={{
            fontFamily: 'var(--cg-font-heading, "Plus Jakarta Sans", sans-serif)',
            fontSize: '1.2rem',
            fontWeight: 800,
            color: '#111827',
            margin: '0 0 16px 0',
          }}
        >
          How Custom Sprints Work
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '18px',
          }}
        >
          {[
            {
              step: '01',
              title: 'Scope Architecture',
              desc: 'Select the services you need and outline your deliverables. Review the brief and get an instant authoritative price estimate.',
              icon: Layers,
            },
            {
              step: '02',
              title: 'Specialist Pod Assignment',
              desc: 'Our team hand-matches dedicated human copywriters, DevRel engineers, and research specialists to your exact requirements.',
              icon: Users,
            },
            {
              step: '03',
              title: 'Turnkey Delivery & Revisions',
              desc: 'Receive your deliverables directly in your client portal with versioned reviews, comments, and turnkey sign-off.',
              icon: Zap,
            },
          ].map((card, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E5E7EB',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: '#7C3AED',
                    backgroundColor: '#EDE9FE',
                    padding: '4px 10px',
                    borderRadius: '8px',
                  }}
                >
                  STEP {card.step}
                </span>
                <card.icon size={18} color="#6B7280" />
              </div>

              <h4
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: '#111827',
                  margin: '0 0 8px 0',
                }}
              >
                {card.title}
              </h4>

              <p
                style={{
                  fontSize: '0.84375rem',
                  color: '#6B7280',
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
