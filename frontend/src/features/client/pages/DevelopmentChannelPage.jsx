import React from 'react';
import { Code2, Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Zap, Globe, Smartphone, Terminal } from 'lucide-react';
import { getServicesByChannel } from '../data/servicesData';

export default function DevelopmentChannelPage({
  onSelectService,
  onRequestService,
}) {
  const devServices = getServicesByChannel('development');

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
              color: '#059669',
              backgroundColor: '#D1FAE5',
              padding: '3px 10px',
              borderRadius: '9999px',
            }}
          >
            Service Channel
          </span>
          <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>•</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280' }}>Production-Ready Engineering</span>
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
          App Development
        </h1>

        <p style={{ margin: 0, fontSize: '1rem', color: 'var(--cg-text-secondary, #4B5563)', maxWidth: '680px', lineHeight: 1.6 }}>
          Turnkey full-stack web applications, cross-platform mobile apps, and scalable API systems. Dedicated engineering specialists deliver clean, maintainable, and deployed software solutions.
        </p>
      </div>

      {/* Services Grid (3 modules) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px',
          marginBottom: '40px',
        }}
      >
        {devServices.map((svc) => (
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
              e.currentTarget.style.boxShadow = '0 12px 28px rgba(5, 150, 105, 0.12)';
              e.currentTarget.style.borderColor = '#A7F3D0';
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
                      <span style={{ lineHeight: 1.4 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Card Actions */}
            <div>
              <div
                style={{
                  paddingTop: '16px',
                  borderTop: '1px solid #F3F4F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 500 }}>Starting from</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>
                    ${svc.startingPrice}
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#9CA3AF' }}> / sprint</span>
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => onSelectService(svc.slug)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#FFFFFF',
                    color: '#374151',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F9FAFB';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                  }}
                >
                  View Scope
                </button>

                <button
                  type="button"
                  onClick={() => onRequestService(svc.id)}
                  style={{
                    flex: 1.2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#059669',
                    color: '#FFFFFF',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#047857';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#059669';
                  }}
                >
                  <span>Request</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
