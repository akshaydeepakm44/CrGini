import React, { useState } from 'react';
import {
  Boxes,
  Sparkles,
  CheckSquare,
  Square,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  Compass,
  PenTool,
  Code,
  Building2,
  Users,
  Presentation,
  Palette,
  Code2,
  CheckCircle2,
  Trash2,
  Percent
} from 'lucide-react';

const ALL_BUNDLE_SERVICES = [
  // Boosting
  {
    id: 'strategicPlan',
    serviceSlug: 'strategic-planner',
    category: 'boosting',
    channelLabel: 'Boosting',
    name: 'Strategic Planner',
    sub: 'Market positioning, ICP narrative & quarterly growth sequencing',
    price: 799,
    icon: Compass,
    color: '#EC4899',
    bg: '#FDF2F8',
  },
  {
    id: 'content',
    serviceSlug: 'content-creator',
    category: 'boosting',
    channelLabel: 'Boosting',
    name: 'Content Creator',
    sub: 'Sales collateral, thought leadership essays & branded visual assets',
    price: 799,
    icon: PenTool,
    color: '#F43F5E',
    bg: '#FFF1F2',
  },
  {
    id: 'devrel',
    serviceSlug: 'devrel',
    category: 'boosting',
    channelLabel: 'Boosting',
    name: 'DevRel & Technical Advocacy',
    sub: 'Documentation audit, developer experience & quickstart code samples',
    price: 799,
    icon: Code,
    color: '#8B5CF6',
    bg: '#F5F3FF',
  },
  {
    id: 'gtm',
    serviceSlug: 'gtm',
    category: 'boosting',
    channelLabel: 'Boosting',
    name: 'GTM Strategy',
    sub: 'Launch blueprints, distribution vector mapping & collateral deck',
    price: 799,
    icon: Target,
    color: '#10B981',
    bg: '#ECFDF5',
  },
  {
    id: 'adCreatives',
    serviceSlug: 'ad-creatives',
    category: 'boosting',
    channelLabel: 'Boosting',
    name: 'Ad Creatives',
    sub: 'Multi-format visual ads, CTR hook copy & creative testing matrix',
    price: 799,
    icon: Sparkles,
    color: '#EF4444',
    bg: '#FEF2F2',
  },
  {
    id: 'brandIdentity',
    serviceSlug: 'brand-identity',
    category: 'boosting',
    channelLabel: 'Boosting',
    name: 'Brand Identity & Positioning',
    sub: 'Brand style guidelines, typography lockups & tone-of-voice playbook',
    price: 799,
    icon: ShieldCheck,
    color: '#3B82F6',
    bg: '#EFF6FF',
  },

  // Digitalising
  {
    id: 'leadResearch',
    serviceSlug: 'lead-research',
    category: 'digitalising',
    channelLabel: 'Digitalising',
    name: 'Lead Research',
    sub: '50–200 hand-verified prospect contacts with direct email and phone telemetry',
    price: 499,
    icon: Target,
    color: '#7C3AED',
    bg: '#EDE9FE',
  },
  {
    id: 'companyStudy',
    serviceSlug: 'company-study',
    category: 'digitalising',
    channelLabel: 'Digitalising',
    name: 'Company Study & Account Dossiers',
    sub: 'Deep organizational hierarchy, tech stack audits & strategic pain points',
    price: 699,
    icon: Building2,
    color: '#6366F1',
    bg: '#EEF2FF',
  },
  {
    id: 'keyPeople',
    serviceSlug: 'key-people',
    category: 'digitalising',
    channelLabel: 'Digitalising',
    name: 'Key People Research',
    sub: 'Full buying committee mapping (economic buyers + evaluators)',
    price: 599,
    icon: Users,
    color: '#0EA5E9',
    bg: '#F0F9FF',
  },
  {
    id: 'pitchSupport',
    serviceSlug: 'pitch-support',
    category: 'digitalising',
    channelLabel: 'Digitalising',
    name: 'Pitch Support & Deck Research',
    sub: 'Defensible TAM sizing calculations, competitor battlecards & metrics',
    price: 799,
    icon: Presentation,
    color: '#10B981',
    bg: '#ECFDF5',
  },

  // UI / Design
  {
    id: 'uiUxAudit',
    serviceSlug: 'ui-ux-audit',
    category: 'design',
    channelLabel: 'UI / Design',
    name: 'UI/UX Audit',
    sub: 'Heuristic evaluation, annotated teardown & conversion friction matrix',
    price: 499,
    icon: Palette,
    color: '#0284C7',
    bg: '#F0F9FF',
  },
  {
    id: 'figmaProject',
    serviceSlug: 'figma-project',
    category: 'design',
    channelLabel: 'UI / Design',
    name: 'Figma Project',
    sub: 'Production-ready component library, interactive frames & design system',
    price: 599,
    icon: Palette,
    color: '#7C3AED',
    bg: '#FAF5FF',
  },
  {
    id: 'redesignRequest',
    serviceSlug: 'redesign-request',
    category: 'design',
    channelLabel: 'UI / Design',
    name: 'Redesign Request',
    sub: 'Full page redesign with high-conversion hero layout & component specs',
    price: 599,
    icon: Palette,
    color: '#EC4899',
    bg: '#FDF2F8',
  },

  // App Development
  {
    id: 'webApp',
    serviceSlug: 'web-app',
    category: 'development',
    channelLabel: 'App Development',
    name: 'Web Application MVP',
    sub: 'Turnkey full-stack application core, relational database & UI workflows',
    price: 1499,
    icon: Code2,
    color: '#10B981',
    bg: '#ECFDF5',
  },
  {
    id: 'mobileApp',
    serviceSlug: 'mobile-app',
    category: 'development',
    channelLabel: 'App Development',
    name: 'Mobile App Development',
    sub: 'Cross-platform React Native app with native API & push integrations',
    price: 1699,
    icon: Code2,
    color: '#6366F1',
    bg: '#EEF2FF',
  },
  {
    id: 'apiBackend',
    serviceSlug: 'api-backend',
    category: 'development',
    channelLabel: 'App Development',
    name: 'API & Backend Systems',
    sub: 'Scalable relational architecture, authentication engine & REST endpoints',
    price: 1299,
    icon: Code2,
    color: '#0EA5E9',
    bg: '#F0F9FF',
  },
];

