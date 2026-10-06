import React, { useState, useEffect } from 'react';
import { FileText, Download, X, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '../../../services/api';

/**
 * Document Analysis Card / Modal
 * Displays the analyzed, structured sections of Company Study or Pitch Deck.
 */
export default function DocumentAnalysisModal({
  isOpen = true,
  documentData = null,
  onClose
}) {
  const [analysis, setAnalysis] = useState(null);
  const [rawContent, setRawContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!isOpen || !documentData) return;

    const resolvedAssetId = documentData.assetId || documentData.id || (() => {
      const match = (documentData.streamUrl || documentData.downloadUrl || '').match(/\/api\/assets\/([a-f0-9-]+)\/(stream|download|content)/i);
      return match ? match[1] : null;
    })();

    if (!resolvedAssetId) {
      setIsLoading(false);
      setLoadError(true);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setLoadError(false);

    api.getAssetContent(resolvedAssetId)
      .then((res) => {
        if (!isMounted) return;
        if (res && res.success && res.hasContent) {
          setRawContent(res.content || '');
          if (res.analysis && Array.isArray(res.analysis.sections) && res.analysis.sections.length > 0) {
            setAnalysis(res.analysis);
          } else {
            // Fallback section from raw content
            setAnalysis({
              documentType: documentData.documentType || 'Document',
              documentTitle: documentData.title || `${documentData.companyName} — Document`,
              companyName: documentData.companyName,
              sections: [
                {
                  title: 'Overview',
                  content: res.content
                }
              ]
            });
          }
        } else {
          setAnalysis(null);
          setRawContent('');
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('[DocumentAnalysisModal] Failed to load document content:', err?.message);
        setLoadError(true);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, documentData]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen || !documentData) return null;

  const companyName = documentData.companyName || analysis?.companyName || 'Company';
  const logoUrl = documentData.logoUrl || null;
  const docTypeLabel = documentData.documentType || analysis?.documentTypeLabel || 'Document';
  const docTitle = documentData.title || analysis?.documentTitle || `${companyName} — ${docTypeLabel}`;
  const downloadUrl = documentData.downloadUrl || documentData.streamUrl || '';
  const safeFileName = documentData.fileName || `${companyName.replace(/\s+/g, '_')}_${docTypeLabel.replace(/\s+/g, '_')}.pdf`;
  const fileExt = (safeFileName.split('.').pop() || 'PDF').toUpperCase();

  const handleDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = safeFileName;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const hasSections = Boolean(analysis && Array.isArray(analysis.sections) && analysis.sections.length > 0);

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
        zIndex: 10000,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        className="portal-modal-card"
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '88vh',
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
        {/* MODAL HEADER */}
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
            {/* Company Logo or Letter Badge */}
            <div
              style={{
                width: '44px',
                height: '44px',
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
                <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#00D9FF' }}>
                  {companyName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Document Details & Badges */}
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '2px' }}>
                <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: '600' }}>
                  {companyName}
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    color: '#00D9FF',
                    backgroundColor: 'rgba(0, 217, 255, 0.12)',
                    border: '1px solid rgba(0, 217, 255, 0.3)',
                    borderRadius: '6px',
                    padding: '1px 7px',
                    textTransform: 'uppercase'
                  }}
                >
                  {docTypeLabel}
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    color: '#CBD5E1',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    padding: '1px 6px'
                  }}
                >
                  {fileExt}
                </span>
              </div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  color: '#FFFFFF',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
                title={docTitle}
              >
                {docTitle}
              </h3>
            </div>
          </div>

          {/* Right Action Controls: Download Original + Close X */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            {downloadUrl && (
              <button
                type="button"
                className="portal-btn-secondary"
                onClick={handleDownload}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  borderRadius: '8px'
                }}
                title="Download original document file"
              >
                <Download size={14} />
                <span className="hide-on-mobile">Download Original</span>
              </button>
            )}

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
                transition: 'all 0.15s ease'
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
        </div>

        {/* MODAL BODY */}
        <div
          style={{
            padding: '1.75rem',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
        >
          {/* LOADING STATE */}
          {isLoading && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4rem 1rem',
                color: '#94A3B8',
                gap: '12px'
              }}
            >
              <Loader2 size={36} color="#00D9FF" className="portal-spinner" />
              <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#F1F5F9' }}>
                Analyzing document content...
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                Extracting structured business intelligence and insights
              </div>
            </div>
          )}

          {/* FALLBACK / ERROR / PREVIEW UNAVAILABLE STATE */}
          {!isLoading && (!hasSections || loadError) && (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem 1.5rem',
                margin: 'auto 0',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '12px',
                border: '1px dashed rgba(255, 255, 255, 0.1)'
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}
              >
                <AlertCircle size={26} color="#F59E0B" />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#F1F5F9', margin: '0 0 0.4rem 0' }}>
                Analysis unavailable
              </h4>
              <p style={{ color: '#94A3B8', fontSize: '0.86rem', maxWidth: '420px', margin: '0 auto 1.5rem auto', lineHeight: '1.5' }}>
                This document cannot be previewed inside CreativeGini. You can download the original document to view it.
              </p>
              {downloadUrl && (
                <button
                  type="button"
                  className="portal-btn-primary"
                  onClick={handleDownload}
                  style={{
                    padding: '9px 20px',
                    fontSize: '0.88rem',
                    fontWeight: '600',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 15px rgba(0, 217, 255, 0.3)'
                  }}
                >
                  <Download size={16} /> Download Original Document
                </button>
              )}
            </div>
          )}

          {/* STRUCTURED SECTIONS DISPLAY */}
          {!isLoading && hasSections && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {analysis.sections.map((section, sIdx) => (
                <div
                  key={sIdx}
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.07)',
                    borderRadius: '12px',
                    padding: '1.25rem 1.4rem',
                    transition: 'border-color 0.2s',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                >
                  {/* Section Title */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '0.75rem',
                      paddingBottom: '0.5rem',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
                    }}
                  >
                    <div
                      style={{
                        width: '3px',
                        height: '16px',
                        backgroundColor: '#00D9FF',
                        borderRadius: '2px'
                      }}
                    />
                    <h4
                      style={{
                        margin: 0,
                        fontSize: '0.98rem',
                        fontWeight: '700',
                        color: '#F8FAFC',
                        letterSpacing: '0.2px'
                      }}
                    >
                      {section.title}
                    </h4>
                  </div>

                  {/* Section Narrative Content */}
                  {section.content && (
                    <p
                      style={{
                        margin: section.items && section.items.length > 0 ? '0 0 0.85rem 0' : 0,
                        fontSize: '0.88rem',
                        lineHeight: '1.65',
                        color: '#CBD5E1'
                      }}
                    >
                      {section.content}
                    </p>
                  )}

                  {/* Section Bullet Items */}
                  {section.items && section.items.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {section.items.map((item, iIdx) => (
                        <div
                          key={iIdx}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            fontSize: '0.86rem',
                            color: '#E2E8F0',
                            lineHeight: '1.5'
                          }}
                        >
                          <span
                            style={{
                              color: '#00D9FF',
                              fontSize: '1.1rem',
                              lineHeight: '1',
                              marginTop: '2px',
                              flexShrink: 0
                            }}
                          >
                            •
                          </span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
