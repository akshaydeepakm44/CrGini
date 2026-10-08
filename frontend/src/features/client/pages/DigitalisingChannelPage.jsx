import React, { useState } from 'react';
import { Search, Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Square, CheckSquare } from 'lucide-react';
import { getServicesByChannel } from '../data/servicesData';

export default function DigitalisingChannelPage({
  onSelectService,
  onRequestService,
}) {
  const digitalisingServices = getServicesByChannel('digitalising');

  const [customServices, setCustomServices] = useState({
    leadResearch: false,
    companyStudy: false,
    keyPeople: false,
    pitchSupport: false,
  });
  const [customRequirements, setCustomRequirements] = useState('');

  const handleConfigureCustom = () => {
    if (onRequestService) {
      onRequestService('custom-digitalising', {
        selectedServices: customServices,
        requirements: customRequirements,
      });
    }
  };

  return (
    <div style={{ padding: '32px 36px 60px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Channel Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#0369A1',
              backgroundColor: '#E0F2FE',
              padding: '3px 10px',
              borderRadius: '9999px',
            }}
          >
            Service Channel
          </span>
          <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>•</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280' }}>24–72h Turnaround</span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--cg-font-heading, "Plus Jakarta Sans", sans-serif)',
            fontSize: '2rem',
            fontWeight: 800,
            color: 'var(--cg-text-primary, #111827)',
            margin: '0 0 8px 0',
            letterSpacing: '-0.02em',
          }}
        >
          Digitalising
        </h1>

        <p style={{ margin: 0, fontSize: '1rem', color: 'var(--cg-text-secondary, #4B5563)', maxWidth: '680px', lineHeight: 1.6 }}>
          Research and business intelligence services prepared by the CreativeGini specialist team. Verified lead telemetry, comprehensive account dossiers, and market research.
        </p>
      </div>

      {/* Services Grid (4 modules) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          marginBottom: '40px',
        }}
      >
        {digitalisingServices.map((svc) => (
          <div
            key={svc.id}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--cg-radius-xl, 20px)',
              border: '1px solid var(--cg-border-light, #E5E7EB)',
              padding: '24px',
              boxShadow: 'var(--cg-shadow-card, 0 4px 20px rgba(0, 0, 0, 0.04))',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 12px 28px rgba(14, 165, 233, 0.12)';
              e.currentTarget.style.borderColor = '#BAE6FD';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'var(--cg-shadow-card, 0 4px 20px rgba(0, 0, 0, 0.04))';
              e.currentTarget.style.borderColor = 'var(--cg-border-light, #E5E7EB)';
            }}
          >
            <div>
              {/* Top Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    backgroundColor: svc.iconBg,
                    color: svc.iconColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svc.icon size={22} />
                </div>

                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#6B7280',
                    backgroundColor: '#F3F4F6',
                    padding: '3px 8px',
                    borderRadius: '6px',
                  }}
                >
                  {svc.turnaround}
                </span>
              </div>

              {/* Title & Description */}
              <h3
                style={{
                  fontFamily: 'var(--cg-font-heading, "Plus Jakarta Sans", sans-serif)',
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: '#111827',
                  margin: '0 0 6px 0',
                }}
              >
                {svc.name}
              </h3>

              <p style={{ fontSize: '0.875rem', color: '#4B5563', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                {svc.shortDesc}
              </p>

              {/* What You Get Checklist */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#6B7280', marginBottom: '8px' }}>
                  What you get:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {svc.whatYouGet.slice(0, 3).map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.8125rem', color: '#374151' }}>
                      <CheckCircle2 size={14} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => onRequestService && onRequestService(svc.id)}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
                    color: '#FFFFFF',
                    fontSize: '0.84375rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(14, 165, 233, 0.25)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>Request {svc.shortTitle}</span>
                  <ArrowRight size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => onSelectService && onSelectService(svc.slug)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#FFFFFF',
                    color: '#374151',
                    fontSize: '0.84375rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ============================================================
          CUSTOM REQUEST SECTION (Application Light Theme)
          ============================================================ */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid var(--cg-border-light, #E5E7EB)',
          borderRadius: 'var(--cg-radius-xl, 20px)',
          padding: '28px 32px',
          boxShadow: 'var(--cg-shadow-card, 0 4px 20px rgba(0, 0, 0, 0.04))',
        }}
      >
        {/* Header Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#E0F2FE',
                color: '#0284C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>
                Custom Request
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.875rem', color: '#6B7280' }}>
                Select a combination of services or define customized deliverables for your growth sprint.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
              Pricing Model
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0284C7', marginTop: '2px' }}>
              Pricing based on scope
            </div>
          </div>
        </div>

        {/* SELECT WHAT YOU NEED: */}
        <div style={{ marginTop: '20px', marginBottom: '18px' }}>
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#4B5563',
              marginBottom: '10px',
            }}
          >
            SELECT WHAT YOU NEED:
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '14px',
            }}
          >
            {[
              { key: 'leadResearch', label: 'Lead Research', sub: 'Target Verified Lead Telemetry' },
              { key: 'companyStudy', label: 'Company Study', sub: 'Comprehensive Account Dossier' },
              { key: 'keyPeople', label: 'Key People Research', sub: 'Executive Hierarchy & Contacts' },
              { key: 'pitchSupport', label: 'Pitch Support', sub: 'Narrative & Objection Handling' },
            ].map((srv) => {
              const isChecked = !!customServices[srv.key];
              return (
                <div
                  key={srv.key}
                  onClick={() =>
                    setCustomServices((prev) => ({ ...prev, [srv.key]: !prev[srv.key] }))
                  }
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: isChecked ? '#F0F9FF' : '#F9FAFB',
                    border: isChecked ? '1.5px solid #0EA5E9' : '1px solid #E5E7EB',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ marginTop: '2px' }}>
                    {isChecked ? <CheckSquare size={18} color="#0284C7" /> : <Square size={18} color="#9CA3AF" />}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: isChecked ? '#0284C7' : '#111827' }}>
                      {srv.label}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>
                      {srv.sub}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Textarea */}
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '8px',
            }}
          >
            What would you like CreativeGini to prepare for you?
          </label>
          <textarea
            rows={4}
            value={customRequirements}
            onChange={(e) => setCustomRequirements(e.target.value)}
            placeholder="Describe your specific requirements, key goals, target market, or customized deliverables..."
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '10px',
              border: '1px solid #D1D5DB',
              backgroundColor: '#FFFFFF',
              color: '#111827',
              fontSize: '0.875rem',
              outline: 'none',
              boxSizing: 'border-box',
              resize: 'vertical',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#0EA5E9';
              e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.15)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#D1D5DB';
              e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.04)';
            }}
          />
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={handleConfigureCustom}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              padding: '11px 24px',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(14, 165, 233, 0.25)',
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
    </div>
  );
}
