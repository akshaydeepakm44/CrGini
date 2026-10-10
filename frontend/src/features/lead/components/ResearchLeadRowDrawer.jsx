import React from 'react';
import {
  X,
  Building2,
  Globe,
  Mail,
  Linkedin,
  MapPin,
  CheckCircle2,
  FileText,
  Users,
  ExternalLink,
  Download
} from 'lucide-react';
import { api } from '../../../services/api';

export default function ResearchLeadRowDrawer({
  isOpen,
  onClose,
  lead,
  keyPeople = [],
  studyPdfUrl = null,
}) {
  if (!isOpen || !lead) return null;

  const logoSource = (lead.logoUrl || lead.logo)?.startsWith('http') || (lead.logoUrl || lead.logo)?.startsWith('data:')
    ? (lead.logoUrl || lead.logo)
    : api.getLeadLogoUrl(lead.id);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(5px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '88vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.22)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: 'var(--cg-font-family, "Inter", sans-serif)',
          border: '1px solid #E5E7EB',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FAFAFC',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '10px',
                backgroundColor: '#EDE9FE',
                color: '#7C3AED',
                border: '1px solid #DDD4FA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.1rem',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {(lead.logoUrl || lead.logo) ? (
                <img
                  src={logoSource}
                  alt={lead.company}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                  }}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : null}
              <span style={{ display: (lead.logoUrl || lead.logo) ? 'none' : 'flex' }}>
                {(lead.company || lead.name || 'C').charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#111827' }}>
                {lead.company || lead.name}
              </h3>
              <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '2px' }}>
                {lead.industry || 'Researched Account Dossier'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, overflowY: 'auto' }}>
          {/* Status & Verification Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: lead.status === 'VERIFIED' ? '#ECFDF5' : '#F5F3FF',
                color: lead.status === 'VERIFIED' ? '#059669' : '#7C3AED',
                border: lead.status === 'VERIFIED' ? '1px solid #A7F3D0' : '1px solid #DDD4FA',
              }}
            >
              {lead.status === 'VERIFIED' && <CheckCircle2 size={13} />}
              <span>{lead.status || 'RESEARCHED'}</span>
            </span>

            {lead.location && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  color: '#4B5563',
                  backgroundColor: '#F3F4F6',
                }}
              >
                <MapPin size={13} />
                <span>{lead.location}</span>
              </span>
            )}
          </div>

          {/* Contact & Domain Info */}
          <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
              ACCOUNT & DOMAIN SIGNALS
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(lead.domain || lead.website) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84375rem' }}>
                  <Globe size={15} color="#7C3AED" />
                  <a
                    href={lead.domain?.startsWith('http') ? lead.domain : `https://${lead.domain || lead.website}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#7C3AED', textDecoration: 'none', fontWeight: 600 }}
                  >
                    {lead.domain || lead.website}
                  </a>
                  <ExternalLink size={12} color="#7C3AED" />
                </div>
              )}

              {lead.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84375rem', color: '#111827' }}>
                  <Mail size={15} color="#6B7280" />
                  <span style={{ fontFamily: 'monospace' }}>{lead.email}</span>
                </div>
              )}

              {lead.linkedin && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84375rem' }}>
                  <Linkedin size={15} color="#0A66C2" />
                  <a href={lead.linkedin} target="_blank" rel="noreferrer" style={{ color: '#0A66C2', textDecoration: 'none' }}>
                    LinkedIn Company Profile
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Primary Contact Person if present */}
          {lead.name && (
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                PRIMARY RESEARCHED CONTACT
              </div>
              <div style={{ border: '1px solid #E5E7EB', borderRadius: '10px', padding: '12px 14px', backgroundColor: '#FFFFFF' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827' }}>
                  {lead.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '2px' }}>
                  {lead.title || 'Decision Maker'}
                </div>
              </div>
            </div>
          )}

          {/* Research Notes & Telemetry */}
          {lead.notes && (
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                RESEARCH INTELLIGENCE & TELEMETRY
              </div>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  fontSize: '0.84375rem',
                  color: '#374151',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {lead.notes}
              </div>
            </div>
          )}

          {/* Key People Found */}
          {keyPeople.length > 0 && (
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                KEY PEOPLE IDENTIFIED ({keyPeople.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {keyPeople.map((kp, idx) => (
                  <div
                    key={kp.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      backgroundColor: '#FAFAFC',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#111827' }}>{kp.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>{kp.role}</div>
                    </div>
                    {kp.email && (
                      <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#4B5563' }}>{kp.email}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lead Study Document / PDF Link if present */}
          {studyPdfUrl && (
            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
              <a
                href={studyPdfUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '10px',
                  backgroundColor: '#F5F3FF',
                  color: '#7C3AED',
                  border: '1px solid #DDD4FA',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                }}
              >
                <FileText size={18} />
                <span>View Complete Lead Study Document (PDF)</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
