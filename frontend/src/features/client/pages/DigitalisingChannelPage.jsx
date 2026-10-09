import React from 'react';
import { Search, CheckCircle2, ArrowRight } from 'lucide-react';
import { getServicesByChannel } from '../data/servicesData';

export default function DigitalisingChannelPage({
  onSelectService,
  onRequestService,
}) {
  const digitalisingServices = getServicesByChannel('digitalising').filter((s) => s.id !== 'custom');

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

      {/* Services Grid (Balanced 4 cards: 4 across on wide, 2x2 grid on medium) */}
      <style>{`
        .cg-digitalising-services-grid {
          display: grid;
          gap: 24px;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          margin-bottom: 40px;
        }
        @media (min-width: 1360px) {
          .cg-digitalising-services-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }
        @media (max-width: 640px) {
          .cg-digitalising-services-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <div className="cg-digitalising-services-grid">
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
    </div>
  );
}
