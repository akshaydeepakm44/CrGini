import React, { useState, useEffect } from 'react';
import { FileText, Download, X, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

/**
 * Reusable In-App Document Viewer Modal for CreativeGini
 * - Displays readable extracted document content directly inside the CreativeGini UI
 * - NO iframe, NO browser PDF viewer plugin, NO external redirects
 * - Supports PDF and DOC/DOCX processed text with headings and list formatting
 * - Provides download action for the original uploaded file
 * - Fully responsive on desktop, laptop, tablet, and mobile
 */
export default function PdfViewerModal({
  isOpen = true,
  title = 'Document Viewer',
  documentType = 'Document',
  companyName = '',
  content: initialContent = '',
  assetId = null,
  streamUrl = '',
  pdfUrl = '',
  downloadUrl = '',
  fileName = 'document.pdf',
  onClose
}) {
  const actualStreamUrl = streamUrl || pdfUrl || '';
  const [extractedContent, setExtractedContent] = useState(initialContent || '');
  const [isLoading, setIsLoading] = useState(!initialContent && Boolean(assetId || actualStreamUrl));
  const [loadError, setLoadError] = useState(false);

  // Extract asset ID from stream/download URL if not directly passed
  const resolvedAssetId = assetId || (() => {
    const match = (actualStreamUrl || downloadUrl || '').match(/\/api\/assets\/([a-f0-9-]+)\/(stream|download|content)/i);
    return match ? match[1] : null;
  })();

  useEffect(() => {
    if (initialContent) {
      setExtractedContent(initialContent);
      setIsLoading(false);
      setLoadError(false);
      return;
    }

    if (!resolvedAssetId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setLoadError(false);

    api.getAssetContent(resolvedAssetId)
      .then(res => {
        if (!isMounted) return;
        if (res && res.success && res.content) {
          setExtractedContent(res.content);
        } else {
          setExtractedContent('');
        }
      })
      .catch(err => {
        if (!isMounted) return;
        console.warn('[PdfViewerModal] Could not extract document text:', err?.message);
        setLoadError(true);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [initialContent, resolvedAssetId, actualStreamUrl]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const effectiveDownloadUrl = downloadUrl || actualStreamUrl;
  const safeFileName = fileName || 'document.pdf';

  // Helper to render formatted text with headings and lists
  const renderFormattedContent = (rawText) => {
    if (!rawText || !rawText.trim()) {
      return (
        <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#94A3B8' }}>
          <FileText size={36} color="#64748B" style={{ margin: '0 auto 0.75rem', display: 'block' }} />
          <div style={{ fontWeight: '600', color: '#E2E8F0', marginBottom: '0.35rem' }}>
            Preview content is not available for this document.
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
            You can still download the original uploaded file below.
          </div>
        </div>
      );
    }

    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} style={{ height: '0.85rem' }} />;
      }

      if (trimmed.startsWith('### ')) {
        return (
          <h4
            key={idx}
            style={{
              fontSize: '1.05rem',
              fontWeight: '700',
              color: '#00D9FF',
              margin: '1.25rem 0 0.5rem 0',
              letterSpacing: '0.3px'
            }}
          >
            {trimmed.replace(/^###\s+/, '')}
          </h4>
        );
      }

      if (trimmed.startsWith('## ')) {
        return (
          <h3
            key={idx}
            style={{
              fontSize: '1.2rem',
              fontWeight: '800',
              color: '#F5F5F5',
              margin: '1.5rem 0 0.6rem 0',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              paddingBottom: '0.35rem'
            }}
          >
            {trimmed.replace(/^##\s+/, '')}
          </h3>
        );
      }

      if (trimmed.startsWith('# ')) {
        return (
          <h2
            key={idx}
            style={{
              fontSize: '1.35rem',
              fontWeight: '800',
              color: '#FFFFFF',
              margin: '1.75rem 0 0.75rem 0',
              borderBottom: '1px solid rgba(0, 217, 255, 0.25)',
              paddingBottom: '0.45rem'
            }}
          >
            {trimmed.replace(/^#\s+/, '')}
          </h2>
        );
      }

      if (/^[-*•]\s+/.test(trimmed)) {
        return (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              margin: '0.3rem 0',
              paddingLeft: '0.5rem',
              lineHeight: '1.6',
              color: '#E2E8F0',
              fontSize: '0.92rem'
            }}
          >
            <span style={{ color: '#00D9FF', fontWeight: 'bold' }}>•</span>
            <span>{trimmed.replace(/^[-*•]\s+/, '')}</span>
          </div>
        );
      }

      return (
        <p
          key={idx}
          style={{
            margin: '0.4rem 0',
            lineHeight: '1.65',
            color: '#CBD5E1',
            fontSize: '0.92rem'
          }}
        >
          {line}
        </p>
      );
    });
  };

  return (
    <div
      className="portal-modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(5, 10, 20, 0.88)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="portal-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '920px',
          height: '88vh',
          maxHeight: '850px',
          display: 'flex',
          flexDirection: 'column',
          background: '#0d1117',
          border: '1px solid rgba(0, 217, 255, 0.25)',
          borderRadius: '14px',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.85), 0 0 30px rgba(0, 217, 255, 0.1)',
          overflow: 'hidden'
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.8) 100%)',
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(0, 217, 255, 0.12)',
                border: '1px solid rgba(0, 217, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00D9FF',
                flexShrink: 0
              }}
            >
              <FileText size={18} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1.05rem',
                    fontWeight: '700',
                    color: '#F5F5F5',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '460px'
                  }}
                  title={title}
                >
                  {title}
                </h3>
                {documentType && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: 'rgba(0, 217, 255, 0.12)',
                      border: '1px solid rgba(0, 217, 255, 0.3)',
                      color: '#00D9FF',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.4px'
                    }}
                  >
                    {documentType}
                  </span>
                )}
              </div>
              {companyName && (
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                  {companyName}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            {effectiveDownloadUrl && (
              <a
                href={effectiveDownloadUrl}
                download={safeFileName}
                target="_blank"
                rel="noopener noreferrer"
                className="portal-btn-primary"
                style={{
                  padding: '7px 16px',
                  fontSize: '0.84rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontWeight: '600'
                }}
                title="Download original file"
              >
                <Download size={14} />
                <span>Download</span>
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '7px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
              title="Close viewer (Esc)"
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#F5F5F5';
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#94a3b8';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Document Content Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 28px',
            background: '#090d16',
            color: '#E2E8F0',
            fontFamily: 'inherit'
          }}
        >
          {isLoading ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                minHeight: '240px',
                color: '#94A3B8',
                gap: '12px'
              }}
            >
              <Loader2 size={32} color="#00D9FF" className="animate-spin" />
              <div style={{ fontSize: '0.9rem', color: '#CBD5E1', fontWeight: '500' }}>
                Reading processed document content...
              </div>
            </div>
          ) : loadError ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3rem 1.5rem',
                textAlign: 'center',
                maxWidth: '520px',
                margin: '0 auto',
                color: '#94A3B8',
                gap: '14px'
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ef4444'
                }}
              >
                <AlertCircle size={24} />
              </div>
              <h4 style={{ margin: 0, color: '#F8FAFC', fontSize: '1.05rem', fontWeight: '700' }}>
                Preview content is unavailable
              </h4>
              <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: '1.5' }}>
                We were unable to extract readable text preview for this document. You can download the original file to view it directly on your device.
              </p>
              {effectiveDownloadUrl && (
                <a
                  href={effectiveDownloadUrl}
                  download={safeFileName}
                  className="portal-btn-primary"
                  style={{
                    padding: '8px 18px',
                    fontSize: '0.86rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    textDecoration: 'none',
                    marginTop: '6px'
                  }}
                >
                  <Download size={15} />
                  <span>Download Original Document</span>
                </a>
              )}
            </div>
          ) : (
            <div
              style={{
                maxWidth: '820px',
                margin: '0 auto',
                lineHeight: '1.65',
                fontSize: '0.92rem'
              }}
            >
              {renderFormattedContent(extractedContent)}
            </div>
          )}
        </div>

        {/* Footer info & download bar */}
        <div
          style={{
            padding: '10px 20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            background: 'rgba(15, 23, 42, 0.7)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.78rem',
            color: '#64748B',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          <span>CreativeGini Document Reader</span>
          {effectiveDownloadUrl && (
            <a
              href={effectiveDownloadUrl}
              download={safeFileName}
              style={{
                color: '#00D9FF',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: '600'
              }}
            >
              <Download size={12} />
              <span>Download Original ({safeFileName})</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
