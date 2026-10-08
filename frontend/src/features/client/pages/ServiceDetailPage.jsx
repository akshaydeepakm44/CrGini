import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileText,
  Zap,
  HelpCircle
} from 'lucide-react';
import { getServiceBySlug } from '../data/servicesData';
import Button from '../../../components/common/Button';

export default function ServiceDetailPage({
  slug,
  onBackToChannel,
  onRequestService,
}) {
  const service = getServiceBySlug(slug);

  if (!service) {
    return (
      <div style={{ padding: '60px 36px', textAlign: 'center' }}>
        <h2>Service Not Found</h2>
        <p>The requested service could not be located in the catalog.</p>
        <Button variant="outline" onClick={onBackToChannel}>
          Return to Channel
        </Button>
      </div>
    );
  }

  const isBoosting = service.channel === 'boosting';
  const IconComp = service.icon;

  return (
    <div style={{ padding: '32px 36px 60px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Back button */}
      <button
        type="button"
        onClick={onBackToChannel}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          color: 'var(--cg-text-secondary, #6B7280)',
          fontSize: '0.84375rem',
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: '20px',
          padding: 0,
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to {service.channelLabel}</span>
      </button>

      {/* Hero Service Banner */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--cg-radius-xl, 24px)',
          border: '1px solid var(--cg-border-light, #E5E7EB)',
          padding: '36px',
          boxShadow: 'var(--cg-shadow-card, 0 4px 24px rgba(0, 0, 0, 0.05))',
          marginBottom: '32px',
          position: 'relative',
          overflow: 'hidden',
          background: isBoosting
            ? 'linear-gradient(135deg, #FAF5FF 0%, #FFFFFF 60%, #FFF1F2 100%)'
            : 'linear-gradient(135deg, #F0F9FF 0%, #FFFFFF 60%, #FAF5FF 100%)',
        }}
      >
        <div style={{ maxWidth: '780px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: isBoosting ? '#BE185D' : '#0369A1',
                backgroundColor: isBoosting ? '#FCE7F3' : '#E0F2FE',
                padding: '3px 10px',
                borderRadius: '9999px',
              }}
            >
              {service.channelLabel} Channel
            </span>

            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#4B5563',
                backgroundColor: '#F3F4F6',
                padding: '3px 10px',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Clock size={12} color="#7C3AED" />
              <span>{service.turnaround}</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                backgroundColor: service.iconBg,
                color: service.iconColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
              }}
            >
              <IconComp size={26} />
            </div>

            <h1
              style={{
                fontFamily: 'var(--cg-font-heading, "Plus Jakarta Sans", sans-serif)',
                fontSize: '2rem',
                fontWeight: 800,
                color: '#111827',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              {service.name}
            </h1>
          </div>

          <p style={{ fontSize: '1.0625rem', color: '#374151', lineHeight: 1.6, margin: '0 0 24px 0' }}>
            {service.headline}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => onRequestService && onRequestService(service.id)}
              style={{
                padding: '12px 28px',
                borderRadius: '12px',
                border: 'none',
                background: isBoosting
                  ? 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)'
                  : 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                color: '#FFFFFF',
                fontSize: '0.9375rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(124, 58, 237, 0.25)',
                transition: 'all 0.15s ease',
              }}
            >
              <span>Request {service.shortTitle}</span>
              <ArrowRight size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: '#6B7280' }}>
              <ShieldCheck size={16} color="#10B981" />
              <span>100% Specialist Verified Deliverable</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Details & Specifications */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '28px' }}>
        {/* Left Column: Scope & Deliverables */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Overview Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E5E7EB',
              padding: '28px',
              boxShadow: 'var(--cg-shadow-card, 0 4px 20px rgba(0, 0, 0, 0.04))',
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--cg-font-heading, "Plus Jakarta Sans", sans-serif)',
                fontSize: '1.1875rem',
                fontWeight: 800,
                color: '#111827',
                margin: '0 0 12px 0',
              }}
            >
              Sprint Overview
            </h3>

            <p style={{ fontSize: '0.90625rem', color: '#4B5563', lineHeight: 1.6, margin: '0 0 20px 0' }}>
              {service.description}
            </p>

            <div
              style={{
                padding: '14px 18px',
                borderRadius: '12px',
                backgroundColor: '#FAF5FF',
                border: '1px solid #EDE9FE',
              }}
            >
              <div style={{ fontSize: '0.78125rem', fontWeight: 700, color: '#6D28D9', textTransform: 'uppercase', marginBottom: '4px' }}>
                Ideal For
              </div>
              <p style={{ fontSize: '0.84375rem', color: '#374151', margin: 0, lineHeight: 1.5 }}>
                {service.idealFor}
              </p>
            </div>
          </div>

          {/* What You Get Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E5E7EB',
              padding: '28px',
              boxShadow: 'var(--cg-shadow-card, 0 4px 20px rgba(0, 0, 0, 0.04))',
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--cg-font-heading, "Plus Jakarta Sans", sans-serif)',
                fontSize: '1.1875rem',
                fontWeight: 800,
                color: '#111827',
                margin: '0 0 16px 0',
              }}
            >
              What You Receive
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {service.whatYouGet.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <CheckCircle2 size={18} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.90625rem', color: '#374151', lineHeight: 1.4, fontWeight: 500 }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Deliverables Spec & Execution Protocol */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Deliverables Spec */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E5E7EB',
              padding: '28px',
              boxShadow: 'var(--cg-shadow-card, 0 4px 20px rgba(0, 0, 0, 0.04))',
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--cg-font-heading, "Plus Jakarta Sans", sans-serif)',
                fontSize: '1.1875rem',
                fontWeight: 800,
                color: '#111827',
                margin: '0 0 16px 0',
              }}
            >
              Deliverables Format
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {service.deliverablesSpec.map((item, idx) => {
                const ItemIcon = item.icon || FileText;
                return (
                  <div
                    key={idx}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '12px',
                      backgroundColor: '#FAFAFC',
                      border: '1px solid #F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          backgroundColor: '#FAF5FF',
                          color: '#7C3AED',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ItemIcon size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                          Format: {item.format}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Turnkey Specialist Assurance */}
          <div
            style={{
              padding: '28px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #FAF5FF 0%, #FFFFFF 100%)',
              border: '1px solid #DDD4FA',
              boxShadow: 'var(--cg-shadow-card, 0 4px 20px rgba(0, 0, 0, 0.04))',
            }}
          >
            <h4
              style={{
                fontFamily: 'var(--cg-font-heading, "Plus Jakarta Sans", sans-serif)',
                fontSize: '1rem',
                fontWeight: 700,
                color: '#111827',
                margin: '0 0 8px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Zap size={16} color="#7C3AED" />
              <span>Turnkey Execution SLA</span>
            </h4>

            <p style={{ fontSize: '0.84375rem', color: '#4B5563', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              Your ticket is assigned directly to a dedicated human specialist within 2 hours of request submission. All outputs include unlimited client review until approved.
            </p>

            <button
              type="button"
              onClick={() => onRequestService && onRequestService(service.id)}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '10px',
                border: 'none',
                background: isBoosting
                  ? 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)'
                  : 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                color: '#FFFFFF',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '10px',
              }}
            >
              <span>Launch This Sprint</span>
              <ArrowRight size={14} />
            </button>

            <button
              type="button"
              onClick={() => onRequestService && onRequestService('custom-' + service.channel)}
              style={{
                width: '100%',
                padding: '9px',
                borderRadius: '10px',
                border: '1px dashed #D1D5DB',
                backgroundColor: 'transparent',
                color: '#4B5563',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#7C3AED';
                e.currentTarget.style.color = '#7C3AED';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#D1D5DB';
                e.currentTarget.style.color = '#4B5563';
              }}
            >
              <Sparkles size={14} />
              <span>Customize Multiple Services</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
