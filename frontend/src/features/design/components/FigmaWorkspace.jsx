import React from 'react';
import {
  PenTool,
  ExternalLink,
  Layers,
  Palette,
  LayoutTemplate,
  CheckCircle2,
  Upload,
  Sparkles,
  Link2,
  FileText
} from 'lucide-react';
import DesignAssetList from './DesignAssetList';

export default function FigmaWorkspace({
  ticket,
  onOpenUploadDeliverable,
  onPreviewFile,
}) {
  if (!ticket) return null;

  const figmaUrl = ticket.figmaUrl;

  const figmaChecklist = [
    `Synthesize visual design blueprint according to "${ticket.title}".`,
    `Build master auto-layout component library with interactive variants for ${ticket.clientCompany || 'the client'}.`,
    `Design mobile (390px), tablet (834px), and desktop (1440px) master frames reflecting client specifications.`,
    `Ensure color tokens, typography scales, and WCAG AA contrast compliance match client brand palette.`,
    `Structure named layers and export high-resolution assets for final live website deployment.`
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner / Guidance */}
      <div
        style={{
          backgroundColor: '#F5F3FF',
          border: '1px solid #DDD6FE',
          borderRadius: '12px',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#8B5CF6',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <PenTool size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
              Figma Design Project Studio
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#6D28D9', margin: 0 }}>
              Specialist studio for high-fidelity component libraries, interactive prototypes, and production UI assets.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {figmaUrl && (
            <a
              href={figmaUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '8px',
                backgroundColor: '#8B5CF6',
                color: '#FFFFFF',
                fontSize: '0.875rem',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 2px 6px rgba(139, 92, 246, 0.25)',
              }}
            >
              <span>OPEN FIGMA PROJECT</span>
              <ExternalLink size={16} />
            </a>
          )}

          {onOpenUploadDeliverable && (
            <button
              type="button"
              onClick={onOpenUploadDeliverable}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                color: '#7C3AED',
                border: '1px solid #DDD6FE',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Upload size={16} />
              <span>Submit Deliverables / Link</span>
            </button>
          )}
        </div>
      </div>

      {/* Figma Project External Link Card */}
      {figmaUrl ? (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#F5F3FF',
                color: '#8B5CF6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Link2 size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1E293B' }}>
                Active Figma Project URL
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', maxWidth: '500px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {figmaUrl}
              </div>
            </div>
          </div>

          <a
            href={figmaUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '6px',
              backgroundColor: '#F5F3FF',
              color: '#7C3AED',
              fontSize: '0.8125rem',
              fontWeight: 700,
              textDecoration: 'none',
              border: '1px solid #DDD6FE',
            }}
          >
            <span>Open in Figma</span>
            <ExternalLink size={14} />
          </a>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: '#FAFAFA',
            borderRadius: '12px',
            border: '1px dashed #CBD5E1',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <PenTool size={20} style={{ color: '#94A3B8' }} />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>
                No external Figma URL linked yet
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                Work in your external Figma project and provide the share link when submitting deliverables.
              </div>
            </div>
          </div>
          {onOpenUploadDeliverable && (
            <button
              type="button"
              onClick={onOpenUploadDeliverable}
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#7C3AED',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              + Add Figma URL
            </button>
          )}
        </div>
      )}

      {/* Two Column Working Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Left: Design System Handoff Checklist */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '20px',
          }}
        >
          <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0F172A', margin: '0 0 14px 0' }}>
            Component & Token Architecture Checklist
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {figmaChecklist.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px 12px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '8px',
                  fontSize: '0.8125rem',
                  color: '#334155',
                }}
              >
                <CheckCircle2 size={16} style={{ color: '#8B5CF6', flexShrink: 0, marginTop: '2px' }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Client Requirements & Source Assets */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>
              Client Requirements Brief
            </h4>
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                fontSize: '0.875rem',
                color: '#334155',
                lineHeight: '1.6',
              }}
            >
              {ticket.description || 'No additional instructions provided in request.'}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>
              Reference Files & Logos ({ticket.attachments?.length || 0})
            </h4>
            <DesignAssetList
              assets={ticket.attachments || []}
              onPreviewFile={onPreviewFile}
              emptyMessage="No logo files or brand assets provided"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
