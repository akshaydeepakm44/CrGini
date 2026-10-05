import React, { useState, useEffect } from 'react';
import { FileText, Download, X, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

/**
 * Polished CreativeGini Document Detail Modal
 * - Displays readable extracted document content inside the CreativeGini UI
 * - Compact, professional document reader proportions (desktop ~75vw/75vh, mobile responsive)
 * - Clean header with document icon, title, company name, type badge, Download Original button, and close X
 * - Compact centered state when preview is unavailable (no huge empty viewer)
 * - Removed cramped long filename footer
 * - Beautiful typography with Markdown heading & bullet list formatting
 */
export default function PdfViewerModal({
  isOpen = true,
  title = 'Document Details',
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
        if (res && res.success && res.content && res.content.trim()) {
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
  const fileExt = (safeFileName.split('.').pop() || '').toUpperCase();
  const hasContent = Boolean(extractedContent && extractedContent.trim());

  // Render formatted markdown-like extracted text
  const renderFormattedContent = (rawText) => {
    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} style={{ height: '0.75rem' }} />;
      }

      if (trimmed.startsWith('### ')) {
        return (
          <h4
            key={idx}
            style={{
              fontSize: '1rem',
              fontWeight: '700',
              color: '#00D9FF',
              margin: '1.1rem 0 0.4rem 0',
              letterSpacing: '0.2px'
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
              fontSize: '1.15rem',
              fontWeight: '700',
              color: '#F8FAFC',
              margin: '1.35rem 0 0.5rem 0',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              paddingBottom: '0.3rem'
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
              fontSize: '1.25rem',
              fontWeight: '800',
              color: '#FFFFFF',
              margin: '1.5rem 0 0.6rem 0',
              borderBottom: '1px solid rgba(0, 217, 255, 0.25)',
              paddingBottom: '0.35rem'
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
              margin: '0.25rem 0',
              paddingLeft: '0.5rem',
              lineHeight: '1.6',
              color: '#E2E8F0',
              fontSize: '0.9rem'
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
            margin: '0.35rem 0',
            lineHeight: '1.65',
            color: '#CBD5E1',
            fontSize: '0.9rem'
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
        background: 'rgba(6, 11, 20, 0.85)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
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
          maxWidth: hasContent ? '860px' : '560px',
          height: hasContent ? '78vh' : 'auto',
          maxHeight: '82vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#0c121e',
          border: '1px solid rgba(0, 217, 255, 0.2)',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.75), 0 0 1px rgba(0, 217, 255, 0.3)',
          overflow: 'hidden',
          transition: 'max-width 0.2s ease'
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 18px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(15, 23, 42, 0.9)',
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          {/* Left: Document Icon + Title + Company Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'rgba(0, 217, 255, 0.1)',
                border: '1px solid rgba(0, 217, 255, 0.22)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00D9FF',
                flexShrink: 0
              }}
            >
              <FileText size={17} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1rem',
                    fontWeight: '700',
                    color: '#F8FAFC',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '380px'
                  }}
                  title={title}
                >
                  {title}
                </h3>
                {documentType && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '2px 7px',
                      borderRadius: '6px',
                      background: 'rgba(0, 217, 255, 0.1)',
                      border: '1px solid rgba(0, 217, 255, 0.25)',
                      color: '#00D9FF',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px'
                    }}
                  >
                    {documentType}
                  </span>
                )}
                {fileExt && fileExt !== documentType.toUpperCase() && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#94A3B8',
                      fontWeight: '500'
                    }}
                  >
                    {fileExt}
                  </span>
                )}
              </div>
              {companyName && (
                <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '2px', fontWeight: '500' }}>
                  {companyName}
                </div>
              )}
            </div>
          </div>

          {/* Right: Download Original button + Close X */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {effectiveDownloadUrl && (
              <a
                href={effectiveDownloadUrl}
                download={safeFileName}
                target="_blank"
                rel="noopener noreferrer"
                className="portal-btn-primary"
                style={{
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontWeight: '600'
                }}
                title="Download original document file"
              >
                <Download size={13} />
                <span>Download Original</span>
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
              title="Close (Esc)"
              aria-label="Close document modal"
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#F5F5F5';
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.18)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#94A3B8';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: hasContent ? '20px 24px' : '24px 20px',
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
                padding: '2.5rem 1rem',
                color: '#94A3B8',
                gap: '12px'
              }}
            >
              <Loader2 size={28} color="#00D9FF" className="animate-spin" />
              <div style={{ fontSize: '0.86rem', color: '#CBD5E1', fontWeight: '500' }}>
                Reading processed document content...
              </div>
            </div>
          ) : (!hasContent || loadError) ? (
            /* Compact Centered Unavailable State */
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem 1rem',
                textAlign: 'center',
                color: '#94A3B8',
                gap: '10px'
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'rgba(100, 116, 139, 0.12)',
                  border: '1px solid rgba(100, 116, 139, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94A3B8'
                }}
              >
                <FileText size={20} />
              </div>
              <h4 style={{ margin: 0, color: '#F1F5F9', fontSize: '1rem', fontWeight: '700' }}>
                Preview unavailable
              </h4>
              <p style={{ margin: 0, fontSize: '0.84rem', lineHeight: '1.5', maxWidth: '400px', color: '#94A3B8' }}>
                This document cannot be previewed inside CreativeGini. You can download the original document to view it.
              </p>
              {effectiveDownloadUrl && (
                <a
                  href={effectiveDownloadUrl}
                  download={safeFileName}
                  className="portal-btn-primary"
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.84rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    textDecoration: 'none',
                    marginTop: '6px',
                    borderRadius: '6px',
                    fontWeight: '600'
                  }}
                >
                  <Download size={14} />
                  <span>Download Original Document</span>
                </a>
              )}
            </div>
          ) : (
            <div
              style={{
                maxWidth: '780px',
                margin: '0 auto',
                lineHeight: '1.65',
                fontSize: '0.9rem'
              }}
            >
              {renderFormattedContent(extractedContent)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
