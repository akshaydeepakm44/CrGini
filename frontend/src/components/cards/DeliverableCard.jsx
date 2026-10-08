import React from 'react';
import { FileText, Video, Figma, FileArchive, Image, ArrowRight, Download, ExternalLink } from 'lucide-react';
import StatusBadge from '../tickets/StatusBadge';
import Badge from '../common/Badge';

/**
 * Reusable DeliverableCard Component
 * Matches the "Recent Deliverables" cards in the reference mockup
 */
export default function DeliverableCard({
  title,
  ticketId,
  service,
  version = 1,
  status = 'COMPLETED',
  date,
  fileType = 'pdf', // 'pdf' | 'video' | 'figma' | 'image' | 'archive'
  onView,
  onDownload,
  className = '',
  style = {},
}) {
  const fileTypeIcons = {
    pdf: { icon: FileText, color: 'var(--cg-purple-600)', bg: 'var(--cg-purple-50)' },
    video: { icon: Video, color: 'var(--cg-coral-600)', bg: 'var(--cg-coral-50)' },
    figma: { icon: Figma, color: 'var(--cg-blue-600)', bg: 'var(--cg-blue-50)' },
    image: { icon: Image, color: 'var(--cg-mint-600)', bg: 'var(--cg-mint-50)' },
    archive: { icon: FileArchive, color: 'var(--cg-amber-600)', bg: 'var(--cg-amber-50)' },
  };

  const currentType = fileTypeIcons[fileType.toLowerCase()] || fileTypeIcons.pdf;
  const TypeIcon = currentType.icon;

  return (
    <div
      className={`cg-deliverable-card ${className}`}
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--cg-border-light)',
        borderRadius: 'var(--cg-radius-lg)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: 'var(--cg-shadow-card)',
        transition: 'all var(--cg-transition-fast)',
        minHeight: '180px',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--cg-shadow-hover)';
        e.currentTarget.style.borderColor = 'var(--cg-purple-200)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'var(--cg-shadow-card)';
        e.currentTarget.style.borderColor = 'var(--cg-border-light)';
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: currentType.bg,
              color: currentType.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TypeIcon size={20} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {version && (
              <Badge variant="purple" size="sm">
                V{version}
              </Badge>
            )}
            <StatusBadge status={status} size="sm" />
          </div>
        </div>

        <h4
          style={{
            fontFamily: 'var(--cg-font-heading)',
            fontSize: '0.9375rem',
            fontWeight: 700,
            color: 'var(--cg-text-primary)',
            margin: '0 0 4px 0',
            lineHeight: 1.35,
          }}
        >
          {title}
        </h4>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--cg-text-muted)' }}>
          {ticketId && <span style={{ fontWeight: 600, color: 'var(--cg-text-secondary)' }}>{ticketId}</span>}
          {service && <span>• {service}</span>}
          {date && <span>• {date}</span>}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: '1px solid var(--cg-border-light)',
        }}
      >
        <button
          type="button"
          onClick={onView}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: 'none',
            border: 'none',
            color: 'var(--cg-purple-600)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            fontFamily: 'var(--cg-font-family)',
            cursor: 'pointer',
            padding: 0,
            transition: 'color var(--cg-transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--cg-purple-800)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--cg-purple-600)')}
        >
          <span>View Details</span>
          <ArrowRight size={14} />
        </button>

        {onDownload && (
          <button
            type="button"
            onClick={onDownload}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: 'var(--cg-radius-sm)',
              border: '1px solid var(--cg-border-light)',
              background: '#FFFFFF',
              color: 'var(--cg-text-secondary)',
              cursor: 'pointer',
            }}
          >
            <Download size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
