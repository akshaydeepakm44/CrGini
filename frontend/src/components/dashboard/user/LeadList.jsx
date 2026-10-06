import React, { useState } from 'react';
import { ExternalLink, Users } from 'lucide-react';
import CompanyDetailsModal from './CompanyDetailsModal';
import DocumentAnalysisModal from './DocumentAnalysisModal';

/**
 * LeadList Component
 * Renders verified target accounts as sleek, responsive horizontal lead bars.
 * Clicking anywhere on a lead bar opens the Company Details modal.
 */
export default function LeadList({ leads = [], getAuthenticatedUrl }) {
  const [selectedLead, setSelectedLead] = useState(null);
  const [activeDocument, setActiveDocument] = useState(null);

  const handleOpenLead = (lead) => {
    setSelectedLead(lead);
  };

  const handleCloseLeadModal = () => {
    setSelectedLead(null);
  };

  const handleOpenDocument = (docConfig) => {
    // Augment with authenticated URLs if helper is provided
    let finalDoc = { ...docConfig };
    if (getAuthenticatedUrl) {
      if (docConfig.streamUrl) {
        finalDoc.streamUrl = getAuthenticatedUrl({ streamUrl: docConfig.streamUrl }, 'stream');
      }
      if (docConfig.downloadUrl) {
        finalDoc.downloadUrl = getAuthenticatedUrl({ downloadUrl: docConfig.downloadUrl }, 'download');
      }
    }
    setActiveDocument(finalDoc);
  };

  const handleCloseDocumentModal = () => {
    setActiveDocument(null);
  };

  if (!leads || leads.length === 0) {
    return (
      <div
        className="portal-card"
        style={{
          textAlign: 'center',
          padding: '3.5rem 1.5rem',
          color: '#94A3B8',
          marginBottom: '1.75rem',
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px'
        }}
      >
        <Users size={38} color="#64748B" style={{ margin: '0 auto 0.85rem', display: 'block' }} />
        <div style={{ fontWeight: '600', color: '#E2E8F0', fontSize: '1.05rem', marginBottom: '0.4rem' }}>
          Sample leads are being researched.
        </div>
        <div style={{ fontSize: '0.86rem', color: '#64748B', maxWidth: '440px', margin: '0 auto' }}>
          Your verified target account bars will appear here once finalized by our lead team.
        </div>
      </div>
    );
  }

  return (
    <div className="portal-card" style={{ marginBottom: '1.75rem', width: '100%' }}>
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1rem'
        }}
      >
        <div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '0 0 0.25rem 0', color: '#F8FAFC' }}>
            Sample Leads ({leads.length})
          </h4>
          <p style={{ color: '#64748B', fontSize: '0.82rem', margin: 0 }}>
            Click any company bar to view Key People, Company Study analysis, and Pitch Deck.
          </p>
        </div>
      </div>

      {/* Horizontal Lead Bars List */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          width: '100%'
        }}
      >
        {leads.map((lead, idx) => {
          const companyName = lead.companyName || lead.lead_company || lead.company || lead.name || `Lead ${idx + 1}`;
          let rawWeb = (lead.website || lead.linkedin || (lead.notes?.match(/https?:\/\/[^\s\]]+/)?.[0]) || '').trim();
          const displayUrl = rawWeb.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');
          const logoUrl = lead.logoUrl || (lead.notes?.match(/\[Logo:\s*([^\]]+)\]/)?.[1]) || null;

          return (
            <div
              key={lead.id || idx}
              onClick={() => handleOpenLead(lead)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOpenLead(lead);
                }
              }}
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                cursor: 'pointer',
                transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(20, 32, 54, 0.85)';
                e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.4)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(0, 217, 255, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.75)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
              }}
            >
              {/* LEFT: Company Logo + Company Name */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  minWidth: 0,
                  flex: '1 1 auto'
                }}
              >
                {/* Logo or Initial Letter */}
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    overflow: 'hidden'
                  }}
                  title={companyName}
                >
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={companyName}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <span style={{ fontSize: '1rem', fontWeight: '800', color: '#00D9FF' }}>
                      {companyName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Company Name */}
                <div
                  style={{
                    fontWeight: '700',
                    fontSize: '1rem',
                    color: '#F8FAFC',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                  title={companyName}
                >
                  {companyName}
                </div>
              </div>

              {/* MIDDLE / RIGHT: Company URL */}
              <div
                style={{
                  fontSize: '0.86rem',
                  color: '#00D9FF',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexShrink: 0,
                  maxWidth: '40%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
                title={rawWeb || 'Website in preparation'}
              >
                {displayUrl ? (
                  <>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {displayUrl}
                    </span>
                    <ExternalLink size={13} style={{ flexShrink: 0, opacity: 0.8 }} />
                  </>
                ) : (
                  <span style={{ color: '#64748B', fontSize: '0.82rem', fontWeight: '400' }}>
                    Website pending
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: COMPANY DETAILS MODAL */}
      {selectedLead && (
        <CompanyDetailsModal
          isOpen={Boolean(selectedLead)}
          lead={selectedLead}
          onClose={handleCloseLeadModal}
          onOpenDocument={handleOpenDocument}
        />
      )}

      {/* MODAL 2: DOCUMENT ANALYSIS MODAL */}
      {activeDocument && (
        <DocumentAnalysisModal
          isOpen={Boolean(activeDocument)}
          documentData={activeDocument}
          onClose={handleCloseDocumentModal}
        />
      )}
    </div>
  );
}
