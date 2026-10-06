import React, { useEffect } from 'react';
import { ExternalLink, X, Mail, FileText, Presentation, Clock, Users } from 'lucide-react';

/**
 * Company Details Card / Modal
 * Displays company header, Key People (free & unlocked), and 2 primary document actions:
 * [ Company Study ] and [ Pitch Deck ].
 */
export default function CompanyDetailsModal({
  isOpen = true,
  lead = null,
  onClose,
  onOpenDocument
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen || !lead) return null;

  const companyName = lead.companyName || lead.lead_company || lead.company || lead.name || 'Company Details';
  let rawWeb = (lead.website || lead.linkedin || (lead.notes?.match(/https?:\/\/[^\s\]]+/)?.[0]) || '').trim();
  const websiteUrl = rawWeb ? (/^https?:\/\//i.test(rawWeb) ? rawWeb : `https://${rawWeb}`) : '';
  const displayUrl = rawWeb.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');
  const logoUrl = lead.logoUrl || (lead.notes?.match(/\[Logo:\s*([^\]]+)\]/)?.[1]) || null;

  // Key People extraction
  let peopleList = [];
  if (Array.isArray(lead.keyPeople?.people) && lead.keyPeople.people.length > 0) {
    peopleList = lead.keyPeople.people;
  } else if (Array.isArray(lead.keyPeople) && lead.keyPeople.length > 0) {
    peopleList = lead.keyPeople.map(p => (typeof p === 'string' ? { name: '', email: p } : { name: p?.name || '', email: p?.email || '' }));
  } else if (Array.isArray(lead.keyPeople?.emails) && lead.keyPeople.emails.length > 0) {
    peopleList = lead.keyPeople.emails.map(e => ({ name: '', email: e }));
  } else if (lead.notes) {
    const kpJsonMatch = lead.notes.match(/\[Key People JSON:\s*(\[.*?\])\]/);
    if (kpJsonMatch && kpJsonMatch[1]) {
      try {
        const parsed = JSON.parse(kpJsonMatch[1]);
        if (Array.isArray(parsed)) {
          peopleList = parsed.map(p => ({ name: p.name || '', email: p.email || '' }));
        }
      } catch (_) {}
    }
  }
  if (peopleList.length === 0 && lead.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email.trim())) {
    peopleList = [{ name: lead.name || '', email: lead.email.trim().toLowerCase() }];
  }

  // Documents
  const studyDoc = lead.leadStudy || (lead.pdf?.streamUrl ? lead.pdf : null);
  const pitchDoc = lead.pitchDeck;

  const hasStudyDoc = Boolean(studyDoc && (studyDoc.streamUrl || studyDoc.id || studyDoc.assetId));
  const hasPitchDoc = Boolean(pitchDoc && (pitchDoc.streamUrl || pitchDoc.id || pitchDoc.assetId));

  return (
    <div
      className="portal-modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 10, 20, 0.82)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        className="portal-modal-card"
        style={{
          width: '100%',
          maxWidth: '620px',
          maxHeight: '90vh',
          backgroundColor: '#0A1120',
          border: '1px solid rgba(0, 217, 255, 0.25)',
          borderRadius: '16px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.65), 0 0 25px rgba(0, 217, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeInModal 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER: Company Logo, Company Name, Company URL, Close button */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            backgroundColor: 'rgba(15, 23, 42, 0.75)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
            {/* Logo */}
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                overflow: 'hidden'
              }}
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={companyName}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#00D9FF' }}>
                  {companyName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Name & URL */}
            <div style={{ minWidth: 0 }}>
              <h3
                style={{
                  margin: '0 0 4px 0',
                  fontSize: '1.2rem',
                  fontWeight: '800',
                  color: '#FFFFFF',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
                title={companyName}
              >
                {companyName}
              </h3>
              {websiteUrl ? (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#00D9FF',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontWeight: '500'
                  }}
                  title={websiteUrl}
                >
                  <span>{displayUrl || websiteUrl}</span>
                  <ExternalLink size={13} style={{ flexShrink: 0 }} />
                </a>
              ) : (
                <span style={{ color: '#64748B', fontSize: '0.82rem' }}>Website in preparation</span>
              )}
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94A3B8',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#94A3B8';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
            title="Close (Esc)"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY: KEY PEOPLE */}
        <div
          style={{
            padding: '1.5rem',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              fontWeight: '700',
              color: '#94A3B8',
              textTransform: 'uppercase',
              letterSpacing: '0.6px'
            }}
          >
            <Users size={14} color="#00D9FF" /> Key People
          </div>

          {peopleList.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {peopleList.map((person, pIdx) => (
                <div
                  key={pIdx}
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.07)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}
                >
                  <div style={{ fontWeight: '600', color: '#F8FAFC', fontSize: '0.92rem' }}>
                    {person.name || 'Decision Maker'}
                  </div>

                  {person.email ? (
                    <a
                      href={`mailto:${person.email}`}
                      style={{
                        fontSize: '0.85rem',
                        color: '#34D399',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: '500',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(52, 211, 153, 0.1)',
                        border: '1px solid rgba(52, 211, 153, 0.25)',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(52, 211, 153, 0.18)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(52, 211, 153, 0.1)';
                      }}
                      title={`Send email to ${person.email}`}
                    >
                      <Mail size={13} style={{ flexShrink: 0 }} />
                      <span>{person.email}</span>
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Email not available</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: '1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '8px',
                border: '1px dashed rgba(255, 255, 255, 0.08)',
                color: '#64748B',
                fontSize: '0.84rem',
                textAlign: 'center'
              }}
            >
              Key People contacts are being verified by the lead research team.
            </div>
          )}
        </div>

        {/* BOTTOM: Exactly two primary document actions [ Company Study ] [ Pitch Deck ] */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}
        >
          {/* Company Study Button */}
          {hasStudyDoc ? (
            <button
              type="button"
              className="portal-btn-primary"
              onClick={() => onOpenDocument({
                type: 'Company Study',
                title: `${companyName} — Company Study`,
                documentType: 'Company Study',
                companyName,
                logoUrl,
                assetId: studyDoc.assetId || studyDoc.id,
                streamUrl: studyDoc.streamUrl,
                downloadUrl: studyDoc.downloadUrl || studyDoc.streamUrl,
                fileName: studyDoc.name || `${companyName.replace(/\s+/g, '_')}_Company_Study.pdf`
              })}
              style={{
                padding: '10px 14px',
                fontSize: '0.88rem',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                borderRadius: '10px',
                boxShadow: '0 4px 15px rgba(0, 217, 255, 0.25)'
              }}
              title="View Company Study Analysis"
            >
              <FileText size={16} />
              <span>Company Study</span>
            </button>
          ) : (
            <button
              type="button"
              disabled
              style={{
                padding: '10px 14px',
                fontSize: '0.84rem',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px dashed rgba(255, 255, 255, 0.1)',
                color: '#64748B',
                cursor: 'not-allowed'
              }}
              title="Company Study not yet uploaded"
            >
              <Clock size={14} />
              <span>Study Unavailable</span>
            </button>
          )}

          {/* Pitch Deck Button */}
          {hasPitchDoc ? (
            <button
              type="button"
              className="portal-btn-primary"
              onClick={() => onOpenDocument({
                type: 'Pitch Deck',
                title: `${companyName} — Pitch Deck`,
                documentType: 'Pitch Deck',
                companyName,
                logoUrl,
                assetId: pitchDoc.assetId || pitchDoc.id,
                streamUrl: pitchDoc.streamUrl,
                downloadUrl: pitchDoc.downloadUrl || pitchDoc.streamUrl,
                fileName: pitchDoc.name || `${companyName.replace(/\s+/g, '_')}_Pitch_Deck.pdf`
              })}
              style={{
                padding: '10px 14px',
                fontSize: '0.88rem',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                borderRadius: '10px',
                boxShadow: '0 4px 15px rgba(0, 217, 255, 0.25)'
              }}
              title="View Pitch Deck Analysis"
            >
              <Presentation size={16} />
              <span>Pitch Deck</span>
            </button>
          ) : (
            <button
              type="button"
              disabled
              style={{
                padding: '10px 14px',
                fontSize: '0.84rem',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px dashed rgba(255, 255, 255, 0.1)',
                color: '#64748B',
                cursor: 'not-allowed'
              }}
              title="Pitch Deck not yet uploaded"
            >
              <Clock size={14} />
              <span>Deck Unavailable</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
