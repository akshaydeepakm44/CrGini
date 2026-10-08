import React from 'react';
import {
  X,
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Video,
  File,
  Eye,
  PenTool
} from 'lucide-react';
import { isImageFile, isPdfFile, isVideoFile } from '../utils/designStatusUtils';

export default function DesignFilePreview({ file, onClose }) {
  if (!file) return null;

  const fileName = file.name || file.title || 'Design Asset';
  const fileUrl = file.url || file.dataUrl || file.downloadUrl || '';
  const isImage = isImageFile(fileName) || isImageFile(file.type);
  const isPdf = isPdfFile(fileName) || isPdfFile(file.type);
  const isVideo = isVideoFile(fileName) || isVideoFile(file.type);
  const isFigma = Boolean(file.isFigma || fileUrl.includes('figma.com'));

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '960px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F8FAFC',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: isFigma ? '#F5F3FF' : '#F0F9FF',
                color: isFigma ? '#8B5CF6' : '#0284C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {isFigma ? (
                <PenTool size={16} />
              ) : isImage ? (
                <ImageIcon size={16} />
              ) : isPdf ? (
                <FileText size={16} />
              ) : isVideo ? (
                <Video size={16} />
              ) : (
                <File size={16} />
              )}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <h3
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  color: '#0F172A',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {fileName}
              </h3>
              {file.size && (
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  {typeof file.size === 'number' ? `${(file.size / 1024).toFixed(1)} KB` : file.size}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isFigma && fileUrl && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#8B5CF6',
                  color: '#FFFFFF',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                <span>OPEN FIGMA PROJECT</span>
                <ExternalLink size={14} />
              </a>
            )}

            {fileUrl && !isFigma && (
              <a
                href={fileUrl}
                download={fileName}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#F1F5F9',
                  color: '#334155',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  border: '1px solid #CBD5E1',
                }}
              >
                <Download size={14} />
                <span>Download</span>
              </a>
            )}

            <button
              type="button"
              onClick={onClose}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                color: '#64748B',
                padding: '6px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E2E8F0')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            backgroundColor: '#0F172A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
          }}
        >
          {isImage ? (
            <img
              src={fileUrl}
              alt={fileName}
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              }}
            />
          ) : isPdf ? (
            <iframe
              src={fileUrl}
              title={fileName}
              style={{
                width: '100%',
                height: '70vh',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
              }}
            />
          ) : isVideo ? (
            <video
              src={fileUrl}
              controls
              autoPlay
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                borderRadius: '8px',
              }}
            />
          ) : isFigma ? (
            <div style={{ textAlign: 'center', color: '#FFFFFF', padding: '40px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  backgroundColor: '#8B5CF6',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <PenTool size={32} />
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 8px 0' }}>
                Figma Design File
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#94A3B8', maxWidth: '440px', margin: '0 auto 24px' }}>
                This deliverable is hosted externally on Figma. Click below to inspect frames, vectors, and design tokens directly in Figma.
              </p>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#8B5CF6',
                  color: '#FFFFFF',
                  padding: '10px 22px',
                  borderRadius: '10px',
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                <span>OPEN FIGMA PROJECT</span>
                <ExternalLink size={16} />
              </a>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#94A3B8', padding: '40px' }}>
              <File size={48} style={{ margin: '0 auto 12px', color: '#64748B' }} />
              <div style={{ fontSize: '1rem', fontWeight: 600, color: '#E2E8F0', marginBottom: '6px' }}>
                Document Preview Not Available
              </div>
              <p style={{ fontSize: '0.8125rem', margin: '0 0 16px 0' }}>
                Download the file to inspect its full contents.
              </p>
              {fileUrl && (
                <a
                  href={fileUrl}
                  download={fileName}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#0284C7',
                    color: '#FFFFFF',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <Download size={14} />
                  <span>Download Document</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