export default function CustomBundlePage({ onRequestCustomBundle, onNavigate }) {
  const [selectedServices, setSelectedServices] = useState({
    strategicPlan: true,
    content: true,
    leadResearch: true,
  });
  const [activeCategory, setActiveCategory] = useState('all');
  const [customRequirements, setCustomRequirements] = useState('');

  const toggleService = (id) => {
    setSelectedServices((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const selectedList = ALL_BUNDLE_SERVICES.filter((s) => selectedServices[s.id]);
  const subtotal = selectedList.reduce((sum, s) => sum + s.price, 0);

  // Dynamic Tiered Volume Discount
  let discountRate = 0;
  if (selectedList.length >= 4) {
    discountRate = 0.20; // 20% off for 4+ services
  } else if (selectedList.length === 3) {
    discountRate = 0.15; // 15% off for 3 services
  } else if (selectedList.length === 2) {
    discountRate = 0.10; // 10% off for 2 services
  }

  const discountAmount = Math.round(subtotal * discountRate);
  const bundleTotal = subtotal - discountAmount;

  const handleConfigure = () => {
    if (onRequestCustomBundle) {
      onRequestCustomBundle('custom', {
        selectedServices,
        requirements: customRequirements || `Custom Multi-Service Bundle: ${selectedList.map((s) => s.name).join(', ')}`,
      });
    }
  };

  const visibleServices = ALL_BUNDLE_SERVICES.filter(
    (s) => activeCategory === 'all' || s.category === activeCategory
  );

  return (
    <div style={{ padding: '32px 36px 60px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#7C3AED',
              backgroundColor: '#F5F3FF',
              padding: '3px 12px',
              borderRadius: '9999px',
              border: '1px solid #DDD4FA',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Boxes size={13} />
            <span>CUSTOM BUNDLE BUILDER</span>
          </span>
          <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>•</span>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#059669',
              backgroundColor: '#ECFDF5',
              padding: '3px 10px',
              borderRadius: '9999px',
            }}
          >
            Tiered Volume Discounts
          </span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--cg-font-heading, "Plus Jakarta Sans", sans-serif)',
            fontSize: '2.1rem',
            fontWeight: 800,
            color: 'var(--cg-text-primary, #111827)',
            margin: '0 0 8px 0',
            letterSpacing: '-0.02em',
          }}
        >
          Custom Bundle
        </h1>

        <p style={{ margin: 0, fontSize: '1rem', color: 'var(--cg-text-secondary, #4B5563)', maxWidth: '780px', lineHeight: 1.6 }}>
          Build your custom sprint by picking any services across Boosting, Digitalising, UI/Design, and App Development. Automatically unlock volume bundle savings as you select capabilities.
        </p>
      </div>

      {/* Dynamic Tier Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '14px',
          marginBottom: '28px',
        }}
      >
        {[
          { count: '2 Services', discount: '10% OFF', desc: 'Accelerated 2-service cross-channel sprint' },
          { count: '3 Services', discount: '15% OFF', desc: 'Coordinated specialist pod execution' },
          { count: '4+ Services', discount: '20% OFF', desc: 'Turnkey full-cycle growth & engineering pod' },
        ].map((tier, idx) => {
          const isActive =
            (idx === 0 && selectedList.length === 2) ||
            (idx === 1 && selectedList.length === 3) ||
            (idx === 2 && selectedList.length >= 4);
          return (
            <div
              key={idx}
              style={{
                padding: '16px 20px',
                borderRadius: '14px',
                border: isActive ? '1.5px solid #7C3AED' : '1px solid #E5E7EB',
                backgroundColor: isActive ? '#FAF5FF' : '#FFFFFF',
                boxShadow: isActive ? '0 4px 16px rgba(124, 58, 237, 0.12)' : '0 2px 8px rgba(0,0,0,0.02)',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: isActive ? '#6D28D9' : '#111827' }}>
                  {tier.count}
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: isActive ? '#7C3AED' : '#059669',
                    backgroundColor: isActive ? '#EDE9FE' : '#ECFDF5',
                    padding: '2px 8px',
                    borderRadius: '6px',
                  }}
                >
                  {tier.discount}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.78125rem', color: '#6B7280' }}>
                {tier.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Main 2-Column Layout: Service Picker (Left) & Bundle Calculator (Right) */}
      <style>{`
        .cg-custom-bundle-layout {
          display: grid;
          gap: 28px;
          grid-template-columns: minmax(0, 1fr) 380px;
          align-items: start;
        }
        @media (max-width: 1040px) {
          .cg-custom-bundle-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <div className="cg-custom-bundle-layout">
        {/* Left Column: Category Tabs & Service Grid */}
        <div>
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {[
              { id: 'all', label: `All Services (${ALL_BUNDLE_SERVICES.length})` },
              { id: 'boosting', label: 'Boosting (6)' },
              { id: 'digitalising', label: 'Digitalising (4)' },
              { id: 'design', label: 'UI / Design (3)' },
              { id: 'development', label: 'App Development (3)' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '0.84375rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: activeCategory === tab.id ? '#7C3AED' : '#FFFFFF',
                  color: activeCategory === tab.id ? '#FFFFFF' : '#4B5563',
                  border: activeCategory === tab.id ? '1px solid #7C3AED' : '1px solid #E5E7EB',
                  boxShadow: activeCategory === tab.id ? '0 2px 8px rgba(124, 58, 237, 0.22)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Service Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
              marginBottom: '28px',
            }}
          >
            {visibleServices.map((srv) => {
              const isChecked = !!selectedServices[srv.id];
              return (
                <div
                  key={srv.id}
                  onClick={() => toggleService(srv.id)}
                  style={{
                    backgroundColor: isChecked ? '#FAF5FF' : '#FFFFFF',
                    border: isChecked ? '1.5px solid #7C3AED' : '1px solid #E5E7EB',
                    borderRadius: '16px',
                    padding: '20px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: isChecked ? '0 4px 16px rgba(124, 58, 237, 0.12)' : '0 2px 8px rgba(0,0,0,0.03)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isChecked) e.currentTarget.style.borderColor = '#DDD4FA';
                  }}
                  onMouseLeave={(e) => {
                    if (!isChecked) e.currentTarget.style.borderColor = '#E5E7EB';
                  }}
                >
                  <div>
                    {/* Top Row: Icon & Checkbox */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          backgroundColor: srv.bg,
                          color: srv.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <srv.icon size={18} />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            color: '#6B7280',
                            backgroundColor: '#F3F4F6',
                            padding: '2px 8px',
                            borderRadius: '4px',
                          }}
                        >
                          {srv.channelLabel}
                        </span>

                        <div
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '6px',
                            border: isChecked ? '2px solid #7C3AED' : '2px solid #D1D5DB',
                            backgroundColor: isChecked ? '#7C3AED' : '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFFFFF',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                          }}
                        >
                          {isChecked ? '✓' : ''}
                        </div>
                      </div>
                    </div>

                    <h3
                      style={{
                        fontFamily: 'var(--cg-font-heading, "Plus Jakarta Sans", sans-serif)',
                        fontSize: '1.0625rem',
                        fontWeight: 800,
                        color: isChecked ? '#6D28D9' : '#111827',
                        margin: '0 0 6px 0',
                      }}
                    >
                      {srv.name}
                    </h3>

                    <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6B7280', lineHeight: 1.45 }}>
                      {srv.sub}
                    </p>
                  </div>

                  <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 600 }}>Standard Sprint</span>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#111827' }}>${srv.price}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scope & Instructions */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E5E7EB',
              padding: '22px',
            }}
          >
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--cg-font-heading, "Plus Jakarta Sans", sans-serif)',
                fontSize: '0.9375rem',
                fontWeight: 800,
                color: '#111827',
                marginBottom: '4px',
              }}
            >
              Bundle Objectives & Custom Scope
            </label>
            <p style={{ margin: '0 0 10px', fontSize: '0.8125rem', color: '#6B7280' }}>
              Describe what you would like CreativeGini to prioritize across your selected capabilities.
            </p>
            <textarea
              rows={4}
              value={customRequirements}
              onChange={(e) => setCustomRequirements(e.target.value)}
              placeholder="e.g. Combine a B2B SaaS GTM launch playbook with 100 hand-verified VP of Sales leads and high-CTR LinkedIn ad creatives..."
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid #E5E7EB',
                fontSize: '0.84375rem',
                color: '#111827',
                backgroundColor: '#FAFAFA',
                outline: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                resize: 'vertical',
              }}
            />
          </div>
        </div>

        {/* Right Column: Sticky Live Bundle Calculator */}
        <div
          style={{
            position: 'sticky',
            top: '24px',
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E5E7EB',
            padding: '24px',
            boxShadow: 'var(--cg-shadow-card, 0 4px 20px rgba(0,0,0,0.04))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#F5F3FF',
                  color: '#7C3AED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Boxes size={18} />
              </div>
              <h2 style={{ fontSize: '1.0625rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                Bundle Summary
              </h2>
            </div>

            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#7C3AED',
                backgroundColor: '#F5F3FF',
                padding: '3px 10px',
                borderRadius: '9999px',
              }}
            >
              {selectedList.length} Selected
            </span>
          </div>

          {/* Selected Services Itemized List */}
          <div style={{ marginBottom: '18px', maxHeight: '260px', overflowY: 'auto' }}>
            {selectedList.length === 0 ? (
              <div
                style={{
                  padding: '24px 14px',
                  textAlign: 'center',
                  borderRadius: '10px',
                  backgroundColor: '#FAFAFA',
                  border: '1px dashed #E5E7EB',
                  fontSize: '0.8125rem',
                  color: '#9CA3AF',
                }}
              >
                Select at least one capability from the catalog to build your bundle.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedList.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      backgroundColor: '#F9FAFB',
                      border: '1px solid #F3F4F6',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: s.color }} />
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1F2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {s.name}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#4B5563' }}>${s.price}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleService(s.id);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#9CA3AF',
                          cursor: 'pointer',
                          padding: '2px',
                          display: 'flex',
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing Calculation Breakdown */}
          <div style={{ paddingTop: '16px', borderTop: '1px solid #F3F4F6', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.84375rem', color: '#6B7280' }}>
              <span>Catalog Subtotal</span>
              <span style={{ fontWeight: 600, color: '#374151' }}>${subtotal}</span>
            </div>

            {discountRate > 0 ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.84375rem', color: '#059669' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Percent size={13} />
                  <span>Bundle Volume Discount ({Math.round(discountRate * 100)}%)</span>
                </span>
                <span style={{ fontWeight: 700 }}>-${discountAmount}</span>
              </div>
            ) : (
              <div style={{ marginBottom: '8px', fontSize: '0.75rem', color: '#9CA3AF' }}>
                Tip: Add {2 - selectedList.length} more service to unlock 10% bundle savings!
              </div>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                paddingTop: '10px',
                borderTop: '1px dashed #E5E7EB',
              }}
            >
              <div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#111827' }}>
                  Authoritative Sprint Price:
                </span>
                <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>
                  Includes dedicated specialist pod
                </div>
              </div>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#7C3AED' }}>
                ${bundleTotal}
              </span>
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="button"
            disabled={selectedList.length === 0}
            onClick={handleConfigure}
            style={{
              width: '100%',
              padding: '12px 20px',
              borderRadius: '10px',
              border: 'none',
              background: selectedList.length === 0 ? '#E5E7EB' : 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
              color: selectedList.length === 0 ? '#9CA3AF' : '#FFFFFF',
              fontSize: '0.90625rem',
              fontWeight: 700,
              cursor: selectedList.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: selectedList.length === 0 ? 'none' : '0 4px 14px rgba(124, 58, 237, 0.3)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (selectedList.length > 0) e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
          >
            <span>Configure Custom Bundle</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
