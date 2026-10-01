import React, { useState, useEffect } from 'react';
import { FileText, Download, X, AlertCircle, Loader2 } from 'lucide-react';

/**
 * Reusable Internal PDF Viewer Modal for CreativeGini
 * - Opens PDFs inside the application without redirecting externally
 * - Responsive on desktop, laptop, tablet, and mobile
 * - Includes document title, visible PDF content, loading state, error state,
 *   download action returning original valid PDF, and close actions.
 */
export default function PdfViewerModal({
  isOpen = true,
  title = 'Document Viewer',
  documentType = 'PDF Document',
  companyName = '',
  streamUrl = '',
  pdfUrl = '',
  downloadUrl = '',
  fileName = 'document.pdf',
  onClose
}) {
  const actualStreamUrl = streamUrl || pdfUrl || '';
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setLoadError(false);
  }, [actualStreamUrl]);

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
  const safeFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;

  const handleDownload = (e) => {
    if (!effectiveDownloadUrl) {
      e.preventDefault();
      alert('Document download link is currently unavailable.');
    }
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
          maxWidth: '1020px',
          height: '90vh',
          maxHeight: '900px',
          display: 'flex',
          flexDirection: 'column',
          background: '#0d1117',
          border: '1px solid rgba(0, 217, 255, 0.25)',
          borderRadius: '14px',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 217, 255, 0.1)',
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
                onClick={handleDownload}
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
                title="Download original PDF file"
              >
                <Download size={14} />
                <span>Download PDF</span>
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

        {/* Viewer Content Frame */}
        <div
          style={{
            flex: 1,
            height: '100%',
            position: 'relative',
            background: '#090d16',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          {/* Loading State Spinner */}
          {isLoading && !loadError && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0d1117',
                zIndex: 2,
                color: '#94a3b8',
                gap: '12px'
              }}
            >
              <Loader2 size={32} color="#00D9FF" className="animate-spin" />
              <div style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '500' }}>
                Loading internal PDF dossier...
              </div>
            </div>
          )}

          {/* Error State Fallback */}
          {loadError ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                textAlign: 'center',
                maxWidth: '460px',
                color: '#94a3b8',
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
              <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '1.05rem', fontWeight: '700' }}>
                Unable to preview PDF document
              </h4>
              <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: '1.5' }}>
                Your browser could not render the internal PDF stream directly. You can download the original PDF file to view it on your device.
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
                  <span>Download Original PDF</span>
                </a>
              )}
            </div>
          ) : actualStreamUrl ? (
            <iframe
              src={actualStreamUrl}
              title={title}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                background: '#161b22'
              }}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setLoadError(true);
              }}
            />
          ) : (
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              No document stream available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
