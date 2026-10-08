import React from 'react';
import {
  FileText,
  Image as ImageIcon,
  Video,
  File,
  Eye,
  Download,
  ExternalLink,
  PenTool
} from 'lucide-react';
import { isImageFile, isPdfFile, isVideoFile } from '../utils/designStatusUtils';

export default function DesignAssetList({
  assets = [],
  onPreviewFile,
  emptyMessage = 'No files or reference material uploaded'
}) {
  if (!assets || assets.length === 0) {
    return (
      <div
        style={{
          padding: '24px',
          textAlign: 'center',
          color: '#94A3B8',
          fontSize: '0.875rem',
          backgroundColor: '#F8FAFC',
          borderRadius: '10px',
          border: '1px dashed #E2E8F0',
        }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '12px',
      }}
    >
      {assets.map((asset, index) => {
        const name = asset.name || asset.title || `Asset ${index + 1}`;
        const url = asset.url || asset.dataUrl || asset.downloadUrl || '';
        const isImage = isImageFile(name) || isImageFile(asset.type);
        const isPdf = isPdfFile(name) || isPdfFile(asset.type);
        const isVideo = isVideoFile(name) || isVideoFile(asset.type);
        const isFigma = Boolean(asset.isFigma || url.includes('figma.com'));

        return (
          <div
            key={asset.id || index}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#0284C7';
              e.currentTarget.style.backgroundColor = '#F0F9FF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E2E8F0';
              e.currentTarget.style.backgroundColor = '#FFFFFF';
            }}
          >
            {/* Left: Thumbnail or File Icon + details */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', flex: 1 }}>
              {isImage && url ? (
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    backgroundColor: '#F1F5F9',
                    flexShrink: 0,
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <img
                    src={url}
                    alt={name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '6px',
                    backgroundColor: isFigma ? '#F5F3FF' : isPdf ? '#FEF2F2' : '#F1F5F9',
                    color: isFigma ? '#8B5CF6' : isPdf ? '#EF4444' : '#0284C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {isFigma ? (
                    <PenTool size={18} />
                  ) : isPdf ? (
                    <FileText size={18} />
                  ) : isVideo ? (
                    <Video size={18} />
                  ) : isImage ? (
                    <ImageIcon size={18} />
                  ) : (
                    <File size={18} />
                  )}
                </div>
              )}

              <div style={{ overflow: 'hidden' }}>
                <div
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: '#0F172A',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={name}
                >
                  {name}
                </div>
                {asset.size && (
                  <div style={{ fontSize: '0.6875rem', color: '#64748B', marginTop: '2px' }}>
                    {typeof asset.size === 'number' ? `${(asset.size / 1024).toFixed(1)} KB` : asset.size}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              {onPreviewFile && (
                <button
                  type="button"
                  onClick={() => onPreviewFile(asset)}
                  title="Preview asset"
                  style={{
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#64748B',
                    padding: '5px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#0284C7';
                    e.currentTarget.style.backgroundColor = '#E0F2FE';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#64748B';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Eye size={15} />
                </button>
              )}

              {isFigma && url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open Figma project"
                  style={{
                    color: '#8B5CF6',
                    padding: '5px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    textDecoration: 'none',
                  }}
                >
                  <ExternalLink size={15} />
                </a>
              ) : url ? (
                <a
                  href={url}
                  download={name}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Download asset"
                  style={{
                    color: '#64748B',
                    padding: '5px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#0284C7';
                    e.currentTarget.style.backgroundColor = '#E0F2FE';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#64748B';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Download size={15} />
                </a>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
